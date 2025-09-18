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
    padding: 18px 24px;
    margin-bottom: 16px;
    border-radius: 15px;
    color: #314665;
    background: #f8f9fa;
    border: 2px solid #e0e6ed;
    box-shadow:
      0 8px 25px rgba(70, 99, 152, 0.12),
      0 3px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 320px;
    max-width: 450px;
    transform: skew(-5deg);
    position: relative;
    backdrop-filter: blur(10px);
    font-weight: 600;
  }

  .toast::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      rgba(119, 221, 255, 0.03),
      rgba(119, 221, 255, 0.03) 1px,
      transparent 1px,
      transparent 15px
    );
    border-radius: 13px;
    pointer-events: none;
    transform: skew(5deg);
  }

  .toast span {
    transform: skew(5deg);
    flex-grow: 1;
    font-size: 1rem;
    line-height: 1.5;
    z-index: 2;
    position: relative;
  }

  .toast button {
    background: transparent;
    border: transparent;
    color: #314665;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 20px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    transform: skew(5deg);
    font-weight: bold;
    z-index: 2;
    position: relative;
  }

  .toast button:hover {
    transform: skew(5deg) translateY(-2px);
  }

  .toast-info {
    background: linear-gradient(135deg, #e8f7ff 0%, #f8fcff 100%);
    border-color: #77ddff;
  }

  .toast-success {
    background: linear-gradient(135deg, #f0fff4 0%, #e8fdf2 100%);
    border-color: #66d9a3;
    color: #1f5f3f;
  }

  .toast-success button {
    color: #1f5f3f;
  }

  .toast-error {
    background: linear-gradient(135deg, #fff5f5 0%, #fee8e8 100%);
    border-color: #ff7b7b;
    color: #7f1d1d;
  }

  .toast-error button {
    color: #7f1d1d;
  }

  .toast:hover {
    transform: skew(-5deg) translateY(-3px);
    box-shadow:
      0 12px 35px rgba(70, 99, 152, 0.18),
      0 5px 12px rgba(0, 0, 0, 0.12);
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
