<template>
  <canvas v-if="enableClickFx && isSupported" ref="canvasRef" class="click-fx-overlay" aria-hidden="true" />
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/setting'

  const settingStore = useSettingStore()
  const { enableClickFx } = storeToRefs(settingStore)

  const canvasRef = ref(null)
  let worker = null
  let isInitialized = false

  const isSupported =
    typeof HTMLCanvasElement !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype

  const handlePointerDown = (e) => {
    if (!enableClickFx.value) return
    worker?.postMessage({
      type: 'POINTER_DOWN',
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
    })
  }

  const handlePointerMove = (e) => {
    if (!enableClickFx.value) return
    worker?.postMessage({
      type: 'POINTER_MOVE',
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
    })
  }

  const handlePointerUp = (e) => {
    if (!enableClickFx.value) return
    worker?.postMessage({
      type: 'POINTER_UP',
      pointerId: e.pointerId,
    })
  }

  const handlePointerCancel = (e) => {
    if (!enableClickFx.value) return
    worker?.postMessage({
      type: 'POINTER_CANCEL',
      pointerId: e.pointerId,
    })
  }

  const handleResize = () => {
    worker?.postMessage({
      type: 'RESIZE',
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
  }

  const initWorker = () => {
    if (isInitialized || !canvasRef.value || !isSupported) return

    try {
      worker = new Worker(new URL('../../workers/click-fx.worker.js', import.meta.url), {
        type: 'module',
      })

      const offscreen = canvasRef.value.transferControlToOffscreen()

      worker.postMessage(
        {
          type: 'INIT',
          canvas: offscreen,
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
          options: {
            scale: 0.75,
            clickTimeScale: 1.5,
            trailTimeScale: 1.5,
            maxDpr: 2,
          },
        },
        [offscreen]
      )

      isInitialized = true
    } catch (err) {
      console.warn('[ClickFxOverlay] Failed to initialize OffscreenCanvas worker:', err)
    }
  }

  const destroyWorker = () => {
    if (worker) {
      worker.postMessage({ type: 'DESTROY' })
      worker.terminate()
      worker = null
    }
    isInitialized = false
  }

  onMounted(() => {
    if (enableClickFx.value) {
      initWorker()
    }

    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointercancel', handlePointerCancel, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('pointerdown', handlePointerDown)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerCancel)
    window.removeEventListener('resize', handleResize)

    destroyWorker()
  })

  watch(enableClickFx, (enabled) => {
    if (enabled) {
      if (!isInitialized) {
        // Wait for canvas element to render in DOM if it was previously v-if false
        setTimeout(initWorker, 0)
      } else {
        worker?.postMessage({ type: 'PAUSE', paused: false })
      }
    } else {
      worker?.postMessage({ type: 'PAUSE', paused: true, clear: true })
    }
  })
</script>

<style scoped>
  .click-fx-overlay {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 999999;
    will-change: transform;
    transform: translateZ(0);
    contain: strict;
  }
</style>
