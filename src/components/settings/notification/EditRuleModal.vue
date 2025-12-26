<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleVisibleChange"
    :title="isEditing ? '编辑通知规则' : '新建通知规则'"
    width="900px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <h4>基本信息</h4>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入规则名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="触发类型" prop="triggerType">
              <el-select
                v-model="formData.triggerType"
                placeholder="请选择触发类型"
              >
                <el-option label="手动触发" value="manual" />
                <el-option label="自动触发" value="automatic" />
                <el-option label="定时触发" value="scheduled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="规则描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入规则描述"
          />
        </el-form-item>
      </div>

      <!-- 通知渠道 -->
      <div class="form-section">
        <h4>通知渠道</h4>
        <el-form-item label="选择渠道" prop="notificationChannels">
          <el-checkbox-group v-model="formData.notificationChannels">
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="system">系统通知</el-checkbox>
            <el-checkbox label="webhook">Webhook</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <!-- 接收人设置 -->
      <div class="form-section">
        <h4>接收人设置</h4>
        <el-form-item label="接收人类型" prop="recipientType">
          <el-radio-group v-model="formData.recipientType">
            <el-radio label="user">指定用户</el-radio>
            <el-radio label="role">角色用户</el-radio>
            <el-radio label="project">项目成员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.recipientType === 'user'"
          label="选择用户"
          prop="recipients"
        >
          <el-select
            v-model="formData.recipients"
            multiple
            filterable
            placeholder="请选择接收用户"
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="user.name"
              :value="user.email"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="formData.recipientType === 'role'"
          label="选择角色"
          prop="recipientRoles"
        >
          <el-select
            v-model="formData.recipientRoles"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="测试员" value="tester" />
            <el-option label="开发者" value="developer" />
            <el-option label="项目经理" value="pm" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="formData.recipientType === 'project'"
          label="选择项目"
          prop="recipientProjects"
        >
          <el-select
            v-model="formData.recipientProjects"
            multiple
            placeholder="请选择项目"
            style="width: 100%"
          >
            <el-option
              v-for="project in projectOptions"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 触发条件 -->
      <div class="form-section">
        <h4>触发条件</h4>
        <div class="conditions-builder">
          <div
            v-for="(condition, index) in formData.conditions"
            :key="index"
            class="condition-item"
          >
            <el-row :gutter="8">
              <el-col :span="6">
                <el-select
                  v-model="condition.field"
                  placeholder="字段"
                  size="small"
                >
                  <el-option label="用例状态" value="caseStatus" />
                  <el-option label="执行结果" value="executionResult" />
                  <el-option label="项目" value="project" />
                  <el-option label="执行人" value="executor" />
                  <el-option label="优先级" value="priority" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select
                  v-model="condition.operator"
                  placeholder="操作符"
                  size="small"
                >
                  <el-option label="等于" value="equals" />
                  <el-option label="不等于" value="notEquals" />
                  <el-option label="包含" value="contains" />
                  <el-option label="不包含" value="notContains" />
                  <el-option label="大于" value="greater" />
                  <el-option label="小于" value="less" />
                </el-select>
              </el-col>
              <el-col :span="8">
                <el-input
                  v-model="condition.value"
                  placeholder="值"
                  size="small"
                />
              </el-col>
              <el-col :span="4">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeCondition(index)"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>

          <el-button
            type="dashed"
            @click="addCondition"
            style="width: 100%; margin-top: 8px;"
          >
            <el-icon><Plus /></el-icon>
            添加条件
          </el-button>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="form-section">
        <h4>高级设置</h4>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-select v-model="formData.priority">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重试次数">
              <el-input-number
                v-model="formData.retryCount"
                :min="0"
                :max="5"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="启用状态">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  rule: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formRef = ref(null)
const isSubmitting = ref(false)

// 用户选项（模拟数据）
const userOptions = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
])

// 项目选项（模拟数据）
const projectOptions = ref([
  { id: 1, name: '电商平台项目' },
  { id: 2, name: '金融系统项目' },
  { id: 3, name: '企业管理系统' }
])

// 表单数据
const formData = reactive({
  name: '',
  triggerType: 'automatic',
  description: '',
  notificationChannels: ['system'],
  recipientType: 'user',
  recipients: [],
  recipientRoles: [],
  recipientProjects: [],
  conditions: [
    {
      field: 'caseStatus',
      operator: 'equals',
      value: ''
    }
  ],
  priority: 'medium',
  retryCount: 0,
  enabled: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '规则名称长度在2到50个字符', trigger: 'blur' }
  ],
  triggerType: [
    { required: true, message: '请选择触发类型', trigger: 'change' }
  ],
  notificationChannels: [
    { type: 'array', required: true, min: 1, message: '请至少选择一个通知渠道', trigger: 'change' }
  ],
  recipients: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个接收人', trigger: 'change' }
  ],
  recipientRoles: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }
  ],
  recipientProjects: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个项目', trigger: 'change' }
  ]
}

// 监听visible变化，初始化表单数据
watch(() => props.visible, (visible) => {
  if (visible) {
    initializeForm()
  }
})

// 监听rule变化，更新表单数据
watch(() => props.rule, (rule) => {
  if (rule && props.visible) {
    initializeForm()
  }
}, { deep: true })

// 初始化表单数据
const initializeForm = () => {
  if (props.rule) {
    // 编辑模式，使用传入的规则数据
    Object.assign(formData, {
      name: props.rule.name || '',
      triggerType: props.rule.triggerType || 'automatic',
      description: props.rule.description || '',
      notificationChannels: [...(props.rule.notificationChannels || ['system'])],
      recipientType: props.rule.recipientType || 'user',
      recipients: [...(props.rule.recipients || [])],
      recipientRoles: [...(props.rule.recipientRoles || [])],
      recipientProjects: [...(props.rule.recipientProjects || [])],
      conditions: [...(props.rule.conditions || [{ field: 'caseStatus', operator: 'equals', value: '' }])],
      priority: props.rule.priority || 'medium',
      retryCount: props.rule.retryCount || 0,
      enabled: props.rule.enabled !== false
    })
  } else {
    // 新建模式，重置表单
    Object.assign(formData, {
      name: '',
      triggerType: 'automatic',
      description: '',
      notificationChannels: ['system'],
      recipientType: 'user',
      recipients: [],
      recipientRoles: [],
      recipientProjects: [],
      conditions: [
        {
          field: 'caseStatus',
          operator: 'equals',
          value: ''
        }
      ],
      priority: 'medium',
      retryCount: 0,
      enabled: true
    })
  }
}

// 添加条件
const addCondition = () => {
  formData.conditions.push({
    field: 'caseStatus',
    operator: 'equals',
    value: ''
  })
}

// 删除条件
const removeCondition = (index) => {
  if (formData.conditions.length > 1) {
    formData.conditions.splice(index, 1)
  } else {
    ElMessage.warning('至少需要一个触发条件')
  }
}

// 处理对话框可见性变化
const handleVisibleChange = (value) => {
  if (!value) {
    handleCancel()
  }
}

// 取消操作
const handleCancel = () => {
  formRef.value?.resetFields()
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    isSubmitting.value = true

    // 根据接收人类型清理不需要的字段
    const submitData = { ...formData }
    if (formData.recipientType !== 'user') {
      delete submitData.recipients
    }
    if (formData.recipientType !== 'role') {
      delete submitData.recipientRoles
    }
    if (formData.recipientType !== 'project') {
      delete submitData.recipientProjects
    }

    emit('submit', submitData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.conditions-builder {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.condition-item {
  margin-bottom: 12px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.el-checkbox) {
  margin: 0;
}
</style>
