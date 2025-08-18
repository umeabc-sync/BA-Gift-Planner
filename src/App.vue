<script setup>
import { ref, computed } from 'vue';
import db from './assets/data/db.json';
import StudentSelectionModal from './components/StudentSelectionModal.vue';

const { studentsData, giftsData } = db;

const selectedStudents = ref([]);
const isModalOpen = ref(false);

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function toggleStudent(studentName) {
  const index = selectedStudents.value.indexOf(studentName);
  if (index > -1) {
    selectedStudents.value.splice(index, 1);
  } else {
    selectedStudents.value.push(studentName);
  }
}

const analyzedGifts = computed(() => {
  if (selectedStudents.value.length === 0) {
    return [];
  }

  const gifts = Object.entries(giftsData).map(([giftName, giftInfo]) => {
    const analysis = analyzeGift(giftName);
    return { name: giftName, info: giftInfo, analysis };
  });

  return gifts;
});

const synthesisGifts = computed(() => {
  return analyzedGifts.value.filter(gift => gift.analysis.shouldSynthesize);
});

const recommendedGifts = computed(() => {
  return analyzedGifts.value.filter(gift => !gift.analysis.shouldSynthesize);
});


function analyzeGift(giftName) {
  const giftInfo = giftsData[giftName];
  const preferences = selectedStudents.value.map(student =>
    studentsData[student].preferences[giftName]
  );

  const maxValue = Math.max(...preferences);

  const bestStudents = selectedStudents.value.filter(student =>
    studentsData[student].preferences[giftName] === maxValue
  );

  if (giftInfo.quality === 'yellow') {
    if (maxValue === 60) {
      return {
        shouldSynthesize: false,
        class: 'rec-best',
        typeText: '強烈推薦',
        title: `最佳選擇 (+${maxValue})`,
        characters: bestStudents
      };
    } else if (maxValue === 40) {
      return {
        shouldSynthesize: false,
        class: 'rec-good',
        typeText: '可以送給',
        title: `不錯的選擇 (+${maxValue})`,
        characters: bestStudents
      };
    } else {
      return {
        shouldSynthesize: true
      };
    }
  } else { // purple quality
    if (maxValue === 240) {
      return {
        shouldSynthesize: false,
        class: 'rec-best',
        typeText: '強烈推薦',
        title: `最佳選擇 (+${maxValue})`,
        characters: bestStudents
      };
    } else if (maxValue === 180) {
      return {
        shouldSynthesize: false,
        class: 'rec-good',
        typeText: '可以送給',
        title: `不錯的選擇 (+${maxValue})`,
        characters: bestStudents
      };
    } else {
      return {
        shouldSynthesize: false,
        class: 'rec-any',
        typeText: '任意送給',
        title: `效果一般 (+${maxValue})`,
        characters: bestStudents
      };
    }
  }
}
</script>

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
        <div v-for="gift in recommendedGifts" :key="gift.name" class="gift-row">
          <div class="gift-island" :class="gift.info.quality === 'yellow' ? 'gift-yellow' : 'gift-purple'"
            style="position: relative;">
            <div class="gift-icon">{{ gift.info.icon }}</div>
            <div class="gift-name">{{ gift.name }}</div>
          </div>

          <div class="recommendation-island">
            <div class="rec-type" :class="gift.analysis.class">{{ gift.analysis.typeText }}</div>
            <div class="recommendation-title">{{ gift.analysis.title }}</div>
            <div class="character-avatars">
              <div v-for="char in gift.analysis.characters" :key="char" class="character-avatar">
                {{ studentsData[char].avatar }}
                <div class="tooltip">
                  {{ char }}<br>
                  {{ studentsData[char].school }}<br>
                  好感度: +{{ studentsData[char].preferences[gift.name] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 添加合成建議區塊 -->
        <div v-if="synthesisGifts.length > 0" class="synthesis-section">
          <div class="synthesis-title">建議拿去合成的禮物</div>
          <div class="synthesis-gifts">
            <div v-for="gift in synthesisGifts" :key="gift.name" class="synthesis-gift"
              :class="gift.info.quality === 'yellow' ? 'gift-yellow' : 'gift-purple'" style="position: relative;">
              <div class="gift-icon" style="font-size: 24px;">{{ gift.info.icon }}</div>
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