<template>
  <div class="cases-page">
    <div class="cases-container">
      <!-- 左侧树形结构区 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h3 class="sidebar-title" v-if="!sidebarCollapsed">项目结构</h3>
          <button class="collapse-btn" @click="toggleSidebar" :title="sidebarCollapsed ? '展开' : '收起'">
            <span class="collapse-icon">{{ sidebarCollapsed ? '»' : '«' }}</span>
          </button>
        </div>

        <div v-if="!sidebarCollapsed" class="sidebar-content">
          <div class="sidebar-toolbar">
            <button class="toolbar-create-btn" @click="handleCreateProject">
              <span class="btn-plus">+</span>
              创建新项目
            </button>
            <button class="toolbar-icon-btn" @click="refreshTree" title="刷新">
              <span class="icon-refresh">⟳</span>
            </button>
          </div>

          <div class="sidebar-search">
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="搜索节点..."
            />
            <span class="search-icon">🔍</span>
          </div>

          <div class="tree-list">
            <TreeNode
              v-for="project in filteredProjects"
              :key="project.id"
              :node="project"
              level="project"
              :default-expanded="false"
              :is-selected="selectedNode?.id === project.id && selectedLevel === 'project'"
              @add-module="handleAddModule"
              @edit="handleEdit"
              @delete="handleDeleteProject"
              @node-click="handleSelectNode(project, 'project')"
            >
              <TreeNode
                v-for="module in project.modules"
                :key="module.id"
                :node="module"
                level="module"
                :default-expanded="false"
                :is-selected="selectedNode?.id === module.id && selectedLevel === 'module'"
                @add-api="handleAddApi"
                @edit="handleEdit"
                @delete="handleDeleteModule"
                @node-click="handleSelectNode(module, 'module')"
              >
                <TreeNode
                  v-for="api in module.apis"
                  :key="api.id"
                  :node="api"
                  level="api"
                  :default-expanded="false"
                  :is-selected="selectedNode?.id === api.id && selectedLevel === 'api'"
                  @edit="handleEdit"
                  @delete="handleDeleteApi"
                  @node-click="handleSelectNode(api, 'api')"
                >
                  <!-- 测试用例列表 -->
                  <div
                    v-for="testCase in api.cases"
                    :key="testCase.id"
                    class="case-item-tree"
                    :class="{ 'is-selected': selectedNode?.id === testCase.id && selectedLevel === 'case' }"
                    @click.stop="handleSelectNode(testCase, 'case')"
                  >
                    <div class="case-item-content">
                      <span class="case-item-label">{{ testCase.name }}</span>
                      <span class="status-dot" :class="'status-' + testCase.status"></span>
                    </div>
                    <div class="case-item-menu" @click.stop>
                      <el-dropdown trigger="click" @command="(cmd) => handleCaseCommand(cmd, testCase)">
                        <span class="menu-trigger">
                          <span class="menu-dots">⋯</span>
                        </span>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="execute">执行测试</el-dropdown-item>
                            <el-dropdown-item command="edit">编辑</el-dropdown-item>
                            <el-dropdown-item command="copy">复制</el-dropdown-item>
                            <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </TreeNode>
              </TreeNode>
            </TreeNode>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-area">
        <!-- 项目/模块层级 - 显示统计信息 -->
        <LevelStats
          v-if="selectedLevel === 'project' || selectedLevel === 'module'"
          :node="selectedNode"
          :level="selectedLevel"
          @edit="handleEdit"
          @delete="handleDelete"
          @add="handleAddChild"
          @edit-child="handleEditChild"
          @delete-child="handleDeleteChild"
          @select-child="handleSelectChild"
        />

        <!-- 接口层级 - 显示接口详情 -->
        <ApiDetail
          v-else-if="selectedLevel === 'api'"
          :api="selectedNode"
          :related-cases="selectedNode.cases || []"
          @select-case="handleSelectCase"
          @edit-case="handleEditCase"
          @delete-case="handleDeleteCase"
        />

        <!-- 用例层级 - 显示用例详情 -->
        <CaseDetail
          v-else-if="selectedLevel === 'case'"
          :test-case="selectedNode"
          :execution-history="executionHistory"
          @close="selectedNode = null"
          @edit="handleEditCase"
          @delete="handleDeleteCase"
        />

        <!-- 默认空状态 -->
        <div v-else class="empty-placeholder">
          <div class="empty-icon">📋</div>
          <div class="empty-text">请从左侧选择项目、模块、接口或用例</div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <template v-if="dialogType === 'project'">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入项目描述"
            />
          </el-form-item>
        </template>

        <template v-if="dialogType === 'module'">
          <el-form-item label="模块名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入模块名称" />
          </el-form-item>
          <el-form-item label="模块描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入模块描述"
            />
          </el-form-item>
        </template>

        <template v-if="dialogType === 'api'">
          <el-form-item label="接口名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入接口名称" />
          </el-form-item>
          <el-form-item label="接口URL" prop="url">
            <el-input v-model="formData.url" placeholder="请输入接口URL" />
          </el-form-item>
          <el-form-item label="请求方法" prop="method">
            <el-select v-model="formData.method" placeholder="请选择请求方法">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="PATCH" value="PATCH" />
            </el-select>
          </el-form-item>
          <el-form-item label="接口描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入接口描述"
            />
          </el-form-item>
        </template>

        <template v-if="dialogType === 'case'">
          <el-form-item label="用例名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入用例名称" />
          </el-form-item>
          <el-form-item label="请求参数" prop="request_params">
            <el-input
              v-model="formData.request_params"
              type="textarea"
              :rows="4"
              placeholder='请输入JSON格式的请求参数，例如：{"name": "测试"}'
            />
          </el-form-item>
          <el-form-item label="预期状态码" prop="expected_status_code">
            <el-input-number
              v-model="formData.expected_status_code"
              :min="100"
              :max="599"
            />
          </el-form-item>
          <el-form-item label="验证规则" prop="validation_rules">
            <el-input
              v-model="formData.validation_rules"
              placeholder='例如：code=0, msg="success"'
            />
          </el-form-item>
          <el-form-item label="用例描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入用例描述"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TreeNode from '../components/cases/TreeNode.vue'
