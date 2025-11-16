<template>
  <div class="gift-item">
    <div class="gift-info">
      <ImageWithLoader
        :src="getGiftUrl(gift.id, gift.isSsr)"
        class="gift-icon"
        object-fit="contain"
        loader-type="pulse"
      />
      <span>{{ gift.name }}</span>
    </div>
    <div class="quantity-control">
      <button class="quantity-btn" @click="decrement" :disabled="quantity === 0">
        <span class="minus">−</span>
      </button>
      <div class="quantity-display">
        <span>{{ quantity }}</span>
      </div>
      <button class="quantity-btn" @click="increment" :disabled="quantity === 999">
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

  const quantity = computed(() => giftStore.getGiftQuantity(props.gift.id, props.gift.isSsr))

  const increment = () => {
    giftStore.incrementGift(props.gift.id, props.gift.isSsr)
  }

  const decrement = () => {
    giftStore.decrementGift(props.gift.id, props.gift.isSsr)
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
  }

  .gift-icon {
    width: 50px;
    height: 50px;
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

  .plus {
    color: #3dcffd;
    transform: skew(10deg);
  }

  .minus {
    color: #ff6f00;
    transform: skew(10deg);
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
    font-size: 1.2rem;
    font-weight: bold;
    user-select: none;
  }

  .quantity-display span,
  .quantity-btn span {
    transform: skew(10deg);
  }
</style>
