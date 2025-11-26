<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" :style="contentStyle">
          <div v-if="$slots.header" class="modal-header">
            <div class="modal-title-wrapper">
              <slot name="header"></slot>
            </div>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div v-if="isEmpty" class="empty-state" :style="emptyStateStyle">
              <warningIcon class="empty-icon" />
              <p class="empty-text">EMPTY</p>
            </div>
            <slot v-else name="body"></slot>
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
  import warningIcon from '@/assets/icon/warning.svg'

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    maxWidth: { type: String, default: '800px' },
    minBodyHeight: { type: String, default: '200px' },
    isEmpty: { type: Boolean, default: false },
  })

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }

  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const contentStyle = computed(() => ({
    '--max-width': props.maxWidth,
  }))

  const emptyStateStyle = computed(() => ({
    minHeight: props.minBodyHeight,
  }))
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #f8f9fa;
    border-radius: 15px;
    width: 90%;
    max-width: var(--max-width);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
    overflow: hidden;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    color: #e0e6ed;
  }

  .modal-header {
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #cde6f8, #f7fafb);
    border-radius: 15px 15px 0 0;
    position: relative;
    user-select: none;
    flex-shrink: 0;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #223d5a, #1a2b40);
    border-bottom-color: #2a4a6e;
  }

  .modal-header .modal-title-wrapper {
    padding: 10px 0px 5px 0px;
    text-align: center;
    color: #2d4663;
    flex-grow: 0;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 5px solid #fdef66;
    user-select: none;
  }

  .dark-mode .modal-header .modal-title-wrapper {
    color: #e0f4ff;
    border-bottom-color: #fdef66;
  }

  .modal-header .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #2d4663;
    cursor: pointer;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.2s;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
  .modal-header .close-button:hover {
    opacity: 1;
  }

  .dark-mode .modal-header .close-button {
    color: #e0f4ff;
  }

  .modal-body {
    overflow-y: auto;
    flex-grow: 1;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #dee2e6;
    flex-shrink: 0;
  }

  .dark-mode .modal-footer {
    border-top-color: #2a4a6e;
  }

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

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    height: 100%;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    transform: scaleX(1.25);
    opacity: 0.4;
  }

  .empty-text {
    font-family: 'NEXON Football Gothic';
    font-weight: bold;
    font-style: italic;
    font-size: 1.75rem;
    margin-right: 8px;
    margin-top: -8px;
    color: #a0a0a0;
  }
</style>
