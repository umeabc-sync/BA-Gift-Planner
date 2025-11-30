<template>
  <div class="gift-planner-actions">
    <div class="gift-planner-header">
      <div class="gift-planner-title">{{ t('bondCalculator.giftPlannerTitle') }}</div>
    </div>
    <div class="actions-container">
      <button @click="handleReset" class="btn-skew btn-text btn-yellow" :disabled="isNoAssignments">
        <span>{{ t('giftPlannerActions.reset') }}</span>
      </button>
      <button @click="handleApply" class="btn-skew btn-text btn-blue" :disabled="isNoAssignments">
        <span>{{ t('giftPlannerActions.apply') }}</span>
      </button>
    </div>
    <BaseDialog
      :is-visible="isResetDialogVisible"
      :text="t('giftPlannerActions.resetConfirmation')"
      :show-cancel="true"
      @close="isResetDialogVisible = false"
      @ok="confirmReset"
    />
    <BaseDialog
      :is-visible="isApplyDialogVisible"
      :text="t('giftPlannerActions.applyConfirmation')"
      :show-cancel="true"
      @close="isApplyDialogVisible = false"
      @ok="confirmApply"
    />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { useI18n } from '@/composables/useI18n'
  import BaseDialog from '@components/ui/BaseDialog.vue'

  const { t } = useI18n()
  const giftPlannerStore = useGiftPlannerStore()
  const { assignments } = storeToRefs(giftPlannerStore)

  const isNoAssignments = computed(() => Object.keys(assignments.value).length === 0)

  const isResetDialogVisible = ref(false)
  const isApplyDialogVisible = ref(false)

  const handleReset = () => {
    if (isNoAssignments.value) return
    isResetDialogVisible.value = true
  }

  const handleApply = () => {
    if (isNoAssignments.value) return
    isApplyDialogVisible.value = true
  }

  const confirmReset = () => {
    giftPlannerStore.clearAssignments()
    isResetDialogVisible.value = false
  }

  const confirmApply = () => {
    giftPlannerStore.applyAssignments()
    isApplyDialogVisible.value = false
  }
</script>

<style scoped>
  .gift-planner-actions {
    background: #efefef;
    border: 2px solid #dee2e6;
    border-radius: 20px;
    padding: 15px 25px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  .dark-mode .gift-planner-actions {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .gift-planner-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
  }

  .gift-planner-title {
    font-size: 20px;
    font-weight: bold;
    color: #314665;
    text-align: center;
  }

  .dark-mode .gift-planner-title {
    color: #e0f4ff;
  }

  .actions-container {
    display: flex;
    justify-content: center;
    gap: 30px;
  }

  .btn-skew {
    min-width: 140px;
    height: 44px;
    padding: 0 30px;
    font-size: 1.1rem;
  }

  .btn-skew span {
    letter-spacing: 1px;
  }
</style>
