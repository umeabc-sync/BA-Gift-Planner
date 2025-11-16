import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const isStudentSelectionModalOpen = ref(false)
  const isSettingsModalOpen = ref(false)
  const isShareModalOpen = ref(false)

  function openStudentSelectionModal() {
    isStudentSelectionModalOpen.value = true
  }

  function closeStudentSelectionModal() {
    isStudentSelectionModalOpen.value = false
  }

  function openSettingsModal() {
    isSettingsModalOpen.value = true
  }

  function closeSettingsModal() {
    isSettingsModalOpen.value = false
  }

  function openShareModal() {
    isShareModalOpen.value = true
  }

  function closeShareModal() {
    isShareModalOpen.value = false
  }

  return {
    isStudentSelectionModalOpen,
    isSettingsModalOpen,
    isShareModalOpen,
    openStudentSelectionModal,
    closeStudentSelectionModal,
    openSettingsModal,
    closeSettingsModal,
    openShareModal,
    closeShareModal,
  }
})
