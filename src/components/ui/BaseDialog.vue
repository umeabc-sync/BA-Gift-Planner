<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" :style="contentStyle">
          <div v-if="$slots.header || title" class="modal-header">
            <div class="modal-title-wrapper">
              <slot name="header">
                <h2>{{ title || t('dialog.notificationTitle') }}</h2>
              </slot>
            </div>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <p>{{ text }}</p>
          </div>
          <div class="modal-actions" :class="{ 'has-cancel': showCancel }">
            <button v-if="showCancel" class="btn btn-cancel" @click="handleCancel">
              {{ t('common.cancel') }}
            </button>
            <button class="btn btn-ok" @click="handleOk">
              {{ t('common.ok') }}
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

    .modal-header h2 {
        margin: 0;
        padding: 10px 0px 5px 0px;
        text-align: center;
        color: #2d4663;
        flex-grow: 0;
        font-size: 1.5rem;
        font-weight: bold;
        border-bottom: 5px solid #fdef66;
        user-select: none;
    }

  .dark-mode .modal-header h2 {
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
    overflow-y: auto;
    flex-grow: 1;
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    padding: 0 20px 20px;
    gap: 10px;
  }

    .modal-actions.has-cancel {
        justify-content: space-between;
    }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
    font-weight: bold;
    min-width: 100px;
  }

    .modal-actions.has-cancel .btn {
        flex: 1;
    }

  .btn-ok {
    background-color: #4a90e2;
    color: white;
  }

  .btn-ok:hover {
    background-color: #357abd;
  }

  .btn-cancel {
    background-color: #e0e0e0;
    color: #333;
  }

  .btn-cancel:hover {
    background-color: #c7c7c7;
  }

  .dark-mode .btn-cancel {
    background-color: #555;
    color: #eee;
   }

   .dark-mode .btn-cancel:hover {
    background-color: #666;
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
