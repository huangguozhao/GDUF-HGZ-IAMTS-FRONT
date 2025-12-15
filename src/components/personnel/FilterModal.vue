<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>筛选条件</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleApply">
          <div class="form-group">
            <label>用户状态</label>
            <select v-model="filterData.status">
              <option value="">全部</option>
              <option value="active">活跃</option>
              <option value="pending">待审核</option>
              <option value="inactive">已禁用</option>
            </select>
          </div>

          <div class="form-group">
            <label>职位</label>
            <input 
              v-model="filterData.position" 
              type="text" 
              placeholder="请输入职位"
            />
          </div>

          <div class="form-group">
            <label>开始日期</label>
            <input 
              v-model="filterData.startDate" 
              type="date"
            />
          </div>

          <div class="form-group">
            <label>结束日期</label>
            <input 
              v-model="filterData.endDate" 
              type="date"
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleReset">
              重置
            </button>
            <button type="button" class="btn btn-secondary" @click="handleClose">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              应用筛选
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

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
</style>

