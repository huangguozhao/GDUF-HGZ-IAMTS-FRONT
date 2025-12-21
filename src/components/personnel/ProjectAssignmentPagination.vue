<template>
  <div class="pagination-wrapper">
    <div class="pagination-info">
      显示 {{ rangeStart }}-{{ rangeEnd }} 条，共 {{ total }} 条
    </div>
    <div class="pagination-controls">
      <button 
        class="page-btn prev-btn" 
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
      >
        上一页
      </button>
      <div class="page-number current">{{ currentPage }}</div>
      <button 
        class="page-btn next-btn" 
        @click="goToNextPage"
        :disabled="currentPage >= totalPages"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 8,
  },
  total: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['page-change']);

const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize) || 1;
});

const rangeStart = computed(() => {
  if (props.total === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});
const rangeEnd = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(props.currentPage * props.pageSize, props.total);
});

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1);
  }
};

const goToNextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('page-change', props.currentPage + 1);
  }
};

const goToPage = (page) => {
  if (page !== props.currentPage && page >= 1 && page <= totalPages.value) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e8e8e8;
  margin-top: 24px;
}

.pagination-info {
  color: #8c8c8c;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #262626;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #262626;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 32px;
  text-align: center;
}

.page-number:hover:not(.active) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-number.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

/* card style for pagination */
.pagination-wrapper {
  background: linear-gradient(180deg,#fff,#fbfdff);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15,23,42,0.04);
  border-top: none;
}

.pagination-info { color:#6b7280; }
</style>

