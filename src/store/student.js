import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStudentData } from '@/utils/fetchStudentData'
import { useShareableSelection } from '@/composables/useShareableSelection'

export const useStudentStore = defineStore('student', () => {
  const { data: studentsData } = useStudentData()

  const selectedStudentIds = ref([])

  const selectedStudents = computed(() => {
    if (!studentsData.value) return []
    return selectedStudentIds.value.map((id) => studentsData.value.find((s) => s.id === id)).filter(Boolean)
  })

  function toggleStudent(student) {
    const index = selectedStudentIds.value.findIndex((id) => id === student.id)
    if (index > -1) {
      selectedStudentIds.value.splice(index, 1)
    } else {
      selectedStudentIds.value.push(student.id)
    }
  }

  function resetSelection() {
    selectedStudentIds.value = []
  }

  return {
    studentsData,
    selectedStudentIds,
    selectedStudents,
    toggleStudent,
    resetSelection,
  }
}, { persist: true })
