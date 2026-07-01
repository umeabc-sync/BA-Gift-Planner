<template>
  <OverlayScrollbarsComponent defer :options="osOptions" class="app-scrollbar">
    <slot></slot>
  </OverlayScrollbarsComponent>
</template>

<script setup>
  import { computed } from 'vue'
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'

  const settingStore = useSettingStore()
  const { isDarkMode } = storeToRefs(settingStore)

  const osOptions = computed(() => ({
    scrollbars: {
      theme: isDarkMode.value ? 'os-theme-light' : 'os-theme-dark',
      clickScroll: true,
    },
  }))
</script>

<style scoped>
  .app-scrollbar {
    height: 100%;
    width: 100%;
  }
</style>