import CaseDetail from '../components/cases/CaseDetail.vue'
import ApiDetail from '../components/cases/ApiDetail.vue'
import LevelStats from '../components/cases/LevelStats.vue'
import {
  getProjects,
  getModulesByProject,
  getApisByModule,
  createProject,
  updateProject,
  deleteProject,
  createModule,
  updateModule,
  deleteModule,
  createApi,
  updateApi,
  deleteApi
} from '../api/project'
import {
  getTestCasesByApi,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  executeTestCase,
  getTestCaseHistory
} from '../api/testCase'
import {
  transformProject,
  transformModule,
  transformApi,
  transformTestCase,
  transformProjectToBackend,
  transformModuleToBackend,
  transformApiToBackend,
  transformTestCaseToBackend
} from '../utils/dataTransform'

// 配置：是否使用真实API（设置为 true 则调用后端，false 则使用假数据）
// 后端准备好后，将此值改为 true
const USE_REAL_API = true

// 响应式数据
const loading = ref(false)
const sidebarCollapsed = ref(false)
const searchKeyword = ref('')
const selectedNode = ref(null)
const selectedLevel = ref(null) // 'project' | 'module' | 'api' | 'case'
const executionHistory = ref([])
const projects = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  name: '',
  description: '',
  url: '',
  method: 'GET',
  request_params: '',
  expected_status_code: 200,
  validation_rules: '',
  parentId: null
})

const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入URL', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  const typeMap = {
    project: '项目',
    module: '模块',
    api: '接口',
    case: '用例'
  }
  const type = typeMap[dialogType.value] || ''
  return `${isEdit.value ? '编辑' : '新建'}${type}`
})

