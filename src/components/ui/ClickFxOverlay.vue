<script setup>
  import { watch, onMounted, onUnmounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { BAClickFX } from 'ba-click-fx'
  import { useSettingStore } from '@/store/setting'

  const settingStore = useSettingStore()
  const { enableClickFx } = storeToRefs(settingStore)

  let fx = null

  const initFx = () => {
    if (fx || !enableClickFx.value) return
    fx = new BAClickFX({
      useWorker: true,
      scale: 0.75,
      clickTimeScale: 1.5,
      trailTimeScale: 1.5,
      maxDpr: 2,
    })
  }

  const destroyFx = () => {
    if (fx) {
      fx.destroy()
      fx = null
    }
  }

  watch(enableClickFx, (enabled) => {
    if (enabled) {
      initFx()
    } else {
      destroyFx()
    }
  })

  onMounted(() => {
    if (enableClickFx.value) {
      initFx()
    }
  })

  onUnmounted(() => {
    destroyFx()
  })
</script>

<template>
  <!-- BAClickFX 搭配 useWorker 會自動在 Web Worker 建立 OffscreenCanvas 覆蓋層並掛載至 DOM -->
</template>
