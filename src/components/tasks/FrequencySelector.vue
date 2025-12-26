<template>
  <div class="frequency-selector">
    <div class="options">
      <button :class="{ active: value === 'daily' }" @click="$emit('update:value','daily')">每日</button>
      <button :class="{ active: value === 'weekly' }" @click="$emit('update:value','weekly')">每周</button>
      <button :class="{ active: value === 'monthly' }" @click="$emit('update:value','monthly')">每月</button>
    </div>

    <div class="detail" v-if="value === 'weekly'">
      <div class="weekday-buttons">
        <button v-for="d in weekdays" :key="d" :class="{ active: selectedWeekdays.includes(d) }" @click="toggleWeekday(d)">{{ d }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
const props = defineProps({ value: { type: String, default: 'daily' }, modelValue: String });
const emit = defineEmits(['update:value', 'change']);

const weekdays = ['周一','周二','周三','周四','周五','周六','周日'];
const selectedWeekdays = ref([]);

function toggleWeekday(day) {
  const idx = selectedWeekdays.value.indexOf(day);
  if (idx === -1) selectedWeekdays.value.push(day);
  else selectedWeekdays.value.splice(idx,1);
  emit('change', selectedWeekdays.value.slice());
}
</script>

<style scoped>
.frequency-selector .options { display:flex; gap:8px; }
.frequency-selector button { padding:8px 12px; border-radius:6px; background:#f7f9fc; border:1px solid #e6eef8; }
.frequency-selector button.active { background:#e6f3ff; border-color:#bfe3ff; }
.weekday-buttons { margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; }
.weekday-buttons button { padding:6px 10px; border-radius:6px; background:#fafafa; }
.weekday-buttons button.active { background:#dff3ff; }
</style>


