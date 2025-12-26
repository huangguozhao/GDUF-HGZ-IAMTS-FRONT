<template>
  <div class="permission-logs-tab">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-secondary" @click="exportLogs">
          导出日志
        </button>
        <button class="btn btn-secondary" @click="clearLogs">
          清空日志
        </button>
      </div>
      <div class="toolbar-right">
        <div class="filter-group">
          <el-select
            v-model="filters.operation"
            placeholder="操作类型"
            clearable
            style="width: 120px"
          >
            <el-option label="创建角色" value="create_role" />
            <el-option label="更新角色" value="update_role" />
            <el-option label="删除角色" value="delete_role" />
            <el-option label="分配权限" value="assign_permission" />
            <el-option label="移除权限" value="remove_permission" />
            <el-option label="用户角色变更" value="user_role_change" />
            <el-option label="批量操作" value="batch_operation" />
          </el-select>

          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />

          <el-input
            v-model="filters.operator"
            placeholder="操作人"
            style="width: 120px"
          />

          <el-button @click="applyFilters">筛选</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-table">
      <el-table
        :data="filteredLogList"
        style="width: 100%"
        :loading="loading"
        stripe
        height="500"
      >
        <el-table-column prop="timestamp" label="时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>

        <el-table-column prop="operator" label="操作人" width="120" align="center">
          <template #default="{ row }">
            <div class="operator-info">
              <span class="operator-name">{{ row.operator }}</span>
              <span class="operator-role">{{ getOperatorRole(row.operatorRole) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="operation" label="操作类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getOperationColor(row.operation)">
              {{ getOperationText(row.operation) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="target" label="操作对象" min-width="150">
          <template #default="{ row }">
            <div class="target-info">
              <div class="target-name">{{ row.target }}</div>
              <div class="target-type">{{ getTargetTypeText(row.targetType) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="details" label="操作详情" min-width="200">
          <template #default="{ row }">
            <div class="operation-details">
              {{ row.details }}
              <el-button
                v-if="row.changes && row.changes.length > 0"
                size="mini"
                type="text"
                @click="showChangeDetails(row)"
              >
                查看变更
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="result" label="结果" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="ip" label="IP地址" width="130" align="center">
          <template #default="{ row }">
            <span class="ip-address">{{ row.ip }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button size="mini" @click="showLogDetails(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="$emit('page-change', $event)"
      />
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailVisible"
      title="日志详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentLog" class="log-detail-content">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>操作时间：</label>
              <span>{{ formatDateTime(currentLog.timestamp) }}</span>
            </div>
            <div class="detail-item">
              <label>操作人：</label>
              <span>{{ currentLog.operator }}</span>
            </div>
            <div class="detail-item">
              <label>操作类型：</label>
              <el-tag :type="getOperationColor(currentLog.operation)">
                {{ getOperationText(currentLog.operation) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>操作结果：</label>
              <el-tag :type="currentLog.result === 'success' ? 'success' : 'danger'">
                {{ currentLog.result === 'success' ? '成功' : '失败' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>IP地址：</label>
              <span>{{ currentLog.ip }}</span>
            </div>
            <div class="detail-item">
              <label>User-Agent：</label>
              <span>{{ currentLog.userAgent || '未知' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>操作对象</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>对象类型：</label>
              <span>{{ getTargetTypeText(currentLog.targetType) }}</span>
            </div>
            <div class="detail-item">
              <label>对象名称：</label>
              <span>{{ currentLog.target }}</span>
            </div>
            <div class="detail-item full-width">
              <label>对象ID：</label>
              <span>{{ currentLog.targetId }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>操作详情</h4>
          <div class="operation-description">
            <p>{{ currentLog.details }}</p>
            <div v-if="currentLog.result === 'failure'" class="error-message">
              <strong>错误信息：</strong>{{ currentLog.errorMessage }}
            </div>
          </div>
        </div>

        <div v-if="currentLog.changes && currentLog.changes.length > 0" class="detail-section">
          <h4>变更详情</h4>
          <div class="changes-list">
            <div
              v-for="change in currentLog.changes"
              :key="change.field"
              class="change-item"
            >
              <div class="change-field">{{ change.field }}</div>
              <div class="change-values">
                <span class="old-value">{{ change.oldValue }}</span>
                <span class="arrow">→</span>
                <span class="new-value">{{ change.newValue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 变更详情对话框 -->
    <el-dialog
      v-model="changeDetailVisible"
      title="变更详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentLog" class="change-detail-content">
        <div class="change-summary">
          <p><strong>操作：</strong>{{ getOperationText(currentLog.operation) }}</p>
          <p><strong>对象：</strong>{{ currentLog.target }} ({{ getTargetTypeText(currentLog.targetType) }})</p>
          <p><strong>时间：</strong>{{ formatDateTime(currentLog.timestamp) }}</p>
        </div>

        <div class="changes-table">
          <el-table :data="currentLog.changes || []" style="width: 100%">
            <el-table-column prop="field" label="字段" width="120" />
            <el-table-column prop="oldValue" label="变更前" min-width="150" />
            <el-table-column prop="newValue" label="变更后" min-width="150" />
            <el-table-column label="变更类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.oldValue && row.newValue ? 'warning' : (row.newValue ? 'success' : 'danger')" size="small">
                  {{ row.oldValue && row.newValue ? '修改' : (row.newValue ? '新增' : '删除') }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  logList: {
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
  }
})

// Emits
const emit = defineEmits(['page-change', 'filter-change'])

// 响应式数据
const logDetailVisible = ref(false)
const changeDetailVisible = ref(false)
const currentLog = ref(null)

const filters = reactive({
  operation: '',
  dateRange: [],
  operator: ''
})

const filteredLogList = computed(() => {
  let list = props.logList

  // 操作类型过滤
  if (filters.operation) {
    list = list.filter(log => log.operation === filters.operation)
  }

  // 操作人过滤
  if (filters.operator) {
    const operator = filters.operator.toLowerCase()
    list = list.filter(log => log.operator.toLowerCase().includes(operator))
  }

  // 日期范围过滤
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange
    list = list.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      return logDate >= startDate && logDate <= endDate
    })
  }

  return list
})

// 方法
const getOperationText = (operation) => {
  const operationMap = {
    create_role: '创建角色',
    update_role: '更新角色',
    delete_role: '删除角色',
    assign_permission: '分配权限',
    remove_permission: '移除权限',
    user_role_change: '用户角色变更',
    batch_operation: '批量操作'
  }
  return operationMap[operation] || operation
}

const getOperationColor = (operation) => {
  const colorMap = {
    create_role: 'success',
    update_role: 'primary',
    delete_role: 'danger',
    assign_permission: 'success',
    remove_permission: 'warning',
    user_role_change: 'primary',
    batch_operation: 'info'
  }
  return colorMap[operation] || 'info'
}

const getTargetTypeText = (targetType) => {
  const typeMap = {
    role: '角色',
    user: '用户',
    permission: '权限',
    system: '系统'
  }
  return typeMap[targetType] || targetType
}

const getOperatorRole = (role) => {
  if (!role) return ''
  return `(${role})`
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleSizeChange = (size) => {
  emit('page-change', 1) // 重置到第一页
}

const applyFilters = () => {
  emit('filter-change', { ...filters })
}

const resetFilters = () => {
  Object.assign(filters, {
    operation: '',
    dateRange: [],
    operator: ''
  })
  emit('filter-change', { ...filters })
}

const showLogDetails = (log) => {
  currentLog.value = log
  logDetailVisible.value = true
}

const showChangeDetails = (log) => {
  currentLog.value = log
  changeDetailVisible.value = true
}

const exportLogs = () => {
  // 导出日志功能
  ElMessage.info('导出功能开发中')
}

const clearLogs = async () => {
  const confirmed = await ElMessageBox.confirm(
    '确定要清空所有权限日志吗？此操作不可恢复。',
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )

  if (!confirmed) return

  // 调用清空日志API
  ElMessage.success('日志清空成功')
}
</script>

<style scoped>
.permission-logs-tab {
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

.btn-secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #e6eef8;
}

.btn-secondary:hover {
  background: #f8fbff;
}

.filter-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.logs-table {
  margin-bottom: 20px;
}

.operator-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.operator-name {
  font-weight: 500;
  color: #182026;
}

.operator-role {
  font-size: 12px;
  color: #9aa4b2;
}

.target-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.target-name {
  font-weight: 500;
  color: #182026;
}

.target-type {
  font-size: 12px;
  color: #9aa4b2;
}

.operation-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ip-address {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #6b7280;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.log-detail-content,
.change-detail-content {
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

.operation-description {
  padding: 12px;
  background: #f8fbff;
  border-radius: 6px;
  border: 1px solid #e6eef8;
}

.error-message {
  margin-top: 8px;
  padding: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fbff;
  border-radius: 6px;
  border: 1px solid #e6eef8;
}

.change-field {
  font-weight: 500;
  color: #182026;
  min-width: 80px;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.old-value {
  color: #dc2626;
  text-decoration: line-through;
}

.arrow {
  color: #6b7280;
}

.new-value {
  color: #16a34a;
  font-weight: 500;
}

.change-summary {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fbff;
  border-radius: 6px;
  border: 1px solid #e6eef8;
}

.change-summary p {
  margin: 4px 0;
  color: #182026;
}

.changes-table {
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .logs-table {
    overflow-x: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
