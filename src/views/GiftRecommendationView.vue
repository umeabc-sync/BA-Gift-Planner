<template>
  <main>
    <WelcomeMessage v-if="selectedStudents.length === 0" />
    <template v-else>
      <GiftRecommendation v-for="gift in recommendedGifts" :key="`${gift.id}-${gift.isSsr}`" :gift="gift" />
      <GiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
      <GiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
    </template>
  </main>

  <SilentScreenshotRenderer
    ref="silentScreenshotRendererRef"
    :recommended-gifts="recommendedGifts"
    :student-preferences="studentPreferences"
    :generic-ssr-gifts="genericSsrGifts"
    :synthesis-gifts="synthesisGifts"
    :is-dark-mode="isDarkMode"
    :style="screenshotRenderStyle"
    :layout="screenshotLayout"
    :size="screenshotRenderSize"
  />

  <LoadingOverlay :is-visible="isDownloadingScreenshot" />
  <ToastNotification />
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useSettingStore } from '@store/setting'
  import { useStudentStore } from '@store/student'
  import { useScreenshotStore } from '@store/screenshot'
  import { useGiftStore } from '@store/gift'
  import { useGiftAnalysisStore } from '@store/giftAnalysis'
  import { storeToRefs } from 'pinia'
  import WelcomeMessage from '@components/section/WelcomeMessage.vue'
  import GiftRecommendation from '@components/section/GiftRecommendation.vue'
  import GiftGridSection from '@components/section/GiftGridSection.vue'
  import SilentScreenshotRenderer from '@components/utility/SilentScreenshotRenderer.vue'
  import LoadingOverlay from '@components/utility/LoadingOverlay.vue'
  import ToastNotification from '@components/ui/ToastNotification.vue'
  import { useI18n } from '@composables/useI18n'
  import { useShareableSelection } from '@/composables/useShareableSelection'

  const { t } = useI18n()
  const settingStore = useSettingStore()
  const { isDarkMode } = storeToRefs(settingStore)

  const studentStore = useStudentStore()
  const { selectedStudents, selectedStudentIds, studentsData } = storeToRefs(studentStore)

  const giftStore = useGiftStore()
  const { setSynthesisGifts } = giftStore

  const giftAnalysisStore = useGiftAnalysisStore()
  const { analyzedGifts } = storeToRefs(giftAnalysisStore)

  useShareableSelection(selectedStudentIds, studentsData)

  const screenshotStore = useScreenshotStore()
  const { screenshotRenderStyle, screenshotLayout, screenshotRenderSize } = storeToRefs(screenshotStore)

  const silentScreenshotRendererRef = ref(null)
  const isDownloadingScreenshot = ref(false)

  onMounted(async () => {
    screenshotStore.onDownload = handleDownloadShareScreenshot
  })

  async function handleDownloadShareScreenshot() {
    isDownloadingScreenshot.value = true
    try {
      if (silentScreenshotRendererRef.value) {
        await silentScreenshotRendererRef.value.takeScreenshot()
      }
    } finally {
      isDownloadingScreenshot.value = false
    }
  }

  const synthesisGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.shouldSynthesize)
  })

  watch(
    synthesisGifts,
    (newSynthesisGifts) => {
      setSynthesisGifts(newSynthesisGifts)
    },
    { immediate: true, deep: true }
  )

  const genericSsrGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.isGeneric)
  })

  const recommendedGifts = computed(() => {
    return analyzedGifts.value
      .filter((gift) => gift.analysis.isRecommended)
      .sort((a, b) => b.analysis.maxValue - a.analysis.maxValue)
  })

  const studentPreferences = computed(() => {
    if (selectedStudents.value.length === 0) {
      return []
    }

    const preferencesMap = new Map(
      selectedStudents.value.map((student) => [
        student.id,
        {
          id: student.id,
          favor: student.favor,
          gifts: [],
        },
      ])
    )

    recommendedGifts.value.forEach((gift) => {
      if (gift.analysis && gift.analysis.characters) {
        gift.analysis.characters.forEach((character) => {
          const studentPref = preferencesMap.get(character.id)
          if (studentPref) {
            studentPref.gifts.push({
              ...gift,
              isRecommended: character.isOptimal,
              preferenceValue: character.value,
            })
          }
        })
      }
    })

    const result = Array.from(preferencesMap.values())
    result.forEach((studentPref) => {
      studentPref.gifts.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) {
          return a.isRecommended ? -1 : 1
        }
        return b.preferenceValue - a.preferenceValue
      })
    })

    return result
  })
</script>
