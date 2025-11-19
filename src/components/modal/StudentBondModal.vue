<template>
  <PinkBaseModal :is-visible="isVisible" :max-width="'480px'" @close="close">
    <template #header>
      <h3>
        {{ t('bondCalculator.editBondTitle', { name: student ? t(`student.name.${student.id}`) : '' }) }}
      </h3>
    </template>

    <template #body>
      <div class="bond-editor-container">
        <div class="control-card">
          <label class="control-label">{{ t('bondCalculator.bondLevel') }}</label>
          <div class="stepper-control">
            <button class="step-btn" @click="adjustLevel(-1)" :disabled="bondLevel <= 1">－</button>

            <div class="level-display">
              <span class="level-label">Lv.</span>
              <input type="number" v-model.number="bondLevel" min="1" max="100" class="level-input" />
            </div>

            <button class="step-btn" @click="adjustLevel(1)" :disabled="bondLevel >= 100">＋</button>
          </div>
        </div>

        <div class="control-card">
          <div class="exp-header">
            <label class="control-label">{{ t('bondCalculator.bondExp') }}</label>
            <span class="exp-text">
              <span class="current">{{ bondExp }}</span>
              <span class="separator">/</span>
              <span class="max">{{ maxExp }}</span>
            </span>
          </div>

          <div class="slider-container">
            <input
              type="range"
              v-model.number="bondExp"
              :min="0"
              :max="maxExp"
              class="custom-range"
              :style="sliderStyle"
            />
          </div>
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

  // Bond Level Logic
  const bondLevel = computed({
    get() {
      return props.student ? studentStore.getStudentBondData(props.student.id).level : 1
    },
    set(value) {
      if (!props.student) return
      const currentData = studentStore.getStudentBondData(props.student.id)
      // Ensure value is a valid number
      let safeValue = value === '' ? 1 : parseInt(value)
      if (isNaN(safeValue)) safeValue = 1

      const newLevel = Math.max(1, Math.min(100, safeValue))

      if (newLevel !== currentData.level) {
        studentStore.updateStudentBond(props.student.id, newLevel, 0)
      }
    },
  })

  // Helper for buttons
  const adjustLevel = (delta) => {
    bondLevel.value = bondLevel.value + delta
  }

  // Bond Exp Logic
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

  // Dynamic style for slider background fill
  const sliderStyle = computed(() => {
    const percentage = maxExp.value > 0 ? (bondExp.value / maxExp.value) * 100 : 0
    return {
      '--percent': `${percentage}%`,
    }
  })

  const close = () => {
    emit('close')
  }
</script>

<style scoped>
  .bond-editor-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 10px 5px;
  }

  /* --- Card Style Container --- */
  .control-card {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 12px;
    border: 2px solid #eef0f5;
    transition: all 0.3s ease;
  }

  .control-label {
    display: block;
    margin-bottom: 10px;
    font-weight: 700;
    font-size: 0.95rem;
    color: #5f6f80;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* --- Stepper Control (Level) --- */
  .stepper-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .step-btn {
    font-family: inherit;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: #fff;
    color: #fb9eb1;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  .step-btn:hover:not(:disabled) {
    background: #fb9eb1;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(251, 158, 177, 0.3);
  }

  .step-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #e0e0e0;
    color: #aaa;
  }

  .level-display {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 10px;
    padding: 5px 15px;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.03);
    border: 1px solid transparent;
    transition: border-color 0.2s;
  }

  .control-card:focus-within .level-display {
    border-color: #fb9eb1;
  }

  .level-label {
    font-size: 1rem;
    font-weight: bold;
    color: #fb9eb1;
    margin-right: 5px;
  }

  .level-input {
    border: none;
    background: transparent;
    font-size: 1.5rem;
    font-weight: 800;
    color: #2c3e50;
    width: 60px;
    text-align: center;
    outline: none;
    /* Hide spinners */
    -moz-appearance: textfield;
  }

  .level-input::-webkit-outer-spin-button,
  .level-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* --- Exp Slider --- */
  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .exp-text {
    font-family: monospace;
    font-size: 0.9rem;
    color: #7f8c8d;
  }

  .exp-text .current {
    color: #fb9eb1;
    font-weight: bold;
  }

  /* Custom Range Slider */
  .slider-container {
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
  }

  .custom-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 5px;
    outline: none;
    cursor: pointer;
    /* Dynamic linear gradient for the fill effect */
    background: linear-gradient(to right, #fb9eb1 0%, #fb9eb1 var(--percent), #e0e6ed var(--percent), #e0e6ed 100%);
    transition: background 0.1s;
  }

  /* Thumb Styling (Chrome/Safari) */
  .custom-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #fb9eb1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s;
  }

  .custom-range::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  /* Thumb Styling (Firefox) */
  .custom-range::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #fb9eb1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.1s;
  }

  /* --- Dark Mode Overrides --- */
  .dark-mode .control-card {
    background: #2a4a6e; /* Slightly lighter than modal bg */
    border-color: #3b5c85;
  }

  .dark-mode .control-label {
    color: #a0b1c5;
  }

  .dark-mode .level-display {
    background: #1f3048;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .dark-mode .level-input {
    color: #e0e6ed;
  }

  .dark-mode .step-btn {
    background: #3b5c85;
    color: #fd7591;
  }

  .dark-mode .step-btn:hover:not(:disabled) {
    background: #fd7591;
    color: white;
  }

  .dark-mode .step-btn:disabled {
    background: #2a3b55;
    color: #4a5b75;
  }

  .dark-mode .custom-range {
    /* Darker track */
    background: linear-gradient(to right, #fd7591 0%, #fd7591 var(--percent), #152233 var(--percent), #152233 100%);
  }

  .dark-mode .custom-range::-webkit-slider-thumb {
    border-color: #fd7591;
    background: #2a4a6e;
  }

  .dark-mode .custom-range::-moz-range-thumb {
    border-color: #fd7591;
    background: #2a4a6e;
  }

  .dark-mode .exp-text {
    color: #a0b1c5;
  }

  .dark-mode .exp-text .current {
    color: #fd7591;
  }
</style>
