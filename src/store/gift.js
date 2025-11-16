import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGiftStore = defineStore(
  'gift',
  () => {
    // State
    const quantities = ref({})

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

    return {
      quantities,
      setGiftQuantity,
      incrementGift,
      decrementGift,
      getGiftQuantity,
    }
  },
  { persist: true }
)
