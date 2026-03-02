<template>
  <div class="api-detail-panel">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="header-left">
        <h2 class="api-title">
          {{ api?.name || '未知接口' }}
          <el-tag v-if="api?.apiCode || api?.api_code" size="small" class="api-code-tag">
            {{ api?.apiCode || api?.api_code }}
          </el-tag>
        </h2>
        
        <!-- 接口描述 -->
        <div v-if="api?.description" class="api-description">
          {{ api?.description }}
        </div>
        
        <!-- 标签 -->
        <div v-if="parseApiTags(api?.tags).length > 0" class="api-tags">
          <el-tag 
            v-for="(tag, index) in parseApiTags(api?.tags)" 
            :key="index" 
            size="small" 
            class="api-tag-item"
          >
            {{ tag }}
          </el-tag>
        </div>
        
        <div class="api-info-line">
          <span v-if="api?.baseUrl" class="api-base-url">{{ api?.baseUrl }}</span>
          <span class="api-path">{{ api?.path || api?.url || '-' }}</span>
          <button class="copy-path-btn" @click.stop="copyApiPath" :title="'复制路径'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
              <path d="M16 1H4a2 2 0 0 0-2 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="8" y="5" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <span class="method-tag" :class="'method-' + (api?.method || '').toLowerCase()">
            {{ api?.method || '-' }}
          </span>
          <el-tag 
            :type="getStatusTagType(api?.status)" 
            size="small"
            class="status-tag"
          >
            {{ getStatusText(api?.status) }}
          </el-tag>
          <span class="version-tag">v{{ api?.version || '1.0' }}</span>
        </div>
        
        <!-- 认证配置信息 -->
        <div class="api-meta">
          <span class="meta-item">
            <span class="meta-label">认证方式：</span>
            <span class="meta-value">{{ getAuthTypeText(api?.authType || api?.auth_type) }}</span>
          </span>
          <span class="meta-item" v-if="api?.authConfig || api?.auth_config">
            <span class="meta-label">认证配置：</span>
            <span class="meta-value auth-config-value">{{ formatAuthConfig(api?.authConfig || api?.auth_config) }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-label">超时时间：</span>
            <span class="meta-value">{{ api?.timeoutSeconds || api?.timeout_seconds || 30 }}秒</span>
          </span>
          <span class="meta-item">
            <span class="meta-label">请求体类型：</span>
            <span class="meta-value">{{ api?.requestBodyType || api?.request_body_type || '-' }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-label">响应体类型：</span>
            <span class="meta-value">{{ api?.responseBodyType || api?.response_body_type || 'json' }}</span>
          </span>
        </div>
      </div>
      <div class="header-right">
        <div class="detail-actions">
          <el-button size="small" type="primary" @click="handleTest">
            <el-icon><CaretRight /></el-icon>
            执行测试
          </el-button>
          <el-button size="small" @click="$emit('refresh')">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        <div class="creator-info" v-if="api?.creatorInfo || api?.creator_info">
          <el-avatar :size="32" :src="getCreatorAvatar()" class="creator-avatar">
            {{ getCreatorName()?.charAt(0) || '?' }}
          </el-avatar>
          <div class="creator-details">
            <div class="creator-name">{{ getCreatorName() || '未知' }}</div>
            <div class="creator-label">创建人</div>
          </div>
        </div>
        <div class="time-info-group">
          <span class="time-info">创建时间：{{ formatTime(api?.createdAt || api?.created_time) }}</span>
          <span class="time-info">更新时间：{{ formatTime(api?.updatedAt || api?.updated_time) }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="detail-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'basic' }"
        @click="activeTab = 'basic'"
      >
        基本信息
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'params' }"
        @click="activeTab = 'params'"
      >
        请求参数
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'result' }"
        @click="activeTab = 'result'"
      >
        响应结果
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        测试历史
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'cases' }"
        @click="activeTab = 'cases'"
      >
        相关用例
      </div>
    </div>

    <!-- 内容区 -->
    <div class="detail-content">
      <!-- 基本信息 -->
      <ApiBasicForm
        :visible="activeTab === 'basic'"
        :apiData="apiData"
        :available-projects="availableProjects"
        :projects-loading="projectsLoading"
        :available-modules="availableModules"
        :modules-loading="modulesLoading"
        :delete-loading="deleteLoading"
        @project-change="handleProjectChange"
        @save="handleSave"
        @test="handleTest"
        @delete="handleDelete"
      />

      <!-- 请求参数 -->
      <ApiParamsEditor
        :visible="activeTab === 'params'"
        v-model:headerParams="headerParams"
        v-model:queryParams="queryParams"
        v-model:bodyParams="bodyParams"
        v-model:formDataParams="formDataParams"
        v-model:rawBody="rawBody"
        v-model:bodyType="bodyType"
        v-model:bodyCollapsed="bodyCollapsed"
        @save-params="handleSaveParams"
        @format-params="handleFormatParams"
      />


      <!-- 响应结果 -->
      <div v-if="activeTab === 'result'" class="tab-content result-content">
        <div class="result-card" role="region" aria-label="响应结果卡片">
        <!-- 测试失败状态 -->
        <div class="test-status-banner" :class="'status-' + testStatus">
          <div class="status-icon">
            <el-icon v-if="testStatus === 'failed'" :size="48" color="#f56c6c">
              <CircleCloseFilled />
            </el-icon>
            <el-icon v-else-if="testStatus === 'passed'" :size="48" color="#67c23a">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else :size="48" color="#909399">
              <InfoFilled />
            </el-icon>
            </div>
          <div class="status-content">
            <div class="status-title">
              {{ testStatus === 'failed' ? '测试失败' : testStatus === 'passed' ? '测试通过' : '未执行' }}
            </div>
            <div class="status-meta">
              <span class="meta-item">状态码：<strong>{{ actualResponse.statusCode }}</strong></span>
              <span class="meta-item">响应码：<strong>{{ actualResponse.responseCode }}</strong></span>
              <span class="meta-item">响应时间：<strong>{{ responseTime }}</strong></span>
              <span class="meta-item">测试时间：<strong>{{ testTime }}</strong></span>
            </div>
          </div>
        </div>

        <!-- 标签页切换 -->
        <div class="result-tabs">
          <div 
            class="result-tab-item" 
            :class="{ active: resultTab === 'response' }"
            @click="resultTab = 'response'"
          >
            响应体
            </div>
          <div 
            class="result-tab-item" 
            :class="{ active: resultTab === 'assertions' }"
            @click="resultTab = 'assertions'"
          >
            断言结果
            </div>
          <div 
            class="result-tab-item" 
            :class="{ active: resultTab === 'headers' }"
            @click="resultTab = 'headers'"
          >
            响应头
          </div>
        </div>

        <!-- 响应体内容 -->
        <div v-if="resultTab === 'response'" class="result-tab-content">
          <div class="collapsible-card">
            <div class="collapsible-toggle" role="button" tabindex="0" @click="responseCollapsed = !responseCollapsed" @keydown.enter.prevent="responseCollapsed = !responseCollapsed" :aria-expanded="!responseCollapsed">
              <div class="collapsible-left">响应体</div>
              <div class="collapsible-right">
                <span class="small-muted">查看响应内容，点击展开/折叠</span>
                <svg class="collapse-icon" width="14" height="14" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
          </div>
          <transition name="collapse">
            <div v-show="!responseCollapsed">
              <div class="result-toolbar">
            <div class="toolbar-left">
              <el-button size="small" :icon="CopyDocument" @click="copyResponse">复制</el-button>
              <el-button size="small" @click="formatResponse">格式化</el-button>
              <el-button size="small" :icon="Download" @click="downloadResponse">下载</el-button>
            </div>
            <div class="toolbar-right">
              <el-input 
                v-model="searchText" 
                placeholder="搜索..." 
                size="small" 
                style="width: 200px;"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <div class="response-code-editor">
            <div v-if="actualResponse && typeof actualResponse.body === 'object' && !Array.isArray(actualResponse.body)">
              <JsonViewer :value="actualResponse.body" />
            </div>
            <div v-else>
              <pre class="code-content"><code class="language-json" v-html="highlightedResponse"></code></pre>
            </div>
          </div>
            </div>
          </transition>
        </div>

        <!-- 断言结果 -->
        <div v-if="resultTab === 'assertions'" class="result-tab-content">
          <el-table 
            :data="assertionResults" 
            class="assertions-table"
            border
          >
            <el-table-column label="断言项" min-width="200">
              <template #default="{ row }">
                <div class="assertion-field">
                  <el-icon v-if="row.passed" color="#67c23a" :size="16">
                    <CircleCheckFilled />
                  </el-icon>
                  <el-icon v-else color="#f56c6c" :size="16">
                    <CircleCloseFilled />
                  </el-icon>
                  <span class="field-name">{{ row.field }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="预期值" width="200" prop="expected" />
            <el-table-column label="实际值" width="200" prop="actual" />
            <el-table-column label="错误信息" min-width="300">
              <template #default="{ row }">
                <span v-if="!row.passed" class="error-message">{{ row.message }}</span>
                <span v-else class="success-message">✓ 断言通过</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 响应头 -->
        <div v-if="resultTab === 'headers'" class="result-tab-content">
          <el-table 
            :data="responseHeaders" 
            class="headers-table"
            border
          >
            <el-table-column label="Header名称" width="300" prop="name" />
            <el-table-column label="值" min-width="400" prop="value" />
          </el-table>
        </div>

        <!-- 底部操作按钮 -->
        <div class="result-actions">
          <el-button type="success" :icon="Refresh" @click="handleRetest">重新测试</el-button>
          <el-button :icon="DocumentCopy" @click="handleSaveResult">保存结果</el-button>
          <el-button :icon="Share" @click="handleExportReport">导出报告</el-button>
        </div>
        </div>
      </div>

      <!-- 测试历史 -->
      <div v-if="activeTab === 'history'" class="tab-content history-content">
        <div class="history-card" role="region" aria-label="测试历史卡片">
        <!-- 筛选工具栏 -->
        <div class="history-toolbar">
          <div class="toolbar-left">
            <el-select v-model="historyFilter.period" placeholder="最近7天" size="small" style="width: 120px;">
              <el-option label="最近7天" value="7days" />
              <el-option label="最近30天" value="30days" />
              <el-option label="最近90天" value="90days" />
              <el-option label="全部" value="all" />
            </el-select>
            <el-select v-model="historyFilter.status" placeholder="全部状态" size="small" style="width: 120px;" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="成功" value="passed" />
              <el-option label="失败" value="failed" />
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-button 
              size="small" 
              :icon="Download"
              @click="handleOpenExportHistoryDialog"
            >
              导出
            </el-button>
            <el-input 
              v-model="historySearchText" 
              placeholder="搜索..." 
              size="small" 
              style="width: 200px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
              </div>
              </div>

        <!-- 测试历史表格 -->
        <el-table 
          :data="filteredHistoryRecords" 
          class="history-table"
          stripe
          v-loading="historyLoading"
          element-loading-text="加载中..."
        >
          <el-table-column label="测试时间" width="180" prop="testTime">
            <template #default="{ row }">
              <span class="time-text">{{ row.testTime }}</span>
            </template>
          </el-table-column>

          <el-table-column label="执行人" width="150">
            <template #default="{ row }">
              <div class="executor-cell">
                <el-avatar :size="24" :src="row.executorAvatar" class="executor-avatar">
                  {{ row.executor.charAt(0) }}
                </el-avatar>
                <span class="executor-name">{{ row.executor }}</span>
            </div>
            </template>
          </el-table-column>

          <el-table-column label="响应状态码" width="120" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="row.statusCode === 200 ? 'success' : 'danger'" 
                size="small"
              >
                {{ row.statusCode }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="响应时间" width="120" align="center" prop="responseTime">
            <template #default="{ row }">
              <span class="response-time">{{ row.responseTime }}</span>
            </template>
          </el-table-column>

          <el-table-column label="测试结果" width="120" align="center">
            <template #default="{ row }">
              <div class="result-cell">
                <el-icon 
                  v-if="row.status === 'passed'" 
                  color="#67c23a" 
                  :size="16"
                >
                  <CircleCheckFilled />
                </el-icon>
                <el-icon 
                  v-else 
                  color="#f56c6c" 
                  :size="16"
                >
                  <CircleCloseFilled />
                </el-icon>
                <span 
                  :class="['result-text', row.status === 'passed' ? 'success' : 'failed']"
                >
                  {{ getStatusText(row.status) }}
                </span>
            </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                text 
                type="primary"
                :icon="View"
                @click="handleViewHistoryDetail(row)"
              >
                查看详情
              </el-button>
              <el-button 
                size="small" 
                text 
                type="success"
                :icon="Refresh"
                @click="handleRetestFromHistory(row)"
              >
                重新测试
              </el-button>
              <el-button 
                size="small" 
                text 
                type="danger"
                :icon="Delete"
                @click="handleDeleteHistory(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="history-pagination">
          <div class="pagination-info">
            显示 {{ Math.min((historyPagination.currentPage - 1) * historyPagination.pageSize + 1, historyTotal) }}-{{ Math.min(historyPagination.currentPage * historyPagination.pageSize, historyTotal) }} / {{ historyTotal }} 条记录
          </div>
          <el-pagination
            v-model:current-page="historyPagination.currentPage"
            v-model:page-size="historyPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="historyTotal"
            layout="prev, pager, next"
            @size-change="handleHistorySizeChange"
            @current-change="handleHistoryPageChange"
          />
        </div>

        <!-- 执行详情对话框 -->
        <el-dialog
          v-model="historyDetailDialogVisible"
          title="执行记录详情"
          width="800px"
          :close-on-click-modal="false"
        >
          <div v-if="currentHistoryDetail" class="history-detail-content">
            <!-- 基本信息 -->
            <div class="detail-section">
              <h3 class="section-title">基本信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="执行ID">
                  {{ currentHistoryDetail.recordId }}
                </el-descriptions-item>
                <el-descriptions-item label="执行范围">
                  {{ currentHistoryDetail.scopeName }}
                </el-descriptions-item>
                <el-descriptions-item label="执行人">
                  {{ currentHistoryDetail.executorInfo?.name || '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="执行类型">
                  <el-tag :type="currentHistoryDetail.executionType === 'manual' ? 'primary' : 'info'" size="small">
                    {{ currentHistoryDetail.executionType === 'manual' ? '手动执行' : 
                       currentHistoryDetail.executionType === 'scheduled' ? '定时任务' : '触发执行' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="执行环境">
                  {{ currentHistoryDetail.environment || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="执行状态">
                  <el-tag 
                    :type="currentHistoryDetail.status === 'completed' ? 'success' : 
                           currentHistoryDetail.status === 'failed' ? 'danger' : 
                           currentHistoryDetail.status === 'running' ? 'warning' : 'info'"
                    size="small"
                  >
                    {{ currentHistoryDetail.status === 'completed' ? '已完成' : 
                       currentHistoryDetail.status === 'failed' ? '失败' : 
                       currentHistoryDetail.status === 'running' ? '运行中' : '已取消' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="开始时间">
                  {{ formatTime(currentHistoryDetail.startTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="结束时间">
                  {{ formatTime(currentHistoryDetail.endTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="执行耗时">
                  {{ formatDuration(currentHistoryDetail.durationSeconds) }}
                </el-descriptions-item>
                <el-descriptions-item label="浏览器">
                  {{ currentHistoryDetail.browser || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="应用版本">
                  {{ currentHistoryDetail.appVersion || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 执行统计 -->
            <div class="detail-section" v-if="currentHistoryDetail.totalCases">
              <h3 class="section-title">执行统计</h3>
              <el-descriptions :column="3" border>
                <el-descriptions-item label="总用例数">
                  {{ currentHistoryDetail.totalCases || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="已执行">
                  {{ currentHistoryDetail.executedCases || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="通过数">
                  <span style="color: #67c23a; font-weight: bold;">
                    {{ currentHistoryDetail.passedCases || 0 }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="失败数">
                  <span style="color: #f56c6c; font-weight: bold;">
                    {{ currentHistoryDetail.failedCases || 0 }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="跳过数">
                  {{ currentHistoryDetail.skippedCases || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="成功率">
                  <span :style="{ 
                    color: (currentHistoryDetail.successRate || 0) >= 90 ? '#67c23a' : 
                           (currentHistoryDetail.successRate || 0) >= 70 ? '#e6a23c' : '#f56c6c',
                    fontWeight: 'bold'
                  }">
                    {{ (currentHistoryDetail.successRate || 0).toFixed(2) }}%
                  </span>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 错误信息 -->
            <div class="detail-section" v-if="currentHistoryDetail.errorMessage">
              <h3 class="section-title">错误信息</h3>
              <el-alert 
                type="error" 
                :closable="false"
                show-icon
              >
                <pre class="error-message">{{ currentHistoryDetail.errorMessage }}</pre>
              </el-alert>
            </div>

            <!-- 报告链接 -->
            <div class="detail-section" v-if="currentHistoryDetail.reportUrl">
              <h3 class="section-title">测试报告</h3>
              <el-link 
                :href="currentHistoryDetail.reportUrl" 
                type="primary" 
                target="_blank"
                :icon="Document"
              >
                查看完整测试报告
              </el-link>
            </div>
          </div>

          <template #footer>
            <el-button @click="historyDetailDialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>
        </div>
      </div>

      <!-- 相关用例 -->
      <div v-if="activeTab === 'cases'" class="tab-content cases-content">
        <div class="cases-card" role="region" aria-label="相关用例卡片">
        <!-- 用例工具栏 -->
        <div class="cases-toolbar">
          <div class="toolbar-left">
            <el-select v-model="casesFilter.type" placeholder="所有测试类型" size="small" style="width: 150px;" clearable>
              <el-option
                v-for="option in getTestTypeOptions()"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select v-model="casesFilter.priority" placeholder="所有优先级" size="small" style="width: 130px;" clearable>
              <el-option
                v-for="option in getPriorityOptions()"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select v-model="casesFilter.sortBy" placeholder="默认排序" size="small" style="width: 130px;">
              <el-option
                v-for="option in getSortOptions()"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-button type="primary" size="small" @click="handleAddTestCase">
              + 添加测试用例
            </el-button>
            <el-input 
              v-model="casesSearchText" 
              placeholder="搜索测试用例..." 
              size="small" 
              style="width: 200px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            </div>
            </div>

        <!-- 用例列表表格 -->
        <el-table 
          :data="filteredCases" 
          class="cases-table"
          @row-click="handleCaseRowClick"
        >
          <el-table-column label="用例名称" min-width="200">
            <template #default="{ row }">
              <div class="case-name-cell" @click="$emit('select-case', row)">
                <span class="case-name-text">{{ row.name }}</span>
          </div>
            </template>
          </el-table-column>

          <el-table-column label="测试类型" width="130" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getTestTypeTagType(row.testType || row.caseType)" 
                size="small"
                class="test-type-tag"
              >
                {{ getTestTypeText(row.testType || row.caseType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="优先级" width="100" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getPriorityTagType(row.priority)" 
                size="small"
              >
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="测试数据" min-width="250">
            <template #default="{ row }">
              <div class="test-data-cell">
                <el-tooltip placement="top" :show-after="300">
                  <template #content>
                    <div class="tooltip-content">
                      <div class="tooltip-title">🔍 完整测试数据</div>
                      <pre class="tooltip-json">{{ formatTestDataFull(row.preConditions) }}</pre>
                    </div>
                  </template>
                  <span class="test-data-text">{{ truncateText(formatTestData(row.preConditions), 50) }}</span>
                </el-tooltip>
        </div>
            </template>
          </el-table-column>

          <el-table-column label="预期结果" min-width="200">
            <template #default="{ row }">
              <div class="expected-result-cell">
                <el-tooltip placement="top" :show-after="300">
                  <template #content>
                    <div class="tooltip-content">
                      <div class="tooltip-title">🎯 完整预期结果</div>
                      <pre class="tooltip-json">{{ formatExpectedResultFull(row.expectedResponseBody) }}</pre>
                    </div>
                  </template>
                  <span class="result-summary">{{ truncateText(formatExpectedResult(row.expectedResponseBody), 40) }}</span>
                </el-tooltip>
      </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="240" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                text 
                type="primary"
                :icon="CaretRight"
                @click.stop="handleRunTestCase(row)"
              >
                运行
              </el-button>
              <el-button 
                size="small" 
                text 
                type="primary"
                :icon="View"
                @click.stop="$emit('select-case', row)"
              >
                查看
              </el-button>
              <el-button 
                size="small" 
                text 
                :type="row.isEnabled ? 'warning' : 'success'"
                :icon="row.isEnabled ? 'CircleClose' : 'CircleCheck'"
                @click.stop="handleToggleTestCaseStatus(row)"
              >
                {{ row.isEnabled ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="cases-pagination">
          <div class="pagination-info">
            显示 1-6 / {{ casesTotal }} 条记录
    </div>
          <el-pagination
            v-model:current-page="casesPagination.currentPage"
            v-model:page-size="casesPagination.pageSize"
            :total="casesTotal"
            layout="prev, pager, next"
            @current-change="handleCasesPageChange"
          />
        </div>
        </div>
      </div>
    </div>

    <!-- 添加测试用例对话框 -->
    <el-dialog
      v-model="addCaseDialogVisible"
      title="添加测试用例"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="caseFormRef"
        :model="caseFormData"
        :rules="caseFormRules"
        label-width="100px"
      >
        <el-tabs v-model="caseFormActiveTab" class="case-form-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="用例名称" prop="name">
              <el-input v-model="caseFormData.name" placeholder="请输入用例名称" />
            </el-form-item>
            
            <el-form-item label="用例编码" prop="caseCode">
              <el-input 
                v-model="caseFormData.caseCode" 
                placeholder="留空则自动生成" 
              />
              <span class="form-tip">用例编码在接口内唯一，留空则自动生成</span>
            </el-form-item>

            <el-form-item label="用例描述" prop="description">
              <el-input
                v-model="caseFormData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入用例描述"
              />
            </el-form-item>

            <el-form-item label="优先级" prop="priority">
              <el-select v-model="caseFormData.priority" placeholder="请选择优先级">
                <el-option label="P0（最高优先级）" value="P0" />
                <el-option label="P1（高优先级）" value="P1" />
                <el-option label="P2（中等优先级）" value="P2" />
                <el-option label="P3（低优先级）" value="P3" />
              </el-select>
            </el-form-item>

            <el-form-item label="严重程度" prop="severity">
              <el-select v-model="caseFormData.severity" placeholder="请选择严重程度">
                <el-option label="严重" value="critical" />
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>

            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="caseFormData.tags"
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
              <el-input v-model="caseFormData.version" placeholder="例如：1.0" />
            </el-form-item>

            <el-form-item label="是否启用">
              <el-switch v-model="caseFormData.isEnabled" />
            </el-form-item>

            <el-form-item label="设为模板">
              <el-switch v-model="caseFormData.isTemplate" />
              <span class="form-tip">模板用例可以被其他用例引用</span>
            </el-form-item>
          </el-tab-pane>

          <!-- 测试步骤 -->
          <el-tab-pane label="测试步骤" name="steps">
            <div class="test-steps-section">
              <div class="steps-header">
                <span class="steps-title">测试步骤列表</span>
                <el-button size="small" type="primary" @click="handleAddTestStep">
                  + 添加步骤
                </el-button>
              </div>
              
              <div class="steps-list" v-if="caseFormData.testSteps && caseFormData.testSteps.length > 0">
                <div 
                  v-for="(step, index) in caseFormData.testSteps" 
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
          </el-tab-pane>

          <!-- 前置条件与请求参数 -->
          <el-tab-pane label="请求参数" name="request">
            <el-form-item label="前置条件">
              <el-input
                v-model="caseFormData.preConditionsStr"
                type="textarea"
                :rows="6"
                placeholder='JSON格式的前置条件，例如：&#10;{&#10;  "token": "xxxx",&#10;  "userId": 123&#10;}'
              />
              <span class="form-tip">用于设置环境变量、登录状态等</span>
            </el-form-item>

            <el-form-item label="请求参数覆盖">
              <el-input
                v-model="caseFormData.requestOverrideStr"
                type="textarea"
                :rows="8"
                placeholder='JSON格式的请求参数，例如：&#10;{&#10;  "username": "testuser",&#10;  "password": "Test@123"&#10;}'
              />
              <span class="form-tip">将覆盖接口的默认请求参数</span>
            </el-form-item>
          </el-tab-pane>

          <!-- 预期响应 -->
          <el-tab-pane label="预期响应" name="response">
            <el-form-item label="预期状态码" prop="expectedHttpStatus">
              <el-input-number
                v-model="caseFormData.expectedHttpStatus"
                :min="100"
                :max="599"
                placeholder="200"
              />
            </el-form-item>

            <el-form-item label="预期响应体">
              <el-input
                v-model="caseFormData.expectedResponseBody"
                type="textarea"
                :rows="8"
                placeholder='预期的响应内容，例如：&#10;{&#10;  "code": 1,&#10;  "msg": "成功",&#10;  "data": {}&#10;}'
              />
            </el-form-item>

            <el-form-item label="响应Schema">
              <el-input
                v-model="caseFormData.expectedResponseSchemaStr"
                type="textarea"
                :rows="8"
                placeholder='JSON Schema格式，例如：&#10;{&#10;  "type": "object",&#10;  "properties": {&#10;    "code": {"type": "number"}&#10;  }&#10;}'
              />
              <span class="form-tip">用于验证响应结构</span>
            </el-form-item>
          </el-tab-pane>

          <!-- 断言规则 -->
          <el-tab-pane label="断言规则" name="assertions">
            <div class="assertions-section">
              <div class="assertions-header">
                <span class="assertions-title">断言列表</span>
                <el-button size="small" type="primary" @click="handleAddAssertion">
                  + 添加断言
                </el-button>
              </div>

              <div class="assertions-list" v-if="caseFormData.assertions && caseFormData.assertions.length > 0">
                <div 
                  v-for="(assertion, index) in caseFormData.assertions" 
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
          </el-tab-pane>

          <!-- 响应提取规则 -->
          <el-tab-pane label="提取规则" name="extractors">
            <div class="extractors-section">
              <div class="extractors-header">
                <span class="extractors-title">提取器列表</span>
                <el-button size="small" type="primary" @click="handleAddExtractor">
                  + 添加提取器
                </el-button>
              </div>

              <div class="extractors-list-edit" v-if="caseFormData.extractors && caseFormData.extractors.length > 0">
                <div 
                  v-for="(extractor, index) in caseFormData.extractors" 
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
                <el-icon color="#409eff"><InfoFilled /></el-icon>
                <span>提取器用于从响应中提取数据供后续用例使用，如提取登录token、订单ID等</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addCaseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTestCase" :loading="savingCase">
            创建用例
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 执行测试配置对话框 -->
    <el-dialog
      v-model="executeDialogVisible"
      custom-class="execute-dialog-enhanced"
      :title="isExecutingApi ? '🚀 执行接口测试' : '🎯 执行测试用例'"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="execute-dialog-content">
        <!-- 执行目标信息卡片 -->
        <el-card class="target-info-card" shadow="never">
          <div class="target-header">
            <div class="target-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="target-details">
              <div class="target-title">{{ isExecutingApi ? '接口测试' : '单个用例测试' }}</div>
              <div class="target-meta">
                <el-tag v-if="isExecutingApi && api" size="small" type="info">
                  {{ api.method }} {{ api.path }}
                </el-tag>
                <el-tag v-else-if="currentTestCase" size="small" type="success">
                  {{ currentTestCase.case_code || currentTestCase.caseCode || '用例-' + (currentTestCase.id || currentTestCase.caseId) }}
                </el-tag>
                <span class="target-desc" v-if="isExecutingApi">
                  将执行该接口下 {{ api?.caseCount || 0 }} 个测试用例
                </span>
                <span class="target-desc" v-else>
                  将执行单个测试用例
                </span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 环境配置区域 -->
        <div class="config-section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>执行环境</span>
          </div>
          <el-card class="config-card" shadow="never">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="执行环境" required>
                  <el-select v-model="executeFormData.environment" placeholder="请选择执行环境" style="width: 100%">
                    <el-option label="开发环境 (dev)" value="dev">
                      <div class="option-content">
                        <span class="option-dot dev"></span>
                        <span>开发环境</span>
                        <span class="option-desc">dev</span>
                      </div>
                    </el-option>
                    <el-option label="测试环境 (test)" value="test">
                      <div class="option-content">
                        <span class="option-dot test"></span>
                        <span>测试环境</span>
                        <span class="option-desc">test</span>
                      </div>
                    </el-option>
                    <el-option label="预发布环境 (staging)" value="staging">
                      <div class="option-content">
                        <span class="option-dot staging"></span>
                        <span>预发布环境</span>
                        <span class="option-desc">staging</span>
                      </div>
                    </el-option>
                    <el-option label="生产环境 (prod)" value="prod">
                      <div class="option-content">
                        <span class="option-dot prod"></span>
                        <span>生产环境</span>
                        <span class="option-desc">prod</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="超时时间">
                  <el-input-number
                    v-model="executeFormData.timeout"
                    :min="1"
                    :max="300"
                    placeholder="30"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="单位">
                  <div class="timeout-unit">秒</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="Base URL">
              <el-input
                v-model="executeFormData.baseUrl"
                placeholder="留空则使用环境默认URL"
                clearable
              >
                <template #prefix>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </template>
              </el-input>
              <div class="url-preview" v-if="getPreviewUrl()">
                <span class="preview-label">预览：</span>
                <span class="preview-url">{{ getPreviewUrl() }}</span>
              </div>
            </el-form-item>
          </el-card>
        </div>

        <!-- 接口测试高级配置 -->
        <template v-if="isExecutingApi">
          <div class="config-section">
            <div class="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>测试用例筛选</span>
              <el-tag size="small" type="warning">高级选项</el-tag>
            </div>
            <el-card class="config-card advanced-card" shadow="never">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="并发执行数">
                    <el-input-number
                      v-model="executeFormData.concurrency"
                      :min="1"
                      :max="10"
                      placeholder="1"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="执行顺序">
                    <el-select v-model="executeFormData.executionOrder" placeholder="选择执行顺序" style="width: 100%">
                      <el-option label="🔥 优先级降序（推荐）" value="priority_desc" />
                      <el-option label="⬆️ 优先级升序" value="priority_asc" />
                      <el-option label="📝 名称升序" value="name_asc" />
                      <el-option label="📝 名称降序" value="name_desc" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="优先级过滤">
                    <el-select
                      v-model="executeFormData.caseFilter.priority"
                      multiple
                      placeholder="全部优先级"
                      style="width: 100%"
                    >
                      <el-option label="🚨 P0（最高优先级）" value="P0" />
                      <el-option label="⚡ P1（高优先级）" value="P1" />
                      <el-option label="📋 P2（中等优先级）" value="P2" />
                      <el-option label="📄 P3（低优先级）" value="P3" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="标签过滤">
                    <el-select
                      v-model="executeFormData.caseFilter.tags"
                      multiple
                      filterable
                      allow-create
                      placeholder="全部标签"
                      style="width: 100%"
                    >
                      <el-option label="🚀 冒烟测试" value="冒烟测试" />
                      <el-option label="🔄 回归测试" value="回归测试" />
                      <el-option label="✨ 功能测试" value="功能测试" />
                      <el-option label="🐛 缺陷验证" value="缺陷验证" />
                      <el-option label="⚡ 性能测试" value="性能测试" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item>
                <el-checkbox v-model="executeFormData.caseFilter.enabledOnly">
                  <span>仅执行已启用的测试用例</span>
                </el-checkbox>
              </el-form-item>
            </el-card>
          </div>
        </template>

        <!-- 执行模式配置 -->
        <div class="config-section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>执行模式与变量</span>
          </div>
          <el-card class="config-card" shadow="never">
            <el-form-item label="执行方式">
              <el-radio-group v-model="executeFormData.async" class="execution-mode-group">
                <el-radio :label="false" class="mode-option">
                  <div class="mode-content">
                    <div class="mode-title">⚡ 同步执行</div>
                    <div class="mode-desc">等待测试完成并返回详细结果</div>
                  </div>
                </el-radio>
                <el-radio :label="true" class="mode-option">
                  <div class="mode-content">
                    <div class="mode-title">🚀 异步执行</div>
                    <div class="mode-desc">立即返回任务ID，后台执行</div>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="执行变量">
              <div class="variables-header">
                <el-input
                  v-model="executeVariables"
                  type="textarea"
                  :rows="4"
                  placeholder='{"username": "testuser", "token": "your-token"}'
                  class="variables-textarea"
                />
                <div class="variable-actions">
                  <el-button size="small" text @click="insertVariableTemplate('user')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    用户变量
                  </el-button>
                  <el-button size="small" text @click="insertVariableTemplate('token')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Token
                  </el-button>
                  <el-button size="small" text @click="insertVariableTemplate('custom')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    自定义
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-card>
        </div>

        <!-- 执行预览摘要 -->
        <el-card class="summary-card" shadow="never">
          <template #header>
            <div class="summary-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>执行预览</span>
            </div>
          </template>
          <div class="summary-content">
            <div class="summary-item">
              <span class="summary-label">执行目标：</span>
              <span class="summary-value">{{ isExecutingApi ? '接口测试' : '单个用例测试' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">执行环境：</span>
              <el-tag size="small" :type="getEnvironmentTagType(executeFormData.environment)">
                {{ executeFormData.environment }}
              </el-tag>
            </div>
            <div class="summary-item">
              <span class="summary-label">超时设置：</span>
              <span class="summary-value">{{ executeFormData.timeout }} 秒</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">执行方式：</span>
              <span class="summary-value">{{ executeFormData.async ? '异步执行' : '同步执行' }}</span>
            </div>
            <div class="summary-item" v-if="isExecutingApi">
              <span class="summary-label">并发数：</span>
              <span class="summary-value">{{ executeFormData.concurrency }} 个并发</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">变量数量：</span>
              <span class="summary-value">{{ getVariableCount() }} 个</span>
            </div>
          </div>
        </el-card>
      </div>

      <template #footer>
        <div class="execute-dialog-footer">
          <div class="footer-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>执行过程中请勿关闭页面，测试结果将自动显示</span>
          </div>
          <div class="footer-actions">
            <el-button @click="executeDialogVisible = false" size="large">取消</el-button>
            <el-button
              type="primary"
              @click="handleConfirmExecute"
              :loading="executing"
              size="large"
              class="execute-btn"
            >
              <svg v-if="!executing" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ executing ? '执行中...' : '🚀 开始执行' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 执行结果对话框 -->
    <ExecutionResult
      v-model="resultDialogVisible"
      :executionResult="executionResult"
      @view-logs="handleViewLogs"
      @view-report="handleViewReport"
      @retest="handleRetestFromResult"
    />

    <!-- 导出测试历史对话框 -->
    <el-dialog
      v-model="exportHistoryDialogVisible"
      title="导出测试历史"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="exportHistoryForm" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportHistoryForm.format">
            <el-radio-button label="excel">Excel</el-radio-button>
            <el-radio-button label="json">JSON</el-radio-button>
            <el-radio-button label="csv">CSV</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="导出范围">
          <el-radio-group v-model="exportHistoryForm.scope">
            <el-radio label="current">当前筛选结果 ({{ filteredHistoryRecords.length }} 条)</el-radio>
            <el-radio label="all">全部记录 ({{ historyRecords.length }} 条)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="包含字段">
          <el-checkbox-group v-model="exportHistoryForm.includeFields">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <el-checkbox label="testTime">测试时间</el-checkbox>
              <el-checkbox label="executor">执行人</el-checkbox>
              <el-checkbox label="environment">执行环境</el-checkbox>
              <el-checkbox label="executionType">执行类型</el-checkbox>
              <el-checkbox label="responseTime">响应时间</el-checkbox>
              <el-checkbox label="status">测试结果</el-checkbox>
              <el-checkbox label="totalCases">总用例数</el-checkbox>
              <el-checkbox label="executedCases">已执行数</el-checkbox>
              <el-checkbox label="passedCases">通过数</el-checkbox>
              <el-checkbox label="failedCases">失败数</el-checkbox>
              <el-checkbox label="skippedCases">跳过数</el-checkbox>
              <el-checkbox label="successRate">成功率</el-checkbox>
              <el-checkbox label="errorMessage">错误信息</el-checkbox>
              <el-checkbox label="browser">浏览器</el-checkbox>
              <el-checkbox label="appVersion">应用版本</el-checkbox>
              <el-checkbox label="reportUrl">报告地址</el-checkbox>
              <el-checkbox label="executionConfig">执行配置</el-checkbox>
            </div>
          </el-checkbox-group>
          <div style="margin-top: 8px;">
            <el-button size="small" text type="primary" @click="selectAllFields">全选</el-button>
            <el-button size="small" text @click="clearAllFields">清空</el-button>
            <el-button size="small" text @click="selectRecommendedFields">推荐字段</el-button>
          </div>
        </el-form-item>

        <el-form-item label="文件名">
          <el-input 
            v-model="exportHistoryForm.fileName" 
            placeholder="留空则自动生成"
          />
          <span class="form-tip">
            建议格式：{{ suggestedFileName }}
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportHistoryDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmExportHistory"
            :loading="exportingHistory"
          >
            {{ exportingHistory ? '导出中...' : '确认导出' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
// Syntax highlighting
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  CircleCloseFilled, 
  CircleCheckFilled, 
  InfoFilled,
  CopyDocument,
  Download,
  Search,
  Refresh,
  DocumentCopy,
  Document,
  Share,
  View,
  Delete,
  CaretRight
} from '@element-plus/icons-vue'
import { 
  createTestCase, 
  updateTestCase, 
  executeTestCase,
  executeApiTest,
  executeApiTestAsync,
  getExecutionRecords,
  getExecutionRecordById,
  deleteExecutionRecord
} from '@/api/testCase'
import { getModulesByProject, updateApi, getProjects, deleteApi } from '@/api/project'
import JsonViewer from '@/components/common/JsonViewer.vue'
import ExecutionResult from './ExecutionResult.vue'
import ApiBasicForm from './ApiBasicForm.vue'
import ApiParamsEditor from './ApiParamsEditor.vue'
import useProjectsModules from './apiDetail/useProjectsModules'
import { exportToExcel, exportToJson, exportToCsv } from './apiDetail/exportUtils'
import {
  truncateText,
  formatTestData,
  formatTestDataFull,
  formatExpectedResult,
  formatExpectedResultFull,
  formatDuration,
  formatTime
} from './apiDetail/formatters'
import useCasesFilter from './apiDetail/useCasesFilter'

// 复制路径到剪贴板
const copyApiPath = async () => {
  const text = api?.path || api?.url || ''
  if (!text) {
    ElMessage.warning('路径为空，无法复制')
    return
  }
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 兼容回退
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    ElMessage.success('已复制路径到剪贴板')
  } catch (err) {
    console.error('复制失败', err)
    ElMessage.error('复制失败')
  }
}

const props = defineProps({
  api: {
    type: Object,
    required: true
  },
  relatedCases: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-case', 'edit-case', 'delete-case', 'delete-api', 'close', 'refresh-cases', 'refresh'])

// 组件销毁时的清理
onBeforeUnmount(() => {
  try {
    // 清理定时器等资源
    // 注意：如果组件中有定时器，需要在这里清理
    // 目前没有使用historyTimer，所以暂时注释掉
    // if (historyTimer.value) {
    //   clearInterval(historyTimer.value)
    //   historyTimer.value = null
    // }
    
    // 清理其他可能的资源
    deleteLoading.value = false
  } catch (error) {
    console.error('组件卸载时清理资源失败:', error)
  }
})

const activeTab = ref('basic')
const deleteLoading = ref(false)
// 折叠控制
const bodyCollapsed = ref(false)
const responseCollapsed = ref(false)

// 折叠区摘要文本
const bodySummary = computed(() => {
  try {
    if (bodyType === 'raw') {
      return rawBody ? (rawBody.length > 120 ? rawBody.slice(0, 120) + '...' : rawBody) : '空'
    }
    if (bodyType === 'json') {
      return (bodyParams?.length || 0) + ' 个字段'
    }
    if (bodyType === 'form-data') {
      return (formDataParams?.length || 0) + ' 个字段'
    }
    return ''
  } catch (e) {
    return ''
  }
})

const responseSummary = computed(() => {
  if (actualResponse && (actualResponse.statusCode || actualResponse.responseCode)) {
    return `${actualResponse.statusCode || '-'} · ${responseTime || '-'}`
  }
  return '暂无响应'
})

// 项目和模块相关状态 (moved to composable)

// 计算属性：从props.api中获取真实数据
// 可编辑的接口数据
const apiData = reactive({
  project: '',
  projectId: null,
  module: '',
  moduleId: null,
  apiCode: '',
  name: '',
  path: '',
  method: 'GET',
  baseUrl: '',
  description: '',
  precondition: '',
  tags: [],                     // 数组格式
  requestParameters: [],        // 数组格式（查询参数）
  pathParameters: [],           // 数组格式（路径参数）
  requestHeaders: [],           // 数组格式（请求头）
  requestBody: null,            // 可以是字符串或对象
  requestBodyType: 'json',
  responseBodyType: '',
  status: 'active',
  version: '',
  authType: '',
  authConfig: null,             // 对象格式
  examples: [],                 // 数组格式（示例）
  timeoutSeconds: 30
})

// projects/modules composable (moved to `src/components/cases/apiDetail/useProjectsModules.js`)
const {
  availableProjects,
  projectsLoading,
  availableModules,
  modulesLoading,
  loadProjects,
  loadModules,
  handleProjectChange
} = useProjectsModules(props, apiData)

// 监听 props.api 变化，更新表单数据
watch(
  () => props.api,
  (newApi) => {
    if (newApi) {
      apiData.project = newApi.project_name || newApi.projectName || '-'
      apiData.projectId = newApi.project_id || newApi.projectId
      apiData.module = newApi.module_name || newApi.moduleName || '-'
      apiData.moduleId = newApi.module_id || newApi.moduleId
      apiData.apiCode = newApi.api_code || newApi.apiCode || ''
      apiData.name = newApi.name || ''
      apiData.path = newApi.path || newApi.url || ''
      apiData.method = newApi.method || 'GET'
      apiData.baseUrl = newApi.base_url || newApi.baseUrl || ''
      apiData.description = newApi.description || ''
      apiData.precondition = newApi.precondition || newApi.pre_condition || ''
      
      // 确保数组类型字段始终是数组格式
      apiData.tags = Array.isArray(newApi.tags) ? newApi.tags : []
      
      // requestParameters: 可能是数组或对象，统一转为数组
      const reqParams = newApi.request_parameters || newApi.requestParameters
      apiData.requestParameters = Array.isArray(reqParams) ? reqParams : []
      
      // pathParameters: 确保是数组
      const pathParams = newApi.path_parameters || newApi.pathParameters
      apiData.pathParameters = Array.isArray(pathParams) ? pathParams : []
      
      // requestHeaders: 确保是数组
      const reqHeaders = newApi.request_headers || newApi.requestHeaders
      apiData.requestHeaders = Array.isArray(reqHeaders) ? reqHeaders : []
      
      // requestBody: 可以是字符串、对象或null
      apiData.requestBody = newApi.request_body || newApi.requestBody
      apiData.requestBodyType = newApi.request_body_type || newApi.requestBodyType || 'json'
      apiData.responseBodyType = newApi.response_body_type || newApi.responseBodyType || ''
      apiData.status = newApi.status || 'active'
      apiData.version = newApi.version || ''
      apiData.authType = newApi.auth_type || newApi.authType || ''
      apiData.authConfig = newApi.auth_config || newApi.authConfig
      
      // examples: 确保是数组
      apiData.examples = Array.isArray(newApi.examples) ? newApi.examples : []
      
      apiData.timeoutSeconds = newApi.timeout_seconds || newApi.timeoutSeconds || 30
    }
  },
  { immediate: true }
)

// 项目和模块加载逻辑已移至 `useProjectsModules` 可组合函数

// 组件挂载时加载项目列表
onMounted(() => {
  loadProjects()
})

// 监听 apiData.projectId 变化，重新加载模块列表
watch(
  () => apiData.projectId,
  (newProjectId, oldProjectId) => {
    console.log('=== ApiDetail 监听到项目ID变化 ===')
    console.log('newProjectId:', newProjectId)
    console.log('oldProjectId:', oldProjectId)
    
    if (newProjectId && newProjectId !== oldProjectId) {
      console.log('✅ 项目ID变化，开始加载模块列表')
      loadModules(newProjectId)
    }
  }
)

// 监听API变化，重新加载模块列表
watch(
  () => props.api?.project_id || props.api?.projectId,
  (newProjectId, oldProjectId) => {
    console.log('=== ApiDetail 监听到API变化 ===')
    console.log('props.api:', props.api)
    console.log('project_id:', props.api?.project_id)
    console.log('projectId:', props.api?.projectId)
    console.log('newProjectId:', newProjectId)
    console.log('oldProjectId:', oldProjectId)
    
    if (newProjectId && newProjectId !== oldProjectId) {
      console.log('✅ 项目ID变化，开始加载模块列表')
      loadModules()
    } else {
      console.log('❌ 不满足加载条件')
      console.log('  - newProjectId存在?', !!newProjectId)
      console.log('  - ID是否变化?', newProjectId !== oldProjectId)
    }
  },
  { immediate: true }
)

// 请求参数数据
const bodyType = ref('json')
const headerParams = ref([])
const queryParams = ref([])
const bodyParams = ref([])
const formDataParams = ref([])
const rawBody = ref('')

// 从API数据初始化请求参数
const initRequestParams = () => {
  // 初始化Body类型
  bodyType.value = props.api.request_body_type || 'json'
  
  // 初始化Headers
  if (props.api.request_headers) {
    if (Array.isArray(props.api.request_headers)) {
      headerParams.value = props.api.request_headers
    } else if (typeof props.api.request_headers === 'object') {
      headerParams.value = Object.entries(props.api.request_headers).map(([name, value]) => ({
        name,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description: ''
      }))
    }
  }
  
  // 初始化Query参数
  if (props.api.request_parameters) {
    if (Array.isArray(props.api.request_parameters)) {
      queryParams.value = props.api.request_parameters
    } else if (typeof props.api.request_parameters === 'object') {
      queryParams.value = Object.entries(props.api.request_parameters).map(([name, value]) => ({
        name,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description: ''
      }))
    }
  }
  
  // 初始化Body参数
  if (props.api.request_body) {
    if (Array.isArray(props.api.request_body)) {
      bodyParams.value = props.api.request_body
    } else if (typeof props.api.request_body === 'object') {
      bodyParams.value = Object.entries(props.api.request_body).map(([name, value]) => ({
        name,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description: ''
      }))
    }
    
    // 初始化rawBody
    if (typeof props.api.request_body === 'string') {
      rawBody.value = props.api.request_body
    } else if (typeof props.api.request_body === 'object') {
      rawBody.value = JSON.stringify(props.api.request_body, null, 2)
    }
  }
}


// 导出工具已移至 `src/components/cases/apiDetail/exportUtils.js`

// 测试用例数据
const casesSearchText = ref('')

// 使用用例筛选 composable
const casesList = computed(() => props.relatedCases.length > 0 ? props.relatedCases : testCasesList.value)
const {
  filterOptions: casesFilter,
  filteredCases,
  resetFilters,
  getFilterStats,
  getTestTypeText,
  getTestTypeTagType,
  getPriorityTagType,
  getTestTypeOptions,
  getPriorityOptions,
  getSortOptions
} = useCasesFilter(casesList, casesSearchText)

const casesPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const casesTotal = ref(12)

// 模拟测试用例数据
const testCasesList = ref([
  {
    id: 1,
    name: '正常用户信息更新',
    caseType: 'functional',
    priority: 'P1', // 高优先级
    testData: '有效的用户ID和完整更新信息（50字符以内的姓名、符合规则的电子邮箱和手机号码）',
    expectedResult: '状态码 200，更新成功'
  },
  {
    id: 2,
    name: '字段长度边界测试',
    caseType: 'boundary',
    priority: 'P2', // 中等优先级
    testData: '用户名长度为最大允许值（…）',
    expectedResult: '响应包含验证错误信息'
  },
  {
    id: 3,
    name: '缺少必填字段测试',
    caseType: 'exception',
    priority: 'P0', // 最高优先级
    testData: '缺少email、phone等关键字段',
    expectedResult: '状态码 400，参数错误'
  },
  {
    id: 4,
    name: '无权限用户操作测试',
    caseType: 'security',
    priority: 'P0', // 最高优先级
    testData: '使用无权限用户的Token访问',
    expectedResult: '状态码 403，权限拒绝'
  },
  {
    id: 5,
    name: 'XSS注入测试',
    caseType: 'security',
    priority: 'P2', // 中等优先级
    testData: '在各个字段中注入XSS代码',
    expectedResult: '状态码 400，参数错误'
  },
  {
    id: 6,
    name: '大数据量测试',
    caseType: 'boundary',
    priority: 'P3', // 低优先级
    testData: '提交包含大量数据的请求',
    expectedResult: '响应时间 < 2秒'
  }
])



// 文本截断与格式化函数已抽离到 `src/components/cases/apiDetail/formatters.js`

// 添加测试用例对话框
const addCaseDialogVisible = ref(false)
const caseFormRef = ref(null)
const savingCase = ref(false)
const caseFormActiveTab = ref('basic')

const caseFormData = reactive({
  name: '',
  description: '',
  caseCode: '',
  priority: 'P2',
  severity: 'medium',
  tags: [],
  version: '1.0',
  isEnabled: true,
  isTemplate: false,
  // 测试步骤
  testSteps: [],
  // 前置条件和请求参数
  preConditions: '',
  preConditionsStr: '',
  requestOverrideStr: '',
  // 预期响应
  expectedHttpStatus: 200,
  expectedResponseBody: '',
  expectedResponseSchemaStr: '',
  // 断言和提取器
  assertions: [],
  extractors: []
})

const caseFormRules = {
  name: [
    { required: true, message: '请输入用例名称', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  severity: [
    { required: true, message: '请选择严重程度', trigger: 'change' }
  ]
}

// 重置表单
const resetCaseForm = () => {
  Object.assign(caseFormData, {
    name: '',
    description: '',
    caseCode: '',
    priority: 'P2',
    severity: 'medium',
    tags: [],
    version: '1.0',
    isEnabled: true,
    isTemplate: false,
    testSteps: [],
    preConditions: '',
    preConditionsStr: '',
    requestOverrideStr: '',
    expectedHttpStatus: 200,
    expectedResponseBody: '',
    expectedResponseSchemaStr: '',
    assertions: [],
    extractors: []
  })
  caseFormActiveTab.value = 'basic'
  caseFormRef.value?.clearValidate()
}

// 测试步骤相关
const handleAddTestStep = () => {
  if (!caseFormData.testSteps) {
    caseFormData.testSteps = []
  }
  caseFormData.testSteps.push({
    operation: '',
    expected: '',
    actual: ''
  })
}

const handleRemoveTestStep = (index) => {
  caseFormData.testSteps.splice(index, 1)
}

// 断言相关
const handleAddAssertion = () => {
  if (!caseFormData.assertions) {
    caseFormData.assertions = []
  }
  caseFormData.assertions.push({
    type: 'json_path',
    path: '',
    expected: ''
  })
}

const handleRemoveAssertion = (index) => {
  caseFormData.assertions.splice(index, 1)
}

// 提取器相关
const handleAddExtractor = () => {
  if (!caseFormData.extractors) {
    caseFormData.extractors = []
  }
  caseFormData.extractors.push({
    name: '',
    expression: '',
    description: ''
  })
}

const handleRemoveExtractor = (index) => {
  caseFormData.extractors.splice(index, 1)
}

// 添加测试用例
const handleAddTestCase = () => {
  resetCaseForm()
  addCaseDialogVisible.value = true
}

// 保存测试用例
const handleSaveTestCase = async () => {
  if (!caseFormRef.value) return
  
  try {
    await caseFormRef.value.validate()
    
    // 验证JSON格式
    if (caseFormData.preConditionsStr) {
      try {
        JSON.parse(caseFormData.preConditionsStr)
      } catch (e) {
        ElMessage.error('前置条件必须是有效的JSON格式')
        return
      }
    }
    
    if (caseFormData.requestOverrideStr) {
      try {
        JSON.parse(caseFormData.requestOverrideStr)
      } catch (e) {
        ElMessage.error('请求参数必须是有效的JSON格式')
        return
      }
    }
    
    if (caseFormData.expectedResponseBody) {
      try {
        JSON.parse(caseFormData.expectedResponseBody)
      } catch (e) {
        ElMessage.error('预期响应体必须是有效的JSON格式')
        return
      }
    }
    
    if (caseFormData.expectedResponseSchemaStr) {
      try {
        JSON.parse(caseFormData.expectedResponseSchemaStr)
      } catch (e) {
        ElMessage.error('响应Schema必须是有效的JSON格式')
        return
      }
    }
    
    savingCase.value = true
    
    // 获取API ID，尝试多种可能的字段名
    let apiId = props.api.api_id || props.api.id || props.api.apiId
    
    // 如果还是没有找到，尝试从其他可能的字段获取
    if (!apiId) {
      // 检查是否有其他可能的ID字段
      const possibleIds = [
        props.api.api_id,
        props.api.id, 
        props.api.apiId,
        props.api.interface_id,
        props.api.interfaceId
      ]
      apiId = possibleIds.find(id => id !== undefined && id !== null)
    }
    
    console.log('=== 调试API数据结构 ===')
    console.log('完整的API数据:', JSON.stringify(props.api, null, 2))
    console.log('props.api.api_id:', props.api.api_id)
    console.log('props.api.id:', props.api.id)
    console.log('props.api.apiId:', props.api.apiId)
    console.log('最终使用的API ID:', apiId)
    console.log('=== 调试结束 ===')
    
    if (!apiId) {
      ElMessage.error('无法获取接口ID，请刷新页面重试。请检查控制台输出的API数据结构。')
      savingCase.value = false
      return
    }
    
    // 调用创建测试用例API
    const requestData = {
      api_id: apiId,
      case_code: caseFormData.caseCode,
      name: caseFormData.name,
      description: caseFormData.description,
      priority: caseFormData.priority,
      severity: caseFormData.severity,
      tags: caseFormData.tags,
      version: caseFormData.version,
      test_steps: caseFormData.testSteps,
      pre_conditions: caseFormData.preConditionsStr ? JSON.parse(caseFormData.preConditionsStr) : null,
      request_override: caseFormData.requestOverrideStr ? JSON.parse(caseFormData.requestOverrideStr) : null,
      expected_http_status: caseFormData.expectedHttpStatus,
      expected_response_body: caseFormData.expectedResponseBody,
      expected_response_schema: caseFormData.expectedResponseSchemaStr ? JSON.parse(caseFormData.expectedResponseSchemaStr) : null,
      assertions: caseFormData.assertions,
      extractors: caseFormData.extractors,
      is_enabled: caseFormData.isEnabled,
      is_template: caseFormData.isTemplate
    }
    
    console.log('发送的请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await createTestCase(requestData)
    console.log('API响应:', response)
    
    if (response.code === 1) {
      ElMessage.success('测试用例创建成功')
      addCaseDialogVisible.value = false
      emit('refresh-cases')
    } else {
      ElMessage.error(response.msg || '创建失败')
    }
    
  } catch (error) {
    console.error('保存测试用例失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('创建失败，请检查输入信息')
    }
  } finally {
    savingCase.value = false
  }
}

// 初始化执行相关的响应式变量（将在 useExecution 中被赋值）

// 执行相关逻辑已移至 `useExecution` 可组合函数
import useExecution from './apiDetail/useExecution'
const {
  executeDialogVisible,
  executing,
  executeVariables,
  isExecutingApi,
  executeFormData,
  resultDialogVisible,
  executionResult,
  currentTestCase,
  handleRunTestCase,
  handleConfirmExecute,
  handleViewLogs,
  handleViewReport,
  handleRetestFromResult,
  handleTest
} = useExecution(props, emit, { activeTab })

// 测试历史相关逻辑已移至 `useHistoryExport` 可组合函数
import useHistoryExport from './apiDetail/useHistoryExport'
const {
  historySearchText,
  historyFilter,
  historyPagination,
  historyTotal,
  historyRecords,
  historyLoading,
  historyDetailDialogVisible,
  currentHistoryDetail,
  exportHistoryDialogVisible,
  exportingHistory,
  exportHistoryForm,
  allExportFields,
  getTimeRange,
  loadHistoryRecords,
  filteredHistoryRecords,
  handleViewHistoryDetail,
  handleRetestFromHistory,
  handleDeleteHistory,
  handleHistorySizeChange,
  handleHistoryPageChange,
  suggestedFileName,
  selectAllFields,
  clearAllFields,
  selectRecommendedFields,
  handleOpenExportHistoryDialog,
  handleConfirmExportHistory
} = useHistoryExport(props, emit, { resultDialogVisible, executionResult })

// ========== 执行配置对话框辅助方法 ==========

// 环境配置映射
const environmentConfigs = {
  dev: { url: 'http://dev-api.example.com', color: '#67c23a' },
  test: { url: 'http://test-api.example.com', color: '#e6a23c' },
  staging: { url: 'http://staging-api.example.com', color: '#f56c6c' },
  prod: { url: 'https://api.example.com', color: '#909399' }
}

// 获取预览URL
const getPreviewUrl = () => {
  const baseUrl = executeFormData.baseUrl || environmentConfigs[executeFormData.environment]?.url || ''
  const apiPath = isExecutingApi.value && props.api ? props.api.path : ''
  if (!baseUrl && !apiPath) return ''
  return baseUrl + apiPath
}

// 获取环境标签类型
const getEnvironmentTagType = (env) => {
  const types = {
    dev: 'success',
    test: 'warning',
    staging: 'danger',
    prod: 'info'
  }
  return types[env] || 'info'
}

// 获取变量数量
const getVariableCount = () => {
  if (!executeVariables.value) return 0
  try {
    const parsed = JSON.parse(executeVariables.value)
    return Object.keys(parsed).length
  } catch {
    return 0
  }
}

// 插入变量模板
const insertVariableTemplate = (type) => {
  const templates = {
    user: {
      username: 'testuser',
      password: 'Test@123',
      email: 'test@example.com'
    },
    token: {
      access_token: 'your-access-token',
      refresh_token: 'your-refresh-token',
      expires_in: 7200
    },
    custom: {
      key: 'value'
    }
  }
  
  try {
    const currentVars = executeVariables.value ? JSON.parse(executeVariables.value) : {}
    const newVars = { ...currentVars, ...templates[type] }
    executeVariables.value = JSON.stringify(newVars, null, 2)
  } catch {
    executeVariables.value = JSON.stringify(templates[type], null, 2)
  }
}

// 切换测试用例启用状态
const handleToggleTestCaseStatus = async (testCase) => {
  try {
    const action = testCase.isEnabled ? '禁用' : '启用'
    
    await ElMessageBox.confirm(
      `确定要${action}测试用例"${testCase.name}"吗？`,
      `${action}测试用例`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用编辑接口更新启用状态 - 只发送必要的字段
    // 注意：不包含 api_id，修改测试用例时 API 关联不能改变
    const updateData = {
      // case_code: testCase.case_code || testCase.caseCode,
      name: testCase.name,
      description: testCase.description,
      priority: testCase.priority,
      severity: testCase.severity,
      tags: testCase.tags || [],
      // pre_conditions: testCase.pre_conditions || testCase.preConditions,
      // test_steps: testCase.test_steps || testCase.testSteps,
      // request_override: testCase.request_override || testCase.requestOverride,
      expected_http_status: testCase.expected_http_status || testCase.expectedHttpStatus,
      // expected_response_schema: testCase.expected_response_schema || testCase.expectedResponseSchema,
      // expected_response_body: testCase.expected_response_body || testCase.expectedResponseBody,
      assertions: testCase.assertions,
      extractors: testCase.extractors,
      validators: testCase.validators,
      is_enabled: !testCase.isEnabled,  // 切换状态
      is_template: testCase.is_template || testCase.isTemplate,
      // template_id: testCase.template_id || testCase.templateId,
      version: testCase.version
    }
    
    const caseId = testCase.case_id || testCase.caseId || testCase.id
    await updateTestCase(caseId, updateData)
    
    ElMessage.success(`测试用例${action}成功`)
    
    // 刷新测试用例列表
    emit('refresh-cases')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换测试用例状态失败:', error)
      ElMessage.error(`测试用例${testCase.isEnabled ? '禁用' : '启用'}失败`)
    }
  }
}

// 执行相关实现已抽离到 `src/components/cases/apiDetail/useExecution.js`

// 用例行点击
const handleCaseRowClick = (row) => {
  // 可以在这里处理行点击事件
}

// 用例分页变化
const handleCasesPageChange = (page) => {
  casesPagination.currentPage = page
  // 加载数据
}

// 添加参数
const addParam = (paramList) => {
  paramList.push({
    name: '',
    value: '',
    description: ''
  })
}

// 删除参数
const removeParam = (paramList, index) => {
  paramList.splice(index, 1)
}

// 保存参数
const handleSaveParams = () => {
  ElMessage.success('参数保存成功')
}

// 格式化参数
const handleFormatParams = () => {
  // 格式化逻辑
  ElMessage.success('参数已格式化')
}

// 响应结果数据
const testStatus = ref('not_executed') // 'passed' | 'failed' | 'not_executed'
const resultTab = ref('response')
const searchText = ref('')
const responseTime = ref('-')
const testTime = ref('-')

const actualResponse = reactive({
  statusCode: '-',
  responseCode: '-',
  body: {}
})

const formattedResponse = ref('暂无执行结果')
const highlightedResponse = ref('')

watch(formattedResponse, (val) => {
  try {
    const code = typeof val === 'string' ? val : JSON.stringify(val, null, 2)
    highlightedResponse.value = Prism.highlight(code, Prism.languages.json, 'json')
  } catch (e) {
    highlightedResponse.value = String(val)
  }
}, { immediate: true })

// 加载最新的执行结果
const loadLatestExecutionResult = async () => {
  try {
    const params = {
      execution_scope: 'api',
      ref_id: props.api?.api_id || props.api?.id,
      page: 1,
      page_size: 1,
      sort_by: 'start_time',
      sort_order: 'desc'
    }
    
    const response = await getExecutionRecords(params)
    
    if (response.code === 1 && response.data && response.data.items.length > 0) {
      const latestRecord = response.data.items[0]
      
      // 处理字段命名兼容（下划线和驼峰）
      const record = {
        status: latestRecord.status || latestRecord.status,
        startTime: latestRecord.startTime || latestRecord.start_time,
        durationSeconds: latestRecord.durationSeconds || latestRecord.duration_seconds,
        executionConfig: latestRecord.executionConfig || latestRecord.execution_config,
        errorMessage: latestRecord.errorMessage || latestRecord.error_message
      }
      
      // 更新测试状态
      testStatus.value = mapExecutionStatus(record.status)
      
      // 更新时间信息
      testTime.value = formatTime(record.startTime)
      responseTime.value = formatDuration(record.durationSeconds)
      
      // 解析执行配置JSON
      let executionConfig = null
      if (record.executionConfig) {
        try {
          executionConfig = typeof record.executionConfig === 'string' 
            ? JSON.parse(record.executionConfig)
            : record.executionConfig
        } catch (e) {
          console.error('解析执行配置失败:', e)
        }
      }
      
      // 更新响应数据 - 从executionConfig中获取
      if (executionConfig && executionConfig.responseData) {
        const responseData = executionConfig.responseData
        actualResponse.statusCode = responseData.httpStatus || responseData.statusCode || '-'
        actualResponse.responseCode = responseData.responseCode || '-'
        actualResponse.body = responseData.body || {}
        
        // 格式化响应体
        if (typeof actualResponse.body === 'string') {
          formattedResponse.value = actualResponse.body
        } else if (typeof actualResponse.body === 'object') {
          formattedResponse.value = JSON.stringify(actualResponse.body, null, 2)
        }
        
        // 更新断言结果
        if (responseData.assertionResults && Array.isArray(responseData.assertionResults)) {
          assertionResults.value = responseData.assertionResults
        }
        
        // 更新响应头
        if (responseData.headers) {
          responseHeaders.value = Object.entries(responseData.headers).map(([name, value]) => ({
            name,
            value: typeof value === 'string' ? value : JSON.stringify(value)
          }))
        }
      } else {
        // 如果没有响应数据，显示基本信息
        formattedResponse.value = record.errorMessage || '暂无响应数据'
      }
    } else {
      // 没有执行记录
      testStatus.value = 'not_executed'
      formattedResponse.value = '暂无执行结果'
    }
  } catch (error) {
    console.error('加载最新执行结果失败:', error)
    testStatus.value = 'not_executed'
    formattedResponse.value = '加载失败'
  }
}

// 断言结果
const assertionResults = ref([])

// 响应头
const responseHeaders = ref([])

// 复制响应
const copyResponse = () => {
  navigator.clipboard.writeText(formattedResponse.value)
  ElMessage.success('已复制到剪贴板')
}

// 格式化响应
const formatResponse = () => {
  try {
    const parsed = JSON.parse(formattedResponse.value)
    formattedResponse.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('格式化成功')
  } catch (error) {
    ElMessage.error('格式化失败，请检查JSON格式')
  }
}

// 下载响应
const downloadResponse = () => {
  const blob = new Blob([formattedResponse.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `response_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('下载成功')
}

// 重新测试
const handleRetest = () => {
  ElMessage.info('正在重新测试...')
}

// 保存结果
const handleSaveResult = () => {
  ElMessage.success('结果已保存')
}

// 导出报告
const handleExportReport = () => {
  ElMessage.info('正在导出报告...')
}

// 格式化时间
// formatTime moved to `src/components/cases/apiDetail/formatters.js`

// 获取创建人名称
const getCreatorName = () => {
  if (!props.api) return '未知'
  if (props.api.creatorInfo && props.api.creatorInfo.name) {
    return props.api.creatorInfo.name
  }
  if (props.api.creator_info && props.api.creator_info.name) {
    return props.api.creator_info.name
  }
  return '未知'
}

// 获取创建人头像
const getCreatorAvatar = () => {
  if (!props.api) return ''
  if (props.api.creatorInfo && props.api.creatorInfo.avatarUrl) {
    return props.api.creatorInfo.avatarUrl
  }
  if (props.api.creator_info && props.api.creator_info.avatar_url) {
    return props.api.creator_info.avatar_url
  }
  return ''
}

// 获取接口状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    'active': 'success',
    'inactive': 'info',
    'deprecated': 'warning'
  }
  return typeMap[status] || 'success'
}

// 获取接口状态文本
const getStatusText = (status) => {
  const textMap = {
    'active': '激活',
    'inactive': '未激活',
    'deprecated': '已废弃',
    'passed': '通过',
    'failed': '失败',
    'not_executed': '未执行'
  }
  return textMap[status] || status || '激活'
}

// 获取认证类型文本
const getAuthTypeText = (authType) => {
  const textMap = {
    'none': '无认证',
    'bearer': 'Bearer Token',
    'basic': 'Basic Auth',
    'api_key': 'API Key',
    'apikey': 'API Key',
    'oauth2': 'OAuth 2.0'
  }
  return textMap[authType] || authType || '无认证'
}

// 解析接口标签
const parseApiTags = (tags) => {
  if (!tags) return []
  try {
    if (typeof tags === 'string') {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    }
    if (Array.isArray(tags)) {
      return tags
    }
    return []
  } catch {
    return []
  }
}

// 格式化认证配置
const formatAuthConfig = (authConfig) => {
  if (!authConfig) return '-'
  try {
    const config = typeof authConfig === 'string' ? JSON.parse(authConfig) : authConfig
    const parts = []
    if (config.tokenType) parts.push(`类型: ${config.tokenType}`)
    if (config.headerName) parts.push(`Header: ${config.headerName}`)
    if (config.keyName) parts.push(`Key: ${config.keyName}`)
    if (config.tokenUrl) parts.push(`TokenURL: ${config.tokenUrl}`)
    if (config.clientId) parts.push(`ClientID: ${config.clientId}`)
    return parts.length > 0 ? parts.join(' | ') : '-'
  } catch {
    return '-'
  }
}

/**
 * 处理项目改变
 */
// handleProjectChange is provided by `useProjectsModules` composable

/**
 * 保存接口修改
 */
const handleSave = async () => {
  // 基本验证
  if (!apiData.name || apiData.name.trim() === '') {
    ElMessage.error('接口名称不能为空')
    return
  }
  
  if (!apiData.path || apiData.path.trim() === '') {
    ElMessage.error('接口路径不能为空')
    return
  }
  
  if (!apiData.method) {
    ElMessage.error('请求方法不能为空')
    return
  }
  
  // 获取接口ID
  const apiId = props.api?.api_id || props.api?.id
  if (!apiId) {
    ElMessage.error('无法获取接口ID')
    return
  }
  
  try {
    // 如果用户选择了新的模块，需要找到对应的模块ID
    let targetModuleId = apiData.moduleId
    if (apiData.module !== (props.api.module_name || props.api.moduleName)) {
      // 用户更改了模块，需要从 availableModules 中查找新模块的ID
      const selectedModule = availableModules.value.find(m => m.name === apiData.module)
      if (selectedModule) {
        targetModuleId = selectedModule.id
      }
    }
    
    // 构造请求数据（字段顺序和命名与后端接口完全一致）
    // 注意：确保数组类型字段使用正确的格式
    
    // 处理 requestBody：应该是字符串，不是数组
    let requestBodyValue = ''
    if (bodyType.value === 'raw') {
      // raw 模式：使用原始文本
      requestBodyValue = rawBody.value || ''
    } else if (bodyParams.value && bodyParams.value.length > 0) {
      // 如果有 body 参数，转换为 JSON 字符串
      const bodyObj = {}
      bodyParams.value.forEach(param => {
        if (param.name) {
          bodyObj[param.name] = param.value
        }
      })
      requestBodyValue = JSON.stringify(bodyObj)
    } else if (apiData.requestBody) {
      // 使用原始的 requestBody
      if (typeof apiData.requestBody === 'string') {
        requestBodyValue = apiData.requestBody
      } else if (typeof apiData.requestBody === 'object') {
        requestBodyValue = JSON.stringify(apiData.requestBody)
      }
    }
    
    const updateData = {
      api_code: apiData.apiCode || '',
      module_id: targetModuleId,
      name: apiData.name.trim(),
      method: apiData.method,
      path: apiData.path.trim(),
      base_url: apiData.baseUrl || '',
      // 使用编辑后的数组格式数据，确保格式正确
      request_parameters: queryParams.value || [],
      path_parameters: apiData.pathParameters || [],  // 如果有路径参数编辑器，应使用对应的 ref
      request_headers: headerParams.value || [],
      request_body: requestBodyValue,  // ✅ 确保是字符串
      request_body_type: bodyType.value || 'json',
      response_body_type: apiData.responseBodyType || '',
      description: apiData.description || '',
      status: apiData.status || 'active',
      version: apiData.version || '',
      auth_type: apiData.authType || '',
      auth_config: apiData.authConfig,
      tags: Array.isArray(apiData.tags) ? apiData.tags : [],
      examples: Array.isArray(apiData.examples) ? apiData.examples : [],
      timeout_seconds: apiData.timeoutSeconds || 30
    }
    
    // 🔍 详细调试日志
    console.log('=== 接口保存调试信息 ===')
    console.log('API ID:', apiId)
    console.log('目标模块ID:', targetModuleId)
    console.log('headerParams.value:', headerParams.value)
    console.log('queryParams.value:', queryParams.value)
    console.log('bodyParams.value:', bodyParams.value)
    console.log('bodyType.value:', bodyType.value)
    console.log('rawBody.value:', rawBody.value)
    console.log('requestBodyValue (处理后):', requestBodyValue)
    console.log('apiData.tags:', apiData.tags)
    console.log('apiData.examples:', apiData.examples)
    console.log('完整请求数据 (updateData):', JSON.stringify(updateData, null, 2))
    console.log('请求数据类型检查:')
    console.log('  - request_headers 是数组?', Array.isArray(updateData.request_headers))
    console.log('  - request_parameters 是数组?', Array.isArray(updateData.request_parameters))
    console.log('  - path_parameters 是数组?', Array.isArray(updateData.path_parameters))
    console.log('  - request_body 是字符串?', typeof updateData.request_body === 'string')
    console.log('  - tags 是数组?', Array.isArray(updateData.tags))
    console.log('  - examples 是数组?', Array.isArray(updateData.examples))
    console.log('========================')
    
    // 调用API更新接口
    const response = await updateApi(apiId, updateData)
    
    console.log('=== 接口保存响应信息 ===')
    console.log('响应状态码:', response.code)
    console.log('响应消息:', response.msg)
    console.log('响应数据:', response.data)
    console.log('========================')
    
    if (response.code === 1) {
      ElMessage.success('保存成功')
      // 触发父组件刷新数据
      emit('refresh')
    } else {
      console.error('=== 接口保存失败 ===')
      console.error('失败原因:', response.msg)
      console.error('完整响应:', response)
      console.error('====================')
      ElMessage.error(response.msg || '保存失败')
    }
  } catch (error) {
    console.error('=== 接口保存异常 ===')
    console.error('错误对象:', error)
    console.error('错误消息:', error.message)
    console.error('HTTP状态码:', error.response?.status)
    console.error('响应头:', error.response?.headers)
    console.error('响应数据:', error.response?.data)
    console.error('请求配置:', error.config)
    console.error('完整错误堆栈:', error.stack)
    console.error('====================')
    
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (error.message) {
      ElMessage.error(`保存失败: ${error.message}`)
    } else {
      ElMessage.error('保存失败，请稍后重试')
    }
  }
}

/**
 * 执行接口测试
 */
// handleTest 已迁移到 useExecution 可组合函数

/**
 * 删除接口
 */
const handleDelete = async () => {
  try {
    // 获取接口ID和名称
    const apiId = props.api?.api_id || props.api?.id
    const apiName = props.api?.name || '未知接口'
    
    if (!apiId) {
      ElMessage.error('无法获取接口ID')
      return
    }
    
    // 确认对话框
    await ElMessageBox.confirm(
      `确定要删除接口"${apiName}"吗？删除后将无法恢复，且该接口下的所有测试用例也将被删除。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        customClass: 'delete-confirm-dialog'
      }
    )
    
    // 开始删除
    deleteLoading.value = true
    console.log('开始删除接口，ID:', apiId)
    
    const response = await deleteApi(apiId)
    console.log('删除接口响应:', response)
    
    if (response.code === 1) {
      ElMessage.success('接口删除成功')
      
      // 触发父组件刷新并关闭详情页
      emit('delete-api', apiId)
      emit('refresh')
    } else {
      ElMessage.error(response.msg || '删除接口失败')
    }
  } catch (error) {
    // 用户取消操作
    if (error === 'cancel') {
      console.log('用户取消删除')
      return
    }
    
    console.error('删除接口失败:', error)
    
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('删除接口失败，请稍后重试')
    }
  } finally {
    deleteLoading.value = false
  }
}

/**
 * 处理删除错误
 */
const handleDeleteError = (response) => {
  const errorMessages = {
    '-4': '测试用例不存在',
    '0': response.msg || '测试用例删除失败'
  }
  
  // 特殊错误处理
  if (response.msg) {
    if (response.msg.includes('已被删除')) {
      ElMessage.warning('该测试用例已被删除')
      emit('delete-case', testCase)
      emit('close')
      return
    }
    
    if (response.msg.includes('权限不足')) {
      ElMessage.error('权限不足，无法删除测试用例')
      return
    }
    
    if (response.msg.includes('正在被测试计划使用')) {
      ElMessage.error('用例正在被测试计划使用，无法删除')
      return
    }
    
    if (response.msg.includes('不能删除系统用例')) {
      ElMessage.error('不能删除系统用例')
      return
    }
    
    if (response.msg.includes('模板用例')) {
      ElMessage.error('模板用例不能被删除')
      return
    }
  }
  
  // 通用错误处理
  const errorMessage = errorMessages[response.code] || response.msg || '删除失败'
  ElMessage.error(errorMessage)
}

// ==================== 监听器和生命周期 ====================

/**
 * 监听历史筛选条件变化
 */
watch(
  () => [historyFilter.period, historyFilter.status, historySearchText.value],
  () => {
    // 重置到第一页
    historyPagination.currentPage = 1
    // 重新加载数据
    loadHistoryRecords()
  }
)

/**
 * 监听活动标签页变化
 */
watch(activeTab, (newTab) => {
  if (newTab === 'history') {
    // 切换到历史标签页时加载数据
    loadHistoryRecords()
  } else if (newTab === 'result') {
    // 切换到响应结果标签页时加载最新执行结果
    loadLatestExecutionResult()
  }
})

/**
 * 监听API数据变化，重新初始化请求参数
 */
watch(() => props.api, () => {
  initRequestParams()
}, { deep: true, immediate: true })

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 初始化请求参数
  initRequestParams()
  
  // 如果当前就在历史标签页，则加载数据
  if (activeTab.value === 'history') {
    loadHistoryRecords()
  } else if (activeTab.value === 'result') {
    // 如果当前就在响应结果标签页，则加载最新执行结果
    loadLatestExecutionResult()
  }
})
</script>

<style scoped>
.api-detail-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

/* 头部 */
.detail-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.api-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-code-tag {
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
}

.api-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.5;
}

.api-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.api-tag-item {
  background: #f0f2f5;
  color: #606266;
  border: none;
}

.api-info-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.api-path {
  font-size: 14px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

.api-base-url {
  font-size: 14px;
  color: #909399;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.method-tag {
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  background: #ecf5ff;
  color: #409eff;
}

.status-tag {
  margin-left: auto;
}

.version-tag {
  padding: 2px 8px;
  background: #f0f0f0;
  color: #909399;
  border-radius: 10px;
  font-size: 12px;
}

.method-tag.method-get {
  background: #f0f9ff;
  color: #67c23a;
}

.method-tag.method-post {
  background: #ecf5ff;
  color: #409eff;
}

.method-tag.method-put {
  background: #fdf6ec;
  color: #e6a23c;
}

.method-tag.method-delete {
  background: #fef0f0;
  color: #f56c6c;
}

.api-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
}

.copy-path-btn {
  margin-left: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-secondary, #7b888e);
  display: inline-flex;
  align-items: center;
}
.copy-path-btn:hover { color: var(--color-brand, #409eff); }

.detail-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}
.detail-actions .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.detail-actions .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
}
.detail-actions .el-button--primary:hover {
  background: linear-gradient(135deg, #3a8ee6 0%, #5cadff 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #909399;
  margin-right: 4px;
}

.meta-value {
  color: #606266;
  font-weight: 500;
}

.auth-config-value {
  font-size: 12px;
  color: #E6A23C;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-avatar {
  background: #409eff;
}

.creator-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.creator-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.creator-label {
  font-size: 12px;
  color: #909399;
}

.time-info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.time-info {
  font-size: 13px;
  color: #909399;
}

/* 标签页 */
.detail-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  background: #fafafa;
}

.tab-item {
  padding: 12px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background: white;
}

/* 内容区 */
.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tab-content {
  max-width: 800px;
}

/* 基本信息卡片视觉优化 */
.basic-info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  will-change: transform;
}
.basic-info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.12);
}
.basic-info-card .section-title {
  transition: color 0.18s ease;
}

/* 按钮和标签微交互 */
.method-tag, .status-tag {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.method-tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(64, 158, 255, 0.08);
}
.form-actions .el-button {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.form-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

/* 表单部分 */
.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-select {
  width: 100%;
}

.tag-list {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  margin-top: 24px;
}

/* 请求参数卡片样式 */
.params-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.04);
  transition: box-shadow 0.18s ease, transform 0.18s ease;
  margin-bottom: 18px;
}
.params-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(16,24,40,0.08);
}

/* params header with controls alignment */
.params-header--with-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* body type selector transitions */
.body-type-selector :deep(.el-radio-button__inner) {
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.12s ease;
}
.body-type-selector :deep(.el-radio-button:hover) {
  transform: translateY(-2px);
}

/* table row hover / zebra */
.params-table :deep(.el-table__row) {
  transition: background-color 0.12s ease, transform 0.12s ease;
}
.params-table :deep(.el-table__row:hover) {
  background: linear-gradient(90deg, rgba(240,249,255,0.6), rgba(246,253,255,0.2));
  transform: translateY(-2px);
}
.params-table :deep(.el-table__body) {
  border-radius: 8px;
  overflow: hidden;
}

/* add-param button float */
.add-param-btn {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;
}

/* small toolbar tweaks */
.result-toolbar, .params-header {
  align-items: center;
}

/* collapsible card improvements */
.collapsible-card {
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.16s ease, transform 0.16s ease;
}
.collapsible-card:hover {
  box-shadow: 0 8px 22px rgba(16,24,40,0.04);
}

/* 请求参数部分 */
.params-content {
  max-width: 100% !important;
}

.params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 24px;
}

.params-header:first-child {
  margin-top: 0;
}

.params-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.body-type-selector {
  margin-left: auto;
}

.params-table {
  margin-bottom: 12px;
}

.params-table :deep(.el-table__header-wrapper) {
  background: #fafafa;
}

.params-table :deep(.el-table__header th) {
  background: #fafafa;
  color: #606266;
  font-weight: 500;
  font-size: 13px;
}

.params-table :deep(.el-table__body td) {
  padding: 8px 0;
}

.params-table :deep(.el-input__inner) {
  border: none;
  background: transparent;
}

.params-table :deep(.el-input__inner:focus) {
  border: 1px solid #409eff;
  background: white;
}

.add-param-btn {
  margin-bottom: 24px;
}

.body-section {
  margin-bottom: 24px;
}

.params-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  margin-top: 24px;
}

/* 响应结果部分 */
.result-content {
  max-width: 100% !important;
  padding: 0 !important;
}

/* 测试状态横幅 */
.test-status-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #fef0f0;
  border-bottom: 1px solid #e4e7ed;
}

.test-status-banner.status-failed {
  background: #fef0f0;
  border-left: 4px solid #f56c6c;
}

.test-status-banner.status-passed {
  background: #f0f9ff;
  border-left: 4px solid #67c23a;
}

.test-status-banner.status-not_executed {
  background: #f5f7fa;
  border-left: 4px solid #909399;
}

.status-icon {
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.status-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  color: #606266;
}

.meta-item strong {
  color: #303133;
  font-weight: 600;
  margin-left: 4px;
}

/* 结果标签页 */
.result-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.result-tab-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.result-tab-item:hover {
  color: #409eff;
}

.result-tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background: white;
}

/* 结果标签页内容 */
.result-tab-content {
  padding: 0;
}

/* 结果工具栏 */
.result-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

/* 响应代码编辑器 */
.response-code-editor {
  max-height: 500px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 16px;
}

/* 响应结果卡片 */
.result-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 28px rgba(16,24,40,0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 44px rgba(16,24,40,0.10);
}

/* 提升测试状态横幅视觉 */
.test-status-banner {
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  transition: box-shadow 0.16s ease, transform 0.12s ease;
}
.test-status-banner.status-passed {
  background: linear-gradient(90deg, #f0f9ff 0%, #ecfdf5 100%);
  border-left: 6px solid #67c23a;
}
.test-status-banner.status-failed {
  background: linear-gradient(90deg, #fff5f5 0%, #fff7f8 100%);
  border-left: 6px solid #f56c6c;
}
.test-status-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(16,24,40,0.06);
}

/* 响应工具栏按钮强化 */
.result-toolbar .el-button {
  border-radius: 6px;
  background: transparent;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
}
.result-toolbar .el-button:hover {
  transform: translateY(-3px);
  background: rgba(64,158,255,0.06);
  box-shadow: 0 8px 18px rgba(64,158,255,0.06);
}

/* 代码展示区增强 */
.response-code-editor {
  border-radius: 10px;
  padding: 18px;
  background: linear-gradient(180deg, #0f1724 0%, #071025 100%);
  color: #e6eef8;
}
.response-code-editor .code-content {
  background: transparent;
  color: #e6eef8;
}
.response-code-editor pre {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 下载/复制按钮强调 */
.toolbar-left .el-button[icon] {
  background: rgba(255,255,255,0.02);
}
.toolbar-left .el-button[icon]:hover {
  background: rgba(255,255,255,0.04);
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
}

/* 折叠卡片样式 */
.collapsible-card {
  border: 1px solid #eef2f6;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: white;
}
.collapsible-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  gap: 12px;
}
.collapsible-title, .collapsible-left {
  font-weight: 600;
  color: #303133;
}
.collapsible-right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
}
.collapse-icon { transform: rotate(0deg); transition: transform 0.2s; }
.collapsible-toggle[aria-expanded=\"false\"] .collapse-icon { transform: rotate(-90deg); }
.small-muted { font-size: 12px; color: #909399; }
.collapse-enter-active, .collapse-leave-active { transition: max-height 0.2s ease, opacity 0.2s ease; }
.collapse-enter-from, .collapse-leave-to { max-height: 0; opacity: 0; }
.collapse-enter-to, .collapse-leave-from { max-height: 800px; opacity: 1; }

.code-content {
  margin: 0;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 断言表格 */
.assertions-table {
  margin: 0;
}

.assertion-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-name {
  font-weight: 500;
  color: #303133;
}

.error-message {
  color: #f56c6c;
  font-size: 13px;
}

.success-message {
  color: #67c23a;
  font-size: 13px;
}

/* 响应头表格 */
.headers-table {
  margin: 0;
}

/* 结果操作按钮 */
.result-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background: white;
}

/* 测试历史部分 */
.history-content {
  max-width: 100% !important;
  padding: 0 !important;
}

.history-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.history-toolbar .toolbar-left {
  display: flex;
  gap: 12px;
}

.history-toolbar .toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 测试历史卡片样式 */
.history-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 28px rgba(16,24,40,0.04);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  margin-bottom: 18px;
}
.history-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 44px rgba(16,24,40,0.08);
}

/* 历史表格增强：斑马线与悬停 */
.history-table :deep(.el-table__row) {
  transition: background-color 0.12s ease, transform 0.12s ease;
}
.history-table :deep(.el-table__row:nth-child(odd)) {
  background: linear-gradient(90deg, rgba(245,247,250,0.6), rgba(255,255,255,0));
}
.history-table :deep(.el-table__row:hover) {
  background: linear-gradient(90deg, rgba(240,249,255,0.8), rgba(246,253,255,0.4));
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16,24,40,0.04);
}

/* 工具栏按钮强调与过渡 */
.history-toolbar .el-button {
  border-radius: 8px;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
}
.history-toolbar .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

/* 分页样式微动效 */
.history-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e4e7ed;
  transition: background-color 0.12s ease, transform 0.12s ease;
}
.history-pagination:hover {
  transform: translateY(-2px);
  background: linear-gradient(180deg, #ffffff, #fbfdff);
}

/* 历史详情弹窗改进 */
.history-detail-content {
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

/* 历史记录表格 */
.history-table {
  width: 100%;
}

.history-table .time-text {
  font-size: 13px;
  color: #606266;
}

.executor-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.executor-avatar {
  flex-shrink: 0;
}

.executor-name {
  font-size: 14px;
  color: #303133;
}

.response-time {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.result-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.result-text {
  font-size: 13px;
  font-weight: 500;
}

.result-text.success {
  color: #67c23a;
}

.result-text.failed {
  color: #f56c6c;
}

/* 历史记录分页 */
.history-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.pagination-info {
  font-size: 13px;
  color: #606266;
}

/* 历史详情对话框样式 */
.history-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.history-detail-content .detail-section {
  margin-bottom: 24px;
}

.history-detail-content .detail-section:last-child {
  margin-bottom: 0;
}

.history-detail-content .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.history-detail-content .error-message {
  margin: 0;
  padding: 12px;
  background: #fef0f0;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 测试用例部分 */
.cases-content {
  max-width: 100% !important;
  padding: 0 !important;
}

.cases-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.cases-toolbar .toolbar-left {
  display: flex;
  gap: 12px;
}

.cases-toolbar .toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 相关用例卡片 */
.cases-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 28px rgba(16,24,40,0.04);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  margin-bottom: 18px;
}
.cases-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 44px rgba(16,24,40,0.08);
}

/* 用例表格 - 斑马线与行 hover */
.cases-table :deep(.el-table__row) {
  transition: background-color 0.12s ease, transform 0.12s ease;
}
.cases-table :deep(.el-table__row:nth-child(odd)) {
  background: linear-gradient(90deg, rgba(248,250,252,0.6), rgba(255,255,255,0));
}
.cases-table :deep(.el-table__row:hover) {
  background: linear-gradient(90deg, rgba(240,249,255,0.9), rgba(246,253,255,0.6));
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16,24,40,0.04);
}

/* case name cell as clickable card */
.case-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.12s ease, transform 0.12s ease;
}
.case-name-cell:hover {
  background: rgba(64,158,255,0.06);
  transform: translateX(4px);
}
.case-name-text {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

/* 优先级 & 类型标签更紧凑 */
.cases-table :deep(.el-tag) {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
}

/* 工具按钮微交互 */
.cases-table :deep(.el-button) {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.cases-table :deep(.el-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

/* 小屏幕下调整布局 */
@media (max-width: 800px) {
  .cases-card {
    padding: 6px;
  }
  .case-name-text {
    font-size: 13px;
  }
}

/* 强制使操作按钮不透明并置于行上方，防止下方用例内容透出 */
.cases-table :deep(.el-table__body .el-button) {
  position: relative;
  z-index: 5;
  background: rgba(255,255,255,0.98); /* 近乎不透明的白色背景，适配浅色主题 */
  opacity: 1 !important;
  border-radius: 6px;
  padding: 4px 8px;
}
.cases-table :deep(.el-button--text) {
  background: rgba(255,255,255,0.98);
  color: inherit;
}
.cases-table :deep(.el-button--text):hover {
  background: rgba(64,158,255,0.06);
}

/* 用例列表表格 */
.cases-table {
  width: 100%;
}

.cases-table :deep(.el-table__row) {
  cursor: pointer;
}

.cases-table :deep(.el-table__row:hover) {
  background: #f5f7fa;
}

.case-name-cell {
  cursor: pointer;
}

.case-name-cell:hover .case-name-text {
  color: #409eff;
}

.case-name-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  transition: color 0.2s;
}

/* 优先级标签样式优化 */
.cases-table :deep(.el-tag) {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
}

/* P0 - 最高优先级（红色） */
.cases-table :deep(.el-tag--danger) {
  background: linear-gradient(135deg, #f56c6c 0%, #ef4444 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(245, 108, 108, 0.3);
}

.cases-table :deep(.el-tag--danger:hover) {
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.4);
  transform: translateY(-1px);
}

/* P1 - 高优先级（橙色） */
.cases-table :deep(.el-tag--warning) {
  background: linear-gradient(135deg, #e6a23c 0%, #f59e0b 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(230, 162, 60, 0.3);
}

.cases-table :deep(.el-tag--warning:hover) {
  box-shadow: 0 4px 8px rgba(230, 162, 60, 0.4);
  transform: translateY(-1px);
}

/* P2 - 中等优先级（灰色） */
.cases-table :deep(.el-tag:not(.el-tag--danger):not(.el-tag--warning):not(.el-tag--info):not(.el-tag--success)) {
  background: linear-gradient(135deg, #909399 0%, #6b7280 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(144, 147, 153, 0.3);
}

.cases-table :deep(.el-tag:not(.el-tag--danger):not(.el-tag--warning):not(.el-tag--info):not(.el-tag--success):hover) {
  box-shadow: 0 4px 8px rgba(144, 147, 153, 0.4);
  transform: translateY(-1px);
}

/* P3 - 低优先级（蓝色） */
.cases-table :deep(.el-tag--info) {
  background: linear-gradient(135deg, #409eff 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.cases-table :deep(.el-tag--info:hover) {
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

/* 标签过渡动画 */
.cases-table :deep(.el-tag) {
  transition: all 0.3s ease;
}

/* 测试类型标签样式 */
.test-type-tag {
  font-weight: 500;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
}

/* 功能测试 - 蓝色 */
.cases-table :deep(.test-type-tag.el-tag--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3b82f6 100%);
  color: white;
  border: none;
}

/* 边界测试、回归测试 - 橙色 */
.cases-table :deep(.test-type-tag.el-tag--warning) {
  background: linear-gradient(135deg, #e6a23c 0%, #f59e0b 100%);
  color: white;
  border: none;
}

/* 异常测试 - 红色 */
.cases-table :deep(.test-type-tag.el-tag--danger) {
  background: linear-gradient(135deg, #f56c6c 0%, #ef4444 100%);
  color: white;
  border: none;
}

/* 安全测试、冒烟测试 - 绿色 */
.cases-table :deep(.test-type-tag.el-tag--success) {
  background: linear-gradient(135deg, #67c23a 0%, #10b981 100%);
  color: white;
  border: none;
}

/* 性能测试 - 灰色 */
.cases-table :deep(.test-type-tag.el-tag--info) {
  background: linear-gradient(135deg, #909399 0%, #6b7280 100%);
  color: white;
  border: none;
}

/* 测试数据单元格 */
.test-data-cell {
  padding: 6px 0;
}

.test-data-text {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #303133;
  line-height: 1.6;
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(to right, #f0f9ff 0%, #e6f7ff 100%);
  border-left: 3px solid #409eff;
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s;
}

.test-data-text:hover {
  background: linear-gradient(to right, #e6f7ff 0%, #d9ecff 100%);
  border-left-color: #66b1ff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

/* 预期结果单元格 */
.expected-result-cell {
  padding: 6px 0;
}

.result-summary {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #303133;
  line-height: 1.6;
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(to right, #f0f9ff 0%, #f5f7fa 100%);
  border-left: 3px solid #67c23a;
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s;
}

.result-summary:hover {
  background: linear-gradient(to right, #e6f7ff 0%, #eef1f6 100%);
  border-left-color: #85ce61;
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.1);
}

/* Tooltip样式 */
.tooltip-content {
  max-width: 500px;
}

.tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-json {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #e6f7ff;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 4px;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.tooltip-json::-webkit-scrollbar {
  width: 6px;
}

.tooltip-json::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.tooltip-json::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 用例分页 */
.cases-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

/* 用例表单样式 */
.case-form-tabs {
  margin: -20px -10px 0 -10px;
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
  background: #409eff;
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

/* 执行结果对话框 */
.execution-result-container {
  padding: 0;
}

/* Execute (调试) dialog improvements */
.execute-dialog .el-dialog__body {
  max-height: calc(70vh);
  overflow: auto;
  padding: 18px 24px;
}
.execute-dialog .el-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.execute-dialog .el-form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.execute-dialog .el-form-item .el-input,
.execute-dialog .el-form-item .el-select,
.execute-dialog .el-form-item .el-input-number {
  flex: 1;
}
.execute-dialog .el-form-item[label] .el-form-item__label {
  white-space: nowrap;
}
.execute-dialog .execute-variables {
  min-height: 120px;
  max-height: 220px;
  overflow: auto;
}

@media (min-width: 900px) {
  .execute-dialog .el-form {
    grid-template-columns: 1fr 320px;
  }
  .execute-dialog .el-form-item.break-full {
    grid-column: 1 / -1;
  }
}

@media (max-width: 899px) {
  .execute-dialog {
    --el-dialog-width: 90vw;
  }
  .execute-dialog .el-form {
    grid-template-columns: 1fr;
  }
}

/* Execution result styles moved to ExecutionResult.vue (scoped) */

/* 删除确认对话框样式 */
:deep(.delete-confirm-dialog) {
  .el-message-box__header {
    background: #fef0f0;
    border-bottom: 1px solid #fde2e2;
  }
  
  .el-message-box__title {
    color: #f56c6c;
    font-weight: 600;
  }
  
  .el-message-box__content {
    padding: 20px;
  }
  
  .el-message-box__message {
    color: #606266;
    line-height: 1.6;
  }
  
  .el-message-box__btns {
    padding: 16px 20px;
    background: #fafafa;
    border-top: 1px solid #e4e7ed;
  }
  
  .el-button--danger {
    background: #f56c6c;
    border-color: #f56c6c;
  }
  
  .el-button--danger:hover {
    background: #f78989;
    border-color: #f78989;
  }
}

/* 执行弹窗样式优化 */
.execute-dialog-enhanced {
  --el-dialog-padding-primary: 24px;
  --el-dialog-border-radius: 12px;
}

.execute-dialog-enhanced .el-dialog__header {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.execute-dialog-enhanced .el-dialog__header .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.execute-dialog-enhanced .el-dialog__body {
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.execute-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 执行目标信息卡片 */
.target-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
}

.target-info-card .el-card__body {
  padding: 20px;
}

.target-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.target-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.target-details {
  flex: 1;
}

.target-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.target-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.target-meta .el-tag {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
}

.target-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* 配置区块 */
.config-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.section-header svg {
  color: #409eff;
}

.section-header .el-tag {
  margin-left: auto;
}

.config-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.config-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
}

.config-card .el-card__header {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  background: #fafafa;
}

.config-card .el-card__body {
  padding: 20px;
}

/* URL预览 */
.url-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  color: #909399;
}

.preview-url {
  color: #409eff;
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-all;
}

/* 超时单位 */
.timeout-unit {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.card-header .card-icon {
  color: #409eff;
}

.advanced-card .card-header {
  color: #e6a23c;
}

.advanced-card .card-icon {
  color: #e6a23c;
}

.mode-card .card-header {
  color: #67c23a;
}

.mode-card .card-icon {
  color: #67c23a;
}

.config-card .el-card__body {
  padding: 20px;
}

/* 选项样式 */
.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-dot.dev { background: #67c23a; }
.option-dot.test { background: #e6a23c; }
.option-dot.staging { background: #f56c6c; }
.option-dot.prod { background: #909399; }

.option-desc {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

/* 表单项样式 */
.unit-text {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
}

.info-icon {
  margin-left: 6px;
  color: #909399;
  cursor: help;
}

.checkbox-text {
  margin-left: 8px;
  color: #303133;
}

/* 执行模式样式 */
.execution-mode-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.mode-option {
  margin: 0;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 80px;
}

.mode-option:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.mode-option.is-checked {
  border-color: #409eff;
  background: #ecf5ff;
}

.mode-content .mode-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.3;
  word-break: break-word;
}

.mode-content .mode-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  word-break: break-word;
}

/* 变量输入框样式 */
.variables-textarea .el-input__inner {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.variables-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.variable-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.variable-actions .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 执行摘要卡片 */
.summary-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border: none;
}

.summary-card .el-card__header {
  background: transparent;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 16px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.summary-header svg {
  color: #409eff;
}

.summary-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  min-width: 150px;
}

.summary-label {
  color: #909399;
  font-size: 13px;
}

.summary-value {
  color: #303133;
  font-size: 13px;
  font-weight: 500;
}

.variable-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

/* 底部样式 */
.execute-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.execute-btn {
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .execute-dialog-enhanced {
    width: 95vw !important;
    margin: 5vh auto;
  }

  .execute-dialog-content {
    gap: 16px;
  }

  .config-card .el-card__body {
    padding: 16px;
  }

  .el-row {
    --el-row-gutter: 16px;
  }

  .execution-mode-group {
    gap: 8px;
  }

  .mode-option {
    padding: 16px;
    min-height: 70px;
  }

  .execute-dialog-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .footer-info {
    justify-content: center;
  }

  .footer-actions {
    justify-content: center;
  }
}

/* 删除按钮样式优化 */
.form-actions .el-button--danger {
  background: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.form-actions .el-button--danger:hover {
  background: #f78989;
  border-color: #f78989;
}

.form-actions .el-button--danger:focus {
  background: #f56c6c;
  border-color: #f56c6c;
}

.form-actions .el-button--danger.is-loading {
  background: #f78989;
  border-color: #f78989;
}
</style>

