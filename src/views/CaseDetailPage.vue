<template>
  <div class="case-detail-page">
    <PageEnterTransition>
      <div v-if="loading" class="loading-container">
        <LoadingSpinner />
      </div>
      <div v-else-if="testCase" class="page-content">
        <CaseDetail
          :test-case="testCase"
          :execution-history="executionHistory"
          @close="handleClose"
          @edit="handleEdit"
          @delete="handleDelete"
          @refresh="handleRefresh"
          @execute="handleExecute"
        />
      </div>
      <div v-else class="error-container">
        <div class="error-icon">❌</div>
        <div class="error-title">用例不存在</div>
        <div class="error-message">找不到ID为 {{ caseId }} 的测试用例</div>
        <el-button @click="$router.go(-1)">返回</el-button>
      </div>
    </PageEnterTransition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CaseDetail from '../components/cases/CaseDetail.vue'
import PageEnterTransition from '../components/ui/PageEnterTransition.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import { getTestCaseById, deleteTestCase, executeTestCase, getTestCaseHistory } from '../api/testCase'
import { transformTestCase } from '../utils/dataTransform'

const route = useRoute()
const router = useRouter()

const caseId = ref(route.params.caseId)
const loading = ref(true)
const testCase = ref(null)
const executionHistory = ref([])

// 加载用例数据
const loadTestCase = async () => {
  try {
    loading.value = true
    const response = await getTestCaseById(caseId.value)

    if (response.code === 200 && response.data) {
      testCase.value = transformTestCase(response.data)

      // 加载执行历史
      try {
        const historyResponse = await getTestCaseHistory(caseId.value)
        if (historyResponse.code === 200 && historyResponse.data) {
          executionHistory.value = historyResponse.data
        }
      } catch (error) {
        console.warn('加载执行历史失败:', error)
      }
    } else {
      testCase.value = null
    }
  } catch (error) {
    console.error('加载用例失败:', error)
    ElMessage.error('加载用例失败')
    testCase.value = null
  } finally {
    loading.value = false
  }
}

// 处理关闭
const handleClose = () => {
  router.go(-1)
}

// 处理编辑
const handleEdit = () => {
  // 跳转到编辑页面（后续可实现）
  ElMessage.info('编辑功能即将实现')
}

// 处理删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个测试用例吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteTestCase(caseId.value)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      router.go(-1)
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 处理刷新
const handleRefresh = () => {
  loadTestCase()
}

// 处理执行
const handleExecute = async () => {
  try {
    const response = await executeTestCase(caseId.value)
    if (response.code === 200) {
      ElMessage.success('执行成功')
      handleRefresh() // 刷新数据
    } else {
      ElMessage.error(response.msg || '执行失败')
    }
  } catch (error) {
    ElMessage.error('执行失败')
  }
}

onMounted(() => {
  loadTestCase()
})
</script>

<style scoped>
.case-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-container {
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
}

.error-message {
  color: #999;
  margin-bottom: 24px;
}
</style>
