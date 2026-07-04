import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import {
  getLocalStatePayload,
  compressSaveData,
  decompressSaveData,
  applySaveDataToStores,
  isSyncPayloadEqual,
} from '@/utils/saveManager'
import { getSyncStores } from '@/config/syncStores'
import { useSyncMetadataStore } from '@/store/syncMetadata'

const DEBOUNCE_THRESHOLD = 15000 // 15 seconds
const THROTTLE_THRESHOLD = 1000 * 60 * 5 // 5 minutes

// Shared state (Singleton pattern)
const isSyncing = ref(false)
const user = ref(null)
let syncTimeout = null
let isInitialized = false

export function useCloudSync() {
  const stores = getSyncStores()
  const syncMetadataStore = useSyncMetadataStore()
  const { lastSyncTime, lastSyncedDataStr, lastServerTimestamp } = storeToRefs(syncMetadataStore)

  const { addToast } = useToast()
  const { t } = useI18n()

  const clearSession = () => {
    user.value = null
    syncMetadataStore.clearMetadata()
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Failed to logout:', e)
    } finally {
      clearSession()
    }
  }

  const initSync = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      user.value = data.user

      if (user.value) await downloadSave()
    } catch (e) {
      console.error('Failed to init sync:', e)
    }
  }

  const downloadSave = async (isAuto = false) => {
    try {
      isSyncing.value = true // Lock to prevent auto sync from being triggered

      const url = lastServerTimestamp.value
        ? `/api/sync/download?last_known_timestamp=${encodeURIComponent(lastServerTimestamp.value)}`
        : '/api/sync/download'

      const res = await fetch(url)

      if (res.status === 401) {
        clearSession()
        addToast(t('cloudSync.sessionExpired'), 'error')
        return
      }

      // 304 Not Modified: Exit early, cloud matches local timestamp
      if (res.status === 304) {
        syncMetadataStore.setLastSyncTime(new Date())
        return
      }

      if (!res.ok) {
        addToast(t('cloudSync.downloadFailed'), 'error')
        return
      }

      const data = await res.json()
      if (!data.payload) return

      const cloudTimestamp = data.updated_at

      // Safety fallback check (in case 304 request was not triggered but timestamps match)
      if (cloudTimestamp && cloudTimestamp === lastServerTimestamp.value) {
        syncMetadataStore.setLastSyncTime(new Date())
        return
      }

      const decompressed = decompressSaveData(data.payload)
      const cloudPayload = JSON.parse(decompressed)
      const cloudDataStr = JSON.stringify(cloudPayload)

      const localPayload = getLocalStatePayload()

      // If data is already identical to local state, just align timestamps
      if (isSyncPayloadEqual(localPayload, cloudPayload)) {
        syncMetadataStore.setSyncMetadata(cloudDataStr, cloudTimestamp)
        return
      }

      // Cloud always wins — apply cloud data unconditionally
      const preserveShared = new URLSearchParams(window.location.search).has('s')
      applySaveDataToStores(decompressed, preserveShared)

      syncMetadataStore.setSyncMetadata(cloudDataStr, cloudTimestamp)

      // Clear any pending upload since we just aligned with the cloud
      if (syncTimeout) {
        clearTimeout(syncTimeout)
        syncTimeout = null
      }

      if (isAuto) {
        addToast(t('cloudSync.autoSynced'), 'success')
      }
    } catch (e) {
      console.error('Failed to download save:', e)
    } finally {
      isSyncing.value = false
    }
  }

  const uploadSave = async () => {
    if (!user.value) return

    try {
      isSyncing.value = true
      const payloadObj = getLocalStatePayload()
      const currentDataStr = JSON.stringify(payloadObj)
      let lastSyncedPayload = null
      try {
        lastSyncedPayload = lastSyncedDataStr.value ? JSON.parse(lastSyncedDataStr.value) : null
      } catch (e) {
        console.error('Failed to parse last synced data string:', e)
      }

      // Prevent redundant network requests if payload is identical
      if (isSyncPayloadEqual(payloadObj, lastSyncedPayload)) {
        isSyncing.value = false
        return
      }

      const base64Payload = compressSaveData(payloadObj)

      const res = await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: base64Payload,
          last_known_timestamp: lastServerTimestamp.value,
        }),
        keepalive: true,
      })

      if (res.status === 401) {
        clearSession()
        addToast(t('cloudSync.uploadSessionExpired'), 'error')
        return
      }

      // Conflict handling (409) — Alert the user and load the latest cloud save
      if (res.status === 409) {
        const conflictData = await res.json()
        if (conflictData.payload) {
          const decompressed = decompressSaveData(conflictData.payload)
          const cloudPayload = JSON.parse(decompressed)
          const cloudDataStr = JSON.stringify(cloudPayload)

          const preserveShared = new URLSearchParams(window.location.search).has('s')
          applySaveDataToStores(decompressed, preserveShared)

          syncMetadataStore.setSyncMetadata(cloudDataStr, conflictData.updated_at)

          if (syncTimeout) {
            clearTimeout(syncTimeout)
            syncTimeout = null
          }

          // Show Conflict Resolved Toast Warning
          addToast(t('cloudSync.conflictDetected'), 'warning')
        }
        return
      }

      if (!res.ok) {
        addToast(t('cloudSync.uploadFailed'), 'error')
        return
      }

      const resData = await res.json()
      syncMetadataStore.setSyncMetadata(currentDataStr, resData.updated_at)
    } catch (e) {
      console.error('Failed to upload save:', e)
      addToast(t('cloudSync.networkError'), 'error')
    } finally {
      isSyncing.value = false
    }
  }

  const triggerAutoSync = () => {
    if (!user.value || isSyncing.value) return
    if (syncTimeout) clearTimeout(syncTimeout)

    syncTimeout = setTimeout(() => {
      syncTimeout = null
      uploadSave()
    }, DEBOUNCE_THRESHOLD)
  }

  const flushSync = () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
      syncTimeout = null
      uploadSave()
    }
  }

  const triggerAutoDownload = () => {
    if (!user.value || isSyncing.value) return
    const now = new Date()
    if (lastSyncTime.value && now - lastSyncTime.value < THROTTLE_THRESHOLD) {
      return // Throttle: skip check if synced less than 5 minutes ago
    }
    downloadSave(true)
  }

  if (!isInitialized) {
    // Use Pinia $subscribe instead of the expensive deep watch
    Object.values(stores).forEach((store) => {
      store.$subscribe(() => {
        if (!isSyncing.value) {
          triggerAutoSync()
        }
      })
    })

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushSync()
      } else if (document.visibilityState === 'visible') {
        triggerAutoDownload()
      }
    })
    window.addEventListener('focus', () => {
      triggerAutoDownload()
    })

    // Let App.vue call initSync() directly
    isInitialized = true
  }

  return { user, isSyncing, lastSyncTime, uploadSave, downloadSave, initSync, logout }
}
