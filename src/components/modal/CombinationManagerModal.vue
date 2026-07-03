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
                <button v-if="editingId !== combo.id" class="btn-skew btn-icon-solid" @click="startRename(combo)">
                  <PencilIcon class="pencil-icon" draggable="false" />
                </button>
              </div>

              <div class="combo-content">
                <div class="student-preview-list" :ref="(el) => setPreviewListRef(el, combo.id)">
                  <div
                    v-for="studentId in combo.studentIds.slice(0, getMaxAvatars(combo.id))"
                    :key="studentId"
                    class="student-avatar-skew-wrapper"
                    @click="openStudentPreview(combo)"
                  >
                    <div class="student-avatar-skew-frame">
                      <ImageWithLoader
                        :src="getAvatarUrl(studentId, getStudentForm(studentId))"
                        class="student-avatar-large"
                        :lazy="false"
                      />
                    </div>
                  </div>
                  <div
                    v-if="combo.studentIds.length > getMaxAvatars(combo.id)"
                    class="more-students-indicator"
                    @click="openStudentPreview(combo)"
                  >
                    <span class="more-count">+{{ combo.studentIds.length - getMaxAvatars(combo.id) }}</span>
                  </div>
                </div>

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

  <BaseDialog
    :is-visible="isPreviewModalOpen"
    :title="previewComboName"
    :show-cancel="false"
    max-width="520px"
    @ok="closePreviewModal"
    @close="closePreviewModal"
  >
    <div class="preview-modal-body">
      <div v-for="studentId in previewStudentIds" :key="studentId" class="preview-avatar-skew-wrapper">
        <div class="preview-avatar-skew-frame">
          <ImageWithLoader
            :src="getAvatarUrl(studentId, getStudentForm(studentId))"
            class="student-avatar-large"
            :lazy="false"
          />
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup>
  import { ref, computed, toRefs, nextTick, reactive, onBeforeUnmount } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseModal from '@components/ui/BaseModal.vue'
  import BaseDialog from '@components/ui/BaseDialog.vue'
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

  const isPreviewModalOpen = ref(false)
  const previewStudentIds = ref([])
  const previewComboName = ref('')

  const openStudentPreview = (combo) => {
    previewStudentIds.value = combo.studentIds
    previewComboName.value = combo.name
    isPreviewModalOpen.value = true
  }

  const closePreviewModal = () => {
    isPreviewModalOpen.value = false
    previewStudentIds.value = []
    previewComboName.value = ''
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

  // --- Dynamic avatar count based on container width ---
  // Avatar size: 44px frame + 4px gap = 48px per avatar, plus the "more" indicator
  const AVATAR_SLOT_WIDTH = 52 // px per avatar slot (frame 44px + gap 4px + skew visual bleed)
  const MORE_INDICATOR_WIDTH = 52 // px reserved for "+N" indicator
  const MIN_AVATARS = 2

  // Map: combo.id -> maxAvatars count
  const maxAvatarsMap = reactive({})
  // Map: combo.id -> ResizeObserver
  const observersMap = {}

  const getMaxAvatars = (comboId) => {
    return maxAvatarsMap[comboId] ?? 5
  }

  const computeMaxAvatars = (containerWidth, comboId) => {
    const combo = savedCombinations.value.find((c) => c.id === comboId)
    if (!combo) return
    const totalStudents = combo.studentIds.length
    // Available width for avatars (reserve space for more-indicator if needed)
    const availableForAvatars = containerWidth - MORE_INDICATOR_WIDTH
    const fitCount = Math.max(MIN_AVATARS, Math.floor(availableForAvatars / AVATAR_SLOT_WIDTH))
    // If all students fit without needing a more indicator, use the full width
    const allFitCount = Math.floor(containerWidth / AVATAR_SLOT_WIDTH)
    maxAvatarsMap[comboId] = totalStudents <= allFitCount ? allFitCount : fitCount
  }

  const setPreviewListRef = (el, comboId) => {
    if (!el) {
      // element unmounted - disconnect observer
      if (observersMap[comboId]) {
        observersMap[comboId].disconnect()
        delete observersMap[comboId]
      }
      return
    }

    // If already observing this element, skip
    if (observersMap[comboId]) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        computeMaxAvatars(width, comboId)
      }
    })
    observer.observe(el)
    observersMap[comboId] = observer
    // Compute immediately with current width
    computeMaxAvatars(el.offsetWidth, comboId)
  }

  onBeforeUnmount(() => {
    for (const observer of Object.values(observersMap)) {
      observer.disconnect()
    }
  })
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

  .pencil-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%) skew(8deg);
    width: 15px;
    height: 15px;
    fill: #2d4663;
    pointer-events: none;
  }

  .combo-content {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 15px;
  }

  /* ====================================================
     Student Preview List (inside card)
     ==================================================== */
  .student-preview-list {
    display: flex;
    gap: 4px;
    flex-grow: 1;
    align-items: center;
    min-width: 0;
    /* Use padding + margin trick so skew bleed and hover translateY aren't clipped */
    overflow: visible;
    padding: 4px 5px 2px;
    margin: -4px -5px -2px;
  }

  /* Skewed avatar frame — matches the btn-skew style of the game */
  .student-avatar-skew-wrapper {
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .student-avatar-skew-wrapper:hover {
    transform: translateY(-3px);
  }

  .student-avatar-skew-frame {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    overflow: hidden;
    transform: skew(-8deg);
    border: 2px solid #466398;
    background: linear-gradient(135deg, #d5f2fc, #ffffff);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .dark-mode .student-avatar-skew-frame {
    border-color: #00a4e4;
    background: linear-gradient(135deg, #0d1f2d, #1a2b40);
  }

  .student-avatar-large {
    width: 100%;
    height: 100%;
    transform: skew(8deg) scale(1.15);
    transform-origin: center center;
    display: block;
  }

  /* "+N more" indicator — also skewed to match */
  .more-students-indicator {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 6px;
    transform: skew(-8deg);
    background: #cdcfd2;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s,
      transform 0.2s;
  }

  .more-students-indicator:hover {
    transform: skew(-8deg) translateY(-3px);
  }

  .more-count {
    display: inline-block;
    transform: skew(8deg);
    font-weight: bold;
    font-size: 0.8rem;
    color: #314665;
  }

  .dark-mode .more-students-indicator {
    background: #2a3f5c;
    color: #e0e6ed;
  }

  .dark-mode .more-count {
    color: #e0f4ff;
  }

  /* ====================================================
     Preview Dialog Body
     ==================================================== */
  .preview-modal-body {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    padding: 6px;
    max-height: 55vh;
    overflow-y: auto;
  }

  .preview-avatar-skew-wrapper {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .preview-avatar-skew-wrapper:hover {
    transform: translateY(-3px);
  }

  .preview-avatar-skew-frame {
    width: 64px;
    height: 64px;
    border-radius: 6px;
    overflow: hidden;
    transform: skew(-8deg);
    border: 2px solid #466398;
    background: linear-gradient(135deg, #d5f2fc, #ffffff);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .dark-mode .preview-avatar-skew-frame {
    border-color: #00a4e4;
    background: linear-gradient(135deg, #0d1f2d, #1a2b40);
  }

  .preview-avatar-skew-frame .student-avatar-large {
    transform: skew(8deg) scale(1.15);
    transform-origin: center center;
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
    .student-preview-list {
      width: 100%;
    }
  }
</style>
