import { watch } from 'vue'
import { useEscapeKey } from '@/composables/useEscapeKey.js'

/**
 * A Composable for managing common Modal logic, including closing on the Esc key and preventing the background from scrolling.
 * @param {import('vue').Ref<boolean>} isVisible - A ref that controls the visibility of the Modal.
 * @param {Function} closeFn - Function used to close the Modal.
 */
export function useModal(isVisible, closeFn) {
  useEscapeKey(isVisible, closeFn)

  // Watch for changes in the modal's visibility to lock or unlock background scrolling.
  watch(isVisible, (newValue) => {
    // Apply changes to both <html> and <body> for robust cross-browser compatibility.
    const elements = [document.documentElement, document.body]

    if (newValue) {
      // --- Prevent content shift when scrollbar is hidden ---
      // Calculate the scrollbar's width before hiding it.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // If a scrollbar exists, adjust the body's padding to compensate.
      if (scrollbarWidth > 0) {
        const originalPaddingRight = window.getComputedStyle(document.body).paddingRight
        // Use calc() to elegantly handle different units (e.g., px, em).
        document.body.style.paddingRight = `calc(${originalPaddingRight} + ${scrollbarWidth}px)`
      }

      // --- Lock scrolling ---
      // Add a class to both <html> and <body> to disable scrolling.
      // The actual CSS (`overflow-y: hidden`) is defined globally in App.vue.
      elements.forEach((el) => el.classList.add('modal-open'))
    } else {
      // --- Restore scrolling ---
      // Delay restoring scroll to ensure the modal's closing animation completes smoothly.
      setTimeout(() => {
        // Remove the class to re-enable scrolling.
        elements.forEach((el) => el.classList.remove('modal-open'))
        // Reset the padding adjustment.
        document.body.style.paddingRight = ''
      }, 300) // This duration should match the modal's transition time.
    }
  })
}
