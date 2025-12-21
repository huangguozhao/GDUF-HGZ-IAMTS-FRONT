<template>
  <div class="recent-activities">
    <div class="section-header">
      <h3 class="section-title">最近活动</h3>
      <el-link href="#" class="view-more-link" @click="$emit('view-more')">查看更多</el-link>
    </div>

    <div class="activities-list">
      <ActivityItem
        v-for="(act, idx) in activities"
        :key="act.id || idx"
        :time="act.time"
        :title="act.title"
        :desc="act.desc"
        :origin="act.origin"
      />
    </div>

    <div v-if="activities.length === 0" class="empty-state">
      <el-empty description="暂无活动" :image-size="80" />
    </div>
  </div>
</template>

<script setup>
import ActivityItem from './ActivityItem.vue'
const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.recent-activities .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.empty-state {
  padding: 24px;
  text-align: center;
}
</style>


