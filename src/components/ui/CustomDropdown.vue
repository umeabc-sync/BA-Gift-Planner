<template>
  <div class="dropdown-container" :class="{ 'z-active': isMenuOpen }">
    <button ref="toggleRef" class="btn-skew btn-text btn-blue" @click.stop="toggleMenu">
      <slot name="toggle"></slot>
      <span class="caret" :class="{ open: isMenuOpen }"></span>
    </button>

    <transition :name="direction === 'up' ? 'dropdown-up' : 'dropdown'">
      <ul
        v-if="isMenuOpen"
        ref="menuRef"
        class="custom-dropdown-menu"
        :class="{ 'drop-up': direction === 'up' }"
        @click="closeMenu"
      >
        <slot></slot>
      </ul>
    </transition>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  defineProps({
    direction: {
      type: String,
      default: 'down', // 'down' or 'up'
    },
  })

  const isMenuOpen = ref(false)
  const toggleRef = ref(null)
  const menuRef = ref(null)

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  const closeMenu = () => {
    isMenuOpen.value = false
  }

  const handleClickOutside = (event) => {
    if (isMenuOpen.value) {
      const isClickInsideToggle = toggleRef.value && toggleRef.value.contains(event.target)
      const isClickInsideMenu = menuRef.value && menuRef.value.contains(event.target)

      if (!isClickInsideToggle && !isClickInsideMenu) {
        isMenuOpen.value = false
      }
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true)
  })
</script>

<style scoped>
  /* Common Dropdown Styles */
  .dropdown-container {
    position: relative;
    width: 100%;
  }

  .btn-skew {
    width: 100%;
    user-select: none;
    padding: 0 20px;
  }

  .btn-skew > :deep(*) {
    transform: skew(8deg);
    display: inline-block;
  }

  .caret {
    margin-left: 10px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #314665;
    transition: transform 0.3s ease;
    transform: skew(8deg); /* Apply skew to the caret itself */
  }

  .dark-mode .caret {
    border-top-color: #e0f4ff;
  }

  .caret.open {
    transform: skew(8deg) rotate(180deg);
  }

  .custom-dropdown-menu {
    position: absolute;
    width: 100%;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 101;
    border: 1px solid #dee2e6;
    transform: skew(-8deg);
    padding: 5px;
    list-style: none;
    margin: 0;
  }

  .dark-mode .custom-dropdown-menu {
    background-color: #1a2b40;
    border-color: #2a4a6e;
  }

  /* Default: Dropdown */
  .custom-dropdown-menu {
    top: 100%;
    left: -2px;
    margin-top: 6px;
    transform-origin: top center;
  }

  /* Variant: Drop-up */
  .custom-dropdown-menu.drop-up {
    top: auto;
    bottom: 100%;
    left: 0;
    margin-bottom: 6px;
    transform-origin: bottom center;
    box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.2);
  }

  .custom-dropdown-menu > :deep(li) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #314665;
    transition: background-color 0.2s ease;
    border-radius: 8px;
    width: 100%;
    font-weight: bold;
  }

  .custom-dropdown-menu > :deep(li > *) {
    transform: skew(8deg);
  }

  .dark-mode .custom-dropdown-menu > :deep(li) {
    color: #e0e6ed;
  }

  .custom-dropdown-menu > :deep(li:hover) {
    background-color: #e9ecef;
  }

  .dark-mode .custom-dropdown-menu > :deep(li:hover) {
    background-color: #2a4a6e;
  }

  .custom-dropdown-menu > :deep(li.active) {
    background-color: #466398;
    color: white;
  }

  .dark-mode .custom-dropdown-menu > :deep(li.active) {
    background-color: #00a4e4;
  }

  /* Dropdown Animation */
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) skew(-8deg);
  }

  /* Drop-up Animation */
  .dropdown-up-enter-active,
  .dropdown-up-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-up-enter-from,
  .dropdown-up-leave-to {
    opacity: 0;
    transform: translateY(10px) skew(-8deg);
  }
</style>
