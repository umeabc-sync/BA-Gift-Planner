<template>
  <BaseModal :is-visible="isVisible" @close="close" max-width="1000px">
    <template #header>
      <div class="modal-title">{{ t('giftRecognitionModal.title') }}</div>
    </template>
    <template #body>
      <div class="recognition-body">
        <LoadingOverlay :is-loading="isLoading" />

        <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none" />

        <div class="image-preview-container" v-show="imageUrl">
          <div class="image-wrapper">
            <img :src="imageUrl" alt="Image Preview" ref="previewImage" @load="onImageLoad" />
            <canvas ref="previewCanvas" class="preview-canvas"></canvas>
          </div>
        </div>

        <div v-if="!imageUrl" class="empty-state">
          <p>{{ t('giftRecognitionModal.uploadHint') || 'Please upload an image to start recognition' }}</p>
        </div>

        <div v-if="displayedRecognizedGifts.length > 0" class="recognized-gifts-list">
          <div v-for="gift in displayedRecognizedGifts" :key="gift.key" class="recognized-gift-wrapper">
            <div class="main-content">
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

            <div v-if="isDebugMode" class="debug-section">
              <div class="debug-image">
                <p>Cropped</p>
                <img v-if="gift.croppedImage" :src="gift.croppedImage" alt="Cropped" />
              </div>
              <div class="debug-image">
                <p>OCR Input</p>
                <img v-if="gift.processedImage" :src="gift.processedImage" alt="Processed for OCR" />
              </div>
              <div class="debug-text">
                <p>
                  Raw OCR: <code>{{ gift.rawText }}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="recognition-footer">
        <button @click="close" class="modal-btn btn-cancel">
          <span>{{ t('common.cancel') }}</span>
        </button>

        <button @click="openFileDialog" class="modal-btn btn-upload">
          <span>{{ t('giftRecognitionModal.upload') }}</span>
        </button>

        <button @click="confirm" class="modal-btn btn-confirm" :disabled="isLoading">
          <span>{{ t('common.confirm') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { ref, onMounted, computed, onUnmounted } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import BaseModal from '@components/ui/BaseModal.vue'
  import LoadingOverlay from '@components/utility/LoadingOverlay.vue'
  import * as ort from 'onnxruntime-web'
  import { createWorker } from 'tesseract.js'
  import { useSrGiftData } from '@/utils/fetchSrGiftData.js'
  import { useSsrGiftData } from '@/utils/fetchSsrGiftData.js'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import QuantityControl from '@components/ui/QuantityControl.vue'
  import { useGiftStore } from '@/store/gift'
  import { preprocess, postprocess } from '@/utils/yolo-v5-utils.js'

  const isDebugMode = ref(false) // Change to true to enable debugging mode

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
  })

  const emit = defineEmits(['close', 'confirm'])

  const { t, currentLocale: locale } = useI18n()
  const giftStore = useGiftStore()

  const isLoading = ref(false)
  const imageUrl = ref(null)
  const fileInput = ref(null)
  const onnxSession = ref(null)
  const recognizedGifts = ref([])
  const tesseractWorker = ref(null)

  const previewImage = ref(null)
  const previewCanvas = ref(null)

  const { data: srGifts } = useSrGiftData(locale)
  const { data: ssrGifts } = useSsrGiftData(locale)

  const YML_CLASS_NAMES = [
    'favor_0',
    'favor_1',
    'favor_10',
    'favor_11',
    'favor_12',
    'favor_13',
    'favor_14',
    'favor_15',
    'favor_16',
    'favor_17',
    'favor_18',
    'favor_19',
    'favor_2',
    'favor_20',
    'favor_21',
    'favor_22',
    'favor_23',
    'favor_24',
    'favor_25',
    'favor_26',
    'favor_27',
    'favor_28',
    'favor_29',
    'favor_3',
    'favor_30',
    'favor_31',
    'favor_32',
    'favor_33',
    'favor_34',
    'favor_35',
    'favor_4',
    'favor_5',
    'favor_6',
    'favor_7',
    'favor_8',
    'favor_9',
    'favor_ssr_0',
    'favor_ssr_1',
    'favor_ssr_10',
    'favor_ssr_11',
    'favor_ssr_12',
    'favor_ssr_13',
    'favor_ssr_14',
    'favor_ssr_15',
    'favor_ssr_16',
    'favor_ssr_2',
    'favor_ssr_3',
    'favor_ssr_4',
    'favor_ssr_5',
    'favor_ssr_6',
    'favor_ssr_7',
    'favor_ssr_8',
    'favor_ssr_9',
  ]

  const classNames = computed(() => YML_CLASS_NAMES)

  const allGiftsMap = computed(() => {
    const map = new Map()
    if (srGifts.value) {
      srGifts.value.forEach((g) => map.set(`sr-${g.id}`, { ...g, isSsr: false, key: `sr-${g.id}` }))
    }
    if (ssrGifts.value) {
      ssrGifts.value.forEach((g) => map.set(`ssr-${g.id}`, { ...g, isSsr: true, key: `ssr-${g.id}` }))
    }
    return map
  })

  const displayedRecognizedGifts = computed(() => {
    return recognizedGifts.value
      .map((recGift) => {
        const giftKey = `${recGift.isSsr ? 'ssr' : 'sr'}-${recGift.giftId}`
        const giftDetails = allGiftsMap.value.get(giftKey)
        if (giftDetails) {
          return { ...recGift, ...giftDetails, quantity: Math.max(0, recGift.quantity) }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => b.confidence - a.confidence)
  })

  // Ensure canvas resolution matches the original image resolution to solve alignment issues
  const onImageLoad = () => {
    if (previewImage.value && previewCanvas.value) {
      const img = previewImage.value
      const canvas = previewCanvas.value
      // Set the canvas internal pixels to the original size of the image (Natural Size)
      // CSS will be responsible for scaling them to fit the screen size
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
    }
  }

  onMounted(async () => {
    try {
      isLoading.value = true
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/'
      onnxSession.value = await ort.InferenceSession.create('./best.onnx', {
        executionProviders: ['wasm'],
      })
      console.log('ONNX model loaded successfully.')

      tesseractWorker.value = await createWorker('eng', 1, {
        logger: (m) => console.log(m.status),
      })
      console.log('Tesseract worker loaded successfully.')
    } catch (e) {
      console.error('Failed to load models:', e)
    } finally {
      isLoading.value = false
    }
  })

  const recognizeQuantity = async (imageBitmap) => {
    try {
      const originalCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
      originalCanvas.getContext('2d').drawImage(imageBitmap, 0, 0)
      const croppedImage = await originalCanvas.convertToBlob().then((blob) => URL.createObjectURL(blob))

      const w = imageBitmap.width
      const h = imageBitmap.height
      if (w === 0 || h === 0) return { quantity: 0, rawText: '', croppedImage, processedImage: null }

      const quantityBitmap = await createImageBitmap(imageBitmap, w / 3, (h * 3) / 4, (w * 1.85) / 3, h / 4)

      const canvas = new OffscreenCanvas(quantityBitmap.width, quantityBitmap.height)
      const ctx = canvas.getContext('2d')

      ctx.filter = 'grayscale(1) contrast(1.5)'
      ctx.drawImage(quantityBitmap, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const brightness = data[i]
        const threshold = 128
        const value = brightness < threshold ? 0 : 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
      }
      ctx.putImageData(imageData, 0, 0)

      const processedImage = await canvas.convertToBlob().then((blob) => URL.createObjectURL(blob))
      const {
        data: { text },
      } = await tesseractWorker.value.recognize(canvas)

      const cleanedText = text.replace(/[^0-9]/g, '')
      return {
        quantity: parseInt(cleanedText) || 0,
        rawText: text,
        croppedImage,
        processedImage,
      }
    } catch (error) {
      console.error('Error during OCR:', error)
      return { quantity: 0, rawText: `Error: ${error.message}`, croppedImage: null, processedImage: null }
    }
  }

  const runObjectDetection = async (imageFile) => {
    if (!onnxSession.value || !tesseractWorker.value || classNames.value.length === 0) {
      console.error('Models or class names not loaded yet.')
      return
    }

    isLoading.value = true
    recognizedGifts.value = []
    try {
      const originalImageBitmap = await createImageBitmap(imageFile)

      const [tensor, scale, xOffset, yOffset] = await preprocess(originalImageBitmap, 640, 640)

      const feeds = {}
      feeds[onnxSession.value.inputNames[0]] = tensor
      const results = await onnxSession.value.run(feeds)

      const outputTensor = results[onnxSession.value.outputNames[0]]

      const detections = postprocess(outputTensor, classNames.value.length, scale, xOffset, yOffset)

      const canvas = previewCanvas.value
      // Ensure the canvas size has been set to naturalWidth/Height in onImageLoad
      // But for safety, we'll correct it again here
      canvas.width = originalImageBitmap.width
      canvas.height = originalImageBitmap.height

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 4
      ctx.strokeStyle = '#ef4444'

      // Since the Canvas size equals the original image size, we can directly use the original coordinates from the detections.

      for (const detection of detections) {
        const [x1, y1, x2, y2] = detection.box

        // Draw directly, no scaling required
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

        if (x2 - x1 <= 0 || y2 - y1 <= 0) continue

        const croppedBitmap = await createImageBitmap(originalImageBitmap, x1, y1, x2 - x1, y2 - y1)
        const ocrResult = await recognizeQuantity(croppedBitmap)

        const className = classNames.value[detection.classId]
        if (!className) continue

        const parts = className.split('_')
        let isSsr = false
        let giftId = null

        if (parts[1] === 'ssr') {
          isSsr = true
          giftId = parseInt(parts[2])
        } else {
          isSsr = false
          giftId = parseInt(parts[1])
        }

        if (giftId === null || isNaN(giftId)) continue

        recognizedGifts.value.push({
          giftId,
          isSsr,
          quantity: ocrResult.quantity,
          rawText: ocrResult.rawText,
          croppedImage: ocrResult.croppedImage,
          processedImage: ocrResult.processedImage,
          box: detection.box,
          confidence: detection.confidence,
        })
      }
    } catch (error) {
      console.error('Error during object detection:', error)
    } finally {
      isLoading.value = false
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      if (imageUrl.value) {
        URL.revokeObjectURL(imageUrl.value)
      }
      cleanupImages()

      imageUrl.value = URL.createObjectURL(file)
      // Wait for Vue DOM update to ensure img src is set
      setTimeout(async () => {
        await runObjectDetection(file)
      }, 100)
    }
  }

  const openFileDialog = () => {
    fileInput.value.click()
  }

  const cleanupImages = () => {
    displayedRecognizedGifts.value.forEach((gift) => {
      if (gift.croppedImage) URL.revokeObjectURL(gift.croppedImage)
      if (gift.processedImage) URL.revokeObjectURL(gift.processedImage)
    })
  }

  const close = () => {
    emit('close')
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = null
    }
    cleanupImages()
    // The worker doesn't have to be terminated. Depending on the use case, it can be kept if the modal is opened frequently.
    // if (tesseractWorker.value) {
    //   tesseractWorker.value.terminate()
    //   tesseractWorker.value = null
    // }
  }

  const confirm = () => {
    displayedRecognizedGifts.value.forEach((gift) => {
      if (gift.quantity !== 0) {
        giftStore.setGiftQuantity(gift.id, gift.isSsr, gift.quantity)
      }
    })
    emit('confirm')
    close()
  }
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

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    color: #888;
  }

  .dark-mode .empty-state {
    border-color: #444;
    color: #aaa;
  }

  /* Preview area container */
  .image-preview-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* Image wrapper: ensures Canvas absolute positioning is relative to this image */
  .image-wrapper {
    position: relative;
    max-width: 100%;
    /* Limit max height to prevent long images from breaking the layout */
    max-height: 50vh;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 5px; /* Inner spacing, so the dashed border doesn't stick to the image */
    display: inline-block; /* Make the container size wrap its content */
  }

  .dark-mode .image-wrapper {
    border-color: #555;
  }

  .image-wrapper img {
    display: block;
    max-width: 100%;
    max-height: 48vh; /* Slightly smaller than the container, accounting for padding */
    height: auto;
    object-fit: contain;
  }

  .preview-canvas {
    position: absolute;
    top: 5px; /* Corresponds to .image-wrapper's padding */
    left: 5px; /* Corresponds to .image-wrapper's padding */
    width: calc(100% - 10px); /* Subtract padding */
    height: calc(100% - 10px); /* Subtract padding */
    pointer-events: none;
    z-index: 10;
  }

  .recognized-gifts-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px 0;
    max-height: 40vh;
    overflow-y: auto;
  }

  .recognized-gift-wrapper {
    background: #efefef;
    border-radius: 12px;
    padding: 15px;
    border: 2px solid #dee2e6;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .dark-mode .recognized-gift-wrapper {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .main-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    width: 100%;
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

  .debug-section {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
    margin-top: 1rem;
    align-items: center;
    overflow-x: auto;
  }

  .dark-mode .debug-section {
    border-top-color: #2a4a6e;
  }

  .debug-image {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.8rem;
    min-width: 100px;
  }

  .debug-image img {
    max-width: 100px;
    border: 1px solid #ccc;
    background: #fff;
  }

  .debug-text {
    font-size: 0.9rem;
    word-break: break-all;
  }

  .debug-text code {
    background: #f0f0f0;
    padding: 2px 4px;
    border-radius: 4px;
    color: #c7254e;
  }

  .dark-mode .debug-text code {
    background: #111e2e;
    color: #ff7b72;
  }

  /* --- Footer & Buttons --- */
  .recognition-footer {
    display: flex;
    justify-content: center;
    padding: 15px 20px;
    gap: 20px;
  }

  /* Base Button Style */
  .modal-btn {
    border: none;
    cursor: pointer;
    border-radius: 12px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    font-family: inherit;
    font-weight: bold;
    font-size: 1rem;
    padding: 0 25px;
  }

  .modal-btn:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .modal-btn:active {
    transform: scale(0.95) skew(-8deg);
  }

  .modal-btn > span {
    transform: skew(8deg);
    display: inline-block;
  }

  .modal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }

  /* Cancel Button (Grey) */
  .btn-cancel {
    background-color: #e0e0e0;
    background-image: linear-gradient(to bottom right, #f0f0f0 0%, transparent 50%),
      linear-gradient(to top left, #f0f0f0 0%, transparent 50%);
    color: #333;
  }

  .dark-mode .btn-cancel {
    background-color: #4b5563;
    background-image: linear-gradient(to bottom right, #6b7280 0%, transparent 50%),
      linear-gradient(to top left, #6b7280 0%, transparent 50%);
    color: #e0f4ff;
  }

  /* Upload Button (Yellow - from Inventory) */
  .btn-upload {
    background-color: #f4e94c;
    background-image: linear-gradient(to bottom right, #f9da3b 0%, transparent 50%),
      linear-gradient(to top left, #f9da3b 0%, transparent 50%);
    color: #314665;
  }

  .dark-mode .btn-upload {
    background-color: #e57758;
    background-image: linear-gradient(to bottom right, #e4522f 0%, transparent 50%),
      linear-gradient(to top left, #e4522f 0%, transparent 50%);
    color: #e0f4ff;
  }

  /* Confirm Button (Blue - user provided) */
  .btn-confirm {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
    color: #314665;
  }

  .dark-mode .btn-confirm {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }
</style>
