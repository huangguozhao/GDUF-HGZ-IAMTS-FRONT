<template>
  <div class="role-management-tab">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" @click="$emit('edit', null)">
          + 创建角色
        </button>
        <button class="btn btn-secondary" @click="toggleViewMode">
          {{ viewMode === 'card' ? '列表视图' : '卡片视图' }}
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="搜索角色..."
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
          >
        </div>
        <button class="btn btn-filter" @click="openFilterModal">
          筛选条件
        </button>
      </div>
    </div>

    <!-- 角色列表 - 卡片视图 -->
    <div v-if="viewMode === 'card'" class="role-cards">
      <div
        v-for="role in filteredRoleList"
        :key="role.id"
        class="role-card"
        :class="{ 'system-role': role.isSystem }"
      >
        <div class="role-header">
          <div class="role-icon">
            <el-icon size="24">
              <component :is="getRoleIcon(role.type)" />
            </el-icon>
          </div>
          <div class="role-info">
            <h3 class="role-name">{{ role.name }}</h3>
            <span class="role-code">{{ role.code }}</span>
          </div>
          <div v-if="role.isSystem" class="system-badge">系统角色</div>
        </div>

        <div class="role-description">
          {{ role.description || '暂无描述' }}
        </div>

        <div class="role-stats">
          <div class="stat-item">
            <span class="stat-label">用户数</span>
            <span class="stat-value">{{ role.userCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">权限数</span>
            <span class="stat-value">{{ role.permissionCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">状态</span>
            <el-tag :type="role.status === 'active' ? 'success' : 'info'" size="small">
              {{ role.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </div>

        <div class="role-actions">
          <el-button
            size="small"
            type="primary"
            @click="$emit('edit', role)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!role.isSystem"
            size="small"
            type="danger"
            :loading="deletingIds.has(role.id)"
            @click="$emit('delete', role)"
          >
            删除
          </el-button>
          <el-button
            size="small"
            @click="showRoleDetails(role)"
          >
            详情
          </el-button>
        </div>
      </div>
    </div>

    <!-- 角色列表 - 表格视图 -->
    <div v-else class="role-table">
      <el-table
        :data="filteredRoleList"
        style="width: 100%"
        :loading="loading"
        stripe
      >
        <el-table-column prop="name" label="角色名称" width="150">
          <template #default="{ row }">
            <div class="role-name-cell">
              <el-icon size="16" class="role-icon-small">
                <component :is="getRoleIcon(row.type)" />
              </el-icon>
              <span>{{ row.name }}</span>
              <el-tag v-if="row.isSystem" size="small" type="warning">系统</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="code" label="角色编码" width="120" />

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

        <el-table-column prop="userCount" label="用户数" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.userCount || 0 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="permissionCount" label="权限数" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.permissionCount || 0 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="150" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                size="small"
                type="primary"
                @click="$emit('edit', role)"
              >
                编辑
              </el-button>
              <el-button
                v-if="!row.isSystem"
                size="small"
                type="danger"
                :loading="deletingIds.has(row.id)"
                @click="$emit('delete', row)"
              >
                删除
              </el-button>
              <el-button
                size="small"
                @click="showRoleDetails(row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="$emit('page-change', $event)"
      />
    </div>

    <!-- 角色详情对话框 -->
    <el-dialog
      v-model="roleDetailVisible"
      :title="`角色详情 - ${currentRole?.name || ''}`"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRole" class="role-detail-content">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>角色名称：</label>
              <span>{{ currentRole.name }}</span>
            </div>
            <div class="detail-item">
              <label>角色编码：</label>
              <span>{{ currentRole.code }}</span>
            </div>
            <div class="detail-item">
              <label>角色类型：</label>
              <span>{{ getRoleTypeText(currentRole.type) }}</span>
            </div>
            <div class="detail-item">
              <label>状态：</label>
              <el-tag :type="currentRole.status === 'active' ? 'success' : 'info'">
                {{ currentRole.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <div class="detail-item full-width">
              <label>描述：</label>
              <span>{{ currentRole.description || '暂无描述' }}</span>
            </div>
            <div class="detail-item">
              <label>创建时间：</label>
              <span>{{ formatDate(currentRole.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>更新时间：</label>
              <span>{{ formatDate(currentRole.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>统计信息</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ currentRole.userCount || 0 }}</div>
              <div class="stat-label">关联用户</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ currentRole.permissionCount || 0 }}</div>
              <div class="stat-label">拥有权限</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 筛选对话框 -->
    <el-dialog
      v-model="filterVisible"
      title="筛选条件"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="filter-content">
        <el-form :model="filters" label-width="80px">
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色类型">
            <el-select v-model="filters.type" placeholder="请选择类型" clearable>
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
              <el-option label="访客" value="guest" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">应用</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  User,
  Setting,
  Lock,
  Star,
  View
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  roleList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({})
  },
  deletingIds: {
    type: Set,
    default: () => new Set()
  }
})

// Emits
const emit = defineEmits(['edit', 'delete', 'page-change'])

// 响应式数据
const viewMode = ref('card')
const searchKeyword = ref('')
const roleDetailVisible = ref(false)
const filterVisible = ref(false)
const currentRole = ref(null)

const filters = ref({
  status: '',
  type: '',
  dateRange: []
})

const filteredRoleList = computed(() => {
  let list = props.roleList

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(role =>
      role.name.toLowerCase().includes(keyword) ||
      role.code.toLowerCase().includes(keyword) ||
      (role.description && role.description.toLowerCase().includes(keyword))
    )
  }

  // 状态过滤
  if (filters.value.status) {
    list = list.filter(role => role.status === filters.value.status)
  }

  // 类型过滤
  if (filters.value.type) {
    list = list.filter(role => role.type === filters.value.type)
  }

  // 时间范围过滤
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [startDate, endDate] = filters.value.dateRange
    list = list.filter(role => {
      const createDate = new Date(role.createdAt).toISOString().split('T')[0]
      return createDate >= startDate && createDate <= endDate
    })
  }

  return list
})

// 方法
const getRoleIcon = (type) => {
  const iconMap = {
    admin: Star,
    user: User,
    guest: View,
    system: Lock
  }
  return iconMap[type] || User
}

const getRoleTypeText = (type) => {
  const typeMap = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客',
    system: '系统角色'
  }
  return typeMap[type] || '未知'
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'card' ? 'table' : 'card'
}

const handleSearch = () => {
  // 搜索逻辑已通过computed实现
}

const handleSizeChange = (size) => {
  emit('page-change', 1) // 重置到第一页
}

const showRoleDetails = (role) => {
  currentRole.value = role
  roleDetailVisible.value = true
}

const openFilterModal = () => {
  filterVisible.value = true
}

const resetFilters = () => {
  filters.value = {
    status: '',
    type: '',
    dateRange: []
  }
}

const applyFilters = () => {
  filterVisible.value = false
  // 过滤逻辑已通过computed实现
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听搜索关键词变化
watch(searchKeyword, () => {
  // 可以在这里添加防抖逻辑
})
</script>

<style scoped>
.role-management-tab {
  padding: 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #e6eef8;
}

.btn-secondary:hover {
  background: #f8fbff;
}

.btn-filter {
  background: #fff;
  color: #475569;
  border: 1px solid #e6eef8;
  padding: 6px 12px;
  border-radius: 6px;
}

.btn-filter:hover {
  background: #f8fbff;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9aa4b2;
}

.search-input {
  border: 1px solid #e6eef8;
  border-radius: 12px;
  padding: 8px 12px 8px 36px;
  width: 220px;
  background: #fff;
  transition: box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* 卡片视图 */
.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.role-card {
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  position: relative;
}

.role-card:hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
}

.role-card.system-role {
  border-color: #e6a23c;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.role-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.system-role .role-icon {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.role-info {
  flex: 1;
}

.role-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.role-code {
  font-size: 12px;
  color: #9aa4b2;
}

.system-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #e6a23c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 40px;
}

.role-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fbff;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9aa4b2;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.role-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 表格视图 */
.role-table {
  margin-bottom: 20px;
}

.role-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-icon-small {
  color: #1890ff;
}

.table-actions {
  display: flex;
  gap: 6px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情对话框 */
.role-detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.detail-item span {
  color: #182026;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8fbff;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9aa4b2;
}

/* 筛选对话框 */
.filter-content {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
