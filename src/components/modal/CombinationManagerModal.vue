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

        <AppScrollbar class="combinations-list">
          <div v-if="savedCombinations.length === 0" class="empty-state">
            {{ t('combinationManager.emptyList') }}
          </div>

          <div v-for="(combo, index) in savedCombinations" :key="combo.id" class="combination-card">
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
                  <button class="btn-skew btn-text btn-blue" @click="saveRename(combo.id)"><span>OK</span></button>
                  <button class="btn-skew btn-text btn-gray" @click="cancelRename"><span>X</span></button>
                </div>
                <div v-else class="combo-name">{{ combo.name }}</div>
              </div>
              <button v-if="editingId !== combo.id" class="btn-icon-circular" @click="startRename(combo)">
                <img :src="PencilIcon" :alt="t('combinationManager.rename')" draggable="false" />
              </button>
            </div>

            <div class="combo-content">
              <AppScrollbar class="student-preview-scroll">
                <div class="student-preview-list">
                  <div v-for="studentId in combo.studentIds" :key="studentId" class="student-avatar-container">
                    <ImageWithLoader
                      :src="getAvatarUrl(studentId, getStudentForm(studentId))"
                      class="student-avatar"
                      :lazy="false"
                    />
                  </div>
                </div>
              </AppScrollbar>

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
    </template>
  </BaseModal>
</template>

<script setup>
  import { ref, computed, toRefs, nextTick } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseModal from '@components/ui/BaseModal.vue'
  import AppScrollbar from '@/components/ui/AppScrollbar.vue'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import PencilIcon from '@assets/icon/pencil.svg'

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
  const { saveCombination, updateCombination, deleteCombination, getStudentForm } = studentStore

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

  const handleOverwrite = (combo) => {
    if (selectedStudentIds.value.length === 0) return
    if (confirm(t('combinationManager.confirmOverwrite'))) {
      updateCombination(combo.id, undefined, selectedStudentIds.value)
    }
  }

  const handleDelete = (combo) => {
    if (confirm(t('combinationManager.confirmDelete'))) {
      deleteCombination(combo.id)
    }
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
      if (trimmed.length > 20) {
        alert(t('combinationManager.nameTooLong'))
        return
      }
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
    background-color: #e9eef3;
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

  .combinations-list {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 10px;
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
    background: linear-gradient(to bottom, #f0f4f8, #ffffff);
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
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    max-width: 250px;
  }

  .dark-mode .edit-name-input {
    background-color: #1f3048;
    color: #e0e6ed;
    border-color: #2a4a6e;
  }

  .btn-icon-circular {
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .dark-mode .btn-icon-circular {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .btn-icon-circular img {
    width: 16px;
    height: 16px;
    filter: invert(0.3);
  }

  .dark-mode .btn-icon-circular img {
    filter: invert(0.8);
  }

  .combo-content {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 15px;
  }

  .student-preview-scroll {
    flex-grow: 1;
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
    }
  }
</style>
