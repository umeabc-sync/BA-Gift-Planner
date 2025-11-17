<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('bondCalculator.editBondTitle', { name: t(`student.name.${student.id}`) }) }}</h3>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="bond-level">{{ t('bondCalculator.bondLevel') }}</label>
          <input type="number" id="bond-level" v-model.number="editableLevel" min="1" max="100" />
        </div>
        <div class="form-group">
          <label for="bond-exp">{{ t('bondCalculator.bondExp') }}</label>
          <div class="exp-slider">
            <input
              type="range"
              id="bond-exp"
              v-model.number="editableExp"
              :min="0"
              :max="maxExp"
            />
            <span>{{ editableExp }} / {{ maxExp }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="save-button" @click="save">{{ t('common.save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useStudentStore } from '@/store/student'
  import { useBondExpData } from '@/utils/fetchBondExpData'

  const props = defineProps({
    isVisible: Boolean,
    student: Object,
  })

  const emit = defineEmits(['close'])

  const { t } = useI18n()
  const studentStore = useStudentStore()
  const { data: bondExpTable } = useBondExpData()

  const editableLevel = ref(1)
  const editableExp = ref(0)

  watch(
    () => props.student,
    (newStudent) => {
      if (newStudent) {
        const bondData = studentStore.getStudentBondData(newStudent.id)
        editableLevel.value = bondData.level
        editableExp.value = bondData.exp
      }
    }
  )

  const maxExp = computed(() => {
    if (!bondExpTable.value || !props.student) return 0
    const rankInfo = bondExpTable.value.find((r) => r.rank === editableLevel.value)
    return rankInfo ? rankInfo.exp : 0
  })

  watch(editableLevel, (newLevel, oldLevel) => {
    if (newLevel !== oldLevel) {
      editableExp.value = 0
    }
    if (newLevel > 100) editableLevel.value = 100
    if (newLevel < 1) editableLevel.value = 1
  })

  watch(editableExp, (newExp) => {
    if (newExp > maxExp.value) {
      editableExp.value = maxExp.value
    }
  })

  const close = () => {
    emit('close')
  }

  const save = () => {
    studentStore.updateStudentBond(props.student.id, editableLevel.value, editableExp.value)
    close()
  }
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
    z-index: 1000;
  }

  .modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
  }

  .dark-mode .modal-content {
    background: #1f3048;
    color: #e0e6ed;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .dark-mode .modal-header {
    border-bottom-color: #2a4a6e;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
  }

  .dark-mode .close-button {
    color: #e0e6ed;
  }

  .modal-body {
    padding: 20px 0;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  .form-group input[type='number'] {
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .dark-mode .form-group input[type='number'] {
    background: #1a2b40;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .exp-slider {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .exp-slider input[type='range'] {
    flex-grow: 1;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid #eee;
  }

  .dark-mode .modal-footer {
    border-top-color: #2a4a6e;
  }

  .save-button {
    background-color: #466398;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
  }

  .dark-mode .save-button {
    background-color: #00a4e4;
  }
</style>
