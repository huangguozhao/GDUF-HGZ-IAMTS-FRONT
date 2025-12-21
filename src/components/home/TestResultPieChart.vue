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
      passed: 81,
      failed: 7,
      notExecuted: 12
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
  const { passed = 0, failed = 0, notExecuted = 0 } = props.data || {}
  const total = passed + failed + notExecuted

  // 如果没有数据，返回空配置
  if (total === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#909399',
          fontSize: 14
        }
      }
    }
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: 'transparent',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemGap: 12,
      textStyle: {
        color: '#606266',
        fontSize: 12
      },
      formatter: (name) => {
        const value = props.data[name] || 0
        return `${name}: ${value}%`
      }
    },
    series: [
      {
        name: '测试结果',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: passed,
            name: '通过',
            itemStyle: {
              color: '#67c23a'
            }
          },
          {
            value: failed,
            name: '失败',
            itemStyle: {
              color: '#f56c6c'
            }
          },
          {
            value: notExecuted,
            name: '未执行',
            itemStyle: {
              color: '#e6a23c'
            }
          }
        ]
      }
    ]
  }
})
</script>

<style scoped>
/* 样式由 ChartContainer 提供 */
</style>

