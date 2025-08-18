<template>
  <header class="header">
    <div class="header-title">蔚藍檔案送禮工具</div>
    <div class="controls">
      <span class="selected-count">已選擇 {{ selectedCount }} 位學生</span>
      <button class="select-characters-btn" @click="$emit('openModal')">選擇角色</button>
    </div>
  </header>
</template>

<script setup>
  defineProps({
    selectedCount: {
      type: Number,
      required: true,
    },
  })
  defineEmits(['openModal'])
</script>

<style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dark-mode .header {
    background: linear-gradient(90deg, #2a4a6e 0%, #1a2b40 100%);
  }

  .header-title {
    font-size: 24px;
    font-weight: bold;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .selected-count {
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 15px;
    border-radius: 15px;
    font-size: 14px;
  }

  .dark-mode .selected-count {
    background: rgba(255, 255, 255, 0.1);
  }

  .select-characters-btn {
    background: white;
    border: 1px solid #4facfe;
    color: #4facfe;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
  }

  .select-characters-btn:hover {
    background: #eef8ff;
    transform: translateY(-2px);
  }

  .dark-mode .select-characters-btn {
    background: linear-gradient(45deg, #2a7fff, #00aeef);
    border: none;
    color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .dark-mode .select-characters-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
</style>
