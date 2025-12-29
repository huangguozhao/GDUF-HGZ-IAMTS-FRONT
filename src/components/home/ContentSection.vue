<template>
  <div class="content-section">
    <ResponsiveGrid
      :columns="{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2 }"
      :gap="24"
      class="content-grid"
    >
      <transition name="left-section-slide" appear>
        <div class="content-card glass-card rounded-xl">
          <RecentProjects
            :projects="projects"
            :loading="loading"
            @view-all="$emit('view-all-projects')"
            @project-action="$emit('project-action', $event)"
            @create-project="$emit('create-project')"
          />
        </div>
      </transition>

      <transition name="right-section-slide" appear>
        <div class="content-card glass-card rounded-xl">
          <TestExecutionChart
            :time-range="timeRange"
            @time-range-change="$emit('time-range-change', $event)"
          />
        </div>
      </transition>
    </ResponsiveGrid>
  </div>
</template>

<script setup>
import ResponsiveGrid from '@/components/ui/ResponsiveGrid.vue'
import RecentProjects from './RecentProjects.vue'
import TestExecutionChart from './TestExecutionChart.vue'

defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  timeRange: {
    type: String,
    default: '7days'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-all-projects', 'project-action', 'time-range-change', 'create-project'])
</script>

<style scoped>
.content-section {
  margin-bottom: 32px;
}

.content-grid {
  width: 100%;
}

.content-card {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

/* 平板适配 */
@media (max-width: 1024px) {
  .content-card {
    min-height: 350px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .content-section {
    margin-bottom: 24px;
  }

  .content-card {
    min-height: auto;
    border-radius: 12px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .content-grid {
    gap: 16px;
  }

  .content-card {
    border-radius: 8px;
  }
}

/* 动画 */
.left-section-slide-enter-active,
.left-section-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.left-section-slide-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.left-section-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.right-section-slide-enter-active,
.right-section-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.2s;
}

.right-section-slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.right-section-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
