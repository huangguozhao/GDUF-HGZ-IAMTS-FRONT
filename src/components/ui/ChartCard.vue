<template>
  <div :class="['chart-card', flat ? '' : 'glass-card']">
    <div class="chart-title">{{ title }}</div>
    <div class="chart-slot">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  flat: { type: Boolean, default: false }
})
</script>

<style scoped>
.chart-card {
  padding: 14px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.chart-slot { width: 100%; min-height: 220px; }
</style>


