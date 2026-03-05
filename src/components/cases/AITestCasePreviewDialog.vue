<template>
  <el-dialog
    v-model="visible"
    title="AI生成的测试用例"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="preview-dialog">
      <div class="toolbar">
        <div class="left">
          <el-checkbox 
            v-model="selectAll" 
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
          <span class="selected-count">
            已选择 {{ selectedCount }} 个用例
          </span>
        </div>
        <div class="right">
          <el-button size="small" @click="handleExpandAll">
            {{ allExpanded ? '全部收起' : '全部展开' }}
          </el-button>
        </div>
      </div>

      <div class="cases-list" v-if="cases.length > 0">
        <el-collapse v-model="activeNames">
          <el-collapse-item
            v-for="(testCase, index) in cases"
            :key="index"
            :name="index"
          >
            <template #title>
              <div class="case-title">
                <el-checkbox 
                  v-model="testCase.selected" 
                  @click.stop
                  class="case-checkbox"
                />
                <span class="case-name">{{ testCase.name }}</span>
                <el-tag :type="getPriorityType(testCase.priority)" size="small" class="case-tag">
                  {{ testCase.priority }}
                </el-tag>
                <el-tag type="info" size="small" class="case-tag">
                  {{ testCase.testType }}
                </el-tag>
                <el-tag :type="getSeverityType(testCase.severity)" size="small" class="case-tag">
                  {{ testCase.severity }}
                </el-tag>
              </div>
            </template>

            <div class="case-detail">
              <el-form :model="testCase" label-width="100px" size="small">
                <el-form-item label="用例名称">
                  <el-input v-model="testCase.name" />
                </el-form-item>

                <el-form-item label="用例描述">
                  <el-input v-model="testCase.description" type="textarea" :rows="2" />
                </el-form-item>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="测试类型">
                      <el-select v-model="testCase.testType">
                        <el-option label="功能测试" value="functional" />
                        <el-option label="性能测试" value="performance" />
                        <el-option label="安全测试" value="security" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="优先级">
                      <el-select v-model="testCase.priority">
                        <el-option label="P0 - 最高" value="P0" />
                        <el-option label="P1 - 高" value="P1" />
                        <el-option label="P2 - 中" value="P2" />
                        <el-option label="P3 - 低" value="P3" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="前置条件">
                  <el-input v-model="testCase.preConditions" type="textarea" :rows="2" />
                </el-form-item>

                <el-form-item label="预期状态码">
                  <el-input-number v-model="testCase.expectedHttpStatus" :min="100" :max="599" />
                </el-form-item>

                <el-form-item label="测试步骤" v-if="testCase.testSteps && testCase.testSteps.length > 0">
                  <el-table :data="testCase.testSteps" size="small" border>
                    <el-table-column prop="step" label="步骤" width="60" />
                    <el-table-column prop="action" label="操作" />
                    <el-table-column prop="expected" label="预期结果" />
                  </el-table>
                </el-form-item>

                <el-form-item label="断言规则" v-if="testCase.assertions && testCase.assertions.length > 0">
                  <el-table :data="testCase.assertions" size="small" border>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="{ row }">
                        {{ getAssertionTypeLabel(row.type) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="path" label="路径" />
                    <el-table-column prop="expected" label="预期值">
                      <template #default="{ row }">
                        {{ JSON.stringify(row.expected) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="说明" />
                  </el-table>
                </el-form-item>

                <el-form-item label="标签">
                  <el-tag
                    v-for="tag in testCase.tags"
                    :key="tag"
                    closable
                    @close="removeTag(testCase, tag)"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-input
                    v-model="newTags[index]"
                    size="small"
                    placeholder="输入标签后回车"
                    @keyup.enter="addTag(testCase, index)"
                    class="tag-input"
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <el-empty v-else description="暂无生成的测试用例" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" :disabled="selectedCount === 0">
          <el-icon><Check /></el-icon>
          保存选中的用例 ({{ selectedCount }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { confirmSaveTestCases } from '@/api/aiTestCase'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  generatedCases: { type: Array, default: () => [] },
  generationId: { type: Number, default: null },
  apiId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const cases = ref([])
const activeNames = ref([])
const selectAll = ref(true)
const saving = ref(false)
const newTags = ref({})

const selectedCount = computed(() => {
  return cases.value.filter(c => c.selected).length
})

const allExpanded = computed(() => {
  return activeNames.value.length === cases.value.length
})

const getPriorityType = (priority) => {
  const typeMap = {
    'P0': 'danger',
    'P1': 'warning',
    'P2': 'primary',
    'P3': 'info'
  }
  return typeMap[priority] || 'info'
}

const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'primary',
    'low': 'info'
  }
  return typeMap[severity] || 'info'
}

const getAssertionTypeLabel = (type) => {
  const labelMap = {
    'equals': '等于',
    'contains': '包含',
    'notNull': '非空',
    'regex': '正则',
    'jsonPath': 'JSON路径'
  }
  return labelMap[type] || type
}

const handleSelectAll = (val) => {
  cases.value.forEach(c => c.selected = val)
}

const handleExpandAll = () => {
  if (allExpanded.value) {
    activeNames.value = []
  } else {
    activeNames.value = cases.value.map((_, i) => i)
  }
}

const removeTag = (testCase, tag) => {
  const index = testCase.tags.indexOf(tag)
  if (index > -1) {
    testCase.tags.splice(index, 1)
  }
}

const addTag = (testCase, index) => {
  const tag = newTags.value[index]?.trim()
  if (tag && !testCase.tags.includes(tag)) {
    testCase.tags.push(tag)
  }
  newTags.value[index] = ''
}

const handleSave = async () => {
  const selectedCases = cases.value.filter(c => c.selected)
  
  if (selectedCases.length === 0) {
    ElMessage.warning('请至少选择一个用例')
    return
  }

  saving.value = true
  try {
    const response = await confirmSaveTestCases({
      generationId: props.generationId,
      apiId: props.apiId,
      cases: selectedCases
    })

    if (response.code === 1) {
      ElMessage.success(`成功保存 ${response.data.length} 个测试用例`)
      emit('saved', response.data)
      visible.value = false
    } else {
      ElMessage.error(response.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存测试用例失败:', error)
    ElMessage.error(error.message || '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  visible.value = false
}

watch(() => props.generatedCases, (newCases) => {
  if (newCases && newCases.length > 0) {
    cases.value = newCases.map(c => ({
      ...c,
      selected: true,
      tags: c.tags || []
    }))
    activeNames.value = newCases.map((_, i) => i)
  }
}, { immediate: true })

watch(visible, (val) => {
  if (!val) {
    cases.value = []
    activeNames.value = []
    selectAll.value = true
    newTags.value = {}
  }
})
</script>

<style scoped>
.preview-dialog {
  max-height: 60vh;
  overflow-y: auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.cases-list {
  margin-top: 10px;
}

.case-title {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.case-checkbox {
  margin-right: 8px;
}

.case-name {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.case-tag {
  margin-left: 4px;
}

.case-detail {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-top: 8px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.tag-input {
  width: 120px;
  vertical-align: middle;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
