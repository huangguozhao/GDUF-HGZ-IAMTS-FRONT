<template>
  <div class="responsive-grid" :class="gridClass">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 列数配置，格式: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
  columns: {
    type: Object,
    default: () => ({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 4
    })
  },
  // 网格间距
  gap: {
    type: [String, Number],
    default: 24
  },
  // 是否自动填充
  autoFit: {
    type: Boolean,
    default: false
  },
  // 最小列宽（autoFit模式）
  minColumnWidth: {
    type: [String, Number],
    default: 280
  }
})

const gridClass = computed(() => {
  const classes = []

  if (props.autoFit) {
    classes.push('responsive-grid--auto-fit')
  }

  return classes
})

// 计算网格样式
const gridStyle = computed(() => {
  if (props.autoFit) {
    return {
      '--min-column-width': typeof props.minColumnWidth === 'number' ? `${props.minColumnWidth}px` : props.minColumnWidth,
      '--grid-gap': typeof props.gap === 'number' ? `${props.gap}px` : props.gap
    }
  }

  return {
    '--grid-gap': typeof props.gap === 'number' ? `${props.gap}px` : props.gap
  }
})

// 生成CSS变量用于响应式列数
const cssVariables = computed(() => {
  if (props.autoFit) return {}

  const vars = {}
  Object.entries(props.columns).forEach(([breakpoint, cols]) => {
    vars[`--columns-${breakpoint}`] = cols
  })
  vars['--grid-gap'] = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
  return vars
})
</script>

<style scoped>
.responsive-grid {
  display: grid;
  gap: var(--grid-gap, 24px);
  width: 100%;
}

/* 自适应网格模式 */
.responsive-grid--auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(var(--min-column-width, 280px), 1fr));
}

/* 非自适应模式 - 使用CSS自定义属性控制列数 */
.responsive-grid:not(.responsive-grid--auto-fit) {
  grid-template-columns: var(--columns-xl, 4);
}

/* 响应式断点 */
@media (max-width: 576px) {
  .responsive-grid:not(.responsive-grid--auto-fit) {
    grid-template-columns: var(--columns-xs, 1);
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .responsive-grid:not(.responsive-grid--auto-fit) {
    grid-template-columns: var(--columns-sm, 2);
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .responsive-grid:not(.responsive-grid--auto-fit) {
    grid-template-columns: var(--columns-md, 3);
  }
}

@media (min-width: 993px) and (max-width: 1200px) {
  .responsive-grid:not(.responsive-grid--auto-fit) {
    grid-template-columns: var(--columns-lg, 4);
  }
}

@media (min-width: 1201px) {
  .responsive-grid:not(.responsive-grid--auto-fit) {
    grid-template-columns: var(--columns-xl, 4);
  }
}

/* 容器查询支持 */
@container (max-width: 640px) {
  .responsive-grid:not(.responsive-grid--auto-fit) {
    grid-template-columns: var(--columns-xs, 1);
  }
}

@container (max-width: 480px) {
  .responsive-grid {
    gap: calc(var(--grid-gap, 24px) * 0.75);
  }

  .responsive-grid--auto-fit {
    --min-column-width: max(250px, 40%);
  }
}

@container (max-width: 360px) {
  .responsive-grid {
    gap: calc(var(--grid-gap, 24px) * 0.5);
  }

  .responsive-grid--auto-fit {
    --min-column-width: max(200px, 45%);
  }
}

@container (max-width: 320px) {
  .responsive-grid {
    gap: calc(var(--grid-gap, 24px) * 0.3);
  }

  .responsive-grid--auto-fit {
    --min-column-width: max(180px, 50%);
  }
}

/* 自适应容器 */
@container (orientation: portrait) {
  .responsive-grid--auto-fit {
    --min-column-width: max(280px, 35%);
  }
}

@container (orientation: landscape) and (max-width: 900px) {
  .responsive-grid--auto-fit {
    --min-column-width: max(320px, 25%);
  }
}
</style>
