<template>
  <PinkBaseModal :is-visible="isVisible" :max-width="'500px'" @close="close">
    <template #header>
      <h3>{{ t('bondCalculator.editBondTitle', { name: t(`student.name.${student.id}`) }) }}</h3>
    </template>
    <template #body>
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
    </template>
  </PinkBaseModal>
</template>

<script setup>
  import { computed } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useStudentStore } from '@/store/student'
  import { useBondExpData } from '@/utils/fetchBondExpData'
  import PinkBaseModal from '@components/ui/PinkBaseModal.vue'

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
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #34495e;
  }

  .dark-mode .form-group label {
    color: #e0e6ed;
  }

  .form-group input[type='number'] {
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    color: #2c3e50;
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
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    background: #ddd;
    border-radius: 5px;
    outline: none;
    transition: opacity 0.2s;
  }

  .dark-mode .exp-slider input[type='range'] {
    background: #2a4a6e;
  }

  .exp-slider input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fb9eb1;
    cursor: pointer;
    border: 2px solid #fff;
  }

  .dark-mode .exp-slider input[type='range']::-webkit-slider-thumb {
    background: #fd7591;
    border-color: #1f3048;
  }

  .exp-slider input[type='range']::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fb9eb1;
    cursor: pointer;
    border: 2px solid #fff;
  }

  .dark-mode .exp-slider input[type='range']::-moz-range-thumb {
    background: #fd7591;
    border-color: #1f3048;
  }

  .exp-slider span {
    font-weight: bold;
    color: #2c3e50;
  }

  .dark-mode .exp-slider span {
    color: #e0e6ed;
  }
</style>
