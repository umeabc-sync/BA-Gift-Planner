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
                :src="getAssetsFile('icon/bond_heart.webp')"
                class="bond-heart-image"
                object-fit="contain"
                loader-type="pulse"
                :inherit-background="false"
              />
              <span class="bond-level-text" :class="{ 'level-up': bondStatus(student.id).levelUp }">
                {{ bondStatus(student.id).displayLevel }}
              </span>
            </div>
          </div>
          <div class="bond-exp-bar-container">
            <div class="bond-exp-bar">
              <div
                class="bond-exp-progress-preview"
                :class="{ flash: bondStatus(student.id).gainedExp > 0 }"
                :style="{ width: `${bondStatus(student.id).newExpPercentage}%` }"
              ></div>
              <div
                class="bond-exp-progress"
                :style="{ width: `${bondStatus(student.id).originalExpPercentage}%` }"
              ></div>
              <div class="bond-exp-text">
                {{ bondStatus(student.id).displayExp }} / {{ bondStatus(student.id).displayMaxExp }}
              </div>
            </div>
          </div>
        </div>
        <button class="icon-btn" @click="openGiftModal(student)">
          <component :is="GiftIcon" alt="Give Gift" draggable="false" />
        </button>
      </div>
    </div>
    <GiftGivingModal :show="isGiftModalOpen" :student="giftingStudent" @close="closeGiftModal" />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { storeToRefs } from 'pinia'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { useBondExpData } from '@/utils/fetchBondExpData'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import GiftGivingModal from '@components/modal/GiftGivingModal.vue'
  import GiftIcon from '@assets/icon/gift_icon.svg'
import { getAssetsFile } from '@/utils/getAssetsFile'

  const studentStore = useStudentStore()
  const { selectedStudents } = storeToRefs(studentStore)
  const { getStudentBondData } = studentStore

  const giftPlannerStore = useGiftPlannerStore()

  const { data: bondExpTable } = useBondExpData()

  const emit = defineEmits(['open-modal'])

  const isGiftModalOpen = ref(false)
  const giftingStudent = ref(null)

  const openGiftModal = (student) => {
    giftingStudent.value = student
    isGiftModalOpen.value = true
  }

  const closeGiftModal = () => {
    isGiftModalOpen.value = false
  }

  const openEditModal = (student) => {
    emit('open-modal', student)
  }

  const maxExpForLevel = (level) => {
    if (!bondExpTable.value) return 0
    const rankInfo = bondExpTable.value.find((r) => r.rank === level)
    return rankInfo ? rankInfo.exp : 0
  }

  const bondStatus = computed(() => (studentId) => {
    const preview = giftPlannerStore.calculatePreviewBond(studentId)

    const originalMaxExp = maxExpForLevel(preview.level)
    const newMaxExp = maxExpForLevel(preview.newLevel)

    return {
      levelUp: preview.newLevel > preview.level,
      displayLevel: preview.newLevel,
      displayExp: preview.newExp,
      displayMaxExp: newMaxExp,
      gainedExp: preview.gainedExp,
      originalExpPercentage: preview.newLevel > preview.level ? 0 : (preview.exp / originalMaxExp) * 100,
      newExpPercentage: (preview.newExp / newMaxExp) * 100,
    }
  })
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

  .icon-btn {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
    border: none;
    color: #314665;
    fill: #314665;
    cursor: pointer;
    border-radius: 12px;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
  }

  .icon-btn:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .icon-btn:active {
    transform: scale(0.95) skew(-8deg);
  }

  .dark-mode .icon-btn {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
    fill: #e0f4ff;
  }

  .icon-btn svg {
    width: 24px;
    height: 24px;
    transform: skew(8deg);
  }

  .bond-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-right: 20px;
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
    transition: color 0.3s ease;
  }

  .bond-level-text.level-up {
    color: #ffdf00;
    animation: level-up-glow 1.5s infinite;
  }

  .bond-exp-bar-container {
    flex-grow: 1;
  }

  .bond-exp-bar {
    height: 30px;
    background: #c7c7c7;
    border: 2px solid #ef6dbd;
    border-radius: 4px;
    transform: skew(-10deg);
    position: relative;
    overflow: hidden;
  }

  .bond-exp-progress {
    background: #ffbed8;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: width 0.5s ease-in-out;
  }

  .bond-exp-progress-preview {
    background: #a8ffc5;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: width 0.5s ease-in-out;
  }

  .bond-exp-progress-preview.flash {
    animation: flash 1.5s infinite;
  }

  .bond-exp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) skew(10deg);
    color: #fff;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  }

  @keyframes level-up-glow {
    0%,
    100% {
      text-shadow:
        0 0 5px #fff,
        0 0 10px #ffdf00,
        0 0 15px #ffdf00;
    }
    50% {
      text-shadow:
        0 0 10px #fff,
        0 0 20px #ffdf00,
        0 0 30px #ffdf00;
    }
  }

  @keyframes flash {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
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
