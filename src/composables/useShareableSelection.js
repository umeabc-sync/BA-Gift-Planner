import { computed, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import pako from 'pako'
import { useModalStore } from '@/store/modal'

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
    const maxIdInStore = Math.max(...allIds)

    const unselectedStudentIds = allIds.filter((id) => !selectedStudentIds.value.includes(id))

    const useUnselected = selectedStudentIds.value.length > unselectedStudentIds.length
    const idsToEncode = useUnselected ? unselectedStudentIds : selectedStudentIds.value

    const flag = useUnselected ? 2 : 1
    const bitfieldSize = Math.floor(maxIdInStore / 8) + 1
    const buffer = new ArrayBuffer(1 + 2 + bitfieldSize)
    const view = new DataView(buffer)

    view.setUint8(0, flag)
    view.setUint16(1, maxIdInStore, true) // little-endian

    const bitfield = new Uint8Array(buffer, 3)
    for (const id of idsToEncode) {
      const byteIndex = Math.floor(id / 8)
      const bitIndex = id % 8
      if (byteIndex < bitfieldSize) {
        bitfield[byteIndex] |= 1 << bitIndex
      }
    }

    const compressed = pako.deflateRaw(new Uint8Array(buffer))
    const binaryString = String.fromCharCode.apply(null, compressed)
    return btoa(binaryString)
  })

  const decodeUrlParam = (param) => {
    const binaryString = atob(param)
    const compressed = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i)
    }
    const decompressed = pako.inflateRaw(compressed)
    const view = new DataView(decompressed.buffer)
    const flag = view.getUint8(0)
    const maxIdInUrl = view.getUint16(1, true)
    const bitfield = new Uint8Array(decompressed.buffer, 3)

    const idsFromBitfield = []
    for (let i = 1; i <= maxIdInUrl; i++) {
      const byteIndex = Math.floor(i / 8)
      const bitIndex = i % 8
      if ((bitfield[byteIndex] >> bitIndex) & 1) {
        idsFromBitfield.push(i)
      }
    }

    if (flag === 1) {
      return idsFromBitfield
    } else if (flag === 2) {
      const allIdsInUrl = Array.from({ length: maxIdInUrl }, (_, i) => i + 1)
      return allIdsInUrl.filter((id) => !idsFromBitfield.includes(id))
    }
    return []
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
