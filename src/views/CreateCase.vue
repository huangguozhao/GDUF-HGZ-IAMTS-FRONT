<template>
  <div class="create-case-page">
    <PageEnterTransition>
      <div class="page-container">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" @click="$router.push('/cases')">用例管理</span>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-item active">创建测试用例</span>
          </div>
          <h1 class="page-title">创建测试用例</h1>
        </div>

        <!-- 表单区域 -->
        <div class="form-container">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="case-form"
          >
            <!-- 基本信息 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">基本信息</h3>
              </div>

              <div class="form-grid">
                <el-form-item label="用例名称" prop="name" class="form-item-full">
                  <el-input
                    v-model="formData.name"
                    placeholder="请输入测试用例名称"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="用例编码" prop="case_code">
                  <el-input
                    v-model="formData.case_code"
                    placeholder="留空则自动生成"
                    maxlength="50"
                  />
                  <div class="form-tip">用例编码在项目内唯一，留空则自动生成</div>
                </el-form-item>

                <el-form-item label="优先级" prop="priority">
                  <el-select v-model="formData.priority" placeholder="请选择优先级">
                    <el-option label="P0 - 最高优先级" value="P0" />
                    <el-option label="P1 - 高优先级" value="P1" />
                    <el-option label="P2 - 中优先级" value="P2" />
                    <el-option label="P3 - 低优先级" value="P3" />
                    <el-option label="P4 - 最低优先级" value="P4" />
                  </el-select>
                </el-form-item>

                <el-form-item label="严重程度" prop="severity">
                  <el-select v-model="formData.severity" placeholder="请选择严重程度">
                    <el-option label="blocker" value="blocker" />
                    <el-option label="critical" value="critical" />
                    <el-option label="major" value="major" />
                    <el-option label="minor" value="minor" />
                    <el-option label="trivial" value="trivial" />
                  </el-select>
                </el-form-item>

                <el-form-item label="状态" prop="is_enabled">
                  <el-switch v-model="formData.is_enabled" />
                  <span class="switch-label">{{ formData.is_enabled ? '启用' : '禁用' }}</span>
                </el-form-item>

                <el-form-item label="标签" prop="tags" class="form-item-full">
                  <el-select
                    v-model="formData.tags"
                    multiple
                    filterable
                    allow-create
                    placeholder="请选择或输入标签"
                  >
                    <el-option label="冒烟测试" value="冒烟测试" />
                    <el-option label="回归测试" value="回归测试" />
                    <el-option label="接口测试" value="接口测试" />
                    <el-option label="性能测试" value="性能测试" />
                  </el-select>
                </el-form-item>

                <el-form-item label="用例描述" prop="description" class="form-item-full">
                  <el-input
                    v-model="formData.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入测试用例描述"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 测试步骤 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">测试步骤</h3>
                <el-button type="primary" size="small" @click="addTestStep">
                  <el-icon><Plus /></el-icon>
                  添加步骤
                </el-button>
              </div>

              <div v-if="formData.test_steps.length === 0" class="empty-steps">
                <div class="empty-icon">📝</div>
                <div class="empty-text">暂无测试步骤</div>
                <el-button type="primary" size="small" @click="addTestStep">添加第一个步骤</el-button>
              </div>

              <div v-else class="test-steps">
                <div
                  v-for="(step, index) in formData.test_steps"
                  :key="index"
                  class="test-step-item"
                >
                  <div class="step-header">
                    <span class="step-number">{{ index + 1 }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      text
                      @click="removeTestStep(index)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>

                  <div class="step-content">
                    <el-form-item
                      :label="`步骤 ${index + 1}`"
                      :prop="`test_steps.${index}.description`"
                      :rules="[{ required: true, message: '请输入步骤描述' }]"
                    >
                      <el-input
                        v-model="step.description"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入测试步骤描述"
                      />
                    </el-form-item>

                    <el-form-item
                      label="预期结果"
                      :prop="`test_steps.${index}.expected_result`"
                      :rules="[{ required: true, message: '请输入预期结果' }]"
                    >
                      <el-input
                        v-model="step.expected_result"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入预期结果"
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>

            <!-- 前置条件 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">前置条件</h3>
              </div>

              <el-form-item label="前置条件" prop="pre_conditions_str">
                <el-input
                  v-model="formData.pre_conditions_str"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入测试前置条件（如：用户已登录、数据库有测试数据等）"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="$router.go(-1)">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            创建用例
          </el-button>
        </div>
      </div>
    </PageEnterTransition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import PageEnterTransition from '../components/ui/PageEnterTransition.vue'
import { createTestCase } from '../api/testCase'
import { transformTestCaseToBackend } from '../utils/dataTransform'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

const formData = reactive({
  name: '',
  case_code: '',
  description: '',
  priority: 'P2',
  severity: 'medium',
  tags: [],
  is_enabled: true,
  test_steps: [],
  pre_conditions_str: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入用例名称', trigger: 'blur' },
    { min: 1, max: 100, message: '用例名称长度在1-100个字符', trigger: 'blur' }
  ],
  case_code: [
    { max: 50, message: '用例编码长度不能超过50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  severity: [
    { required: true, message: '请选择严重程度', trigger: 'change' }
  ]
}

// 添加测试步骤
const addTestStep = () => {
  formData.test_steps.push({
    description: '',
    expected_result: ''
  })
}

// 删除测试步骤
const removeTestStep = (index) => {
  formData.test_steps.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  try {
    submitting.value = true

    // 数据转换
    const submitData = transformTestCaseToBackend(formData)

    const response = await createTestCase(submitData)

    if (response.code === 200) {
      ElMessage.success('创建成功')
      router.push('/cases')
    } else {
      ElMessage.error(response.msg || '创建失败')
    }
  } catch (error) {
    console.error('创建用例失败:', error)
    ElMessage.error('创建失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-case-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: #409eff;
}

.breadcrumb-separator {
  margin: 0 8px;
}

.breadcrumb-item.active {
  color: #409eff;
  font-weight: 500;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-item-full {
  grid-column: 1 / -1;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.switch-label {
  margin-left: 8px;
  color: #606266;
}

.empty-steps {
  text-align: center;
  padding: 40px 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #909399;
  margin-bottom: 16px;
}

.test-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-step-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.step-number {
  font-weight: 600;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.step-content {
  display: grid;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
