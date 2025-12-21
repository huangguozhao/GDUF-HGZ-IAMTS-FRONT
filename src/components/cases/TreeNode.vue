<template>
  <div class="tree-node">
  <div 
      class="tree-node-item"
      role="treeitem"
      :tabindex="0"
      :class="{ 
        'is-selected': isSelected,
        'has-children': hasChildren
      }"
      @click="handleClick"
      @keydown.enter.stop.prevent="handleClick"
      @keydown.space.stop.prevent="handleClick"
    >
      <div class="node-content">
        <span class="expand-arrow" v-if="hasChildren" @click.stop="toggleExpand" :class="{ expanded: isExpanded }" role="button" :aria-expanded="isExpanded" :tabindex="0" @keydown.enter.stop.prevent="toggleExpand" @keydown.space.stop.prevent="toggleExpand">
          ▶
        </span>
        <span class="expand-arrow-placeholder" v-else></span>
        <span :class="labelClass">{{ node.name }}</span>
      </div>
      
      <div class="node-menu" @click.stop>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="menu-trigger">
            <span class="menu-dots">⋯</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">编辑</el-dropdown-item>
              <el-dropdown-item command="add" v-if="level !== 'api'">
                新建{{ level === 'project' ? '模块' : '接口' }}
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <transition name="expand">
      <div v-show="isExpanded" class="tree-node-children">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: String, // 'project', 'module', 'api'
    required: true
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-module', 'add-api', 'add-case', 'edit', 'delete', 'node-click', 'toggle-expand'])

const isExpanded = ref(props.defaultExpanded)

const labelClass = computed(() => {
  return {
    'node-label': true,
    'project-label': props.level === 'project',
    'module-label': props.level === 'module',
    'api-label': props.level === 'api'
  }
})

const hasChildren = computed(() => {
  if (props.level === 'project') return props.node.modules?.length > 0
  if (props.level === 'module') {
    // 模块可能有子模块或接口
    return (props.node.children?.length > 0) || (props.node.apis?.length > 0)
  }
  if (props.level === 'api') return props.node.cases?.length > 0
  return false
})

const toggleExpand = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
    // 触发展开/折叠事件
    emit('toggle-expand', props.node.id)
  }
}

const handleClick = () => {
  // 触发节点点击事件
  emit('node-click', props.node, props.level)
}

const handleCommand = (command) => {
  switch (command) {
    case 'edit':
      emit('edit', props.node)
      break
    case 'add':
      if (props.level === 'project') {
        emit('add-module', props.node)
      } else if (props.level === 'module') {
        emit('add-api', props.node)
      }
      break
    case 'delete':
      emit('delete', props.node)
      break
  }
}
</script>

<style scoped>
.tree-node {
  margin-bottom: 0;
}

.tree-node-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 4px;
  margin: 2px 0;
  /* 轻微卡片风格 */
  border-radius: 8px;
  padding: 10px 12px;
}

.tree-node-item:hover {
  /* Hover 使用主蓝色的浅背景 */
  background: #e6f4ff;
  box-shadow: 0 6px 18px -8px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.tree-node-item.is-selected {
  /* 选中态使用浅蓝背景，文字强调为主蓝 #409eff */
  background: linear-gradient(90deg, #e6f4ff 0%, rgba(230,244,255,0.6) 100%);
  color: #409eff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.expand-arrow {
  font-size: 12px;
  color: #606266;
  width: 12px;
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.2s;
  cursor: pointer;
}

.expand-arrow:hover {
  color: #409eff;
}

.expand-arrow.expanded {
  transform: rotate(90deg);
  color: var(--color-brand, #35bfab);
}

.expand-arrow-placeholder {
  width: 12px;
  flex-shrink: 0;
}

.node-label {
  font-size: 14px;
  color: var(--color-primary, #4E3F42);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-item.is-selected .node-label {
  color: #409eff;
  font-weight: 500;
}

/* 分级样式：项目标题使用渐变文字与装饰字体（根据 theme.css） */
.project-label {
  font-family: var(--font-averia, 'Averia Gruesa Libre'), inherit;
  font-weight: 600;
  color: var(--color-primary, #4E3F42);
}
.module-label {
  font-weight: 600;
  color: var(--color-primary, #4E3F42);
}
.api-label {
  color: var(--color-secondary, #7b888e);
}

/* 焦点与无障碍 */
.tree-node-item:focus,
.expand-arrow:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(64,158,255,0.12); /* #409eff */
  border-radius: 8px;
}

/* 减少动画对偏好禁用的影响 */
@media (prefers-reduced-motion: reduce) {
  .expand-enter-active,
  .expand-leave-active,
  .expand-arrow,
  .tree-node-item {
    transition: none !important;
  }
}

.node-menu {
  flex-shrink: 0;
}

.menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.menu-trigger:hover {
  background: #e6f4ff;
}

.menu-dots {
  font-size: 16px;
  color: var(--color-secondary, #7b888e);
  font-weight: bold;
  line-height: 1;
}

.tree-node-children {
  margin-left: 20px;
  margin-top: 2px;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>

