<template>
  <div class="bottom-section">
    <ResponsiveGrid
      :columns="{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2 }"
      :gap="30"
      class="bottom-grid"
    >
      <transition name="bottom-left-slide" appear>
        <div class="bottom-card">
          <h3 class="section-title">系统资源状态</h3>
          <ResourceList :resources="resources" />
        </div>
      </transition>

      <transition name="bottom-right-slide" appear>
        <div class="bottom-card">
          <RecentActivities
            :activities="activities"
            @view-more="$emit('view-more-activities')"
          />
        </div>
      </transition>
    </ResponsiveGrid>
  </div>
</template>

<script setup>
import ResponsiveGrid from '@/components/ui/ResponsiveGrid.vue'
import ResourceList from './ResourceList.vue'
import RecentActivities from './RecentActivities.vue'

defineProps({
  resources: {
    type: Array,
    default: () => []
  },
  activities: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-more-activities'])
</script>

<style scoped>
.bottom-section {
  width: 100%;
}

.bottom-grid {
  width: 100%;
}

.bottom-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .bottom-card {
    padding: 16px;
    border-radius: 12px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .bottom-card {
    padding: 12px;
    border-radius: 8px;
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 12px;
  }
}

/* 动画 */
.bottom-left-slide-enter-active,
.bottom-left-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.bottom-left-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.bottom-left-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.bottom-right-slide-enter-active,
.bottom-right-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.3s;
}

.bottom-right-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.bottom-right-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
