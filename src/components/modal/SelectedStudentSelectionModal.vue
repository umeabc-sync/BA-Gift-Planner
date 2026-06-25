<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isModalOpen"
        class="modal-overlay"
        :class="{ 'no-blur': disableBackgroundBlur }"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">{{ t('characterSelector.title') }}</div>
            <button class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="scrollable-section">
              <div class="student-grid modal-body-content-padding">
                <div
                  v-for="student in selectedStudents"
                  :key="student.id"
                  class="student-card"
                  @click="selectStudent(student)"
                >
                  <div v-if="isDualForm(student.id)" class="form-indicator">
                    <span class="form-dot" :class="{ active: studentStore.getStudentForm(student.id) === 0 }"></span>
                    <span class="form-dot" :class="{ active: studentStore.getStudentForm(student.id) === 1 }"></span>
                  </div>
                  <ImageWithLoader
                    :src="getAvatarUrl(student.id, studentStore.getStudentForm(student.id))"
                    class="student-avatar-large"
                  />
                  <span class="student-name">{{ t(`student.name.${student.id}`) }}</span>
                  <button
                    v-if="isDualForm(student.id)"
                    class="form-toggle-btn"
                    @click.stop="studentStore.toggleStudentForm(student.id)"
                  >
                    <component :is="FormSwitchIcon" class="form-toggle-icon" draggable="false" />
                  </button>
                </div>
                <div v-if="selectedStudents.length === 0" class="no-results">
                  {{ t('characterSelector.noResults') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { toRefs } from 'vue'
  import { useModal } from '@composables/useModal'
  import { useI18n } from '@composables/useI18n'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { useSettingStore } from '@store/setting'
  import { useStudentStore, DUAL_FORM_STUDENT_IDS } from '@store/student'
  import { storeToRefs } from 'pinia'
  import FormSwitchIcon from '@assets/icon/form_switch.svg'

  const { t } = useI18n()
  const studentStore = useStudentStore()
  const settingStore = useSettingStore()
  const { disableBackgroundBlur } = storeToRefs(settingStore)

  const props = defineProps({
    isModalOpen: Boolean,
    selectedStudents: Array,
  })

  const emit = defineEmits(['closeModal', 'selectStudent'])

  const closeModal = () => {
    emit('closeModal')
  }

  const selectStudent = (student) => {
    emit('selectStudent', student)
    closeModal()
  }
  
  const isDualForm = (studentId) => {
    return DUAL_FORM_STUDENT_IDS.includes(studentId)
  }

  const { isModalOpen: isVisible } = toRefs(props)
  useModal(isVisible, closeModal)
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

  .modal-overlay.no-blur {
    backdrop-filter: none;
  }

  .modal-content {
    background: #f8f9fa;
    border-radius: 15px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
    overflow: hidden;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    border-color: #2a4a6e;
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
  }

  .modal-header .modal-title {
    padding: 10px 0px 5px 0px;
    text-align: center;
    color: #2d4663;
    flex-grow: 0;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 5px solid #fdef66;
    user-select: none;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #223d5a, #1a2b40);
    border-bottom-color: #2a4a6e;
  }

  .dark-mode .modal-header .modal-title {
    color: #e0f4ff;
    border-bottom-color: #fdef66;
  }

  .close-button {
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
  
  .dark-mode .close-button {
    color: #e0f4ff;
  }

  .close-button:hover {
    opacity: 1;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    height: calc(80vh - 60px);
    padding-top: 20px;
  }

  .scrollable-section {
    flex-grow: 1;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, transparent, black 15px);
  }

  .modal-body-content-padding {
    padding: 0 20px;
  }

  .student-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    padding: 20px;
    background-color: #e9eef3;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.03),
      rgba(0, 0, 0, 0.03) 1px,
      transparent 1px,
      transparent 10px
    );
    border-radius: 12px;
    margin: 0 20px 20px 20px;
  }

  .dark-mode .student-grid {
    background-color: #1a2b40;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px,
      transparent 10px
    );
  }

  .student-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 12px 8px;
    border-radius: 8px;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;
    border: 2px solid transparent;
    background-color: #f8f9fa;
    user-select: none;
    position: relative;
    transform: skew(-8deg);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .dark-mode .student-card {
    background-color: #1f3048;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .student-card:hover {
    transform: translateY(-3px) skew(-8deg);
    border-color: #466398;
  }

  .dark-mode .student-card:hover {
    border-color: #00a4e4;
  }

  .student-avatar-large {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    margin-bottom: 8px;
    transition: transform 0.2s ease;
    transform: skew(8deg);
  }

  .student-avatar-large :deep(img) {
    border-radius: 50%;
    border: 3px solid #d1d8e0;
    transition: border-color 0.2s ease;
    background-color: #fff;
  }

  .dark-mode .student-avatar-large :deep(img) {
    border-color: #2a4a6e;
    background-color: #1a2b40;
  }

  .student-card:hover .student-avatar-large {
    transform: scale(1.05) skew(8deg);
  }

  .student-name {
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    color: #314665;
    transition: color 0.2s ease;
    transform: skew(8deg);
  }

  .dark-mode .student-name {
    color: #e0e6ed;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
    color: #7f8c8d;
    font-size: 1.1rem;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    border: 2px dashed #d1d8e0;
  }

  .dark-mode .no-results {
    color: #bdc3c7;
    background-color: rgba(0, 0, 0, 0.1);
    border-color: #2a4a6e;
  }

  .student-card:active {
    transform: scale(0.95) skew(-8deg);
    transition-duration: 0.1s;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .form-indicator {
    position: absolute;
    top: 6px;
    left: 6px;
    display: flex;
    gap: 4px;
    z-index: 3;
    transform: skew(8deg);
  }

  .form-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #d1d8e0;
    transition: all 0.2s ease;
  }

  .form-dot.active {
    background-color: #466398;
    box-shadow: 0 0 4px rgba(70, 99, 152, 0.5);
  }

  .dark-mode .form-dot {
    background-color: #3a5a7e;
  }

  .dark-mode .form-dot.active {
    background-color: #00a4e4;
    box-shadow: 0 0 4px rgba(0, 164, 228, 0.5);
  }

  .form-toggle-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    padding: 3px;
    border: 1.5px solid #d1d8e0;
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: skew(8deg);
    transition: all 0.2s ease;
  }

  .student-card .form-toggle-btn {
    opacity: 0;
  }

  .student-card:hover .form-toggle-btn {
    opacity: 1;
  }

  .form-toggle-icon {
    width: 14px;
    height: 14px;
    stroke: #466398;
    transition: stroke 0.2s ease;
  }

  .form-toggle-btn:hover {
    background-color: #466398;
    border-color: #466398;
    transform: skew(8deg) scale(1.1);
  }

  .form-toggle-btn:hover .form-toggle-icon {
    stroke: #fff;
  }

  .form-toggle-btn:active {
    transform: skew(8deg) scale(0.9);
  }

  .dark-mode .form-toggle-btn {
    background-color: rgba(31, 48, 72, 0.9);
    border-color: #3a5a7e;
  }

  .dark-mode .form-toggle-icon {
    stroke: #00a4e4;
  }

  .dark-mode .form-toggle-btn:hover {
    background-color: #00a4e4;
    border-color: #00a4e4;
  }

  .dark-mode .form-toggle-btn:hover .form-toggle-icon {
    stroke: #fff;
  }

  @media (max-width: 768px) {
    .student-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 12px;
      padding: 15px;
      margin: 0 15px 15px 15px;
    }

    .student-card {
      padding: 8px 6px;
    }

    .student-avatar-large {
      width: 65px;
      height: 65px;
    }

    .student-name {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .student-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
    }

    .student-avatar-large {
      width: 55px;
      height: 55px;
    }
  }
</style>
