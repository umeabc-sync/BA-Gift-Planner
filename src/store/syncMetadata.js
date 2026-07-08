import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSyncMetadataStore = defineStore(
  'syncMetadata',
  () => {
    const lastSyncedDataStr = ref(null)
    const lastServerTimestamp = ref(null)
    const lastSyncTimeRaw = ref(null)

    const lastSyncTime = computed(() => {
      return lastSyncTimeRaw.value ? new Date(lastSyncTimeRaw.value) : null
    })

    function setLastSyncTime(time) {
      lastSyncTimeRaw.value = time ? new Date(time).toISOString() : null
    }

    function setSyncMetadata(dataStr, serverTimestamp) {
      lastSyncedDataStr.value = dataStr
      lastServerTimestamp.value = serverTimestamp
      // Normalize 'YYYY-MM-DD HH:MM:SS' to 'YYYY-MM-DDTHH:MM:SSZ' for Safari compatibility
      lastSyncTimeRaw.value = serverTimestamp ? new Date(serverTimestamp.replace(' ', 'T') + 'Z').toISOString() : null
    }

    function clearMetadata() {
      lastSyncedDataStr.value = null
      lastServerTimestamp.value = null
      lastSyncTimeRaw.value = null
    }

    return {
      lastSyncedDataStr,
      lastServerTimestamp,
      lastSyncTimeRaw,
      lastSyncTime,
      setLastSyncTime,
      setSyncMetadata,
      clearMetadata,
    }
  },
  {
    persist: {
      pick: ['lastSyncedDataStr', 'lastServerTimestamp', 'lastSyncTimeRaw'],
    },
  }
)
