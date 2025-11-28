import { ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'

const modalStack = ref([])

/**
 * A centralized manager for modal stacking and global escape key handling.
 * This manager ONLY handles the stack logic and ESC key. DOM manipulation is left to the individual modals
 * to ensure compatibility with other libraries like OverlayScrollbars.
 */

// Global listener for the Escape key.
onKeyStroke(
  'Escape',
  (e) => {
    // If there are any modals open
    if (modalStack.value.length > 0) {
      e.preventDefault()
      // Get the modal at the top of the stack.
      const topModal = modalStack.value[modalStack.value.length - 1]
      // Call its close function if it exists.
      if (topModal && topModal.close) {
        topModal.close()
      }
    }
  },
  { target: window, eventName: 'keydown' }
)

// A simple counter to generate unique IDs for each modal instance.
let nextModalId = 0

export const useModalManager = {
  /**
   * Registers a modal instance with the manager.
   * @param {Function} closeFn The function to call to close this modal.
   * @returns {number} A unique ID for the registered modal.
   */
  register(closeFn) {
    const id = nextModalId++
    modalStack.value.push({ id, close: closeFn })
    return id
  },

  /**
   * Unregisters a modal instance from the manager.
   * @param {number} id The unique ID of the modal to unregister.
   */
  unregister(id) {
    const index = modalStack.value.findIndex((modal) => modal.id === id)
    if (index > -1) {
      modalStack.value.splice(index, 1)
    }
  },

  /**
   * Returns the current number of active modals.
   * @returns {number}
   */
  getModalCount() {
    return modalStack.value.length
  },
}
