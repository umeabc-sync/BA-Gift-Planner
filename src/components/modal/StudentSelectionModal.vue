<template>
  <BaseStudentSelectionModal
    :is-modal-open="isModalOpen"
    :students-data="studentsData"
    :selected-students="selectedStudents"
    @close-modal="$emit('closeModal')"
    @toggle-student="$emit('toggleStudent', $event)"
  />
</template>

<script setup>
  import BaseStudentSelectionModal from './BaseStudentSelectionModal.vue'

  defineProps({
    isModalOpen: Boolean,
    studentsData: Array,
    selectedStudents: Array,
  })

  defineEmits(['closeModal', 'toggleStudent'])
</script>
