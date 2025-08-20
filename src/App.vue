<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <TheHeader @open-modal="openModal" @open-settings-modal="openSettingsModal" />

    <main>
      <WelcomeMessage v-if="selectedStudents.length === 0" />
      <template v-else>
        <GiftRecommendation v-for="gift in recommendedGifts" :key="`${gift.id}-${gift.isSsr}`" :gift="gift" />
        <GiftGridSection :title="t('app.giftGridSection.generic')" :gifts="genericSsrGifts" />
        <GiftGridSection :title="t('app.giftGridSection.synthesis')" :gifts="synthesisGifts" />
      </template>
    </main>

    <FooterSection />

    <StudentSelectionModal
      :is-modal-open="isModalOpen"
      :students-data="studentsData"
      :selected-students="selectedStudents"
      @close-modal="closeModal"
      @toggle-student="toggleStudent"
      @reset-selection="selectedStudents = []"
    />

    <SettingsModal :is-visible="isSettingsModalVisible" @close="closeSettingsModal" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { runIPGeolocation } from './utils/ipGeolocation'
  import { useSettingStore } from './store/setting'
  import { storeToRefs } from 'pinia'
  import TheHeader from './components/TheHeader.vue'
  import WelcomeMessage from './components/WelcomeMessage.vue'
  import GiftRecommendation from './components/GiftRecommendation.vue'
  import GiftGridSection from './components/GiftGridSection.vue'
  import StudentSelectionModal from './components/StudentSelectionModal.vue'
  import SettingsModal from './components/SettingsModal.vue'
  import FooterSection from './components/FooterSection.vue'
  import { fetchStudentData } from './utils/fetchStudentData'
  import { fetchSrGiftData } from './utils/fetchSrGiftData'
  import { fetchSsrGiftData } from './utils/fetchSsrGiftData'
  import { getPreferenceValue } from './utils/getPreferenceValue'
  import { useI18n } from './composables/useI18n'

  const { t } = useI18n()
  const settingStore = useSettingStore()
  const { isDarkMode, locale, showOnlyOptimalSolution } = storeToRefs(settingStore)

  const studentsData = ref([])
  const giftsData = ref([])
  const selectedStudents = ref([])
  const isModalOpen = ref(false)
  const isSettingsModalVisible = ref(false)

  onMounted(async () => {
    try {
      // Wait for IP location to set locale
      await runIPGeolocation()

      // Load character & gift data, using the locale in the Pinia store
      const students = await fetchStudentData(locale.value)
      studentsData.value = students

      const srGifts = await fetchSrGiftData(locale.value)
      const ssrGifts = await fetchSsrGiftData(locale.value)

      giftsData.value = [
        ...srGifts.map((g) => ({ ...g, isSsr: false })),
        ...ssrGifts.map((g) => ({ ...g, isSsr: true })),
      ]
    } catch (error) {
      console.error('Failed to load data:', error)
    }

    settingStore.initThemeListener()
  })

  watch(
    isDarkMode,
    (newVal) => {
      if (newVal) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }
    },
    { immediate: true }
  )

  function openModal() {
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
  }

  function openSettingsModal() {
    isSettingsModalVisible.value = true
  }

  function closeSettingsModal() {
    isSettingsModalVisible.value = false
  }

  function toggleStudent(student) {
    const index = selectedStudents.value.findIndex((s) => s.id === student.id)
    if (index > -1) {
      selectedStudents.value.splice(index, 1)
    } else {
      selectedStudents.value.push(student)
    }
  }

  const analyzedGifts = computed(() => {
    if (selectedStudents.value.length === 0) {
      return []
    }

    return giftsData.value.map((gift) => {
      const analysis = analyzeGift(gift, showOnlyOptimalSolution.value)
      return { ...gift, analysis }
    })
  })

  const synthesisGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.shouldSynthesize)
  })

  const genericSsrGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.isGeneric)
  })

  const recommendedGifts = computed(() => {
    return analyzedGifts.value
      .filter((gift) => gift.analysis.isRecommended)
      .sort((a, b) => b.analysis.maxValue - a.analysis.maxValue)
  })

  function analyzeGift(gift, showOnlyOptimal) {
    const preferences = selectedStudents.value.map((student) => ({
      student,
      value: getPreferenceValue(student, gift),
    }))
    const maxValue = Math.max(0, ...preferences.map((p) => p.value))

    const analysis = {
      isRecommended: false,
      isGeneric: false,
      shouldSynthesize: false,
      maxValue,
    }

    const baseThreshold = gift.isSsr ? 180 : 40

    if (maxValue < baseThreshold) {
      if (gift.isSsr) {
        analysis.isGeneric = true
      } else {
        analysis.shouldSynthesize = true
      }
      return analysis
    }

    const potentialCharacters = preferences
      .filter((p) => p.value >= baseThreshold)
      .map((p) => ({
        ...p.student,
        isOptimal: p.value === maxValue,
        value: p.value,
      }))

    const finalCharacters = showOnlyOptimal
      ? potentialCharacters.filter((c) => c.isOptimal)
      : potentialCharacters.sort((a, b) => b.value - a.value)

    if (finalCharacters.length === 0) {
      if (gift.isSsr) analysis.isGeneric = true
      else analysis.shouldSynthesize = true
      return analysis
    }

    analysis.isRecommended = true
    analysis.characters = finalCharacters

    if (gift.isSsr) {
      if (maxValue >= 240) {
        analysis.class = 'rec-best'
        analysis.typeTextKey = 'app.analysis.recBest'
        analysis.titleKey = 'app.analysis.bestChoice'
        analysis.titleValue = maxValue
      } else {
        // >= 180
        analysis.class = 'rec-good'
        analysis.typeTextKey = 'app.analysis.recGood'
        analysis.titleKey = 'app.analysis.goodChoice'
        analysis.titleValue = maxValue
      }
    } else {
      // SR
      if (maxValue >= 80) {
        analysis.class = 'rec-extra'
        analysis.typeTextKey = 'app.analysis.recExtra'
        analysis.titleKey = 'app.analysis.extraChoice'
        analysis.titleValue = maxValue
      } else if (maxValue >= 60) {
        analysis.class = 'rec-best'
        analysis.typeTextKey = 'app.analysis.recBest'
        analysis.titleKey = 'app.analysis.bestChoice'
        analysis.titleValue = maxValue
      } else {
        // >= 40
        analysis.class = 'rec-good'
        analysis.typeTextKey = 'app.analysis.recGood'
        analysis.titleKey = 'app.analysis.goodChoice'
        analysis.titleValue = maxValue
      }
    }

    return analysis
  }
</script>

<style scoped>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 80px - 40px); /* Subtract header(80px) & padding(40px) height */
  }
</style>
