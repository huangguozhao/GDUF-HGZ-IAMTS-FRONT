<template>
  <div class="resource-item modern-card">
    <div class="resource-left">
      <div class="resource-label">{{ label }}</div>
      <div class="resource-value">{{ value }}</div>
    </div>
    <div class="resource-right">
      <div class="bar-bg">
        <div class="bar-fill" :style="{ width: percent + '%', background: color }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  percent: { type: Number, required: true },
  color: { type: String, default: '#67c23a' }
})
</script>

<style scoped>
.resource-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
}

.resource-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.resource-label {
  font-size: 13px;
  color: #606266;
}

.resource-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.resource-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.bar-bg {
  width: 100%;
  height: 10px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.4s ease;
}
</style>


