<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="700px">
    <template #header>
      <div class="modal-title">{{ t('bondGapCalculator.title') }}</div>
    </template>
    <template #body>
      <div class="gap-calculator-body">
        <div v-if="student" class="student-info">
            <img :src="getAvatarUrl(student.id)" class="student-avatar" />
            <h3>{{ t(`student.name.${student.id}`) }}</h3>
        </div>

        <div class="target-level-setter">
            <label for="target-level-input">{{ t('bondGapCalculator.setTargetLevel') }}</label>
            <input id="target-level-input" type="number" v-model.number="targetLevel" min="1" max="100" />
        </div>

        <div class="results-grid" :class="{ 'single-column': !calculations.after }">
            <!-- Before Gift Column -->
            <div class="result-column" v-if="calculations.before">
                <h4 class="column-header">{{ t('bondGapCalculator.beforeGift') }}</h4>
                <div class="result-card">
                    <p>{{ t('bondGapCalculator.levelGap') }}: <span>{{ calculations.before.levelGap }}</span></p>
                    <p>{{ t('bondGapCalculator.expGap') }}: <span>{{ calculations.before.expGap.toLocaleString() }}</span></p>
                </div>
                <div class="action-list">
                    <h5>{{ t('bondGapCalculator.actionsNeeded') }}</h5>
                    <ul v-if="calculations.before.expGap > 0">
                        <li>{{ t('bondGapCalculator.dormInteraction') }}: <span>{{ calculations.before.actions.dorm }}</span></li>
                        <li>{{ t('bondGapCalculator.schedule') }}: <span>{{ calculations.before.actions.schedule }}</span></li>
                        <li v-for="pref in studentGiftPreferences.sr" :key="`before-sr-${pref}`">
                            SR (+{{ pref }}): <span>{{ calculations.before.actions[`sr_${pref}`] }}</span>
                        </li>
                        <li v-for="pref in studentGiftPreferences.ssr" :key="`before-ssr-${pref}`">
                            SSR (+{{ pref }}): <span>{{ calculations.before.actions[`ssr_${pref}`] }}</span>
                        </li>
                    </ul>
                    <p v-else class="no-actions-needed">{{ t('bondGapCalculator.noActionsNeeded') }}</p>
                </div>
            </div>

            <!-- After Gift Column -->
            <div class="result-column" v-if="calculations.after">
                <h4 class="column-header">{{ t('bondGapCalculator.afterGift') }}</h4>
                <div class="result-card">
                    <p>{{ t('bondGapCalculator.levelGap') }}: <span>{{ calculations.after.levelGap }}</span></p>
                    <p>{{ t('bondGapCalculator.expGap') }}: <span>{{ calculations.after.expGap.toLocaleString() }}</span></p>
                </div>
                 <div class="action-list">
                    <h5>{{ t('bondGapCalculator.actionsNeeded') }}</h5>
                    <ul v-if="calculations.after.expGap > 0">
                        <li>{{ t('bondGapCalculator.dormInteraction') }}: <span>{{ calculations.after.actions.dorm }}</span></li>
                        <li>{{ t('bondGapCalculator.schedule') }}: <span>{{ calculations.after.actions.schedule }}</span></li>
                        <li v-for="pref in studentGiftPreferences.sr" :key="`after-sr-${pref}`">
                            SR (+{{ pref }}): <span>{{ calculations.after.actions[`sr_${pref}`] }}</span>
                        </li>
                        <li v-for="pref in studentGiftPreferences.ssr" :key="`after-ssr-${pref}`">
                            SSR (+{{ pref }}): <span>{{ calculations.after.actions[`ssr_${pref}`] }}</span>
                        </li>
                    </ul>
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
import { useGiftStore } from '@/store/gift'
import { useBondExpData } from '@/utils/fetchBondExpData'
import { useSrGiftData } from '@/utils/fetchSrGiftData'
import { useSsrGiftData } from '@/utils/fetchSsrGiftData'
import { getPreferenceValue } from '@/utils/getPreferenceValue'
import BaseModal from '@components/ui/BaseModal.vue'
import { getAvatarUrl } from '@/utils/getAvatarUrl'

const { t, currentLocale: locale } = useI18n()

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

const giftPlannerStore = useGiftPlannerStore()
const { allGifts } = storeToRefs(giftPlannerStore)

const { data: srGifts } = useSrGiftData(locale)
const { data: ssrGifts } = useSsrGiftData(locale)

const { data: bondExpTable } = useBondExpData()
const targetLevel = ref(null)

watch([student, bondExpTable], ([newStudent, newTable]) => {
    if (newStudent && newTable && newTable.length > 0) {
        const currentLevel = newStudent.bondLevel
        const maxLevel = newTable.length > 0 ? newTable[newTable.length - 1].Level : 100
        targetLevel.value = Math.min(currentLevel + 1, maxLevel)
    }
}, { immediate: true })

const getTotalExpForLevel = (level) => {
  if (!bondExpTable.value.length || level <= 1) return 0
  const levelData = bondExpTable.value.find(item => item.Level === level)
  return levelData ? levelData.TotalEXP : 0
}