const filteredProjects = computed(() => {
  if (!searchKeyword.value) return projects.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return projects.value.filter(project => {
    if (project.name.toLowerCase().includes(keyword)) return true
    
    return project.modules?.some(module => {
      if (module.name.toLowerCase().includes(keyword)) return true
      
      return module.apis?.some(api => {
        if (api.name.toLowerCase().includes(keyword)) return true
        
        return api.cases?.some(testCase => 
          testCase.name.toLowerCase().includes(keyword) ||
          testCase.id.toLowerCase().includes(keyword)
        )
      })
    })
  })
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 刷新树
const refreshTree = async () => {
  if (USE_REAL_API) {
    await loadProjectTree()
  } else {
    ElMessage.success('刷新成功')
  }
}

// 选择节点
const handleSelectNode = async (node, level) => {
  selectedNode.value = node
  selectedLevel.value = level
  
  // 如果是用例，加载执行历史
  if (level === 'case') {
    if (USE_REAL_API && node.case_id) {
      try {
        const response = await getTestCaseHistory(node.case_id, { pageSize: 5 })
        if (response.code === 1) {
          executionHistory.value = (response.data.items || []).map(item => ({
            action: item.executor_name || '系统自动',
            note: item.result_summary || (item.status === 'passed' ? '执行通过' : '执行失败'),
            executed_time: item.executed_at || item.created_at,
            status: item.status
          }))
        } else {
          executionHistory.value = []
        }
      } catch (error) {
        console.error('加载执行历史失败:', error)
        executionHistory.value = []
      }
    } else {
      // 使用假数据
      executionHistory.value = [
        {
          action: '系统自动',
          note: node.status === 'failed' ? '执行失败，权限不足' : '执行通过',
          executed_time: node.last_executed_time || '2024-03-10 14:40',
          status: node.status
        },
        {
          action: '手动测试',
          note: '执行通过',
          executed_time: '2024-03-05 09:15',
          status: 'passed'
        }
      ]
    }
  }
}

// 选择子节点
const handleSelectChild = (child) => {
  if (selectedLevel.value === 'project') {
    handleSelectNode(child, 'module')
  } else if (selectedLevel.value === 'module') {
    handleSelectNode(child, 'api')
  }
}

// 选择用例
const handleSelectCase = (testCase) => {
  handleSelectNode(testCase, 'case')
}

// 新建
const handleCreateProject = () => {
  dialogType.value = 'project'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleAddModule = (project) => {
  dialogType.value = 'module'
  isEdit.value = false
  resetForm()
  formData.parentId = project.project_id // 保存项目ID
  dialogVisible.value = true
}

const handleAddApi = (module) => {
  dialogType.value = 'api'
  isEdit.value = false
  resetForm()
  formData.parentId = module.module_id // 保存模块ID
  dialogVisible.value = true
}

const handleAddCase = (api) => {
  dialogType.value = 'case'
  isEdit.value = false
  resetForm()
  formData.parentId = api.api_id // 保存接口ID
  formData.url = api.url
  dialogVisible.value = true
}

const handleAddChild = (node) => {
  if (selectedLevel.value === 'project') {
    handleAddModule(node)
  } else if (selectedLevel.value === 'module') {
    handleAddApi(node)
  }
}

// 编辑
const handleEdit = (node) => {
  dialogType.value = selectedLevel.value
  isEdit.value = true
  
  // 保存原始ID
  Object.assign(formData, {
    ...node,
    project_id: node.project_id,
    module_id: node.module_id,
    api_id: node.api_id,
    case_id: node.case_id
  })
  
  dialogVisible.value = true
}

const handleEditChild = (child) => {
  // 实现编辑子项
  ElMessage.info('编辑子项')
}

// 删除
const handleDelete = async (node) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${node.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (USE_REAL_API) {
      // 根据层级调用不同的删除API
      if (selectedLevel.value === 'project') {
        await deleteProject(node.project_id)
      } else if (selectedLevel.value === 'module') {
        await deleteModule(node.module_id)
      } else if (selectedLevel.value === 'api') {
        await deleteApi(node.api_id)
      }
      await loadProjectTree()
    }
    
    ElMessage.success('删除成功')
    selectedNode.value = null
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.msg || '删除失败')
    }
  }
}

