import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGiftStore = defineStore(
  'gift',
  () => {
    // State
    const quantities = ref({})
    const synthesisGifts = ref([])

    const getKey = (giftId, isSsr) => `${isSsr ? 'ssr' : 'sr'}-${giftId}`

    // Actions
    function setGiftQuantity(giftId, isSsr, quantity) {
      const key = getKey(giftId, isSsr)
      const newQuantity = Math.max(0, quantity)
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
      if (quantities.value[key] && quantities.value[key] > 0) {
        quantities.value[key]--
        if (quantities.value[key] === 0) {
          delete quantities.value[key]
        }
      }
    }

    function getGiftQuantity(giftId, isSsr) {
      const key = getKey(giftId, isSsr)
      return quantities.value[key] || 0
    }

    function convertSynthesisGifts() {
      let totalSynthesisGiftQuantity = 0
      const synthesisGiftKeys = []

      // Calculate total quantity and collect keys
      synthesisGifts.value.forEach((gift) => {
        const key = getKey(gift.id, gift.isSsr)
        const quantity = quantities.value[key] || 0
        totalSynthesisGiftQuantity += quantity
        synthesisGiftKeys.push({ key, id: gift.id, isSsr: gift.isSsr })
      })

      const choiceBoxesToCreate = Math.floor(totalSynthesisGiftQuantity / 2)
      const remainder = totalSynthesisGiftQuantity % 2

      // Zero out all synthesis gifts
      synthesisGiftKeys.forEach(({ key }) => {
        delete quantities.value[key]
      })

      // Add choice boxes
      if (choiceBoxesToCreate > 0) {
        const choiceBoxKey = getKey(35, false) // ID 35, isSsr: false for Gift Choice Box
        quantities.value[choiceBoxKey] = (quantities.value[choiceBoxKey] || 0) + choiceBoxesToCreate
      }

      // Handle remainder
      if (remainder === 1 && synthesisGiftKeys.length > 0) {
        // Put the remainder back into the first synthesis gift
        const firstSynthesisGift = synthesisGiftKeys[0]
        const key = getKey(firstSynthesisGift.id, firstSynthesisGift.isSsr)
        quantities.value[key] = (quantities.value[key] || 0) + 1
      }
    }

    function setSynthesisGifts(gifts) {
      synthesisGifts.value = gifts
    }

    return {
      quantities,
      synthesisGifts,
      setGiftQuantity,
      incrementGift,
      decrementGift,
      getGiftQuantity,
      convertSynthesisGifts,
      setSynthesisGifts,
    }
  },
  { persist: true }
)
