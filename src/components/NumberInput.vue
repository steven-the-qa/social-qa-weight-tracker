<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: number | null;
  placeholder: string;
  min?: number;
  max?: number;
  id?: string;
  name?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const inputValue = ref(props.modelValue?.toString() || '');

const filterInput = (event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement;
  const currentValue = input.value;
  const key = event.key;

  if (key === 'Tab') return;
  if (key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight') return;

  // Allow letters only if there's a number first
  if (/^[a-zA-Z]$/.test(key)) {
    if (!/^\d+(\.\d{0,1})?$/.test(currentValue)) {
      event.preventDefault();
    }
    return;
  }

  // Don't allow numbers after letters
  if (/^[0-9]$/.test(key) && /[a-zA-Z]/.test(currentValue)) {
    event.preventDefault();
    return;
  }

  if (/^[0-9]$/.test(key)) {
    const newValue = currentValue + key;
    if (props.max && parseFloat(newValue) > props.max) {
      event.preventDefault();
    }
    return;
  }

  if (key === '.' && !currentValue.includes('.') && currentValue.length > 0) return;

  event.preventDefault();
};

const formatInput = () => {
  let value = inputValue.value;
  
  // Split the value into number and letter parts
  const match = value.match(/^(\d+(\.\d{0,1})?)?([a-zA-Z]*)$/);
  if (!match) {
    inputValue.value = '';
    emit('update:modelValue', null);
    return;
  }

  const numericPart = match[1] || '';
  const letterPart = match[3] || '';

  if (numericPart) {
    const parts = numericPart.split('.');
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 1);
      value = parts.join('.') + letterPart;
    }
    const numValue = parseFloat(numericPart);
    if (props.max && numValue > props.max) {
      value = props.max.toString() + letterPart;
    }
  }

  inputValue.value = value;
  emit('update:modelValue', parseFloat(numericPart) || null);
};

const handleBlur = () => {
  let value = inputValue.value;
  if (value.endsWith('.')) {
    value += '0';
  }
  inputValue.value = value;
  emit('update:modelValue', parseFloat(value) || null);
};

const handleInput = (event: Event) => {
  inputValue.value = (event.target as HTMLInputElement).value;
  formatInput();
};

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue?.toString() || '';
});
</script>

<template>
  <input
    :value="inputValue"
    @input="handleInput"
    @blur="handleBlur"
    class="no-spinner dark:placeholder:text-gray-500 placeholder:text-[#BDBDBD] h-14 pl-3 mr-5 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white border border-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
    type="text"
    :id="id"
    :name="name"
    :placeholder="placeholder"
    required
    tabindex="0"
  >
</template>

<style scoped>
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
}
</style>
