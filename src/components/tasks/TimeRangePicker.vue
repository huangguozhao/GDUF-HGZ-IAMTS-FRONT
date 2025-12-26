<template>
  <div class="time-range-picker">
    <label>时间区间</label>
    <div class="inputs">
      <input type="time" v-model="from" /> <span>至</span> <input type="time" v-model="to" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';
const emit = defineEmits(['change']);
const from = ref('10:00');
const to = ref('11:00');

watch([from,to], () => emit('change', { from: from.value, to: to.value }));
</script>

<style scoped>
.time-range-picker { margin-top:8px; }
.time-range-picker .inputs { display:flex; gap:8px; align-items:center; }
.time-range-picker input { padding:6px; }
</style>


