<template>
  <el-dialog
    :model-value="visible"
    :title="isEditing ? '编辑角色' : '创建角色'"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="role-form-content">
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="formRules"
        label-width="100px"
        :disabled="isSubmitting"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h4>基本信息</h4>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="角色名称" prop="name">
                <el-input
                  v-model="roleForm.name"
                  placeholder="请输入角色名称"
                  :maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色编码" prop="code">
                <el-input
                  v-model="roleForm.code"
                  placeholder="请输入角色编码"
                  :maxlength="50"
                  show-word-limit
                  :disabled="isEditing"
                />
                <div class="form-tip">角色编码创建后不可修改</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="角色类型" prop="type">
            <el-radio-group v-model="roleForm.type">
              <el-radio label="admin">管理员</el-radio>
              <el-radio label="user">普通用户</el-radio>
              <el-radio label="guest">访客</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="角色描述" prop="description">
            <el-input
              v-model="roleForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入角色描述"
              :maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 角色配置 -->
        <div class="form-section">
          <h4>角色配置</h4>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="roleForm.status">
                  <el-radio label="active">启用</el-radio>
                  <el-radio label="inactive">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示顺序">
                <el-input-number
                  v-model="roleForm.sortOrder"
                  :min="0"
                  :max="999"
                  :precision="0"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="数据权限范围">
            <el-radio-group v-model="roleForm.dataScope">
              <el-radio label="all">全部数据</el-radio>
              <el-radio label="department">本部门数据</el-radio>
              <el-radio label="self">本人数据</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="roleForm.dataScope === 'custom'" label="自定义权限">
            <el-input
              v-model="roleForm.customDataScope"
              placeholder="请输入自定义数据权限规则"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </div>

        <!-- 高级设置 -->
        <div class="form-section">
          <h4>高级设置</h4>
          <el-form-item label="角色标签">
            <el-select
              v-model="roleForm.tags"
              multiple
              placeholder="选择角色标签"
              style="width: 100%"
            >
              <el-option label="系统角色" value="system" />
              <el-option label="业务角色" value="business" />
              <el-option label="临时角色" value="temporary" />
              <el-option label="项目角色" value="project" />
            </el-select>
          </el-form-item>

          <el-form-item label="过期时间">
            <el-date-picker
              v-model="roleForm.expireTime"
              type="datetime"
              placeholder="选择过期时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledExpireDate"
            />
          </el-form-item>

          <el-form-item label="附加配置">
            <div class="additional-config">
              <el-checkbox-group v-model="roleForm.configs">
                <el-checkbox label="allow_delegate">允许委托</el-checkbox>
                <el-checkbox label="require_mfa">需要多因素认证</el-checkbox>
                <el-checkbox label="session_control">启用会话控制</el-checkbox>
                <el-checkbox label="audit_log">启用审计日志</el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="isSubmitting">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
        >
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: null
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'submit'])

// 响应式数据
const roleFormRef = ref(null)

const roleForm = reactive({
  name: '',
  code: '',
  type: 'user',
  description: '',
  status: 'active',
  sortOrder: 0,
  dataScope: 'all',
  customDataScope: '',
  tags: [],
  expireTime: '',
  configs: []
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: '角色编码只能包含字母、数字、下划线和连字符，且必须以字母开头', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 方法
const resetForm = () => {
  Object.assign(roleForm, {
    name: '',
    code: '',
    type: 'user',
    description: '',
    status: 'active',
    sortOrder: 0,
    dataScope: 'all',
    customDataScope: '',
    tags: [],
    expireTime: '',
    configs: []
  })
}

const fillForm = (role) => {
  if (role) {
    Object.assign(roleForm, {
      name: role.name || '',
      code: role.code || '',
      type: role.type || 'user',
      description: role.description || '',
      status: role.status || 'active',
      sortOrder: role.sortOrder || 0,
      dataScope: role.dataScope || 'all',
      customDataScope: role.customDataScope || '',
      tags: role.tags || [],
      expireTime: role.expireTime || '',
      configs: role.configs || []
    })
  }
}

const handleClose = () => {
  if (isSubmitting.value) return
  emit('close')
}

const handleSubmit = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    emit('submit', { ...roleForm })
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  }
}

const disabledExpireDate = (time) => {
  return time.getTime() < Date.now()
}

// 监听visible变化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      if (props.isEditing && props.role) {
        fillForm(props.role)
      } else {
        resetForm()
      }
    })
  }
})

// 监听role变化
watch(() => props.role, (newRole) => {
  if (props.visible && props.isEditing && newRole) {
    fillForm(newRole)
  }
}, { deep: true })
</script>

<style scoped>
.role-form-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 20px 0;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e6eef8;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.form-tip {
  font-size: 12px;
  color: #9aa4b2;
  margin-top: 4px;
}

.additional-config {
  padding: 12px;
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Form样式覆盖 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #182026;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-radius: 6px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}

/* 响应式 */
@media (max-width: 768px) {
  .role-form-content {
    padding: 10px 0;
  }

  .form-section {
    padding: 12px;
  }

  :deep(.el-radio-group) {
    flex-direction: column;
    gap: 8px;
  }

  :deep(.el-checkbox-group) {
    grid-template-columns: 1fr;
  }
}
</style>
