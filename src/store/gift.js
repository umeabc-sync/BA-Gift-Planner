import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGiftPlannerStore } from './giftPlanner'
import { useGiftAnalysisStore } from './giftAnalysis'

export const useGiftStore = defineStore(
  'gift',
  () => {
    const giftPlannerStore = useGiftPlannerStore()
    // State
    const quantities = ref({})

    const synthesisGifts = computed(() => {
      const giftAnalysisStore = useGiftAnalysisStore()
      return giftAnalysisStore.analyzedGifts.filter((gift) => gift.analysis.shouldSynthesize)
    })

    const getKey = (giftId, isSsr) => `${isSsr ? 'ssr' : 'sr'}-${giftId}`

    // Actions
    function setGiftQuantity(giftId, isSsr, quantity) {
      const key = getKey(giftId, isSsr)
      const minQuantity = giftPlannerStore.totalAssigned[key] || 0
      const newQuantity = Math.max(minQuantity, quantity)

      if (newQuantity === 0) {
        delete quantities.value[key]
      } else {
        quantities.value[key] = newQuantity
      }
    }

    function incrementGift(giftId, isSsr) {
      const key = getKey(giftId, isSsr)
      if (!quantities.value[key]) {
        quantities.value[key] = 0
      }
      quantities.value[key]++
    }

    function decrementGift(giftId, isSsr) {
      const key = getKey(giftId, isSsr)
      const minQuantity = giftPlannerStore.totalAssigned[key] || 0

      if (quantities.value[key] > minQuantity) {
        quantities.value[key]--
        if (quantities.value[key] === 0) {
          delete quantities.value[key]
        }
      }
    }

    function consumeGift(giftId, isSsr, quantityToConsume) {
      const key = getKey(giftId, isSsr)
      const currentQuantity = quantities.value[key] || 0
      const newQuantity = Math.max(0, currentQuantity - quantityToConsume)

      if (newQuantity === 0) {
        delete quantities.value[key]
      } else {
        quantities.value[key] = newQuantity
      }
    }

    function getGiftQuantity(giftId, isSsr) {
      const key = getKey(giftId, isSsr)
      return quantities.value[key] || 0
    }

    function convertSynthesisGifts(customConversionMap) {
      if (!customConversionMap) return

      let totalQuantity = 0
      const keysToConsume = []
      let firstOwned = null

      for (const [key, quantity] of Object.entries(customConversionMap)) {
        if (quantity > 0) {
          const [type, idStr] = key.split('-')
          const id = parseInt(idStr, 10)
          const isSsr = type === 'ssr'
          if (!firstOwned) {
            firstOwned = { id, isSsr }
          }
          totalQuantity += quantity
          keysToConsume.push({ key, quantity })
        }
      }

      if (totalQuantity < 2) return

      const choiceBoxesToCreate = Math.floor(totalQuantity / 2)
      const remainder = totalQuantity % 2

      keysToConsume.forEach(({ key, quantity }) => {
        const current = quantities.value[key] || 0
        const newQ = Math.max(0, current - quantity)
        if (newQ === 0) {
          delete quantities.value[key]
        } else {
          quantities.value[key] = newQ
        }
      })

      if (choiceBoxesToCreate > 0) {
        const choiceBoxKey = getKey(35, false)
        quantities.value[choiceBoxKey] = (quantities.value[choiceBoxKey] || 0) + choiceBoxesToCreate
      }

      if (remainder === 1 && firstOwned) {
        const key = getKey(firstOwned.id, firstOwned.isSsr)
        quantities.value[key] = (quantities.value[key] || 0) + 1
      }
    }

    return {
      quantities,
      synthesisGifts,
      setGiftQuantity,
      incrementGift,
      decrementGift,
      consumeGift,
      getGiftQuantity,
      convertSynthesisGifts,
    }
  },
  {
    persist: {
      pick: ['quantities'],
    },
  }
)
