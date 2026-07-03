import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import { getLocalStatePayload, compressSaveData, decompressSaveData, applySaveDataToStores } from '@/utils/saveManager'
import { getSyncStores } from '@/config/syncStores'

// Shared state (Singleton pattern)
const isSyncing = ref(false)
const lastSyncTime = ref(null)
const user = ref(null)
let syncTimeout = null
let isInitialized = false
let lastSyncedPayloadStr = null

export function useCloudSync() {
  const stores = getSyncStores()

  const { addToast } = useToast()
  const { t } = useI18n()

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
    let shouldUploadAfter = false
    try {
      isSyncing.value = true // Lock to prevent auto sync from being triggered
      const res = await fetch('/api/sync/download')

      if (res.status === 401) {
        user.value = null
        addToast(t('cloudSync.sessionExpired'), 'error')
        return
      }
      if (!res.ok) {
        addToast(t('cloudSync.downloadFailed'), 'error')
        return
      }

      const data = await res.json()
      if (!data.payload) return

      const decompressed = decompressSaveData(data.payload)
      const cloudPayload = JSON.parse(decompressed)
      const cloudUpdatedAt = cloudPayload.updatedAt || 0

      const localPayloadObj = getLocalStatePayload()
      const localUpdatedAt = localPayloadObj.updatedAt || 0

      // Scenario 1: Cloud save is newer than local state
      if (cloudUpdatedAt > localUpdatedAt) {
        const preserveShared = new URLSearchParams(window.location.search).has('s')
        applySaveDataToStores(decompressed, preserveShared)
        lastSyncedPayloadStr = decompressed
        lastSyncTime.value = new Date()
        if (isAuto) {
          addToast(t('cloudSync.autoSynced'), 'success')
        }
      }
      // Scenario 2: Local state is newer (e.g. offline edits or pending sync)
      else if (localUpdatedAt > cloudUpdatedAt) {
        lastSyncTime.value = new Date()
        shouldUploadAfter = true
      }
      // Scenario 3: Equal, they are in sync
      else {
        lastSyncedPayloadStr = decompressed
        lastSyncTime.value = new Date()
      }
    } catch (e) {
      console.error('Failed to download save:', e)
    } finally {
      isSyncing.value = false
    }

    if (shouldUploadAfter) {
      await uploadSave()
    }
  }

  const uploadSave = async () => {
    if (!user.value) return

    try {
      isSyncing.value = true
      const payloadObj = getLocalStatePayload()
      const jsonString = JSON.stringify(payloadObj)

      // Prevent redundant network requests if payload is identical
      if (jsonString === lastSyncedPayloadStr) {
        isSyncing.value = false
        return
      }

      const base64Payload = compressSaveData(payloadObj)

      const res = await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: base64Payload }),
        keepalive: true,
      })

      if (res.status === 401) {
        user.value = null
        addToast(t('cloudSync.uploadSessionExpired'), 'error')
        return
      }
      if (!res.ok) {
        addToast(t('cloudSync.uploadFailed'), 'error')
        return
      }

      lastSyncedPayloadStr = jsonString
      lastSyncTime.value = new Date()
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
    }, 3000)
  }

  const flushSync = () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
      syncTimeout = null
      uploadSave()
    }
  }

  const triggerAutoDownload = () => {
    if (!user.value || isSyncing.value || syncTimeout) return
    const now = new Date()
    if (lastSyncTime.value && now - lastSyncTime.value < 10000) {
      return // Throttle: skip check if synced less than 10 seconds ago
    }
    downloadSave(true)
  }

  if (!isInitialized) {
    // Use Pinia $subscribe instead of the expensive deep watch
    Object.values(stores).forEach((store) => {
      store.$subscribe(() => {
        if (!isSyncing.value) {
          localStorage.setItem('save_updated_at', Date.now().toString())
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

  return { user, isSyncing, lastSyncTime, uploadSave, downloadSave, initSync }
}
