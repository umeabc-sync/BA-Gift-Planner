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

    function setLastSyncedData(dataStr) {
      lastSyncedDataStr.value = dataStr
    }

    function setLastSyncTime(time) {
      lastSyncTimeRaw.value = time ? new Date(time).toISOString() : null
    }

    function setSyncMetadata(dataStr, serverTimestamp) {
      lastSyncedDataStr.value = dataStr
      lastServerTimestamp.value = serverTimestamp
      lastSyncTimeRaw.value = serverTimestamp ? new Date(serverTimestamp + ' UTC').toISOString() : null
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
      setLastSyncedData,
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
