<template>
  <div class="task-schedule-page page-container">
    <div class="content-grid">
      <aside class="left-column">
        <task-list
          :filters="filters"
          @selectTask="handleSelectTask"
          @openCreate="openCreateModal"
        />
      </aside>
      <section class="center-column">
        <task-detail-panel
          v-if="selectedTask"
          :task="selectedTask"
        />
        <div v-else class="empty-detail">请选择一个任务查看详情</div>
      </section>
    </div>

    <create-task-modal
      v-model:visible="isCreateModalVisible"
      @created="handleTaskCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TaskList from '@/components/tasks/TaskList.vue';
import TaskDetailPanel from '@/components/tasks/TaskDetailPanel.vue';
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue';

const filters = ref({
  projectId: null,
  status: 'all',
  keyword: ''
});

const selectedTask = ref(null);
const isCreateModalVisible = ref(false);

function handleSelectTask(task) {
  selectedTask.value = task;
}

function openCreateModal() {
  isCreateModalVisible.value = true;
}

function handleTaskCreated(newTask) {
  // For now just close modal and select created task
  isCreateModalVisible.value = false;
  selectedTask.value = newTask;
}
</script>

<style scoped>
.task-schedule-page {
  padding: 16px;
}
.content-grid {
  display: flex;
  gap: 16px;
}
.left-column {
  width: 52%;
  min-width: 480px;
}
.center-column {
  width: 36%;
  min-width: 320px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.empty-detail {
  color: #888;
  padding: 32px;
  text-align: center;
}

@media (max-width: 1000px) {
  .content-grid { flex-direction:column; }
  .left-column, .center-column { width:100%; min-width:0; }
}
</style>