const handleDeleteProject = async (project) => {
  handleDelete(project)
}

const handleDeleteModule = async (module) => {
  handleDelete(module)
}

const handleDeleteApi = async (api) => {
  handleDelete(api)
}

const handleDeleteChild = async (child) => {
  handleDelete(child)
}

const handleEditCase = (testCase) => {
  dialogType.value = 'case'
  isEdit.value = true
  Object.assign(formData, {
    id: testCase.id,
    case_id: testCase.case_id,
    api_id: testCase.api_id,
    name: testCase.name,
    request_params: testCase.request_params || '',
    expected_status_code: testCase.expected_status_code || 200,
    validation_rules: testCase.validation_rules || '',
    description: testCase.description || '',
    priority: testCase.priority,
    severity: testCase.severity,
    tags: testCase.tags
  })
  dialogVisible.value = true
}

const handleDeleteCase = async (testCase) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用例 "${testCase.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (USE_REAL_API) {
      // 调用真实API删除
      await deleteTestCase(testCase.api_id, testCase.case_id)
      await loadProjectTree()
    } else {
      // 从假数据中删除用例
      projects.value.forEach(project => {
        project.modules?.forEach(module => {
          module.apis?.forEach(api => {
            const index = api.cases?.findIndex(c => c.id === testCase.id)
            if (index !== undefined && index > -1) {
              api.cases.splice(index, 1)
            }
          })
        })
      })
    }
    
    ElMessage.success('删除成功')
    selectedNode.value = null
    selectedLevel.value = null
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.msg || '删除失败')
    }
  }
}

// 处理用例菜单命令
const handleCaseCommand = (command, testCase) => {
  switch (command) {
    case 'execute':
      handleExecuteCase(testCase)
      break
    case 'edit':
      handleEditCase(testCase)
      break
    case 'copy':
      handleCopyCase(testCase)
      break
    case 'delete':
      handleDeleteCase(testCase)
      break
  }
}

// 执行用例
const handleExecuteCase = async (testCase) => {
  loading.value = true
  
  try {
    if (USE_REAL_API) {
      // 调用真实API执行测试
      const response = await executeTestCase(testCase.api_id, testCase.case_id)
      if (response.code === 1) {
        // 重新加载数据以获取最新状态
        await loadProjectTree()
        ElMessage.success('执行成功')
      } else {
        ElMessage.error(response.msg || '执行失败')
      }
    } else {
      // 模拟执行
      setTimeout(() => {
        testCase.status = Math.random() > 0.3 ? 'passed' : 'failed'
        testCase.last_executed_time = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-')
        loading.value = false
        ElMessage.success('执行成功')
      }, 1000)
    }
  } catch (error) {
    console.error('执行用例失败:', error)
    ElMessage.error(error.msg || '执行失败')
  } finally {
    if (USE_REAL_API) {
      loading.value = false
    }
  }
}

// 复制用例
const handleCopyCase = (testCase) => {
  ElMessage.success('复制成功')
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (USE_REAL_API) {
      // 使用真实API
      await handleSaveWithAPI()
    } else {
      // 使用假数据模式
      await handleSaveWithMock()
    }
    
    ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    if (error.response) {
      ElMessage.error(error.msg || '保存失败')
    }
  }
}

