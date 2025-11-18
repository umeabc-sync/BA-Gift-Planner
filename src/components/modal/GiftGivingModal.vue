<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">{{ t('giftGivingModal.title') }} {{ student.name }}</div>
            <button class="close-button" @click="close">×</button>
          </div>
          <div class="modal-body">
            <div v-if="sortedGifts.length > 0" class="gift-list">
              <div v-for="gift in sortedGifts" :key="gift.key" class="gift-wrapper">
                <div class="gift-grid-item" :class="[gift.isSsr ? 'gift-purple' : 'gift-yellow']">
                  <ImageWithLoader
                    :src="getGiftUrl(gift.id, gift.isSsr)"
                    class="gift-icon"
                    object-fit="contain"
                    loader-type="pulse"
                    :inherit-background="false"
                  />
                  <div class="gift-icon-bg"></div>
                  <div class="quantity-badge">/ {{ giftStore.getGiftQuantity(gift.id, gift.isSsr) }}</div>
                </div>

                <div class="quantity-control">
                  <button @click="setMin(gift)" class="min-max-btn">
                    <span class="min">MIN</span>
                  </button>
                  <button @click="decrement(gift)" :disabled="getAssigned(gift) === 0" class="quantity-btn">
                    <span class="minus">－</span>
                  </button>
                  <div class="quantity-display">
                    <input
                      type="number"
                      :value="getAssigned(gift)"
                      @input="setAmount($event, gift)"
                      min="0"
                      :max="getMax(gift)"
                      class="quantity-input"
                    />
                  </div>
                  <button @click="increment(gift)" :disabled="getMax(gift) === getAssigned(gift)" class="quantity-btn">
                    <span class="plus">＋</span>
                  </button>
                  <button @click="setMax(gift)" class="min-max-btn">
                    <span class="max">MAX</span>
                  </button>
                </div>
              </div>
            </div>
            <p v-else>Loading gifts...</p>
          </div>
          <div class="modal-footer">
            <button @click="reset" class="reset-button">
              <span>{{ t('giftGivingModal.reset') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { computed, toRefs } from 'vue'
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { useGiftStore } from '@/store/gift'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal'

  const { t } = useI18n()

  const props = defineProps({
    show: { type: Boolean, default: false },
    student: Object,
  })

  const emit = defineEmits(['close'])

  const giftPlannerStore = useGiftPlannerStore()
  const giftStore = useGiftStore()

  const { show } = toRefs(props)
  useModal(show, close)

  const sortedGifts = computed(() => {
    if (!giftPlannerStore.allGifts) return []
    return giftPlannerStore.allGifts
      .filter((g) => giftStore.getGiftQuantity(g.id, g.isSsr) > 0)
      .map((g) => ({ ...g, key: `${g.isSsr ? 'ssr' : 'sr'}-${g.id}` }))
      .sort((a, b) => {
        if (a.isSsr !== b.isSsr) return a.isSsr ? -1 : 1
        return a.id - b.id
      })
  })

  const getAssigned = (gift) => {
    if (!props.student) return 0
    const assignments = giftPlannerStore.getStudentAssignments(props.student.id)
    return assignments[gift.key] || 0
  }

  const getMax = (gift) => {
    if (!props.student) return 0
    const assigned = getAssigned(gift)
    const available = giftPlannerStore.getAvailableCount(gift.id, gift.isSsr)
    return assigned + available
  }

  const increment = (gift) => {
    if (!props.student) return
    const currentAmount = getAssigned(gift)
    giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, currentAmount + 1)
  }

  const decrement = (gift) => {
    if (!props.student) return
    const currentAmount = getAssigned(gift)
    giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, currentAmount - 1)
  }

  const setMin = (gift) => {
    if (!props.student) return
    giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, 0)
  }

  const setMax = (gift) => {
    if (!props.student) return
    giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, getMax(gift))
  }

  const setAmount = (event, gift) => {
    if (!props.student) return
    let value = parseInt(event.target.value, 10)
    if (isNaN(value) || value < 0) {
      value = 0
    }
    const max = getMax(gift)
    if (value > max) {
      value = max
    }
    giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, value)
  }

  function close() {
    emit('close')
  }

  const reset = () => {
    if (props.student) {
      giftPlannerStore.clearStudentAssignments(props.student.id)
    }
  }
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

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-grow: 1;
    justify-content: center;
  }

  .quantity-btn {
    font-family: inherit;
    background-color: white;
    border: none;
    color: #4d5a6d;
    cursor: pointer;
    border-radius: 4px;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    transform: skew(-10deg);
    font-size: 1.5rem;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
  }

  .min-max-btn {
    font-family: inherit;
    background-color: white;
    border: none;
    color: #496f8f;
    cursor: pointer;
    border-radius: 4px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    transform: skew(-10deg);
    font-size: 1.25rem;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    padding: 5px 8px;
  }

  .dark-mode .quantity-btn,
  .dark-mode .min-max-btn {
    background-color: #2a4a6e;
    color: #e0e6ed;
  }

  .quantity-btn:active,
  .min-max-btn:active {
    transform: scale(0.9) skew(-10deg);
  }

  .quantity-btn:disabled,
  .min-max-btn:disabled {
    background-color: #e2e3e3;
    cursor: not-allowed;
  }

  .quantity-btn:disabled .minus,
  .quantity-btn:disabled .plus {
    color: #828282;
  }

  .plus,
  .minus,
  .min,
  .max {
    user-select: none;
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
    width: 60px;
    height: 35px;
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
    -moz-appearance: textfield;
  }

  .quantity-display .quantity-input::-webkit-outer-spin-button,
  .quantity-display .quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .modal-footer {
    padding: 15px 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #dee2e6;
  }

  .dark-mode .modal-footer {
    border-top: 1px solid #2a4a6e;
  }

  .reset-button {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
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

  .reset-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .reset-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .dark-mode .reset-button {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }

  .reset-button > span {
    transform: skew(8deg);
    display: inline-block;
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
