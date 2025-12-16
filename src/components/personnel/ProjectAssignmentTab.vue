<template>
  <div class="project-assignment-tab">
    <div class="two-cols">
      <div class="left">
        <ProjectList 
          :projects="displayProjects"
          :selected-id="selectedProjectId"
          :members-count-map="membersCountMap"
          @select="handleSelectProject"
        />
      </div>
      <div class="right">
        <ProjectAssignmentHeader 
          :title="currentProjectName"
          :member-count="membersTotal"
          @add-member="handleAddMember"
        />

        <div v-if="membersLoading" class="loading">加载中...</div>
        <div v-else>
          <ProjectAssignmentTable
            :user-list="members"
            :role-changing-ids="roleChangingIds"
            :deleting-ids="deletingIds"
            @role-change="handleRoleChange"
            @remove-member="handleRemoveMember"
          />

          <ProjectAssignmentPagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="membersTotal"
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
  // 原有 props 保留以兼容父组件，但当前任务分配区域仅使用本地模拟数据展示
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

// ==========================
//  本地模拟项目 & 成员数据
// ==========================
const mockProjects = [
  { id: 1, name: 'Web 管理后台', description: '用于管理系统用户、权限和项目配置的后台系统' },
  { id: 2, name: '移动端 App', description: '面向业务人员的移动端任务管理应用' },
  { id: 3, name: '接口自动化平台', description: '统一管理接口文档、用例与自动化测试的平台' },
];

const mockMembersByProject = {
  1: [
    { id: 101, name: '张伟', email: 'zhang.wei@example.com', role: '项目管理员', createTime: '2025/01/10' },
    { id: 102, name: '李明', email: 'li.ming@example.com', role: '开发人员', createTime: '2025/01/15' },
    { id: 103, name: '王芳', email: 'wang.fang@example.com', role: '测试人员', createTime: '2025/01/20' },
    { id: 104, name: '赵敏', email: 'zhao.min@example.com', role: '只读成员', createTime: '2025/02/02' },
  ],
  2: [
    { id: 201, name: '陈强', email: 'chen.qiang@example.com', role: '项目管理员', createTime: '2025/01/05' },
    { id: 202, name: '刘洋', email: 'liu.yang@example.com', role: '开发人员', createTime: '2025/01/12' },
  ],
  3: [
    { id: 301, name: '孙丽', email: 'sun.li@example.com', role: '测试人员', createTime: '2025/02/01' },
    { id: 302, name: '周杰', email: 'zhou.jie@example.com', role: '开发人员', createTime: '2025/02/08' },
    { id: 303, name: '韩梅', email: 'han.mei@example.com', role: '只读成员', createTime: '2025/02/10' },
  ],
};

// 左侧项目列表：优先使用父组件传入的项目列表，否则使用本地 mock
const displayProjects = computed(() => {
  if (props.projectOptions && props.projectOptions.length) {
    return props.projectOptions;
  }
  return mockProjects;
});

// 根据选中项目和分页信息，从本地 mock 中切片出当前页成员
const allMembersOfSelectedProject = computed(() => {
  if (!selectedProjectId.value) return [];
  return mockMembersByProject[selectedProjectId.value] || [];
});

const membersTotal = computed(() => allMembersOfSelectedProject.value.length);

const members = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allMembersOfSelectedProject.value.slice(start, end);
});

// 左侧项目卡片上的“成员数量”展示
const membersCountMap = computed(() => {
  const map = {};
  for (const [pid, list] of Object.entries(mockMembersByProject)) {
    map[pid] = Array.isArray(list) ? list.length : 0;
  }
  return map;
});

// 任务分配区域不再请求后端，这里始终为 false，仅保留 loading UI 结构
const membersLoading = ref(false);

const currentProjectName = computed(() => {
  const p = (displayProjects.value || []).find(p => (p.id ?? p.projectId) === selectedProjectId.value);
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
  if (page >= 1) {
    currentPage.value = page;
  }
};

watch(
  () => displayProjects.value,
  (list) => {
    if (!selectedProjectId.value && list && list.length) {
      selectedProjectId.value = list[0].id ?? list[0].projectId;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.project-assignment-tab { width: 100%; }
.two-cols { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
.loading { text-align: center; padding: 40px; color: #8c8c8c; }
</style>

