import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGiftStore } from './gift'
import { useStudentStore } from './student'
import { useSettingStore } from './setting'
import { storeToRefs } from 'pinia'
import { useBondExpData } from '@/utils/fetchBondExpData'
import { useStudentData } from '@/utils/fetchStudentData'
import { useSrGiftData } from '@/utils/fetchSrGiftData'
import { useSsrGiftData } from '@/utils/fetchSsrGiftData'
import { getPreferenceValue } from '@/utils/getPreferenceValue'

export const useGiftPlannerStore = defineStore(
  'giftPlanner',
  () => {
    // State
    const assignments = ref({}) // { studentId: { giftKey: quantity } }

    // Stores
    const giftStore = useGiftStore()
    const studentStore = useStudentStore()
    const settingStore = useSettingStore()
    const { locale } = storeToRefs(settingStore)
    const { data: bondExpTable } = useBondExpData()
    const { data: studentsData } = useStudentData()
    const { data: srGifts } = useSrGiftData(locale)
    const { data: ssrGifts } = useSsrGiftData(locale)

    const allGifts = computed(() => {
      if (!srGifts.value || !ssrGifts.value) return []
      return [
        ...ssrGifts.value.map((g) => ({ ...g, isSsr: true })),
        ...srGifts.value.map((g) => ({ ...g, isSsr: false })),
      ]
    })

    // Getters
    const totalAssigned = computed(() => {
      const totals = {}
      for (const studentId in assignments.value) {
        for (const giftKey in assignments.value[studentId]) {
          if (!totals[giftKey]) {
            totals[giftKey] = 0
          }
          totals[giftKey] += assignments.value[studentId][giftKey]
        }
      }
      return totals
    })

    function getAvailableCount(giftId, isSsr) {
      const key = `${isSsr ? 'ssr' : 'sr'}-${giftId}`
      const total = giftStore.getGiftQuantity(giftId, isSsr)
      const assigned = totalAssigned.value[key] || 0
      return total - assigned
    }

    // Actions
    function setAssignment(studentId, giftId, isSsr, quantity) {
      const key = `${isSsr ? 'ssr' : 'sr'}-${giftId}`
      if (!assignments.value[studentId]) {
        assignments.value[studentId] = {}
      }

      const currentAssignment = assignments.value[studentId][key] || 0
      const otherAssignments = (totalAssigned.value[key] || 0) - currentAssignment
      const available = giftStore.getGiftQuantity(giftId, isSsr) - otherAssignments

      const newQuantity = Math.max(0, Math.min(quantity, available))

      if (newQuantity > 0) {
        assignments.value[studentId][key] = newQuantity
      } else {
        delete assignments.value[studentId][key]
        if (Object.keys(assignments.value[studentId]).length === 0) {
          delete assignments.value[studentId]
        }
      }
    }

    function clearAssignments() {
      assignments.value = {}
    }

    function clearStudentAssignments(studentId) {
      if (assignments.value[studentId]) {
        delete assignments.value[studentId]
      }
    }

    function applyAssignments() {
      if (Object.keys(assignments.value).length === 0) {
        return
      }

      // Update student bond levels
      for (const studentId in assignments.value) {
        const studentIdNum = parseInt(studentId)
        const newBond = calculatePreviewBond.value(studentIdNum)
        studentStore.updateStudentBond(studentIdNum, newBond.newLevel, newBond.newExp)
      }

      // Update gift quantities
      for (const giftKey in totalAssigned.value) {
        const quantity = totalAssigned.value[giftKey]
        const [rarity, idStr] = giftKey.split('-')
        const giftId = parseInt(idStr)
        const isSsr = rarity === 'ssr'

        const currentQuantity = giftStore.getGiftQuantity(giftId, isSsr)
        giftStore.setGiftQuantity(giftId, isSsr, currentQuantity - quantity)
      }

      clearAssignments()
    }

    const getStudentAssignments = (studentId) => {
      return assignments.value[studentId] || {}
    }

    const calculatePreviewBond = computed(() => (studentId) => {
      const student = studentsData.value?.find((s) => s.id === studentId)
      const originalBond = studentStore.getStudentBondData(studentId)
      const studentAssignments = assignments.value[studentId]

      if (!student || !studentAssignments || Object.keys(studentAssignments).length === 0 || !bondExpTable.value) {
        return { ...originalBond, gainedExp: 0, newLevel: originalBond.level, newExp: originalBond.exp }
      }

      let gainedExp = 0
      for (const giftKey in studentAssignments) {
        const quantity = studentAssignments[giftKey]
        const [rarity, idStr] = giftKey.split('-')
        const giftId = parseInt(idStr)
        const isSsr = rarity === 'ssr'

        const gift = allGifts.value.find((g) => g.id === giftId && g.isSsr === isSsr)
        if (!gift) continue

        let expPerGift = 0
        if (gift.isSpecial) {
          if (gift.id === 35 && !gift.isSsr) {
            // Gift Choice Box (SR)
            const { sr } = student.favor
            if (sr.xl.length > 0) expPerGift = 80
            else if (sr.l.length > 0) expPerGift = 60
            else if (sr.m.length > 0) expPerGift = 40
            else expPerGift = 20 // Fallback, should not happen
          } else {
            expPerGift = gift.exp
          }
        } else {
          expPerGift = getPreferenceValue(student, gift)
        }
        gainedExp += expPerGift * quantity
      }

      let currentLevel = originalBond.level
      let currentExp = originalBond.exp + gainedExp

      while (currentLevel < 100) {
        const rankInfo = bondExpTable.value.find((r) => r.rank === currentLevel)
        if (!rankInfo || rankInfo.exp === 9999) break // Max level or data not found

        if (currentExp >= rankInfo.exp) {
          currentExp -= rankInfo.exp
          currentLevel++
        } else {
          break
        }
      }

      if (currentLevel >= 100) {
        currentLevel = 100
        currentExp = 0
      }

      return {
        level: originalBond.level,
        exp: originalBond.exp,
        gainedExp,
        newLevel: currentLevel,
        newExp: currentExp,
      }
    })

    return {
      assignments,
      totalAssigned,
      getAvailableCount,
      setAssignment,
      clearAssignments,
      clearStudentAssignments,
      applyAssignments,
      getStudentAssignments,
      calculatePreviewBond,
      allGifts,
    }
  },
  { persist: true }
)
