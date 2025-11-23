import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGiftPlannerStore } from './giftPlanner'

export const useGiftStore = defineStore(
  'gift',
  () => {
    const giftPlannerStore = useGiftPlannerStore()

    // State
    const quantities = ref({})
    const synthesisGifts = ref([])

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

    function convertSynthesisGifts() {
      let totalSynthesisGiftQuantity = 0
      const synthesisGiftKeys = []
      let firstOwnedSynthesisGift = null

      // Calculate total quantity and collect keys
      synthesisGifts.value.forEach((gift) => {
        const key = getKey(gift.id, gift.isSsr)
        const quantity = quantities.value[key] || 0
        if (quantity > 0 && !firstOwnedSynthesisGift) {
          firstOwnedSynthesisGift = { id: gift.id, isSsr: gift.isSsr }
        }
        totalSynthesisGiftQuantity += quantity
        synthesisGiftKeys.push({ key, id: gift.id, isSsr: gift.isSsr })
      })

      if (totalSynthesisGiftQuantity < 2) return

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
      if (remainder === 1 && firstOwnedSynthesisGift) {
        // Put the remainder back into the first synthesis gift that was owned
        const key = getKey(firstOwnedSynthesisGift.id, firstOwnedSynthesisGift.isSsr)
        quantities.value[key] = 1
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
      consumeGift,
      getGiftQuantity,
      convertSynthesisGifts,
      setSynthesisGifts,
    }
  },
  { persist: true }
)
