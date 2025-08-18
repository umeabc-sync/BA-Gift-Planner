<template>
  <TheHeader :selected-count="selectedStudents.length" @open-modal="openModal" />

  <main>
    <WelcomeMessage v-if="selectedStudents.length === 0" />
    <template v-else>
      <GiftRecommendation v-for="gift in recommendedGifts" :key="gift.id" :gift="gift" />
      <SynthesisSection :synthesis-gifts="synthesisGifts" />
    </template>
  </main>

  <StudentSelectionModal
    :is-modal-open="isModalOpen"
    :students-data="studentsData"
    :selected-students="selectedStudents"
    @close-modal="closeModal"
    @toggle-student="toggleStudent"
  />
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import TheHeader from './components/TheHeader.vue'
  import WelcomeMessage from './components/WelcomeMessage.vue'
  import GiftRecommendation from './components/GiftRecommendation.vue'
  import SynthesisSection from './components/SynthesisSection.vue'
  import StudentSelectionModal from './components/StudentSelectionModal.vue'
  import { fetchStudentData } from './utils/fetchStudentData'
  import { fetchSrGiftData } from './utils/fetchSrGiftData'
  import { fetchSsrGiftData } from './utils/fetchSsrGiftData'
  import { getPreferenceValue } from './utils/getPreferenceValue'

  const studentsData = ref([])
  const giftsData = ref([])
  const selectedStudents = ref([])
  const isModalOpen = ref(false)

  onMounted(async () => {
    try {
      const students = await fetchStudentData('zh-tw')
      studentsData.value = students

      const srGifts = await fetchSrGiftData('zh-tw')
      const ssrGifts = await fetchSsrGiftData('zh-tw')

      giftsData.value = [
        ...srGifts.map((g) => ({ ...g, isSsr: false })),
        ...ssrGifts.map((g) => ({ ...g, isSsr: true })),
      ]
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  })

  function openModal() {
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
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
      const analysis = analyzeGift(gift)
      return { ...gift, analysis }
    })
  })

  const synthesisGifts = computed(() => {
    return analyzedGifts.value.filter((gift) => gift.analysis.shouldSynthesize)
  })

  const recommendedGifts = computed(() => {
    return analyzedGifts.value
      .filter((gift) => !gift.analysis.shouldSynthesize)
      .sort((a, b) => b.analysis.maxValue - a.analysis.maxValue)
  })

  function analyzeGift(gift) {
    const preferences = selectedStudents.value.map((student) => getPreferenceValue(student, gift))
    const maxValue = Math.max(...preferences)
    const bestStudents = selectedStudents.value.filter((student) => getPreferenceValue(student, gift) === maxValue)

    if (gift.isSsr) {
      // SSR Gifts (Purple)
      if (maxValue >= 180) {
        // L or XL
        return {
          shouldSynthesize: false,
          class: 'rec-best',
          typeText: '強烈推薦',
          title: `最佳選擇 (+${maxValue})`,
          characters: bestStudents,
          maxValue,
        }
      } else {
        // Normal
        return {
          shouldSynthesize: false,
          class: 'rec-any',
          typeText: '任意送給',
          title: `效果一般 (+${maxValue})`,
          characters: bestStudents,
          maxValue,
        }
      }
    } else {
      // SR Gifts (Yellow)
      if (maxValue >= 60) {
        // L or XL
        return {
          shouldSynthesize: false,
          class: 'rec-best',
          typeText: '強烈推薦',
          title: `最佳選擇 (+${maxValue})`,
          characters: bestStudents,
          maxValue,
        }
      } else if (maxValue >= 40) {
        // M
        return {
          shouldSynthesize: false,
          class: 'rec-good',
          typeText: '不錯的選擇',
          title: `不錯的選擇 (+${maxValue})`,
          characters: bestStudents,
          maxValue,
        }
      } else {
        // Normal, suggest synthesis
        return {
          shouldSynthesize: true,
          maxValue,
        }
      }
    }
  }
</script>
