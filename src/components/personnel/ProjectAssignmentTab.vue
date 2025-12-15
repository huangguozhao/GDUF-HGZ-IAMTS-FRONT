<template>
  <div class="project-assignment-tab">
    <ProjectAssignmentHeader 
      :member-count="userList.length"
      @add-member="handleAddMember"
    />

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="userList.length === 0" class="empty-state">
      <p>暂无用户数据</p>
    </div>

    <div v-else>
      <ProjectAssignmentTable
        :user-list="userList"
        :role-changing-ids="roleChangingIds"
        :deleting-ids="deletingIds"
        @role-change="handleRoleChange"
        @delete="handleDeleteUser"
      />

      <ProjectAssignmentPagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProjectAssignmentHeader from './ProjectAssignmentHeader.vue';
import ProjectAssignmentTable from './ProjectAssignmentTable.vue';
import ProjectAssignmentPagination from './ProjectAssignmentPagination.vue';

const props = defineProps({
  userList: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({ currentPage: 1, pageSize: 8, total: 0 }),
  },
  assignmentLoadingIds: {
    type: Set,
    default: () => new Set(),
  },
});

const emit = defineEmits(['open-assign-modal', 'page-change', 'role-change', 'delete']);

const roleChangingIds = ref(new Set());
const deletingIds = ref(new Set());

const handleAddMember = () => {
  emit('open-assign-modal', null);
};

const handleRoleChange = (user, newRole) => {
  emit('role-change', user, newRole);
};

const handleDeleteUser = (user) => {
  emit('delete', user);
};

const handlePageChange = (page) => {
  if (page > 0 && page <= Math.ceil(props.pagination.total / props.pagination.pageSize)) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
.project-assignment-tab {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}
</style>

