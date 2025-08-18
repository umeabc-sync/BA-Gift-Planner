<template>
  <div class="modal" :class="{ 'show': isModalOpen }" @click.self="$emit('closeModal')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">選擇要培養好感度的學生</div>
        <button class="close-btn" @click="$emit('closeModal')">&times;</button>
      </div>
      <div class="student-grid">
        <div v-for="student in studentsData" :key="student.id" class="student-card"
          :class="{ 'selected': selectedStudents.some(s => s.id === student.id) }" @click="$emit('toggleStudent', student)">
          <img :src="getAvatarUrl(student.id)" class="student-avatar-large" />
          <div class="student-name">{{ student.name }}</div>
          <div class="student-school">{{ student.school }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAvatarUrl } from '../utils/getAvatarUrl';

defineProps({
  isModalOpen: Boolean,
  studentsData: Array,
  selectedStudents: Array
});

defineEmits(['closeModal', 'toggleStudent']);
</script>

<style scoped>
/* Styles for the modal, copied from style.css */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #2c2c2c;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 800px;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
}

.close-btn {
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  background: none;
  border: none;
  cursor: pointer;
}

.close-btn:hover,
.close-btn:focus {
  color: white;
  text-decoration: none;
  cursor: pointer;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  padding-top: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.student-card {
  background-color: #3c3c3c;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
}

.student-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.student-card.selected {
  border-color: #4CAF50;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.student-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 10px;
  object-fit: cover;
  background-color: #4a4a4a;
}

.student-name {
  font-weight: bold;
}

.student-school {
  font-size: 12px;
  color: #ccc;
}
</style>