<template>
  <el-dialog
    v-model="visible"
    title="AI生成测试用例"
    width="650px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="generate-dialog">
      <div class="api-info" v-if="apiInfo">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="接口名称">{{ apiInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">
            <el-tag :type="getMethodTagType(apiInfo.method)" size="small">
              {{ apiInfo.method }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="接口路径" :span="2">{{ apiInfo.path }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form :model="formData" label-width="100px" class="config-form">
        <el-form-item label="生成数量">
          <el-slider v-model="formData.maxCases" :min="1" :max="10" show-input />
        </el-form-item>

        <el-form-item label="测试场景">
          <el-checkbox-group v-model="formData.testScenarios">
            <el-checkbox label="positive">正向测试</el-checkbox>
            <el-checkbox label="negative">负面测试</el-checkbox>
            <el-checkbox label="boundary">边界测试</el-checkbox>
            <el-checkbox label="security">安全测试</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="默认优先级">
          <el-select v-model="formData.priority" placeholder="选择优先级">
            <el-option label="P0 - 最高" value="P0" />
            <el-option label="P1 - 高" value="P1" />
            <el-option label="P2 - 中" value="P2" />
            <el-option label="P3 - 低" value="P3" />
          </el-select>
        </el-form-item>

        <el-form-item label="需求描述">
          <el-input
            v-model="formData.requirement"
            type="textarea"
            :rows="3"
            placeholder="可选：输入额外的需求描述，AI将根据描述生成更精准的测试用例..."
          />
        </el-form-item>
      </el-form>

      <div class="tips">
        <el-alert type="info" :closable="false">
          <template #title>
            <span class="tips-title">
              <el-icon><InfoFilled /></el-icon>
              生成说明
            </span>
          </template>
          <ul class="tips-list">
            <li>AI将根据接口信息自动分析并生成测试用例</li>
            <li>生成的用例可预览、编辑后再保存</li>
            <li>建议检查生成的断言规则是否符合业务需求</li>
          </ul>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          <el-icon><MagicStick /></el-icon>
          开始生成
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { MagicStick, InfoFilled } from '@element-plus/icons-vue'
import { generateTestCases, getGenerationResult } from '@/api/aiTestCase'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  apiInfo: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'generated'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const generating = ref(false)
const currentGenerationId = ref(null)
let pollingTimer = null

const formData = ref({
  maxCases: 5,
  testScenarios: ['positive', 'negative', 'boundary'],
  priority: 'P2',
  requirement: ''
})

const getMethodTagType = (method) => {
  const typeMap = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return typeMap[method] || 'info'
}

const handleGenerate = async () => {
  const apiId = props.apiInfo?.api_id || props.apiInfo?.apiId || props.apiInfo?.id
  if (!apiId) {
    ElMessage.warning('接口信息不存在')
    return
  }

  generating.value = true
  try {
    const requestData = {
      apiId: apiId,
      generationType: 'single',
      maxCases: formData.value.maxCases,
      testScenarios: formData.value.testScenarios,
      priority: formData.value.priority,
      requirement: formData.value.requirement,
      includeNegative: formData.value.testScenarios.includes('negative'),
      includeBoundary: formData.value.testScenarios.includes('boundary'),
      includeSecurity: formData.value.testScenarios.includes('security')
    }

    const response = await generateTestCases(requestData)
    
    if (response.code === 1) {
      currentGenerationId.value = response.data.generationId
      ElMessage.info('AI正在生成测试用例，请稍候...')
      startPolling(response.data.generationId)
    } else {
      ElMessage.error(response.msg || '生成失败')
      generating.value = false
    }
  } catch (error) {
    console.error('AI生成测试用例失败:', error)
    ElMessage.error(error.message || '生成失败，请稍后重试')
    generating.value = false
  }
}

const startPolling = (generationId) => {
  stopPolling()
  
  pollingTimer = setInterval(async () => {
    try {
      const response = await getGenerationResult(generationId)
      
      if (response.code === 1) {
        const result = response.data
        
        if (result.status === 'completed') {
          stopPolling()
          generating.value = false
          ElMessage.success(`成功生成 ${result.caseCount} 个测试用例`)
          emit('generated', result)
          visible.value = false
        } else if (result.status === 'failed') {
          stopPolling()
          generating.value = false
          ElMessage.error(result.errorMessage || '生成失败')
        }
      }
    } catch (error) {
      console.error('轮询生成结果失败:', error)
    }
  }, 2000)
}

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

const handleClose = () => {
  stopPolling()
  generating.value = false
  visible.value = false
}

watch(visible, (val) => {
  if (!val) {
    formData.value = {
      maxCases: 5,
      testScenarios: ['positive', 'negative', 'boundary'],
      priority: 'P2',
      requirement: ''
    }
    stopPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.generate-dialog {
  padding: 10px 0;
}

.api-info {
  margin-bottom: 20px;
}

.config-form {
  margin-top: 20px;
}

.tips {
  margin-top: 20px;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.tips-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: #606266;
}

.tips-list li {
  margin: 4px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
