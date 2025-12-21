<template>
  <ChartContainer
    :height="height"
    :options="chartOptions"
    :loading="loading"
    :error="error"
  />
</template>

<script setup>
import { computed } from 'vue'
import ChartContainer from './ChartContainer.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      dates: [],
      passed: [],
      failed: []
    })
  },
  height: {
    type: Number,
    default: 250
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

// 计算图表配置
const chartOptions = computed(() => {
  const { dates, passed, failed } = props.data

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: 'transparent',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      data: ['通过', '失败'],
      top: 10,
      textStyle: {
        color: '#606266',
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '通过',
        type: 'line',
        smooth: true,
        data: passed,
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(103, 194, 58, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(103, 194, 58, 0.05)'
              }
            ]
          }
        },
        lineStyle: {
          width: 2
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '失败',
        type: 'line',
        smooth: true,
        data: failed,
        itemStyle: {
          color: '#f56c6c'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(245, 108, 108, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(245, 108, 108, 0.05)'
              }
            ]
          }
        },
        lineStyle: {
          width: 2
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }
})
</script>

<style scoped>
/* 样式由 ChartContainer 提供 */
</style>

