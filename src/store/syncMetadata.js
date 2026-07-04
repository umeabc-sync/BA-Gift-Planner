import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSyncMetadataStore = defineStore(
  'syncMetadata',
  () => {
    const lastSyncedDataStr = ref(null)
    const lastSyncTime = ref(null)

    function setLastSyncedData(dataStr) {
      lastSyncedDataStr.value = dataStr
    }

    function setLastSyncTime(time) {
      lastSyncTime.value = time ? new Date(time) : null
    }

    function clearMetadata() {
      lastSyncedDataStr.value = null
      lastSyncTime.value = null
    }

    return {
      lastSyncedDataStr,
      lastSyncTime,
      setLastSyncedData,
      setLastSyncTime,
      clearMetadata,
    }
  },
  {
    persist: {
      pick: ['lastSyncedDataStr', 'lastSyncTime'],
    },
  }
)
