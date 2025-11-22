<template>
  <div v-if="selectedStudents.length > 0" class="student-bond-section">
    <div v-for="student in selectedStudents" :key="student.id" class="student-row">
      <div class="student-island" @click="openGapModal(student)">
        <ImageWithLoader :src="getAvatarUrl(student.id)" class="student-avatar-img" />
      </div>
      <div class="bond-island">
        <div class="bond-info" @click="openEditModal(student)">
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
                :class="{
                  flash: bondStatus(student.id).gainedExp > 0,
                  vibrant: isVibrantProgressBarEnabled,
                }"
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
    <BondGapCalculatorModal
      :is-visible="isGapModalVisible"
      :student="selectedStudentForGap"
      @close="isGapModalVisible = false"
    />
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
  import BondGapCalculatorModal from '@components/modal/BondGapCalculatorModal.vue'
  import GiftIcon from '@assets/icon/gift_icon.svg'
  import { getAssetsFile } from '@/utils/getAssetsFile'
  import { useSettingStore } from '@/store/setting'

  const studentStore = useStudentStore()
  const { selectedStudents } = storeToRefs(studentStore)

  const giftPlannerStore = useGiftPlannerStore()

  const settingStore = useSettingStore()
  const { useVibrantProgressBar: isVibrantProgressBarEnabled } = storeToRefs(settingStore)

  const { data: bondExpTable } = useBondExpData()

  const emit = defineEmits(['open-modal'])

  const isGiftModalOpen = ref(false)
  const giftingStudent = ref(null)

  const isGapModalVisible = ref(false)
  const selectedStudentForGap = ref(null)

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

  const openGapModal = (student) => {
    selectedStudentForGap.value = student
    isGapModalVisible.value = true
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

    // Handle max bond level edge case
    if (preview.newLevel === 100) {
      return {
        levelUp: preview.newLevel > preview.level,
        displayLevel: preview.newLevel,
        displayExp: '--',
        displayMaxExp: '--',
        gainedExp: preview.gainedExp,
        originalExpPercentage: preview.newLevel > preview.level
          ? 0 : 100,
        newExpPercentage: 100,
      }
    }

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

  .bond-info:hover {
    cursor: pointer;
  }

  .bond-level-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bond-heart-image-wrapper {
    position: relative;
    width: 60px;
    height: 60px;
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
    color: #fff;
    z-index: 1;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }

  .bond-level-text.level-up {
    color: #fff;
    animation: level-up-pulse 1.2s ease-in-out infinite;
  }

  .bond-exp-bar-container {
    flex-grow: 1;
  }

  .bond-exp-bar {
    height: 30px;
    background-color: #f0f0f0;
    border: 2px solid #ef6dbd;
    border-radius: 6px;
    transform: skew(-10deg);
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .dark-mode .bond-exp-bar {
    background-color: #2a3b55;
    border-color: #ef6dbd;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
  }

  .bond-exp-progress {
    background: linear-gradient(180deg, #ffcfe3 0%, #ffbed8 40%, #f09bbd 100%);
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-right: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 2px 0 5px rgba(239, 109, 189, 0.3);
    z-index: 2;
  }

  .bond-exp-progress-preview {
    /* Multiple backgrounds are used here:
        Layer 1: Striped animation (retaining semi-transparent white)
        Layer 2: Pink gradient at the bottom (copied from bond-exp-progress)
    */
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.4) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0.4) 75%,
        transparent 75%,
        transparent
      ),
      linear-gradient(180deg, #ffcfe3 0%, #ffbed8 40%, #f09bbd 100%);

    /* Set the sizes for the two background layers separately: stripes 20px, gradient 100%. */
    background-size:
      20px 20px,
      100% 100%;

    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
    opacity: 0;
  }

  .bond-exp-progress-preview.flash {
    opacity: 1;
    animation: barber-pole 1s linear infinite;
  }

  .bond-exp-progress-preview.vibrant {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.4) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0.4) 75%,
        transparent 75%,
        transparent
      ),
      linear-gradient(180deg, #adffc9 0%, #95f9b8 40%, #7df4a8 100%);
  }

  .bond-exp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) skew(10deg);
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.5px;
    text-shadow:
      -1px -1px 0 #e05ca3,
      1px -1px 0 #e05ca3,
      -1px 1px 0 #e05ca3,
      1px 1px 0 #e05ca3,
      0 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 10;
    white-space: nowrap;
  }

  @keyframes level-up-pulse {
    0%,
    100% {
      transform: scale(1);
      text-shadow:
        0 0 8px rgba(255, 255, 255, 0.8),
        0 0 15px rgba(239, 109, 189, 0.6),
        0 0 20px rgba(239, 109, 189, 0.4);
    }
    50% {
      transform: scale(1.15);
      text-shadow:
        0 0 12px rgba(255, 255, 255, 1),
        0 0 25px rgba(239, 109, 189, 0.8),
        0 0 35px rgba(239, 109, 189, 0.6),
        0 0 45px rgba(255, 207, 227, 0.4);
    }
  }

  @keyframes barber-pole {
    0% {
      background-position: 0 0;
    }
    100% {
      /* This will cause the stripes to shift, and also the gradient below, but because the gradient is vertical, the horizontal shift is not noticeable, so there is no visual problem. */
      background-position: 20px 0;
    }
  }

  @media (max-width: 768px) {
    .student-row {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .bond-island {
      width: 100%;
      padding: 12px 15px;
      gap: 10px;
    }

    .bond-info {
      flex-direction: row;
      align-items: center;
      width: auto;
      margin-right: 5px;
      gap: 10px;
    }

    .bond-heart-image-wrapper {
      width: 48px;
      height: 48px;
    }

    .bond-level-text {
      font-size: 18px;
    }

    .bond-exp-bar {
      height: 24px;
    }

    .bond-exp-text {
      font-size: 12px;
    }

    .icon-btn {
      width: 38px;
      height: 38px;
    }

    .icon-btn svg {
      width: 20px;
      height: 20px;
    }
  }
</style>
