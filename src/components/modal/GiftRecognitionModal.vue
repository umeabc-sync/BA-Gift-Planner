<template>
  <BaseModal :is-visible="isVisible" @close="close" max-width="800px">
    <template #header>
      <div class="modal-title">{{ t('giftRecognitionModal.title') }}</div>
    </template>
    <template #body>
      <div class="recognition-body">
        <LoadingOverlay :is-loading="isLoading" />
        <div class="upload-section">
          <button @click="openFileDialog" class="upload-button">{{ t('giftRecognitionModal.upload') }}</button>
          <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none" />
        </div>
        <div v-if="imageUrl" class="image-preview">
          <img :src="imageUrl" alt="Image Preview" />
        </div>

        <div v-if="displayedRecognizedGifts.length > 0" class="recognized-gifts-list">
          <div v-for="gift in displayedRecognizedGifts" :key="gift.key" class="recognized-gift-wrapper">
            <div class="gift-grid-item" :class="[gift.isSsr ? 'gift-purple' : 'gift-yellow']">
              <ImageWithLoader
                :src="getGiftUrl(gift.id, gift.isSsr)"
                class="gift-icon"
                object-fit="contain"
                loader-type="pulse"
                :inherit-background="false"
              />
              <div class="gift-icon-bg"></div>
              <div class="gift-name">{{ gift.name }}</div>
            </div>
            <QuantityControl
              :value="gift.quantity"
              @update:value="(value) => (gift.quantity = value)"
              :use-continuous="true"
            />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="recognition-footer">
        <button @click="close" class="cancel-button">{{ t('common.cancel') }}</button>
        <button @click="confirm" class="confirm-button" :disabled="isLoading">{{ t('common.confirm') }}</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from '@/composables/useI18n.js';
import BaseModal from '@components/ui/BaseModal.vue';
import LoadingOverlay from '@components/utility/LoadingOverlay.vue';
import * as ort from 'onnxruntime-web';
import { createWorker } from 'tesseract.js';
import { useSrGiftData } from '@/utils/fetchSrGiftData.js';
import { useSsrGiftData } from '@/utils/fetchSsrGiftData.js';
import { getGiftUrl } from '@utils/getGiftUrl';
import ImageWithLoader from '@components/ui/ImageWithLoader.vue';
import QuantityControl from '@components/ui/QuantityControl.vue';
import { useGiftStore } from '@/store/gift';

const props = defineProps({
  isVisible: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'confirm']);

const { t, currentLocale: locale } = useI18n();
const giftStore = useGiftStore();

const isLoading = ref(false);
const imageUrl = ref(null);
const fileInput = ref(null);
const onnxSession = ref(null);
const recognizedGifts = ref([]); // Stores raw detections + OCR quantity
const tesseractWorker = ref(null);

const { data: srGifts } = useSrGiftData(locale);
const { data: ssrGifts } = useSsrGiftData(locale);

const allGiftsMap = computed(() => {
  const map = new Map();
  if (srGifts.value) {
    srGifts.value.forEach(g => map.set(`sr-${g.id}`, { ...g, isSsr: false, key: `sr-${g.id}` }));
  }
  if (ssrGifts.value) {
    ssrGifts.value.forEach(g => map.set(`ssr-${g.id}`, { ...g, isSsr: true, key: `ssr-${g.id}` }));
  }
  return map;
});

