<template>
  <div class="no-selection">{{ t('welcome.message') }}</div>
</template>

<script setup>
  import { useI18n } from '../composables/useI18n.js'

  const { t } = useI18n()
</script>

<style scoped>
  .no-selection {
    text-align: center;
    color: #666;
    font-size: 18px;
    margin: 50px 0;
    padding: 40px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .dark-mode .no-selection {
    background: #2c3e50;
    color: #bdc3c7;
  }
</style>
