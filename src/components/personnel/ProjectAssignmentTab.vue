<template>
  <div class="project-assignment-tab">
    <div class="two-cols">
      <div class="left">
        <ProjectList 
          :projects="projectOptions"
          :selected-id="selectedProjectId"
          :members-count-map="membersCountMap"
          @select="handleSelectProject"
        />
      </div>
      <div class="right">
        <ProjectAssignmentHeader 
          :title="currentProjectName"
          :member-count="filteredUsers.length"
          @add-member="handleAddMember"
        />

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else>
          <ProjectAssignmentTable
            :user-list="pagedUsers"
            :role-changing-ids="roleChangingIds"
            :deleting-ids="deletingIds"
            @role-change="handleRoleChange"
            @remove-member="handleRemoveMember"
          />

          <ProjectAssignmentPagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredUsers.length"
            @page-change="handleLocalPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ProjectAssignmentHeader from './ProjectAssignmentHeader.vue';
import ProjectAssignmentTable from './ProjectAssignmentTable.vue';
import ProjectAssignmentPagination from './ProjectAssignmentPagination.vue';
import ProjectList from './ProjectList.vue';

const props = defineProps({
  userList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: () => ({ currentPage: 1, pageSize: 8, total: 0 }) },
  assignmentLoadingIds: { type: Set, default: () => new Set() },
  projectOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(['role-change', 'remove-member']);

const roleChangingIds = ref(new Set());
const deletingIds = ref(new Set());

const pageSize = computed(() => props.pagination.pageSize || 8);
const currentPage = ref(1);

const selectedProjectId = ref(null);
watch(
  () => props.projectOptions,
  (list) => {
    if (!selectedProjectId.value && list && list.length) {
      selectedProjectId.value = list[0].id ?? list[0].projectId;
    }
  },
  { immediate: true }
);

const filteredUsers = computed(() => {
  if (!selectedProjectId.value) return [];
  return (props.userList || []).filter(u => Array.isArray(u.assignedProjectIds) && u.assignedProjectIds.includes(selectedProjectId.value));
});

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

const membersCountMap = computed(() => {
  const map = {};
  for (const u of props.userList || []) {
    (u.assignedProjectIds || []).forEach(pid => {
      map[pid] = (map[pid] || 0) + 1;
    });
  }
  return map;
});

const currentProjectName = computed(() => {
  const p = (props.projectOptions || []).find(p => (p.id ?? p.projectId) === selectedProjectId.value);
  return p ? (p.name || p.projectName) : '';
});

const handleSelectProject = (pid) => {
  selectedProjectId.value = pid;
  currentPage.value = 1;
};

const handleAddMember = () => {
  // 预留：可在此发出事件由父级弹出添加成员到项目的弹窗
  // emit('add-member', selectedProjectId.value);
};

const handleRoleChange = (user, newRole) => {
  emit('role-change', user, newRole);
};

const handleRemoveMember = (user) => {
  if (!selectedProjectId.value) return;
  emit('remove-member', { user, projectId: selectedProjectId.value });
};

const handleLocalPageChange = (page) => {
  const max = Math.ceil(filteredUsers.value.length / pageSize.value) || 1;
  if (page >= 1 && page <= max) currentPage.value = page;
};
</script>

<style scoped>
.project-assignment-tab { width: 100%; }
.two-cols { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
.loading { text-align: center; padding: 40px; color: #8c8c8c; }
</style>