// 使用真实API保存
const handleSaveWithAPI = async () => {
  const data = transformToBackendFormat(formData)
  
  if (dialogType.value === 'project') {
    if (isEdit.value) {
      await updateProject(formData.project_id, data)
    } else {
      await createProject(data)
    }
    await loadProjectTree()
  } else if (dialogType.value === 'module') {
    if (isEdit.value) {
      await updateModule(formData.module_id, data)
    } else {
      await createModule(formData.parentId, data)
    }
    await loadProjectTree()
  } else if (dialogType.value === 'api') {
    if (isEdit.value) {
      await updateApi(formData.api_id, data)
    } else {
      await createApi(formData.parentId, data)
    }
    await loadProjectTree()
  } else if (dialogType.value === 'case') {
    const apiId = getCurrentApiId()
    if (!apiId) {
      ElMessage.error('找不到关联的接口')
      return
    }
    
    if (isEdit.value) {
      await updateTestCase(apiId, formData.case_id, data)
    } else {
      await createTestCase(apiId, data)
    }
    await loadProjectTree()
  }
}

// 使用假数据保存
const handleSaveWithMock = async () => {
  if (isEdit.value && dialogType.value === 'case') {
    projects.value.forEach(project => {
      project.modules?.forEach(module => {
        module.apis?.forEach(api => {
          const caseIndex = api.cases?.findIndex(c => c.id === formData.id)
          if (caseIndex !== undefined && caseIndex > -1) {
            Object.assign(api.cases[caseIndex], {
              name: formData.name,
              request_params: formData.request_params,
              expected_status_code: formData.expected_status_code,
              validation_rules: formData.validation_rules,
              description: formData.description
            })
            
            if (selectedNode.value?.id === formData.id) {
              selectedNode.value = { ...api.cases[caseIndex] }
            }
          }
        })
      })
    })
  }
}

// 转换为后端格式
const transformToBackendFormat = (data) => {
  if (dialogType.value === 'project') {
    return transformProjectToBackend(data)
  } else if (dialogType.value === 'module') {
    return transformModuleToBackend(data)
  } else if (dialogType.value === 'api') {
    return transformApiToBackend(data)
  } else if (dialogType.value === 'case') {
    return transformTestCaseToBackend(data)
  }
  return data
}

// 获取当前用例关联的接口ID
const getCurrentApiId = () => {
  if (formData.parentId) return formData.parentId
  
  // 从选中的节点获取
  if (selectedLevel.value === 'api') {
    return selectedNode.value?.api_id
  }
  
  // 从用例中查找
  let apiId = null
  projects.value.forEach(project => {
    project.modules?.forEach(module => {
      module.apis?.forEach(api => {
        if (api.cases?.some(c => c.case_id === formData.case_id)) {
          apiId = api.api_id
        }
      })
    })
  })
  
  return apiId
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    description: '',
    url: '',
    method: 'GET',
    request_params: '',
    expected_status_code: 200,
    validation_rules: '',
    parentId: null
  })
  formRef.value?.clearValidate()
}

