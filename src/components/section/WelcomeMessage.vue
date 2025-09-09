<template>
  <div class="no-selection-container">
    <div class="no-selection-panel">
      <div class="panel-content">
        <img :src="getAssetsFile('icon/gift.webp')" alt="Gift Icon" class="gift-icon" />
        <p>{{ t('welcome.message') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from '@composables/useI18n.js'
  import { getAssetsFile } from '@utils/getAssetsFile'

  const { t } = useI18n()
</script>

<style scoped>
  .no-selection-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 50px 20px;
    min-height: 300px;
  }

  .no-selection-panel {
    width: 100%;
    max-width: 600px;
    background-color: #efefef;
    border-radius: 12px;
    padding: 4px;
    border: 2px solid #dee2e6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .dark-mode .no-selection-panel {
    background-color: #1a2b40;
    border-color: #2a4a6e;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #314665;
    font-size: 1.1rem;
    font-weight: 600;
    padding: 40px 20px;
  }

  .dark-mode .panel-content {
    color: #e0e6ed;
  }

  .gift-icon {
    width: 80px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
</style>
