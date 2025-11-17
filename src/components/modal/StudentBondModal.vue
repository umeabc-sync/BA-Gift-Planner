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
          <input type="number" id="bond-level" v-model.number="bondLevel" min="1" max="100" />
        </div>
        <div class="form-group">
          <label for="bond-exp">{{ t('bondCalculator.bondExp') }}</label>
          <div class="exp-slider">
            <input type="range" id="bond-exp" v-model.number="bondExp" :min="0" :max="maxExp" />
            <span>{{ bondExp }} / {{ maxExp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
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

  const bondLevel = computed({
    get() {
      return props.student ? studentStore.getStudentBondData(props.student.id).level : 1
    },
    set(value) {
      if (!props.student) return
      const currentData = studentStore.getStudentBondData(props.student.id)
      const newLevel = Math.max(1, Math.min(100, Number(value)))
      if (newLevel !== currentData.level) {
        studentStore.updateStudentBond(props.student.id, newLevel, 0)
      }
    },
  })

  const bondExp = computed({
    get() {
      return props.student ? studentStore.getStudentBondData(props.student.id).exp : 0
    },
    set(value) {
      if (!props.student) return
      const currentData = studentStore.getStudentBondData(props.student.id)
      const newExp = Math.max(0, Math.min(maxExp.value, Number(value)))
      if (newExp !== currentData.exp) {
        studentStore.updateStudentBond(props.student.id, currentData.level, newExp)
      }
    },
  })

  const maxExp = computed(() => {
    if (!bondExpTable.value || !props.student) return 0
    const rankInfo = bondExpTable.value.find((r) => r.rank === bondLevel.value)
    return rankInfo ? rankInfo.exp : 0
  })

  const close = () => {
    emit('close')
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
</style>
