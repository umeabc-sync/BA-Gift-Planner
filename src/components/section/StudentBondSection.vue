<template>
  <div v-if="selectedStudents.length > 0" class="student-bond-section">
    <div v-for="student in selectedStudents" :key="student.id" class="student-row">
      <div class="student-island" @click="openEditModal(student)">
        <ImageWithLoader :src="getAvatarUrl(student.id)" class="student-avatar-img" />
      </div>
      <div class="bond-island">
        <div class="bond-info">
          <div class="bond-level-container">
            <div class="bond-heart-image-wrapper">
              <ImageWithLoader
                src="/src/assets/icon/bond_heart.png"
                class="bond-heart-image"
                object-fit="contain"
                loader-type="pulse"
                :inherit-background="false"
              />
              <span class="bond-level-text">{{ getStudentBondData(student.id).level }}</span>
            </div>
          </div>
          <div class="bond-exp-bar-container">
            <div class="bond-exp-bar">
              <div
                class="bond-exp-progress"
                :style="{ width: `${expPercentage(student.id)}%` }"
              ></div>
              <div class="bond-exp-text">
                {{ getStudentBondData(student.id).exp }} / {{ maxExpForCurrentLevel(student.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useStudentStore } from '@/store/student'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { useBondExpData } from '@/utils/fetchBondExpData'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  const { t } = useI18n()
  const studentStore = useStudentStore()
  const { selectedStudents } = storeToRefs(studentStore)
  const { getStudentBondData } = studentStore

  const { data: bondExpTable } = useBondExpData()

  const emit = defineEmits(['open-modal'])

  const openEditModal = (student) => {
    emit('open-modal', student)
  }

  const maxExpForCurrentLevel = (studentId) => {
    if (!bondExpTable.value) return 0
    const level = getStudentBondData(studentId).level
    const rankInfo = bondExpTable.value.find((r) => r.rank === level)
    return rankInfo ? rankInfo.exp : 0
  }

  const expPercentage = (studentId) => {
    const maxExp = maxExpForCurrentLevel(studentId)
    if (maxExp === 0) return 0
    return (getStudentBondData(studentId).exp / maxExp) * 100
  }
</script>

<style scoped>
  .student-bond-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }
  .student-row {
    display: flex;
    align-items: stretch;
    gap: 20px;
  }

  .student-island {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    position: relative;
    align-self: center;
    cursor: pointer;
    border: 3px solid #466398;
    background-color: #f7f7f4;
    overflow: hidden;
    transition: border-color 0.3s ease;
  }

  .dark-mode .student-island {
    border-color: #00a4e4;
    background-color: #1a2b40;
  }

  .student-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  .student-island:hover .student-avatar-img {
    transform: scale(1.1);
  }

  .student-avatar-img :deep(img) {
    border-radius: 50%;
  }

  .bond-island {
    flex: 1;
    background: #efefef;
    border-radius: 12px;
    padding: 20px;
    border: 2px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dark-mode .bond-island {
    background: #1f3048;
    color: #e0e6ed;
    border-color: #2a4a6e;
  }

  .bond-info {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-grow: 1;
  }

  .bond-level-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bond-heart-image-wrapper {
    position: relative;
    width: 60px; /* Adjust size as needed */
    height: 60px; /* Adjust size as needed */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bond-heart-image {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .bond-level-text {
    position: relative;
    font-size: 24px;
    font-weight: bold;
    color: #fff; /* Adjust color to be visible on the heart image */
    z-index: 1;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }

  .bond-exp-bar-container {
    flex-grow: 1;
  }

  .bond-exp-bar {
    height: 30px;
    background: #c7c7c7;
    border: 2px solid #ef6dbd;
    transform: skew(-20deg);
    position: relative;
    overflow: hidden;
  }

  .bond-exp-progress {
    background: #ffbed8;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }

  .bond-exp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) skew(20deg);
    color: #fff;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  }

  .edit-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #466398;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
  }

  .edit-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .edit-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .edit-button span {
    transform: skew(8deg);
  }

  .dark-mode .edit-button {
    background-color: #00a4e4;
  }

  @media (max-width: 768px) {
    .student-row {
      flex-direction: column;
      align-items: center;
    }

    .bond-island {
      width: 100%;
    }

    .bond-info {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
    }
  }
</style>
