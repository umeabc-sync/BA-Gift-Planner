import { watch, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStudentStore } from '@/store/student'
import { useGiftStore } from '@/store/gift'
import { useGiftPlannerStore } from '@/store/giftPlanner'
import { useSettingStore } from '@/store/setting'
import pako from 'pako'

export function useCloudSync() {
  const studentStore = useStudentStore()
  const giftStore = useGiftStore()
  const giftPlannerStore = useGiftPlannerStore()
  const settingStore = useSettingStore()

  const isSyncing = ref(false)
  const lastSyncTime = ref(null)
  const user = ref(null)

  let syncTimeout = null

  // 1. 初始化檢查登入狀態並下載初始存檔
  const initSync = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      user.value = data.user
      
      if (user.value) {
        await downloadSave()
      }
    } catch (e) {
      console.error('Failed to init sync:', e)
    }
  }

  // 2. 下載存檔
  const downloadSave = async () => {
    try {
      isSyncing.value = true
      const res = await fetch('/api/sync/download')
      if (res.ok) {
        const data = await res.json()
        if (data.payload) {
          // 解壓縮 Base64 payload
          const binaryString = atob(data.payload)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const decompressed = pako.inflate(bytes, { to: 'string' })
          
          // 檢查雲端資料是否與本地完全相同，相同就不用做任何事
          const currentPayloadStr = JSON.stringify({
            student: localStorage.getItem('student'),
            gift: localStorage.getItem('gift'),
            giftPlanner: localStorage.getItem('giftPlanner'),
            setting: localStorage.getItem('setting')
          })
          if (decompressed === currentPayloadStr) {
            return
          }

          const parsed = JSON.parse(decompressed)

          // 標記正在從雲端同步，避免觸發自動上傳
          isSyncing.value = true

          // 直接將資料覆寫進 Pinia Store (畫面會即時更新，不需要重新整理！)
          if (parsed.student) studentStore.$patch(JSON.parse(parsed.student))
          if (parsed.gift) giftStore.$patch(JSON.parse(parsed.gift))
          if (parsed.giftPlanner) giftPlannerStore.$patch(JSON.parse(parsed.giftPlanner))
          if (parsed.setting) settingStore.$patch(JSON.parse(parsed.setting))
        }
      }
    } catch (e) {
      console.error('Failed to download save:', e)
    } finally {
      // 稍微延遲解除同步狀態，避免 watch 抓到剛才的變更
      setTimeout(() => {
        isSyncing.value = false
      }, 500)
    }
  }

  // 3. 上傳存檔
  const uploadSave = async () => {
    if (!user.value) return

    try {
      isSyncing.value = true
      // 收集 LocalStorage 裡目前的 state
      const payloadObj = {
        student: localStorage.getItem('student'),
        gift: localStorage.getItem('gift'),
        giftPlanner: localStorage.getItem('giftPlanner'),
        setting: localStorage.getItem('setting')
      }

      // 壓縮
      const jsonString = JSON.stringify(payloadObj)
      const compressedBytes = pako.deflate(jsonString)
      let binaryString = ''
      for (let i = 0; i < compressedBytes.length; i++) {
        binaryString += String.fromCharCode(compressedBytes[i])
      }
      const base64Payload = btoa(binaryString)

      // 傳送
      await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: base64Payload })
      })

      lastSyncTime.value = new Date()
    } catch (e) {
      console.error('Failed to upload save:', e)
    } finally {
      isSyncing.value = false
    }
  }

  // 4. 設定防抖 (Debounce) 的監聽器
  const triggerAutoSync = () => {
    if (!user.value || isSyncing.value) return
    if (syncTimeout) clearTimeout(syncTimeout)
    
    // 使用者停止動作 3 秒後自動上傳
    syncTimeout = setTimeout(() => {
      uploadSave()
    }, 3000)
  }

  // 監聽所有 Store 的變化
  watch(
    () => [studentStore.$state, giftStore.$state, giftPlannerStore.$state, settingStore.$state],
    () => {
      triggerAutoSync()
    },
    { deep: true }
  )

  onMounted(() => {
    initSync()
  })

  return {
    user,
    isSyncing,
    lastSyncTime,
    uploadSave,
    downloadSave
  }
}
