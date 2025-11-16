<template>
  <div v-if="allGifts.length > 0" class="gift-grid-section">
    <div class="gift-grid-header">
      <div class="gift-grid-title">{{ t('bondCalculator.giftInventoryTitle') }}</div>
      <button class="edit-button" @click="openModal">
        <span>{{ t('common.edit') }}</span>
      </button>
    </div>
    <div class="gift-grid-items">
      <div
        v-for="gift in allGifts"
        :key="`${gift.isSsr ? 'ssr' : 'sr'}-${gift.id}`"
        class="gift-grid-item"
        :class="[
          gift.isSsr ? 'gift-purple' : 'gift-yellow',
          { 'no-stock': getGiftQuantity(gift.id, gift.isSsr) === 0 },
        ]"
      >
        <ImageWithLoader
          :src="getGiftUrl(gift.id, gift.isSsr)"
          class="gift-icon"
          object-fit="contain"
          loader-type="pulse"
          :inherit-background="false"
        />
        <div class="gift-icon-bg"></div>
        <div class="gift-name">{{ gift.name }}</div>
        <div v-if="getGiftQuantity(gift.id, gift.isSsr) > 0" class="quantity-badge">
          <span>x{{ getGiftQuantity(gift.id, gift.isSsr) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useSrGiftData } from '@/utils/fetchSrGiftData.js'
  import { useSsrGiftData } from '@/utils/fetchSsrGiftData.js'
  import { useGiftStore } from '@/store/gift'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  const { t, currentLocale: locale } = useI18n()
  const giftStore = useGiftStore()
  const { getGiftQuantity } = giftStore

  const emit = defineEmits(['open-modal'])

  const openModal = () => {
    emit('open-modal')
  }

  const { data: srGifts } = useSrGiftData(locale)
  const { data: ssrGifts } = useSsrGiftData(locale)

  const allGifts = computed(() => {
    if (!srGifts.value || !ssrGifts.value) {
      return []
    }
    const sr = srGifts.value.map((g) => ({ ...g, isSsr: false })).sort((a, b) => a.id - b.id)
    const ssr = ssrGifts.value.map((g) => ({ ...g, isSsr: true })).sort((a, b) => a.id - b.id)
    return [...sr, ...ssr]
  })
</script>

<style scoped>
  .gift-grid-section {
    margin-top: 40px;
    background: #efefef;
    border: 2px solid #dee2e6;
    border-radius: 20px;
    padding: 25px;
  }

  .dark-mode .gift-grid-section {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .gift-grid-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
  }

  .gift-grid-title {
    font-size: 20px;
    font-weight: bold;
    color: #314665;
    text-align: center;
  }

  .dark-mode .gift-grid-title {
    color: #e0f4ff;
  }

  .edit-button {
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #466398;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
  }

  .edit-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .edit-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .edit-button span {
    transform: skew(8deg);
  }

  .dark-mode .edit-button {
    background-color: #00a4e4;
  }

  .dark-mode .edit-button:hover {
    background-color: #007bff;
  }

  .edit-button img {
    width: 16px;
    height: 16px;
    filter: invert(1);
  }

  .gift-grid-items {
    display: flex;
    flex-wrap: wrap;
    gap: 35px 20px;
    justify-content: center;
  }

  .gift-grid-item {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .gift-grid-item > *,
  .gift-grid-item::before,
  .gift-grid-item::after {
    grid-column: 1 / 1;
    grid-row: 1 / 1;
  }

  .gift-grid-item:hover {
    z-index: 10;
    transform: scale(1.1);
  }

  .gift-grid-item::before {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    z-index: 1;
  }

  .gift-yellow::before {
    background-color: #c7a579;
    background-image: linear-gradient(to bottom right, #a97d51 0%, transparent 50%),
      linear-gradient(to top left, #a97d51 0%, transparent 50%);
  }

  .gift-purple::before {
    background-color: #9e82d6;
    background-image: linear-gradient(to bottom right, #7a5bbe 0%, transparent 50%),
      linear-gradient(to top left, #7a5bbe 0%, transparent 50%);
  }

  .gift-icon-bg {
    width: 90%;
    height: 90%;
    border-radius: 50%;
    z-index: 2;
  }

  .gift-yellow .gift-icon-bg {
    background-color: #c7a579;
  }

  .gift-purple .gift-icon-bg {
    background-color: #9e82d6;
  }

  .dark-mode .gift-grid-item::after {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.15);
    z-index: 3;
  }

  .gift-icon {
    width: 90%;
    height: 90%;
    z-index: 4;
  }

  .gift-grid-item .gift-name {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 10px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s ease,
      visibility 0.3s ease;
    z-index: 11;
  }

  .dark-mode .gift-grid-item .gift-name {
    background: rgba(223, 227, 231, 0.95);
    color: #201e2e;
  }

  .gift-grid-item:hover .gift-name {
    opacity: 1;
    visibility: visible;
  }

  .quantity-badge {
    position: absolute;
    bottom: -5px;
    right: -10px;
    background: #212529;
    color: white;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    padding: 3px 8px;
    z-index: 5;
    border: 2px solid white;
  }

  .dark-mode .quantity-badge {
    background: #dee2e6;
    color: #201e2e;
    border-color: #1f3048;
  }

  .no-stock {
    filter: grayscale(80%);
    opacity: 0.6;
  }
</style>
