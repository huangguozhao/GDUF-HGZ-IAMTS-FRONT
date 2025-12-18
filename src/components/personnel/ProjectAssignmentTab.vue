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
import { getProjectMembers } from '@/api/project';
import ProjectAssignmentHeader from './ProjectAssignmentHeader.vue';
import ProjectAssignmentTable from './ProjectAssignmentTable.vue';
import ProjectAssignmentPagination from './ProjectAssignmentPagination.vue';
import ProjectList from './ProjectList.vue';

const props = defineProps({
  // 保留原有 props 以兼容父组件，项目成员列表由本组件通过项目成员分页接口加载
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

// 左侧项目列表：直接使用父组件传入的项目列表
const displayProjects = computed(() => {
  if (props.projectOptions && props.projectOptions.length) {
    return props.projectOptions;
  }
  return [];
});

// 项目成员数据（从后端分页加载）
const members = ref([]);
const membersTotal = ref(0);
const membersLoading = ref(false);
// 记录每个项目的成员数量，用于左侧项目卡片展示
const membersCountMap = ref({});

// 统一转换 ProjectMembersPageResultDTO 中的成员数据到前端表格结构
const normalizeProjectMembers = (payload = {}) => {
  const list =
    (payload && Array.isArray(payload.items) && payload.items) ||
    (payload && Array.isArray(payload.list) && payload.list) ||
    (payload && Array.isArray(payload.records) && payload.records) ||
    (payload && Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload) ? payload : []);

  const total =
    payload?.total ??
    payload?.totalCount ??
    payload?.totalElements ??
    payload?.count ??
    list.length;

  const mapped = list.map((item) => {
    const user = item.userInfo || {};
    return {
      id: item.userId ?? item.memberId ?? item.id,
      name: user.name || item.userName || item.name || '未知用户',
      email: user.email || item.email || '',
      avatar: user.avatarUrl || item.avatarUrl || item.avatar || '',
      role: user.position || item.projectRole || item.role || '成员',
      createTime: item.joinTime ? new Date(item.joinTime).toLocaleDateString() : '',
      avatarError: false,
    };
  });

  return { list: mapped, total };
};

const loadProjectMembers = async () => {
  if (!selectedProjectId.value) {
    members.value = [];
    membersTotal.value = 0;
    return;
  }
  membersLoading.value = true;
  try {
    const resp = await getProjectMembers(selectedProjectId.value, {
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    const { list, total } = normalizeProjectMembers(resp?.data);
    members.value = list;
    membersTotal.value = total;
    membersCountMap.value = {
      ...(membersCountMap.value || {}),
      [selectedProjectId.value]: total,
    };
  } catch (e) {
    console.error('获取项目成员失败:', e);
    members.value = [];
    membersTotal.value = 0;
  } finally {
    membersLoading.value = false;
  }
};

const currentProjectName = computed(() => {
  const p = (displayProjects.value || []).find(p => (p.id ?? p.projectId) === selectedProjectId.value);
  return p ? (p.name || p.projectName) : '';
});

const handleSelectProject = (pid) => {
  selectedProjectId.value = pid;
  currentPage.value = 1;
  loadProjectMembers();
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
    loadProjectMembers();
  }
};

watch(
  () => displayProjects.value,
  (list) => {
    if (!selectedProjectId.value && list && list.length) {
      selectedProjectId.value = list[0].id ?? list[0].projectId;
      currentPage.value = 1;
      loadProjectMembers();
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

