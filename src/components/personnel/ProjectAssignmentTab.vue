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
          :can-add-member="canAddMember"
          @add-member="handleAddMember"
        />

        <TableSkeleton
          v-if="membersLoading"
          :columns="memberTableColumns"
          :row-count="8"
          show-pagination
        />
        <div v-else-if="membersTotal === 0" class="empty-state">
          <div class="empty-content">
            <svg class="empty-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M512 544c141.4 0 256-114.6 256-256S653.4 32 512 32 256 146.6 256 288s114.6 256 256 256zm0 64C353.1 608 64 688.5 64 848v96h896v-96c0-159.5-289.1-240-448-240z"/>
            </svg>
            <p class="empty-title">该项目暂无成员</p>
            <p class="empty-description" v-if="canAddMember">点击右上角"添加成员"按钮，为项目添加团队成员</p>
            <button v-if="canAddMember" class="empty-action-btn" @click="handleAddMember">
              <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm192 472H520v184h-16V536H312v-16h192V328h16v192h184v16z"></path>
              </svg>
              添加成员
            </button>
          </div>
        </div>
        <div v-else>
          <ProjectAssignmentTable
            :user-list="members"
            :role-changing-ids="roleChangingIds"
            :deleting-ids="deletingIds"
            :can-modify-role="canModifyRole"
            :can-delete-member="canDeleteMember"
            :current-user-project-role="currentUserProjectRole"
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

    <!-- Add Member Modal -->
    <AddProjectMemberModal
      :visible="isAddMemberModalVisible"
      :is-submitting="isAddingMember"
      :selected-user-ids="currentMemberIds"
      @close="closeAddMemberModal"
      @submit="handleAddMemberSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getProjectMembers, addProjectMember, updateProjectMemberRole } from '@/api/project';
import { removeUserFromProject } from '@/api/personnel';
import { useUserStore } from '@/stores/useUserStore';
import ProjectAssignmentHeader from './ProjectAssignmentHeader.vue';
import ProjectAssignmentTable from './ProjectAssignmentTable.vue';
import ProjectAssignmentPagination from './ProjectAssignmentPagination.vue';
import ProjectList from './ProjectList.vue';
import AddProjectMemberModal from './AddProjectMemberModal.vue';
import { TableSkeleton } from '@/components/ui/skeletons';

const userStore = useUserStore();
// 确保 userId 字段名称正确（后端返回 camelCase: userId）
const currentUserId = computed(() => {
  const uid = userStore.userInfo?.userId || userStore.userInfo?.id || userStore.userInfo?.user_id;
  return uid ? Number(uid) : null;
});

