<template>
  <el-dialog
    v-model="visible"
    title="选择测试用例"
    width="800px"
    :close-on-click-modal="false"
    @open="handleOpen"
  >
    <div class="case-selector">
      <div class="selector-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用例名称"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="stats">
          已选择 {{ selectedCases.length }} 个用例
        </div>
      </div>

      <div class="case-list" v-loading="loading">
        <div class="case-item" v-for="caseItem in filteredCases" :key="caseItem.id">
          <div class="case-info">
            <span class="case-name">{{ caseItem.name }}</span>
            <span class="case-project">{{ caseItem.projectName }}</span>
            <el-tag size="small" type="info">{{ caseItem.status }}</el-tag>
          </div>
          <el-button
            :type="isSelected(caseItem.id) ? 'danger' : 'primary'"
            size="small"
            @click="toggleCaseSelection(caseItem)"
          >
            {{ isSelected(caseItem.id) ? '移除' : '添加' }}
          </el-button>
        </div>

        <div v-if="filteredCases.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">未找到匹配的用例</div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('cancel')">关闭</el-button>
      <el-button type="primary" @click="handleConfirm">
        确定 ({{ selectedCases.length }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getTestCases } from '../../api/testCase'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedCases: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedCases', 'cancel'])

const searchKeyword = ref('')
const loading = ref(false)
const allCases = ref([])

// 计算属性
const filteredCases = computed(() => {
  if (!searchKeyword.value) return allCases.value
  return allCases.value.filter(caseItem =>
    caseItem.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    (caseItem.projectName && caseItem.projectName.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  )
})

// 检查用例是否已选择
const isSelected = (caseId) => {
  return props.selectedCases.some(item => item.id === caseId)
}

// 切换用例选择
const toggleCaseSelection = (caseItem) => {
  const newSelected = [...props.selectedCases]
  const index = newSelected.findIndex(item => item.id === caseItem.id)

  if (index > -1) {
    newSelected.splice(index, 1)
  } else {
    newSelected.push(caseItem)
  }

  emit('update:selectedCases', newSelected)
}

// 加载用例数据
const loadCases = async () => {
  try {
    loading.value = true
    const response = await getTestCases()
    if (response.code === 200) {
      allCases.value = response.data || []
    } else {
      ElMessage.error('加载用例数据失败')
    }
  } catch (error) {
    console.error('加载用例失败:', error)
    ElMessage.error('加载用例数据失败')
  } finally {
    loading.value = false
  }
}

// 处理对话框打开
const handleOpen = () => {
  if (allCases.value.length === 0) {
    loadCases()
  }
}

// 确认选择
const handleConfirm = () => {
  emit('cancel')
}

// 监听搜索关键词变化
watch(searchKeyword, () => {
  // 可以在这里添加防抖逻辑
})
</script>

<style scoped>
.case-selector {
  max-height: 500px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.stats {
  font-size: 14px;
  color: #606266;
}

.case-list {
  max-height: 400px;
  overflow-y: auto;
}

.case-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.case-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.case-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.case-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.case-project {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .selector-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .case-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
