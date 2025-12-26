<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleVisibleChange"
    :title="isEditing ? '编辑通知模板' : '新建通知模板'"
    width="800px"
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
            <el-form-item label="模板名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入模板名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择模板类型"
                @change="handleTypeChange"
              >
                <el-option label="邮件模板" value="email" />
                <el-option label="短信模板" value="sms" />
                <el-option label="系统模板" value="system" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入模板描述"
          />
        </el-form-item>
      </div>

      <!-- 邮件模板特有字段 -->
      <div v-if="formData.type === 'email'" class="form-section">
        <h4>邮件内容</h4>
        <el-form-item label="邮件主题" prop="subject">
          <el-input
            v-model="formData.subject"
            placeholder="请输入邮件主题"
          />
        </el-form-item>

        <el-form-item label="邮件内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="8"
            placeholder="请输入邮件内容，支持HTML格式"
          />
        </el-form-item>
      </div>

      <!-- 短信模板特有字段 -->
      <div v-if="formData.type === 'sms'" class="form-section">
        <h4>短信内容</h4>
        <el-form-item label="短信内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="4"
            :maxlength="200"
            show-word-limit
            placeholder="请输入短信内容，最多200字符"
          />
        </el-form-item>
      </div>

      <!-- 系统模板特有字段 -->
      <div v-if="formData.type === 'system'" class="form-section">
        <h4>系统通知内容</h4>
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入通知标题"
          />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知内容"
          />
        </el-form-item>
      </div>

      <!-- 模板变量说明 -->
      <div class="form-section">
        <h4>模板变量</h4>
        <div class="variables-info">
          <p>您可以在模板中使用以下变量：</p>
          <div class="variables-list">
            <div class="variable-item">
              <code>{{userName}}</code> - 用户姓名
            </div>
            <div class="variable-item">
              <code>{{projectName}}</code> - 项目名称
            </div>
            <div class="variable-item">
              <code>{{caseName}}</code> - 用例名称
            </div>
            <div class="variable-item">
              <code>{{status}}</code> - 状态信息
            </div>
            <div class="variable-item">
              <code>{{time}}</code> - 时间信息
            </div>
          </div>
        </div>
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

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  template: {
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

// 表单数据
const formData = reactive({
  name: '',
  type: 'email',
  description: '',
  subject: '',
  title: '',
  content: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '模板名称长度在2到50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请输入邮件主题', trigger: 'blur' },
    { max: 100, message: '主题不能超过100个字符', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { max: 100, message: '标题不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { max: 1000, message: '内容不能超过1000个字符', trigger: 'blur' }
  ]
}

// 监听visible变化，初始化表单数据
watch(() => props.visible, (visible) => {
  if (visible) {
    initializeForm()
  }
})

// 监听template变化，更新表单数据
watch(() => props.template, (template) => {
  if (template && props.visible) {
    initializeForm()
  }
}, { deep: true })

// 初始化表单数据
const initializeForm = () => {
  if (props.template) {
    // 编辑模式，使用传入的模板数据
    Object.assign(formData, {
      name: props.template.name || '',
      type: props.template.type || 'email',
      description: props.template.description || '',
      subject: props.template.subject || '',
      title: props.template.title || '',
      content: props.template.content || ''
    })
  } else {
    // 新建模式，重置表单
    Object.assign(formData, {
      name: '',
      type: 'email',
      description: '',
      subject: '',
      title: '',
      content: ''
    })
  }
}

// 类型变化处理
const handleTypeChange = (type) => {
  // 清空类型相关的字段
  if (type !== 'email') {
    formData.subject = ''
  }
  if (type !== 'system') {
    formData.title = ''
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

    // 根据类型清理不需要的字段
    const submitData = { ...formData }
    if (formData.type !== 'email') {
      delete submitData.subject
    }
    if (formData.type !== 'system') {
      delete submitData.title
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

.variables-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
}

.variables-info p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}

.variables-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.variable-item {
  font-size: 13px;
  color: #606266;
  padding: 6px 0;
}

.variable-item code {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #e11d48;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
