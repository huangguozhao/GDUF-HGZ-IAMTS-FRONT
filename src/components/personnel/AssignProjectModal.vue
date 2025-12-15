<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>为 {{ userName }} 分配项目</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">加载项目列表中...</div>
        <div v-else>
          <div class="project-selection">
            <div class="section-title">可用项目</div>
            <div v-if="projectOptionsLoading" class="loading">加载中...</div>
            <div v-else-if="projectOptions.length === 0" class="empty-message">
              暂无可用项目
            </div>
            <div v-else class="checkbox-group">
              <label v-for="project in projectOptions" :key="project.id" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="project.id"
                  v-model="selectedProjectIds"
                />
                <span>{{ project.name }}</span>
              </label>
            </div>
          </div>

          <div v-if="selectedProjectIds.length > 0" class="selected-projects">
            <div class="section-title">已选择 ({{ selectedProjectIds.length }})</div>
            <div class="selected-list">
              <span v-for="projectId in selectedProjectIds" :key="projectId" class="selected-tag">
                {{ getProjectName(projectId) }}
                <button type="button" class="remove-btn" @click="removeProject(projectId)">×</button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="handleClose">
          取消
        </button>
        <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting || loading">
          {{ isSubmitting ? '保存中...' : '保存' }}
        </button>
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
  loading: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  userName: {
    type: String,
    default: '',
  },
  initialProjectIds: {
    type: Array,
    default: () => [],
  },
  projectOptions: {
    type: Array,
    default: () => [],
  },
  projectOptionsLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'submit']);

const selectedProjectIds = ref([]);

// Watch for initial project IDs changes
watch(
  () => props.initialProjectIds,
  (newIds) => {
    selectedProjectIds.value = [...(newIds || [])];
  },
  { immediate: true }
);

const handleClose = () => {
  emit('close');
};

const handleSubmit = () => {
  emit('submit', selectedProjectIds.value);
};

const getProjectName = (projectId) => {
  const project = props.projectOptions.find(p => p.id === projectId);
  return project ? project.name : '未知项目';
};

const removeProject = (projectId) => {
  selectedProjectIds.value = selectedProjectIds.value.filter(id => id !== projectId);
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
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
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
  overflow-y: auto;
  flex: 1;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #8c8c8c;
  font-size: 14px;
}

.project-selection {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.checkbox-label span {
  font-size: 14px;
  color: #262626;
}

.selected-projects {
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.remove-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
}

.remove-btn:hover {
  color: #0050b3;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
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

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

