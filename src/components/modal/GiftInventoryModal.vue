<template>
  <BaseModal :is-visible="show" @close="close" max-width="550px">
    <template #header>
      <div class="modal-title">{{ t('giftInventoryModal.title') }}</div>
    </template>
    <template #body>
      <div class="gift-inventory-body">
        <div v-if="allGifts.length > 0" class="gift-list">
          <div v-for="gift in allGifts" :key="gift.key" class="gift-wrapper">
            <div class="gift-grid-item" :class="[gift.isSsr ? 'gift-purple' : 'gift-yellow']">
              <ImageWithLoader
                :src="getGiftUrl(gift.id, gift.isSsr)"
                class="gift-icon"
                object-fit="contain"
                loader-type="pulse"
                :inherit-background="false"
              />
              <div class="gift-icon-bg"></div>
              <div class="gift-name">{{ gift.name }}</div>
            </div>

            <QuantityControl
              :value="getGiftQuantity(gift.id, gift.isSsr)"
              @update:value="setGiftQuantity(gift.id, gift.isSsr, $event)"
              @increment="incrementGift(gift.id, gift.isSsr)"
              @decrement="decrementGift(gift.id, gift.isSsr)"
              :use-continuous="true"
            />
          </div>
        </div>
        <p v-else>Loading gifts...</p>
      </div>
    </template>
    <template #footer>
      <div class="gift-inventory-footer">
        <button @click="convertGifts" class="convert-button" :disabled="!canConvertSynthesisGifts">
          <span>{{ t('bondCalculator.convertToChoiceBox') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { computed, toRefs } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useModal } from '@/composables/useModal.js'
  import { useI18n } from '@/composables/useI18n.js'
  import { useSrGiftData } from '@/utils/fetchSrGiftData.js'
  import { useSsrGiftData } from '@/utils/fetchSsrGiftData.js'
  import { useGiftStore } from '@/store/gift'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import QuantityControl from '@components/ui/QuantityControl.vue'
  import BaseModal from '@components/ui/BaseModal.vue'

  const { t, currentLocale: locale } = useI18n()

  const props = defineProps({
    show: { type: Boolean, default: false },
  })

  const emit = defineEmits(['close'])

  const giftStore = useGiftStore()
  const { getGiftQuantity, setGiftQuantity, incrementGift, decrementGift, convertSynthesisGifts } = giftStore
  const { synthesisGifts } = storeToRefs(giftStore)

  const close = () => {
    emit('close')
  }

  const { show } = toRefs(props)
  useModal(show, close)

  const { data: srGifts } = useSrGiftData(locale)
  const { data: ssrGifts } = useSsrGiftData(locale)

  const allGifts = computed(() => {
    if (!srGifts.value || !ssrGifts.value) {
      return []
    }
    const sr = srGifts.value.map((g) => ({ ...g, isSsr: false })).sort((a, b) => a.id - b.id)
    const ssr = ssrGifts.value.map((g) => ({ ...g, isSsr: true })).sort((a, b) => a.id - b.id)
    return [...ssr, ...sr]
  })

  const canConvertSynthesisGifts = computed(() => {
    if (!synthesisGifts.value) return false
    const totalGiftQuantity = synthesisGifts.value.reduce((total, gift) => {
      const quantity = getGiftQuantity(gift.id, gift.isSsr)
      return total + quantity
    }, 0)
    return totalGiftQuantity >= 2
  })

  const convertGifts = () => {
    convertSynthesisGifts()
  }
</script>

<style scoped>
  .gift-inventory-body {
    padding: 10px 20px;
  }

  .gift-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px 0;
  }

  .gift-wrapper {
    background: #efefef;
    border-radius: 12px;
    padding: 15px;
    border: 2px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .dark-mode .gift-wrapper {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .gift-grid-item {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    position: relative;
    flex-shrink: 0;
  }

  .gift-grid-item > *,
  .gift-grid-item::before,
  .gift-grid-item::after {
    grid-column: 1 / 1;
    grid-row: 1 / 1;
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

  .gift-name {
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
    pointer-events: none;
  }

  .gift-grid-item:hover .gift-name {
    opacity: 1;
    visibility: visible;
  }

  .dark-mode .gift-grid-item .gift-name {
    background: rgba(223, 227, 231, 0.95);
    color: #201e2e;
  }

  .gift-inventory-footer {
    padding: 15px 20px;
  }

  .convert-button {
    background-color: #f4e94c;
    background-image: linear-gradient(to bottom right, #f9da3b 0%, transparent 50%),
      linear-gradient(to top left, #f9da3b 0%, transparent 50%);
    border: none;
    color: #314665;
    cursor: pointer;
    border-radius: 12px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    font-family: inherit;
    font-weight: bold;
    font-size: 1rem;
    padding: 0 25px;
  }

  .convert-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .convert-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .dark-mode .convert-button {
    background-color: #e57758;
    background-image: linear-gradient(to bottom right, #e4522f 0%, transparent 50%),
      linear-gradient(to top left, #e4522f 0%, transparent 50%);
    color: #e0f4ff;
  }

  .convert-button > span {
    transform: skew(8deg);
    display: inline-block;
  }
</style>