const props = defineProps({
  // 保留原有 props 以兼容父组件，项目成员列表由本组件通过项目成员分页接口加载
  userList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: () => ({ currentPage: 1, pageSize: 8, total: 0 }) },
  assignmentLoadingIds: { type: Set, default: () => new Set() },
  projectOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(['role-change', 'remove-member', 'add-member']);

const roleChangingIds = ref(new Set());
const deletingIds = ref(new Set());

// 表格列配置（用于骨架屏）
const memberTableColumns = [
  { key: 'name', type: 'avatar', width: '25%', contentWidth: 100 },
  { key: 'email', type: 'text', width: '30%', contentWidth: 150 },
  { key: 'role', type: 'tag', width: '20%', contentWidth: 60 },
  { key: 'date', type: 'text', width: '20%', contentWidth: 80 },
  { key: 'actions', type: 'actions', width: '15%', buttonCount: 1, buttonWidth: 60 }
];

// 添加成员相关状态
const isAddMemberModalVisible = ref(false);
const isAddingMember = ref(false);
const allMemberIds = ref(new Set()); // 存储当前项目的所有成员ID

// 获取当前项目的所有成员ID（用于过滤搜索结果）
const fetchAllMemberIds = async () => {
  if (!selectedProjectId.value) {
    allMemberIds.value.clear();
    return;
  }
  
  const memberIdsSet = new Set();
  let page = 1;
  let hasMore = true;
  
  try {
    while (hasMore) {
      const memberResponse = await getProjectMembers(selectedProjectId.value, {
        page,
        pageSize: 100,
      });
      const memberList = normalizeProjectMembers(memberResponse?.data).list;
      memberList.forEach(member => {
        memberIdsSet.add(member.id);
      });
      
      const total = memberResponse?.data?.total || 0;
      const currentTotal = page * 100;
      hasMore = currentTotal < total;
      page++;
    }
    
    allMemberIds.value = memberIdsSet;
  } catch (error) {
    console.error('获取项目成员ID失败:', error);
    allMemberIds.value.clear();
  }
};

// 当前项目的成员ID列表（用于过滤搜索结果）
const currentMemberIds = computed(() => {
  return Array.from(allMemberIds.value);
});

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
// 当前用户在当前项目中的角色（用于判断是否可以修改其他成员角色）
const currentUserProjectRole = ref(null);

// 判断当前用户是否可以修改其他成员角色
const canModifyRole = computed(() => {
  // admin 用户可以修改
  if (userStore.isAdmin) return true;
  // owner 和 manager 可以修改
  if (currentUserProjectRole.value === 'owner' || currentUserProjectRole.value === 'manager') return true;
  // 其他角色（developer, tester, viewer）不能修改
  return false;
});

// 判断当前用户是否可以删除成员
const canDeleteMember = computed(() => {
  // admin 用户可以删除
  if (userStore.isAdmin) return true;
  // owner 可以删除任何成员
  if (currentUserProjectRole.value === 'owner') return true;
  // manager 可以删除 developer/tester/viewer，但不能删除 owner
  if (currentUserProjectRole.value === 'manager') return true;
  // 其他角色（developer, tester, viewer）不能删除
  return false;
});

// 判断当前用户是否可以添加成员（与修改角色权限相同：admin/owner/manager）
const canAddMember = computed(() => {
  return canModifyRole.value;
});

// 将后端返回的英文项目角色转换为中文显示
const translateProjectRole = (projectRole) => {
  const roleMap = {
    'owner': '项目负责人',
    'manager': '项目管理员',
    'developer': '开发人员',
    'tester': '测试人员',
    'viewer': '只读成员',
  };
  return roleMap[projectRole?.toLowerCase()] || projectRole || '成员';
};

// 将中文角色转换回英文项目角色
const translateRoleToEnglish = (chineseRole) => {
  const roleMap = {
    '项目负责人': 'owner',
    '项目管理员': 'manager',
    '开发人员': 'developer',
    '测试人员': 'tester',
    '只读成员': 'viewer',
  };
  return roleMap[chineseRole] || chineseRole;
};

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
      userId: item.userId, // 保留 userId 用于匹配当前用户
      name: user.name || item.userName || item.name || '未知用户',
      email: user.email || item.email || '',
      avatar: user.avatarUrl || item.avatarUrl || item.avatar || '',
      // 优先使用项目角色（projectRole），并转换为中文显示
      role: translateProjectRole(item.projectRole) || user.position || item.role || '成员',
      projectRole: item.projectRole, // 保留英文角色名
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

    // 查找当前用户在项目中的角色（确保类型一致）
    const currentUserMember = list.find(m => Number(m.userId) === currentUserId.value);
    currentUserProjectRole.value = currentUserMember?.projectRole || null;
    console.log('[ProjectAssignmentTab] 当前用户ID:', currentUserId.value, '项目角色:', currentUserProjectRole.value);

    membersCountMap.value = {
      ...(membersCountMap.value || {}),
      [selectedProjectId.value]: total,
    };
  } catch (e) {
    console.error('获取项目成员失败:', e);
    members.value = [];
    membersTotal.value = 0;
    currentUserProjectRole.value = null;
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
  // 同时更新所有成员ID列表
  fetchAllMemberIds();
};

const handleAddMember = async () => {
  if (!selectedProjectId.value) return;
  // 获取所有成员ID用于过滤
  await fetchAllMemberIds();
  isAddMemberModalVisible.value = true;
};

const closeAddMemberModal = () => {
  isAddMemberModalVisible.value = false;
};

