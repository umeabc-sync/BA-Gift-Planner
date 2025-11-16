<template>
  <div class="bond-calculator-view">
    <GiftInventoryGrid @open-modal="isModalVisible = true" />
    <GiftInventoryModal :is-visible="isModalVisible" @close="isModalVisible = false" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import GiftInventoryGrid from '@components/section/GiftInventoryGrid.vue'
  import GiftInventoryModal from '@components/modal/GiftInventoryModal.vue'

  const isModalVisible = ref(false)
</script>

<style scoped>
  .bond-calculator-view {
    padding: 20px;
  }
</style>
