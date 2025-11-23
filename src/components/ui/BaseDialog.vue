<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" :style="contentStyle">
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <slot name="header">{{ title || t('dialog.notificationTitle') }}</slot>
            </div>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <p>{{ text }}</p>
          </div>
          <div class="modal-actions" :class="{ 'has-cancel': showCancel }">
            <button v-if="showCancel" class="btn btn-cancel" @click="handleCancel">
              <span>{{ t('common.cancel') }}</span>
            </button>
            <button class="btn btn-ok" :class="{ pink: pink }" @click="handleOk">
              <span>{{ t('common.ok') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { toRefs, computed } from 'vue'
  import { useModal } from '@composables/useModal.js'
  import { useI18n } from '@composables/useI18n.js'

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    text: { type: String, required: true },
    okAction: { type: Function, default: () => {} },
    showCancel: { type: Boolean, default: false },
    maxWidth: { type: String, default: '400px' },
  })

  const emit = defineEmits(['close', 'ok', 'cancel'])
  const { t } = useI18n()

  const closeModal = () => {
    emit('close')
  }

  const handleOk = () => {
    props.okAction()
    emit('ok')
    closeModal()
  }

  const handleCancel = () => {
    emit('cancel')
    closeModal()
  }

  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const contentStyle = computed(() => ({
    '--max-width': props.maxWidth,
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
    min-height: 300px;
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

  .modal-title-wrapper {
    padding: 10px 0px 5px 0px;
    text-align: center;
    color: #2d4663;
    flex-grow: 0;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 5px solid #fdef66;
    user-select: none;
  }

  .dark-mode .modal-title-wrapper {
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
    padding: 20px;
    text-align: center;
    font-size: 1.1rem;
    line-height: 1.5;
    overflow-y: auto;
    flex-grow: 1;
    color: #314665;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dark-mode .modal-body {
    color: #e0f4ff;
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    padding: 0 20px 20px;
    gap: 20px;
  }

  .modal-actions.has-cancel {
    justify-content: space-between;
  }

  .btn {
    position: relative;
    font-family: inherit;
    font-weight: bold;
    border: none;
    color: #314665;
    padding: 0 30px;
    height: 44px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .btn span {
    transform: skew(8deg);
    z-index: 2;
    letter-spacing: 1px;
    display: inline-block;
  }

  .btn:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .btn:active {
    transform: scale(0.95) skew(-8deg);
  }

  .modal-actions.has-cancel .btn {
    flex: 1;
  }

  .btn-ok {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
  }

  .dark-mode .btn-ok {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }

  .btn-cancel {
    background-color: #daedf4;
    background-image: linear-gradient(to bottom right, #c9e1ed 0%, transparent 50%),
      linear-gradient(to top left, #c9e1ed 0%, transparent 50%);
  }

  .dark-mode .btn-cancel {
    background-color: #3d4852;
    background-image: linear-gradient(to bottom right, #2d3748 0%, transparent 50%),
      linear-gradient(to top left, #2d3748 0%, transparent 50%);
    color: #9ca3af;
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
</style>
