// src/utils/yolo-v5-utils.js
import * as ort from 'onnxruntime-web'

/**
 * Pre-processes an image for YOLOv5 inference, including letterboxing.
 * @param {ImageBitmap} imageBitmap - The source image.
 * @param {number} modelWidth - The width of the model's input.
 * @param {number} modelHeight - The height of the model's input.
 * @returns {[ort.Tensor, number, number]} A tuple containing the input tensor, and the x and y scaling ratios.
 */
export async function preprocess(imageBitmap, modelWidth, modelHeight) {
  const canvas = new OffscreenCanvas(modelWidth, modelHeight)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#727272'
  ctx.fillRect(0, 0, modelWidth, modelHeight)

  const scale = Math.min(modelWidth / imageBitmap.width, modelHeight / imageBitmap.height)
  const scaleWidth = imageBitmap.width * scale
  const scaleHeight = imageBitmap.height * scale
  const xOffset = (modelWidth - scaleWidth) / 2
  const yOffset = (modelHeight - scaleHeight) / 2

  ctx.drawImage(imageBitmap, xOffset, yOffset, scaleWidth, scaleHeight)

  const imageData = ctx.getImageData(0, 0, modelWidth, modelHeight)
  const data = imageData.data

  const uint16Data = new Uint16Array(1 * 3 * modelWidth * modelHeight)
  for (let i = 0; i < modelWidth * modelHeight; i++) {
    const r = data[i * 4 + 0] / 255.0
    const g = data[i * 4 + 1] / 255.0
    const b = data[i * 4 + 2] / 255.0

    uint16Data[i] = float32ToFloat16(r)
    uint16Data[i + modelWidth * modelHeight] = float32ToFloat16(g)
    uint16Data[i + 2 * modelWidth * modelHeight] = float32ToFloat16(b)
  }

  const tensor = new ort.Tensor('float16', uint16Data, [1, 3, modelHeight, modelWidth])

  return [tensor, scale, xOffset, yOffset]
}

/**
 * Processes the raw output from a YOLOv5 ONNX model.
 * @param {ort.Tensor} output - The output tensor from the ONNX session.
 * @param {number} numClasses - The number of classes the model was trained on.
 * @param {number} scale - The single scaling factor from preprocessing.
 * @param {number} xOffset - The x-axis offset from preprocessing.
 * @param {number} yOffset - The y-axis offset from preprocessing.
 * @returns {object[]} A list of final detection objects after NMS.
 */
export function postprocess(output, numClasses, scale, xOffset, yOffset) {
  const data = output.data
  const dims = output.dims
  const confidenceThreshold = 0.25
  const iouThreshold = 0.45

  const detections = []
  const numBoxes = dims[1]
  const numValuesPerBox = dims[2]

  if (numValuesPerBox !== 5 + numClasses) {
    console.error('postprocess: Output tensor shape is not recognized.', dims)
    return []
  }

  for (let i = 0; i < numBoxes; i++) {
    const offset = i * numValuesPerBox
    const objectness = data[offset + 4]
    if (objectness < confidenceThreshold) continue

    let maxClassConfidence = 0
    let classId = -1
    for (let j = 0; j < numClasses; j++) {
      const classConfidence = data[offset + 5 + j]
      if (classConfidence > maxClassConfidence) {
        maxClassConfidence = classConfidence
        classId = j
      }
    }

    const confidence = objectness * maxClassConfidence
    if (confidence < confidenceThreshold) continue

    const centerX = data[offset + 0]
    const centerY = data[offset + 1]
    const width = data[offset + 2]
    const height = data[offset + 3]

    const x1 = (centerX - width / 2 - xOffset) / scale
    const y1 = (centerY - height / 2 - yOffset) / scale
    const x2 = (centerX + width / 2 - xOffset) / scale
    const y2 = (centerY + height / 2 - yOffset) / scale

    detections.push({ box: [x1, y1, x2, y2], confidence, classId })
  }

  return nms(detections, iouThreshold)
}

// Helper to convert float32 to float16
function float32ToFloat16(float32Value) {
  const float32Buffer = new ArrayBuffer(4)
  const float32View = new DataView(float32Buffer)
  float32View.setFloat32(0, float32Value, true)
  const f32 = float32View.getUint32(0, true)

  let sign = f32 >> 31
  let exp = (f32 >> 23) & 0xff
  let mant = f32 & 0x7fffff
  let f16 = 0

  if (exp === 0 && mant === 0) {
    f16 = sign << 15
  } else if (exp === 0xff) {
    f16 = (sign << 15) | 0x7c00 | (mant ? 0x0200 : 0)
  } else {
    exp = exp - 127 + 15
    if (exp >= 0x1f) {
      f16 = (sign << 15) | 0x7c00
    } else if (exp <= 0) {
      if (exp < -10) {
        f16 = sign << 15
      } else {
        mant = mant | 0x800000
        let shift = 1 - exp
        mant = mant >> shift
        f16 = (sign << 15) | mant
      }
    } else {
      f16 = (sign << 15) | (exp << 10) | (mant >> 13)
    }
  }
  return f16
}

function nms(boxes, iouThreshold) {
  if (boxes.length === 0) return []

  // 1. Group by class and find the best candidate for each class based on confidence
  const bestCandidatePerClass = boxes.reduce((groups, box) => {
    if (!groups[box.classId] || box.confidence > groups[box.classId].confidence) {
      groups[box.classId] = box
    }
    return groups
  }, {})

  const bestCandidates = Object.values(bestCandidatePerClass)

  // 2. Run a final class-agnostic NMS on these best candidates to resolve spatial conflicts
  bestCandidates.sort((a, b) => b.confidence - a.confidence)

  const finalBoxes = []
  const suppressed = new Array(bestCandidates.length).fill(false)

  for (let i = 0; i < bestCandidates.length; i++) {
    if (suppressed[i]) continue
    finalBoxes.push(bestCandidates[i])
    for (let j = i + 1; j < bestCandidates.length; j++) {
      if (suppressed[j]) continue
      const iou = calculateIoU(bestCandidates[i].box, bestCandidates[j].box)
      if (iou > iouThreshold) {
        suppressed[j] = true
      }
    }
  }

  return finalBoxes
}

function calculateIoU(box1, box2) {
  const [x1_1, y1_1, x2_1, y2_1] = box1
  const [x1_2, y1_2, x2_2, y2_2] = box2

  const x_overlap = Math.max(0, Math.min(x2_1, x2_2) - Math.max(x1_1, x1_2))
  const y_overlap = Math.max(0, Math.min(y2_1, y2_2) - Math.max(y1_1, y1_2))
  const intersection = x_overlap * y_overlap

  const area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
  const area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
  const union = area1 + area2 - intersection

  return union === 0 ? 0 : intersection / union
}
