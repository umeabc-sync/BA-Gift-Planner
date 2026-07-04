<template>
  <div class="bond-calculator-view">
    <GiftPlannerActions />
    <StudentBondSection @open-modal="openBondModal" />
    <GiftInventoryGrid :synthesis-gifts="synthesisGifts" @open-modal="openInventoryModal" />
    <GiftInventoryModal v-if="hasOpenedInventory" :show="isInventoryModalVisible" @close="isInventoryModalVisible = false" />
    <StudentBondModal
      v-if="hasOpenedBondEdit"
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

  const hasOpenedInventory = ref(false)
  const hasOpenedBondEdit = ref(false)

  const giftStore = useGiftStore()
  const { synthesisGifts } = storeToRefs(giftStore)

  const openInventoryModal = () => {
    hasOpenedInventory.value = true
    isInventoryModalVisible.value = true
  }

  const openBondModal = (student) => {
    selectedStudentForBondEdit.value = student
    hasOpenedBondEdit.value = true
    isBondModalVisible.value = true
  }
</script>

<style scoped>
  .bond-calculator-view {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
</style>
