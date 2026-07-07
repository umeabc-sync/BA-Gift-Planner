import { computed, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import { useModalStore } from '@/store/modal'
import { compressStudentIds, decompressStudentIds } from '@/utils/studentIdsCompressor'

export function useShareableSelection(selectedStudentIds, studentsData) {
  const params = useUrlSearchParams('history')

  const selectedIdsInUrl = computed(() => {
    if (selectedStudentIds.value.length === 0) {
      return null
    }

    if (!studentsData.value || studentsData.value.length === 0) {
      return null
    }

    const allIds = studentsData.value.map((s) => s.id)
    return compressStudentIds(selectedStudentIds.value, allIds)
  })

  const decodeUrlParam = (param) => {
    const allIds = studentsData.value?.map((s) => s.id) || []
    return decompressStudentIds(param, allIds)
  }

  // Initialization: Prioritize URL > Store > Empty
  if (params.s) {
    try {
      const decodedIds = decodeUrlParam(params.s)
      if (selectedStudentIds.value.length > 0) {
        // Compare to see if they are identical
        const same =
          decodedIds.length === selectedStudentIds.value.length &&
          decodedIds.every((id) => selectedStudentIds.value.includes(id))

        if (!same) {
          const modalStore = useModalStore()
          modalStore.openSharedCombinationPromptModal(decodedIds)
        } else {
          params.s = null
        }
      } else {
        selectedStudentIds.value = decodedIds
      }
    } catch (e) {
      console.error('Failed to parse student IDs from URL on init:', e)
      params.s = null
    }
  } else if (selectedStudentIds.value.length > 0) {
    params.s = selectedIdsInUrl.value
  }

  // Watch for state changes to update URL
  watch(selectedIdsInUrl, (newVal) => {
    if (params.s !== newVal) {
      params.s = newVal
    }
  })

  // Watch for URL changes (e.g., back/forward button) to update state
  watch(
    () => params.s,
    (newVal) => {
      if (newVal === selectedIdsInUrl.value) {
        return
      }

      if (newVal) {
        try {
          const decodedIds = decodeUrlParam(newVal)
          if (selectedStudentIds.value.length > 0) {
            const same =
              decodedIds.length === selectedStudentIds.value.length &&
              decodedIds.every((id) => selectedStudentIds.value.includes(id))
            if (!same) {
              const modalStore = useModalStore()
              modalStore.openSharedCombinationPromptModal(decodedIds)
            } else {
              params.s = null
            }
          } else {
            selectedStudentIds.value = decodedIds
          }
        } catch (e) {
          console.error('Failed to parse student IDs from URL:', e)
          params.s = null
        }
      } else {
        selectedStudentIds.value = []
      }
    }
  )
}
