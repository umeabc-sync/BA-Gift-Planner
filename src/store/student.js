import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStudentData } from '@/utils/fetchStudentData'
import { useGiftPlannerStore } from './giftPlanner'

export const useStudentStore = defineStore(
  'student',
  () => {
    const { data: studentsData } = useStudentData()
    const giftPlannerStore = useGiftPlannerStore()

    const selectedStudentIds = ref([])
    const studentBondData = ref({})

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
      if (!studentBondData.value[studentId]) {
        studentBondData.value[studentId] = { level: 1, exp: 0 }
      }
      return studentBondData.value[studentId]
    }

    function updateStudentBond(studentId, level, exp) {
      studentBondData.value[studentId] = { level, exp }
    }

    function resetSelection() {
      selectedStudentIds.value = []
    }

    return {
      studentsData,
      selectedStudentIds,
      selectedStudents,
      studentBondData,
      toggleStudent,
      getStudentBondData,
      updateStudentBond,
      resetSelection,
    }
  },
  { persist: true }
)
