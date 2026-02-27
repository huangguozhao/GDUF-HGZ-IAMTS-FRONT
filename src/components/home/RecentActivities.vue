<template>
  <div class="recent-activities">
    <div class="section-header">
      <h3 class="section-title">最近活动</h3>
      <el-link href="#" class="view-more-link" @click.prevent="$emit('view-more')">查看更多</el-link>
    </div>

    <!-- 按时间分组显示 -->
    <div v-if="groupedActivities.length > 0" class="activities-grouped">
      <div v-for="group in groupedActivities" :key="group.label" class="activity-group">
        <div class="group-header">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-count">{{ group.activities.length }}条</span>
        </div>
        <div class="activities-list">
          <ActivityItem
            v-for="(act, idx) in group.activities"
            :key="act.id || idx"
            :time="act.time"
            :title="act.title"
            :desc="act.desc"
            :origin="act.origin"
          />
        </div>
      </div>
    </div>

    <!-- 未分组列表（备用） -->
    <div v-else-if="activities.length > 0" class="activities-list">
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
      v-if="activities.length === 0 && !loading"
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
import { computed } from 'vue'
import ActivityItem from './ActivityItem.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 格式化时间戳为日期
const parseTime = (timeStr) => {
  if (!timeStr) return null
  try {
    return new Date(timeStr)
  } catch (e) {
    return null
  }
}

// 获取日期标签
const getDateLabel = (date) => {
  if (!date) return '未知'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dateOnly.getTime() === today.getTime()) {
    return '今天'
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return '昨天'
  } else if (dateOnly.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
    // 一周内显示星期几
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[dateOnly.getDay()]
  } else {
    // 更早的显示具体日期
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

// 按时间分组
const groupedActivities = computed(() => {
  if (!props.activities || props.activities.length === 0) {
    return []
  }

  const groups = {}

  props.activities.forEach(activity => {
    const date = parseTime(activity.time)
    const label = getDateLabel(date)

    if (!groups[label]) {
      groups[label] = {
        label,
        activities: []
      }
    }
    groups[label].activities.push(activity)
  })

  // 转换为数组并按时间排序
  const order = { '今天': 0, '昨天': 1, '周日': 2, '周一': 3, '周二': 4, '周三': 5, '周四': 6, '周五': 7, '周六': 8 }

  return Object.values(groups).sort((a, b) => {
    const orderA = order[a.label] !== undefined ? order[a.label] : 100
    const orderB = order[b.label] !== undefined ? order[b.label] : 100
    return orderA - orderB
  })
})
</script>

<style scoped>
.recent-activities .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activities-grouped {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.group-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.group-count {
  font-size: 12px;
  color: #909399;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  padding: 24px;
  text-align: center;
}
</style>
