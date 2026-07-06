import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStudentData } from '@/utils/fetchStudentData'
import { useGiftPlannerStore } from './giftPlanner'

// Students that have switchable dual forms
export const DUAL_FORM_STUDENT_IDS = [189, 264]

export const useStudentStore = defineStore(
  'student',
  () => {
    const { data: studentsData } = useStudentData()
    const giftPlannerStore = useGiftPlannerStore()

    const selectedStudentIds = ref([])
    const studentBondData = ref({})
    const studentFormOverrides = ref({})

    const selectedStudents = computed(() => {
      if (!studentsData.value) return []
      return selectedStudentIds.value.map((id) => studentsData.value.find((s) => s.id === id)).filter(Boolean)
    })

    function toggleStudent(student) {
      const index = selectedStudentIds.value.findIndex((id) => id === student.id)
      if (index > -1) {
        selectedStudentIds.value.splice(index, 1)
        giftPlannerStore.clearStudentAssignments(student.id)
      } else {
        selectedStudentIds.value.push(student.id)
        selectedStudentIds.value.sort((a, b) => a - b)
      }
    }

    function getStudentBondData(studentId) {
      return studentBondData.value[studentId] || { level: 1, exp: 0 }
    }

    function updateStudentBond(studentId, level, exp) {
      if (level === 1 && exp === 0) {
        delete studentBondData.value[studentId]
      } else {
        studentBondData.value[studentId] = { level, exp }
      }
    }

    function getStudentForm(studentId) {
      if (DUAL_FORM_STUDENT_IDS.includes(studentId)) {
        return studentFormOverrides.value[studentId] || 0
      }
      return 0
    }

    function toggleStudentForm(studentId) {
      const current = getStudentForm(studentId)
      if (current === 0) {
        studentFormOverrides.value[studentId] = 1
      } else {
        delete studentFormOverrides.value[studentId]
      }
    }

    function resetSelection() {
      selectedStudentIds.value = []
    }

    function selectStudents(students) {
      const currentIds = new Set(selectedStudentIds.value)
      students.forEach((student) => {
        currentIds.add(student.id)
      })
      selectedStudentIds.value = Array.from(currentIds).sort((a, b) => a - b)
    }

    function deselectStudents(students) {
      const idsToRemove = new Set(students.map((student) => student.id))
      selectedStudentIds.value = selectedStudentIds.value.filter((id) => !idsToRemove.has(id))
      students.forEach((student) => {
        giftPlannerStore.clearStudentAssignments(student.id)
      })
    }

    const savedCombinations = ref([])

    function saveCombination(name, studentIds) {
      if (savedCombinations.value.length >= 10) return false
      savedCombinations.value.push({
        id: crypto.randomUUID(),
        name,
        studentIds: [...studentIds].sort((a, b) => a - b),
      })
      return true
    }

    function updateCombination(id, name, studentIds) {
      const combo = savedCombinations.value.find((c) => c.id === id)
      if (combo) {
        if (name !== undefined) combo.name = name
        if (studentIds !== undefined) combo.studentIds = [...studentIds].sort((a, b) => a - b)
      }
    }

    function deleteCombination(id) {
      savedCombinations.value = savedCombinations.value.filter((c) => c.id !== id)
    }

    return {
      studentsData,
      selectedStudentIds,
      selectedStudents,
      studentBondData,
      studentFormOverrides,
      toggleStudent,
      selectStudents,
      deselectStudents,
      getStudentBondData,
      updateStudentBond,
      getStudentForm,
      toggleStudentForm,
      resetSelection,
      savedCombinations,
      saveCombination,
      updateCombination,
      deleteCombination,
    }
  },
  {
    persist: {
      pick: ['selectedStudentIds', 'studentBondData', 'studentFormOverrides', 'savedCombinations'],
      afterHydrate: (ctx) => {
        if (ctx.store.studentBondData) {
          for (const key in ctx.store.studentBondData) {
            const data = ctx.store.studentBondData[key]
            if (data && data.level === 1 && data.exp === 0) {
              delete ctx.store.studentBondData[key]
            }
          }
        }
      },
    },
  }
)
