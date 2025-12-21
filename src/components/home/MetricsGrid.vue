<template>
  <div class="metrics-grid">
    <MetricCard
      v-for="(metric, index) in metrics"
      :key="index"
      :title="metric.title"
      :value="metric.value"
      :change="metric.change"
      :change-unit="metric.changeUnit"
      :icon="metric.icon"
      :show-chart="metric.showChart"
    >
      <template v-if="metric.chart" #chart>
        <component :is="metric.chart" />
      </template>
    </MetricCard>
  </div>
</template>

<script setup>
import MetricCard from './MetricCard.vue'

defineProps({
  metrics: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>

