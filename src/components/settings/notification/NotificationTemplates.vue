<template>
  <div class="notification-templates">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" @click="handleAddTemplate">
          <el-icon><Plus /></el-icon>
          新建模板
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="filterType"
          placeholder="模板类型"
          clearable
          @change="handleFilter"
        >
          <el-option label="邮件模板" value="email" />
          <el-option label="短信模板" value="sms" />
          <el-option label="系统模板" value="system" />
        </el-select>
        <el-button :icon="Refresh" @click="handleRefresh" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="templates-table">
      <el-table
        :data="filteredTemplates"
        :loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="模板名称" min-width="150">
          <template #default="{ row }">
            <div class="template-name">
              <span class="name">{{ row.name }}</span>
              <el-tag
                :type="getTypeTagType(row.type)"
                size="small"
                class="type-tag"
              >
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="主题/标题" min-width="200">
          <template #default="{ row }">
            <span v-if="row.type === 'email'">{{ row.subject }}</span>
            <span v-else>{{ row.title || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" min-width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" min-width="150">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleEditTemplate(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteTemplate(row)"
              >
                删除
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
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredTemplates.length === 0" class="empty-state">
      <el-empty description="暂无通知模板">
        <el-button type="primary" @click="handleAddTemplate">
          创建第一个模板
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  templates: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'edit', 'delete'])

const searchKeyword = ref('')
const filterType = ref('')
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let filtered = props.templates

  // 类型过滤
  if (filterType.value) {
    filtered = filtered.filter(template => template.type === filterType.value)
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(template =>
      template.name.toLowerCase().includes(keyword) ||
      (template.description && template.description.toLowerCase().includes(keyword)) ||
      (template.subject && template.subject.toLowerCase().includes(keyword))
    )
  }

  // 分页
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  pagination.value.total = filtered.length

  return filtered.slice(start, end)
})

// 获取类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    email: 'success',
    sms: 'warning',
    system: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    email: '邮件',
    sms: '短信',
    system: '系统'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 事件处理
const handleAddTemplate = () => {
  emit('edit', null)
}

const handleEditTemplate = (template) => {
  emit('edit', template)
}

const handleDeleteTemplate = (template) => {
  emit('delete', template)
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  // 触发重新计算
}

const handleFilter = () => {
  pagination.value.currentPage = 1
  // 触发重新计算
}

const handleRefresh = () => {
  emit('refresh')
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
}

// 监听搜索关键词变化
watch(searchKeyword, () => {
  pagination.value.currentPage = 1
})

// 监听过滤类型变化
watch(filterType, () => {
  pagination.value.currentPage = 1
})

// 初始化时更新总数
watch(() => props.templates, () => {
  pagination.value.total = props.templates.length
}, { immediate: true })
</script>

<style scoped>
.notification-templates {
  padding: 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
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

.search-input-wrapper {
  width: 250px;
}

.templates-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.template-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 500;
}

.type-tag {
  font-size: 11px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

:deep(.el-table th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-empty__description p) {
  color: #6b7280;
}
</style>
