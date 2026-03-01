<template>
  <div class="tree-node">
    <div 
      class="tree-node-item"
      :class="{ 
        'is-selected': isSelected,
        'has-children': hasChildren,
        'is-expanded': isExpanded
      }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
    >
      <div class="node-content">
        <!-- 展开/收起箭头 -->
        <span 
          v-if="hasChildren" 
          class="expand-arrow" 
          :class="{ expanded: isExpanded }"
          @click.stop="toggleExpand"
          title="点击展开/收起"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="expand-arrow-placeholder" v-else></span>
        
        <!-- 节点图标 -->
        <span class="node-icon" :class="level + '-icon'">
          <svg v-if="level === 'project'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="level === 'module'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="level === 'api'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        
        <!-- 节点名称 -->
        <span class="node-name">{{ node.name }}</span>
        
        <!-- 展开/收起提示标签 -->
        <span v-if="hasChildren && isExpanded" class="expand-hint">
          ({{ getChildrenCount() }})
        </span>
      </div>
      
      <!-- 操作菜单 -->
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
    
    <!-- 子节点 -->
    <transition name="expand">
      <div v-show="isExpanded" class="tree-node-children">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: String, // 'project', 'module', 'api'
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-module', 'add-api', 'add-case', 'edit', 'delete', 'node-click', 'toggle-expand', 'update:isExpanded'])

const expanded = ref(props.isExpanded)

// 监听 isExpanded 属性变化
watch(() => props.isExpanded, (newVal) => {
  expanded.value = newVal
})

const isExpanded = computed({
  get: () => expanded.value,
  set: (val) => {
    expanded.value = val
    emit('update:isExpanded', val)
  }
})

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

// 获取子节点数量
const getChildrenCount = () => {
  if (props.level === 'project') {
    const moduleCount = props.node.modules?.length || 0
    return moduleCount > 0 ? `${moduleCount} 个模块` : ''
  }
  if (props.level === 'module') {
    const subModuleCount = props.node.children?.length || 0
    const apiCount = props.node.apis?.length || 0
    const parts = []
    if (subModuleCount > 0) parts.push(`${subModuleCount} 子模块`)
    if (apiCount > 0) parts.push(`${apiCount} 接口`)
    return parts.join(', ')
  }
  if (props.level === 'api') {
    const caseCount = props.node.cases?.length || 0
    return caseCount > 0 ? `${caseCount} 个用例` : ''
  }
  return ''
}

const toggleExpand = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
    // 触发展开/折叠事件
    emit('toggle-expand', props.node.id)
  }
}

const handleClick = () => {
  // 单击：如果是点击在可展开的节点上，切换展开状态
  if (hasChildren.value) {
    // 切换展开/收起状态
    toggleExpand()
  }
  // 触发节点点击事件
  emit('node-click', props.node, props.level)
}

const handleDoubleClick = () => {
  // 双击：切换展开状态（如果已展开则收起，如果已收起则展开）
  if (hasChildren.value) {
    toggleExpand()
  }
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
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 2px 0;
  border: 1px solid transparent;
}

.tree-node-item:hover {
  background: #e6f4ff;
  border-color: #b3d8ff;
}

.tree-node-item.is-selected {
  background: linear-gradient(90deg, #e6f4ff 0%, rgba(230,244,255,0.6) 100%);
  color: #409eff;
  border-color: #409eff;
}

/* 可展开节点的悬停效果 */
.tree-node-item.has-children:hover {
  cursor: pointer;
}

.tree-node-item.has-children .node-name {
  color: #409eff;
}

/* 展开状态 */
.tree-node-item.is-expanded {
  background: #f0f7ff;
}

.tree-node-item.is-expanded .node-icon {
  color: #409eff;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.expand-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #909399;
  transition: all 0.2s ease;
  border-radius: 4px;
  flex-shrink: 0;
}

.expand-arrow:hover {
  background: #cce5ff;
  color: #409eff;
}

.expand-arrow.expanded {
  color: #409eff;
}

.expand-arrow svg {
  transition: transform 0.2s ease;
}

.expand-arrow.expanded svg {
  transform: rotate(90deg);
}

.expand-arrow-placeholder {
  width: 20px;
  flex-shrink: 0;
}

/* 节点图标 */
.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.project-icon {
  color: #e6a23c;
}

.module-icon {
  color: #409eff;
}

.api-icon {
  color: #67c23a;
}

/* 节点名称 */
.node-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

/* 展开/收起提示 */
.expand-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

/* 选中态名称 */
.tree-node-item.is-selected .node-name {
  color: #409eff;
  font-weight: 500;
}

/* 分级样式 */
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

/* 焦点样式 */
.tree-node-item:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(64,158,255,0.12);
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .expand-enter-active,
  .expand-leave-active,
  .tree-node-item {
    transition: none !important;
  }
}

.node-menu {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tree-node-item:hover .node-menu {
  opacity: 1;
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
  background: #d9ecff;
}

.menu-dots {
  font-size: 16px;
  color: #909399;
  font-weight: bold;
  line-height: 1;
}

.tree-node-children {
  margin-left: 20px;
  margin-top: 2px;
  border-left: 2px solid #e4e7ed;
  padding-left: 8px;
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

