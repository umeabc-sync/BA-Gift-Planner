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
    background-color: #e9eef3;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.03),
      rgba(0, 0, 0, 0.03) 1px,
      transparent 1px,
      transparent 10px
    );
    border-radius: 12px;
    padding: 4px;
    transform: skew(-8deg);
    border: 1px solid #dee2e6;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  }

  .dark-mode .no-selection-panel {
    background-color: #1a2b40;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px,
      transparent 10px
    );
    border-color: #2a4a6e;
  }

  .panel-content {
    transform: skew(8deg);
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
    height: 80px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
</style>
