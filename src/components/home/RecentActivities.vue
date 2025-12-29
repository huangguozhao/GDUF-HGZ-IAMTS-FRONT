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

    <!-- 空状态 -->
    <EmptyState
      v-if="activities.length === 0"
      title="暂无活动记录"
      description="最近没有任何系统活动，活动记录将在这里显示"
      type="info"
      compact
    >
      <template #icon>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L13.09 5.26L16.5 4.27L15.51 7.68L18.74 8.91L15.51 10.14L16.5 13.55L13.09 12.56L12 15.82L10.91 12.56L7.5 13.55L8.49 10.14L5.26 8.91L8.49 7.68L7.5 4.27L10.91 5.26L12 2Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import ActivityItem from './ActivityItem.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

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


