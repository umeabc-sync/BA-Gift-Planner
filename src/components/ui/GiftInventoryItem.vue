<template>
  <div class="gift-item">
    <div class="gift-info">
      <ImageWithLoader
        :src="getGiftUrl(gift.id, gift.isSsr)"
        class="gift-icon"
        object-fit="contain"
        loader-type="pulse"
      />
      <span class="gift-name">{{ gift.name }}</span>
    </div>
    <div class="quantity-control">
      <button
        class="quantity-btn"
        @mousedown="startChangingQuantity('decrement')"
        @mouseup="stopChangingQuantity"
        @mouseleave="stopChangingQuantity"
        :disabled="quantity === 0"
      >
        <span class="minus">−</span>
      </button>
      <div class="quantity-display">
        <input class="quantity-input" type="number" v-model.number="quantity" min="0" max="999" />
      </div>
      <button
        class="quantity-btn"
        @mousedown="startChangingQuantity('increment')"
        @mouseup="stopChangingQuantity"
        @mouseleave="stopChangingQuantity"
        :disabled="quantity === 999"
      >
        <span class="plus">+</span>
      </button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useGiftStore } from '@/store/gift'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  const props = defineProps({
    gift: {
      type: Object,
      required: true,
    },
  })

  const giftStore = useGiftStore()

  const quantity = computed({
    get() {
      return giftStore.getGiftQuantity(props.gift.id, props.gift.isSsr)
    },
    set(val) {
      let newQuantity = Number(val)
      if (isNaN(newQuantity) || newQuantity < 0) {
        newQuantity = 0
      } else if (newQuantity > 999) {
        newQuantity = 999
      }
      giftStore.setGiftQuantity(props.gift.id, props.gift.isSsr, newQuantity)
    },
  })

  const increment = () => {
    giftStore.incrementGift(props.gift.id, props.gift.isSsr)
  }

  const decrement = () => {
    giftStore.decrementGift(props.gift.id, props.gift.isSsr)
  }

  let pressTimer = null
  let repeatTimer = null

  const startChangingQuantity = (action) => {
    const func = action === 'increment' ? increment : decrement
    func() // Execute immediately

    pressTimer = setTimeout(() => {
      repeatTimer = setInterval(() => {
        func()
        // Stop when the limit value is reached.
        if ((action === 'increment' && quantity.value >= 999) || (action === 'decrement' && quantity.value <= 0)) {
          stopChangingQuantity()
        }
      }, 100) // Execute once every 100ms
    }, 400) // Repeating starts after 400ms
  }

  const stopChangingQuantity = () => {
    clearTimeout(pressTimer)
    clearInterval(repeatTimer)
  }
</script>

<style scoped>
  .gift-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .gift-info {
    display: flex;
    align-items: center;
    gap: 15px;
    font-weight: bold;
    user-select: none;
    min-width: 0; /* Allow the container to shrink and enable text ellipsis on child */
  }

  .gift-icon {
    width: 50px;
    height: 50px;
  }

  .gift-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .quantity-btn {
    background-color: white;
    border: none;
    color: #4d5a6d;
    cursor: pointer;
    border-radius: 4px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    transform: skew(-10deg);
    font-size: 1.5rem;
    font-weight: bold;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
  }

  .dark-mode .quantity-btn {
    background-color: #2a4a6e;
    color: #e0e6ed;
  }

  .quantity-btn:active {
    transform: scale(0.9) skew(-10deg);
  }

  .quantity-btn:disabled {
    background-color: #e2e3e3;
  }

  .quantity-btn:disabled .minus,
  .quantity-btn:disabled .plus {
    color: #828282;
  }

  .plus,
  .minus {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    transform: skew(10deg);
  }

  .plus {
    color: #3dcffd;
  }

  .minus {
    color: #ff6f00;
  }

  .quantity-display {
    background-color: #4d5a6d;
    color: #f6f7f6;
    width: 80px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: skew(-10deg);
    border-radius: 4px;
  }

  .quantity-display .quantity-input {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    color: inherit;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    transform: skew(10deg);
    -moz-appearance: textfield; /* Firefox */
  }

  /* Hide number input arrows for Chrome, Safari, Edge, Opera */
  .quantity-display .quantity-input::-webkit-outer-spin-button,
  .quantity-display .quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .quantity-btn span {
    transform: skew(10deg);
  }
</style>
