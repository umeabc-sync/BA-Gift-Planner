<template>
  <div class="gift-planner-actions">
    <div class="gift-planner-header">
      <div class="gift-planner-title">{{ t('bondCalculator.giftPlannerTitle') }}</div>
    </div>
    <div class="actions-container">
      <button @click="handleReset" class="action-button reset-button" :class="{ 'no-plan-exists': isNoAssignments }">
        <span>{{ t('giftPlannerActions.reset') }}</span>
      </button>
      <button @click="handleApply" class="action-button apply-button" :class="{ 'no-plan-exists': isNoAssignments }">
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

  .action-button {
    position: relative;
    font-family: inherit;
    font-weight: bold;
    border: none;
    color: #314665;
    padding: 0 30px;
    height: 44px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .action-button span {
    transform: skew(8deg);
    z-index: 2;
    letter-spacing: 1px;
    display: inline-block;
  }

  .action-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .action-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .reset-button {
    background-color: #f4e94c;
    background-image: linear-gradient(to bottom right, #f9da3b 0%, transparent 50%),
      linear-gradient(to top left, #f9da3b 0%, transparent 50%);
  }

  .dark-mode .reset-button {
    background-color: #e57758;
    background-image: linear-gradient(to bottom right, #e4522f 0%, transparent 50%),
      linear-gradient(to top left, #e4522f 0%, transparent 50%);
    color: #e0f4ff;
  }

  .apply-button {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
  }

  .dark-mode .apply-button {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }

  .action-button.no-plan-exists {
    background-color: #daedf4;
    background-image: linear-gradient(to bottom right, #c9e1ed 0%, transparent 50%),
      linear-gradient(to top left, #c9e1ed 0%, transparent 50%);
    cursor: not-allowed;
  }

  .dark-mode .action-button.no-plan-exists {
    background-color: #3d4852;
    background-image: linear-gradient(to bottom right, #2d3748 0%, transparent 50%),
      linear-gradient(to top left, #2d3748 0%, transparent 50%);
    color: #9ca3af;
  }
</style>
