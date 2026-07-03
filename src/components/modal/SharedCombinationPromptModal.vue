<template>
  <BaseDialog :is-visible="isVisible" :title="t('sharedCombination.title')" max-width="500px" @close="closeModal">
    <div class="prompt-body">
      <p class="prompt-message">{{ t('sharedCombination.message') }}</p>

      <div v-if="sharedCombinationData" class="preview-section">
        <div class="student-preview-list">
          <div
            v-for="studentId in sharedCombinationData.length > 5
              ? sharedCombinationData.slice(0, 5)
              : sharedCombinationData"
            :key="studentId"
            class="student-avatar-container"
          >
            <ImageWithLoader
              :src="getAvatarUrl(studentId, getStudentForm(studentId))"
              class="student-avatar-large"
              :lazy="false"
            />
          </div>
          <div v-if="sharedCombinationData.length > 5" class="more-students-indicator">
            +{{ sharedCombinationData.length - 5 }}
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <div class="custom-actions">
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
    </template>
  </BaseDialog>
</template>

<script setup>
  import { computed, toRefs } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { useModalStore } from '@/store/modal'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseDialog from '@components/ui/BaseDialog.vue'
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
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .prompt-message {
    font-size: 1.1rem;
    line-height: 1.5;
    margin: 0;
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

  .student-preview-list {
    display: flex;
    gap: 5px;
    justify-content: center;
  }

  .student-avatar-container {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }

  .student-avatar-large {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .more-students-indicator {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    background-color: #e9ecef;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: #495057;
  }

  .dark-mode .more-students-indicator {
    background-color: #2a4a6e;
    color: #e0e6ed;
  }

  .custom-actions {
    display: flex;
    gap: 10px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .custom-actions .btn-skew {
    flex: 1;
    min-width: 120px;
    padding: 10px;
    justify-content: center;
  }
</style>
