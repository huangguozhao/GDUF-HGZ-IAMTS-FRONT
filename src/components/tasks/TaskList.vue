<template>
  <div class="task-list">
    <task-filters @change="onFiltersChange" @openCreate="$emit('openCreate')" />

    <div class="list-header">
      <div class="summary">
        <strong>任务安排</strong>
        <div class="sub">共 24 条记录，当前显示 1-7 条</div>
      </div>
      <div class="view-actions">
        <button class="btn-grid">网格</button>
        <button class="btn-list">列表</button>
      </div>
    </div>

    <table class="tasks-table">
      <thead>
        <tr>
          <th></th>
          <th>ID</th>
          <th>任务名称</th>
          <th>执行计划/下次执行时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="task in filteredTasks"
          :key="task.id"
          :class="{ selected: task.id === selectedId }"
          @click="select(task)"
        >
          <td><input type="checkbox" v-model="selectedRows" :value="task.id" /></td>
          <td>{{ task.code }}</td>
          <td>{{ task.name }}</td>
          <td>
            <div class="plan">{{ task.planLabel }}</div>
            <div class="next">下次: {{ task.nextRunAt || '-' }}</div>
          </td>
          <td>
            <span :class="['status', task.enabled ? 'on' : 'off']">
              {{ task.enabled ? '启用' : '停用' }}
            </span>
          </td>
          <td>
            <button @click.stop="edit(task)">编辑</button>
            <button @click.stop="toggleEnable(task)">{{ task.enabled ? '停用' : '启用' }}</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">上一页</button>
      <span>第 {{ page }} 页</span>
      <button @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import TaskFilters from './TaskFilters.vue';

const props = defineProps({
  filters: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['selectTask', 'openCreate']);

const localFilters = reactive({
  keyword: props.filters.keyword || '',
  status: props.filters.status || 'all'
});

const page = ref(1);
const pageSize = 10;
const tasks = ref([
  // placeholder demo data; later replaced by API/store
  { id: 1, code: 'TS-001', name: '用户登录接口回归检查', planLabel: '每日 10:00', nextRunAt: '2024-03-15 10:00', enabled: true },
  { id: 2, code: 'TS-002', name: '支付系统接口回检', planLabel: '每周 四 10:00', nextRunAt: '2024-03-21 10:00', enabled: true },
  { id: 3, code: 'TS-003', name: '订单系统定时检测', planLabel: '每日 08:30', nextRunAt: null, enabled: false }
]);

const selectedId = ref(null);
const selectedRows = ref([]);

const filteredTasks = computed(() => {
  let list = tasks.value.slice();
  // apply filters from localFilters
  if (localFilters.keyword) {
    const kw = localFilters.keyword.toLowerCase();
    list = list.filter(t => t.name.toLowerCase().includes(kw) || t.code.toLowerCase().includes(kw));
  }
  if (localFilters.status === 'enabled') list = list.filter(t => t.enabled);
  if (localFilters.status === 'disabled') list = list.filter(t => !t.enabled);
  // simple pagination
  const start = (page.value - 1) * pageSize;
  return list.slice(start, start + pageSize);
});

function onFiltersChange(payload) {
  localFilters.keyword = payload.keyword || '';
  localFilters.status = payload.status || 'all';
}

function select(task) {
  selectedId.value = task.id;
  emit('selectTask', task);
}

function edit(task) {
  // placeholder: open edit modal later
  emit('selectTask', task);
}

function toggleEnable(task) {
  task.enabled = !task.enabled;
}

function prevPage() {
  if (page.value > 1) page.value -= 1;
}
function nextPage() {
  page.value += 1;
}

watch(() => props.filters, (newF) => {
  localFilters.keyword = newF.keyword || '';
  localFilters.status = newF.status || 'all';
});
</script>

<style scoped>
.task-list {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.filters input { padding: 6px; margin-right: 8px; }
.tasks-table { width: 100%; border-collapse: collapse; }
.tasks-table th, .tasks-table td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
.tasks-table tr.selected { background: #f5f9ff; }
.status.on { color: #2f8f3f; }
.status.off { color: #999; }
.pagination { margin-top: 12px; display:flex; gap:8px; align-items:center; }
</style>


