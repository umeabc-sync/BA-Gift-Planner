<template>
  <div ref="shareContentForScreenshot" class="share-content-for-screenshot" :class="{ 'dark-mode': isDarkMode }">
    <!-- Classic Layout -->
    <template v-if="layout === 'classic'">
      <div v-if="props.style === 'gift-recommendation'" class="compact-gift-recommendation-grid">
        <CompactGiftRecommendation v-for="gift in recommendedGifts" :key="`${gift.id}-${gift.isSsr}`" :gift="gift" />
      </div>
      <div v-else class="compact-student-preference-grid">
        <CompactStudentPreference v-for="student in studentPreferences" :key="student.id" :student="student" />
      </div>
      <CompactGiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
      <CompactGiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
    </template>

    <!-- BA Style Layout -->
    <template v-else-if="layout === 'ba-style'">
      <div v-if="props.style === 'gift-recommendation'" class="ba-style-compact-gift-recommendation-grid">
        <BAStyleCompactGiftRecommendation v-for="gift in recommendedGifts" :key="`${gift.id}-${gift.isSsr}`" :gift="gift" />
      </div>
      <div v-else class="ba-style-compact-student-preference-grid">
        <BAStyleCompactStudentPreference v-for="student in studentPreferences" :key="student.id" :student="student" />
      </div>
      <BAStyleCompactGiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
      <BAStyleCompactGiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
    </template>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { convertElementToPng } from '@utils/snapDom.js'
  import { isMobile } from '@utils/deviceDetector'
  import { useI18n } from '@composables/useI18n'
  import { useToast } from '@composables/useToast'

  // Classic Components
  import CompactGiftRecommendation from '@components/section/CompactGiftRecommendation.vue'
  import CompactStudentPreference from '@components/section/CompactStudentPreference.vue'
  import CompactGiftGridSection from '@components/section/CompactGiftGridSection.vue'

  // BA Style Components
  import BAStyleCompactGiftRecommendation from '@components/section/BAStyleCompactGiftRecommendation.vue'
  import BAStyleCompactStudentPreference from '@components/section/BAStyleCompactStudentPreference.vue'
  import BAStyleCompactGiftGridSection from '@components/section/BAStyleCompactGiftGridSection.vue'

  const props = defineProps({
    recommendedGifts: Array,
    studentPreferences: Array,
    genericSsrGifts: Array,
    synthesisGifts: Array,
    isDarkMode: Boolean,
    style: String,
    layout: String,
    size: String,
  })

  const { t } = useI18n()
  const { addToast } = useToast()
  const shareContentForScreenshot = ref(null)

  const takeScreenshot = async () => {
    if (!shareContentForScreenshot.value) {
      console.error('Share content element for screenshot not found.')
      return
    }
    try {
      await convertElementToPng(shareContentForScreenshot.value, {
        fileName: 'gift-recommendations',
        backgroundColor: props.isDarkMode
          ? '#1e2a38'
          : props.layout === 'ba-style'
            ? '#f7f7f4'
            : '#f0f4f8',
        dpr: isMobile() ? 1 : window.devicePixelRatio,
        scale: +props.size.replace('x', ''),
      })
    } catch (error) {
      if (error instanceof DOMException && error.message.includes('Canvas exceeds max size')) {
        addToast(t('toast.canvas_exceeds_max_size'), 'error')
      } else {
        console.error('Failed to download screenshot:', error)
      }
    }
  }

  defineExpose({
    takeScreenshot,
  })
</script>

<style scoped>
  .share-content-for-screenshot {
    position: absolute;
    left: -9999px;
    top: -9999px;
    z-index: -1;
    width: 90%;
    width: 1000px;
    padding: 20px;
    height: auto;
    overflow: hidden;
  }

  .share-content-for-screenshot .compact-gift-recommendation-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .share-content-for-screenshot .compact-student-preference-grid {
    display: block;
    margin-bottom: 20px;
  }

  .share-content-for-screenshot .ba-style-compact-gift-recommendation-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }

  .share-content-for-screenshot .ba-style-compact-student-preference-grid {
    display: block;
    margin-bottom: 20px;
  }
</style>
