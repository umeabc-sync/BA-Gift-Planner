<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="500px">
    <template #header>
      <div class="modal-title">{{ t('sharedCombination.title') }}</div>
    </template>
    <template #body>
      <div class="prompt-body">
        <p class="prompt-message">{{ t('sharedCombination.message') }}</p>

        <div v-if="sharedCombinationData" class="preview-section">
          <AppScrollbar class="student-preview-scroll">
            <div class="student-preview-list">
              <div v-for="studentId in sharedCombinationData" :key="studentId" class="student-avatar-container">
                <ImageWithLoader
                  :src="getAvatarUrl(studentId, getStudentForm(studentId))"
                  class="student-avatar"
                  :lazy="false"
                />
              </div>
            </div>
          </AppScrollbar>
        </div>

        <div class="prompt-actions">
          <button class="btn-skew btn-text btn-blue" @click="handleOverwrite">
            <span>{{ t('sharedCombination.overwrite') }}</span>
          </button>
          <button class="btn-skew btn-text btn-yellow" :disabled="isFull" @click="handleSaveAsNew">
            <span>{{ t('sharedCombination.saveAsNew') }}</span>
          </button>
          <button class="btn-skew btn-text btn-gray" @click="closeModal">
            <span>{{ t('sharedCombination.cancel') }}</span>
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { computed, toRefs } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { useModalStore } from '@/store/modal'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseModal from '@components/ui/BaseModal.vue'
  import AppScrollbar from '@/components/ui/AppScrollbar.vue'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { useUrlSearchParams } from '@vueuse/core'

  const { t } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const studentStore = useStudentStore()
  const { savedCombinations } = storeToRefs(studentStore)
  const { saveCombination, getStudentForm } = studentStore

  const modalStore = useModalStore()
  const { sharedCombinationData } = storeToRefs(modalStore)

  const isFull = computed(() => savedCombinations.value.length >= 10)

  const handleOverwrite = () => {
    if (sharedCombinationData.value) {
      studentStore.selectedStudentIds = [...sharedCombinationData.value]
    }
    clearUrlParam()
    closeModal()
  }

  const handleSaveAsNew = () => {
    if (isFull.value || !sharedCombinationData.value) return
    const defaultName = `${t('combinationManager.defaultName')} ${savedCombinations.value.length + 1}`
    saveCombination(defaultName, sharedCombinationData.value)
    clearUrlParam()
    closeModal()
    modalStore.openCombinationManagerModal()
  }

  const clearUrlParam = () => {
    const params = useUrlSearchParams('history')
    params.s = null
  }
</script>

<style scoped>
  .prompt-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background-color: #f8f9fa;
  }

  .dark-mode .prompt-body {
    background-color: #1a2b40;
  }

  .prompt-message {
    font-size: 1.1rem;
    color: #2c3e50;
    line-height: 1.5;
    margin: 0;
  }

  .dark-mode .prompt-message {
    color: #e0e6ed;
  }

  .preview-section {
    background: #e9eef3;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #d1d8e0;
  }

  .dark-mode .preview-section {
    background: #0d1f2d;
    border-color: #2a4a6e;
  }

  .student-preview-scroll {
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .student-preview-list {
    display: flex;
    gap: 8px;
  }

  .student-avatar-container {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }

  .student-avatar {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .prompt-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }

  .prompt-actions .btn-skew {
    width: 100%;
    justify-content: center;
    padding: 12px;
    font-size: 1rem;
  }
</style>
