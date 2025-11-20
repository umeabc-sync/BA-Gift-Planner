<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="750px">
    <template #header>
      <div class="modal-title">{{ t('bondGapCalculator.title') }}</div>
    </template>
    <template #body>
      <div class="bond-gap-calculator-body">
        <div v-if="student" class="calculator-header">
          <div class="student-info-wrapper">
            <img :src="getAvatarUrl(student.id)" class="student-avatar" />
            <h3>{{ t(`student.name.${student.id}`) }}</h3>
          </div>
          <div class="target-level-setter-wrapper">
            <label>{{ t('bondGapCalculator.setTargetLevel') }}</label>
            <QuantityControl
              :value="targetLevel"
              @update:value="targetLevel = $event"
              :min="minLevel"
              :max="maxLevel"
              :show-min-max="true"
              @set-min="targetLevel = minLevel"
              @set-max="targetLevel = maxLevel"
              @increment="incrementLevel"
              @decrement="decrementLevel"
            />
          </div>
        </div>

        <div class="results-grid" :class="{ 'single-column': !calculations.after }">
          <div class="result-column" v-if="calculations.before">
            <h4 class="column-header">{{ t('bondGapCalculator.beforeGift') }}</h4>
            <div class="result-card">
              <div class="stat-row">
                <span class="label">{{ t('bondGapCalculator.levelGap') }}</span>
                <span class="value highlight">{{ calculations.before.levelGap }}</span>
              </div>
              <div class="stat-row">
                <span class="label">{{ t('bondGapCalculator.expGap') }}</span>
                <span class="value">{{ calculations.before.expGap.toLocaleString() }}</span>
              </div>
            </div>
            <div class="action-section">
              <h5>{{ t('bondGapCalculator.actionsNeeded') }}</h5>
              <div v-if="calculations.before.expGap > 0" class="action-grid">
                <div class="action-item">
                  <div class="icon-placeholder">☕</div>
                  <span class="action-name">{{ t('bondGapCalculator.dormInteraction') }}</span>
                  <span class="action-count">x{{ calculations.before.actions.dorm }}</span>
                </div>
                <div class="action-item">
                  <div class="icon-placeholder">📅</div>
                  <span class="action-name">{{ t('bondGapCalculator.schedule') }}</span>
                  <span class="action-count">x{{ calculations.before.actions.schedule }}</span>
                </div>
                <div v-for="pref in studentGiftPreferences.sr" :key="`before-sr-${pref}`" class="action-item">
                  <div class="action-icon-wrapper sr">
                    <img v-if="expToTier(pref)" :src="getInteractionUrl(expToTier(pref))" class="action-icon" />
                  </div>
                  <span class="action-name">SR (+{{ pref }})</span>
                  <span class="action-count">x{{ calculations.before.actions[`sr_${pref}`] }}</span>
                </div>
                <div v-for="pref in studentGiftPreferences.ssr" :key="`before-ssr-${pref}`" class="action-item">
                  <div class="action-icon-wrapper ssr">
                    <img v-if="expToTier(pref)" :src="getInteractionUrl(expToTier(pref))" class="action-icon" />
                  </div>
                  <span class="action-name">SSR (+{{ pref }})</span>
                  <span class="action-count">x{{ calculations.before.actions[`ssr_${pref}`] }}</span>
                </div>
              </div>
              <p v-else class="no-actions-needed">{{ t('bondGapCalculator.noActionsNeeded') }}</p>
            </div>
          </div>

          <div class="result-column" v-if="calculations.after">
            <h4 class="column-header">{{ t('bondGapCalculator.afterGift') }}</h4>
            <div class="result-card">
              <div class="stat-row">
                <span class="label">{{ t('bondGapCalculator.levelGap') }}</span>
                <span class="value highlight">{{ calculations.after.levelGap }}</span>
              </div>
              <div class="stat-row">
                <span class="label">{{ t('bondGapCalculator.expGap') }}</span>
                <span class="value">{{ calculations.after.expGap.toLocaleString() }}</span>
              </div>
            </div>
            <div class="action-section">
              <h5>{{ t('bondGapCalculator.actionsNeeded') }}</h5>
              <div v-if="calculations.after.expGap > 0" class="action-grid">
                <div class="action-item">
                  <div class="icon-placeholder">☕</div>
                  <span class="action-name">{{ t('bondGapCalculator.dormInteraction') }}</span>
                  <span class="action-count">x{{ calculations.after.actions.dorm }}</span>
                </div>
                <div class="action-item">
                  <div class="icon-placeholder">📅</div>
                  <span class="action-name">{{ t('bondGapCalculator.schedule') }}</span>
                  <span class="action-count">x{{ calculations.after.actions.schedule }}</span>
                </div>
                <div v-for="pref in studentGiftPreferences.sr" :key="`after-sr-${pref}`" class="action-item">
                  <div class="action-icon-wrapper sr">
                    <img v-if="expToTier(pref)" :src="getInteractionUrl(expToTier(pref))" class="action-icon" />
                  </div>
                  <span class="action-name">SR (+{{ pref }})</span>
                  <span class="action-count">x{{ calculations.after.actions[`sr_${pref}`] }}</span>
                </div>
                <div v-for="pref in studentGiftPreferences.ssr" :key="`after-ssr-${pref}`" class="action-item">
                  <div class="action-icon-wrapper ssr">
                    <img v-if="expToTier(pref)" :src="getInteractionUrl(expToTier(pref))" class="action-icon" />
                  </div>
                  <span class="action-name">SSR (+{{ pref }})</span>
                  <span class="action-count">x{{ calculations.after.actions[`ssr_${pref}`] }}</span>
                </div>
              </div>
              <p v-else class="no-actions-needed">{{ t('bondGapCalculator.noActionsNeeded') }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { ref, computed, toRefs, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import { useGiftPlannerStore } from '@/store/giftPlanner'
  import { useStudentStore } from '@/store/student'
  import { useBondExpData } from '@/utils/fetchBondExpData'
  import { getInteractionUrl } from '@/utils/getInteractionUrl'
  import { getAvatarUrl } from '@/utils/getAvatarUrl'
  import BaseModal from '@components/ui/BaseModal.vue'
  import QuantityControl from '@components/ui/QuantityControl.vue'

  const { t } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    student: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }

  const { isVisible, student } = toRefs(props)
  useModal(isVisible, closeModal)

  const studentStore = useStudentStore()
  const giftPlannerStore = useGiftPlannerStore()
  const { allGifts } = storeToRefs(giftPlannerStore)

  const { data: bondExpTable } = useBondExpData()
  const targetLevel = ref(null)
  const initialTargetLevel = ref(null)
  const minLevel = ref(1)

  const maxLevel = computed(() =>
    bondExpTable.value && bondExpTable.value.length > 0 ? bondExpTable.value[bondExpTable.value.length - 1].rank : 100
  )

  const studentBond = computed(() => {
    if (!props.student) return { level: 1, exp: 0 }
    return studentStore.getStudentBondData(props.student.id)
  })

  watch(
    [student, bondExpTable],
    ([newStudent, newTable]) => {
      if (newStudent && newTable && newTable.length > 0) {
        const currentLevel = studentStore.getStudentBondData(newStudent.id).level
        minLevel.value = Math.min(currentLevel + 1, maxLevel.value)
        targetLevel.value = minLevel.value
        initialTargetLevel.value = minLevel
      }
    },
    { immediate: true }
  )

  const incrementLevel = () => {
    if (targetLevel.value < maxLevel.value) {
      targetLevel.value++
    }
  }
  const decrementLevel = () => {
    if (targetLevel.value > minLevel.value) {
      targetLevel.value--
    }
  }

  const expToTier = (exp) => {
    const map = {
      40: 'm',
      60: 'l',
      80: 'xl',
      120: 'l',
      180: 'l',
      240: 'xl',
    }
    return map[exp] || null
  }

  const getTotalExpForLevel = (level) => {
    if (!bondExpTable.value || !bondExpTable.value.length || level <= 1) return 0
    const levelData = bondExpTable.value.find((item) => item.rank === level)
    return levelData ? levelData.total : 0
  }

  const getLevelFromExp = (totalExp) => {
    if (!bondExpTable.value || !bondExpTable.value.length) return { level: 1, remainingExp: totalExp }

    let level = 1
    let remainingExp = totalExp

    for (let i = bondExpTable.value.length - 1; i >= 0; i--) {
      if (totalExp >= bondExpTable.value[i].total) {
        level = bondExpTable.value[i].rank
        remainingExp = totalExp - bondExpTable.value[i].total
        break
      }
    }

    if (level === 1 && totalExp < bondExpTable.value[0].total) {
      return { level: 1, remainingExp: totalExp }
    }

    return { level, remainingExp }
  }

  const expFromPlannedGifts = computed(() => {
    if (!student.value) return 0
    const preview = giftPlannerStore.calculatePreviewBond(student.value.id)
    return preview.gainedExp
  })

  const studentGiftPreferences = computed(() => {
    if (!student.value || !allGifts.value) return { sr: [], ssr: [] }

    const srPrefs = [20]
    const ssrPrefs = [120]

    const srFavorTiers = { m: 40, l: 60, xl: 80 }
    const ssrFavorTiers = { l: 180, xl: 240 }

    for (const [tier, exp] of Object.entries(srFavorTiers)) {
      if (student.value.favor.sr[tier]?.length > 0) {
        srPrefs.push(exp)
      }
    }

    for (const [tier, exp] of Object.entries(ssrFavorTiers)) {
      if (student.value.favor.ssr[tier]?.length > 0) {
        ssrPrefs.push(exp)
      }
    }

    allGifts.value.forEach((gift) => {
      if (gift.isSpecial && gift.exp > 0) {
        if (gift.isSsr) {
          ssrPrefs.push(gift.exp)
        } else {
          srPrefs.push(gift.exp)
        }
      }
    })

    return {
      sr: [...new Set(srPrefs)].sort((a, b) => a - b),
      ssr: [...new Set(ssrPrefs)].sort((a, b) => a - b),
    }
  })

  const beforeGiftState = computed(() => {
    if (!student.value || !bondExpTable.value || !bondExpTable.value.length) return null
    const currentLevel = studentBond.value.level
    const currentExp = studentBond.value.exp
    const totalCurrentExp = getTotalExpForLevel(currentLevel) + currentExp
    return {
      level: currentLevel,
      exp: currentExp,
      totalExp: totalCurrentExp,
    }
  })

  const afterGiftState = computed(() => {
    if (!beforeGiftState.value || expFromPlannedGifts.value === 0) return null
    const totalAfterGiftExp = beforeGiftState.value.totalExp + expFromPlannedGifts.value
    const { level, remainingExp } = getLevelFromExp(totalAfterGiftExp)
    return {
      level: level,
      exp: remainingExp,
      totalExp: totalAfterGiftExp,
    }
  })

  const calculations = computed(() => {
    if (!targetLevel.value || !student.value || !bondExpTable.value || !bondExpTable.value.length)
      return { before: null, after: null }

    const totalTargetExp = getTotalExpForLevel(targetLevel.value)

    const calculateGaps = (state) => {
      if (!state || targetLevel.value <= state.level) {
        return { levelGap: targetLevel.value - (state?.level ?? 0), expGap: 0, actions: {} }
      }

      const expGap = totalTargetExp - state.totalExp
      if (expGap <= 0) {
        return { levelGap: targetLevel.value - state.level, expGap: 0, actions: {} }
      }

      const actions = {
        dorm: Math.ceil(expGap / 15),
        schedule: Math.ceil(expGap / 31.25),
      }

      studentGiftPreferences.value.sr.forEach((pref) => {
        if (pref > 0) actions[`sr_${pref}`] = Math.ceil(expGap / pref)
      })
      studentGiftPreferences.value.ssr.forEach((pref) => {
        if (pref > 0) actions[`ssr_${pref}`] = Math.ceil(expGap / pref)
      })

      return {
        levelGap: targetLevel.value - state.level,
        expGap,
        actions,
      }
    }

    return {
      before: calculateGaps(beforeGiftState.value),
      after: afterGiftState.value ? calculateGaps(afterGiftState.value) : null,
    }
  })
</script>

<style scoped>
  .bond-gap-calculator-body {
    padding: 10px 20px 20px;
  }

  .calculator-header {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  .student-info-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    background: #efefef;
    padding: 10px 20px;
    border-radius: 50px;
    border: 2px solid #dee2e6;
  }
  .dark-mode .student-info-wrapper {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .student-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fdef66;
  }

  .student-info-wrapper h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .target-level-setter-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #efefef;
    padding: 15px 20px;
    border-radius: 12px;
    border: 2px solid #dee2e6;
  }
  .dark-mode .target-level-setter-wrapper {
    background: #1f3048;
    border-color: #2a4a6e;
  }
  .target-level-setter-wrapper label {
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }

  @media (min-width: 600px) {
    .calculator-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .student-info-wrapper {
      padding: 5px 15px 5px 5px;
    }
  }

  /* Main Grid */
  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 600px) {
    .results-grid {
      grid-template-columns: 1fr 1fr;
    }
    .results-grid.single-column {
      grid-template-columns: 1fr;
      max-width: 500px;
      margin: 0 auto;
    }
  }

  .result-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .column-header {
    text-align: center;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 3px solid #dee2e6;
    color: #5c7289;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .dark-mode .column-header {
    border-bottom-color: #2a4a6e;
    color: #8faecb;
  }

  .result-card,
  .action-section {
    background: #efefef;
    border-radius: 12px;
    padding: 15px;
    border: 2px solid #dee2e6;
  }

  .dark-mode .result-card,
  .dark-mode .action-section {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }
  .stat-row .label {
    font-size: 0.95rem;
    opacity: 0.8;
  }
  .stat-row .value {
    font-weight: 700;
    font-size: 1.1rem;
  }
  .stat-row .value.highlight {
    color: #e64a19;
  }
  .dark-mode .stat-row .value.highlight {
    color: #ffab91;
  }

  .action-section {
    flex-grow: 1;
  }

  .action-section h5 {
    margin: 0 0 15px 0;
    font-size: 1rem;
    text-align: center;
    opacity: 0.9;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 8px;
  }
  .dark-mode .action-section h5 {
    border-bottom-color: #2a4a6e;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 12px;
  }

  .action-item {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 8px 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    transition: transform 0.2s;
  }
  .action-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }
  .dark-mode .action-item {
    background: #1a2b40;
    border-color: #2a4a6e;
  }

  .icon-placeholder,
  .action-icon-wrapper {
    width: 40px;
    height: 40px;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
  }

  .icon-placeholder {
    background: #e2e6ea;
  }
  .dark-mode .icon-placeholder {
    background: #2a4a6e;
  }

  .action-icon-wrapper.sr {
    background-color: #c7a579;
  }
  .action-icon-wrapper.ssr {
    background-color: #9e82d6;
  }
  .dark-mode .action-icon-wrapper.sr,
  .dark-mode .action-icon-wrapper.ssr {
    background-color: #2a4a6e;
  }

  .action-icon {
    width: 90%;
    height: 90%;
    object-fit: contain;
  }

  .action-name {
    font-size: 0.75rem;
    color: #6c757d;
    line-height: 1.1;
    height: 2.2em; /* restrict to ~2 lines */
    display: flex;
    align-items: center;
  }
  .dark-mode .action-name {
    color: #aab2bd;
  }

  .action-count {
    font-weight: 700;
    font-size: 1.1rem;
    color: #2d4663;
    background: #dbe7f3;
    padding: 2px 8px;
    border-radius: 10px;
    min-width: 40px;
  }
  .dark-mode .action-count {
    color: #e0f4ff;
    background: #2a4a6e;
  }

  .no-actions-needed {
    text-align: center;
    color: #28a745;
    font-weight: bold;
    margin-top: 20px;
  }
</style>
