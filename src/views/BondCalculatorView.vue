<template>
  <div class="bond-calculator-view">
    <GiftInventoryGrid @open-modal="isInventoryModalVisible = true" />
    <StudentBondSection @open-modal="openBondModal" />
    <GiftInventoryModal :is-visible="isInventoryModalVisible" @close="isInventoryModalVisible = false" />
    <StudentBondModal
      :is-visible="isBondModalVisible"
      :student="selectedStudentForBondEdit"
      @close="isBondModalVisible = false"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import GiftInventoryGrid from '@components/section/GiftInventoryGrid.vue'
  import GiftInventoryModal from '@components/modal/GiftInventoryModal.vue'
  import StudentBondSection from '@components/section/StudentBondSection.vue'
  import StudentBondModal from '@components/modal/StudentBondModal.vue'

  const isInventoryModalVisible = ref(false)
  const isBondModalVisible = ref(false)
  const selectedStudentForBondEdit = ref(null)

  const openBondModal = (student) => {
    selectedStudentForBondEdit.value = student
    isBondModalVisible.value = true
  }
</script>

<style scoped>
  .bond-calculator-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
</style>
