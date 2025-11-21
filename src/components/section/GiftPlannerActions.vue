<template>
  <div class="gift-planner-actions">
    <div class="actions-container">
      <button @click="handleReset" class="action-button reset-button">
        {{ t('giftPlannerActions.reset') }}
      </button>
      <button @click="handleApply" class="action-button apply-button">
        {{ t('giftPlannerActions.apply') }}
      </button>
    </div>
  </div>
</template>

<script setup>
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { useI18n } from '@/composables/useI18n'

  const { t } = useI18n()
  const giftPlannerStore = useGiftPlannerStore()

  const handleReset = () => {
    if (confirm(t('giftPlannerActions.resetConfirmation'))) {
      giftPlannerStore.clearAssignments()
    }
  }

  const handleApply = () => {
    if (confirm(t('giftPlannerActions.applyConfirmation'))) {
      giftPlannerStore.applyAssignments()
    }
  }
</script>

<style scoped>
  .gift-planner-actions {
    background-color: var(--color-background-soft);
    padding: 15px;
    border-radius: 12px;
    margin: 0 auto;
    width: 100%;
    max-width: 900px;
    box-sizing: border-box;
  }

  .actions-container {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .action-button {
    border: none;
    color: white;
    padding: 10px 25px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
  }

  .reset-button {
    background-color: #f44336; /* Red */
  }

  .reset-button:hover {
    background-color: #d32f2f;
  }

  .apply-button {
    background-color: #4caf50; /* Green */
  }

  .apply-button:hover {
    background-color: #388e3c;
  }
</style>
