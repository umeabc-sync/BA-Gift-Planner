import { reactive, readonly } from 'vue'

const toasts = reactive([])

let nextId = 0

const addToast = (message, type = 'info', duration = 5000) => {
  const id = nextId++
  toasts.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

const removeToast = (id) => {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
  }
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
  }
}
