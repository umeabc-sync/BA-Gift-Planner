<template>
  <div class="quantity-control">
    <button v-if="showMinMax" @click="$emit('setMin')" class="min-max-btn" :disabled="value === min || disabled">
      <span class="min">MIN</span>
    </button>
    <button
      @mousedown="startChangingQuantity('decrement')"
      @mouseup="stopChangingQuantity"
      @mouseleave="stopChangingQuantity"
      :disabled="value <= min || disabled"
      class="quantity-btn"
    >
      <span class="minus">－</span>
    </button>
    <div class="quantity-display">
      <input
        type="number"
        :value="value"
        @input="$emit('update:value', parseInput($event))"
        :min="min"
        :max="max"
        class="quantity-input"
        :disabled="disabled"
      />
    </div>
    <button
      @mousedown="startChangingQuantity('increment')"
      @mouseup="stopChangingQuantity"
      @mouseleave="stopChangingQuantity"
      :disabled="value >= max || disabled"
      class="quantity-btn"
    >
      <span class="plus">＋</span>
    </button>
    <button
      v-if="showMinMax"
      @click="$emit('setMax')"
      class="min-max-btn"
      :disabled="value === max || available === 0 || disabled"
    >
      <span class="max">MAX</span>
    </button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 999 },
    available: { type: Number, default: 999 },
    showMinMax: { type: Boolean, default: false },
    useContinuous: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  })

  const emit = defineEmits(['update:value', 'setMin', 'setMax', 'increment', 'decrement'])

  let pressTimer = ref(null)
  let repeatTimer = ref(null)

  const startChangingQuantity = (action) => {
    if (!props.useContinuous) {
      if (action === 'increment') {
        emit('increment')
      } else {
        emit('decrement')
      }
      return
    }

    const func = action === 'increment' ? () => emit('increment') : () => emit('decrement')
    func()

    pressTimer.value = setTimeout(() => {
      repeatTimer.value = setInterval(() => {
        func()
        if (
          (action === 'increment' && props.value >= props.max) ||
          (action === 'decrement' && props.value <= props.min)
        ) {
          stopChangingQuantity()
        }
      }, 100)
    }, 400)
  }

  const stopChangingQuantity = () => {
    if (!props.useContinuous) return
    clearTimeout(pressTimer.value)
    clearInterval(repeatTimer.value)
  }

  const parseInput = (event) => {
    let numValue = parseInt(event.target.value, 10)
    if (isNaN(numValue) || numValue < props.min) {
      numValue = props.min
    }
    if (numValue > props.max) {
      numValue = props.max
    }
    return numValue
  }
</script>

<style scoped>
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-grow: 1;
    justify-content: center;
  }

  .quantity-btn {
    font-family: inherit;
    background-color: white;
    border: none;
    color: #4d5a6d;
    cursor: pointer;
    border-radius: 4px;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    transform: skew(-10deg);
    font-size: 1.5rem;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
  }

  .min-max-btn {
    font-family: inherit;
    background-color: white;
    border: none;
    color: #496f8f;
    cursor: pointer;
    border-radius: 4px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    transform: skew(-10deg);
    font-size: 1.25rem;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    padding: 5px 8px;
  }

  .dark-mode .quantity-btn,
  .dark-mode .min-max-btn {
    background-color: #2a4a6e;
    color: #e0e6ed;
  }

  .quantity-btn:active,
  .min-max-btn:active {
    transform: scale(0.9) skew(-10deg);
  }

  .quantity-btn:disabled,
  .min-max-btn:disabled {
    background-color: #e2e3e3;
    cursor: not-allowed;
  }

  .quantity-btn:disabled .minus,
  .quantity-btn:disabled .plus {
    color: #828282;
  }

  .plus,
  .minus,
  .min,
  .max {
    user-select: none;
    transform: skew(10deg);
  }

  .plus {
    color: #3dcffd;
  }

  .minus {
    color: #ff6f00;
  }

  .quantity-display {
    background-color: #4d5a6d;
    color: #f6f7f6;
    width: 60px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: skew(-10deg);
    border-radius: 4px;
  }

  .quantity-display .quantity-input {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    color: inherit;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    transform: skew(10deg);
    -moz-appearance: textfield;
  }

  .quantity-display .quantity-input::-webkit-outer-spin-button,
  .quantity-display .quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
