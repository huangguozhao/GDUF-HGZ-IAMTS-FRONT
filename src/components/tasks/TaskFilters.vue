<template>
  <div class="task-filters">
    <div class="top-row">
      <select v-model="project">
        <option :value="null">所有项目</option>
        <option value="p1">项目 A</option>
        <option value="p2">项目 B</option>
      </select>

      <select v-model="status">
        <option value="all">全部状态</option>
        <option value="enabled">启用</option>
        <option value="disabled">停用</option>
      </select>

      <div class="quick-filters">
        <button :class="{ active: period === 'all' }" @click="period = 'all'">全部</button>
        <button :class="{ active: period === 'day' }" @click="period = 'day'">每日</button>
        <button :class="{ active: period === 'week' }" @click="period = 'week'">每周</button>
        <button :class="{ active: period === 'month' }" @click="period = 'month'">每月</button>
      </div>
    </div>

    <div class="search-row">
      <input v-model="keyword" placeholder="搜索任务、代码、创建者..." />
      <div class="actions">
        <button @click="$emit('openCreate')">创建定时任务</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';
const emit = defineEmits(['change','openCreate']);

const project = ref(null);
const status = ref('all');
const period = ref('all');
const keyword = ref('');

watch([project, status, period, keyword], () => {
  emit('change', { project: project.value, status: status.value, period: period.value, keyword: keyword.value });
});
</script>

<style scoped>
.task-filters { padding:12px; background:#fff; border-radius:8px; margin-bottom:12px; }
.top-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.search-row { display:flex; gap:8px; align-items:center; }
.quick-filters button { padding:6px 8px; border-radius:4px; background:#f5f7fa; border:1px solid #e6eef8; }
.quick-filters button.active { background:#eaf4ff; border-color:#cfe9ff; }
.actions { margin-left:auto; }
.search-row input { flex:1; padding:8px; }

@media (max-width: 900px) {
  .top-row { flex-direction:column; align-items:stretch; }
  .search-row { flex-direction:column; align-items:stretch; }
  .actions { margin-left:0; display:flex; justify-content:flex-end; }
}
</style>
</script>

<style scoped>
.task-filters { padding:12px; background:#fff; border-radius:8px; margin-bottom:12px; }
.top-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.search-row { display:flex; gap:8px; align-items:center; }
.quick-filters button { padding:6px 8px; border-radius:4px; background:#f5f7fa; border:1px solid #e6eef8; }
.quick-filters button.active { background:#eaf4ff; border-color:#cfe9ff; }
.actions { margin-left:auto; }
.search-row input { flex:1; padding:8px; }
</style>


