import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useStudentStore } from './student'
import { useSettingStore } from './setting'
import { analyzeGift } from '@utils/analyzeGift'
import { useSrGiftData } from '@utils/fetchSrGiftData'
import { useSsrGiftData } from '@utils/fetchSsrGiftData'
import { useI18n } from '@/composables/useI18n'

export const useGiftAnalysisStore = defineStore('giftAnalysis', () => {
  const { currentLocale: locale } = useI18n()
  const studentStore = useStudentStore()
  const settingStore = useSettingStore()

  const { selectedStudents } = storeToRefs(studentStore)
  const { showOnlyOptimalSolution } = storeToRefs(settingStore)

  const { data: srGiftsData } = useSrGiftData(locale)
  const { data: ssrGiftsData } = useSsrGiftData(locale)

  const giftsData = computed(() => {
    if (!srGiftsData.value || !ssrGiftsData.value) {
      return []
    }
    return [
      ...srGiftsData.value.map((g) => ({ ...g, isSsr: false })),
      ...ssrGiftsData.value.map((g) => ({ ...g, isSsr: true })),
    ].filter((gift) => !gift.isSpecial)
  })

  const analyzedGifts = computed(() => {
    if (selectedStudents.value.length === 0 || !giftsData.value || giftsData.value.length === 0) {
      return []
    }

    return giftsData.value.map((gift) => {
      const analysis = analyzeGift(gift, showOnlyOptimalSolution.value, selectedStudents.value)
      return { ...gift, analysis }
    })
  })

  const getGiftAnalysis = (gift) => {
    if (!gift) return null
    const key = `${gift.isSsr ? 'ssr' : 'sr'}-${gift.id}`
    return analyzedGifts.value.find((g) => `${g.isSsr ? 'ssr' : 'sr'}-${g.id}` === key)?.analysis
  }

  return {
    analyzedGifts,
    getGiftAnalysis,
  }
})