// 初始化假数据
const initMockData = () => {
  projects.value = [
    {
      id: 'P001',
      name: '电商支付系统',
      description: '用户相关的API接口管理',
      modules: [
        {
          id: 'M001',
          name: '用户模块',
          description: '用户认证模块，包括登录、注册、权限验证',
          apis: [
            {
              id: 'A001',
              name: '用户登录接口',
              url: '/api/v1/auth/login',
              method: 'POST',
              description: '用户登录接口',
              cases: [
                {
                  id: 'TC-001',
                  name: '正常登录测试',
                  api_url: '/api/v1/auth/login',
                  request_params: '{"email": "test@example.com", "password": "123456"}',
                  expected_status_code: 200,
                  validation_rules: 'code=0, msg="success"',
                  last_executed_time: '2024-03-10 14:30',
                  status: 'passed',
                  created_time: '2024-02-15 10:30',
                  description: '测试正常用户登录流程'
                },
                {
                  id: 'TC-002',
                  name: '密码错误测试',
                  api_url: '/api/v1/auth/login',
                  request_params: '{"email": "test@example.com", "password": "wrong"}',
                  expected_status_code: 401,
                  validation_rules: 'code=-1, msg="密码错误"',
                  last_executed_time: '2024-03-10 14:35',
                  status: 'passed',
                  created_time: '2024-02-15 10:35',
                  description: '测试密码错误情况'
                }
              ]
            },
            {
              id: 'A002',
              name: '获取用户信息接口',
              url: '/api/v1/users/{id}',
              method: 'GET',
              description: '根据ID获取用户详细信息',
              cases: [
                {
                  id: 'TC-003',
                  name: '获取存在的用户',
                  api_url: '/api/v1/users/1',
                  request_params: null,
                  expected_status_code: 200,
                  validation_rules: 'code=0, data.user_id=1',
                  last_executed_time: '2024-03-09 16:20',
                  status: 'passed',
                  created_time: '2024-02-17 14:00',
                  description: '测试获取已存在用户的信息'
                }
              ]
            },
            {
              id: 'A003',
              name: '更新用户信息接口',
              url: '/api/v1/users/{id}/update',
              method: 'PUT',
              description: '更新用户信息',
              cases: [
                {
                  id: 'TC-004',
                  name: '正常更新测试',
                  api_url: '/api/v1/users/1/update',
                  request_params: '{"name": "更新后的名字", "email": "updated@example.com"}',
                  expected_status_code: 200,
                  validation_rules: 'code=0, msg="success"',
                  last_executed_time: '2024-03-10 14:40',
                  status: 'failed',
                  created_time: '2024-02-17 09:00',
                  description: '测试更新用户信息',
                  actual_status_code: 403,
                  actual_result: 'code=1003, msg="权限不足"'
                }
              ]
            }
          ]
        },
        {
          id: 'M002',
          name: '订单模块',
          description: '订单管理相关功能',
          apis: [
            {
              id: 'A004',
              name: '创建订单接口',
              url: '/api/v1/orders/create',
              method: 'POST',
              description: '创建新订单',
              cases: [
                {
                  id: 'TC-005',
                  name: '创建订单测试',
                  api_url: '/api/v1/orders/create',
                  request_params: '{"product_id": 123, "quantity": 2}',
                  expected_status_code: 200,
                  validation_rules: 'code=0, data.order_id>0',
                  last_executed_time: '2024-03-08 11:15',
                  status: 'passed',
                  created_time: '2024-02-19 16:30',
                  description: '测试创建新订单'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'P002',
      name: '物流管理平台',
      description: '物流相关的API接口',
      modules: [
        {
          id: 'M003',
          name: '订单模块',
          description: '物流订单管理',
          apis: [
            {
              id: 'A005',
              name: '查询物流信息',
              url: '/api/v1/logistics/track',
              method: 'GET',
              description: '根据订单号查询物流信息',
              cases: [
                {
                  id: 'TC-006',
                  name: '查询物流测试',
                  api_url: '/api/v1/logistics/track',
                  request_params: '{"order_id": "123456"}',
                  expected_status_code: 200,
                  validation_rules: 'code=0',
                  last_executed_time: null,
                  status: 'not_executed',
                  created_time: '2024-02-21 15:00',
                  description: '测试物流信息查询'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// 加载项目树（从后端）
const loadProjectTree = async () => {
  loading.value = true
  try {
    // 1. 获取所有项目
    const projectsRes = await getProjects({ pageSize: 100 })
    if (projectsRes.code !== 1) {
      ElMessage.error(projectsRes.msg || '加载项目失败')
      return
    }
    
    const projectList = projectsRes.data.items || []
    
    // 2. 为每个项目加载模块
    const projectsWithModules = await Promise.all(
      projectList.map(async (project) => {
        try {
          const modulesRes = await getModulesByProject(project.project_id)
          if (modulesRes.code === 1) {
            const modules = modulesRes.data || []
            
            // 3. 为每个模块加载接口
            const modulesWithApis = await Promise.all(
              modules.map(async (module) => {
                try {
                  const apisRes = await getApisByModule(module.module_id)
                  if (apisRes.code === 1) {
                    const apis = apisRes.data || []
                    
                    // 4. 为每个接口加载测试用例
                    const apisWithCases = await Promise.all(
                      apis.map(async (api) => {
                        try {
                          const casesRes = await getTestCasesByApi(api.api_id, { pageSize: 100 })
                          if (casesRes.code === 1) {
                            return {
                              ...transformApi(api),
                              api_id: api.api_id,
                              cases: (casesRes.data.items || []).map(transformTestCase)
                            }
                          }
                          return { ...transformApi(api), api_id: api.api_id, cases: [] }
                        } catch (error) {
                          console.error('加载测试用例失败:', error)
                          return { ...transformApi(api), api_id: api.api_id, cases: [] }
                        }
                      })
                    )
                    
                    return {
                      ...transformModule(module),
                      module_id: module.module_id,
                      apis: apisWithCases
                    }
                  }
                  return { ...transformModule(module), module_id: module.module_id, apis: [] }
                } catch (error) {
                  console.error('加载接口失败:', error)
                  return { ...transformModule(module), module_id: module.module_id, apis: [] }
                }
              })
            )
            
            return {
              ...transformProject(project),
              project_id: project.project_id,
              modules: modulesWithApis
            }
          }
          return { ...transformProject(project), project_id: project.project_id, modules: [] }
        } catch (error) {
          console.error('加载模块失败:', error)
          return { ...transformProject(project), project_id: project.project_id, modules: [] }
        }
      })
    )
    
    projects.value = projectsWithModules
    ElMessage.success('数据加载成功')
  } catch (error) {
    console.error('加载项目树失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (USE_REAL_API) {
    loadProjectTree()
  } else {
    initMockData()
  }
})
</script>

<style scoped>
.cases-page {
  height: 100%;
  background: #f5f7fa;
  overflow: hidden;
}

.cases-container {
  display: flex;
  height: 100%;
}

/* 侧边栏 */
.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.sidebar.collapsed {
  width: 50px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.collapse-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-icon {
  font-size: 18px;
}

.collapse-btn:hover {
  color: #409eff;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-toolbar {
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.toolbar-create-btn {
  flex: 1;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.toolbar-create-btn:hover {
  background: #66b1ff;
}

.btn-plus {
  font-size: 16px;
  font-weight: 600;
}

.toolbar-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-icon-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}

.icon-refresh {
  font-size: 18px;
}

.sidebar-search {
  padding: 12px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #409eff;
}

.search-input::placeholder {
  color: #c0c4cc;
}

.search-icon {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #909399;
  pointer-events: none;
}

.tree-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* 测试用例项 */
.case-item-tree {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px 6px 32px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 4px;
  margin: 2px 0;
}

.case-item-tree:hover {
  background: #f5f7fa;
}

.case-item-tree.is-selected {
  background: #e6f4ff;
}

.case-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.case-item-label {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-item-tree.is-selected .case-item-label {
  color: #409eff;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.status-passed {
  background: #67c23a;
}

.status-dot.status-failed {
  background: #f56c6c;
}

.status-dot.status-not_executed {
  background: #909399;
}

.case-item-menu {
  flex-shrink: 0;
}

.case-item-menu .menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.case-item-menu .menu-trigger:hover {
  background: #e6e8eb;
}

.case-item-menu .menu-dots {
  font-size: 16px;
  color: #606266;
  font-weight: bold;
  line-height: 1;
}

/* 滚动条样式 */
.tree-list::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.tree-list::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.tree-list::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.tree-list::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

/* 主内容区 */
.main-area {
  flex: 1;
  overflow: hidden;
  background: white;
}

/* 空状态 */
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
}

/* 对话框 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 滚动条 */
.sidebar-content::-webkit-scrollbar,
.tree-list::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-thumb,
.tree-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover,
.tree-list::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>
