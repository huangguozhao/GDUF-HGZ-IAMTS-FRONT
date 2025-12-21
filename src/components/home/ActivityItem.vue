<template>
  <div class="activity-item-component">
    <div class="activity-time">{{ time }}</div>
    <div class="activity-content">
      <div class="activity-title">{{ title }}</div>
      <div class="activity-desc">{{ desc }}</div>
      <div class="activity-origin">{{ origin }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  time: { type: String, default: '' },
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
  origin: { type: String, default: '' }
})
</script>

<style scoped>
.activity-item-component {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  align-items: flex-start;
  transition: background 0.15s ease;
}
.activity-item-component:hover {
  background: #f8fbff;
}
.activity-time {
  font-size: 12px;
  color: #909399;
  min-width: 56px;
}
.activity-content {
  flex: 1;
}
.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.activity-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}
.activity-origin {
  font-size: 12px;
  color: #909399;
}
</style>


