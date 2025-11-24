<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" :style="contentStyle">
          <div class="modal-header">
            <slot name="header"></slot>
            <button class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <slot name="body"></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { toRefs, computed } from 'vue'
  import { useModal } from '@composables/useModal.js'

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    maxWidth: { type: String, default: '600px' },
  })

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }

  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const contentStyle = computed(() => ({
    maxWidth: props.maxWidth,
  }))
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #fff;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    width: 90%;
    border-top: 5px solid #fb9eb1;
    animation: slide-down 0.3s ease-out;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
    user-select: none;
  }

  .modal-header :slotted(h3) {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #aaa;
    line-height: 1;
    transition: color 0.2s;
  }
  .close-button:hover {
    color: #333;
  }

  .modal-body {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    flex-grow: 1;
  }

  .modal-body::-webkit-scrollbar-thumb {
    border-color: #fff;
  }

  .dark-mode .modal-body::-webkit-scrollbar-thumb {
    border-color: #1f3048;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #eee;
    flex-shrink: 0;
  }

  /* Dark Mode */
  .dark-mode .modal-content {
    background: #1f3048;
    color: #e0e6ed;
    border-top-color: #fd7591;
  }
  .dark-mode .modal-header {
    border-bottom-color: #2a4a6e;
  }
  .dark-mode .modal-header :slotted(h3) {
    color: #e0e6ed;
  }
  .dark-mode .close-button {
    color: #7f8c8d;
  }
  .dark-mode .close-button:hover {
    color: #e0e6ed;
  }
  .dark-mode .modal-footer {
    border-top-color: #2a4a6e;
  }

  /* Transition */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  @keyframes slide-down {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
