<template>
  <BaseStudentSelectionModal
    :is-modal-open="isModalOpen"
    :students-data="selectedStudents"
    selection-mode="single"
    :exclude-filters="['collection']"
    :always-show-reset-filters="true"
    :hide-reset-selection="true"
    @close-modal="$emit('closeModal')"
    @select-student="$emit('selectStudent', $event)"
  />
</template>

<script setup>
  import BaseStudentSelectionModal from './BaseStudentSelectionModal.vue'

  defineProps({
    isModalOpen: Boolean,
    selectedStudents: Array,
  })

  defineEmits(['closeModal', 'selectStudent'])
</script>
