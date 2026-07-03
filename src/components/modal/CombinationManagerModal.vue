<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="800px">
    <template #header>
      <div class="modal-title">{{ t('combinationManager.title') }}</div>
    </template>
    <template #body>
      <div class="combinations-body">
        <div class="top-actions">
          <span class="slots-info" :class="{ 'is-full': isFull }">
            {{ t('combinationManager.slotsUsed') }}: {{ savedCombinations.length }} / 10
          </span>
          <button
            class="btn-skew btn-text btn-blue"
            :disabled="isFull || selectedStudentIds.length === 0"
            @click="handleSaveCurrentAsNew"
          >
            <span>{{ t('combinationManager.saveCurrentAsNew') }}</span>
          </button>
        </div>

        <div class="combinations-list-panel">
          <AppScrollbar hidden class="combinations-list">
            <div v-if="savedCombinations.length === 0" class="empty-state">
              {{ t('combinationManager.emptyList') }}
            </div>

            <div v-for="combo in savedCombinations" :key="combo.id" class="combination-card">
              <div class="combo-header">
                <div class="combo-title-wrapper">
                  <div class="blue-bar"></div>
                  <div v-if="editingId === combo.id" class="edit-name-container">
                    <input
                      type="text"
                      v-model="editingName"
                      class="edit-name-input"
                      maxlength="20"
                      @keyup.enter="saveRename(combo.id)"
                      @keyup.esc="cancelRename"
                      ref="editInputRef"
                    />
                  </div>
                  <div v-else class="combo-name">{{ combo.name }}</div>
                </div>
                <button v-if="editingId !== combo.id" class="btn-skew btn-icon-solid" @click="startRename(combo)">
                  <PencilIcon class="pencil-icon" draggable="false" />
                </button>
                <button v-else class="btn-skew btn-icon-solid" @click="saveRename(combo.id)">
                  <CheckIcon class="check-icon" draggable="false" />
                </button>
              </div>

              <div class="combo-content">
                <StudentCombinationPreview :student-ids="combo.studentIds" :title="combo.name" :avatar-size="44" />

                <div class="combo-actions">
                  <button class="btn-skew btn-text btn-blue" @click="handleLoad(combo)">
                    <span>{{ t('combinationManager.load') }}</span>
                  </button>
                  <button
                    class="btn-skew btn-text btn-yellow"
                    :disabled="selectedStudentIds.length === 0"
                    @click="handleOverwrite(combo)"
                  >
                    <span>{{ t('combinationManager.overwrite') }}</span>
                  </button>
                  <button class="btn-skew btn-text btn-gray" @click="handleDelete(combo)">
                    <span>{{ t('combinationManager.delete') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </AppScrollbar>
        </div>
      </div>
    </template>
  </BaseModal>

  <BaseDialog
    :is-visible="isConfirmDialogOpen"
    :title="t('dialog.notificationTitle')"
    :text="confirmDialogText"
    :show-cancel="true"
    @ok="handleConfirmDialogOk"
    @cancel="closeConfirmDialog"
    @close="closeConfirmDialog"
  />
</template>

<script setup>
  import { ref, computed, toRefs, nextTick } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseModal from '@components/ui/BaseModal.vue'
  import BaseDialog from '@components/ui/BaseDialog.vue'
  import StudentCombinationPreview from '@components/ui/StudentCombinationPreview.vue'
  import AppScrollbar from '@/components/ui/AppScrollbar.vue'
  import PencilIcon from '@assets/icon/pencil.svg'
  import CheckIcon from '@assets/icon/selected.svg'

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
  const { savedCombinations, selectedStudentIds } = storeToRefs(studentStore)
  const { saveCombination, updateCombination, deleteCombination } = studentStore

  const isFull = computed(() => savedCombinations.value.length >= 10)

  const editingId = ref(null)
  const editingName = ref('')
  const editInputRef = ref(null)

  const handleSaveCurrentAsNew = () => {
    if (isFull.value || selectedStudentIds.value.length === 0) return
    const defaultName = `${t('combinationManager.defaultName')} ${savedCombinations.value.length + 1}`
    saveCombination(defaultName, selectedStudentIds.value)
  }

  const handleLoad = (combo) => {
    studentStore.selectedStudentIds = [...combo.studentIds]
    closeModal()
  }

  const isConfirmDialogOpen = ref(false)
  const confirmDialogText = ref('')
  let pendingConfirmAction = null

  const handleConfirmDialogOk = () => {
    if (pendingConfirmAction) pendingConfirmAction()
    closeConfirmDialog()
  }

  const closeConfirmDialog = () => {
    isConfirmDialogOpen.value = false
    pendingConfirmAction = null
  }

  const handleOverwrite = (combo) => {
    if (selectedStudentIds.value.length === 0) return
    confirmDialogText.value = t('combinationManager.confirmOverwrite')
    pendingConfirmAction = () => {
      updateCombination(combo.id, undefined, selectedStudentIds.value)
    }
    isConfirmDialogOpen.value = true
  }

  const handleDelete = (combo) => {
    confirmDialogText.value = t('combinationManager.confirmDelete')
    pendingConfirmAction = () => {
      deleteCombination(combo.id)
    }
    isConfirmDialogOpen.value = true
  }

  const startRename = (combo) => {
    editingId.value = combo.id
    editingName.value = combo.name
    nextTick(() => {
      if (editInputRef.value && editInputRef.value[0]) {
        editInputRef.value[0].focus()
      }
    })
  }

  const saveRename = (id) => {
    const trimmed = editingName.value.trim()
    if (trimmed) {
      updateCombination(id, trimmed)
    }
    editingId.value = null
  }

  const cancelRename = () => {
    editingId.value = null
  }
</script>

<style scoped>
  .combinations-body {
    display: flex;
    flex-direction: column;
    height: 70vh;
    max-height: 600px;
    padding: 10px;
    background-color: #f8f9fa;
  }

  .dark-mode .combinations-body {
    background-color: #1a2b40;
  }

  .top-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 0 10px;
  }

  .slots-info {
    font-weight: bold;
    color: #416589;
    user-select: none;
  }

  .slots-info.is-full {
    color: #cc1a25;
  }

  .dark-mode .slots-info {
    color: #e0f4ff;
  }

  .dark-mode .slots-info.is-full {
    color: #ff6b6b;
  }

  .combinations-list-panel {
    width: 100%;
    padding: 6px;
    background-color: #d8dadc;
    border-radius: 9px;
    flex-grow: 1;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }

  .dark-mode .combinations-list-panel {
    background-color: #08141d;
  }

  .combinations-list {
    flex-grow: 1;
    overflow-y: auto;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #888;
    font-size: 1.1rem;
  }

  .combination-card {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #d1d8e0;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .dark-mode .combination-card {
    background: #0d1f2d;
    border-color: #2a4a6e;
  }

  .combo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px dashed #d1d8e0;
    background-color: #e7f5fd;
    border-radius: 8px 8px 0 0;
  }

  .dark-mode .combo-header {
    border-bottom-color: #2a4a6e;
    background: linear-gradient(to bottom, #1f3048, #0d1f2d);
  }

  .combo-title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-grow: 1;
  }

  .blue-bar {
    width: 4px;
    height: 18px;
    background-color: #4ed5e9;
  }

  .combo-name {
    user-select: none;
    font-weight: bold;
    font-size: 1.1rem;
    color: #2d4663;
  }

  .dark-mode .combo-name {
    color: #e0e6ed;
  }

  .edit-name-container {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-grow: 1;
  }

  .edit-name-input {
    flex-grow: 1;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    max-width: 250px;
    box-sizing: border-box;
  }

  .dark-mode .edit-name-input {
    background-color: #1f3048;
    color: #e0e6ed;
    border-color: #2a4a6e;
  }

  .btn-icon-solid {
    background: #fff;
    border: 1px solid #ccc;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .dark-mode .btn-icon-solid {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .pencil-icon,
  .check-icon {
    width: 16px;
    height: 16px;
    fill: #2d4663;
    transition: fill 0.2s ease;
  }

  .dark-mode .pencil-icon,
  .dark-mode .check-icon {
    fill: #e0f4ff;
  }

  .combo-content {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 15px;
    min-width: 0;
  }

  .combo-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .combo-actions .btn-skew {
    padding: 8px 16px;
    font-size: 0.95rem;
  }

  @media (max-width: 600px) {
    .combo-content {
      flex-direction: column;
      align-items: flex-start;
    }
    .combo-actions {
      width: 100%;
      justify-content: flex-end;
      margin-top: 10px;
    }
  }

  @media (max-width: 480px) {
    .edit-name-input {
      max-width: 140px;
    }
  }
</style>
