<template>
  <div class="bond-calculator-view">
    <GiftInventoryGrid :synthesis-gifts="synthesisGifts" @open-modal="isInventoryModalVisible = true" />
    <GiftPlannerActions />
    <StudentBondSection @open-modal="openBondModal" />
    <GiftInventoryModal :show="isInventoryModalVisible" @close="isInventoryModalVisible = false" />
    <StudentBondModal
      :is-visible="isBondModalVisible"
      :student="selectedStudentForBondEdit"
      @close="isBondModalVisible = false"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import GiftInventoryGrid from '@components/section/GiftInventoryGrid.vue'
  import GiftInventoryModal from '@components/modal/GiftInventoryModal.vue'
  import StudentBondSection from '@components/section/StudentBondSection.vue'
  import StudentBondModal from '@components/modal/StudentBondModal.vue'
  import GiftPlannerActions from '@components/section/GiftPlannerActions.vue'
  import { useGiftStore } from '@store/gift'

  const isInventoryModalVisible = ref(false)
  const isBondModalVisible = ref(false)
  const selectedStudentForBondEdit = ref(null)

  const giftStore = useGiftStore()
  const { synthesisGifts } = storeToRefs(giftStore)

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
