import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useStudentData } from '@/utils/fetchStudentData'
import { useGiftPlannerStore } from './giftPlanner'
import { compressStudentIds, decompressStudentIds } from '@/utils/studentIdsCompressor'

// Students that have switchable dual forms
export const DUAL_FORM_STUDENT_IDS = [189, 264]

export const useStudentStore = defineStore(
  'student',
  () => {
    const { data: studentsData } = useStudentData()
    const giftPlannerStore = useGiftPlannerStore()

    const allStudentIdsComputed = computed(() => {
      return studentsData.value ? studentsData.value.map((s) => s.id) : []
    })

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
      const existing = studentBondData.value[studentId]
      const target = existing ? existing.target : undefined
      if (level === 1 && exp === 0 && !target) {
        delete studentBondData.value[studentId]
      } else {
        studentBondData.value[studentId] = { level, exp }
        if (target !== undefined) {
          studentBondData.value[studentId].target = target
        }
      }
    }

    function updateStudentTarget(studentId, targetLevel) {
      const existing = studentBondData.value[studentId] || { level: 1, exp: 0 }
      if (targetLevel === undefined || targetLevel === null || targetLevel === 0) {
        delete existing.target
        if (existing.level === 1 && existing.exp === 0) {
          delete studentBondData.value[studentId]
        }
      } else {
        existing.target = targetLevel
        studentBondData.value[studentId] = existing
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

    // When the async student list is fetched, filter out any invalid/deleted IDs
    watch(
      studentsData,
      (newData) => {
        if (!newData || newData.length === 0) return
        const validIds = new Set(newData.map((s) => s.id))

        // 1. Clean selectedStudentIds
        selectedStudentIds.value = selectedStudentIds.value.filter((id) => validIds.has(id))

        // 2. Clean savedCombinations
        savedCombinations.value.forEach((combo) => {
          if (Array.isArray(combo.studentIds)) {
            combo.studentIds = combo.studentIds.filter((id) => validIds.has(id))
          }
        })
      },
      { immediate: true }
    )

    return {
      studentsData,
      allStudentIds: allStudentIdsComputed,
      selectedStudentIds,
      selectedStudents,
      studentBondData,
      studentFormOverrides,
      toggleStudent,
      selectStudents,
      deselectStudents,
      getStudentBondData,
      updateStudentBond,
      updateStudentTarget,
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
      serializer: {
        serialize: (state) => {
          const copy = JSON.parse(JSON.stringify(state))
          const store = useStudentStore()
          const currentAllIds = store.allStudentIds || []

          if (Array.isArray(copy.selectedStudentIds)) {
            copy.selectedStudentIds = compressStudentIds(copy.selectedStudentIds, currentAllIds)
          }
          if (copy.savedCombinations) {
            copy.savedCombinations.forEach((combo) => {
              if (Array.isArray(combo.studentIds)) {
                combo.studentIds = compressStudentIds(combo.studentIds, currentAllIds)
              }
            })
          }
          return JSON.stringify(copy)
        },
        deserialize: (value) => {
          const state = JSON.parse(value)

          // On app mount (early deserialize), metadata is not loaded, so decompress using native bitmask fields
          if (typeof state.selectedStudentIds === 'string') {
            state.selectedStudentIds = decompressStudentIds(state.selectedStudentIds, [])
          }
          if (state.savedCombinations) {
            state.savedCombinations.forEach((combo) => {
              if (typeof combo.studentIds === 'string') {
                combo.studentIds = decompressStudentIds(combo.studentIds, [])
              }
            })
          }
          return state
        },
      },
      afterHydrate: (ctx) => {
        if (ctx.store.studentBondData) {
          for (const key in ctx.store.studentBondData) {
            const data = ctx.store.studentBondData[key]
            if (data && data.level === 1 && data.exp === 0 && !data.target) {
              delete ctx.store.studentBondData[key]
            }
          }
        }
      },
    },
  }
)