const getLevelFromExp = (totalExp) => {
    if (!bondExpTable.value.length) return { level: 1, remainingExp: totalExp }
    
    let level = 1
    let remainingExp = totalExp

    // Find the highest level that the totalExp can reach
    for (let i = bondExpTable.value.length - 1; i >= 0; i--) {
        if (totalExp >= bondExpTable.value[i].TotalEXP) {
            level = bondExpTable.value[i].Level
            remainingExp = totalExp - bondExpTable.value[i].TotalEXP
            break;
        }
    }
    
    // If totalExp is less than any entry, it must be level 1 with that exp
    if (level === 1 && totalExp < bondExpTable.value[0].TotalEXP) {
        return { level: 1, remainingExp: totalExp };
    }

    return { level, remainingExp }
}


const expFromPlannedGifts = computed(() => {
    if (!student.value || !allGifts.value) return 0
    
    const studentAssignments = giftPlannerStore.getStudentAssignments(student.value.id)
    if (!studentAssignments || Object.keys(studentAssignments).length === 0) return 0

    let gainedExp = 0
    for (const giftKey in studentAssignments) {
        const quantity = studentAssignments[giftKey]
        const [rarity, idStr] = giftKey.split('-')
        const giftId = parseInt(idStr)
        const isSsr = rarity === 'ssr'

        const gift = allGifts.value.find((g) => g.id === giftId && g.isSsr === isSsr)
        if (!gift) continue
        
        const expPerGift = getPreferenceValue(student.value, gift)
        gainedExp += expPerGift * quantity
    }
    return gainedExp
})

const studentGiftPreferences = computed(() => {
    if (!student.value || !srGifts.value || !ssrGifts.value) return { sr: [], ssr: [] }

    const srPrefs = srGifts.value.map(gift => getPreferenceValue(student.value, gift))
    const ssrPrefs = ssrGifts.value.map(gift => getPreferenceValue(student.value, gift))
    
    return {
        sr: [...new Set(srPrefs)].sort((a,b) => b-a),
        ssr: [...new Set(ssrPrefs)].sort((a,b) => b-a),
    }
})

const beforeGiftState = computed(() => {
    if (!student.value) return null
    const currentLevel = student.value.bondLevel
    const currentExp = student.value.bondExp
    const totalCurrentExp = getTotalExpForLevel(currentLevel) + currentExp
    return {
        level: currentLevel,
        exp: currentExp,
        totalExp: totalCurrentExp
    }
})

const afterGiftState = computed(() => {
    if (!beforeGiftState.value || expFromPlannedGifts.value === 0) return null
    const totalAfterGiftExp = beforeGiftState.value.totalExp + expFromPlannedGifts.value
    const { level, remainingExp } = getLevelFromExp(totalAfterGiftExp)
    return {
        level: level,
        exp: remainingExp,
        totalExp: totalAfterGiftExp
    }
})


const calculations = computed(() => {
    if (!targetLevel.value || !student.value || !bondExpTable.value.length) return { before: null, after: null }
    
    const maxLevel = bondExpTable.value[bondExpTable.value.length - 1].Level;
    if(targetLevel.value > maxLevel) targetLevel.value = maxLevel;
    if(targetLevel.value < student.value.bondLevel) targetLevel.value = student.value.bondLevel;


    const totalTargetExp = getTotalExpForLevel(targetLevel.value)

    const calculateGaps = (state) => {
        if (!state || targetLevel.value <= state.level) return { levelGap: 0, expGap: 0, actions: {} }
        
        const expGap = totalTargetExp - state.totalExp
        if(expGap <= 0) return { levelGap: targetLevel.value - state.level, expGap: 0, actions: {} }

        const actions = {
            dorm: Math.ceil(expGap / 15),
            schedule: Math.ceil(expGap / 31.25),
        }
        
        studentGiftPreferences.value.sr.forEach(pref => {
            if (pref > 0) actions[`sr_${pref}`] = Math.ceil(expGap / pref)
        })
        studentGiftPreferences.value.ssr.forEach(pref => {
            if (pref > 0) actions[`ssr_${pref}`] = Math.ceil(expGap / pref)
        })

        return {
            levelGap: targetLevel.value - state.level,
            expGap,
            actions
        }
    }

    return {
        before: calculateGaps(beforeGiftState.value),
        after: afterGiftState.value ? calculateGaps(afterGiftState.value) : null
    }
})

</script>

<style scoped>
.gap-calculator-body {
  padding: 20px;
  background: #f0f4f8;
}
.dark-mode .gap-calculator-body {
    background: #1a2b40;
}

.modal-title {
  user-select: none;
}

.student-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
}
.dark-mode .student-info {
    background: #223d5a;
}

.student-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.student-info h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #314665;
}
.dark-mode .student-info h3 {
    color: #e0f4ff;
}

.target-level-setter {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.target-level-setter label {
    font-weight: bold;
    font-size: 1.1rem;
}

#target-level-input {
    width: 80px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
    text-align: center;
    font-size: 1.1rem;
}

.results-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.result-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.column-header {
    text-align: center;
    font-size: 1.2rem;
    padding-bottom: 10px;
    border-bottom: 2px solid #a8bacc;
    margin: 0 0 10px 0;
}
.dark-mode .column-header {
    border-bottom-color: #3a5a7a;
}

.result-card, .action-list {
    background: #fff;
    padding: 15px;
    border-radius: 8px;
}
.dark-mode .result-card, .dark-mode .action-list {
    background: #223d5a;
}

.result-card p {
    margin: 0 0 10px 0;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
}
.result-card p span {
    font-weight: bold;
}

.action-list h5 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    text-align: center;
}

.action-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-list li {
    display: flex;
    justify-content: space-between;
}
.action-list li span {
    font-weight: bold;
}
</style>