const handleAddMemberSubmit = async ({ members }) => {
  if (!selectedProjectId.value || !members || members.length === 0) return;
  
  isAddingMember.value = true;
  let successCount = 0;
  let failCount = 0;
  
  try {
    // 批量添加成员
    const promises = members.map(member =>
      addProjectMember(selectedProjectId.value, {
        userId: member.userId,
        role: member.projectRole,
      }).catch(error => {
        console.error(`添加用户 ${member.userId} 失败:`, error);
        failCount++;
        return null;
      })
    );
    
    await Promise.all(promises);
    successCount = members.length - failCount;
    
    // 添加成功后关闭弹窗并重新加载成员列表
    closeAddMemberModal();
    await loadProjectMembers();
    // 更新所有成员ID列表
    await fetchAllMemberIds();
    
    // 更新成员数量统计
    if (membersCountMap.value[selectedProjectId.value] !== undefined) {
      membersCountMap.value[selectedProjectId.value] += successCount;
    }
    
    // 通知父组件显示成功提示
    if (failCount === 0) {
      emit('add-member', { success: true, count: successCount });
    } else {
      emit('add-member', { 
        success: true, 
        count: successCount, 
        failCount,
        message: `成功添加 ${successCount} 名成员，${failCount} 名成员添加失败`
      });
    }
  } catch (error) {
    console.error('批量添加项目成员失败:', error);
    // 通知父组件显示错误提示
    emit('add-member', { success: false, error });
  } finally {
    isAddingMember.value = false;
  }
};

const handleRoleChange = async (user, newRole) => {
  if (!user?.id || !selectedProjectId.value) return;
  
  // 如果正在更新中，直接返回
  if (roleChangingIds.value.has(user.id)) return;

  const oldRole = user.role;
  const newProjectRole = translateRoleToEnglish(newRole);
  
  // 乐观更新：先更新 UI
  user.role = newRole;
  roleChangingIds.value.add(user.id);

  try {
    await updateProjectMemberRole(selectedProjectId.value, user.id, {
      role: newProjectRole,
    });
    
    // 更新成功后重新加载项目成员列表以确保数据同步
    await loadProjectMembers();
    
    // 通知父组件显示成功提示
    emit('role-change', { user, newRole, success: true });
  } catch (error) {
    console.error('更新项目成员角色失败:', error);
    // 回滚 UI
    user.role = oldRole;
    // 通知父组件显示错误提示
    emit('role-change', { user, newRole, success: false, error });
  } finally {
    roleChangingIds.value.delete(user.id);
  }
};

const handleRemoveMember = async (user) => {
  if (!user?.id || !selectedProjectId.value) return;
  
  // 确认移除
  if (!confirm(`确定要从项目中移除成员 "${user.name}" 吗？`)) {
    return;
  }

  // 如果正在删除中，直接返回
  if (deletingIds.value.has(user.id)) return;

  deletingIds.value.add(user.id);
  try {
    await removeUserFromProject(user.id, selectedProjectId.value);
    
    // 移除成功后重新加载项目成员列表
    await loadProjectMembers();
    // 更新所有成员ID列表
    await fetchAllMemberIds();
    
    // 如果当前页没有成员了，且不是第一页，则跳转到上一页
    if (members.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
      await loadProjectMembers();
    }
    
    // 更新成员数量统计
    if (membersCountMap.value[selectedProjectId.value] > 0) {
      membersCountMap.value[selectedProjectId.value]--;
    }
    
    // 通知父组件显示成功提示
    emit('remove-member', { user, projectId: selectedProjectId.value, success: true });
  } catch (error) {
    console.error('移除项目成员失败:', error);
    // 通知父组件显示错误提示
    emit('remove-member', { user, projectId: selectedProjectId.value, success: false, error });
  } finally {
    deletingIds.value.delete(user.id);
  }
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
      fetchAllMemberIds();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.project-assignment-tab { width: 100%; }
.two-cols { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items:start; }
.loading { text-align: center; padding: 40px; color: #8c8c8c; }

/* subtle entrance animation for panels */
@keyframes panelEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.left, .right { animation: panelEnter .28s cubic-bezier(.2,.8,.2,1); }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d9d9d9;
  margin: 0 auto 24px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 8px;
}

.empty-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 24px;
  line-height: 1.5;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-action-btn:hover {
  background-color: #40a9ff;
}

.empty-action-btn .icon {
  width: 16px;
  height: 16px;
}
</style>

