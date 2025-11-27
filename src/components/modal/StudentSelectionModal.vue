<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">{{ t('characterSelector.title') }}</div>
            <button class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="fixed-section">
              <div ref="searchAndReset" class="search-and-reset modal-body-content-padding">
                <div class="search-input-wrapper">
                  <input
                    v-model="searchTerm"
                    type="text"
                    :placeholder="t('characterSelector.searchPlaceholder')"
                    class="search-input"
                  />
                  <PencilIcon class="search-input-icon" />
                </div>
                <div class="action-buttons">
                  <button
                    v-if="!isFilterPanelOpen"
                    class="btn-skew btn-text btn-blue"
                    :disabled="isNoStudentSelected"
                    @click="resetSelection"
                  >
                    <span>{{ t('characterSelector.resetSelection') }}</span>
                  </button>
                  <button
                    v-if="isFilterPanelOpen"
                    class="btn-skew btn-text btn-yellow"
                    :disabled="isNoFilterSelected"
                    @click="resetFilters"
                  >
                    <span>{{ t('characterSelector.resetFilters') }}</span>
                  </button>
                  <button class="btn-skew btn-icon btn-blue" @click="toggleFilterPanel">
                    <component
                      :is="isFilterPanelOpen ? FilterCloseIcon : FilterOpenIcon"
                      class="filter-toggle-icon"
                      draggable="false"
                    />
                  </button>
                </div>
              </div>
              <div
                ref="filterControls"
                class="filter-controls"
                :class="{ 'is-open': isFilterPanelOpen, 'is-animating': isAnimating }"
              >
                <div ref="filterContentWrapper" class="filter-content-wrapper modal-body-content-padding">
                  <div v-for="group in filterOptions.filters" :key="group.id" class="filter-group">
                    <span class="filter-label">{{ t(group.labelKey) }}</span>
                    <div class="filter-buttons">
                      <button
                        :class="{ active: selectedFilters[group.id].length === 0 }"
                        @click="selectFilter(group.id, null)"
                      >
                        {{ t('common.all') }}
                      </button>
                      <button
                        v-for="option in group.options"
                        :key="option.value"
                        :class="{
                          active: selectedFilters[group.id].includes(option.value),
                          'has-icon': ['role', 'attackType', 'defenseType', 'school', 'collection'].includes(group.id),
                        }"
                        @click="selectFilter(group.id, option.value)"
                        style="font-family: inherit"
                      >
                        <template v-if="group.id === 'attackType'">
                          <div class="type-icon-wrapper" :class="`type-bg-${option.value.toLowerCase()}`">
                            <img :src="getAssetsFile(`icon/Type_Attack_s.webp`)" alt="Attack Icon" class="type-icon" />
                          </div>
                        </template>
                        <template v-else-if="group.id === 'defenseType'">
                          <div class="type-icon-wrapper" :class="`type-bg-${option.value.toLowerCase()}`">
                            <img
                              :src="getAssetsFile(`icon/Type_Defense_s.webp`)"
                              alt="Defense Icon"
                              class="type-icon"
                            />
                          </div>
                        </template>
                        <template v-else-if="group.id === 'role'">
                          <img :src="getRoleIconUrl(option.value)" :alt="option.value" class="role-icon" />
                        </template>
                        <template v-else-if="group.id === 'school'">
                          <img :src="getSchoolIconUrl(option.value)" :alt="option.value" class="school-icon" />
                        </template>
                        <template v-else-if="group.id === 'collection'">
                          <img
                            :src="getAssetsFile(`icon/${option.value.toLowerCase()}.svg`)"
                            :alt="option.value"
                            class="collection-icon"
                          />
                        </template>
                        <span :class="{ 'nexon-font': ['weapon', 'type', 'position'].includes(group.id) }">
                          <span
                            v-if="group.id === 'type'"
                            :class="`type-${option.label.toLowerCase()}`"
                            class="type-button"
                          >
                            {{ option.label }}
                          </span>
                          <span v-else-if="group.id === 'rarity'" style="display: flex; align-items: center; gap: 2px">
                            <component
                              :is="StarIcon"
                              v-for="i in option.value"
                              :key="i"
                              class="rarity-icon"
                              style="width: 14px; height: 14px; fill: currentColor"
                            />
                          </span>
                          <span v-else>{{ getOptionLabel(group, option) }}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="scrollable-section">
              <div class="student-grid modal-body-content-padding">
                <div
                  v-for="student in filteredStudents"
                  :key="student.id"
                  class="student-card"
                  :class="{ selected: selectedStudents.some((s) => s.id === student.id) }"
                  @click="toggleStudentSelection(student)"
                >
                  <ImageWithLoader
                    :src="getAvatarUrl(student.id)"
                    class="student-avatar-large"
                    :lazy="enableCharacterSelectorLazyLoad"
                  />
                  <span class="student-name">{{ t(`student.name.${student.id}`) }}</span>
                </div>
                <div v-if="filteredStudents.length === 0" class="no-results">
                  {{ t('characterSelector.noResults') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { ref, computed, toRefs, onMounted, onBeforeUnmount, reactive, watch, nextTick } from 'vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { getAssetsFile } from '@utils/getAssetsFile'
  import { getRoleIconUrl } from '@utils/getRoleIconUrl'
  import { getSchoolIconUrl } from '@utils/getSchoolIconUrl'
  import { useModal } from '@composables/useModal.js'
  import { useI18n } from '@composables/useI18n.js'
  import filterOptions from '@/data/filterOptions.json'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import FilterOpenIcon from '@assets/icon/filter_open.svg'
  import FilterCloseIcon from '@assets/icon/filter_close.svg'
  import PencilIcon from '@assets/icon/pencil.svg'
  import StarIcon from '@assets/icon/star.svg'

  const { t } = useI18n()

  const props = defineProps({
    isModalOpen: Boolean,
    studentsData: Array,
    selectedStudents: Array,
  })

  const emit = defineEmits(['closeModal', 'toggleStudent', 'resetSelection'])

  const settingStore = useSettingStore()
  const { enableCharacterSelectorLazyLoad } = storeToRefs(settingStore)

  const searchTerm = ref('')
  const isFilterPanelOpen = ref(false)
  const isAnimating = ref(false)

  const selectedFilters = reactive(
    filterOptions.filters.reduce((acc, filter) => {
      acc[filter.id] = []
      return acc
    }, {})
  )

  const isNoStudentSelected = computed(() => props.selectedStudents.length === 0)
  const isNoFilterSelected = computed(() => {
    return Object.values(selectedFilters).every((arr) => arr.length === 0)
  })

  const searchAndReset = ref(null)
  const filterControls = ref(null)
  const filterContentWrapper = ref(null)

  const getOptionLabel = (group, option) => {
    if (group.id === 'type') {
      return option.label
    }
    if (group.id === 'weapon' || group.id === 'position') {
      return option.value
    }
    const prefix = group.id
    return t(`${prefix}.${option.value}`)
  }

  const closeModal = () => {
    emit('closeModal')
  }

  const { isModalOpen: isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  watch(isVisible, (newValue) => {
    if (newValue && isFilterPanelOpen.value) {
      adjustFilterHeight()
    }
  })

  const adjustFilterHeight = () => {
    if (isFilterPanelOpen.value) {
      nextTick(() => {
        const modalBodyHeight = document.querySelector('.modal-body').offsetHeight
        const searchAndResetHeight = searchAndReset.value.offsetHeight
        const maxHeight = modalBodyHeight - searchAndResetHeight - 20
        if (filterContentWrapper.value) {
          filterContentWrapper.value.style.maxHeight = `${maxHeight}px`
        }
      })
    }
  }

  const toggleFilterPanel = () => {
    isFilterPanelOpen.value = !isFilterPanelOpen.value
    isAnimating.value = true

    if (isFilterPanelOpen.value) {
      adjustFilterHeight()
    } else {
      if (filterContentWrapper.value) {
        filterContentWrapper.value.style.maxHeight = ''
      }
    }

    setTimeout(() => {
      isAnimating.value = false
    }, 320)
  }

  const selectFilter = (filterType, value) => {
    const targetArray = selectedFilters[filterType]
    if (!targetArray) return

    if (value === null) {
      selectedFilters[filterType] = []
    } else {
      const index = targetArray.indexOf(value)
      if (index > -1) {
        targetArray.splice(index, 1)
      } else {
        targetArray.push(value)
      }
    }
  }

  const resetFilters = () => {
    searchTerm.value = ''
    for (const key in selectedFilters) {
      selectedFilters[key] = []
    }
  }

  const resetSelection = () => {
    emit('resetSelection')
  }

  const filteredStudents = computed(() => {
    return props.studentsData.filter((student) => {
      const translatedName = t(`student.name.${student.id}`)
      const searchMatch = !searchTerm.value || translatedName.toLowerCase().includes(searchTerm.value.toLowerCase())

      const filtersMatch = filterOptions.filters.every((group) => {
        const selected = selectedFilters[group.id]
        if (selected.length === 0) return true

        if (group.id === 'collection') {
          const isSelected = props.selectedStudents.some((s) => s.id === student.id)
          return selected.some((option) => {
            if (option === 'Selected') return isSelected
            if (option === 'Unselected') return !isSelected
            return false
          })
        }

        if (group.id === 'role') {
          return student.role.some((role) => selected.includes(role))
        }

        return selected.includes(student[group.id])
      })

      return searchMatch && filtersMatch
    })
  })

  const toggleStudentSelection = (student) => {
    emit('toggleStudent', student)
  }

  onMounted(() => {
    window.addEventListener('resize', adjustFilterHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustFilterHeight)
  })
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #f8f9fa;
    border-radius: 15px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
    overflow: hidden;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .modal-header {
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #cde6f8, #f7fafb);
    border-radius: 15px 15px 0 0;
    position: relative;
  }

  .modal-header .modal-title {
    padding: 10px 0px 5px 0px;
    text-align: center;
    color: #2d4663;
    flex-grow: 0;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 5px solid #fdef66;
    user-select: none;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #223d5a, #1a2b40);
    border-bottom-color: #2a4a6e;
  }

  .dark-mode .modal-header .modal-title {
    color: #e0f4ff;
    border-bottom-color: #fdef66;
  }

  .dark-mode .close-button {
    color: #e0f4ff;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #2d4663;
    cursor: pointer;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.2s;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }

  .close-button:hover {
    opacity: 1;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    height: calc(80vh - 60px);
    padding-top: 20px;
  }

  .fixed-section {
    flex-shrink: 0;
  }

  .scrollable-section {
    flex-grow: 1;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, transparent, black 15px);
  }

  .modal-body-content-padding {
    padding: 0 20px;
  }

  .search-and-reset {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input-wrapper {
    position: relative;
    flex-grow: 1;
  }

  .search-input-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%) skew(8deg);
    width: 20px;
    height: 20px;
    fill: #2d4663;
    pointer-events: none;
  }

  .dark-mode .search-input-icon {
    fill: #e0f4ff;
  }

  .search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 40px 12px 15px;
    color: #2d4663;
    border-radius: 8px;
    border: 1.5px solid #ccc;
    font-size: 1rem;
    font-family: inherit;
    min-width: 0;
  }

  .dark-mode .search-input {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .search-input:focus {
    outline: none;
  }

  .filter-controls {
    margin: 0;
    border-bottom: 2px solid #e0e6ed;
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      border-bottom-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .filter-controls.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
    margin: 15px 0;
    border-bottom-width: 2px;
  }

  .dark-mode .filter-controls {
    border-bottom-color: #2a4a6e;
  }

  .filter-content-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 0 20px;
    min-height: 0;
    overflow-y: hidden;
  }

  .filter-content-wrapper::after {
    content: '';
    display: block;
    height: 15px;
    flex-shrink: 0;
  }

  .filter-controls.is-open:not(.is-animating) .filter-content-wrapper {
    overflow-y: auto;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-label {
    font-weight: 700;
    font-size: 1rem;
    color: #314665;
    padding: 2px 8px;
    background-color: #e0e6ed;
    border-radius: 4px;
  }

  .dark-mode .filter-label {
    background-color: #2a4a6e;
    color: #e0f4ff;
  }

  .btn-text {
    font-size: 0.9rem;
    white-space: nowrap;
    padding: 12px 20px;
  }

  .filter-toggle-icon {
    width: 20px;
    height: 20px;
    fill: #314665;
  }

  .dark-mode .filter-toggle-icon {
    fill: #e0f4ff;
  }

  .filter-group button {
    position: relative;
    padding: 5px 12px;
    border: 2px solid #d1d8e0;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.86rem;
    transform: skew(-8deg);
  }

  .filter-group button > span,
  .filter-group button > img,
  .type-icon-wrapper {
    display: inline-block;
    transform: skew(8deg);
  }

  .filter-group button.has-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px 5px 8px;
  }

  .dark-mode .filter-group button {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .filter-group button:hover {
    border-color: #466398;
    color: #466398;
  }

  .dark-mode .filter-group button:hover {
    border-color: #00a4e4;
    color: #00a4e4;
  }

  .filter-group button.active {
    background-color: #466398;
    color: white !important;
    border-color: #466398;
    font-weight: bold;
    box-shadow: 0 0 10px #46639880;
  }

  .dark-mode .filter-group button.active {
    background-color: #00a4e4;
    border-color: #00a4e4;
    box-shadow: 0 0 10px #00a4e480;
  }

  .type-icon-wrapper {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  .type-icon {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  .role-icon,
  .school-icon,
  .collection-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .filter-group button .role-icon,
  .filter-group button .school-icon {
    filter: invert(1);
  }

  .filter-group button.active .role-icon,
  .filter-group button.active .school-icon {
    filter: none;
  }

  .dark-mode .filter-group button .role-icon,
  .dark-mode .filter-group button .school-icon {
    filter: none;
  }

  .filter-group button.active .collection-icon {
    filter: invert(1);
  }

  .dark-mode .filter-group button .collection-icon {
    filter: invert(1);
  }

  .type-bg-explosive,
  .type-bg-light {
    background: #a70c19;
  }
  .type-bg-piercing,
  .type-bg-heavy {
    background: #b26d1f;
  }
  .type-bg-mystic,
  .type-bg-special {
    background: #216f9c;
  }
  .type-bg-sonic,
  .type-bg-elastic {
    background: #9431a5;
  }

  .nexon-font {
    font-family: 'NEXON Football Gothic', sans-serif;
    font-style: italic;
    font-weight: 300;
    margin-right: 4px;
  }

  .type-striker {
    color: #cc1a25;
  }

  .type-special {
    color: #006bff;
  }

  .filter-group button.active .type-button {
    color: white;
  }

  /* 學生網格容器 */
  .student-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    padding: 20px;
    background-color: #e9eef3;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.03),
      rgba(0, 0, 0, 0.03) 1px,
      transparent 1px,
      transparent 10px
    );
    border-radius: 12px;
    margin: 0 20px 20px 20px;
  }

  .dark-mode .student-grid {
    background-color: #1a2b40;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px,
      transparent 10px
    );
  }

  /* 學生卡片 - 基礎樣式 */
  .student-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 12px 8px;
    border-radius: 8px;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;
    border: 2px solid transparent;
    background-color: #f8f9fa;
    user-select: none;
    position: relative;
    transform: skew(-8deg);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .dark-mode .student-card {
    background-color: #1f3048;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .student-card:hover {
    transform: translateY(-3px) skew(-8deg);
    border-color: #466398;
  }

  .dark-mode .student-card:hover {
    border-color: #00a4e4;
  }

  /* 選中狀態 (明亮模式) */
  .student-card.selected {
    background-color: #e4f2ff;
    border-color: #466398;
    transform: translateY(-1px) skew(-8deg);
  }

  /* --- 暗黑模式專屬的選中狀態 --- */

  .dark-mode .student-card.selected {
    background-color: #1f3048; /* 將背景色重設為卡片原本的深色 */
    border-color: #00a4e4;
  }

  /* 在暗黑模式下，使用偽元素來疊加半透明效果 */
  .dark-mode .student-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background-color: transparent; /* 預設為透明 */
    transition: background-color 0.2s ease; /* 偽元素自己的過渡效果 */
    z-index: 1; /* 確保在卡片內容下方 */
  }

  /* 暗黑模式下，選中時顯示偽元素背景 */
  .dark-mode .student-card.selected::before {
    background-color: rgba(0, 164, 228, 0.2);
  }

  /* 確保卡片內容在偽元素之上 */
  .student-card > * {
    position: relative;
    z-index: 2;
  }

  /* 學生頭像 */
  .student-avatar-large {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    margin-bottom: 8px;
    transition: transform 0.2s ease;
    transform: skew(8deg);
  }

  .student-avatar-large :deep(img) {
    border-radius: 50%;
    border: 3px solid #d1d8e0;
    transition: border-color 0.2s ease;
    background-color: #fff;
  }

  .dark-mode .student-avatar-large :deep(img) {
    border-color: #2a4a6e;
    background-color: #1a2b40;
  }

  .student-card:hover .student-avatar-large {
    transform: scale(1.05) skew(8deg);
  }

  .student-card.selected .student-avatar-large :deep(img) {
    border-color: #466398;
  }

  .dark-mode .student-card.selected .student-avatar-large :deep(img) {
    border-color: #00a4e4;
  }

  /* 學生姓名 */
  .student-name {
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    color: #314665;
    transition: color 0.2s ease;
    transform: skew(8deg);
  }

  .dark-mode .student-name {
    color: #e0e6ed;
  }

  .student-card.selected .student-name {
    color: #0056b3;
    font-weight: 700;
  }

  .dark-mode .student-card.selected .student-name {
    color: #87ceeb;
  }

  /* 無結果提示 */
  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
    color: #7f8c8d;
    font-size: 1.1rem;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    border: 2px dashed #d1d8e0;
  }

  .dark-mode .no-results {
    color: #bdc3c7;
    background-color: rgba(0, 0, 0, 0.1);
    border-color: #2a4a6e;
  }

  /* 點擊動畫 */
  .student-card:active {
    transform: scale(0.95) skew(-8deg);
    transition-duration: 0.1s;
  }

  .nexon-font {
    font-family: 'NEXON Football Gothic', sans-serif;
    font-style: italic;
    font-weight: 700;
    margin-right: 4px;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  /* 響應式設計 */
  @media (max-width: 768px) {
    .student-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 12px;
      padding: 15px;
      margin: 0 15px 15px 15px;
    }

    .student-card {
      padding: 8px 6px;
    }

    .student-avatar-large {
      width: 65px;
      height: 65px;
    }

    .student-name {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .student-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
    }

    .student-avatar-large {
      width: 55px;
      height: 55px;
    }
  }
</style>
