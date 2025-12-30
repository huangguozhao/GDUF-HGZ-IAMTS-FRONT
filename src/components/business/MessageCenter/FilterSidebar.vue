<template>
  <aside class="filter-sidebar" role="navigation" aria-label="消息筛选">
    <div class="filter-header">
      <h4>筛选</h4>
    </div>

    <el-menu
      class="filter-menu"
      :default-active="active"
      @select="onSelect"
      :router="false"
    >
      <el-menu-item index="all">全部</el-menu-item>
      <el-menu-item index="unread">未读 <span v-if="counts.unread" class="count">({{ counts.unread }})</span></el-menu-item>
      <el-menu-item index="read">已读</el-menu-item>
      <el-menu-item index="system">系统</el-menu-item>
      <el-menu-item index="alerts">告警</el-menu-item>
    </el-menu>

    <div class="filter-actions">
      <el-button type="text" @click="onClear" size="small">清除筛选</el-button>
      <el-button type="primary" @click="onMarkAll" size="small">全部标记已读</el-button>
    </div>

    <div class="filters-footer">
      <small>共 {{ total }} 条消息</small>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  active: { type: String, default: 'all' },
  total: { type: Number, default: 0 },
  counts: { type: Object, default: () => ({ unread: 0 }) }
})
const emit = defineEmits(['select', 'clear', 'mark-all'])

const onSelect = (key) => emit('select', key)
const onClear = () => emit('clear')
const onMarkAll = () => emit('mark-all')
</script>

<style scoped>
.filter-sidebar {
  width: 220px;
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}
.filter-header h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}
.filter-actions {
  display:flex;
  gap:8px;
  margin-top:12px;
}
.filters-footer {
  margin-top:16px;
  text-align:center;
  color:#909399;
}
.count{
  color:#1890ff;
  margin-left:6px;
}
</style>


