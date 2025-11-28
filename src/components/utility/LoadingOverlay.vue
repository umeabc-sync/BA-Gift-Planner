<template>
  <div v-if="isVisible" class="loading-overlay" :class="[`scope-${scope}`, { 'has-overlay': showOverlay }]">
    <div class="spinner-container">
      <HalfCircleSpinner :animation-duration="1000" :size="60" :color="color" />
      <p v-if="text" class="loading-text" :style="{ color: color }">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
  import { HalfCircleSpinner } from 'epic-spinners'

  defineProps({
    isVisible: Boolean,
    scope: {
      type: String,
      default: 'global', // 'global' or 'local'
      validator: (value) => ['global', 'local'].includes(value),
    },
    showOverlay: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#fff',
    },
    text: {
      type: String,
      default: null,
    },
  })
</script>

<style scoped>
  .loading-overlay {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .loading-overlay.has-overlay {
    background-color: rgba(0, 0, 0, 0.7);
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
    font-size: 1.2em;
  }
</style>
