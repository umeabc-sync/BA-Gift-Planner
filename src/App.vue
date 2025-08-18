<template>
  <!-- 固定頂部工具列 -->
  <div class="header">
    <div class="header-title">蔚藍檔案送禮工具</div>
    <div style="display: flex; align-items: center; gap: 15px;">
      <span class="selected-count">已選擇 {{ selectedStudents.length }} 位學生</span>
      <button class="select-characters-btn" @click="openModal">
        選擇角色
      </button>
    </div>
  </div>

  <!-- 主要內容區域 -->
  <div class="main-container">
    <div id="mainContent">
      <div v-if="selectedStudents.length === 0" class="no-selection">
        請點擊右上角「選擇角色」來選擇要培養好感度的學生
      </div>

      <template v-else>
        <div v-for="gift in recommendedGifts" :key="gift.id" class="gift-row">
          <div class="gift-island" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'"
            style="position: relative;">
            <img :src="getGiftUrl(gift.id, gift.isSsr)" class="gift-icon" />
            <div class="gift-name">{{ gift.name }}</div>
          </div>

          <div class="recommendation-island">
            <div class="rec-type" :class="gift.analysis.class">{{ gift.analysis.typeText }}</div>
            <div class="recommendation-title">{{ gift.analysis.title }}</div>
            <div class="character-avatars">
              <div v-for="char in gift.analysis.characters" :key="char.id" class="character-avatar">
                <img :src="getAvatarUrl(char.id)" />
                <div class="tooltip">
                  {{ char.name }}<br>
                  {{ char.school }}<br>
                  好感度: +{{ getPreferenceValue(char, gift) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 添加合成建議區塊 -->
        <div v-if="synthesisGifts.length > 0" class="synthesis-section">
          <div class="synthesis-title">建議拿去合成的禮物</div>
          <div class="synthesis-gifts">
            <div v-for="gift in synthesisGifts" :key="gift.id" class="synthesis-gift"
              :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'" style="position: relative;">
              <img :src="getGiftUrl(gift.id, gift.isSsr)" class="gift-icon" style="width: 100%;" />
              <div class="gift-name">{{ gift.name }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <StudentSelectionModal
    :isModalOpen="isModalOpen"
    :studentsData="studentsData"
    :selectedStudents="selectedStudents"
    @closeModal="closeModal"
    @toggleStudent="toggleStudent"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import StudentSelectionModal from './components/StudentSelectionModal.vue';
import { fetchStudentData } from './utils/fetchStudentData';
import { fetchSrGiftData } from './utils/fetchSrGiftData';
import { fetchSsrGiftData } from './utils/fetchSsrGiftData';
import { getAvatarUrl } from './utils/getAvatarUrl';
import { getGiftUrl } from './utils/getGiftUrl';

const studentsData = ref([]);
const giftsData = ref([]);
const selectedStudents = ref([]);
const isModalOpen = ref(false);

onMounted(async () => {
  try {
    const students = await fetchStudentData('zh-tw');
    studentsData.value = students;

    const srGifts = await fetchSrGiftData('zh-tw');
    const ssrGifts = await fetchSsrGiftData('zh-tw');
    
    giftsData.value = [
      ...srGifts.map(g => ({ ...g, isSsr: false })),
      ...ssrGifts.map(g => ({ ...g, isSsr: true }))
    ];
  } catch (error) {
    console.error("Failed to load data:", error);
  }
});

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function toggleStudent(student) {
  const index = selectedStudents.value.findIndex(s => s.id === student.id);
  if (index > -1) {
    selectedStudents.value.splice(index, 1);
  } else {
    selectedStudents.value.push(student);
  }
}

const getPreferenceValue = (student, gift) => {
  const giftType = gift.isSsr ? 'ssr' : 'sr';
  const favorData = student.favor[giftType];
  if (favorData.xl.includes(gift.id)) return gift.isSsr ? 240 : 80;
  if (favorData.l.includes(gift.id)) return gift.isSsr ? 180 : 60;
  if (favorData.m && favorData.m.includes(gift.id)) return 40;
  return gift.isSsr ? 120 : 20;
};

const analyzedGifts = computed(() => {
  if (selectedStudents.value.length === 0) {
    return [];
  }

  return giftsData.value.map(gift => {
    const analysis = analyzeGift(gift);
    return { ...gift, analysis };
  });
});

const synthesisGifts = computed(() => {
  return analyzedGifts.value.filter(gift => gift.analysis.shouldSynthesize);
});

const recommendedGifts = computed(() => {
  return analyzedGifts.value
    .filter(gift => !gift.analysis.shouldSynthesize)
    .sort((a, b) => b.analysis.maxValue - a.analysis.maxValue);
});

function analyzeGift(gift) {
  const preferences = selectedStudents.value.map(student => getPreferenceValue(student, gift));
  const maxValue = Math.max(...preferences);
  const bestStudents = selectedStudents.value.filter(student => getPreferenceValue(student, gift) === maxValue);

  if (gift.isSsr) { // SSR Gifts (Purple)
    if (maxValue >= 180) { // L or XL
      return {
        shouldSynthesize: false,
        class: 'rec-best',
        typeText: '強烈推薦',
        title: `最佳選擇 (+${maxValue})`,
        characters: bestStudents,
        maxValue
      };
    } else { // Normal
      return {
        shouldSynthesize: false,
        class: 'rec-any',
        typeText: '任意送給',
        title: `效果一般 (+${maxValue})`,
        characters: bestStudents,
        maxValue
      };
    }
  } else { // SR Gifts (Yellow)
    if (maxValue >= 60) { // L or XL
      return {
        shouldSynthesize: false,
        class: 'rec-best',
        typeText: '強烈推薦',
        title: `最佳選擇 (+${maxValue})`,
        characters: bestStudents,
        maxValue
      };
    } else if (maxValue >= 40) { // M
      return {
        shouldSynthesize: false,
        class: 'rec-good',
        typeText: '可以送給',
        title: `不錯的選擇 (+${maxValue})`,
        characters: bestStudents,
        maxValue
      };
    } else { // Normal, suggest synthesis
      return {
        shouldSynthesize: true,
        maxValue
      };
    }
  }
}
</script>