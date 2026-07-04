import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSyncMetadataStore = defineStore(
  'syncMetadata',
  () => {
    const lastSyncedDataStr = ref(null)
    const lastSyncTime = ref(null)
    const lastServerTimestamp = ref(null)

    function setLastSyncedData(dataStr) {
      lastSyncedDataStr.value = dataStr
    }

    function setLastSyncTime(time) {
      lastSyncTime.value = time ? new Date(time) : null
    }

    function setSyncMetadata(dataStr, serverTimestamp) {
      lastSyncedDataStr.value = dataStr
      lastServerTimestamp.value = serverTimestamp
      lastSyncTime.value = serverTimestamp ? new Date(serverTimestamp + ' UTC') : null
    }

    function clearMetadata() {
      lastSyncedDataStr.value = null
      lastSyncTime.value = null
      lastServerTimestamp.value = null
    }

    return {
      lastSyncedDataStr,
      lastSyncTime,
      lastServerTimestamp,
      setLastSyncedData,
      setLastSyncTime,
      setSyncMetadata,
      clearMetadata,
    }
  },
  {
    persist: {
      pick: ['lastSyncedDataStr', 'lastSyncTime', 'lastServerTimestamp'],
    },
  }
)
