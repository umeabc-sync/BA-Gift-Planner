<template>
  <div v-if="selectedStudents.length > 0" class="student-bond-section">
    <div class="mode-toggle-header">
      <div class="mode-toggles-container">
        <button class="btn-skew btn-text btn-blue" @click="isSingleMode = !isSingleMode">
          <span>{{ isSingleMode ? t('bondCalculator.listMode') : t('bondCalculator.singleMode') }}</span>
        </button>
        <button
          class="btn-skew btn-text btn-blue"
          @click="giftPlannerStore.bondProgressMode = giftPlannerStore.bondProgressMode === 'level' ? 'target' : 'level'"
        >
          <span>{{ giftPlannerStore.bondProgressMode === 'level' ? t('bondCalculator.targetProgress') : t('bondCalculator.levelProgress') }}</span>
        </button>
      </div>
      <transition name="fade">
        <button
          v-if="isSingleMode"
          class="btn-skew btn-text btn-yellow switch-student-btn"
          @click="openGapModal(displayedStudents[0])"
        >
          <span>{{ t('bondGapCalculator.title') }}</span>
        </button>
      </transition>
    </div>

    <transition name="list-fade" mode="out-in">
      <div :key="isSingleMode ? displayedStudents[0]?.id || 'single' : 'list'" class="student-list-container">
        <div
          v-for="student in displayedStudents"
          :key="student.id"
          class="student-row"
          :class="{ 'single-mode-row': isSingleMode }"
        >
          <div
            class="student-island"
            :class="{ 'single-island': isSingleMode }"
            @click="isSingleMode ? (isSingleStudentModalOpen = true) : openGapModal(student)"
          >
            <div class="avatar-wrapper">
              <ImageWithLoader
                :src="getAvatarUrl(student.id, studentStore.getStudentForm(student.id))"
                class="student-avatar-img"
              />
              <div v-if="isSingleMode" class="avatar-overlay">
                <SwitchStudentIcon class="overlay-icon" />
                <span class="overlay-text">{{ t('bondCalculator.clickToSwitch') }}</span>
              </div>
            </div>
            <div v-if="hasActiveTarget(student.id)" class="avatar-target-badge">
              🎯{{ studentStore.getStudentBondData(student.id)?.target }}
            </div>
          </div>
          <div class="bond-island" :class="{ 'single-bond-island': isSingleMode }">
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
                <div class="bond-exp-bar" :class="{ 'no-target-bar': bondStatus(student.id).noTarget }">
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
                    <span v-if="bondStatus(student.id).displayMaxExp !== null">
                      {{ bondStatus(student.id).displayExp }} / {{ bondStatus(student.id).displayMaxExp }}
                    </span>
                    <span v-else>
                      {{ bondStatus(student.id).displayExp }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button class="btn-skew btn-icon btn-blue" @click="openGiftModal(student)">
              <component :is="GiftIcon" alt="Give Gift" draggable="false" />
            </button>
          </div>
        </div>
      </div>
    </transition>
    <GiftGivingModal :show="isGiftModalOpen" :student="giftingStudent" @close="closeGiftModal" />
    <BondGapCalculatorModal
      :is-visible="isGapModalVisible"
      :student="selectedStudentForGap"
      @close="isGapModalVisible = false"
    />
    <SelectedStudentSelectionModal
      :is-modal-open="isSingleStudentModalOpen"
      :selected-students="selectedStudents"
      @close-modal="isSingleStudentModalOpen = false"
      @select-student="handleSelectSingleStudent"
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
  import { getTotalExpForLevel as getGlobalTotalExpForLevel } from '@/utils/bondExpHelpers'
  import { useI18n } from '@composables/useI18n'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import GiftGivingModal from '@components/modal/GiftGivingModal.vue'
  import BondGapCalculatorModal from '@components/modal/BondGapCalculatorModal.vue'
  import SelectedStudentSelectionModal from '@components/modal/SelectedStudentSelectionModal.vue'
  import GiftIcon from '@assets/icon/gift_icon.svg'
  import SwitchStudentIcon from '@assets/icon/switch_student.svg'
  import { getAssetsFile } from '@/utils/getAssetsFile'
  import { useSettingStore } from '@/store/setting'

  const studentStore = useStudentStore()
  const { selectedStudents } = storeToRefs(studentStore)

  const giftPlannerStore = useGiftPlannerStore()

  const settingStore = useSettingStore()
  const { useVibrantProgressBar: isVibrantProgressBarEnabled } = storeToRefs(settingStore)

  const { t } = useI18n()

  const { data: bondExpTable } = useBondExpData()

  const emit = defineEmits(['open-modal'])

  const isGiftModalOpen = ref(false)
  const giftingStudent = ref(null)

  const isGapModalVisible = ref(false)
  const selectedStudentForGap = ref(null)

  const { isSingleMode, currentSingleStudentId } = storeToRefs(giftPlannerStore)
  const isSingleStudentModalOpen = ref(false)

  const displayedStudents = computed(() => {
    if (!isSingleMode.value) return selectedStudents.value
    if (selectedStudents.value.length === 0) return []

    let singleStudent = selectedStudents.value.find((s) => s.id === currentSingleStudentId.value)
    if (!singleStudent) {
      singleStudent = selectedStudents.value[0]
    }
    return [singleStudent]
  })

  const handleSelectSingleStudent = (student) => {
    currentSingleStudentId.value = student.id
    isSingleStudentModalOpen.value = false
  }

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

  const getTotalExpForLevel = (level) => getGlobalTotalExpForLevel(level, bondExpTable.value)

  const bondStatus = computed(() => (studentId) => {
    const preview = giftPlannerStore.calculatePreviewBond(studentId)
    const target = studentStore.getStudentBondData(studentId)?.target

    if (giftPlannerStore.bondProgressMode === 'target') {
      if (!target) {
        return {
          levelUp: false,
          displayLevel: preview.newLevel,
          displayExp: t('bondCalculator.noTargetSet'),
          displayMaxExp: null,
          gainedExp: 0,
          originalExpPercentage: 0,
          newExpPercentage: 0,
          hasTarget: false,
          noTarget: true,
        }
      }

      const targetTotal = getTotalExpForLevel(target)
      const currentTotal = getTotalExpForLevel(preview.level) + preview.exp
      const newTotal = getTotalExpForLevel(preview.newLevel) + preview.newExp

      const originalExpPercentage = targetTotal > 0 ? Math.min(100, (currentTotal / targetTotal) * 100) : 0
      const newExpPercentage = targetTotal > 0 ? Math.min(100, (newTotal / targetTotal) * 100) : 0

      const displayExpText = `${originalExpPercentage.toFixed(1)}%` + (preview.gainedExp > 0 ? ` ➔ ${newExpPercentage.toFixed(1)}%` : '')

      return {
        levelUp: preview.newLevel > preview.level,
        displayLevel: preview.newLevel,
        displayExp: displayExpText,
        displayMaxExp: null,
        gainedExp: preview.gainedExp,
        originalExpPercentage,
        newExpPercentage,
        hasTarget: true,
        noTarget: false,
      }
    }

    // Default 'level' mode
    const originalMaxExp = maxExpForLevel(preview.level)
    const newMaxExp = maxExpForLevel(preview.newLevel)

    if (preview.newLevel === 100) {
      return {
        levelUp: preview.newLevel > preview.level,
        displayLevel: preview.newLevel,
        displayExp: '--',
        displayMaxExp: '--',
        gainedExp: preview.gainedExp,
        originalExpPercentage: preview.newLevel > preview.level ? 0 : 100,
        newExpPercentage: 100,
        hasTarget: false,
        noTarget: false,
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
      hasTarget: false,
      noTarget: false,
    }
  })

  const hasActiveTarget = computed(() => (studentId) => {
    const bond = studentStore.getStudentBondData(studentId)
    return bond?.target && bond.target > bond.level
  })
</script>

<style scoped>
  .student-bond-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .student-list-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .list-fade-enter-active,
  .list-fade-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .list-fade-enter-from,
  .list-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
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
    overflow: visible;
    transition: border-color 0.3s ease;
  }

  .avatar-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    display: grid;
    place-items: center;
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
    user-select: none;
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
    user-select: none;
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

  .mode-toggle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }



  .switch-student-btn {
    padding: 8px 16px;
    height: 38px;
    font-size: 0.95rem;
  }

  /* Single Mode Adjustments */
  .single-mode-row {
    flex-direction: column;
    align-items: center;
    gap: 30px;
    padding: 20px 0;
  }

  .single-island {
    width: 150px;
    height: 150px;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
    z-index: 10;
  }

  .student-island:hover .avatar-overlay {
    opacity: 1;
  }

  .overlay-icon {
    margin-bottom: 5px;
    width: 48px;
    height: 48px;
  }

  .overlay-text {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    user-select: none;
  }

  .single-bond-island {
    width: 100%;
    max-width: 600px;
    padding: 30px;
    gap: 30px;
  }

  .single-bond-island .bond-heart-image-wrapper {
    width: 80px;
    height: 80px;
  }

  .single-bond-island .bond-level-text {
    font-size: 32px;
  }

  .single-bond-island .bond-exp-bar {
    height: 40px;
  }

  .single-bond-island .bond-exp-text {
    font-size: 18px;
  }

  @media (max-width: 768px) {
    .mode-toggle-header {
      flex-direction: column;
      gap: 10px;
    }



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

    .btn-skew {
      width: 38px;
      height: 38px;
    }

    .btn-skew.switch-student-btn {
      width: 100%;
      height: auto;
      min-height: 38px;
    }

    .btn-skew svg {
      width: 20px;
      height: 20px;
    }
  }

  .mode-toggles-container {
    display: flex;
    gap: 15px;
  }

  .mode-toggles-container button {
    padding: 8px 16px;
    height: 38px;
    font-size: 0.95rem;
    min-width: 100px;
  }

  .avatar-target-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: linear-gradient(135deg, #ff6b8b 0%, #ff4b6e 100%);
    color: white;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 5;
    white-space: nowrap;
    pointer-events: none;
  }

  .dark-mode .avatar-target-badge {
    border-color: #1a2b40;
  }

  .bond-exp-bar.no-target-bar {
    border-color: #9cb2cd;
  }
  .dark-mode .bond-exp-bar.no-target-bar {
    border-color: #5c7289;
  }
  .bond-exp-bar.no-target-bar .bond-exp-text {
    text-shadow:
      -1px -1px 0 #9cb2cd,
      1px -1px 0 #9cb2cd,
      -1px 1px 0 #9cb2cd,
      1px 1px 0 #9cb2cd,
      0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .dark-mode .bond-exp-bar.no-target-bar .bond-exp-text {
    text-shadow:
      -1px -1px 0 #5c7289,
      1px -1px 0 #5c7289,
      -1px 1px 0 #5c7289,
      1px 1px 0 #5c7289,
      0 2px 4px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    .mode-toggles-container {
      width: 100%;
      gap: 10px;
    }
    .mode-toggles-container button {
      flex: 1;
      width: auto;
    }
  }
</style>
