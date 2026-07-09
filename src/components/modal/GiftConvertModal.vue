<template>
  <BaseModal :is-visible="isVisible" @close="close" max-width="550px">
    <template #header>
      <div class="modal-title">{{ t('bondCalculator.convertToChoiceBox') }}</div>
    </template>
    <template #body>
      <div class="gift-convert-body">
        <div class="gift-list">
          <div v-for="gift in sortedGifts" :key="gift.key" class="gift-wrapper">
            <div class="gift-grid-item gift-yellow" :class="getGiftStyle(gift)">
              <ImageWithLoader
                :src="getGiftUrl(gift.id, false)"
                class="gift-icon"
                object-fit="contain"
                loader-type="pulse"
                :inherit-background="false"
              />
              <div class="gift-icon-bg"></div>
              <div class="quantity-badge">
                {{ getSelected(gift) }} /
                {{ giftStore.getGiftQuantity(gift.id, false) }}
              </div>
            </div>

            <QuantityControl
              class="quantity-control"
              :value="getSelected(gift)"
              :max="giftStore.getGiftQuantity(gift.id, false)"
              :min="0"
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
      <div class="gift-convert-footer">
        <div class="summary">
          <ImageWithLoader
            :src="getGiftUrl(35, false)"
            class="summary-icon"
            object-fit="contain"
            :inherit-background="false"
          />
          <span>x {{ choiceBoxesToCreate }}</span>
        </div>
        <div class="footer-buttons">
          <button @click="reset" class="btn-skew btn-text btn-blue">
            <span>{{ t('giftGivingModal.reset') }}</span>
          </button>
          <button @click="openConfirmDialog" class="btn-skew btn-text btn-yellow" :disabled="totalSelected < 2">
            <span>{{ t('common.confirm') }}</span>
          </button>
        </div>
      </div>
      <BaseDialog
        :is-visible="isConfirmVisible"
        :text="t('bondCalculator.convertConfirmation')"
        :show-cancel="true"
        @close="isConfirmVisible = false"
        @ok="executeConfirm"
      />
    </template>
  </BaseModal>
</template>

<script setup>
  import { computed, ref, watch, toRefs } from 'vue'
  import { useGiftStore } from '@/store/gift'
  import { useGiftAnalysisStore } from '@/store/giftAnalysis'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import QuantityControl from '@components/ui/QuantityControl.vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal'
  import BaseModal from '@components/ui/BaseModal.vue'
  import BaseDialog from '@components/ui/BaseDialog.vue'

  const { t } = useI18n()
  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    srGifts: { type: Array, default: () => [] },
  })
  const emit = defineEmits(['close', 'confirm'])

  const giftStore = useGiftStore()
  const giftAnalysisStore = useGiftAnalysisStore()

  const { isVisible } = toRefs(props)
  useModal(isVisible, close)

  const selectedQuantities = ref({})

  watch(
    () => props.isVisible,
    (newVal) => {
      if (newVal) {
        initializeSelection()
      }
    },
    { immediate: true }
  )

  function initializeSelection() {
    if (!props.srGifts) return

    const newQuantities = {}
    props.srGifts.forEach((g) => {
      if (g.id !== 35) {
        const key = `sr-${g.id}`
        const analysis = giftAnalysisStore.analyzedGifts?.find((ag) => ag.id === g.id && !ag.isSsr)?.analysis
        const isRecommended = analysis?.shouldSynthesize || false

        if (isRecommended) {
          newQuantities[key] = giftStore.getGiftQuantity(g.id, false)
        } else {
          newQuantities[key] = 0
        }
      }
    })
    selectedQuantities.value = newQuantities
  }

  const getGiftStyle = (gift) => {
    if (!gift.isRecommended) return 'other-gift'
    return ''
  }

  const sortedGifts = computed(() => {
    if (!props.srGifts) return []
    return props.srGifts
      .filter((g) => g.id !== 35 && giftStore.getGiftQuantity(g.id, false) > 0)
      .map((g) => {
        const analysis = giftAnalysisStore.analyzedGifts?.find((ag) => ag.id === g.id && !ag.isSsr)?.analysis
        const isRecommended = analysis?.shouldSynthesize || false
        return { ...g, key: `sr-${g.id}`, isRecommended }
      })
      .sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1
        return a.id - b.id
      })
  })

  const getSelected = (gift) => {
    return selectedQuantities.value[gift.key] || 0
  }

  const setAmount = (gift, value) => {
    let newAmount = value
    if (isNaN(newAmount) || newAmount < 0) newAmount = 0
    const max = giftStore.getGiftQuantity(gift.id, false)
    if (newAmount > max) newAmount = max
    selectedQuantities.value[gift.key] = newAmount
  }

  const increment = (gift) => {
    setAmount(gift, getSelected(gift) + 1)
  }

  const decrement = (gift) => {
    setAmount(gift, getSelected(gift) - 1)
  }

  const setMin = (gift) => {
    setAmount(gift, 0)
  }

  const setMax = (gift) => {
    setAmount(gift, giftStore.getGiftQuantity(gift.id, false))
  }

  const totalSelected = computed(() => {
    return Object.values(selectedQuantities.value).reduce((sum, qty) => sum + qty, 0)
  })

  const choiceBoxesToCreate = computed(() => {
    return Math.floor(totalSelected.value / 2)
  })

  function close() {
    emit('close')
  }

  const reset = () => {
    initializeSelection()
  }

  const isConfirmVisible = ref(false)

  const openConfirmDialog = () => {
    isConfirmVisible.value = true
  }

  const executeConfirm = () => {
    isConfirmVisible.value = false
    emit('confirm', selectedQuantities.value)
  }
</script>

<style scoped>
  .gift-convert-body {
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

  .gift-icon-bg {
    width: 90%;
    height: 90%;
    border-radius: 50%;
    z-index: 2;
    background-color: #c7a579;
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

  .other-gift {
    opacity: 0.6;
  }

  .gift-convert-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    gap: 15px;
    flex-wrap: wrap;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    font-size: 20px;
    background: #efefef;
    padding: 5px 15px;
    border-radius: 12px;
    border: 2px solid #dee2e6;
  }

  .dark-mode .summary {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .summary-icon {
    width: 40px;
    height: 40px;
  }

  .footer-buttons {
    display: flex;
    gap: 10px;
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
