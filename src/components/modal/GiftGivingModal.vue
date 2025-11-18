<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ t('give_gift_to') }} {{ student.name }}</h3>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="sortedGifts.length > 0" class="gift-list">
          <div v-for="gift in sortedGifts" :key="gift.key" class="gift-item">
            <div class="gift-info">
              <ImageWithLoader :src="getGiftUrl(gift.id, gift.isSsr)" class="gift-icon" />
              <span class="gift-name">{{ gift.name }}</span>
            </div>
            <div class="quantity-control">
              <button @click="decrement(gift)" :disabled="getAssigned(gift) === 0" class="quantity-btn">-</button>
              <input
                type="number"
                :value="getAssigned(gift)"
                @input="setAmount($event, gift)"
                min="0"
                :max="getMax(gift)"
                class="quantity-input"
              />
              <button @click="increment(gift)" :disabled="getMax(gift) === getAssigned(gift)" class="quantity-btn">
                +
              </button>
            </div>
            <div class="available-quantity">/ {{ giftStore.getGiftQuantity(gift.id, gift.isSsr) }}</div>
          </div>
        </div>
        <p v-else>Loading gifts...</p>
      </div>
      <div class="modal-footer">
        <button @click="reset">{{ t('reset') }}</button>
        <button @click="close">{{ t('confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { useGiftStore } from '@/store/gift'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { useI18n } from '@/composables/useI18n.js'

  const { t } = useI18n()

  const props = defineProps({
    show: Boolean,
    student: Object,
  })

  const emit = defineEmits(['close'])

  const giftPlannerStore = useGiftPlannerStore()
  const giftStore = useGiftStore()

  const sortedGifts = computed(() => {
    if (!giftPlannerStore.allGifts) return []
    return giftPlannerStore.allGifts
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

  const setAmount = (event, gift) => {
    if (!props.student) return
    const value = parseInt(event.target.value, 10)
    if (isNaN(value)) {
      giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, 0)
    } else {
      giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, value)
    }
  }

  const close = () => {
    emit('close')
  }

  const reset = () => {
    if (props.student) {
      giftPlannerStore.clearStudentAssignments(props.student.id)
    }
  }
</script>

<style scoped>
  /* Styles will be similar to other modals */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-container {
    background-color: #fff;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .dark-mode .modal-container {
    background-color: #2a3b50;
  }

  .modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dark-mode .modal-header {
    border-bottom: 1px solid #3a506b;
  }

  .modal-header h3 {
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }

  .modal-body {
    padding: 16px;
    overflow-y: auto;
  }

  .gift-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .gift-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 10px;
  }

  .gift-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .gift-icon {
    width: 40px;
    height: 40px;
  }

  .gift-name {
    font-weight: bold;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .quantity-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 50%;
    background-color: #f0f0f0;
    cursor: pointer;
    font-size: 18px;
  }

  .dark-mode .quantity-btn {
    background-color: #3a506b;
    border-color: #5a7a9b;
  }

  .quantity-input {
    width: 50px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
  }

  .dark-mode .quantity-input {
    background-color: #1a2b40;
    border-color: #3a506b;
    color: #e0e6ed;
  }

  .available-quantity {
    width: 50px;
    text-align: left;
    color: #888;
  }

  .dark-mode .available-quantity {
    color: #aaa;
  }

  .modal-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .dark-mode .modal-footer {
    border-top: 1px solid #3a506b;
  }

  button {
    padding: 8px 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
    cursor: pointer;
  }
</style>
