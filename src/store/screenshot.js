import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useScreenshotStore = defineStore('screenshot', () => {
  const screenshotRenderStyle = ref('gift-recommendation')
  const screenshotLayout = ref('ba-style')
  const screenshotRenderSize = ref('1')
  const onDownload = ref(null)

  return {
    screenshotRenderStyle,
    screenshotLayout,
    screenshotRenderSize,
    onDownload,
  }
})
