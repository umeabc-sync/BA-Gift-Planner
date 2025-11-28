<template>
  <div v-if="isVisible" class="loading-overlay" :class="`scope-${scope}`">
    <div class="spinner-container">
      <HalfCircleSpinner :animation-duration="1000" :size="60" color="#fff" />
      <p class="loading-text">{{ t('app.downloading') }}</p>
    </div>
  </div>
</template>

<script setup>
  import { HalfCircleSpinner } from 'epic-spinners'
  import { useI18n } from '@composables/useI18n'

  defineProps({
    isVisible: Boolean,
    scope: {
      type: String,
      default: 'global', // 'global' or 'local'
      validator: (value) => ['global', 'local'].includes(value),
    },
  })

  const { t } = useI18n()
</script>

<style scoped>
  .loading-overlay {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .scope-global {
    position: fixed;
  }

  .scope-local {
    position: absolute;
  }

  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .loading-text {
    color: white;
    font-size: 1.2em;
  }
</style>
