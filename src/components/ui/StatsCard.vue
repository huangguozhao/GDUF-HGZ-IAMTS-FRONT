<template>
  <div :class="['overview-card', flat ? '' : 'glass-card', 'hover-lift']">
    <div class="card-icon" :class="iconClass">
      <slot name="icon">{{ icon }}</slot>
    </div>
    <div class="card-content">
      <div class="card-label">{{ label }}</div>
      <div class="card-value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '' },
  label: { type: String, required: true },
  value: { type: [String, Number], default: '-' },
  variant: { type: String, default: '' }, // success/danger/warning/primary/info
  flat: { type: Boolean, default: false }
})

const iconClass = computed(() => {
  return props.variant ? `${props.variant}-icon` : ''
})
</script>

<style scoped>
.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
}
.card-icon {
  font-size: 28px;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}
.card-label { font-size: 13px; color: #909399; margin-bottom: 6px; }
.card-value { font-size: 22px; font-weight: 700; color: #303133; }
</style>


