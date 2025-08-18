import { watch, onUnmounted } from 'vue'

/**
 * A Vue composable that executes a callback when the Escape key is pressed.
 * It automatically handles adding and removing the event listener based on a reactive visibility flag.
 * @param {import('vue').Ref<boolean>} isVisibleRef - A ref that controls the visibility of the target element (e.g., a modal). The listener is only active when this is true.
 * @param {() => void} callback - The function to call when the Escape key is pressed.
 */
export function useEscapeKey(isVisibleRef, callback) {
  const handleKeyUp = (event) => {
    if (event.key === 'Escape') {
      callback()
    }
  }

  const stopWatching = watch(isVisibleRef, (isVisible) => {
    if (isVisible) {
      window.addEventListener('keyup', handleKeyUp)
    } else {
      window.removeEventListener('keyup', handleKeyUp)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('keyup', handleKeyUp)
    stopWatching()
  })
}
