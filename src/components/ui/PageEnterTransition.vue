<template>
  <transition
    name="page-enter"
    appear
    @enter="onEnter"
    @after-enter="onAfterEnter"
  >
    <div v-if="visible" class="page-enter-wrapper" :class="{ 'page-enter--active': isEntering }">
      <!-- 毛玻璃背景层 -->
      <div class="page-enter-backdrop" :class="{ 'backdrop--active': isEntering }"></div>

      <!-- 内容层 -->
      <div class="page-enter-content" :class="{ 'content--active': isEntering }">
        <slot />
      </div>

      <!-- 装饰性元素 -->
      <div class="page-enter-decorations">
        <div class="decoration-circle decoration-circle--1" :class="{ 'circle--active': isEntering }"></div>
        <div class="decoration-circle decoration-circle--2" :class="{ 'circle--active': isEntering }"></div>
        <div class="decoration-circle decoration-circle--3" :class="{ 'circle--active': isEntering }"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 800
  },
  staggerDelay: {
    type: Number,
    default: 150
  }
})

const emit = defineEmits(['enter', 'after-enter', 'complete'])

const isEntering = ref(false)

const onEnter = async (el) => {
  emit('enter', el)

  // 等待一帧确保DOM更新
  await nextTick()

  // 触发进入动画
  isEntering.value = true

  // 计算动画总时长
  const totalDuration = props.duration + (props.staggerDelay * 3)

  // 动画完成后发出完成事件
  setTimeout(() => {
    emit('complete')
  }, totalDuration)
}

const onAfterEnter = (el) => {
  emit('after-enter', el)
}

// 暴露控制方法
defineExpose({
  triggerEnter: () => {
    isEntering.value = true
  },
  reset: () => {
    isEntering.value = false
  }
})
</script>

<style scoped>
.page-enter-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.page-enter-enter-active {
  transition: opacity 0.3s ease-out;
}

.page-enter-enter-from {
  opacity: 0;
}

/* 毛玻璃背景层 */
.page-enter-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(24, 144, 255, 0.02) 0%,
    rgba(67, 217, 173, 0.02) 50%,
    rgba(255, 193, 7, 0.02) 100%
  );
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  transition: backdrop-filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.backdrop--active {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 内容层 */
.page-enter-content {
  position: relative;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  transition: all v-bind(duration)ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 2;
}

.content--active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 装饰性圆圈 */
.page-enter-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(24, 144, 255, 0.08) 0%,
    rgba(24, 144, 255, 0.03) 50%,
    transparent 100%
  );
  opacity: 0;
  transform: scale(0);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.decoration-circle--1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  transition-delay: 0ms;
}

.decoration-circle--2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  transition-delay: v-bind(staggerDelay)ms;
}

.decoration-circle--3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 60%;
  transition-delay: calc(v-bind(staggerDelay) * 2)ms;
}

.circle--active {
  opacity: 1;
  transform: scale(1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .decoration-circle--1 {
    width: 150px;
    height: 150px;
    top: 15%;
    left: 5%;
  }

  .decoration-circle--2 {
    width: 120px;
    height: 120px;
    top: 65%;
    right: 10%;
  }

  .decoration-circle--3 {
    width: 80px;
    height: 80px;
    bottom: 25%;
    left: 55%;
  }
}

@media (max-width: 480px) {
  .decoration-circle--1 {
    width: 120px;
    height: 120px;
    top: 20%;
    left: 0%;
  }

  .decoration-circle--2 {
    width: 100px;
    height: 100px;
    top: 70%;
    right: 5%;
  }

  .decoration-circle--3 {
    width: 60px;
    height: 60px;
    bottom: 30%;
    left: 50%;
  }
}
</style>
