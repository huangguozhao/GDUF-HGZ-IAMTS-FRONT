<template>
  <div class="tree-node">
    <div 
      class="tree-node-item"
      :class="{ 
        'is-selected': isSelected,
        'has-children': hasChildren
      }"
      @click="handleClick"
    >
      <div class="node-content">
        <span class="expand-arrow" v-if="hasChildren" @click.stop="toggleExpand">
          {{ isExpanded ? '▼' : '▶' }}
        </span>
        <span class="expand-arrow-placeholder" v-else></span>
        <span class="node-label">{{ node.name }}</span>
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
}

.tree-node-item:hover {
  background: #f5f7fa;
}

.tree-node-item.is-selected {
  background: #e6f4ff;
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

.expand-arrow-placeholder {
  width: 12px;
  flex-shrink: 0;
}

.node-label {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-item.is-selected .node-label {
  color: #409eff;
  font-weight: 500;
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
  background: #e6e8eb;
}

.menu-dots {
  font-size: 16px;
  color: #606266;
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

