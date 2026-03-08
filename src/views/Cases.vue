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
            <!-- 加载状态 -->
            <ProjectListSkeleton v-if="loading" />
            <!-- 实际内容 -->
            <template v-else>
            <TreeNode
              v-for="project in filteredProjects"
              :key="project.id"
              :node="project"
              level="project"
              :is-expanded="!!project._expanded"
              :is-selected="selectedNode?.id === project.id && selectedLevel === 'project'"
              @add-module="handleAddModule"
              @edit="handleEdit"
              @delete="handleDeleteProject"
              @node-click="handleSelectNode(project, 'project')"
              @update:is-expanded="(val) => { project._expanded = val }"
            >
              <TreeNode
                v-for="module in project.modules"
                :key="module.id"
                :node="module"
                level="module"
                :is-expanded="!!module._expanded"
                :is-selected="selectedNode?.id === module.id && selectedLevel === 'module'"
                @add-api="handleAddApi"
                @edit="handleEdit"
                @delete="handleDeleteModule"
                @node-click="handleSelectNode(module, 'module')"
                @update:is-expanded="(val) => { module._expanded = val }"
              >
                <!-- 子模块 -->
                <TreeNode
                  v-for="subModule in module.children"
                  :key="subModule.id"
                  :node="subModule"
                  level="module"
                  :is-expanded="!!subModule._expanded"
                  :is-selected="selectedNode?.id === subModule.id && selectedLevel === 'module'"
                  @add-api="handleAddApi"
                  @edit="handleEdit"
                  @delete="handleDeleteModule"
                  @node-click="handleSelectNode(subModule, 'module')"
                  @update:is-expanded="(val) => { subModule._expanded = val }"
                >
                  <!-- 子模块的接口 -->
                  <TreeNode
                    v-for="api in subModule.apis"
                    :key="api.id"
                    :node="api"
                    level="api"
                    :is-expanded="!!api._expanded"
                    :is-selected="selectedNode?.id === api.id && selectedLevel === 'api'"
                    @edit="handleEdit"
                    @delete="handleDeleteApi"
                    @node-click="handleSelectNode(api, 'api')"
                    @update:is-expanded="(val) => { api._expanded = val }"
                  >
                    <!-- 测试用例列表 -->
                  <div
                      v-for="testCase in api.cases"
                      :key="testCase.id"
                      class="case-item-tree"
                      role="treeitem"
                      :tabindex="0"
                      :aria-selected="selectedNode?.id === testCase.id && selectedLevel === 'case'"
                      :class="{ 'is-selected': selectedNode?.id === testCase.id && selectedLevel === 'case' }"
                      @click.stop="handleSelectNode(testCase, 'case')"
                      @keydown.enter.stop.prevent="handleSelectNode(testCase, 'case')"
                      @keydown.space.stop.prevent="handleSelectNode(testCase, 'case')"
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

                <!-- 一级模块的接口 -->
                <TreeNode
                  v-for="api in module.apis"
                  :key="api.id"
                  :node="api"
                  level="api"
                  :is-expanded="!!api._expanded"
                  :is-selected="selectedNode?.id === api.id && selectedLevel === 'api'"
                  @edit="handleEdit"
                  @delete="handleDeleteApi"
                  @node-click="handleSelectNode(api, 'api')"
                  @update:is-expanded="(val) => { api._expanded = val }"
                >
                  <!-- 测试用例列表 -->
                <div
                    v-for="testCase in api.cases"
                    :key="testCase.id"
                    class="case-item-tree"
                    role="treeitem"
                    :tabindex="0"
                    :aria-selected="selectedNode?.id === testCase.id && selectedLevel === 'case'"
                    :class="{ 'is-selected': selectedNode?.id === testCase.id && selectedLevel === 'case' }"
                    @click.stop="handleSelectNode(testCase, 'case')"
                    @keydown.enter.stop.prevent="handleSelectNode(testCase, 'case')"
                    @keydown.space.stop.prevent="handleSelectNode(testCase, 'case')"
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
            </template>
          </div>
        </div>
          </div>

      <!-- 右侧内容区 -->
      <div class="main-area">
        <!-- 内容过渡动画 -->
        <transition-group
          name="content-transition"
          mode="out-in"
          class="content-transition-container"
          :key="contentTransitionKey"
        >
          <!-- 项目/模块层级 - 显示统计信息 -->
          <div class="content-item content-project" v-if="(selectedLevel === 'project' || selectedLevel === 'module') && selectedNode">
            <LevelStats
              :node="selectedNode"
              :level="selectedLevel"
              @edit="handleEdit"
              @delete="handleDelete"
              @add="handleAddChild"
              @edit-child="handleEditChild"
              @delete-child="handleDeleteChild"
              @select-child="handleSelectChild"
              @config-environment="handleConfigEnvironment"
            />
          </div>

          <!-- 接口层级 - 显示接口详情 -->
          <div class="content-item content-api" v-else-if="selectedLevel === 'api' && selectedNode">
            <ApiDetail
              :api="selectedNode"
              :related-cases="selectedNode.cases || []"
              @select-case="handleSelectCase"
              @edit-case="handleEditCase"
              @refresh="handleRefreshApi"
              @delete-api="handleDeleteApi"
              @delete-case="handleDeleteCase"
              @refresh-cases="handleRefreshCases"
            />
          </div>

          <!-- 用例层级 - 显示用例详情 -->
          <div class="content-item content-case" v-else-if="selectedLevel === 'case' && selectedNode">
            <CaseDetail
              :test-case="selectedNode"
              :execution-history="executionHistory"
              @close="selectedNode = null"
              @edit="handleEditCase"
              @delete="handleDeleteCase"
              @refresh="handleRefreshTestCase"
              @execute="handleExecuteCase"
            />
          </div>

          <!-- 默认空状态 -->
          <div v-else class="empty-placeholder content-item content-empty">
            <div class="empty-icon">📋</div>
            <div class="empty-text">请从左侧选择项目、模块、接口或用例</div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 环境配置对话框 -->
    <el-dialog
      v-model="envDialogVisible"
      title=""
      width="1000px"
      :close-on-click-modal="false"
      custom-class="env-config-dialog"
    >
      <div class="env-config-layout">
        <!-- 左侧环境列表 -->
        <div class="env-sidebar">
          <div class="env-sidebar-header">
            <input 
              v-model="envSearchText" 
              type="text" 
              class="env-search-input" 
              placeholder="搜索环境..."
            />
          </div>

          <div class="env-sidebar-list">
            <!-- 环境列表 -->
            <div 
              v-for="(env, index) in envFormData.environments" 
              :key="index"
              class="env-sidebar-item"
              :class="{ 
                'is-active': currentEnvIndex === index,
                'is-default': env.is_default
              }"
            >
              <div class="env-item-content" @click="currentEnvIndex = index">
                <div class="env-item-name">{{ env.name || '未命名环境' }}</div>
                <div class="env-item-badges">
                  <div class="env-item-badge" v-if="env.is_default">
                    <span class="badge-text">默认</span>
                  </div>
                  <div class="env-item-badge active" v-if="env.status === 'active'">
                    <span class="badge-text">运行中</span>
                  </div>
                </div>
              </div>
              <div class="env-item-actions">
                <el-button 
                  size="small" 
                  text 
                  type="danger"
                  @click.stop="handleRemoveEnvironment(index)"
                  :disabled="env.is_default || envFormData.environments.length <= 1 || !env.env_id"
                  :title="env.is_default ? '默认环境不能删除' : 
                          envFormData.environments.length <= 1 ? '至少保留一个环境' : 
                          !env.env_id ? '未保存的环境不能删除' : '删除环境'"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="envFormData.environments.length === 0" class="env-empty-state">
              <div class="empty-icon">🌍</div>
              <div class="empty-text">暂无环境配置</div>
              <div class="empty-tip">点击下方按钮创建新环境</div>
            </div>
          </div>

          <div class="env-sidebar-footer">
            <button class="env-add-btn" @click="handleAddEnvironment">
              + 新建环境
            </button>
          </div>
        </div>

        <!-- 右侧环境详情 -->
        <div class="env-content" v-if="currentEnvironment">
          <div class="env-content-header">
            <h3 class="env-content-title">{{ currentEnvironment.name || '未命名环境' }}</h3>
            <el-button 
              size="small"
              @click="handleEditEnvironmentName"
            >
              编辑
            </el-button>
          </div>

          <div class="env-content-body">
            <!-- 标签页 -->
            <div class="env-tabs">
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'basic' }"
                @click="envActiveTab = 'basic'"
              >
                基础配置
              </div>
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'variables' }"
                @click="envActiveTab = 'variables'"
              >
                数据配置项
              </div>
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'external' }"
                @click="envActiveTab = 'external'"
              >
                外部服务
              </div>
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'settings' }"
                @click="envActiveTab = 'settings'"
              >
                环境变量
              </div>
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'auth' }"
                @click="envActiveTab = 'auth'"
              >
                认证配置
              </div>
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'switch' }"
                @click="envActiveTab = 'switch'"
              >
                功能开关
              </div>
              <div 
                class="env-tab-item" 
                :class="{ active: envActiveTab === 'monitoring' }"
                @click="envActiveTab = 'monitoring'"
              >
                部署信息
              </div>
            </div>

            <!-- 标签页内容 -->
            <div class="env-tab-content">
              <!-- 1. 基础配置 -->
              <div v-if="envActiveTab === 'basic'" class="env-form-section">
                <div class="form-group">
                  <label class="form-label">环境编码 <span class="required">*</span></label>
                  <el-input 
                    v-model="currentEnvironment.env_code" 
                    placeholder="ENV_DEV_001"
                    :disabled="currentEnvironment.env_id || currentEnvironment.envId"
                  />
                  <div class="form-tip">环境编码用于唯一标识环境，创建后不可修改</div>
                </div>

                <div class="form-group">
                  <label class="form-label">环境名称 <span class="required">*</span></label>
                  <el-input 
                    v-model="currentEnvironment.name" 
                    placeholder="开发环境"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">环境类型</label>
                  <el-select v-model="currentEnvironment.env_type" placeholder="请选择环境类型">
                    <el-option label="开发环境" value="development" />
                    <el-option label="测试环境" value="testing" />
                    <el-option label="预生产环境" value="staging" />
                    <el-option label="生产环境" value="production" />
                  </el-select>
                </div>

                <div class="form-group">
                  <label class="form-label">基础URL <span class="required">*</span></label>
                  <el-input 
                    v-model="currentEnvironment.base_url" 
                    placeholder="https://dev.example.com"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">端口号</label>
                  <el-input 
                    v-model="currentEnvironment.port" 
                    placeholder="8080"
                    type="number"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">域名</label>
                  <el-input 
                    v-model="currentEnvironment.domain" 
                    placeholder="dev.example.com"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">协议</label>
                  <el-select v-model="currentEnvironment.protocol" placeholder="请选择协议">
                    <el-option label="https" value="https" />
                    <el-option label="http" value="http" />
                  </el-select>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">环境描述</label>
                  <el-input 
                    v-model="currentEnvironment.description" 
                    type="textarea"
                    :rows="3"
                    placeholder="开发环境主要用于开发人员本地开发和单元测试"
                  />
                </div>

                <!-- 状态指示器 -->
                <div class="env-status-row">
                  <div class="status-item">
                    <el-icon color="#67c23a" :size="16">
                      <CircleCheckFilled />
                    </el-icon>
                    <span class="status-label">部署状态</span>
                    <span class="status-value">运行中</span>
                  </div>
                  <div class="status-item">
                    <el-icon color="#e6a23c" :size="16">
                      <WarningFilled />
                    </el-icon>
                    <span class="status-label">健康状态</span>
                    <span class="status-value">良好</span>
                  </div>
                  <div class="status-item">
                    <el-icon color="#1890ff" :size="16">
                      <InfoFilled />
                    </el-icon>
                    <span class="status-label">最后更新</span>
                    <span class="status-value">2024-02-20 15:30</span>
                  </div>
                  <div class="status-item">
                    <el-icon color="#c0c4cc" :size="16">
                      <CircleCloseFilled />
                    </el-icon>
                    <span class="status-label">排斥时间</span>
                    <span class="status-value">未设置</span>
                  </div>
                </div>
              </div>

              <!-- 2. 数据配置项 -->
              <div v-else-if="envActiveTab === 'variables'" class="env-config-table-section">
                <div class="table-toolbar">
                  <span class="toolbar-title">数据配置项</span>
                  <el-button size="small" type="primary" @click="handleAddDataConfig">
                    + 添加配置项
                  </el-button>
                </div>
                <el-table :data="Array.isArray(currentEnvironment.dataConfigs) ? currentEnvironment.dataConfigs : []" border class="config-table">
                  <el-table-column label="配置项名称" width="200">
                    <template #default="{ row }">
                      <el-input v-model="row.name" placeholder="配置项名称" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="配置值" width="250">
                    <template #default="{ row }">
                      <el-input v-model="row.value" placeholder="配置值" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="描述" min-width="200">
                    <template #default="{ row }">
                      <el-input v-model="row.description" placeholder="描述" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ $index }">
                      <el-button 
                        size="small" 
                        text 
                        type="danger"
                        @click="handleRemoveDataConfig($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                  <template #empty>
                    <el-empty description="暂无数据配置项，点击上方'+ 添加配置项'按钮添加" :image-size="80" />
                  </template>
                </el-table>
              </div>

              <!-- 3. 外部服务 -->
              <div v-else-if="envActiveTab === 'external'" class="env-config-table-section">
                <div class="table-toolbar">
                  <span class="toolbar-title">外部服务配置</span>
                  <el-button size="small" type="primary" @click="handleAddExternalService">
                    + 添加服务
                  </el-button>
                </div>
                <el-table :data="Array.isArray(currentEnvironment.externalServices) ? currentEnvironment.externalServices : []" border class="config-table">
                  <el-table-column label="服务名称" width="150">
                    <template #default="{ row }">
                      <el-input v-model="row.name" placeholder="服务名称" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="服务类型" width="120">
                    <template #default="{ row }">
                      <el-select v-model="row.type" placeholder="类型" size="small">
                        <el-option label="数据库" value="database" />
                        <el-option label="缓存" value="cache" />
                        <el-option label="消息队列" value="mq" />
                        <el-option label="其他" value="other" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="连接地址" width="250">
                    <template #default="{ row }">
                      <el-input v-model="row.url" placeholder="连接地址" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag :type="row.status === 'connected' ? 'success' : 'info'" size="small">
                        {{ row.status === 'connected' ? '已连接' : '未连接' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ $index }">
                      <el-button 
                        size="small" 
                        text 
                        type="danger"
                        @click="handleRemoveExternalService($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                  <template #empty>
                    <el-empty description="暂无外部服务配置，点击上方'+ 添加服务'按钮添加" :image-size="80" />
                  </template>
                </el-table>
              </div>

              <!-- 4. 环境变量 -->
              <div v-else-if="envActiveTab === 'settings'" class="env-config-table-section">
                <div class="table-toolbar">
                  <span class="toolbar-title">环境变量</span>
                  <el-button size="small" type="primary" @click="handleAddEnvVariable">
                    + 添加变量
                  </el-button>
                </div>
                <el-table :data="Array.isArray(currentEnvironment.envVariables) ? currentEnvironment.envVariables : []" border class="config-table">
                  <el-table-column label="变量名" width="200">
                    <template #default="{ row }">
                      <el-input v-model="row.key" placeholder="变量名" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="变量值" width="250">
                    <template #default="{ row }">
                      <el-input v-model="row.value" placeholder="变量值" size="small" show-password />
                    </template>
                  </el-table-column>
                  <el-table-column label="描述" min-width="200">
                    <template #default="{ row }">
                      <el-input v-model="row.description" placeholder="描述" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ $index }">
                      <el-button 
                        size="small" 
                        text 
                        type="danger"
                        @click="handleRemoveEnvVariable($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                  <template #empty>
                    <el-empty description="暂无环境变量，点击上方'+ 添加变量'按钮添加" :image-size="80" />
                  </template>
                </el-table>
              </div>

              <!-- 5. 认证配置 -->
              <div v-else-if="envActiveTab === 'auth'" class="env-form-section">
                <div class="form-group">
                  <label class="form-label">认证类型</label>
                  <el-select v-model="currentEnvironment.authType" placeholder="请选择认证类型">
                    <el-option label="无认证" value="none" />
                    <el-option label="Bearer Token" value="bearer" />
                    <el-option label="Basic Auth" value="basic" />
                    <el-option label="API Key" value="apikey" />
                    <el-option label="OAuth 2.0" value="oauth2" />
                  </el-select>
                </div>

                <div class="form-group" v-if="currentEnvironment.authType === 'bearer'">
                  <label class="form-label">Token</label>
                  <el-input 
                    v-model="currentEnvironment.authToken" 
                    type="password"
                    placeholder="请输入Token"
                    show-password
                  />
                </div>

                <div class="form-group" v-if="currentEnvironment.authType === 'basic'">
                  <label class="form-label">用户名</label>
                  <el-input 
                    v-model="currentEnvironment.authUsername" 
                    placeholder="请输入用户名"
                  />
                </div>

                <div class="form-group" v-if="currentEnvironment.authType === 'basic'">
                  <label class="form-label">密码</label>
                  <el-input 
                    v-model="currentEnvironment.authPassword" 
                    type="password"
                    placeholder="请输入密码"
                    show-password
                  />
                </div>

                <div class="form-group" v-if="currentEnvironment.authType === 'apikey'">
                  <label class="form-label">API Key</label>
                  <el-input 
                    v-model="currentEnvironment.apiKey" 
                    type="password"
                    placeholder="请输入API Key"
                    show-password
                  />
                </div>

                <div class="form-group" v-if="currentEnvironment.authType === 'apikey'">
                  <label class="form-label">Header名称</label>
                  <el-input 
                    v-model="currentEnvironment.apiKeyHeader" 
                    placeholder="例如：X-API-Key"
                  />
                </div>

                <div class="form-group full-width" v-if="currentEnvironment.authType === 'oauth2'">
                  <label class="form-label">OAuth 2.0 配置</label>
                  <el-input 
                    v-model="currentEnvironment.oauth2Config" 
                    type="textarea"
                    :rows="6"
                    placeholder='请输入JSON格式的OAuth 2.0配置'
                  />
                </div>
              </div>

              <!-- 6. 功能开关 -->
              <div v-else-if="envActiveTab === 'switch'" class="env-switches-section">
                <div class="switch-list">
                  <div class="switch-item">
                    <div class="switch-info">
                      <div class="switch-name">调试模式</div>
                      <div class="switch-desc">开启后将显示详细的调试信息</div>
                    </div>
                    <el-switch v-model="currentEnvironment.debugMode" />
                  </div>
                  <div class="switch-item">
                    <div class="switch-info">
                      <div class="switch-name">SSL验证</div>
                      <div class="switch-desc">是否验证SSL证书</div>
                    </div>
                    <el-switch v-model="currentEnvironment.sslVerify" />
                  </div>
                  <div class="switch-item">
                    <div class="switch-info">
                      <div class="switch-name">自动重试</div>
                      <div class="switch-desc">请求失败时自动重试</div>
                    </div>
                    <el-switch v-model="currentEnvironment.autoRetry" />
                  </div>
                  <div class="switch-item">
                    <div class="switch-info">
                      <div class="switch-name">日志记录</div>
                      <div class="switch-desc">记录所有请求和响应日志</div>
                    </div>
                    <el-switch v-model="currentEnvironment.logging" />
                  </div>
                  <div class="switch-item">
                    <div class="switch-info">
                      <div class="switch-name">性能监控</div>
                      <div class="switch-desc">收集性能指标数据</div>
                    </div>
                    <el-switch v-model="currentEnvironment.monitoring" />
                  </div>
                </div>
              </div>

              <!-- 7. 部署信息 -->
              <div v-else-if="envActiveTab === 'monitoring'" class="env-form-section">
                <div class="form-group">
                  <label class="form-label">服务器IP</label>
                  <el-input 
                    v-model="currentEnvironment.serverIp" 
                    placeholder="192.168.1.100"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">部署路径</label>
                  <el-input 
                    v-model="currentEnvironment.deployPath" 
                    placeholder="/var/www/app"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">容器ID</label>
                  <el-input 
                    v-model="currentEnvironment.containerId" 
                    placeholder="docker-container-id"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">版本号</label>
                  <el-input 
                    v-model="currentEnvironment.version" 
                    placeholder="v1.0.0"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">部署时间</label>
                  <el-input 
                    v-model="currentEnvironment.deployTime" 
                    placeholder="2024-02-20 15:30:00"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">部署人</label>
                  <el-input 
                    v-model="currentEnvironment.deployer" 
                    placeholder="张三"
                    disabled
                  />
                </div>

                <div class="form-group full-width">
                  <label class="form-label">部署说明</label>
                  <el-input 
                    v-model="currentEnvironment.deployNote" 
                    type="textarea"
                    :rows="4"
                    placeholder="部署相关说明"
                    disabled
                  />
                </div>

                <!-- 状态指示器 -->
                <div class="env-status-row">
                  <div class="status-item">
                    <el-icon color="#67c23a" :size="16">
                      <CircleCheckFilled />
                    </el-icon>
                    <span class="status-label">运行状态</span>
                    <span class="status-value">正常</span>
                  </div>
                  <div class="status-item">
                    <el-icon color="#1890ff" :size="16">
                      <InfoFilled />
                    </el-icon>
                    <span class="status-label">CPU使用率</span>
                    <span class="status-value">35%</span>
                  </div>
                  <div class="status-item">
                    <el-icon color="#1890ff" :size="16">
                      <InfoFilled />
                    </el-icon>
                    <span class="status-label">内存使用</span>
                    <span class="status-value">2.5GB / 8GB</span>
                  </div>
                  <div class="status-item">
                    <el-icon color="#67c23a" :size="16">
                      <CircleCheckFilled />
                    </el-icon>
                    <span class="status-label">磁盘空间</span>
                    <span class="status-value">充足</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧空状态 -->
        <div class="env-content env-content-empty" v-else>
          <div class="env-empty-content">
            <div class="empty-icon-large">🌐</div>
            <div class="empty-title">暂无环境配置</div>
            <div class="empty-description">请点击左侧'+ 新建环境'按钮创建环境配置</div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="env-dialog-footer">
          <div class="env-footer-left">
            <el-button 
              v-if="envFormData.environments.length > 1"
              type="danger" 
              text
              @click="handleBatchDeleteEnvironments"
            >
              批量删除
            </el-button>
          </div>
          <div class="env-footer-right">
            <el-button @click="envDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveEnvironments">
              保存配置
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="dialogType === 'case' ? '900px' : '600px'"
      :close-on-click-modal="false"
      class="case-edit-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <template v-if="dialogType === 'project'">
          <div class="project-edit-grid">
            <div class="project-edit-left">
              <el-form-item label="项目名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入项目名称" />
              </el-form-item>
              <el-form-item label="项目描述" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入项目描述"
                />
              </el-form-item>
            </div>

            <div class="project-edit-right">
              <el-form-item label="项目封面">
                <div class="cover-area">
                  <div v-if="coverPreview" class="cover-preview" :style="{ backgroundImage: 'url(' + coverPreview + ')' }" role="img" :aria-label="'项目封面预览 ' + (formData.name || '')"></div>
                  <div v-else class="cover-placeholder">封面</div>
                  <div class="cover-actions">
                    <label class="upload-btn small">
                      上传封面
                      <input type="file" accept="image/*" @change="handleCoverChange" />
                    </label>
                    <el-button size="small" @click="clearCover" :disabled="!coverPreview">移除</el-button>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="显示设置">
                <el-switch v-model="formData.is_enabled" /> 显示在项目列表
              </el-form-item>

              <el-form-item label="高级">
                <div class="form-tip">更多高级设置请在创建后进入项目设置页面调整</div>
              </el-form-item>
            </div>
          </div>
        </template>

        <template v-if="dialogType === 'module'">
          <div class="module-edit-grid">
            <div class="module-edit-left">
              <el-form-item label="模块名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入模块名称" />
              </el-form-item>

              <el-form-item label="模块编码" prop="module_code">
                <el-input 
                  v-model="formData.module_code" 
                  placeholder="留空则自动生成"
                  :disabled="isEdit"
                />
                <span class="form-tip" v-if="!isEdit">模块编码在项目内唯一，留空则自动生成</span>
                <span class="form-tip" v-else>模块编码创建后不可修改</span>
              </el-form-item>

              <el-form-item label="模块描述" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入模块描述"
                />
              </el-form-item>

              <el-form-item label="标签" prop="tags">
                <el-select
                  v-model="formData.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="请选择或输入标签"
                  style="width: 100%"
                >
                  <el-option label="核心功能" value="核心功能" />
                  <el-option label="辅助功能" value="辅助功能" />
                  <el-option label="测试中" value="测试中" />
                  <el-option label="待开发" value="待开发" />
                </el-select>
              </el-form-item>
            </div>

            <div class="module-edit-right">
              <el-form-item label="模块图标">
                <div class="cover-area small">
                  <div
                    v-if="moduleIconPreview"
                    class="cover-preview"
                    :style="{ backgroundImage: 'url(' + moduleIconPreview + ')' }"
                    role="img"
                    :aria-label="'模块图标预览 ' + (formData.name || '')"
                  ></div>
                  <div v-else class="cover-placeholder">图标</div>
                  <div class="cover-actions">
                    <label class="upload-btn small">
                      上传图标
                      <input type="file" accept="image/*" @change="handleModuleIconChange" />
                    </label>
                    <el-button size="small" @click="clearModuleIcon" :disabled="!moduleIconPreview">移除</el-button>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="排序顺序" prop="sort_order">
                <el-input-number 
                  v-model="formData.sort_order" 
                  :min="0" 
                  :step="1"
                  placeholder="数字越小越靠前"
                  style="width:100%"
                />
                <span class="form-tip">用于控制模块在列表中的显示顺序</span>
              </el-form-item>

              <el-form-item label="模块状态" prop="status">
                <el-select v-model="formData.status" placeholder="请选择状态">
                  <el-option label="活跃" value="active" />
                  <el-option label="已归档" value="archived" />
                  <el-option label="已禁用" value="disabled" />
                </el-select>
              </el-form-item>
            </div>
          </div>
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
          <div class="case-edit-header">
            <div class="case-edit-header-icon">
              <el-icon color="#1890ff"><Document /></el-icon>
            </div>
            <div class="case-edit-header-info">
              <h3 class="case-edit-title">编辑测试用例</h3>
              <p class="case-edit-subtitle">修改用例基本信息、步骤、请求参数与断言</p>
            </div>
          </div>
          <el-tabs v-model="caseFormActiveTab" class="case-form-tabs">
            <!-- 基本信息 -->
            <el-tab-pane label="基本信息" name="basic">
              <div class="form-section">
            <el-form-item label="用例名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入用例名称">
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              
            <el-form-item label="用例编码" prop="case_code">
              <el-input 
                v-model="formData.case_code" 
                placeholder="留空则自动生成"
                :disabled="isEdit"
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
              <span class="form-tip" v-if="!isEdit">用例编码在接口内唯一，留空则自动生成</span>
              <span class="form-tip" v-else>用例编码创建后不可修改</span>
            </el-form-item>

              <el-form-item label="用例描述" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入用例描述"
                />
              </el-form-item>

              <el-form-item label="优先级" prop="priority">
                <el-select v-model="formData.priority" placeholder="请选择优先级">
                  <el-option label="P0（最高优先级）" value="P0" />
                  <el-option label="P1（高优先级）" value="P1" />
                  <el-option label="P2（中等优先级）" value="P2" />
                  <el-option label="P3（低优先级）" value="P3" />
                </el-select>
              </el-form-item>

              <el-form-item label="严重程度" prop="severity">
                <el-select v-model="formData.severity" placeholder="请选择严重程度">
                  <el-option label="严重" value="critical" />
                  <el-option label="高" value="high" />
                  <el-option label="中" value="medium" />
                  <el-option label="低" value="low" />
                </el-select>
              </el-form-item>

              <el-form-item label="标签" prop="tags">
                <el-select
                  v-model="formData.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="请选择或输入标签"
                  style="width: 100%"
                >
                  <el-option label="登录" value="登录" />
                  <el-option label="注册" value="注册" />
                  <el-option label="认证" value="认证" />
                  <el-option label="支付" value="支付" />
                  <el-option label="订单" value="订单" />
                </el-select>
              </el-form-item>

              <el-form-item label="版本号" prop="version">
                <el-input v-model="formData.version" placeholder="例如：1.0" />
              </el-form-item>

              <el-form-item label="是否启用">
                <el-switch v-model="formData.is_enabled" />
              </el-form-item>

              <el-form-item label="设为模板">
                <el-switch v-model="formData.is_template" />
                <span class="form-tip">模板用例可以被其他用例引用</span>
              </el-form-item>
              </div>
            </el-tab-pane>

            <!-- 测试步骤 -->
            <el-tab-pane label="测试步骤" name="steps">
              <div class="form-section">
              <div class="test-steps-section">
                <div class="steps-header">
                  <span class="steps-title">测试步骤列表</span>
                  <el-button size="small" type="primary" @click="handleAddTestStep">
                    + 添加步骤
                  </el-button>
                </div>
                
                <div class="steps-list" v-if="formData.test_steps && formData.test_steps.length > 0">
                  <div 
                    v-for="(step, index) in formData.test_steps" 
                    :key="index"
                    class="step-item-edit"
                  >
                    <div class="step-number">{{ index + 1 }}</div>
                    <div class="step-content-edit">
                      <el-input
                        v-model="step.operation"
                        placeholder="操作步骤"
                        class="step-input"
                      />
                      <el-input
                        v-model="step.expected"
                        placeholder="预期结果"
                        class="step-input"
                      />
                    </div>
                    <el-button
                      size="small"
                      type="danger"
                      text
                      @click="handleRemoveTestStep(index)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                
                <el-empty 
                  v-else 
                  description="暂无测试步骤，点击上方按钮添加"
                  :image-size="80"
                />
                </div>
              </div>
            </el-tab-pane>

            <!-- 前置条件与请求参数 -->
            <el-tab-pane label="请求参数" name="request">
              <div class="form-section">
              <el-form-item label="前置条件">
                <el-input
                  v-model="formData.pre_conditions_str"
                  type="textarea"
                  :rows="6"
                  placeholder='JSON格式的前置条件，例如：&#10;{&#10;  "token": "xxxx",&#10;  "userId": 123&#10;}'
                />
                <span class="form-tip">用于设置环境变量、登录状态等</span>
              </el-form-item>

              <el-form-item label="请求参数覆盖">
                <!-- 查询参数覆盖 -->
                <div class="override-section">
                  <div class="override-section-title">查询参数 (Query Params)</div>
                  <el-table :data="formData.override_query_params" border size="small">
                    <el-table-column label="参数名" width="150">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.name" placeholder="参数名" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="参数值" width="150">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.value" placeholder="参数值" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="描述">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.description" placeholder="描述" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                      <template #default="{ row, $index }">
                        <el-button size="small" text type="danger" @click="formData.override_query_params.splice($index, 1)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button size="small" @click="formData.override_query_params.push({ name: '', value: '', description: '' })">+ 添加查询参数</el-button>
                </div>
                
                <!-- 路径参数覆盖 -->
                <div class="override-section">
                  <div class="override-section-title">路径参数 (Path Params)</div>
                  <el-table :data="formData.override_path_params" border size="small">
                    <el-table-column label="参数名" width="150">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.name" placeholder="如: id" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="参数值" width="150">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.value" placeholder="参数值" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="描述">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.description" placeholder="描述" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                      <template #default="{ row, $index }">
                        <el-button size="small" text type="danger" @click="formData.override_path_params.splice($index, 1)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button size="small" @click="formData.override_path_params.push({ name: '', value: '', description: '' })">+ 添加路径参数</el-button>
                </div>
                
                <!-- 请求头覆盖 -->
                <div class="override-section">
                  <div class="override-section-title">请求头 (Headers)</div>
                  <el-table :data="formData.override_headers" border size="small">
                    <el-table-column label="Header名" width="150">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.name" placeholder="如: Authorization" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="Header值" width="200">
                      <template #default="{ row, $index }">
                        <el-input v-model="row.value" placeholder="值" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                      <template #default="{ row, $index }">
                        <el-button size="small" text type="danger" @click="formData.override_headers.splice($index, 1)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button size="small" @click="formData.override_headers.push({ name: '', value: '' })">+ 添加请求头</el-button>
                </div>
                
                <!-- 请求体覆盖 -->
                <div class="override-section">
                  <div class="override-section-title">请求体 (Body)</div>
                  <el-input
                    v-model="formData.override_body"
                    type="textarea"
                    :rows="6"
                    placeholder='JSON格式请求体，例如：{"username": "test", "password": "123"}'
                  />
                </div>
                
                <span class="form-tip">将覆盖接口的默认请求参数</span>
              </el-form-item>
              </div>
            </el-tab-pane>

            <!-- 预期响应 -->
            <el-tab-pane label="预期响应" name="response">
              <div class="form-section">
              <el-form-item label="预期状态码" prop="expected_http_status">
                <el-input-number
                  v-model="formData.expected_http_status"
                  :min="100"
                  :max="599"
                  placeholder="200"
                />
              </el-form-item>

              <el-form-item label="预期响应体">
                <el-input
                  v-model="formData.expected_response_body"
                  type="textarea"
                  :rows="8"
                  placeholder='预期的响应内容，例如：&#10;{&#10;  "code": 1,&#10;  "msg": "成功",&#10;  "data": {}&#10;}'
                />
              </el-form-item>

              <el-form-item label="响应Schema">
                <el-input
                  v-model="formData.expected_response_schema_str"
                  type="textarea"
                  :rows="8"
                  placeholder='JSON Schema格式，例如：&#10;{&#10;  "type": "object",&#10;  "properties": {&#10;    "code": {"type": "number"}&#10;  }&#10;}'
                />
                <span class="form-tip">用于验证响应结构</span>
              </el-form-item>
              </div>
            </el-tab-pane>

            <!-- 断言规则 -->
            <el-tab-pane label="断言规则" name="assertions">
              <div class="form-section">
              <div class="assertions-section">
                <div class="assertions-header">
                  <span class="assertions-title">断言列表</span>
                  <el-button size="small" type="primary" @click="handleAddAssertion">
                    + 添加断言
                  </el-button>
                </div>

                <div class="assertions-list" v-if="formData.assertions && formData.assertions.length > 0">
                  <div 
                    v-for="(assertion, index) in formData.assertions" 
                    :key="index"
                    class="assertion-item-edit"
                  >
                    <div class="assertion-form">
                      <el-select 
                        v-model="assertion.type" 
                        placeholder="断言类型"
                        style="width: 180px"
                      >
                        <el-option label="状态码" value="status_code" />
                        <el-option label="JSON路径" value="json_path" />
                        <el-option label="JSON路径存在" value="json_path_exists" />
                        <el-option label="响应时间" value="response_time" />
                        <el-option label="包含文本" value="contains" />
                      </el-select>

                      <el-input
                        v-if="assertion.type === 'json_path' || assertion.type === 'json_path_exists'"
                        v-model="assertion.path"
                        placeholder="$.data.token"
                        style="flex: 1"
                      />

                      <el-input
                        v-if="assertion.type !== 'json_path_exists'"
                        v-model="assertion.expected"
                        placeholder="预期值"
                        style="flex: 1"
                      />

                      <el-button
                        size="small"
                        type="danger"
                        text
                        @click="handleRemoveAssertion(index)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>

                <el-empty 
                  v-else 
                  description="暂无断言规则，点击上方按钮添加"
                  :image-size="80"
                />
                </div>
              </div>
            </el-tab-pane>

            <!-- 响应提取规则 -->
            <el-tab-pane label="提取规则" name="extractors">
              <div class="form-section">
              <div class="extractors-section">
                <div class="extractors-header">
                  <span class="extractors-title">提取器列表</span>
                  <el-button size="small" type="primary" @click="handleAddExtractor">
                    + 添加提取器
                  </el-button>
                </div>

                <div class="extractors-list-edit" v-if="formData.extractors && formData.extractors.length > 0">
                  <div 
                    v-for="(extractor, index) in formData.extractors" 
                    :key="index"
                    class="extractor-item-edit"
                  >
                    <div class="extractor-form">
                      <el-input
                        v-model="extractor.name"
                        placeholder="变量名"
                        style="width: 150px"
                      />
                      <el-input
                        v-model="extractor.expression"
                        placeholder="JSONPath表达式，如：$.data.token"
                        style="flex: 2"
                      />
                      <el-input
                        v-model="extractor.description"
                        placeholder="描述"
                        style="flex: 1"
                      />
                      <el-button
                        size="small"
                        type="danger"
                        text
                        @click="handleRemoveExtractor(index)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>

                <el-empty 
                  v-else 
                  description="暂无提取规则，点击上方按钮添加"
                  :image-size="80"
                />

                <div class="extractor-tip">
                  <el-icon color="#1890ff"><InfoFilled /></el-icon>
                  <span>提取器用于从响应中提取数据供后续用例使用，如提取登录token、订单ID等</span>
                </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
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

    <!-- 执行测试配置对话框 -->
    <ExecuteConfigDialog
      v-model:visible="executeDialogVisible"
      title="测试用例执行"
      :target-info="executeTargetInfo"
      :initial-config="executeFormData"
      :initial-variables="executeVariables"
      :loading="executing"
      @confirm="handleExecuteFromDialog"
    />

    <!-- 执行结果对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="测试执行结果"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="execution-result-container" v-if="executeResult">
        <!-- 结果状态横幅 -->
        <div class="result-banner" :class="'status-' + executeResult.status">
          <div class="banner-icon-wrapper" :class="executeResult.status">
            <el-icon v-if="executeResult.status === 'passed'" :size="48">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else :size="48">
              <CircleCloseFilled />
            </el-icon>
          </div>
          <div class="banner-content">
            <h3 class="result-title">
              {{ executeResult.status === 'passed' ? '🎉 测试通过' : '😞 测试失败' }}
            </h3>
            <p class="result-subtitle">
              <el-tag size="small" effect="plain">
                {{ executeResult.caseName || '未知用例' }}
              </el-tag>
            </p>
          </div>
          <div class="banner-badge" :class="executeResult.status">
            {{ executeResult.status === 'passed' ? 'SUCCESS' : 'FAILED' }}
          </div>
        </div>

        <!-- 报告名称编辑 -->
        <div class="report-name-section" v-if="executeResult.reportId">
          <div class="report-name-label">
            <el-icon><Document /></el-icon>
            <span>报告名称</span>
          </div>
          <div class="report-name-content">
            <span v-if="!isEditingReportName" class="report-name-text">{{ executeResult.reportName || '未命名报告' }}</span>
            <el-input
              v-else
              v-model="editingReportName"
              size="small"
              style="width: 300px;"
              :maxlength="255"
              show-word-limit
              placeholder="请输入报告名称"
            />
            <el-button
              v-if="!isEditingReportName"
              type="primary"
              size="small"
              link
              @click="startEditReportName"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <template v-else>
              <el-button type="primary" size="small" @click="saveReportName" :loading="savingReportName">保存</el-button>
              <el-button size="small" @click="cancelEditReportName">取消</el-button>
            </template>
          </div>
        </div>

        <!-- 执行信息 -->
        <div class="result-info-section">
          <div class="info-grid">
            <!-- 执行ID -->
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Ticket /></el-icon>
                <span class="info-label">执行ID</span>
              </div>
              <div class="info-value code">{{ executeResult.executionId }}</div>
            </div>

            <!-- 响应状态 -->
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Connection /></el-icon>
                <span class="info-label">响应状态</span>
              </div>
              <div class="info-value">
                <el-tag 
                  :type="getStatusTagType(executeResult.responseStatus)"
                  size="large"
                  effect="dark"
                >
                  {{ executeResult.responseStatus || '-' }}
                </el-tag>
              </div>
            </div>

            <!-- 执行耗时 -->
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Timer /></el-icon>
                <span class="info-label">执行耗时</span>
              </div>
              <div class="info-value highlight">
                <span class="duration-value">{{ formatDuration(executeResult.duration) }}</span>
              </div>
            </div>

            <!-- 断言结果 -->
            <div class="info-card assertion-card">
              <div class="info-card-header">
                <el-icon><Checked /></el-icon>
                <span class="info-label">断言结果</span>
              </div>
              <div class="info-value assertion-values">
                <span class="assertion-item passed">
                  <el-icon><CircleCheck /></el-icon>
                  {{ executeResult.assertionsPassed || 0 }} 通过
                </span>
                <span class="assertion-divider">|</span>
                <span class="assertion-item failed">
                  <el-icon><CircleClose /></el-icon>
                  {{ executeResult.assertionsFailed || 0 }} 失败
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="result-time-section">
          <div class="time-item">
            <div class="time-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="time-content">
              <span class="time-label">开始时间</span>
              <span class="time-value">{{ formatTime(executeResult.startTime) || '-' }}</span>
            </div>
          </div>
          <div class="time-divider">
            <el-icon><Right /></el-icon>
          </div>
          <div class="time-item">
            <div class="time-icon end">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="time-content">
              <span class="time-label">结束时间</span>
              <span class="time-value">{{ formatTime(executeResult.endTime) || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 失败信息（如果有） -->
        <div class="result-failure-section" v-if="executeResult.status === 'failed'">
          <!-- 失败概览卡片 -->
          <div class="failure-overview">
            <div class="failure-icon">
              <el-icon :size="24"><WarningFilled /></el-icon>
            </div>
            <div class="failure-summary">
              <div class="failure-title-row">
                <span class="failure-title-text">执行失败</span>
                <el-tag size="small" type="danger" effect="dark" v-if="executeResult.failureType">
                  {{ getFailureTypeText(executeResult.failureType) }}
                </el-tag>
              </div>
            </div>
            <el-button 
              type="primary" 
              link 
              @click="showErrorDetail = !showErrorDetail"
            >
              <el-icon><ArrowDown v-if="!showErrorDetail" /><ArrowUp v-else /></el-icon>
              {{ showErrorDetail ? '收起详情' : '展开详情' }}
            </el-button>
          </div>

          <!-- 错误详情 -->
          <el-collapse-transition>
            <div class="failure-detail" v-show="showErrorDetail">
              <!-- 失败原因 -->
              <div class="detail-item" v-if="executeResult.failureMessage">
                <div class="detail-label">
                  <el-icon><InfoFilled /></el-icon>
                  失败原因
                </div>
                <div class="detail-content error-content">
                  <pre class="error-message">{{ executeResult.failureMessage }}</pre>
                </div>
              </div>

              <!-- AI诊断按钮 -->
              <div 
                class="ai-diagnosis-btn-wrapper" 
                v-if="!showAIDiagnosis"
              >
                <el-button 
                  type="primary" 
                  class="ai-diagnosis-btn"
                  @click="triggerAIDiagnosis"
                  :loading="aiDiagnosisLoading"
                >
                  <el-icon><MagicStick /></el-icon>
                  AI诊断
                </el-button>
              </div>

              <!-- AI诊断结果 -->
              <div class="quick-fix-section" v-if="showAIDiagnosis">
                <!-- 加载中 -->
                <div v-if="aiDiagnosisLoading" class="ai-diagnosis-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>AI正在诊断中...</span>
                </div>
                
                <!-- 诊断结果 -->
                <template v-else-if="aiDiagnosisResult">
                  <div class="detail-label">
                    <el-icon><MagicStick /></el-icon>
                    💡 AI诊断结果
                  </div>
                  
                  <!-- 严重程度 -->
                  <div class="diagnosis-severity" :class="'severity-' + aiDiagnosisResult.severity">
                    <el-tag :type="aiDiagnosisResult.severity === 'high' ? 'danger' : aiDiagnosisResult.severity === 'medium' ? 'warning' : 'info'" size="large">
                      严重程度: {{ aiDiagnosisResult.severity === 'high' ? '高' : aiDiagnosisResult.severity === 'medium' ? '中' : '低' }}
                    </el-tag>
                  </div>
                  
                  <!-- 根本原因 -->
                  <div class="diagnosis-root-cause" v-if="aiDiagnosisResult.rootCause">
                    <div class="detail-label">根本原因</div>
                    <div class="root-cause-content">{{ aiDiagnosisResult.rootCause }}</div>
                  </div>
                  
                  <!-- 发现的问题 -->
                  <div class="diagnosis-issues" v-if="aiDiagnosisResult.issues && aiDiagnosisResult.issues.length > 0">
                    <div class="detail-label">发现问题</div>
                    <div class="issues-list">
                      <div 
                        class="issue-item" 
                        v-for="(issue, index) in aiDiagnosisResult.issues" 
                        :key="index"
                        :class="'issue-' + issue.severity"
                      >
                        <el-tag :type="issue.severity === 'high' ? 'danger' : 'warning'" size="small">
                          {{ issue.severity === 'high' ? '高' : '中' }}
                        </el-tag>
                        <span class="issue-title">{{ issue.title }}</span>
                        <span class="issue-desc">{{ issue.description }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 修复建议 -->
                  <div class="diagnosis-suggestions" v-if="aiDiagnosisResult.suggestions && aiDiagnosisResult.suggestions.length > 0">
                    <div class="detail-label">修复建议</div>
                    <div class="quick-fix-list">
                      <div 
                        class="quick-fix-item" 
                        v-for="(suggestion, index) in aiDiagnosisResult.suggestions" 
                        :key="index"
                      >
                        <div class="fix-step">{{ index + 1 }}</div>
                        <div class="fix-content">
                          <div class="suggestion-title">{{ suggestion.title }}</div>
                          <div class="suggestion-content">{{ suggestion.content }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                
                <!-- 诊断失败 -->
                <div v-else class="ai-diagnosis-error">
                  <el-alert type="error" :closable="false">
                    AI诊断暂时不可用，请查看上方失败原因
                  </el-alert>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 失败类型（如果有） -->
        <div class="result-section" v-if="executeResult.status === 'failed' && executeResult.failureType">
          <div class="section-title">失败类型</div>
          <div class="failure-type">
            <el-tag :type="getFailureTypeTagType(executeResult.failureType)" size="large">
              {{ getFailureTypeText(executeResult.failureType) }}
            </el-tag>
          </div>
        </div>

        <!-- 详细断言结果（如果有） -->
        <div class="result-section" v-if="executeResult.assertionDetails && executeResult.assertionDetails.length > 0">
          <div class="section-title">断言详情</div>
          <el-table :data="executeResult.assertionDetails" size="small" border stripe>
            <el-table-column prop="assertionId" label="#" width="50" />
            <el-table-column prop="assertionType" label="断言类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.assertionType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="120" />
            <el-table-column prop="expectedValue" label="期望值" min-width="100">
              <template #default="{ row }">
                <span class="cell-value">{{ row.expectedValue || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="actualValue" label="实际值" min-width="100">
              <template #default="{ row }">
                <span class="cell-value">{{ row.actualValue || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="passed" label="结果" width="80" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.passed" color="#67c23a" :size="18"><CircleCheckFilled /></el-icon>
                <el-icon v-else color="#f56c6c" :size="18"><CircleCloseFilled /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="errorMessage" label="错误信息" min-width="150">
              <template #default="{ row }">
                <span class="error-text">{{ row.errorMessage || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 响应体（可折叠） -->
        <div class="result-section" v-if="executeResult.responseBody">
          <el-collapse v-model="activeResponseCollapse">
            <el-collapse-item title="响应体详情" name="responseBody">
              <pre class="response-body-content">{{ formatResponseBody(executeResult.responseBody) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 失败堆栈跟踪（如果有） -->
        <div class="result-section" v-if="executeResult.status === 'failed' && executeResult.failureTrace">
          <el-collapse v-model="activeFailureTraceCollapse">
            <el-collapse-item title="错误堆栈" name="failureTrace">
              <pre class="failure-trace-content">{{ executeResult.failureTrace }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 操作链接 -->
        <div class="result-links-section">
          <el-button
            type="primary"
            :icon="Document"
            @click="handleViewLogs"
            v-if="executeResult.logsLink"
          >
            查看执行日志
          </el-button>
          <el-button
            :icon="DocumentCopy"
            @click="handleViewReport"
            v-if="executeResult.reportId"
          >
            查看测试报告
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleRetestFromResult"
          >
            重新测试
          </el-button>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="resultDialogVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, onDeactivated, nextTick, watch, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 组件卸载标志，用于防止组件卸载后异步更新
const isMounted = ref(true)

// 用户 store
const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.userId)
import {
  CircleCheckFilled,
  CircleCloseFilled,
  WarningFilled,
  InfoFilled,
  Delete,
  Document,
  Link,
  User,
  Timer,
  Key,
  Monitor,
  Clock,
  MagicStick,
  Loading,
  DocumentCopy,
  Refresh,
  ArrowDown,
  ArrowUp,
  Setting,
  Ticket,
  Connection,
  Checked,
  Right,
  CircleCheck,
  Edit
} from '@element-plus/icons-vue'
import TreeNode from '../components/cases/TreeNode.vue'
import CaseDetail from '../components/cases/CaseDetail.vue'
import ExecuteConfigDialog from '../components/cases/ExecuteConfigDialog.vue'
import ApiDetail from '../components/cases/ApiDetail.vue'
import LevelStats from '../components/cases/LevelStats.vue'
import EnvironmentConfigDialog from '../components/cases/EnvironmentConfigDialog.vue'
import EditDialog from '../components/cases/EditDialog.vue'
import PageEnterTransition from '../components/ui/PageEnterTransition.vue'
import StaggeredReveal from '../components/ui/StaggeredReveal.vue'
import { ProjectListSkeleton } from '../components/ui/skeletons'
import {
  getProjects,
  getModulesByProject,
  getApisByModule,
  getApiById,
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
import { diagnose, getDiagnosisResult } from '../api/diagnosis'
import { updateReportName } from '../api/report'
import { getUserProjects } from '../api/personnel'
import { useUserStore } from '@/stores/useUserStore'
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
import {
  createEnvironmentConfig,
  updateEnvironmentConfig,
  deleteEnvironmentConfig,
  getEnvironmentConfigList,
  getProjectEnvironments
} from '../api/environment'
import {
  transformEnvironmentConfig,
  transformEnvironmentConfigToBackend
} from '../utils/environmentTransform'

// 配置：是否使用真实API（设置为 true 则调用后端，false 则使用假数据）
// 后端准备好后，将此值改为 true
let USE_REAL_API = true // 尝试使用真实API
let API_ERROR_COUNT = 0 // API错误计数
const MAX_API_ERRORS = 3 // 最大错误次数，超过后自动切换到演示模式

// 处理API错误
const handleAPIError = (error, operation = '操作') => {
  API_ERROR_COUNT++
  console.error(`${operation}失败:`, error)
  
  if (API_ERROR_COUNT >= MAX_API_ERRORS) {
    USE_REAL_API = false
    ElMessage.warning('后端服务异常，已自动切换到演示模式')
    console.log('已切换到演示模式')
  }
  
  // 检查是否是系统异常错误
  if (error.msg && error.msg.includes('系统异常')) {
    ElMessage.error('后端服务异常，请检查后端服务状态')
  } 
  // 检查是否是删除功能不支持的错误
  else if (error.msg && (error.msg.includes('不支持删除') || error.msg.includes('请联系管理员'))) {
    ElMessage.warning({
      message: '删除功能暂不可用',
      description: '当前版本不支持删除环境配置功能，请使用其他方式管理环境配置。',
      type: 'warning',
      duration: 5000
    })
  } else {
    ElMessage.error(error.msg || `${operation}失败`)
  }
}

// 响应式数据
const loading = ref(false)
const pageEntered = ref(false) // 页面进入动画状态
const sidebarCollapsed = ref(false)
const searchKeyword = ref('')
const contentTransitionKey = ref(0) // 内容过渡动画key

// 错开动画项目配置
const staggeredItems = ref([
  {
    key: 'sidebar',
    class: 'stagger-item-sidebar',
    component: 'div',
    props: { class: 'sidebar-wrapper' }
  },
  {
    key: 'main-area',
    class: 'stagger-item-main',
    component: 'div',
    props: { class: 'main-area-wrapper' }
  }
])
// 防抖搜索：输入节流，减少过滤计算频率
const debouncedSearch = ref('')
let searchDebounceTimer = null
watch(searchKeyword, (val) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    debouncedSearch.value = (val || '').trim()
  }, 300)
})
onBeforeUnmount(() => {
  isMounted.value = false
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})

// 展开/收起节流锁，防止短时间内多次切换造成频繁保存
const toggleLock = ref(false)
const selectedNode = ref(null)
const selectedLevel = ref(null) // 'project' | 'module' | 'api' | 'case'
const executionHistory = ref([])
const projects = ref([])
const expandedNodes = ref(new Set()) // 记录展开的节点ID



// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const caseFormActiveTab = ref('basic') // 用例表单当前标签页

// 执行测试对话框相关
const executeDialogVisible = ref(false)
const executing = ref(false)
const executeVariables = ref('')
const variablesError = ref('')
const executeFormData = reactive({
  environment: null,
  baseUrl: '',
  timeout: 30,
  variables: {},
  async: false
})

// 执行目标信息
const executeTargetInfo = computed(() => {
  const testCase = selectedNode.value
  const isExecutingApi = selectedLevel.value === 'api'
  
  if (isExecutingApi && testCase) {
    return {
      name: testCase.name || '接口测试',
      tag: `${testCase.method || 'GET'} ${testCase.path || ''}`,
      tagType: 'warning',
      description: `将执行该接口下 ${testCase.cases?.length || 0} 个测试用例`,
      stats: [
        { label: '接口', value: testCase.path || '-' },
        { label: '用例数', value: testCase.cases?.length || 0 }
      ]
    }
  }
  
  return {
    name: testCase?.name || '测试用例',
    tag: testCase?.case_code || testCase?.caseCode || '自动生成',
    tagType: 'success',
    description: testCase ? `用例编码：${testCase.case_code || testCase?.caseCode || '自动生成'}` : '',
    stats: [
      { label: '优先级', value: testCase?.priority || 'P2' },
      { label: '严重程度', value: testCase?.severity || 'Medium' }
    ]
  }
})

// 处理执行配置对话框的确认
const handleExecuteFromDialog = (config) => {
  // 更新执行表单数据
  Object.assign(executeFormData, config)
  // 调用原来的执行方法
  handleConfirmExecute()
}

const executeResult = ref(null)
const resultDialogVisible = ref(false)
const showErrorDetail = ref(true)
const showAIDiagnosis = ref(false)  // AI诊断展开状态
const aiDiagnosisLoading = ref(false)  // AI诊断加载状态
const aiDiagnosisResult = ref(null)

// 编辑报告名称相关
const isEditingReportName = ref(false)
const editingReportName = ref('')
const savingReportName = ref(false)

// 开始编辑报告名称
const startEditReportName = () => {
  editingReportName.value = executeResult.value?.reportName || ''
  isEditingReportName.value = true
}

// 取消编辑报告名称
const cancelEditReportName = () => {
  isEditingReportName.value = false
  editingReportName.value = ''
}

// 保存报告名称
const saveReportName = async () => {
  if (!editingReportName.value || editingReportName.value.trim() === '') {
    ElMessage.warning('报告名称不能为空')
    return
  }
  
  if (editingReportName.value === executeResult.value.reportName) {
    isEditingReportName.value = false
    return
  }
  
  savingReportName.value = true
  try {
    const response = await updateReportName(executeResult.value.reportId, editingReportName.value.trim())
    
    if (response.code === 1) {
      executeResult.value.reportName = editingReportName.value.trim()
      isEditingReportName.value = false
      ElMessage.success('报告名称更新成功')
    } else {
      ElMessage.error(response.msg || '更新报告名称失败')
    }
  } catch (error) {
    console.error('更新报告名称失败:', error)
    ElMessage.error('更新报告名称失败')
  } finally {
    savingReportName.value = false
  }
}

const triggerAIDiagnosis = async () => {
  if (!executeResult.value) return
  
  aiDiagnosisLoading.value = true
  showAIDiagnosis.value = true
  
  try {
    const params = {
      failureMessage: executeResult.value.failureMessage || '',
      failureType: executeResult.value.failureType || '',
      responseStatus: executeResult.value.responseStatus || null,
      responseBody: executeResult.value.responseBody || '',
      apiPath: executeResult.value.apiPath || '',
      apiMethod: executeResult.value.apiMethod || '',
      caseName: executeResult.value.caseName || ''
    }
    
    const res = await diagnose(params)
    
    if (res.code === 1) {
      aiDiagnosisResult.value = res.data
      
      if (res.data.diagnosisId && res.data.aiStatus === 'processing') {
        pollDiagnosisResult(res.data.diagnosisId)
      } else {
        aiDiagnosisLoading.value = false
      }
    } else {
      ElMessage.error(res.msg || 'AI诊断失败')
      aiDiagnosisResult.value = null
      aiDiagnosisLoading.value = false
    }
  } catch (error) {
    console.error('AI诊断失败:', error)
    ElMessage.error('AI诊断失败，请稍后重试')
    aiDiagnosisResult.value = null
    aiDiagnosisLoading.value = false
  }
}

const pollDiagnosisResult = async (diagnosisId) => {
  const maxAttempts = 30
  const interval = 2000
  let attempts = 0
  
  const poll = async () => {
    try {
      attempts++
      const res = await getDiagnosisResult(diagnosisId)
      
      if (res.code === 1 && res.data) {
        aiDiagnosisResult.value = res.data
        
        if (res.data.aiCompleted || res.data.aiStatus === 'completed' || res.data.aiStatus === 'failed') {
          aiDiagnosisLoading.value = false
          if (res.data.aiStatus === 'completed') {
            ElMessage.success('AI诊断完成')
          }
          return
        }
      }
      
      if (attempts < maxAttempts) {
        setTimeout(poll, interval)
      } else {
        aiDiagnosisLoading.value = false
        ElMessage.warning('AI诊断响应时间较长，结果将稍后更新')
      }
    } catch (error) {
      console.error('轮询诊断结果失败:', error)
      if (attempts < maxAttempts) {
        setTimeout(poll, interval)
      } else {
        aiDiagnosisLoading.value = false
      }
    }
  }
  
  poll()
}

// 失败修复建议函数
const getQuickFixSuggestions = (errorMessage) => {
  if (!errorMessage) return []
  const suggestions = []
  
  if (errorMessage.includes('no protocol') || errorMessage.includes('URL格式错误')) {
    suggestions.push('检查Base URL是否正确配置，确保包含协议前缀（如 http:// 或 https://）')
    suggestions.push('在执行配置中填写正确的环境Base URL（如 http://localhost:8080）')
    suggestions.push('检查接口路径是否以 / 开头')
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
    suggestions.push('增加请求超时时间')
    suggestions.push('检查目标服务器是否可达')
  }
  
  if (errorMessage.includes('connection') || errorMessage.includes('连接')) {
    suggestions.push('检查目标服务器是否启动')
    suggestions.push('检查防火墙设置')
  }
  
  if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('认证')) {
    suggestions.push('检查Token是否过期')
    suggestions.push('验证认证信息是否正确')
  }
  
  if (errorMessage.includes('404')) {
    suggestions.push('检查API路径是否正确')
    suggestions.push('确认接口是否已部署')
  }
  
  if (errorMessage.includes('500')) {
    suggestions.push('检查服务器端代码是否有bug')
    suggestions.push('查看服务器日志获取详细错误信息')
  }
  
  return suggestions
}

// 格式化执行时长
const formatDuration = (ms) => {
  if (!ms && ms !== 0) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
}

// 根据响应状态码获取标签类型
const getStatusTagType = (status) => {
  if (!status) return 'info'
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'danger'
  if (status < 0) return 'info'  // 负数状态码如 -4 表示错误
  return 'info'
}

// 折叠面板控制变量
const activeResponseCollapse = ref([])
const activeFailureTraceCollapse = ref([])

// 格式化响应体（尝试JSON格式化）
const formatResponseBody = (body) => {
  if (!body) return ''
  try {
    if (typeof body === 'string') {
      const parsed = JSON.parse(body)
      return JSON.stringify(parsed, null, 2)
    }
    return JSON.stringify(body, null, 2)
  } catch {
    return body
  }
}

// 获取失败类型的中文描述
const getFailureTypeText = (type) => {
  const typeMap = {
    'ASSERTION_FAILED': '断言失败',
    'NETWORK_ERROR': '网络错误',
    'CONNECTION_REFUSED': '连接被拒绝',
    'TIMEOUT': '请求超时',
    'UNKNOWN_HOST': '未知主机',
    'MALFORMED_URL': 'URL格式错误',
    'SSL_ERROR': 'SSL证书错误',
    'IO_ERROR': 'IO错误',
    'EXECUTION_ERROR': '执行错误',
    'VALIDATION_ERROR': '验证错误',
    'UNKNOWN_ERROR': '未知错误'
  }
  return typeMap[type] || type || '未知类型'
}

// 获取失败类型的标签类型
const getFailureTypeTagType = (type) => {
  if (type === 'ASSERTION_FAILED') return 'warning'
  if (type === 'NETWORK_ERROR' || type === 'CONNECTION_REFUSED' || type === 'TIMEOUT') return 'danger'
  if (type === 'UNKNOWN_HOST' || type === 'MALFORMED_URL' || type === 'SSL_ERROR') return 'danger'
  return 'info'
}

const formData = reactive({
  id: null,
  name: '',
  description: '',
  url: '',
  method: 'GET',
  // 模块相关字段
  module_code: '',
  sort_order: 0,
  status: 'active',
  owner_id: null,
  // 用例相关字段
  case_code: '',
  priority: 'P2',
  severity: 'medium',
  tags: [],
  version: '1.0',
  is_enabled: true,
  is_template: false,
  template_id: null,
  // 测试步骤
  test_steps: [],
  // 前置条件和请求参数
  pre_conditions_str: '',
  request_override_str: '',
  // 请求参数覆盖 - 可视化编辑器用
  override_query_params: [],
  override_path_params: [],
  override_headers: [],
  override_body: '',
  // 预期响应
  expected_http_status: 200,
  expected_response_body: '',
  expected_response_schema_str: '',
  // 断言和提取器
  assertions: [],
  extractors: [],
  validators: [],
  // 兼容旧字段
  request_params: '',
  expected_status_code: 200,
  validation_rules: '',
  parentId: null
})

// project cover preview support for project edit dialog
const coverPreview = ref(formData.coverUrl || null)
const coverFile = ref(null)

function handleCoverChange(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  coverFile.value = f
  const reader = new FileReader()
  reader.onload = () => { coverPreview.value = reader.result }
  reader.readAsDataURL(f)
}

function clearCover() {
  coverFile.value = null
  coverPreview.value = null
}

// module icon support
const moduleIconPreview = ref(null)
const moduleIconFile = ref(null)

function handleModuleIconChange(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  moduleIconFile.value = f
  const reader = new FileReader()
  reader.onload = () => { moduleIconPreview.value = reader.result }
  reader.readAsDataURL(f)
}

function clearModuleIcon() {
  moduleIconFile.value = null
  moduleIconPreview.value = null
}

// 环境配置对话框
const envDialogVisible = ref(false)
const envFormRef = ref(null)
const envSearchText = ref('')
const currentEnvIndex = ref(0)
const envActiveTab = ref('basic')

const envFormData = reactive({
  project_id: null,
  environments: [
    {
      name: '开发环境',
      base_url: 'https://dev.example.com',
      port: '8080',
      domain: 'dev.example.com',
      protocol: 'https',
      description: '开发环境主要用于开发人员本地开发和单元测试',
      is_default: true,
      status: 'active',
      // 数据配置项
      dataConfigs: [],
      // 外部服务
      externalServices: [],
      // 环境变量
      envVariables: [],
      // 认证配置
      authType: 'bearer',
      authToken: '',
      authUsername: '',
      authPassword: '',
      apiKey: '',
      apiKeyHeader: 'X-API-Key',
      oauth2Config: '',
      // 功能开关
      debugMode: true,
      sslVerify: false,
      autoRetry: true,
      logging: true,
      monitoring: true,
      // 部署信息
      serverIp: '192.168.1.100',
      deployPath: '/var/www/app',
      containerId: 'docker-abc123',
      version: 'v1.2.3',
      deployTime: '2024-02-20 15:30:00',
      deployer: '张三',
      deployNote: '常规更新部署'
    },
    {
      name: '测试环境',
      base_url: 'https://test.example.com',
      port: '8080',
      domain: 'test.example.com',
      protocol: 'https',
      description: '测试环境配置',
      is_default: false,
      status: 'inactive',
      dataConfigs: [],
      externalServices: [],
      envVariables: [],
      authType: 'bearer',
      debugMode: false,
      sslVerify: true,
      autoRetry: true,
      logging: true,
      monitoring: true
    },
    {
      name: '预发布环境',
      base_url: 'https://staging.example.com',
      port: '8080',
      domain: 'staging.example.com',
      protocol: 'https',
      description: '预发布环境配置',
      is_default: false,
      status: 'inactive',
      dataConfigs: [],
      externalServices: [],
      envVariables: [],
      authType: 'bearer',
      debugMode: false,
      sslVerify: true,
      autoRetry: false,
      logging: true,
      monitoring: true
    },
    {
      name: '生产环境',
      base_url: 'https://prod.example.com',
      port: '443',
      domain: 'prod.example.com',
      protocol: 'https',
      description: '生产环境配置',
      is_default: false,
      status: 'inactive',
      dataConfigs: [],
      externalServices: [],
      envVariables: [],
      authType: 'bearer',
      debugMode: false,
      sslVerify: true,
      autoRetry: false,
      logging: true,
      monitoring: true
    }
  ]
})

// 当前选中的环境
const currentEnvironment = computed(() => {
  return envFormData.environments[currentEnvIndex.value]
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
  if (!debouncedSearch.value) return projects.value
  
  const keyword = debouncedSearch.value.toLowerCase()
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
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  if (USE_REAL_API) {
    await loadProjectTree()
  } else {
    ElMessage.success('刷新成功')
  }
}

// 选择节点
const handleSelectNode = async (node, level) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  selectedNode.value = node
  selectedLevel.value = level

  // 触发内容过渡动画
  contentTransitionKey.value++

  // 如果是项目，按需加载模块
  if (level === 'project') {
    await loadProjectModules(node)
  }
  // 如果是模块，按需加载接口
  else if (level === 'module') {
    await loadModuleApis(node)
  }
  // 如果是接口，按需加载测试用例
  else if (level === 'api') {
    await loadApiTestCases(node)
  }
  // 如果是用例，不需要在这里加载执行历史
  // 执行历史由 CaseDetail 组件自己负责加载
  else if (level === 'case') {
    // 清空之前的执行历史，让子组件重新加载
    executionHistory.value = []
  }
}

// 处理节点展开/收起
const handleToggleExpand = (nodeId) => {
  // 防止短时间内重复切换
  if (toggleLock.value) return
  toggleLock.value = true
  setTimeout(() => {
    toggleLock.value = false
  }, 150)

  if (expandedNodes.value.has(nodeId)) {
    // 如果已展开，则收起
    expandedNodes.value.delete(nodeId)
  } else {
    // 如果已收起，则展开
    expandedNodes.value.add(nodeId)
  }
}

// 加载项目模块
const loadProjectModules = async (project) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  // 如果模块已经加载过，直接返回
  if (project.modules && project.modules.length > 0) {
    return
  }
  
  // 防止重复加载
  if (project._loadingModules) {
    return
  }
  
  try {
    project._loadingModules = true
    loading.value = true
    
    const response = await getModulesByProject(project.project_id, {
      structure: 'tree',
      includeStatistics: true
    })
    
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    
    if (response.code === 1) {
      const modules = response.data.modules || []
      // 转换模块数据并添加到项目中
      project.modules = modules.map(module => {
        const transformedModule = transformModule(module)
        // 添加项目名称到模块中
        transformedModule.project_name = project.name
        transformedModule.projectName = project.name
        return transformedModule
      })
      
      if (modules.length > 0) {
        ElMessage.success(`加载了 ${modules.length} 个模块`)
      }
    } else {
      ElMessage.error(response.msg || '加载模块失败')
      project.modules = []
    }
  } catch (error) {
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    console.error('加载项目模块失败:', error)
    ElMessage.error('加载模块失败，请稍后重试')
    project.modules = []
  } finally {
    project._loadingModules = false
    loading.value = false
  }
}

// 加载模块接口
const loadModuleApis = async (module, forceRefresh = false) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  // 如果接口已经加载过且不是强制刷新，直接返回
  if (!forceRefresh && module.apis && module.apis.length > 0) {
    return
  }
  
  // 防止重复加载
  if (module._loadingApis) {
    return
  }
  
  try {
    module._loadingApis = true
    loading.value = true
    
    const response = await getApisByModule(module.module_id)
    
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    
    if (response.code === 1) {
      const apis = response.data.items || []
      // 转换接口数据并添加到模块中
      module.apis = apis.map(api => {
        const transformedApi = transformApi(api)
        // 添加上下文信息：项目ID、项目名称、模块ID和模块名称
        transformedApi.project_id = module.project_id
        transformedApi.projectId = module.project_id
        transformedApi.project_name = module.project_name || '-'
        transformedApi.projectName = module.project_name || '-'
        transformedApi.module_id = module.module_id
        transformedApi.moduleId = module.module_id
        transformedApi.module_name = module.name
        transformedApi.moduleName = module.name
        return transformedApi
      })
      
      if (apis.length > 0) {
        ElMessage.success(`加载了 ${apis.length} 个接口`)
      }
    } else {
      ElMessage.error(response.msg || '加载接口失败')
      module.apis = []
    }
  } catch (error) {
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    console.error('加载模块接口失败:', error)
    ElMessage.error('加载接口失败，请稍后重试')
    module.apis = []
  } finally {
    module._loadingApis = false
    loading.value = false
  }
}

// 加载接口测试用例
const loadApiTestCases = async (api, forceRefresh = false) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  // 如果测试用例已经加载过且不是强制刷新，直接返回
  if (!forceRefresh && api.cases && api.cases.length > 0) {
    return
  }
  
  // 防止重复加载
  if (api._loadingCases) {
    return
  }
  
  try {
    api._loadingCases = true
    loading.value = true
    
    const response = await getTestCasesByApi(api.api_id, { pageSize: 100 })
    
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    
    if (response.code === 1) {
      const cases = response.data.items || []
      // 转换测试用例数据并添加到接口中
      api.cases = cases.map(transformTestCase)
      
      // 如果当前选中的是用例，且该用例属于当前接口，则更新选中的用例数据
      if (selectedLevel.value === 'case' && selectedNode.value) {
        const currentCase = api.cases.find(c => 
          c.case_id === selectedNode.value.case_id || 
          c.id === selectedNode.value.id
        )
        if (currentCase) {
          selectedNode.value = currentCase
        }
      }
      
      // 只在首次加载时显示成功消息，强制刷新时不显示
      if (!forceRefresh && cases.length > 0) {
        ElMessage.success(`加载了 ${cases.length} 个测试用例`)
      }
    } else {
      ElMessage.error(response.msg || '加载测试用例失败')
      api.cases = []
    }
  } catch (error) {
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    console.error('加载接口测试用例失败:', error)
    ElMessage.error('加载测试用例失败，请稍后重试')
    api.cases = []
  } finally {
    api._loadingCases = false
    loading.value = false
  }
}

// 注意：loadTestCaseHistory 函数已废弃
// 执行历史现在由 CaseDetail 组件自己负责加载
// 这样可以避免数据冲突和重复请求
const loadTestCaseHistory = async (testCase) => {
  // 不再加载执行历史，由子组件处理
  console.log('loadTestCaseHistory 已废弃，执行历史由 CaseDetail 组件处理')
  executionHistory.value = []
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

// 刷新测试用例数据
const handleRefreshCases = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  if (selectedLevel.value === 'api' && selectedNode.value) {
    try {
      // 强制重新加载当前接口的测试用例
      await loadApiTestCases(selectedNode.value, true)
      // 不显示成功消息，避免干扰用户体验
    } catch (error) {
      console.error('刷新测试用例失败:', error)
      ElMessage.error('刷新数据失败')
    }
  }
}

// 刷新项目的模块列表（保持折叠状态）
const refreshProjectModules = async (projectId) => {
  if (!projectId) {
    console.error('项目ID不能为空')
    return
  }
  
  try {
    // 查找对应的项目节点
    let targetProject = null
    projects.value.forEach(project => {
      if (project.project_id === projectId) {
        targetProject = project
      }
    })
    
    if (!targetProject) {
      console.error('未找到项目节点')
      return
    }
    
    // 重新加载该项目的模块列表（强制刷新）
    // 先清空现有模块，避免重复加载标志位
    delete targetProject._loadingModules
    targetProject.modules = []
    await loadProjectModules(targetProject)
  } catch (error) {
    console.error('刷新项目模块列表失败:', error)
  }
}

// 刷新模块的接口列表（保持折叠状态）
const refreshModuleApis = async (moduleId) => {
  if (!moduleId) {
    console.error('模块ID不能为空')
    return
  }
  
  try {
    // 查找对应的模块节点
    let targetModule = null
    projects.value.forEach(project => {
      if (project.modules) {
        const module = project.modules.find(m => m.module_id === moduleId)
        if (module) {
          targetModule = module
        }
        // 也检查子模块
        project.modules.forEach(m => {
          if (m.children) {
            const subModule = m.children.find(sm => sm.module_id === moduleId)
            if (subModule) {
              targetModule = subModule
            }
          }
        })
      }
    })
    
    if (!targetModule) {
      console.error('未找到模块节点')
      return
    }
    
    // 重新加载该模块的接口列表（强制刷新）
    await loadModuleApis(targetModule, true)
  } catch (error) {
    console.error('刷新模块接口列表失败:', error)
  }
}

// 更新当前选中的接口数据（保持折叠状态）
const updateCurrentApiData = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  if (selectedLevel.value === 'api' && selectedNode.value) {
    try {
      // 获取当前接口ID
      const apiId = selectedNode.value.api_id || selectedNode.value.id
      if (!apiId) {
        console.error('无法获取接口ID')
        return
      }
      
      // 调用API获取最新的接口详情
      const response = await getApiById(apiId)
      
      if (response.code === 1 && response.data) {
        const apiData = response.data
        const transformedApi = transformApi(apiData)
        
        // 保留关联数据（测试用例列表等）
        transformedApi.cases = selectedNode.value.cases || []
        
        // 在树结构中找到并更新对应的接口节点
        let found = false
        projects.value.forEach(project => {
          if (project.modules) {
            project.modules.forEach(module => {
              if (module.apis) {
                const apiIndex = module.apis.findIndex(api => 
                  (api.api_id || api.id) === apiId
                )
                if (apiIndex !== -1) {
                  // 更新树中的接口数据
                  Object.assign(module.apis[apiIndex], transformedApi)
                  // 更新当前选中的节点
                  selectedNode.value = module.apis[apiIndex]
                  found = true
                }
              }
            })
          }
        })
        
        if (!found) {
          console.warn('在项目树中未找到对应的接口节点')
        }
      } else {
        ElMessage.error(response.msg || '获取接口详情失败')
      }
    } catch (error) {
      console.error('更新接口数据失败:', error)
      ElMessage.error('更新接口数据失败')
    }
  }
}

// 刷新接口详情（当接口信息更新后）
const handleRefreshApi = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  // 只更新当前接口数据，不重新加载整个树，保持折叠状态
  await updateCurrentApiData()
}

/**
 * 删除接口
 */
const handleDeleteApi = async (apiId) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  try {
    console.log('=== 删除接口 ===')
    console.log('接口ID:', apiId)
    
    // 清空右侧详情页
    selectedNode.value = null
    selectedLevel.value = null
    
    // 等待 DOM 更新，确保右侧详情页被清空
    await nextTick()

    // 在树结构中找到并移除对应的接口节点（不重新加载，保持展开状态）
    let found = false
    projects.value.forEach(project => {
      if (project.modules) {
        project.modules.forEach(module => {
          if (module.apis && Array.isArray(module.apis)) {
            const apiIndex = module.apis.findIndex(api => 
              (api.api_id || api.id) === apiId
            )
            if (apiIndex !== -1) {
              console.log(`从模块 "${module.name}" 中移除接口，索引: ${apiIndex}`)
              // 从数组中移除该接口
              module.apis.splice(apiIndex, 1)
              found = true
            }
          }
        })
      }
    })
    
    if (found) {
      console.log('接口已从树中移除')
      ElMessage.success('接口已删除')
    } else {
      console.warn('在项目树中未找到对应的接口节点')
      ElMessage.warning('接口已删除，请刷新页面')
    }
  } catch (error) {
    console.error('删除接口处理失败:', error)
    ElMessage.error('删除接口处理失败')
  }
}

// 更新当前选中的用例数据
const updateCurrentTestCaseData = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  if (selectedLevel.value === 'case' && selectedNode.value) {
    try {
      // 获取当前用例的接口ID
      const apiId = selectedNode.value.api_id || selectedNode.value.apiId
      if (!apiId) {
        console.error('无法获取接口ID')
        return
      }
      
      // 重新加载该接口的测试用例数据
      const response = await getTestCasesByApi(apiId, { pageSize: 100 })
      
      if (response.code === 1) {
        const cases = response.data.items || []
        const transformedCases = cases.map(transformTestCase)
        
        // 找到当前选中的用例并更新
        const currentCase = transformedCases.find(c => 
          c.case_id === selectedNode.value.case_id || 
          c.id === selectedNode.value.id
        )
        
        if (currentCase) {
          // 更新当前选中的用例数据
          selectedNode.value = currentCase
          
          // 同时更新项目树中对应的用例数据
          projects.value.forEach(project => {
            project.modules?.forEach(module => {
              module.apis?.forEach(api => {
                if (api.api_id === apiId || api.id === apiId) {
                  api.cases = transformedCases
                }
              })
            })
          })
        }
      }
    } catch (error) {
      console.error('更新当前用例数据失败:', error)
      ElMessage.error('更新数据失败')
    }
  }
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
  console.log('=== 新建接口 ===')
  console.log('模块对象:', module)
  console.log('module_id:', module.module_id)
  console.log('moduleId:', module.moduleId)
  
  dialogType.value = 'api'
  isEdit.value = false
  resetForm()
  
  // 尝试多种方式获取模块ID
  const moduleId = module.module_id || module.moduleId || module.id
  console.log('最终使用的模块ID:', moduleId)
  
  if (!moduleId) {
    ElMessage.error('无法获取模块ID，请重试')
    return
  }
  
  formData.parentId = moduleId // 保存模块ID
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

// 打开环境配置对话框
const handleConfigEnvironment = async (project) => {
  envFormData.project_id = project.project_id
  currentEnvIndex.value = 0
  envActiveTab.value = 'basic'
  envDialogVisible.value = true
  
  // 从后端加载环境配置
  if (USE_REAL_API) {
    try {
      loading.value = true
      // 注意：后端接口可能不支持直接按项目查询，这里先查询所有环境
      const response = await getEnvironmentConfigList({
        pageSize: 100
      })
      
      if (response.code === 1 && response.data) {
        const environments = response.data.items || []
        // 转换为前端格式
        envFormData.environments = environments.map(transformEnvironmentConfig)
        
        if (envFormData.environments.length === 0) {
          // 如果没有环境配置，显示空状态
          envFormData.environments = []
          ElMessage.info('暂无环境配置，请创建新环境')
        } else {
          ElMessage.success(`加载了 ${envFormData.environments.length} 个环境配置`)
        }
      } else {
        ElMessage.warning('暂无环境配置，请创建新环境')
        envFormData.environments = []
      }
    } catch (error) {
      console.error('加载环境配置失败:', error)
      ElMessage.error('加载环境配置失败')
      // 显示空状态
      envFormData.environments = []
    } finally {
      loading.value = false
    }
  }
}

// 创建默认环境配置
const createDefaultEnvironment = () => {
  return {
    name: '开发环境',
    env_code: 'ENV_DEV_001',
    envCode: 'ENV_DEV_001',
    env_type: 'development',
    envType: 'development',
    base_url: 'https://dev.example.com',
    baseUrl: 'https://dev.example.com',
    port: '8080',
    domain: 'dev.example.com',
    protocol: 'https',
    description: '开发环境主要用于开发人员本地开发和单元测试',
    is_default: true,
    isDefault: true,
    status: 'active',
    dataConfigs: [],
    externalServices: [],
    envVariables: [],
    authType: 'bearer',
    authToken: '',
    authUsername: '',
    authPassword: '',
    apiKey: '',
    apiKeyHeader: 'X-API-Key',
    oauth2Config: '',
    debugMode: true,
    sslVerify: false,
    autoRetry: true,
    logging: true,
    monitoring: true,
    serverIp: '192.168.1.100',
    deployPath: '/var/www/app',
    containerId: 'docker-abc123',
    version: 'v1.2.3',
    deployTime: '2024-02-20 15:30:00',
    deployer: '张三',
    deployNote: '常规更新部署'
  }
}

// 添加环境
const handleAddEnvironment = () => {
  const newEnv = {
    name: `新环境 ${envFormData.environments.length + 1}`,
    env_code: `ENV_${Date.now()}`, // 生成唯一的环境编码
    envCode: `ENV_${Date.now()}`, // 生成唯一的环境编码
    env_type: 'development',
    envType: 'development',
    base_url: '',
    baseUrl: '',
    port: '8080',
    domain: '',
    protocol: 'https',
    description: '',
    is_default: false,
    isDefault: false,
    status: 'inactive',
    dataConfigs: [],
    externalServices: [],
    envVariables: [],
    authType: 'none',
    debugMode: false,
    sslVerify: true,
    autoRetry: false,
    logging: true,
    monitoring: true
  }
  
  envFormData.environments.push(newEnv)
  currentEnvIndex.value = envFormData.environments.length - 1
  ElMessage.success('环境已添加，请配置基本信息')
}

// 删除环境
const handleRemoveEnvironment = async (index) => {
  if (envFormData.environments.length <= 1) {
    ElMessage.warning('至少保留一个环境配置')
    return
  }
  
  const env = envFormData.environments[index]
  
  // 检查是否是未保存的环境
  if (!env.env_id && !env.envId) {
    ElMessage.warning('未保存的环境不能删除，请先保存环境配置')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除环境 "${env.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 如果环境有ID，调用后端删除接口
    if (USE_REAL_API && (env.env_id || env.envId)) {
      try {
        const envId = env.env_id || env.envId
        console.log('=== 删除环境配置 ===')
        console.log('环境ID:', envId)
        console.log('环境名称:', env.name)
        
        const response = await deleteEnvironmentConfig(envId)
        
        if (response.code === 1) {
          // 从列表中移除
          envFormData.environments.splice(index, 1)
          if (currentEnvIndex.value >= envFormData.environments.length) {
            currentEnvIndex.value = envFormData.environments.length - 1
          }
          ElMessage.success('环境已删除')
        } else {
          handleAPIError(response, `删除环境 "${env.name}"`)
        }
      } catch (error) {
        handleAPIError(error, `删除环境 "${env.name}"`)
      }
    } else {
      // 未保存的新环境，直接从列表中移除
      envFormData.environments.splice(index, 1)
      if (currentEnvIndex.value >= envFormData.environments.length) {
        currentEnvIndex.value = envFormData.environments.length - 1
      }
      ElMessage.success('环境已删除')
    }
  } catch (error) {
    // 用户取消
  }
}

// 批量删除环境配置
const handleBatchDeleteEnvironments = async () => {
  if (envFormData.environments.length <= 1) {
    ElMessage.warning('至少保留一个环境配置')
    return
  }
  
  // 过滤出非默认环境
  const nonDefaultEnvs = envFormData.environments.filter(env => !env.is_default)
  
  if (nonDefaultEnvs.length === 0) {
    ElMessage.warning('没有可删除的环境（默认环境不能删除）')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${nonDefaultEnvs.length} 个环境配置吗？\n\n将被删除的环境：\n${nonDefaultEnvs.map(env => `• ${env.name}`).join('\n')}`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        message: `
          <div>
            <p>确定要删除 <strong>${nonDefaultEnvs.length}</strong> 个环境配置吗？</p>
            <div style="margin: 12px 0; padding: 8px; background: #f5f7fa; border-radius: 4px;">
              <div style="font-weight: 500; margin-bottom: 8px;">将被删除的环境：</div>
              ${nonDefaultEnvs.map(env => `<div style="color: #606266;">• ${env.name}</div>`).join('')}
            </div>
            <p style="color: #e6a23c; font-size: 12px;">
              ⚠️ 注意：此操作不可撤销
            </p>
          </div>
        `
      }
    )
    
    let successCount = 0
    let failCount = 0
    
    // 逐个删除环境
    for (let i = envFormData.environments.length - 1; i >= 0; i--) {
      const env = envFormData.environments[i]
      
      // 跳过默认环境
      if (env.is_default) {
        continue
      }
      
      try {
        if (USE_REAL_API && (env.env_id || env.envId)) {
          const envId = env.env_id || env.envId
          const response = await deleteEnvironmentConfig(envId)
          
          if (response.code === 1) {
            envFormData.environments.splice(i, 1)
            successCount++
          } else {
            handleAPIError(response, `删除环境 "${env.name}"`)
            failCount++
          }
        } else {
          // 演示模式，直接删除
          envFormData.environments.splice(i, 1)
          successCount++
        }
      } catch (error) {
        handleAPIError(error, `删除环境 "${env.name}"`)
        failCount++
      }
    }
    
    // 调整当前选中的环境索引
    if (currentEnvIndex.value >= envFormData.environments.length) {
      currentEnvIndex.value = envFormData.environments.length - 1
    }
    
    // 显示结果
    if (successCount > 0 && failCount === 0) {
      ElMessage.success(`已删除 ${successCount} 个环境配置`)
    } else if (successCount > 0 && failCount > 0) {
      ElMessage.warning(`部分环境删除成功（成功${successCount}个，失败${failCount}个）`)
    } else {
      ElMessage.error('环境删除失败')
    }
    
  } catch (error) {
    // 用户取消
  }
}

// 编辑环境名称
const handleEditEnvironmentName = () => {
  ElMessageBox.prompt('请输入环境名称', '编辑环境', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: currentEnvironment.value.name,
    inputValidator: (value) => {
      if (!value) {
        return '环境名称不能为空'
      }
      return true
    }
  }).then(({ value }) => {
    currentEnvironment.value.name = value
    ElMessage.success('环境名称已更新')
  }).catch(() => {
    // 用户取消
  })
}

// 设置默认环境
const handleSetDefaultEnvironment = (index) => {
  envFormData.environments.forEach((env, i) => {
    env.is_default = i === index
  })
  ElMessage.success(`已将 "${envFormData.environments[index].name}" 设为默认环境`)
}

// 保存环境配置
const handleSaveEnvironments = async () => {
  // 验证表单
  const hasEmpty = envFormData.environments.some(env => 
    !env.name || 
    !env.base_url || 
    !env.env_code
  )
  if (hasEmpty) {
    ElMessage.error('请填写完整的环境配置信息（环境编码、环境名称和Base URL为必填项）')
    return
  }
  
  if (USE_REAL_API) {
    try {
      loading.value = true
      let successCount = 0
      let failCount = 0
      
      // 逐个保存或更新环境配置
      for (const env of envFormData.environments) {
        try {
          // 转换为后端格式
          const backendData = transformEnvironmentConfigToBackend(env)
          
          if (env.env_id || env.envId) {
            // 更新已存在的环境
            const envId = env.env_id || env.envId
            const response = await updateEnvironmentConfig(envId, backendData)
            
            if (response.code === 1) {
              successCount++
              console.log(`环境 "${env.name}" 更新成功`)
            } else {
              failCount++
              console.error(`环境 "${env.name}" 更新失败:`, response.msg)
            }
          } else {
            // 创建新环境
            const response = await createEnvironmentConfig(backendData)
            
            if (response.code === 1) {
              successCount++
              // 更新环境ID
              if (response.data) {
                env.env_id = response.data.envId || response.data.env_id
                env.envId = response.data.envId || response.data.env_id
              }
              console.log(`环境 "${env.name}" 创建成功`)
            } else {
              failCount++
              handleAPIError(response, `环境 "${env.name}" 创建`)
            }
          }
        } catch (error) {
          failCount++
          handleAPIError(error, `保存环境 "${env.name}"`)
        }
      }
      
      // 显示结果
      if (successCount > 0 && failCount === 0) {
        ElMessage.success(`环境配置已保存（${successCount}个）`)
        envDialogVisible.value = false
      } else if (successCount > 0 && failCount > 0) {
        ElMessage.warning(`部分环境配置保存成功（成功${successCount}个，失败${failCount}个）`)
      } else {
        ElMessage.error('环境配置保存失败')
      }
    } catch (error) {
      console.error('保存环境配置失败:', error)
      ElMessage.error('保存环境配置失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  } else {
    ElMessage.success('环境配置已保存（演示模式）')
    envDialogVisible.value = false
  }
}

// 添加数据配置项
const handleAddDataConfig = () => {
  if (!currentEnvironment.value.dataConfigs) {
    currentEnvironment.value.dataConfigs = []
  }
  currentEnvironment.value.dataConfigs.push({
    name: '',
    value: '',
    description: ''
  })
}

// 删除数据配置项
const handleRemoveDataConfig = (index) => {
  currentEnvironment.value.dataConfigs.splice(index, 1)
}

// 添加外部服务
const handleAddExternalService = () => {
  if (!currentEnvironment.value.externalServices) {
    currentEnvironment.value.externalServices = []
  }
  currentEnvironment.value.externalServices.push({
    name: '',
    type: 'database',
    url: '',
    status: 'disconnected'
  })
}

// 删除外部服务
const handleRemoveExternalService = (index) => {
  currentEnvironment.value.externalServices.splice(index, 1)
}

// 添加环境变量
const handleAddEnvVariable = () => {
  if (!currentEnvironment.value.envVariables) {
    currentEnvironment.value.envVariables = []
  }
  currentEnvironment.value.envVariables.push({
    key: '',
    value: '',
    description: ''
  })
}

// 删除环境变量
const handleRemoveEnvVariable = (index) => {
  currentEnvironment.value.envVariables.splice(index, 1)
}

// 删除
const handleDelete = async (node) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
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
  try {
    await ElMessageBox.confirm(`确定要删除模块 "${module.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true,
      message: `
        <div>
          <p>确定要删除模块 <strong>${module.name}</strong> 吗？</p>
          <p style="color: #e6a23c; font-size: 12px; margin-top: 8px;">
            ⚠️ 注意：如果模块下存在子模块或接口，将无法删除
          </p>
        </div>
      `
    })
    
    if (USE_REAL_API) {
      const moduleId = module.module_id || module.moduleId || module.id
      console.log('=== 删除模块 ===')
      console.log('模块ID:', moduleId)
      console.log('模块名称:', module.name)
      
      const response = await deleteModule(moduleId)
      
      if (response.code === 1) {
        // 清空选中状态（如果删除的是当前选中的模块）
        if (selectedLevel.value === 'module' && 
            (selectedNode.value?.module_id === moduleId || selectedNode.value?.id === moduleId)) {
          selectedNode.value = null
          selectedLevel.value = null
        }
        
        // 等待 DOM 更新
        await nextTick()
        
        // 在树结构中找到并移除对应的模块节点（不重新加载，保持展开状态）
        let found = false
        projects.value.forEach(project => {
          if (project.modules && Array.isArray(project.modules)) {
            // 检查一级模块
            const moduleIndex = project.modules.findIndex(m => 
              (m.module_id || m.moduleId || m.id) === moduleId
            )
            if (moduleIndex !== -1) {
              console.log(`从项目 "${project.name}" 中移除模块，索引: ${moduleIndex}`)
              // 从数组中移除该模块
              project.modules.splice(moduleIndex, 1)
              found = true
            } else {
              // 检查子模块（二级模块）
              project.modules.forEach(parentModule => {
                if (parentModule.children && Array.isArray(parentModule.children)) {
                  const subModuleIndex = parentModule.children.findIndex(sm => 
                    (sm.module_id || sm.moduleId || sm.id) === moduleId
                  )
                  if (subModuleIndex !== -1) {
                    console.log(`从父模块 "${parentModule.name}" 中移除子模块，索引: ${subModuleIndex}`)
                    // 从数组中移除该子模块
                    parentModule.children.splice(subModuleIndex, 1)
                    found = true
                  }
                }
              })
            }
          }
        })
        
        if (found) {
          console.log('模块已从树中移除')
          ElMessage.success('模块删除成功')
        } else {
          console.warn('在项目树中未找到对应的模块节点')
          ElMessage.warning('模块已删除，请刷新页面')
        }
      } else {
        ElMessage.error(response.msg || '删除模块失败')
      }
    } else {
      ElMessage.success('删除成功（演示模式）')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模块失败:', error)
      ElMessage.error(error.msg || error.message || '删除模块失败')
    }
  }
}

const handleDeleteChild = async (child) => {
  handleDelete(child)
}

const handleEditCase = (testCase) => {
  dialogType.value = 'case'
  isEdit.value = true
  
  // 处理前置条件（JSON对象转字符串）
  let preConditionsStr = ''
  if (testCase.pre_conditions || testCase.preConditions) {
    const preConditions = testCase.pre_conditions || testCase.preConditions
    preConditionsStr = typeof preConditions === 'string' 
      ? preConditions 
      : JSON.stringify(preConditions, null, 2)
  }
  
  // 处理请求参数覆盖（JSON对象转字符串）
  let requestOverrideStr = ''
  let overrideQueryParams = []
  let overridePathParams = []
  let overrideHeaders = []
  let overrideBody = ''
  
  if (testCase.request_override || testCase.requestOverride) {
    const requestOverride = testCase.request_override || testCase.requestOverride
    if (typeof requestOverride === 'string') {
      requestOverrideStr = requestOverride
      // 尝试解析为对象以便填充可视化字段
      try {
        const parsed = JSON.parse(requestOverride)
        if (parsed.queryParams) overrideQueryParams = parsed.queryParams
        if (parsed.pathParams) overridePathParams = parsed.pathParams
        if (parsed.headers) {
          overrideHeaders = Object.entries(parsed.headers).map(([name, value]) => ({ name, value }))
        }
        if (parsed.body) {
          // 清理 body 中的不可见字符
          const bodyStr = typeof parsed.body === 'string' ? parsed.body : JSON.stringify(parsed.body, null, 2)
          overrideBody = bodyStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
          // 尝试重新解析，确保 JSON 格式正确
          try {
            JSON.parse(overrideBody)
          } catch (e) {
            // 如果清理后不是有效 JSON，保持原样
            overrideBody = bodyStr
          }
        }
      } catch (e) {
        console.error('解析request_override失败:', e)
      }
    } else if (typeof requestOverride === 'object') {
      // 对象形式
      if (requestOverride.queryParams) overrideQueryParams = requestOverride.queryParams
      if (requestOverride.pathParams) overridePathParams = requestOverride.pathParams
      if (requestOverride.headers) {
        overrideHeaders = Object.entries(requestOverride.headers).map(([name, value]) => ({ name, value }))
      }
      if (requestOverride.body) {
        // 清理 body 中的不可见字符
        const bodyStr = typeof requestOverride.body === 'string' ? requestOverride.body : JSON.stringify(requestOverride.body, null, 2)
        overrideBody = bodyStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
        try {
          JSON.parse(overrideBody)
        } catch (e) {
          overrideBody = bodyStr
        }
      }
      requestOverrideStr = JSON.stringify(requestOverride, null, 2)
    }
  }
  
  // 处理预期响应体（JSON对象转字符串）
  let expectedResponseBody = ''
  if (testCase.expected_response_body || testCase.expectedResponseBody) {
    const responseBody = testCase.expected_response_body || testCase.expectedResponseBody
    expectedResponseBody = typeof responseBody === 'string' 
      ? responseBody 
      : JSON.stringify(responseBody, null, 2)
  }
  
  // 处理响应Schema（JSON对象转字符串）
  let expectedResponseSchemaStr = ''
  if (testCase.expected_response_schema || testCase.expectedResponseSchema) {
    const responseSchema = testCase.expected_response_schema || testCase.expectedResponseSchema
    expectedResponseSchemaStr = typeof responseSchema === 'string' 
      ? responseSchema 
      : JSON.stringify(responseSchema, null, 2)
  }
  
  // 深拷贝数组字段，避免直接修改原始数据
  const testSteps = testCase.test_steps || testCase.testSteps || []
  const tags = testCase.tags || []
  const assertions = testCase.assertions || []
  const extractors = testCase.extractors || []
  const validators = testCase.validators || []
  
  // 赋值表单数据
  Object.assign(formData, {
    id: testCase.id,
    case_id: testCase.case_id || testCase.caseId,
    api_id: testCase.api_id || testCase.apiId,
    name: testCase.name || '',
    case_code: testCase.case_code || testCase.caseCode || '',
    description: testCase.description || '',
    priority: testCase.priority || 'P2',
    severity: testCase.severity || 'medium',
    tags: JSON.parse(JSON.stringify(tags)), // 深拷贝
    version: testCase.version || '1.0',
    is_enabled: testCase.is_enabled !== undefined ? testCase.is_enabled : 
                (testCase.isEnabled !== undefined ? testCase.isEnabled : true),
    is_template: testCase.is_template || testCase.isTemplate || false,
    template_id: testCase.template_id || testCase.templateId || null,
    
    // 测试步骤（深拷贝）
    test_steps: JSON.parse(JSON.stringify(testSteps)),
    
    // 前置条件和请求参数（转换为字符串）
    pre_conditions_str: preConditionsStr,
    request_override_str: requestOverrideStr,
    // 请求参数覆盖 - 可视化编辑器字段
    override_query_params: overrideQueryParams,
    override_path_params: overridePathParams,
    override_headers: overrideHeaders,
    override_body: overrideBody,
    
    // 预期响应
    expected_http_status: testCase.expected_http_status || testCase.expectedHttpStatus || 200,
    expected_response_body: expectedResponseBody,
    expected_response_schema_str: expectedResponseSchemaStr,
    
    // 断言和提取器（深拷贝）
    assertions: JSON.parse(JSON.stringify(assertions)),
    extractors: JSON.parse(JSON.stringify(extractors)),
    validators: JSON.parse(JSON.stringify(validators)),
    
    // 兼容旧字段
    request_params: testCase.request_params || '',
    expected_status_code: testCase.expected_status_code || 200,
    validation_rules: testCase.validation_rules || ''
  })
  
  // 重置到基本信息标签页
  caseFormActiveTab.value = 'basic'
  
  dialogVisible.value = true
}

const handleDeleteCase = async (testCase) => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  try {
    if (USE_REAL_API) {
      // 保存当前状态信息
      const currentApiId = testCase?.api_id || testCase?.apiId
      const currentCaseIndex = testCase?.index || 0
      
      // 调用真实API删除
      const response = await deleteTestCase(testCase?.case_id || testCase?.caseId || testCase?.id)
      
      if (response.code === 1) {
        ElMessage.success('测试用例删除成功')
        
        // 不重新加载整个项目树，只更新当前接口的测试用例数据
        if (currentApiId) {
          // 重新加载该接口的测试用例数据
          const casesResponse = await getTestCasesByApi(currentApiId, { pageSize: 100 })
          
          if (casesResponse.code === 1) {
            const cases = casesResponse.data.items || []
            const transformedCases = cases.map(transformTestCase)
            
            // 更新项目树中对应的用例数据
            projects.value.forEach(project => {
              project.modules?.forEach(module => {
                module.apis?.forEach(api => {
                  if (api.api_id === currentApiId || api.id === currentApiId) {
                    api.cases = transformedCases
                  }
                })
              })
            })
            
            // 选中相邻的测试用例
            if (transformedCases.length > 0) {
              const nextCaseIndex = Math.min(currentCaseIndex, transformedCases.length - 1)
              const nextCase = transformedCases[nextCaseIndex]
              
              if (nextCase) {
                // 选中相邻的测试用例
                selectedNode.value = nextCase
                selectedLevel.value = 'case'
              } else {
                // 如果没有相邻的测试用例，选中父级接口
                projects.value.forEach(project => {
                  project.modules?.forEach(module => {
                    module.apis?.forEach(api => {
                      if (api.api_id === currentApiId || api.id === currentApiId) {
                        selectedNode.value = api
                        selectedLevel.value = 'api'
                      }
                    })
                  })
                })
              }
            } else {
              // 如果没有测试用例了，选中父级接口
              projects.value.forEach(project => {
                project.modules?.forEach(module => {
                  module.apis?.forEach(api => {
                    if (api.api_id === currentApiId || api.id === currentApiId) {
                      selectedNode.value = api
                      selectedLevel.value = 'api'
                    }
                  })
                })
              })
            }
          }
        }
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } else {
      // 从假数据中删除用例
      projects.value.forEach(project => {
        project.modules?.forEach(module => {
          module.apis?.forEach(api => {
            const index = api.cases?.findIndex(c => c.id === testCase.id)
            if (index !== undefined && index > -1) {
              api.cases.splice(index, 1)
              
              // 尝试选中相邻的测试用例
              if (api.cases.length > 0) {
                const nextCaseIndex = Math.min(index, api.cases.length - 1)
                const nextCase = api.cases[nextCaseIndex]
                
                if (nextCase) {
                  selectedNode.value = nextCase
                  selectedLevel.value = 'case'
                } else {
                  selectedNode.value = api
                  selectedLevel.value = 'api'
                }
              } else {
                selectedNode.value = api
                selectedLevel.value = 'api'
              }
            }
          })
        })
      })
      
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除用例失败:', error)
    ElMessage.error('删除失败: ' + (error.message || '未知错误'))
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


// 复制用例
const handleCopyCase = (testCase) => {
  ElMessage.success('复制成功')
}

// 执行测试用例
const handleExecuteCase = (testCase) => {
  // 设置选中的节点为当前测试用例
  selectedNode.value = testCase
  selectedLevel.value = 'case'
  // 打开执行测试对话框
  executeDialogVisible.value = true
}

// 刷新测试用例（执行测试后）
const handleRefreshTestCase = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  try {
    // 执行历史由 CaseDetail 组件自己负责刷新
    // 这里不需要手动刷新执行历史

    // 如果需要刷新用例列表中的状态
    // 可以重新加载整个接口的用例列表

    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新失败:', error)
  }
}

// 保存
const handleSave = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
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
    // 获取项目ID（创建时是parentId，编辑时是project_id）
    const projectId = formData.parentId || formData.project_id
    
    if (isEdit.value) {
      await updateModule(formData.module_id, data)
      // 更新后只刷新当前项目的模块数据，保持展开状态
      await refreshProjectModules(projectId)
    } else {
      const response = await createModule(projectId, data)
      console.log('创建模块响应:', response)
      
      if (response.code === 1) {
        // 创建成功后，重新加载当前项目的模块列表
        await refreshProjectModules(projectId)
      }
    }
  } else if (dialogType.value === 'api') {
    if (isEdit.value) {
      await updateApi(formData.api_id, data)
      // 更新后只刷新当前接口数据，保持展开状态
      await updateCurrentApiData()
    } else {
      // 创建接口
      console.log('=== 准备创建接口 ===')
      console.log('模块ID (formData.parentId):', formData.parentId)
      console.log('转换后的数据:', data)
      
      if (!formData.parentId) {
        ElMessage.error('模块ID不能为空，请重新打开对话框')
        return
      }
      
      const response = await createApi(formData.parentId, data)
      console.log('创建接口响应:', response)
      
      if (response.code === 1) {
        // 创建成功后，重新加载当前模块的接口列表
        await refreshModuleApis(formData.parentId)
      }
    }
  } else if (dialogType.value === 'case') {
    const apiId = getCurrentApiId()
    if (!apiId) {
      ElMessage.error('找不到关联的接口')
      return
    }
    
    // 添加api_id到数据中
    data.api_id = apiId
    
    if (isEdit.value) {
      await updateTestCase(formData.case_id, data)
    } else {
      await createTestCase(data)
    }
    
    // 智能更新数据，保持当前状态
    if (selectedLevel.value === 'api' && selectedNode.value) {
      // 在接口页面，只刷新测试用例数据
      await loadApiTestCases(selectedNode.value, true)
    } else if (selectedLevel.value === 'case' && selectedNode.value) {
      // 在用例页面，更新当前用例数据
      await updateCurrentTestCaseData()
    } else {
      // 在其他页面，重新加载项目树
      await loadProjectTree()
    }
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

// 执行测试相关函数
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return timeStr
  }
}

const formatVariables = () => {
  if (!executeVariables.value) return

  try {
    const parsed = JSON.parse(executeVariables.value)
    executeVariables.value = JSON.stringify(parsed, null, 2)
    variablesError.value = ''
    ElMessage.success('JSON格式化成功')
  } catch (error) {
    variablesError.value = 'JSON格式错误，请检查语法'
    ElMessage.error('JSON格式错误，无法格式化')
  }
}

// 监听执行变量变化，实时校验JSON格式
watch(executeVariables, (newVal) => {
  if (!newVal) {
    variablesError.value = ''
    return
  }

  try {
    JSON.parse(newVal)
    variablesError.value = ''
  } catch (error) {
    variablesError.value = 'JSON格式错误，请检查语法'
  }
})

const handleConfirmExecute = async () => {
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  try {
    executing.value = true

    // 解析执行变量
    let parsedVariables = {}
    if (executeVariables.value) {
      try {
        parsedVariables = JSON.parse(executeVariables.value)
      } catch (e) {
        ElMessage.error('执行变量必须是有效的JSON格式')
        executing.value = false
        return
      }
    }

    // 如果已有变量校验错误（watch 可能已设置），阻止提交
    if (variablesError.value) {
      ElMessage.error('执行变量 JSON 格式有误，请修正后重试')
      executing.value = false
      return
    }

    // 构建请求数据
    const requestData = {
      environment: executeFormData.environment,
      async: executeFormData.async
    }

    if (executeFormData.baseUrl) {
      requestData.base_url = executeFormData.baseUrl
    }

    if (executeFormData.timeout) {
      requestData.timeout = executeFormData.timeout
    }

    if (Object.keys(parsedVariables).length > 0) {
      requestData.variables = parsedVariables
    }

    // 调用执行API - 需要获取当前选中的用例ID
    const caseId = selectedNode.value?.case_id || selectedNode.value?.caseId || selectedNode.value?.id

    if (!caseId) {
      ElMessage.error('无法获取用例ID')
      executing.value = false
      return
    }

    const response = await executeTestCase(null, caseId, requestData)

    if (response.code === 1) {
      // 重置AI诊断状态
      showAIDiagnosis.value = false
      aiDiagnosisResult.value = null
      aiDiagnosisLoading.value = false
      
      if (requestData.async) {
        // 异步执行
        ElMessage.success(`测试任务已提交，任务ID: ${response.data.taskId || response.data.task_id}`)
        executeDialogVisible.value = false
      } else {
        // 同步执行 - 显示执行结果对话框
        // 单个测试用例执行返回的数据
        const isPassed = response.data.status === 'passed'
        executeResult.value = {
          // 基本信息
          executionId: response.data.executionId || response.data.execution_id,
          caseId: response.data.caseId || response.data.case_id,
          caseName: response.data.caseName || response.data.case_name,
          status: response.data.status,
          // 时间信息
          startTime: response.data.startTime || response.data.start_time,
          endTime: response.data.endTime || response.data.end_time,
          duration: response.data.duration || 0,
          durationSeconds: response.data.duration || 0,
          // 测试结果（单个用例）
          totalCases: 1,
          executedCases: 1,
          passedCases: isPassed ? 1 : 0,
          failedCases: isPassed ? 0 : 1,
          skippedCases: 0,
          successRate: isPassed ? 100 : 0,
          // 断言结果 - 连接失败时断言也算失败
          responseStatus: response.data.responseStatus || response.data.response_status,
          assertionsPassed: isPassed ? 1 : 0,
          assertionsFailed: isPassed ? 0 : 1,
          failureMessage: response.data.failureMessage || response.data.failure_message,
          failureType: response.data.failureType || response.data.failure_type,
          failureTrace: response.data.failureTrace || response.data.failure_trace,
          logsLink: response.data.logsLink || response.data.logs_link,
          reportId: response.data.reportId || response.data.report_id,
          reportName: response.data.reportName || response.data.report_name,
          assertionDetails: response.data.assertionDetails || response.data.assertion_details || [],
          responseBody: response.data.responseBody || response.data.response_body,
          responseHeaders: response.data.responseHeaders || response.data.response_headers,
          extractedVariables: response.data.extractedVariables || response.data.extracted_variables,
          // 额外信息
          environment: requestData.environment || 'dev',
          executionType: 'manual',
          scopeName: response.data.caseName || response.data.case_name || '单个测试用例'
        }

        executeDialogVisible.value = false
        resultDialogVisible.value = true
      }

      // 刷新执行历史（如果在用例详情页面）
      if (selectedLevel.value === 'case' && selectedNode.value) {
        // 这里可以触发CaseDetail组件刷新执行历史
        // emit('refresh-execution-history') 或类似的方法
      }
    } else {
      ElMessage.error(response.msg || '执行失败')
    }

  } catch (error) {
    console.error('执行测试失败:', error)
    ElMessage.error(error.msg || error.message || '执行测试失败，请稍后重试')
  } finally {
    executing.value = false
  }
}

// 查看执行日志
const handleViewLogs = () => {
  if (executeResult.value && executeResult.value.logsLink) {
    window.open(executeResult.value.logsLink, '_blank')
  } else {
    ElMessage.info('日志链接不可用')
  }
}

// 查看测试报告
const handleViewReport = () => {
  if (executeResult.value && executeResult.value.reportId) {
    ElMessage.info(`查看报告ID: ${executeResult.value.reportId}`)
    // TODO: 跳转到报告详情页面
    // router.push(`/reports/${executeResult.value.reportId}`)
  } else {
    ElMessage.info('报告不可用')
  }
}

// 从结果对话框重新测试
const handleRetestFromResult = () => {
  resultDialogVisible.value = false
  executeDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    description: '',
    url: '',
    method: 'GET',
    // 模块相关字段
    module_code: '',
    sort_order: 0,
    status: 'active',
    owner_id: null,
    // 用例相关字段
    case_code: '',
    priority: 'P2',
    severity: 'medium',
    tags: [],
    version: '1.0',
    is_enabled: true,
    is_template: false,
    template_id: null,
    // 测试步骤
    test_steps: [],
    // 前置条件和请求参数
    pre_conditions_str: '',
    request_override_str: '',
    // 请求参数覆盖 - 可视化编辑器用
    override_query_params: [],
    override_path_params: [],
    override_headers: [],
    override_body: '',
    // 预期响应
    expected_http_status: 200,
    expected_response_body: '',
    expected_response_schema_str: '',
    // 断言和提取器
    assertions: [],
    extractors: [],
    validators: [],
    // 兼容旧字段
    request_params: '',
    expected_status_code: 200,
    validation_rules: '',
    parentId: null
  })
  caseFormActiveTab.value = 'basic'
  formRef.value?.clearValidate()
  // clear cover preview when resetting
  coverPreview.value = null
  coverFile.value = null
}

