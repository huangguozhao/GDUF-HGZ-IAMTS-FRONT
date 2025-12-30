<template>
  <div class="staggered-reveal">
    <transition-group
      name="stagger-item"
      tag="div"
      class="staggered-container"
      @enter="onItemEnter"
      @after-enter="onItemAfterEnter"
    >
      <div
        v-for="(item, index) in props.items"
        :key="item.key || index"
        class="staggered-item"
        :class="item.class"
        :style="getItemStyle(index)"
        ref="items"
      >
        <slot
          :name="`item-${index}`"
          :item="item"
          :index="index"
        >
          {{ item.content }}
        </slot>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  staggerDelay: {
    type: Number,
    default: 100
  },
  direction: {
    type: String,
    default: 'up', // 'up', 'down', 'left', 'right', 'scale'
    validator: (value) => ['up', 'down', 'left', 'right', 'scale', 'fade'].includes(value)
  },
  duration: {
    type: Number,
    default: 600
  },
  trigger: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['item-enter', 'item-after-enter', 'complete'])

const items = ref([])
let enterCount = 0

const getItemStyle = (index) => {
  return {
    'transition-delay': `${index * props.staggerDelay}ms`,
    'transition-duration': `${props.duration}ms`
  }
}

const onItemEnter = (el, done) => {
  // 添加进入动画类
  el.classList.add('stagger-item--entering')

  // 动画完成后调用done
  setTimeout(() => {
    el.classList.remove('stagger-item--entering')
    el.classList.add('stagger-item--entered')
    done()
  }, props.duration)
}

const onItemAfterEnter = (el) => {
  enterCount++
  emit('item-after-enter', { el, index: enterCount - 1 })

  // 所有项目都进入完成后发出完成事件
  if (enterCount >= props.items.length) {
    emit('complete')
  }
}

// 暴露控制方法
defineExpose({
  triggerReveal: async () => {
    enterCount = 0
    await nextTick()
    // 触发重新渲染过渡组
    items.value = [...props.items]
  },
  reset: () => {
    enterCount = 0
    items.value = []
  }
})
</script>

<style scoped>
.staggered-reveal {
  width: 100%;
  height: 100%;
}

.staggered-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.staggered-item {
  opacity: 0;
  transform: translateY(30px);
  transition: all v-bind(duration)ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.staggered-item--entering {
  opacity: 0;
  transform: translateY(30px);
}

.staggered-item--entered {
  opacity: 1;
  transform: translateY(0);
}

/* 方向变体 */
.staggered-item[data-direction="down"] {
  transform: translateY(-30px);
}

.staggered-item[data-direction="down"].stagger-item--entering {
  transform: translateY(-30px);
}

.staggered-item[data-direction="down"].staggered-item--entered {
  transform: translateY(0);
}

.staggered-item[data-direction="left"] {
  transform: translateX(30px);
}

.staggered-item[data-direction="left"].stagger-item--entering {
  transform: translateX(30px);
}

.staggered-item[data-direction="left"].staggered-item--entered {
  transform: translateX(0);
}

.staggered-item[data-direction="right"] {
  transform: translateX(-30px);
}

.staggered-item[data-direction="right"].stagger-item--entering {
  transform: translateX(-30px);
}

.staggered-item[data-direction="right"].staggered-item--entered {
  transform: translateX(0);
}

.staggered-item[data-direction="scale"] {
  transform: scale(0.95);
}

.staggered-item[data-direction="scale"].stagger-item--entering {
  transform: scale(0.95);
}

.staggered-item[data-direction="scale"].staggered-item--entered {
  transform: scale(1);
}

.staggered-item[data-direction="fade"] {
  transform: none;
  opacity: 0;
}

.staggered-item[data-direction="fade"].stagger-item--entering {
  opacity: 0;
}

.staggered-item[data-direction="fade"].staggered-item--entered {
  opacity: 1;
}

/* 过渡动画 */
.stagger-item-enter-active {
  transition: all v-bind(duration)ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stagger-item-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.stagger-item-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.stagger-item-leave-active {
  transition: all 0.3s ease-out;
}

.stagger-item-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.stagger-item-move {
  transition: transform 0.3s ease;
}
</style>
