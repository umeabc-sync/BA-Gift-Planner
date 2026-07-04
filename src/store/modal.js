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

  const isCombinationManagerModalOpen = ref(false)

  function openCombinationManagerModal() {
    isCombinationManagerModalOpen.value = true
  }

  function closeCombinationManagerModal() {
    isCombinationManagerModalOpen.value = false
  }

  const isSharedCombinationPromptModalOpen = ref(false)
  const sharedCombinationData = ref(null)

  function openSharedCombinationPromptModal(studentIds) {
    sharedCombinationData.value = studentIds
    isSharedCombinationPromptModalOpen.value = true
  }

  function closeSharedCombinationPromptModal() {
    isSharedCombinationPromptModalOpen.value = false
    sharedCombinationData.value = null
  }

  return {
    isStudentSelectionModalOpen,
    isSettingsModalOpen,
    isShareModalOpen,
    isCombinationManagerModalOpen,
    isSharedCombinationPromptModalOpen,
    sharedCombinationData,
    openStudentSelectionModal,
    closeStudentSelectionModal,
    openSettingsModal,
    closeSettingsModal,
    openShareModal,
    closeShareModal,
    openCombinationManagerModal,
    closeCombinationManagerModal,
    openSharedCombinationPromptModal,
    closeSharedCombinationPromptModal,
  }
})
