<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">{{ t('giftInventoryModal.title') }}</div>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div v-if="allGifts.length > 0" class="gift-list">
              <div v-for="gift in allGifts" :key="`${gift.isSsr ? 'ssr' : 'sr'}-${gift.id}`" class="gift-item">
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
                  <button class="quantity-btn" @click="decrementGift(gift.id, gift.isSsr)">
                    <span class="minus">−</span>
                  </button>
                  <div class="quantity-display">
                    <span>{{ getGiftQuantity(gift.id, gift.isSsr) }}</span>
                  </div>
                  <button class="quantity-btn" @click="incrementGift(gift.id, gift.isSsr)">
                    <span class="plus">+</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-else>
              <p>Loading gifts...</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { ref, computed, toRefs } from 'vue'
  import { useModal } from '@/composables/useModal.js'
  import { useI18n } from '@/composables/useI18n.js'
  import { useSrGiftData } from '@/utils/fetchSrGiftData.js'
  import { useSsrGiftData } from '@/utils/fetchSsrGiftData.js'
  import { useGiftStore } from '@/store/gift'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  const { t, currentLocale: locale } = useI18n()
  const giftStore = useGiftStore()
  const { getGiftQuantity, incrementGift, decrementGift } = giftStore

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
  })

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }

  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #f8f9fa;
    border-radius: 15px;
    width: 90%;
    max-width: 550px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    color: #e0e6ed;
  }

  .modal-header {
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #cde6f8, #f7fafb);
    border-radius: 15px 15px 0 0;
    position: relative;
    user-select: none;
  }

  .modal-header .modal-title {
    padding: 10px 0px 5px 0px;
    text-align: center;
    color: #2d4663;
    flex-grow: 0;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 5px solid #fdef66;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #223d5a, #1a2b40);
    border-bottom-color: #2a4a6e;
  }

  .dark-mode .modal-header .modal-title {
    color: #e0f4ff;
    border-bottom-color: #fdef66;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #2d4663;
    cursor: pointer;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.2s;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }

  .dark-mode .close-button {
    color: #e0f4ff;
  }

  .close-button:hover {
    opacity: 1;
  }

  .modal-body {
    padding: 10px 20px;
    overflow-y: auto;
  }

  .gift-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

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

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  @keyframes slide-down {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
