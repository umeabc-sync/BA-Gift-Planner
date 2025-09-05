<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ t('characterSelector.title') }}</h3>
            <button class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="fixed-section">
              <div ref="searchAndReset" class="search-and-reset modal-body-content-padding">
                <input
                  v-model="searchTerm"
                  type="text"
                  :placeholder="t('characterSelector.searchPlaceholder')"
                  class="search-input"
                />
                <div class="action-buttons">
                  <button v-if="!isFilterPanelOpen" class="reset-selection-button" @click="resetSelection">
                    <span>{{ t('characterSelector.resetSelection') }}</span>
                  </button>
                  <button v-if="isFilterPanelOpen" class="reset-button" @click="resetFilters">
                    <span>{{ t('characterSelector.resetFilters') }}</span>
                  </button>
                  <button class="filter-toggle-button" @click="toggleFilterPanel">
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
                          'has-icon': ['attackType', 'defenseType', 'school', 'collection'].includes(group.id),
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

                        <span :class="{ 'nexon-font': ['weapon', 'position'].includes(group.id) }">
                          <span
                            v-if="group.id === 'position'"
                            :class="`position-type-${option.label.toLowerCase()}`"
                            class="position-button"
                          >
                            {{ option.label }}
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
  import { getSchoolIconUrl } from '@utils/getSchoolIconUrl'
  import { useModal } from '@composables/useModal.js'
  import { useI18n } from '@composables/useI18n.js'
  import filterOptions from '@/data/filterOptions.json'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import FilterOpenIcon from '@assets/icon/filter_open.svg'
  import FilterCloseIcon from '@assets/icon/filter_close.svg'

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

  const searchAndReset = ref(null)
  const filterControls = ref(null)
  const filterContentWrapper = ref(null)

  const getOptionLabel = (group, option) => {
    if (group.id === 'position') {
      return option.label
    }
    if (group.id === 'weapon') {
      return option.value
    }
    const prefix = group.labelKeyPrefix || group.id
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
        if (group.id === 'rating') return true // not in student data

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
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(45deg, #87ceeb, #6495ed);
    color: white;
    border-radius: 15px 15px 0 0;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #2a7fff, #00aeef);
    border-bottom-color: #2a4a6e;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: white;
    cursor: pointer;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.2s;
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
    scrollbar-width: thin;
    scrollbar-color: #bdc3c7 #f8f9fa;
    mask-image: linear-gradient(to bottom, transparent, black 15px);
  }

  .dark-mode .scrollable-section {
    scrollbar-color: #7f8c8d #1a2b40;
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

  .search-input {
    flex-grow: 1;
    padding: 12px 15px;
    border-radius: 8px;
    border: 1.5px solid #ccc;
    font-size: 1rem;
    font-family: inherit;
    min-width: 0;
    transform: skew(-8deg);
  }

  .dark-mode .search-input {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
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
    scrollbar-width: thin;
    scrollbar-color: #bdc3c7 #f8f9fa;
  }

  .filter-content-wrapper::after {
    content: '';
    display: block;
    height: 15px;
    flex-shrink: 0;
  }

  .dark-mode .filter-content-wrapper {
    scrollbar-color: #7f8c8d #1a2b40;
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

  .reset-selection-button,
  .reset-button {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-family: inherit;
    font-weight: bold;
    white-space: nowrap;
    /* background: linear-gradient(45deg, #5dade2, #2e86c1); */
    color: #314665;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    transform: skew(-8deg);
  }

  .reset-selection-button {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
  }

  .reset-button {
    background-color: #f4e94c;
    background-image: linear-gradient(to bottom right, #f9da3b 0%, transparent 50%),
      linear-gradient(to top left, #f9da3b 0%, transparent 50%);
  }

  .reset-selection-button span,
  .reset-button span {
    transform: skew(8deg);
    display: inline-block;
  }

  .reset-selection-button:hover,
  .reset-button:hover,
  .filter-toggle-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .reset-selection-button:active,
  .reset-button:active,
  .filter-toggle-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .dark-mode .reset-selection-button,
  .dark-mode .filter-toggle-button {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }

  .dark-mode .reset-button {
    background-color: #e57758;
    background-image: linear-gradient(to bottom right, #e4522f 0%, transparent 50%),
      linear-gradient(to top left, #e4522f 0%, transparent 50%);
    color: #e0f4ff;
  }

  .filter-toggle-button {
    display: flex;
    padding: 0;
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    justify-content: center;
    align-items: center;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    transform: skew(-8deg);
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
    border-color: #00a4e4;
    color: #00a4e4;
  }

  .filter-group button.active {
    background-color: #00a4e4;
    color: white !important;
    border-color: #00a4e4;
    font-weight: bold;
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

  .school-icon,
  .collection-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .filter-group button .school-icon {
    filter: invert(1);
  }

  .filter-group button.active .school-icon {
    filter: none;
  }

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

  .position-type-striker {
    color: #cc1a25;
  }

  .position-type-special {
    color: #006bff;
  }

  .filter-group button.active .position-button {
    color: white;
  }

  /* 學生網格容器 */
  .student-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(135, 206, 235, 0.05) 0%, rgba(100, 149, 237, 0.03) 100%);
    border-radius: 12px;
    margin: 0 20px 20px 20px;
    position: relative;
  }

  .dark-mode .student-grid {
    background: linear-gradient(135deg, rgba(0, 174, 239, 0.08) 0%, rgba(42, 127, 255, 0.05) 100%);
  }

  /* 學生卡片 */
  .student-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 12px 8px 10px 8px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transform: skew(-2deg);
    position: relative;
    overflow: hidden;
  }

  .student-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #87ceeb 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dark-mode .student-card {
    background: linear-gradient(145deg, #1f3048 0%, #1a2b40 100%);
    color: #e0e6ed;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .dark-mode .student-card::before {
    background: linear-gradient(90deg, transparent 0%, #00aeef 50%, transparent 100%);
  }

  /* 學生卡片內容容器 */
  .student-card > * {
    transform: skew(2deg);
  }

  /* 懸停效果 */
  .student-card:hover {
    background: linear-gradient(145deg, #f0f8ff 0%, #e6f3ff 100%);
    transform: translateY(-4px) skew(-2deg);
    box-shadow:
      0 8px 20px rgba(100, 149, 237, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(135, 206, 235, 0.3);
  }

  .student-card:hover::before {
    opacity: 1;
  }

  .dark-mode .student-card:hover {
    background: linear-gradient(145deg, #2a4a6e 0%, #1f3048 100%);
    box-shadow:
      0 8px 20px rgba(0, 174, 239, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(0, 174, 239, 0.4);
  }

  /* 選中狀態 */
  .student-card.selected {
    border-color: #6495ed;
    background: linear-gradient(
      145deg,
      rgba(100, 149, 237, 0.12) 0%,
      rgba(135, 206, 235, 0.08) 50%,
      rgba(255, 255, 255, 0.95) 100%
    );
    box-shadow:
      0 0 0 3px rgba(100, 149, 237, 0.3),
      0 8px 25px rgba(100, 149, 237, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateY(-2px) skew(-2deg);
    position: relative;
  }

  .student-card.selected::before {
    opacity: 1;
    height: 3px;
    background: linear-gradient(90deg, #6495ed 0%, #87ceeb 50%, #6495ed 100%);
  }

  .dark-mode .student-card.selected {
    border-color: #00aeef;
    background: linear-gradient(
      145deg,
      rgba(0, 174, 239, 0.15) 0%,
      rgba(42, 127, 255, 0.1) 50%,
      rgba(31, 48, 72, 0.95) 100%
    );
    box-shadow:
      0 0 0 3px rgba(0, 174, 239, 0.4),
      0 8px 25px rgba(0, 174, 239, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .dark-mode .student-card.selected::before {
    background: linear-gradient(90deg, #00aeef 0%, #2a7fff 50%, #00aeef 100%);
  }

  .dark-mode .student-card.selected::after {
    background: linear-gradient(45deg, #00aeef 0%, #2a7fff 100%);
  }

  /* 學生頭像 */
  .student-avatar-large {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    margin-bottom: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .student-avatar-large::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #87ceeb, #6495ed, #4169e1, #87ceeb);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .student-avatar-large :deep(img) {
    border-radius: 50%;
    border: 3px solid rgba(100, 149, 237, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%);
  }

  .dark-mode .student-avatar-large::before {
    background: conic-gradient(from 0deg, #00aeef, #2a7fff, #0066cc, #00aeef);
  }

  .dark-mode .student-avatar-large :deep(img) {
    border-color: rgba(0, 174, 239, 0.4);
    background: linear-gradient(145deg, #1f3048 0%, #2a4a6e 100%);
  }

  /* 懸停時的頭像效果 */
  .student-card:hover .student-avatar-large {
    transform: scale(1.05) rotate(-2deg);
  }

  .student-card:hover .student-avatar-large::before {
    opacity: 0.6;
    animation: rotate 3s linear infinite;
  }

  .student-card:hover .student-avatar-large :deep(img) {
    border-color: #6495ed;
    box-shadow: 0 0 15px rgba(100, 149, 237, 0.3);
  }

  .dark-mode .student-card:hover .student-avatar-large :deep(img) {
    border-color: #00aeef;
    box-shadow: 0 0 15px rgba(0, 174, 239, 0.4);
  }

  /* 選中時的頭像效果 */
  .student-card.selected .student-avatar-large {
    transform: scale(1.08) rotate(-1deg);
  }

  .student-card.selected .student-avatar-large::before {
    opacity: 0.8;
    animation: rotate 2s linear infinite;
  }

  .student-card.selected .student-avatar-large :deep(img) {
    border-color: #6495ed;
    box-shadow:
      0 0 20px rgba(100, 149, 237, 0.5),
      inset 0 0 10px rgba(100, 149, 237, 0.1);
  }

  .dark-mode .student-card.selected .student-avatar-large :deep(img) {
    border-color: #00aeef;
    box-shadow:
      0 0 20px rgba(0, 174, 239, 0.6),
      inset 0 0 10px rgba(0, 174, 239, 0.15);
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
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    position: relative;
    padding: 4px 8px;
    border-radius: 8px;
    background: linear-gradient(90deg, transparent 0%, rgba(135, 206, 235, 0.1) 50%, transparent 100%);
    transition: all 0.3s ease;
  }

  .dark-mode .student-name {
    color: #e0e6ed;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    background: linear-gradient(90deg, transparent 0%, rgba(0, 174, 239, 0.1) 50%, transparent 100%);
  }

  /* 選中時的姓名效果 */
  .student-card.selected .student-name {
    color: #4169e1;
    font-weight: 700;
    text-shadow:
      0 1px 3px rgba(100, 149, 237, 0.4),
      0 0 10px rgba(100, 149, 237, 0.2);
    background: linear-gradient(
      90deg,
      rgba(100, 149, 237, 0.15) 0%,
      rgba(135, 206, 235, 0.25) 50%,
      rgba(100, 149, 237, 0.15) 100%
    );
  }

  .dark-mode .student-card.selected .student-name {
    color: #87ceeb;
    text-shadow:
      0 1px 3px rgba(0, 174, 239, 0.5),
      0 0 10px rgba(0, 174, 239, 0.3);
    background: linear-gradient(
      90deg,
      rgba(0, 174, 239, 0.2) 0%,
      rgba(42, 127, 255, 0.3) 50%,
      rgba(0, 174, 239, 0.2) 100%
    );
  }

  /* 無結果提示 */
  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
    color: #7f8c8d;
    font-size: 1.1rem;
    font-weight: 500;
    background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(100, 149, 237, 0.05) 100%);
    border-radius: 12px;
    border: 2px dashed rgba(135, 206, 235, 0.3);
    transform: skew(-1deg);
  }

  .no-results > * {
    transform: skew(1deg);
  }

  .dark-mode .no-results {
    color: #bdc3c7;
    background: linear-gradient(135deg, rgba(0, 174, 239, 0.1) 0%, rgba(42, 127, 255, 0.05) 100%);
    border-color: rgba(0, 174, 239, 0.3);
  }

  /* 旋轉動畫 */
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 點擊動畫 */
  .student-card:active {
    transform: scale(0.95) skew(-2deg);
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

  .scrollable-section::-webkit-scrollbar,
  .filter-content-wrapper::-webkit-scrollbar {
    width: 12px;
  }

  .scrollable-section::-webkit-scrollbar-track,
  .filter-content-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable-section::-webkit-scrollbar-thumb,
  .filter-content-wrapper::-webkit-scrollbar-thumb {
    background-color: #bdc3c7;
    border-radius: 10px;
    border: 3px solid #f8f9fa;
  }

  .dark-mode .scrollable-section::-webkit-scrollbar-thumb,
  .dark-mode .filter-content-wrapper::-webkit-scrollbar-thumb {
    background-color: #7f8c8d;
    border-color: #1a2b40;
  }

  .scrollable-section::-webkit-scrollbar-thumb:hover,
  .filter-content-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #a9a9a9;
  }

  .dark-mode .scrollable-section::-webkit-scrollbar-thumb:hover,
  .dark-mode .filter-content-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #95a5a6;
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
      padding: 2px 4px;
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