// 测试步骤相关
const handleAddTestStep = () => {
  if (!formData.test_steps) {
    formData.test_steps = []
  }
  formData.test_steps.push({
    operation: '',
    expected: '',
    actual: ''
  })
}

const handleRemoveTestStep = (index) => {
  formData.test_steps.splice(index, 1)
}

// 断言相关
const handleAddAssertion = () => {
  if (!formData.assertions) {
    formData.assertions = []
  }
  formData.assertions.push({
    type: 'json_path',
    path: '',
    expected: ''
  })
}

const handleRemoveAssertion = (index) => {
  formData.assertions.splice(index, 1)
}

// 提取器相关
const handleAddExtractor = () => {
  if (!formData.extractors) {
    formData.extractors = []
  }
  formData.extractors.push({
    name: '',
    expression: '',
    description: ''
  })
}

const handleRemoveExtractor = (index) => {
  formData.extractors.splice(index, 1)
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
  // 如果组件已卸载，直接返回
  if (!isMounted.value) return
  
  loading.value = true
  try {
    let projectList = []
    
    // 非管理员用户只能看到自己所属的项目
    if (!userStore.isAdmin && currentUserId.value) {
      const userProjectsRes = await getUserProjects(currentUserId.value, { 
        page: 1, 
        pageSize: 100,
        status: 'active'
      })
      if (userProjectsRes.code === 1 && userProjectsRes.data?.items) {
        // 从返回数据中提取项目信息
        projectList = userProjectsRes.data.items.map(item => ({
          projectId: item.projectId,
          name: item.projectInfo?.name || item.projectName,
          description: item.projectInfo?.description || item.projectDescription,
          projectType: item.projectInfo?.projectType || item.projectType,
          status: item.projectInfo?.status || item.status,
          creatorId: item.projectInfo?.creatorId || item.creatorId,
          createdAt: item.projectInfo?.createdAt || item.createdAt,
          updatedAt: item.projectInfo?.updatedAt || item.updatedAt
        }))
      }
    } else {
      // 管理员可以看到所有项目
    const projectsRes = await getProjects({ pageSize: 100 })
      if (projectsRes.code === 1 && projectsRes.data?.items) {
        projectList = projectsRes.data.items
      }
    }
    
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    
    // 转换项目数据，但不加载子级数据
    projects.value = projectList.map(project => ({
      ...transformProject(project),
      project_id: project.projectId || project.project_id,
      modules: [] // 初始为空，按需加载
    }))
    
    ElMessage.success(`加载了 ${projectList.length} 个项目`)
  } catch (error) {
    // 检查组件是否仍然挂载
    if (!isMounted.value) return
    console.error('加载项目树失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 加载项目树
  if (USE_REAL_API) {
    await loadProjectTree()
  } else {
    initMockData()
  }

  // 数据加载完成后，延迟一帧触发页面进入动画
  await nextTick()
  setTimeout(() => {
    pageEntered.value = true
  }, 100)
})
</script>

<style scoped>
/* 请求参数覆盖样式 */
.override-section {
  margin-bottom: 16px;
}
.override-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

/* 错开动画样式 */
.stagger-item-sidebar {
  transform-origin: left center;
}

.stagger-item-main {
  transform-origin: right center;
}

.sidebar-wrapper,
.main-area-wrapper {
  height: 100%;
  overflow: hidden;
}

.cases-page {
  height: 100%;
  background: #f5f7fa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cases-container {
  display: flex;
  height: 100%;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 - 项目结构 */
.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
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
  flex-shrink: 0;
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
  color: #1890ff;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-toolbar {
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.toolbar-create-btn {
  flex: 1;
  padding: 8px 16px;
  background: #1890ff;
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
  color: #1890ff;
  border-color: #1890ff;
  background: #ecf5ff;
}

.icon-refresh {
  font-size: 18px;
}

.sidebar-search {
  padding: 12px;
  position: relative;
  flex-shrink: 0;
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
  border-color: #1890ff;
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
  overflow-x: hidden;
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
  will-change: transform, opacity;
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
  color: #1890ff;
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

/* 内容过渡动画容器 */
.content-transition-container {
  width: 100%;
  height: 100%;
}

/* 内容过渡动画 */
.content-transition-enter-active,
.content-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-transition-enter-from,
.content-transition-leave-to {
  opacity: 0;
}

.content-transition-enter-to,
.content-transition-leave-from {
  opacity: 1;
}

/* 项目/模块内容 - 从左侧滑入 */
.content-project {
  animation: slideInFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

/* 接口内容 - 从右侧滑入 */
.content-api {
  animation: slideInFromRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

/* 用例内容 - 从底部滑入 */
.content-case {
  animation: slideInFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

/* 空状态 - 淡入效果 */
.content-empty {
  animation: fadeInScale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

/* 动画定义 */
@keyframes slideInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 主内容区 */
.main-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: white;
  height: 100%;
}

.main-area::-webkit-scrollbar {
  width: 8px;
}

.main-area::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
}

.main-area::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.main-area::-webkit-scrollbar-track {
  background: #f5f7fa;
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

/* 环境配置对话框 */
.env-config-layout {
  display: flex;
  height: 620px;
  overflow: hidden;
  gap: 18px;
  padding: 18px;
  align-items: stretch;
  background: transparent;
}

/* dialog body wrapper customization for nicer card look */
.env-config-dialog .el-dialog__body {
  padding: 0;
  background: transparent;
}

/* make the whole dialog look like a card */
.env-config-dialog {
  --dialog-radius: 14px;
}
.env-config-dialog .el-dialog {
  border-radius: var(--dialog-radius);
  overflow: visible;
}


/* 左侧环境列表 */
.env-sidebar {
  width: 240px;
  border-radius: 12px;
  background: linear-gradient(180deg,#ffffff,#fbfdff);
  box-shadow: 0 12px 36px rgba(15,23,42,0.06);
  padding: 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(15,23,42,0.04);
}

.env-sidebar-header {
  padding: 10px;
  border-bottom: 1px solid transparent;
  display:flex;
  gap:8px;
  align-items:center;
}

.env-sidebar .env-sidebar-footer {
  padding: 12px;
  border-top: 1px dashed #eef3fb;
  margin-top: 8px;
  background: transparent;
  border-radius: 8px;
}

.env-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.env-search-input:focus {
  outline: none;
  border-color: #1890ff;
}

.env-search-input::placeholder {
  color: #c0c4cc;
}

.env-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.env-sidebar-list::-webkit-scrollbar {
  width: 4px;
}

.env-sidebar-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.env-sidebar-item {
  padding: 10px;
  margin-bottom: 6px;
  border-radius: 10px;
  transition: transform .14s ease, box-shadow .14s ease, background .12s;
  background: linear-gradient(180deg,#ffffff,#fcfeff);
  border: 1px solid rgba(15,23,42,0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.env-sidebar-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(15,23,42,0.06);
}

.env-sidebar-item:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.env-sidebar-item.is-active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.env-sidebar-item.is-active .env-item-name {
  color: white;
}

.env-sidebar-item.is-active .badge-text {
  color: #1890ff;
  background: white;
}

.env-item-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.env-item-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 6px;
}

.env-item-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.env-item-actions {
  margin-left: 8px;
  opacity: 1;
  transition: opacity 0.2s;
}

.env-sidebar-item:hover .env-item-actions {
  opacity: 1;
}

.env-item-actions .el-button {
  padding: 4px;
  min-height: auto;
}

.env-item-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f4ff;
  color: #1890ff;
  border-radius: 10px;
  font-size: 11px;
  margin-right: 6px;
}

.env-item-badge.active {
  background: #e1f3d8;
  color: #67c23a;
}

.badge-text {
  font-weight: 500;
}

.env-sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
}

.env-add-btn {
  width: 100%;
  padding: 8px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.env-add-btn:hover {
  background: #66b1ff;
}

/* 右侧环境详情 */
.env-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg,#ffffff,#fbfdff);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 36px rgba(15,23,42,0.06);
  overflow: hidden;
}

/* 环境配置空状态 */
.env-content-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.env-empty-content {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-large {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

/* 左侧环境列表空状态 */
.env-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.env-empty-state .empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.env-empty-state .empty-text {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.env-empty-state .empty-tip {
  font-size: 13px;
  color: #909399;
}

.env-content-header {
  padding: 12px 16px;
  border-bottom: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.env-content-header .env-actions { display:flex; gap:8px; align-items:center; }
.env-content-header .el-button { border-radius: 10px; }


.env-content-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.env-content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 环境标签页 */
.env-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  padding: 0 24px;
  overflow-x: auto;
}

.env-tabs::-webkit-scrollbar {
  height: 2px;
}

.env-tabs::-webkit-scrollbar-thumb {
  background: #dcdfe6;
}

.env-tab-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.env-tab-item:hover {
  color: #1890ff;
}

.env-tab-item.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

/* 标签页内容 */
.env-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.env-tab-content::-webkit-scrollbar {
  width: 6px;
}

.env-tab-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

/* Ensure charts inside environment dialog are constrained and scrollable */
.env-tab-content .chart-content,
.panel-body .chart-content {
  width: 100%;
  max-height: calc(80vh - 420px);
  height: auto;
  overflow: auto;
  min-height: 120px;
}

/* 表单区域 */
.env-form-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.form-label .required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* module edit dialog styles */
.module-edit-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}
.module-edit-left { min-width: 0; }
.module-edit-right { display:flex; flex-direction:column; gap:12px; }
.cover-area.small { padding:8px; border-radius:8px; border:1px dashed #eef3fb; background:#fbfdff; display:flex; flex-direction:column; align-items:center; gap:8px; }
.cover-preview { width:72px; height:72px; border-radius:8px; background-size:cover; background-position:center; box-shadow:0 6px 18px rgba(15,23,42,0.06); }
.cover-placeholder { width:72px; height:72px; border-radius:8px; background:linear-gradient(90deg,#eef3fb,#f8fbff); display:flex; align-items:center; justify-content:center; color:#6b7280; font-weight:600; }
.cover-actions { display:flex; gap:8px; align-items:center; }

@media (max-width:900px) {
  .module-edit-grid { grid-template-columns: 1fr; }
  .module-edit-right { order:-1; }
}

/* 状态指示行 */
.env-status-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.status-label {
  font-size: 12px;
  color: #909399;
}

.status-value {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  margin-left: auto;
}

/* 对话框底部 */
.env-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.env-footer-left {
  display: flex;
  gap: 8px;
}

.env-footer-right {
  display: flex;
  gap: 12px;
}

/* 表格配置区域 */
.env-config-table-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.config-table {
  width: 100%;
}

.config-table :deep(.el-input__inner) {
  border: none;
  background: transparent;
}

.config-table :deep(.el-input__inner:focus) {
  border: 1px solid #1890ff;
  background: white;
}

.config-table :deep(.el-select) {
  width: 100%;
}

/* 功能开关区域 */
.env-switches-section {
  display: flex;
  flex-direction: column;
}

.switch-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.switch-info {
  flex: 1;
}

.switch-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.switch-desc {
  font-size: 13px;
  color: #909399;
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

/* 用例表单样式 */
.case-form-tabs {
  margin: -10px -20px 0 -10px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.case-form-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 20px;
  /* background: #fafafa; */
  flex-shrink: 0;
}

.case-form-tabs :deep(.el-tabs__content) {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  max-height: 520px;
}

.case-form-tabs :deep(.el-tabs__content)::-webkit-scrollbar {
  width: 6px;
}

.case-form-tabs :deep(.el-tabs__content)::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.case-form-tabs :deep(.el-tabs__content)::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

/* 测试步骤编辑 */
.test-steps-section {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.steps-header,
.assertions-header,
.extractors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.steps-title,
.assertions-title,
.extractors-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.step-item-edit {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
}

.step-item-edit:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 4px;
}

.step-content-edit {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-input {
  width: 100%;
}

/* 断言编辑 */
.assertions-section {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.assertions-list {
  margin-bottom: 12px;
}

.assertion-item-edit {
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
}

.assertion-item-edit:last-child {
  margin-bottom: 0;
}

.assertion-form {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 提取器编辑 */
.extractors-section {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.extractors-list-edit {
  margin-bottom: 16px;
}

.extractor-item-edit {
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
}

.extractor-item-edit:last-child {
  margin-bottom: 0;
}

.extractor-form {
  display: flex;
  align-items: center;
  gap: 12px;
}

.extractor-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

/* 编辑对话框样式优化（圆角、阴影、动画） */
.case-edit-dialog {
  --dialog-radius: 14px;
  --dialog-shadow: 0 24px 60px rgba(16,24,40,0.12);
}

.case-edit-dialog :deep(.el-dialog) {
  border-radius: var(--dialog-radius);
  box-shadow: var(--dialog-shadow);
  overflow: hidden;
  transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease;
  animation: dialogPop .18s cubic-bezier(.2,.8,.2,1) both;
}

.case-edit-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg, #f7fbff 0%, #ffffff 100%);
  border-bottom: 1px solid #eef6ff;
  padding: 14px 24px;
}

.case-edit-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

@keyframes dialogPop {
  0% { transform: translateY(-6px) scale(.995); opacity: 0; }
  60% { transform: translateY(0) scale(1.02); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* Tabs inside edit dialog */
.case-edit-dialog .case-form-tabs {
  background: transparent;
}
.case-edit-dialog .case-form-tabs .el-tabs__header {
  margin-bottom: 12px;
}
.case-edit-dialog .el-tab-pane {
  background: transparent;
  padding: 8px 0 0 0;
}

/* Group form items into subtle cards for better visual separation */
.case-edit-dialog .form-section {
  background: #fff;
  border: 1px solid #eef6ff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 8px 24px rgba(16,24,40,0.04);
  transition: transform .18s ease, box-shadow .18s ease;
}
.case-edit-dialog .form-section:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 46px rgba(16,24,40,0.06);
}

/* Header inside edit dialog */
.case-edit-dialog .case-edit-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding: 12px 8px;
  background: linear-gradient(90deg,#fbfdff 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid #eef6ff;
}
.case-edit-dialog .case-edit-header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef9ff;
  border-radius: 8px;
}
.case-edit-dialog .case-edit-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}
.case-edit-dialog .case-edit-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #6b7280;
}

/* Make input prefixes slightly muted and aligned */
.case-edit-dialog :deep(.el-input__prefix) {
  color: #909399;
  margin-right: 6px;
}
/* Make form labels slightly stronger and inputs comfortable */
.case-edit-dialog :deep(.el-form-item__label) {
  font-weight: 600;
  color: #334155;
}
.case-edit-dialog :deep(.el-input__inner),
.case-edit-dialog :deep(.el-select .el-input__inner),
.case-edit-dialog :deep(.el-textarea__inner) {
  border-radius: 8px;
  background: #fbfdff;
  border: 1px solid #e6f0ff;
  transition: box-shadow .12s ease;
}
.case-edit-dialog :deep(.el-input__inner:focus),
.case-edit-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 10px 30px rgba(64,158,255,0.06);
}

/* Dialog footer buttons */
.case-edit-dialog :deep(.dialog-footer) {
  padding: 14px 24px;
  border-top: 1px solid #f0f6ff;
  background: linear-gradient(90deg,#ffffff 0%, #fbfdff 100%);
}
.case-edit-dialog :deep(.dialog-footer .el-button) {
  border-radius: 8px;
  transition: transform .12s ease, box-shadow .12s ease;
}
.case-edit-dialog :deep(.dialog-footer .el-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(16,24,40,0.06);
}

/* 执行对话框样式优化 */
.execute-dialog .el-dialog__body {
  padding: 0;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.execute-content {
  padding: 24px;
}

/* 执行头部区域 */
.execute-header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #e3f2fd;
}

.execute-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #1890ff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.execute-header-info {
  flex: 1;
}

.execute-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.execute-subtitle {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

/* 表单区域 */
.execute-form-section {
  margin-bottom: 24px;
}

.execute-form {
  background: #fafbfc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.execute-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.execute-form .full-width {
  grid-column: 1 / -1;
}

/* 表单项对齐：将 el-form-item 布局为两列（label + control），防止内容混乱与遮挡 */
.execute-form .el-form-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-column-gap: 12px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.execute-form .el-form-item__label {
  justify-self: end;
  padding-right: 6px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.execute-form .el-form-item__content {
  width: 100%;
  min-width: 0;
}

.execute-form .full-width .el-form-item__label,
.execute-form .full-width .el-form-item__content {
  grid-column: auto / span 2;
}

/* 确保表单控件不会撑出列宽，显示省略或换行处理 */
.execute-form .el-input,
.execute-form .el-select,
.execute-form .el-input-number,
.execute-form .el-radio-group,
.execute-form .el-input__inner {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.execute-form .el-select .el-input__inner,
.execute-form .el-input .el-input__inner {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* 将提示信息强制放到控件列，避免被遮挡 */
.execute-form .form-tip,
.execute-form .variables-hint,
.execute-form .variables-error {
  grid-column: 2 / 3;
  margin-top: 8px;
}

/* 修复输入控件在 CSS Grid 中的溢出问题：允许子项收缩、输入撑满父容器 */
.execute-form-grid > * {
  min-width: 0;
}

.execute-form .el-form-item {
  width: 100%;
  box-sizing: border-box;
}

.execute-form .el-form-item .el-input,
.execute-form .el-form-item .el-select,
.execute-form .el-form-item .el-input-number,
.execute-form .el-form-item .el-radio-group,
.execute-form .el-form-item .el-input__inner {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
  word-break: break-word;
  overflow: hidden;
}

.execute-form .el-select .el-input__inner,
.execute-form .el-input .el-input__inner {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.form-item-enhanced .el-form-item__label {
  font-weight: 500;
  color: #303133;
  padding-bottom: 4px;
}

.enhanced-input .el-input__prefix,
.enhanced-select .el-input__prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  color: #909399;
}

.enhanced-input .el-input__inner,
.enhanced-select .el-input__inner {
  border-radius: 6px;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.option-desc {
  font-size: 12px;
  color: #909399;
}

/* 执行模式选择 */
.execution-mode-group {
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
}

.mode-option {
  flex: 1;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 56px;
}

.mode-option:hover {
  border-color: #1890ff;
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.mode-option .el-radio__input.is-checked + .el-radio__label {
  color: #1890ff;
}

.mode-option .el-radio__input.is-checked .el-radio__inner {
  background: #1890ff;
  border-color: #1890ff;
  animation: radioCheckPulse 0.25s ease;
}

@keyframes radioCheckPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.mode-radio {
  width: 100%;
  margin-right: 0 !important;
}

.mode-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.mode-icon {
  color: #1890ff;
  font-size: 20px;
  flex-shrink: 0;
}

.mode-text {
  flex: 1;
}

.mode-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
}

/* 超时时间输入 */
.timeout-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeout-input {
  flex: 1;
}

.timeout-unit {
  color: #909399;
  font-size: 14px;
  font-weight: 500;
}

/* 表单提示信息 */
.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.form-tip .tip-icon {
  font-size: 14px;
  color: #e6a23c;
}

/* 变量配置区域 */
.variables-container {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
}

.variables-container:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.variables-container:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.variables-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.variables-icon {
  color: #1890ff;
  font-size: 16px;
}

.variables-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.format-btn {
  margin-left: auto;
  color: #1890ff;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.format-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.format-btn:hover::before {
  width: 120px;
  height: 120px;
}

.format-btn:hover {
  color: #337ecc;
  transform: translateY(-1px);
}

.variables-textarea .el-textarea__inner {
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
  border: none;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.variables-textarea .el-textarea__inner:focus {
  background: white;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.variables-hint,
.variables-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
  padding: 4px 0;
}

.variables-hint {
  color: #909399;
}

.variables-hint .hint-icon {
  color: #67c23a;
}

.variables-error {
  color: #f56c6c;
}

.variables-error .error-icon {
  color: #f56c6c;
}

/* 执行对话框底部 */
.execute-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
}

.footer-left {
  display: flex;
  gap: 8px;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.execute-btn {
  min-width: 120px;
}

/* 执行结果对话框样式 */
.execution-result-container {
  padding: 0;
}

.result-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.result-banner.status-passed {
  background: linear-gradient(135deg, #e8f8e8 0%, #d4f4d4 100%);
  border: 2px solid #67c23a;
}

.result-banner.status-failed {
  background: linear-gradient(135deg, #ffe8e8 0%, #ffd4d4 100%);
  border: 2px solid #f56c6c;
}

.result-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.result-banner.status-passed::before {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.result-banner.status-failed::before {
  background: linear-gradient(90deg, #f56c6c, #f78989);
}

.banner-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: bannerPop .4s cubic-bezier(.2,.8,.2,1) both;
}

.banner-icon-wrapper.passed {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(103, 194, 58, 0.3);
}

.banner-icon-wrapper.failed {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(245, 108, 108, 0.3);
}

.banner-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  margin: 0 0 10px 0;
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  letter-spacing: -0.5px;
}

.result-subtitle {
  margin: 0;
}

.banner-badge {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.banner-badge.passed {
  background: rgba(103, 194, 58, 0.15);
  color: #67c23a;
}

.banner-badge.failed {
  background: rgba(245, 108, 108, 0.15);
  color: #f56c6c;
}

/* 结果横幅图标入场动画 */
@keyframes bannerPop {
  0% { transform: scale(.5); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* 报告名称编辑区域 */
.report-name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.report-name-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.report-name-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.report-name-text {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

/* 执行信息卡片 */
.result-info-section {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.info-card {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.info-card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
}

.info-card-header .el-icon {
  font-size: 16px;
  color: #1890ff;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-value.code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
  word-break: break-all;
}

.info-value.highlight {
  color: #1890ff;
}

.duration-value {
  font-size: 20px;
  font-weight: 700;
}

/* 断言结果特殊样式 */
.assertion-card .info-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.assertion-values {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.assertion-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.assertion-item.passed {
  color: #67c23a;
}

.assertion-item.failed {
  color: #f56c6c;
}

.assertion-divider {
  color: #dcdfe6;
  font-size: 16px;
}

/* 时间信息 */
.result-time-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  border: 1px solid #ebeef5;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.time-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #66b1ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.time-icon.end {
  background: linear-gradient(135deg, #909399 0%, #b1b3b8 100%);
}

.time-content {
  display: flex;
  flex-direction: column;
}

.time-label {
  font-size: 11px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.time-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.time-divider {
  color: #c0c4cc;
  font-size: 18px;
}

.info-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-value.highlight {
  color: #1890ff;
}

.success-count {
  color: #67c23a;
  font-weight: 600;
}

.failed-count {
  color: #f56c6c;
  font-weight: 600;
}

.divider {
  margin: 0 4px;
  color: #c0c4cc;
}

/* 时间信息 */
.result-time-section {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-around;
}

.time-item {
  font-size: 14px;
}

.time-label {
  color: #909399;
  margin-right: 8px;
}

.time-value {
  color: #303133;
  font-weight: 500;
}

/* 失败信息 */
.result-failure-section {
  background: linear-gradient(135deg, #fef0f0 0%, #fff5f5 100%);
  border: 1px solid #fbc4c4;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  overflow: hidden;
}

/* 失败概览 */
.failure-overview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.failure-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c 0%, #e94343 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.failure-summary {
  flex: 1;
}

.failure-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.failure-title-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

/* 失败详情 */
.failure-detail {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #fbc4c4;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 6px;
}

.detail-label .el-icon {
  color: #f56c6c;
}

.detail-content {
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.error-content {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
}

.error-message {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu', monospace;
  font-size: 12px;
  color: #e6a23c;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

/* AI诊断按钮 */
.ai-diagnosis-btn-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.ai-diagnosis-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 28px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.35);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-diagnosis-btn .el-icon {
  font-size: 16px;
}

.ai-diagnosis-btn:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
}

.ai-diagnosis-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* AI诊断按钮 - 加载状态 */
.ai-diagnosis-btn.is-loading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.8;
}

/* AI诊断加载中 */
.ai-diagnosis-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #1890ff;
  font-size: 14px;
}

.ai-diagnosis-loading .el-icon {
  font-size: 20px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* AI诊断结果 */
.diagnosis-severity {
  margin-bottom: 12px;
}

/* 根本原因 */
.diagnosis-root-cause {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.root-cause-content {
  color: #f56c6c;
  font-weight: 500;
  line-height: 1.6;
}

/* 发现的问题 */
.diagnosis-issues {
  margin-bottom: 12px;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #e6a23c;
}

.issue-item.issue-high {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.issue-title {
  font-weight: 500;
  color: #303133;
}

.issue-desc {
  color: #909399;
  font-size: 12px;
}

/* 修复建议 */
.diagnosis-suggestions {
  margin-top: 12px;
}

.suggestion-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.suggestion-content {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

/* 诊断失败提示 */
.ai-diagnosis-error {
  padding: 12px;
}

/* 快速修复 */
.quick-fix-section {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae7ff;
}

.quick-fix-section .detail-label {
  color: #096dd9;
  margin-bottom: 8px;
}

.quick-fix-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-fix-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px;
  background: white;
  border-radius: 4px;
}

.fix-step {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #1890ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.fix-content {
  flex: 1;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  padding-top: 1px;
}

/* 结果详情区域 */
.result-section {
  margin-bottom: 20px;
}

.result-section .section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1890ff;
}

/* 失败类型 */
.failure-type {
  padding: 8px 0;
}

/* 表格单元格样式 */
.cell-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
}

.error-text {
  color: #f56c6c;
  font-size: 12px;
}

/* 响应体和堆栈跟踪 */
.response-body-content,
.failure-trace-content {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.failure-trace-content {
  color: #f56c6c;
  background: #fef0f0;
}

/* 操作链接 */
.result-links-section {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
