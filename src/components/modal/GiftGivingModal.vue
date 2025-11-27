<template>
  <BaseModal :is-visible="show" @close="close" max-width="550px" :is-empty="sortedGifts.length === 0">
    <template #header>
      <div class="modal-title">{{ t('giftGivingModal.title') }} {{ student?.name }}</div>
    </template>
    <template #body>
      <div class="gift-giving-body">
        <div class="gift-list">
          <div v-for="gift in sortedGifts" :key="gift.key" class="gift-wrapper">
            <div class="gift-grid-item" :class="[gift.isSsr ? 'gift-purple' : 'gift-yellow', getGiftStyle(gift)]">
              <ImageWithLoader
                :src="getGiftUrl(gift.id, gift.isSsr)"
                class="gift-icon"
                object-fit="contain"
                loader-type="pulse"
                :inherit-background="false"
              />
              <div class="gift-icon-bg"></div>
              <div class="quantity-badge">
                {{ giftPlannerStore.getAvailableCount(gift.id, gift.isSsr) }} /
                {{ giftStore.getGiftQuantity(gift.id, gift.isSsr) }}
              </div>
            </div>

            <QuantityControl
              class="quantity-control"
              :value="getAssigned(gift)"
              :max="getMax(gift)"
              :available="giftPlannerStore.getAvailableCount(gift.id, gift.isSsr)"
              @update:value="setAmount(gift, $event)"
              @increment="increment(gift)"
              @decrement="decrement(gift)"
              @set-min="setMin(gift)"
              @set-max="setMax(gift)"
              :use-continuous="true"
              :show-min-max="true"
            />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="gift-giving-footer">
        <div class="dropdown-wrapper">
          <CustomDropdown direction="up">
            <template #toggle>
              <span>{{ t('giftGivingModal.quickGive.title') }}</span>
            </template>
            <li @click="giveBestNoConflict">
              <span>{{ t('giftGivingModal.quickGive.bestNoConflict') }}</span>
            </li>
            <li @click="giveAllSuitable">
              <span>{{ t('giftGivingModal.quickGive.allSuitable') }}</span>
            </li>
            <li @click="giveAll">
              <span>{{ t('giftGivingModal.quickGive.all') }}</span>
            </li>
          </CustomDropdown>
        </div>

        <button @click="reset" class="reset-button">
          <span>{{ t('giftGivingModal.reset') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { computed, toRefs } from 'vue'
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { useGiftStore } from '@/store/gift'
  import { useGiftAnalysisStore } from '@/store/giftAnalysis'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import QuantityControl from '@components/ui/QuantityControl.vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal'
  import BaseModal from '@components/ui/BaseModal.vue'
  import CustomDropdown from '@components/ui/CustomDropdown.vue'

  const { t } = useI18n()

  const props = defineProps({
    show: { type: Boolean, default: false },
    student: Object,
  })

  const emit = defineEmits(['close'])

  const giftPlannerStore = useGiftPlannerStore()
  const giftStore = useGiftStore()
  const giftAnalysisStore = useGiftAnalysisStore()

  const { show } = toRefs(props)
  useModal(show, close)

  const getGiftStyle = (gift) => {
    if (gift.isSpecial) return 'conflict'
    const analysis = giftAnalysisStore.getGiftAnalysis(gift)
    if (!analysis || !analysis.characters) return 'other-gift'
    const optimalCharacters = analysis.characters.filter((c) => c.isOptimal)
    if (optimalCharacters.some((character) => character.id === props.student.id)) {
      return optimalCharacters.length === 1 ? 'best-no-conflict' : 'conflict'
    }
    return 'other-gift'
  }

  const sortedGifts = computed(() => {
    if (!props.student || !giftPlannerStore.allGifts) return []
    const giftPriorityMap = { 'best-no-conflict': 0, conflict: 2, 'other-gift': 3 }

    return giftPlannerStore.allGifts
      .filter((g) => giftStore.getGiftQuantity(g.id, g.isSsr) > 0)
      .map((g) => {
        const style = getGiftStyle(g)
        let priority = giftPriorityMap[style] !== undefined ? giftPriorityMap[style] : 99
        if (g.id === 35 && !g.isSsr) priority = 1
        return { ...g, key: `${g.isSsr ? 'ssr' : 'sr'}-${g.id}`, priority }
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
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

  const setAmount = (gift, value) => {
    if (!props.student) return
    let newAmount = value
    if (isNaN(newAmount) || newAmount < 0) newAmount = 0
    const max = getMax(gift)
    if (newAmount > max) newAmount = max
    giftPlannerStore.setAssignment(props.student.id, gift.id, gift.isSsr, newAmount)
  }

  function close() {
    emit('close')
  }

  const reset = () => {
    if (props.student) {
      giftPlannerStore.clearStudentAssignments(props.student.id)
    }
  }

  const giveBestNoConflict = () => {
    if (!props.student) return
    giftPlannerStore.clearStudentAssignments(props.student.id)
    sortedGifts.value.forEach((gift) => {
      if (getGiftStyle(gift) === 'best-no-conflict') {
        setMax(gift)
      }
    })
  }

  const giveAllSuitable = () => {
    if (!props.student) return
    giftPlannerStore.clearStudentAssignments(props.student.id)
    sortedGifts.value.forEach((gift) => {
      const style = getGiftStyle(gift)
      if (style === 'best-no-conflict' || style === 'conflict') {
        setMax(gift)
      }
    })
  }

  const giveAll = () => {
    if (!props.student) return
    giftPlannerStore.clearStudentAssignments(props.student.id)
    sortedGifts.value.forEach((gift) => {
      setMax(gift)
    })
  }
</script>

<style scoped>
  .gift-giving-body {
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

  /* Footer Styles */
  .gift-giving-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    gap: 15px;
    flex-wrap: wrap;
  }

  .dropdown-wrapper {
    flex-grow: 1;
    max-width: 250px;
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

  .best-no-conflict {
    animation: glow 1.5s infinite;
  }

  .other-gift {
    opacity: 0.6;
  }

  @keyframes glow {
    0%,
    100% {
      box-shadow: 0 0 10px #fdef66;
    }
    50% {
      box-shadow: 0 0 20px 5px #fdef66;
    }
  }

  @media (max-width: 550px) {
    .dropdown-wrapper {
      max-width: none;
    }
  }

  @media (max-width: 420px) {
    .gift-wrapper {
      flex-direction: column;
      align-items: center;
    }
    .quantity-control {
      width: 100%;
    }
  }
</style>
