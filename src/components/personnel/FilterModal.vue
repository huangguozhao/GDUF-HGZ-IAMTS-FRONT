<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>筛选条件</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleApply" class="filter-form" novalidate>
          <div class="filter-grid">
            <div class="col">
              <div class="form-group">
                <label>用户状态</label>
                <div class="status-chips" role="tablist" aria-label="用户状态">
                  <button
                    v-for="s in statusOptions"
                    :key="s.value"
                    type="button"
                    :class="['chip', { active: filterData.status === s.value }]"
                    @click="filterData.status = s.value"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>职位</label>
                <input
                  v-model="filterData.position"
                  type="text"
                  placeholder="请输入职位（支持模糊匹配）"
                  aria-label="职位"
                />
              </div>
            </div>

            <div class="col">
              <div class="form-group">
                <label>日期范围</label>
                <div class="date-row">
                  <input v-model="filterData.startDate" type="date" aria-label="开始日期" />
                  <span class="date-sep">—</span>
                  <input v-model="filterData.endDate" type="date" aria-label="结束日期" />
                </div>
                <div v-if="dateError" class="field-error">{{ dateError }}</div>
              </div>

              <div class="form-group">
                <label>快捷筛选</label>
                <div class="preset-row">
                  <button type="button" class="preset" @click="applyPreset(7)">最近7天</button>
                  <button type="button" class="preset" @click="applyPreset(30)">最近30天</button>
                  <button type="button" class="preset" @click="applyPreset('all')">全部</button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleReset">重置</button>
            <button type="button" class="btn" @click="handleClose">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!!dateError">应用筛选</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  initialFilters: {
    type: Object,
    default: () => ({ status: '', position: '', startDate: '', endDate: '' }),
  },
});

const emit = defineEmits(['close', 'apply', 'reset']);

const filterData = ref({
  status: '',
  position: '',
  startDate: '',
  endDate: '',
});

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'pending', label: '待审核' },
  { value: 'inactive', label: '已禁用' },
]

const dateError = ref('')

const validateDates = () => {
  dateError.value = ''
  if (filterData.value.startDate && filterData.value.endDate) {
    if (new Date(filterData.value.startDate) > new Date(filterData.value.endDate)) {
      dateError.value = '开始日期不能晚于结束日期'
    }
  }
}

watch(() => [filterData.value.startDate, filterData.value.endDate], validateDates)

// Watch for initial filters changes
watch(
  () => props.initialFilters,
  (newFilters) => {
    filterData.value = { ...newFilters };
  },
  { immediate: true, deep: true }
);

const handleClose = () => {
  emit('close');
};

const handleApply = () => {
  emit('apply', filterData.value);
};

const handleReset = () => {
  filterData.value = {
    status: '',
    position: '',
    startDate: '',
    endDate: '',
  };
  emit('reset', filterData.value);
};

function applyPreset(days) {
  if (days === 'all') {
    filterData.value.startDate = ''
    filterData.value.endDate = ''
    return
  }
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (days - 1))
  filterData.value.startDate = start.toISOString().slice(0,10)
  filterData.value.endDate = end.toISOString().slice(0,10)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-secondary {
  background-color: #fff;
  color: #262626;
  border-color: #d9d9d9;
}

.btn-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* Filter modal grid and chips */
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.status-chips { display:flex; gap:8px; flex-wrap:wrap; }
.chip {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e6eef8;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.chip.active {
  background: linear-gradient(90deg,#1890ff,#40a9ff);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(24,144,255,0.08);
}
.date-row { display:flex; align-items:center; gap:8px; }
.date-sep { color:#8c8c8c; }
.preset-row { display:flex; gap:8px; margin-top:8px; }
.preset { padding:6px 10px; border-radius:6px; border:1px solid #e6eef8; background:#fff; cursor:pointer; }
.field-error { color:#ff4d4f; margin-top:6px; font-size:13px; }

@media (max-width:600px) {
  .filter-grid { grid-template-columns: 1fr; }
}
</style>

