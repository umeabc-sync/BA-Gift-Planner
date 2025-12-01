import { watch, onUnmounted } from 'vue'
import { useModalManager } from './useModalManager'

/**
 * A Composable for managing common Modal logic. It now coordinates with a central manager
 * to correctly handle stacking, background scroll-locking, and Escape key closing
 * in a way that is compatible with libraries like OverlayScrollbars.
 *
 * @param {import('vue').Ref<boolean>} isVisible - A ref that controls the visibility of the Modal.
 * @param {Function} closeFn - Function used to close the Modal.
 */
export function useModal(isVisible, closeFn) {
  // Each modal instance gets a unique ID from the manager upon registration.
  let modalId = null

  watch(isVisible, (newValue) => {
    // Apply changes to both <html> and <body> for robust cross-browser compatibility.
    const elements = [document.documentElement, document.body]

    if (newValue) {
      // --- Register with the manager ---
      if (modalId === null) {
        modalId = useModalManager.register(closeFn)
      }

      // --- Apply lock (original, proven logic) ---
      // This logic is sensitive and known to work with OverlayScrollbars.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // If a scrollbar exists, adjust the body's padding to compensate.
      if (scrollbarWidth > 0) {
        const originalPaddingRight = window.getComputedStyle(document.body).paddingRight
        // Use calc() to elegantly handle different units (e.g., px, em).
        document.body.style.paddingRight = `calc(${originalPaddingRight || '0px'} + ${scrollbarWidth}px)`
      }

      // --- Lock scrolling ---
      // Add a class to both <html> and <body> to disable scrolling.
      // The actual CSS (`overflow-y: hidden`) is defined globally in App.vue.
      elements.forEach((el) => el.classList.add('modal-open'))
    } else {
      // --- Unregister and conditionally unlock ---
      if (modalId !== null) {
        useModalManager.unregister(modalId)
        modalId = null

        // Only unlock the body if this was the LAST modal.
        if (useModalManager.getModalCount() === 0) {
          setTimeout(() => {
            elements.forEach((el) => el.classList.remove('modal-open'))
            document.body.style.paddingRight = ''
          }, 300) // Match modal transition time.
        }
      }
    }
  })

  // Ensure unregistration if the component is unmounted while still visible.
  onUnmounted(() => {
    if (modalId !== null) {
      useModalManager.unregister(modalId)
      // After unmounting, we should also check if we need to unlock.
      // This handles cases where the page is changed while a modal is open.
      if (useModalManager.getModalCount() === 0) {
        const elements = [document.documentElement, document.body]
        elements.forEach((el) => el.classList.remove('modal-open'))
        document.body.style.paddingRight = ''
      }
    }
  })
}
