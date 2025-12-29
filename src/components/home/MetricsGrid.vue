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
  width: 100%;
}

/* 传统媒体查询 */
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

/* 容器查询支持 */
@container (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
}

@container (max-width: 700px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
}

@container (max-width: 400px) {
  .metrics-grid {
    gap: 12px;
    margin-bottom: 20px;
  }
}
</style>

