<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot />
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: 'fade'
  },
  mode: {
    type: String,
    default: ''
  },
  duration: {
    type: [Number, String],
    default: 300
  }
})

const emit = defineEmits(['enter', 'leave'])

const transitionName = computed(() => {
  return `page-${props.name}`
})

const transitionMode = computed(() => {
  return props.mode || undefined
})

const onEnter = (el) => {
  emit('enter', el)
}

const onLeave = (el) => {
  emit('leave', el)
}
</script>

<style scoped>
/* 基础页面过渡 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all v-bind(duration)ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 渐入式过渡 */
.page-slide-in-enter-active,
.page-slide-in-leave-active {
  transition: all v-bind(duration)ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-slide-in-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-slide-in-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 缩放渐入 */
.page-scale-in-enter-active,
.page-scale-in-leave-active {
  transition: all v-bind(duration)ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.page-scale-in-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.page-scale-in-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 从下往上 */
.page-slide-up-enter-active,
.page-slide-up-leave-active {
  transition: all v-bind(duration)ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.page-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 消息页面专用渐入效果 */
.page-message-enter-active,
.page-message-leave-active {
  transition: all 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-message-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}

.page-message-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.02);
}
</style>
