<template>
  <div class="resource-list-component">
    <template v-if="resources.length > 0">
      <ResourceItem
        v-for="(res, idx) in resources"
        :key="res.label + idx"
        :label="res.label"
        :value="res.value"
        :percent="res.percent"
        :color="res.color"
      />
    </template>

    <!-- 空状态 -->
    <EmptyState
      v-else
      title="暂无资源数据"
      description="系统资源监控数据暂时不可用"
      type="warning"
      compact
    >
      <template #icon>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
          <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import ResourceItem from './ResourceItem.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const props = defineProps({
  resources: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.resource-list-component {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>


