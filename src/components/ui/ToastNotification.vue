<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]">
        <span style="user-select: none">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
  import { useToast } from '@/composables/useToast'

  const { toasts, removeToast } = useToast()
</script>

<style scoped>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
  }

  .toast {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    color: #fff;
    background-color: #333;
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    min-width: 250px;
    max-width: 400px;
  }

  .toast-info {
    background-color: #3498db;
  }

  .toast-success {
    background-color: #2ecc71;
  }

  .toast-error {
    background-color: #e74c3c;
  }

  .toast button {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 1rem;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
