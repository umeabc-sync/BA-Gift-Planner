import { onKeyStroke } from '@vueuse/core'

/**
 * A Vue composable that executes a callback when the Escape key is pressed.
 * @param {import('vue').Ref<boolean>} isVisibleRef - A ref that controls the visibility of the target element (e.g., a modal). The listener is only active when this is true.
 * @param {() => void} callback - The function to call when the Escape key is pressed.
 */
export function useEscapeKey(isVisibleRef, callback) {
  onKeyStroke(
    'Escape',
    (e) => {
      if (isVisibleRef.value) {
        callback(e)
      }
    },
    { target: window, eventName: 'keyup' }
  )
}
