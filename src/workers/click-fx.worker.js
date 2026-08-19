import { BAClickFX } from 'ba-click-fx'

let fx = null

self.onmessage = (e) => {
  const { type, ...data } = e.data

  switch (type) {
    case 'INIT': {
      const { canvas, width, height, dpr, options } = data
      fx = new BAClickFX({
        target: canvas,
        inputSource: 'manual',
        maxDpr: dpr || 1,
        clickEnabled: true,
        trailEnabled: true,
        scale: 0.75,
        clickTimeScale: 1.5,
        trailTimeScale: 1.5,
        ...options,
      })
      fx.resize(width, height, dpr)
      break
    }

    case 'RESIZE': {
      fx?.resize(data.width, data.height, data.dpr)
      break
    }

    case 'POINTER_DOWN': {
      fx?.pointerDown({
        x: data.x,
        y: data.y,
        pointerId: data.pointerId ?? 1,
        pointerType: data.pointerType ?? 'mouse',
      })
      break
    }

    case 'POINTER_MOVE': {
      fx?.pointerMove({
        x: data.x,
        y: data.y,
        pointerId: data.pointerId ?? 1,
        pointerType: data.pointerType ?? 'mouse',
      })
      break
    }

    case 'POINTER_UP': {
      fx?.pointerUp(data.pointerId ?? 1)
      break
    }

    case 'POINTER_CANCEL': {
      fx?.pointerCancel(data.pointerId ?? 1)
      break
    }

    case 'PAUSE': {
      fx?.setPaused(data.paused, { clear: data.clear })
      break
    }

    case 'UPDATE_CONFIG': {
      fx?.updateConfig(data.config)
      break
    }

    case 'DESTROY': {
      fx?.destroy()
      fx = null
      break
    }
  }
}
