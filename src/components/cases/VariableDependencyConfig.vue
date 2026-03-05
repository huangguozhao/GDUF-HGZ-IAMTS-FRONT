<template>
  <div class="variable-dependency-config">
    <div class="config-header">
      <span class="title">前置条件与变量依赖</span>
      <el-button type="primary" size="small" @click="addVariable">
        + 添加变量依赖
      </el-button>
    </div>

    <div class="description-section">
      <el-input
        v-model="localDescription"
        type="textarea"
        :rows="2"
        placeholder="描述执行此前置条件，例如：需要先登录获取token"
        @change="updatePreConditions"
      />
    </div>

    <div class="variables-section" v-if="localVariables.length > 0">
      <el-table :data="localVariables" border size="small">
        <el-table-column label="变量名" width="150">
          <template #default="{ row, $index }">
            <el-input v-model="row.name" size="small" placeholder="变量名" @change="updatePreConditions" />
          </template>
        </el-table-column>
        
        <el-table-column label="来源类型" width="120">
          <template #default="{ row }">
            <el-select v-model="row.sourceType" size="small" @change="updatePreConditions">
              <el-option label="接口" value="api" />
              <el-option label="用例" value="case" />
              <el-option label="环境" value="env" />
              <el-option label="手动输入" value="manual" />
            </el-select>
          </template>
        </el-table-column>
        
        <el-table-column label="来源" width="200">
          <template #default="{ row }">
            <el-select 
              v-if="row.sourceType === 'api' || row.sourceType === 'case'"
              v-model="row.sourceId" 
              size="small" 
              placeholder="选择来源"
              filterable
              @change="updatePreConditions"
            >
              <el-option 
                v-for="item in (row.sourceType === 'api' ? props.apiList : props.caseList)" 
                :key="item.id" 
                :label="item.name" 
                :value="item.id" 
              />
            </el-select>
            <el-input 
              v-else-if="row.sourceType === 'env'"
              v-model="row.source" 
              size="small" 
              placeholder="环境变量名"
              @change="updatePreConditions"
            />
            <el-input 
              v-else
              v-model="row.defaultValue" 
              size="small" 
              placeholder="默认值"
              @change="updatePreConditions"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="提取路径">
          <template #default="{ row }">
            <el-input 
              v-model="row.extractPath" 
              size="small" 
              placeholder="如：$.data.token"
              @change="updatePreConditions"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="必须" width="60">
          <template #default="{ row }">
            <el-checkbox v-model="row.required" @change="updatePreConditions" />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="60">
          <template #default="{ $index }">
            <el-button type="danger" size="small" link @click="removeVariable($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="empty-tip" v-else>
      <el-empty description="暂无变量依赖" :image-size="60" />
    </div>

    <div class="execution-order-section">
      <span class="label">执行顺序：</span>
      <el-input-number v-model="localExecutionOrder" :min="0" :max="999" size="small" @change="updatePreConditions" />
      <span class="tip">（数字越小越先执行）</span>
    </div>

    <div class="preview-section">
      <div class="preview-header" @click="showPreview = !showPreview">
        <el-icon><ArrowRight v-if="!showPreview" /><ArrowDown v-else /></el-icon>
        <span>JSON预览</span>
      </div>
      <div class="preview-content" v-if="showPreview">
        <pre>{{ preConditionsJson }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowRight, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  projectId: { type: Number, default: null },
  caseList: { type: Array, default: () => [] },
  apiList: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const localDescription = ref('')
const localVariables = ref([])
const localExecutionOrder = ref(0)
const showPreview = ref(false)

const preConditionsJson = computed(() => {
  return JSON.stringify({
    description: localDescription.value,
    requiredVariables: localVariables.value,
    executionOrder: localExecutionOrder.value
  }, null, 2)
})

const addVariable = () => {
  localVariables.value.push({
    name: '',
    sourceType: 'api',
    source: '',
    sourceId: null,
    extractPath: '',
    defaultValue: '',
    required: true,
    description: ''
  })
}

const removeVariable = (index) => {
  localVariables.value.splice(index, 1)
  updatePreConditions()
}

const updatePreConditions = () => {
  emit('update:modelValue', {
    description: localDescription.value,
    requiredVariables: localVariables.value,
    executionOrder: localExecutionOrder.value
  })
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localDescription.value = newVal.description || ''
    localVariables.value = newVal.requiredVariables || []
    localExecutionOrder.value = newVal.executionOrder || 0
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.variable-dependency-config {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.description-section {
  margin-bottom: 16px;
}

.variables-section {
  margin-bottom: 16px;
}

.empty-tip {
  margin-bottom: 16px;
}

.execution-order-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.label {
  font-size: 14px;
  color: #606266;
}

.tip {
  font-size: 12px;
  color: #909399;
}

.preview-section {
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
}

.preview-header:hover {
  color: #409eff;
}

.preview-content {
  margin-top: 8px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
}

.preview-content pre {
  margin: 0;
  font-size: 12px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
