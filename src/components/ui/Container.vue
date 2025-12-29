<template>
  <div
    class="container"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 容器类型: 'inline-size', 'size', 'normal'
  type: {
    type: String,
    default: 'inline-size',
    validator: (value) => ['inline-size', 'size', 'normal'].includes(value)
  },
  // 最大宽度
  maxWidth: {
    type: [String, Number],
    default: '1200px'
  },
  // 内边距
  padding: {
    type: [String, Number],
    default: '16px'
  },
  // 是否居中
  center: {
    type: Boolean,
    default: true
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
})

const containerClass = computed(() => {
  const classes = []

  if (props.center) {
    classes.push('container--center')
  }

  if (props.customClass) {
    classes.push(props.customClass)
  }

  return classes
})

const containerStyle = computed(() => {
  return {
    '--container-max-width': typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
    '--container-padding': typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
    'container-type': props.type
  }
})
</script>

<style scoped>
.container {
  width: 100%;
  container-type: var(--container-type, inline-size);
}

.container--center {
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding-left: var(--container-padding, 16px);
  padding-right: var(--container-padding, 16px);
}

/* 响应式容器 */
@media (max-width: 768px) {
  .container--center {
    padding-left: calc(var(--container-padding, 16px) * 0.75);
    padding-right: calc(var(--container-padding, 16px) * 0.75);
  }
}

@media (max-width: 480px) {
  .container--center {
    padding-left: calc(var(--container-padding, 16px) * 0.5);
    padding-right: calc(var(--container-padding, 16px) * 0.5);
  }
}
</style>