const displayedRecognizedGifts = computed(() => {
  return recognizedGifts.value
    .map(recGift => {
      // TODO: Refine this mapping based on the actual ONNX model's class output.
      // The YOLO model should ideally output a class ID that maps to a specific gift.
      // For now, assuming classId 0 represents a generic gift and isSsr is false as a placeholder.
      // This will need a proper lookup mechanism if the ONNX model distinguishes between gift types.
      const giftId = recGift.giftId; 
      const isSsr = false; 

      const giftKey = `${isSsr ? 'ssr' : 'sr'}-${giftId}`;
      const giftDetails = allGiftsMap.value.get(giftKey);

      if (giftDetails) {
        return {
          ...recGift,
          ...giftDetails,
          quantity: Math.max(0, recGift.quantity), // Ensure quantity is non-negative
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null entries
});

onMounted(async () => {
  try {
    isLoading.value = true;
    onnxSession.value = await ort.InferenceSession.create('./best.onnx');
    console.log('ONNX model loaded successfully.');

    tesseractWorker.value = await createWorker('eng', 1, {
      logger: m => console.log(m),
    });
    console.log('Tesseract worker loaded successfully.');

  } catch (e) {
    console.error('Failed to load models:', e);
  } finally {
    isLoading.value = false;
  }
});

const recognizeQuantity = async (imageBitmap) => {
  try {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    
    // Draw image and apply filters for better OCR
    ctx.filter = 'grayscale(1) contrast(1.5)';
    ctx.drawImage(imageBitmap, 0, 0);

    // Manual thresholding (binarization)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Since it's grayscale, R, G, and B are the same.
      const brightness = data[i];
      const threshold = 128;
      const value = brightness < threshold ? 0 : 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    ctx.putImageData(imageData, 0, 0);

    const { data: { text } } = await tesseractWorker.value.recognize(canvas);
    
    // Clean up OCR text (remove 'x' and non-numeric characters)
    const cleanedText = text.replace(/[^0-9]/g, '');
    return parseInt(cleanedText) || 0;
  } catch (error) {
    console.error('Error during OCR:', error);
    return 0;
  }
};

const runObjectDetection = async (imageFile) => {
  if (!onnxSession.value) {
    console.error('ONNX session not loaded.');
    return [];
  }
  if (!tesseractWorker.value) {
    console.error('Tesseract worker not loaded.');
    return [];
  }

  isLoading.value = true;
  recognizedGifts.value = [];
  try {
    const originalImageBitmap = await createImageBitmap(imageFile);
    const [input, imgWidth, imgHeight] = await prepareImageForInference(originalImageBitmap);
    const feeds = { images: input };
    const results = await onnxSession.value.run(feeds);
    const output = results['output0'].data;

    const detections = processOutput(output, imgWidth, imgHeight);

    for (const detection of detections) {
      const [x1, y1, x2, y2] = detection.box;
      const croppedBitmap = await createImageBitmap(originalImageBitmap, x1, y1, x2 - x1, y2 - y1);
      const quantity = await recognizeQuantity(croppedBitmap);

      // Assuming classId 0 maps to a generic gift type for now.
      // In a real scenario, you'd map classId to actual gift IDs.
      recognizedGifts.value.push({
        giftId: detection.classId, // Placeholder for actual gift ID
        isSsr: false, // Placeholder
        quantity: quantity,
        box: detection.box,
      });
    }

    return recognizedGifts.value;
  } catch (error) {
    console.error('Error during object detection:', error);
    return [];
  } finally {
    isLoading.value = false;
  }
};

const prepareImageForInference = async (imageBitmap) => {
  const [w, h] = [640, 640]; // YOLOv5 input size
  const imgWidth = imageBitmap.width;
  const imgHeight = imageBitmap.height;
  
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h).data;

  // Convert to RGB and normalize
  const [R, G, B] = [[], [], []];
  for (let i = 0; i < imageData.length; i += 4) {
    R.push(imageData[i] / 255.0);
    G.push(imageData[i+1] / 255.0);
    B.push(imageData[i+2] / 255.0);
  }

  const input = new Float32Array(1 * 3 * w * h);
  for (let i = 0; i < w * h; i++) {
    input[i] = R[i];
    input[i + w * h] = G[i];
    input[i + 2 * w * h] = B[i];
  }

  return [new ort.Tensor('float32', input, [1, 3, h, w]), imgWidth, imgHeight];
};

const processOutput = (output, imgWidth, imgHeight) => {
  const detections = [];
  const confidenceThreshold = 0.25; // Lower initial threshold, will filter later
  const iouThreshold = 0.45; // IoU threshold for NMS

  // Assuming 1 class for gifts, output would be [cx, cy, w, h, obj_conf, gift_conf]
  const numValuesPerBox = 6;
  const numBoxes = output.length / numValuesPerBox; 

  for (let i = 0; i < numBoxes; i++) {
    const offset = i * numValuesPerBox;
    const x = output[offset + 0];
    const y = output[offset + 1];
    const width = output[offset + 2];
    const height = output[offset + 3];
    const objectness = output[offset + 4];
    const classConfidence = output[offset + 5]; // Assuming single class for gift

    const confidence = objectness * classConfidence;

    if (confidence >= confidenceThreshold) {
      // Convert center x,y,w,h to top-left x,y,width,height
      const x1 = (x - width / 2) * (imgWidth / 640);
      const y1 = (y - height / 2) * (imgHeight / 640);
      const x2 = (x + width / 2) * (imgWidth / 640);
      const y2 = (y + height / 2) * (imgHeight / 640);

      detections.push({
        box: [x1, y1, x2, y2], // x1, y1, x2, y2
        confidence: confidence,
        classId: 0 // Assuming 0 is the class ID for 'gift'
      });
    }
  }

  // Apply Non-Maximum Suppression (NMS)
  return nms(detections, iouThreshold);
};

// Basic NMS implementation
const nms = (boxes, iouThreshold) => {
  if (boxes.length === 0) return [];

  boxes.sort((a, b) => b.confidence - a.confidence);

  const selectedBoxes = [];
  const suppressed = new Array(boxes.length).fill(false);

  for (let i = 0; i < boxes.length; i++) {
    if (suppressed[i]) continue;

    selectedBoxes.push(boxes[i]);

    for (let j = i + 1; j < boxes.length; j++) {
      if (suppressed[j]) continue;

      const iou = calculateIoU(boxes[i].box, boxes[j].box);
      if (iou > iouThreshold) {
        suppressed[j] = true;
      }
    }
  }
  return selectedBoxes;
};

const calculateIoU = (box1, box2) => {
  const [x1_1, y1_1, x2_1, y2_1] = box1;
  const [x1_2, y1_2, x2_2, y2_2] = box2;

  const x_overlap = Math.max(0, Math.min(x2_1, x2_2) - Math.max(x1_1, x1_2));
  const y_overlap = Math.max(0, Math.min(y2_1, y2_2) - Math.max(y1_1, y1_2));

  const intersection = x_overlap * y_overlap;

  const area1 = (x2_1 - x1_1) * (y2_1 - y1_1);
  const area2 = (x2_2 - x1_2) * (y2_2 - y1_2);

  const union = area1 + area2 - intersection;

  return union === 0 ? 0 : intersection / union;
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
    const detections = await runObjectDetection(file);
    console.log('Detections:', detections);
    // Further processing with detections
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

const close = () => {
  emit('close');
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
    imageUrl.value = null;
  }
  if (tesseractWorker.value) {
    tesseractWorker.value.terminate();
    tesseractWorker.value = null;
  }
};

const confirm = () => {
  displayedRecognizedGifts.value.forEach(gift => {
    if (gift.quantity !== 0) {
      giftStore.setGiftQuantity(gift.id, gift.isSsr, gift.quantity);
    }
  });
  emit('confirm');
  close();
};
</script>

<style scoped>
.recognition-body {
  position: relative;
  padding: 20px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section {
  display: flex;
  justify-content: center;
}

.upload-button {
  background-color: #4c9af4;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
}

.dark-mode .upload-button {
  background-color: #58a6e5;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 10px;
  max-height: 400px;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.recognized-gifts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.recognized-gift-wrapper {
  background: #efefef;
  border-radius: 12px;
  padding: 15px;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.dark-mode .recognized-gift-wrapper {
  background: #1f3048;
  border-color: #2a4a6e;
}

.gift-grid-item {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  flex-shrink: 0;
}

.gift-grid-item > *,
.gift-grid-item::before,
.gift-grid-item::after {
  grid-column: 1 / 1;
  grid-row: 1 / 1;
}

.gift-grid-item::before {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: inherit;
  z-index: 1;
}

.gift-yellow::before {
  background-color: #c7a579;
  background-image: linear-gradient(to bottom right, #a97d51 0%, transparent 50%),
    linear-gradient(to top left, #a97d51 0%, transparent 50%);
}

.gift-purple::before {
  background-color: #9e82d6;
  background-image: linear-gradient(to bottom right, #7a5bbe 0%, transparent 50%),
    linear-gradient(to top left, #7a5bbe 0%, transparent 50%);
}

.gift-icon-bg {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  z-index: 2;
}

.gift-yellow .gift-icon-bg {
  background-color: #c7a579;
}

.gift-purple .gift-icon-bg {
  background-color: #9e82d6;
}

.dark-mode .gift-grid-item::after {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.gift-icon {
  width: 90%;
  height: 90%;
  z-index: 4;
}

.gift-name {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  z-index: 11;
  pointer-events: none;
}

.gift-grid-item:hover .gift-name {
  opacity: 1;
  visibility: visible;
}

.dark-mode .gift-grid-item .gift-name {
  background: rgba(223, 227, 231, 0.95);
  color: #201e2e;
}

.recognition-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  gap: 15px;
}

.cancel-button,
.confirm-button {
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.dark-mode .cancel-button {
  background-color: #444;
  color: #fff;
}

.confirm-button {
  background-color: #4c9af4;
  color: #fff;
}

.dark-mode .confirm-button {
  background-color: #58a6e5;
}

.confirm-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
