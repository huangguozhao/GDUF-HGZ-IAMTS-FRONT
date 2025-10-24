<template>
  <div class="api-detail-panel">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="header-left">
        <h2 class="api-title">{{ api?.name || '未知接口' }}</h2>
        <div class="api-info-line">
          <span class="api-path">{{ api?.path || api?.url || '-' }}</span>
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
        <div class="api-meta">
          <span class="meta-item">
            <span class="meta-label">认证方式：</span>
            <span class="meta-value">{{ getAuthTypeText(api?.authType || api?.auth_type) }}</span>
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
      <div v-if="activeTab === 'basic'" class="tab-content">
        <div class="form-section">
          <div class="section-title">所属项目</div>
          <el-select v-model="apiData.project" placeholder="请选择项目" class="form-select">
            <el-option label="电商支付系统" value="电商支付系统" />
          </el-select>
        </div>

        <div class="form-section">
          <div class="section-title">所属模块</div>
          <el-select 
            v-model="apiData.module" 
            placeholder="请选择模块" 
            class="form-select"
            v-loading="modulesLoading"
          >
            <el-option 
              v-for="module in availableModules" 
              :key="module.id"
              :label="module.name" 
              :value="module.name"
            >
              <span :style="{ paddingLeft: `${(module.level - 1) * 20}px` }">
                {{ module.level > 1 ? '└─ ' : '' }}{{ module.name }}
              </span>
            </el-option>
          </el-select>
          <div class="form-tip" v-if="availableModules.length === 0 && !modulesLoading">
            该项目下暂无模块
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">接口名称</div>
          <el-input v-model="apiData.name" placeholder="请输入接口名称" />
        </div>

        <div class="form-section">
          <div class="section-title">接口路径</div>
          <el-input v-model="apiData.path" placeholder="请输入接口路径" />
        </div>

        <div class="form-section">
          <div class="section-title">请求方法</div>
          <el-radio-group v-model="apiData.method">
            <el-radio label="GET">GET</el-radio>
            <el-radio label="POST">POST</el-radio>
            <el-radio label="PUT">PUT</el-radio>
            <el-radio label="DELETE">DELETE</el-radio>
          </el-radio-group>
        </div>

        <div class="form-section">
          <div class="section-title">接口描述</div>
          <el-input 
            v-model="apiData.description" 
            type="textarea"
            :rows="4"
            placeholder="请输入接口描述"
          />
        </div>

        <div class="form-section">
          <div class="section-title">标签</div>
          <div class="tag-list">
            <el-tag closable>用户管理</el-tag>
            <el-tag closable>信息更新</el-tag>
            <el-button size="small" text>+ 添加标签</el-button>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">前置条件</div>
          <el-input 
            v-model="apiData.precondition" 
            type="textarea"
            :rows="3"
            placeholder="请输入前置条件"
          />
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="handleSave">保存修改</el-button>
          <el-button @click="handleTest">执行测试</el-button>
          <el-button 
            type="danger" 
            :icon="Delete"
            @click="handleDelete"
            :loading="deleteLoading"
          >
            删除用例
          </el-button>
        </div>
      </div>

      <!-- 请求参数 -->
      <div v-if="activeTab === 'params'" class="tab-content params-content">
        <div class="params-header">
          <h3 class="params-title">Headers</h3>
          </div>
        <el-table 
          :data="headerParams" 
          class="params-table"
          border
        >
          <el-table-column label="参数名" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="row.name" placeholder="参数名" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="参数值" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="row.value" placeholder="参数值" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="参数描述">
            <template #default="{ row, $index }">
              <el-input v-model="row.description" placeholder="参数描述" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row, $index }">
              <el-button 
                size="small" 
                text 
                type="danger"
                @click="removeParam(headerParams, $index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-param-btn">
          <el-button size="small" @click="addParam(headerParams)">
            + 添加参数
          </el-button>
          </div>

        <div class="params-header">
          <h3 class="params-title">Params</h3>
        </div>
        <el-table 
          :data="queryParams" 
          class="params-table"
          border
        >
          <el-table-column label="参数名" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="row.name" placeholder="参数名" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="参数值" width="200">
            <template #default="{ row, $index }">
              <el-input v-model="row.value" placeholder="参数值" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="参数描述">
            <template #default="{ row, $index }">
              <el-input v-model="row.description" placeholder="参数描述" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row, $index }">
              <el-button 
                size="small" 
                text 
                type="danger"
                @click="removeParam(queryParams, $index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-param-btn">
          <el-button size="small" @click="addParam(queryParams)">
            + 添加参数
          </el-button>
        </div>

        <div class="params-header">
          <h3 class="params-title">Body</h3>
          <el-radio-group v-model="bodyType" size="small" class="body-type-selector">
            <el-radio-button label="json">JSON</el-radio-button>
            <el-radio-button label="form-data">form-data</el-radio-button>
            <el-radio-button label="raw">raw</el-radio-button>
          </el-radio-group>
        </div>

        <!-- JSON格式 -->
        <div v-if="bodyType === 'json'" class="body-section">
          <el-table 
            :data="bodyParams" 
            class="params-table"
            border
          >
            <el-table-column label="变量名" width="200">
              <template #default="{ row, $index }">
                <el-input v-model="row.name" placeholder="变量名" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="变量值" width="200">
              <template #default="{ row, $index }">
                <el-input v-model="row.value" placeholder="变量值" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="变量描述">
              <template #default="{ row, $index }">
                <el-input v-model="row.description" placeholder="变量描述" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row, $index }">
                <el-button 
                  size="small" 
                  text 
                  type="danger"
                  @click="removeParam(bodyParams, $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="add-param-btn">
            <el-button size="small" @click="addParam(bodyParams)">
              + 添加变量
            </el-button>
          </div>
        </div>

        <!-- Raw格式 -->
        <div v-else-if="bodyType === 'raw'" class="body-section">
          <el-input
            v-model="rawBody"
            type="textarea"
            :rows="10"
            placeholder='请输入请求体内容，例如：
{
  "userId": "user_12345",
  "userName": "测试用户",
  "userEmail": "test@example.com",
  "userRole": "admin"
}'
          />
        </div>

        <!-- form-data格式 -->
        <div v-else-if="bodyType === 'form-data'" class="body-section">
          <el-table 
            :data="formDataParams" 
            class="params-table"
            border
          >
            <el-table-column label="参数名" width="200">
              <template #default="{ row, $index }">
                <el-input v-model="row.name" placeholder="参数名" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="参数值" width="200">
              <template #default="{ row, $index }">
                <el-input v-model="row.value" placeholder="参数值" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="参数描述">
              <template #default="{ row, $index }">
                <el-input v-model="row.description" placeholder="参数描述" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row, $index }">
                <el-button 
                  size="small" 
                  text 
                  type="danger"
                  @click="removeParam(formDataParams, $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="add-param-btn">
            <el-button size="small" @click="addParam(formDataParams)">
              + 添加参数
            </el-button>
          </div>
        </div>

        <div class="params-actions">
          <el-button type="primary" @click="handleSaveParams">保存</el-button>
          <el-button @click="handleFormatParams">格式化</el-button>
        </div>
      </div>

      <!-- 响应结果 -->
      <div v-if="activeTab === 'result'" class="tab-content result-content">
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
            <pre class="code-content"><code>{{ formattedResponse }}</code></pre>
          </div>
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

      <!-- 测试历史 -->
      <div v-if="activeTab === 'history'" class="tab-content history-content">
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

      <!-- 相关用例 -->
      <div v-if="activeTab === 'cases'" class="tab-content cases-content">
        <!-- 用例工具栏 -->
        <div class="cases-toolbar">
          <div class="toolbar-left">
            <el-select v-model="casesFilter.type" placeholder="所有测试类型" size="small" style="width: 150px;" clearable>
              <el-option label="所有测试类型" value="" />
              <el-option label="功能测试" value="functional" />
              <el-option label="边界测试" value="boundary" />
              <el-option label="异常测试" value="exception" />
              <el-option label="安全测试" value="security" />
            </el-select>
            <el-select v-model="casesFilter.priority" placeholder="所有优先级" size="small" style="width: 130px;" clearable>
              <el-option label="所有优先级" value="" />
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
            <el-select v-model="casesFilter.sortBy" placeholder="默认排序" size="small" style="width: 130px;">
              <el-option label="默认排序" value="default" />
              <el-option label="按名称排序" value="name" />
              <el-option label="按创建时间" value="created" />
              <el-option label="按更新时间" value="updated" />
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
      :title="isExecutingApi ? '执行接口测试配置' : '执行测试用例配置'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="executeFormData" label-width="120px">
        <el-form-item label="执行环境">
          <el-select v-model="executeFormData.environment" placeholder="请选择执行环境" style="width: 100%">
            <el-option label="开发环境 (dev)" value="dev" />
            <el-option label="测试环境 (test)" value="test" />
            <el-option label="预发布环境 (staging)" value="staging" />
            <el-option label="生产环境 (prod)" value="prod" />
          </el-select>
        </el-form-item>

        <el-form-item label="Base URL">
          <el-input 
            v-model="executeFormData.baseUrl" 
            placeholder="留空则使用环境默认URL"
          />
        </el-form-item>

        <el-form-item label="超时时间">
          <el-input-number 
            v-model="executeFormData.timeout" 
            :min="1" 
            :max="300"
            placeholder="秒"
            style="width: 150px"
          />
          <span style="margin-left: 8px; color: #909399;">秒</span>
        </el-form-item>

        <!-- 接口测试独有配置 -->
        <template v-if="isExecutingApi">
          <el-form-item label="并发执行数">
            <el-input-number 
              v-model="executeFormData.concurrency" 
              :min="1" 
              :max="10"
              placeholder="并发数"
              style="width: 150px"
            />
            <span style="margin-left: 8px; color: #909399;">最大10个</span>
          </el-form-item>

          <el-form-item label="优先级过滤">
            <el-select 
              v-model="executeFormData.caseFilter.priority" 
              multiple 
              placeholder="选择要执行的优先级"
              style="width: 100%"
            >
              <el-option label="P0（最高优先级）" value="P0" />
              <el-option label="P1（高优先级）" value="P1" />
              <el-option label="P2（中等优先级）" value="P2" />
              <el-option label="P3（低优先级）" value="P3" />
            </el-select>
          </el-form-item>

          <el-form-item label="标签过滤">
            <el-select 
              v-model="executeFormData.caseFilter.tags" 
              multiple 
              filterable
              allow-create
              placeholder="选择或输入标签"
              style="width: 100%"
            >
              <el-option label="冒烟测试" value="冒烟测试" />
              <el-option label="回归测试" value="回归测试" />
              <el-option label="功能测试" value="功能测试" />
            </el-select>
          </el-form-item>

          <el-form-item label="执行顺序">
            <el-select v-model="executeFormData.executionOrder" placeholder="选择执行顺序" style="width: 100%">
              <el-option label="优先级降序（推荐）" value="priority_desc" />
              <el-option label="优先级升序" value="priority_asc" />
              <el-option label="名称升序" value="name_asc" />
              <el-option label="名称降序" value="name_desc" />
            </el-select>
          </el-form-item>

          <el-form-item label="仅启用用例">
            <el-switch v-model="executeFormData.caseFilter.enabledOnly" />
            <span style="margin-left: 8px; color: #909399;">只执行已启用的测试用例</span>
          </el-form-item>
        </template>

        <el-form-item label="执行模式">
          <el-radio-group v-model="executeFormData.async">
            <el-radio :label="false">同步执行</el-radio>
            <el-radio :label="true">异步执行</el-radio>
          </el-radio-group>
          <div style="margin-top: 8px; color: #909399; font-size: 12px;">
            同步执行会等待结果返回，异步执行会立即返回任务ID
          </div>
        </el-form-item>

        <el-form-item label="执行变量">
          <el-input 
            v-model="executeVariables" 
            type="textarea"
            :rows="4"
            placeholder='可选，JSON格式的变量，例如：&#10;{&#10;  "username": "testuser",&#10;  "password": "Test@123"&#10;}'
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="executeDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmExecute" 
            :loading="executing"
          >
            {{ executing ? '执行中...' : '开始执行' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 执行结果对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="测试执行结果"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="execution-result-container" v-if="executionResult">
        <!-- 结果状态横幅 -->
        <div class="result-banner" :class="'status-' + executionResult.status">
          <div class="banner-icon">
            <el-icon v-if="executionResult.status === 'passed'" :size="60" color="#67c23a">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else :size="60" color="#f56c6c">
              <CircleCloseFilled />
            </el-icon>
          </div>
          <div class="banner-content">
            <h3 class="result-title">
              {{ executionResult.status === 'passed' ? '✓ 测试通过' : '✗ 测试失败' }}
            </h3>
            <p class="result-subtitle">{{ executionResult.caseName }}</p>
          </div>
        </div>

        <!-- 执行信息 -->
        <div class="result-info-section">
          <div class="info-grid" :class="{ 'info-grid-api': executionResult.totalCases }">
            <div class="info-card">
              <div class="info-label">执行ID</div>
              <div class="info-value">{{ executionResult.executionId }}</div>
            </div>
            <div class="info-card" v-if="!executionResult.totalCases">
              <div class="info-label">响应状态码</div>
              <div class="info-value">
                <el-tag 
                  :type="executionResult.responseStatus >= 200 && executionResult.responseStatus < 300 ? 'success' : 'danger'"
                  size="small"
                >
                  {{ executionResult.responseStatus }}
                </el-tag>
              </div>
            </div>
            <div class="info-card">
              <div class="info-label">执行耗时</div>
              <div class="info-value highlight">
                {{ executionResult.duration < 1000 ? executionResult.duration + 'ms' : (executionResult.duration / 1000).toFixed(2) + 's' }}
              </div>
            </div>
            <div class="info-card">
              <div class="info-label">{{ executionResult.totalCases ? '用例数' : '断言结果' }}</div>
              <div class="info-value">
                <template v-if="executionResult.totalCases">
                  <span class="total-count">{{ executionResult.totalCases }} 个</span>
                </template>
                <template v-else>
                  <span class="success-count">{{ executionResult.assertionsPassed }} 通过</span>
                  <span class="divider">/</span>
                  <span class="failed-count">{{ executionResult.assertionsFailed }} 失败</span>
                </template>
              </div>
            </div>
            <!-- 接口测试专用信息 -->
            <template v-if="executionResult.totalCases">
              <div class="info-card">
                <div class="info-label">通过率</div>
                <div class="info-value highlight">
                  <span :style="{ 
                    color: executionResult.successRate >= 90 ? '#67c23a' : 
                           executionResult.successRate >= 70 ? '#e6a23c' : '#f56c6c'
                  }">
                    {{ executionResult.successRate.toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div class="info-card">
                <div class="info-label">通过/失败</div>
                <div class="info-value">
                  <span class="success-count">{{ executionResult.assertionsPassed }}</span>
                  <span class="divider">/</span>
                  <span class="failed-count">{{ executionResult.assertionsFailed }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="result-time-section">
          <div class="time-item">
            <span class="time-label">开始时间：</span>
            <span class="time-value">{{ formatTime(executionResult.startTime) }}</span>
          </div>
          <div class="time-item">
            <span class="time-label">结束时间：</span>
            <span class="time-value">{{ formatTime(executionResult.endTime) }}</span>
          </div>
        </div>

        <!-- 失败信息（如果有） -->
        <div class="result-failure-section" v-if="executionResult.status === 'failed' && executionResult.failureMessage">
          <div class="failure-title">失败原因</div>
          <div class="failure-message">{{ executionResult.failureMessage }}</div>
        </div>

        <!-- 用例执行明细（接口测试） -->
        <div class="case-results-section" v-if="executionResult.caseResults && executionResult.caseResults.length > 0">
          <div class="case-results-title">用例执行明细</div>
          <el-table 
            :data="executionResult.caseResults" 
            class="case-results-table"
            border
            stripe
          >
            <el-table-column label="用例编码" width="150" prop="case_code">
              <template #default="{ row }">
                <span class="case-code">{{ row.case_code || row.caseCode || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="用例名称" min-width="200">
              <template #default="{ row }">
                <span class="case-name">{{ row.case_name || row.caseName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="执行状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === 'passed' ? 'success' : row.status === 'failed' ? 'danger' : 'info'" 
                  size="small"
                >
                  {{ row.status === 'passed' ? '通过' : row.status === 'failed' ? '失败' : '跳过' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="响应状态码" width="120" align="center">
              <template #default="{ row }">
                <el-tag 
                  v-if="row.response_status || row.responseStatus"
                  :type="(row.response_status || row.responseStatus) >= 200 && (row.response_status || row.responseStatus) < 300 ? 'success' : 'danger'" 
                  size="small"
                >
                  {{ row.response_status || row.responseStatus }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="执行耗时" width="120" align="center">
              <template #default="{ row }">
                <span class="duration-text">{{ row.duration }}ms</span>
              </template>
            </el-table-column>
            <el-table-column label="失败原因" min-width="200">
              <template #default="{ row }">
                <span 
                  v-if="row.failure_message || row.failureMessage" 
                  class="failure-text"
                >
                  {{ row.failure_message || row.failureMessage }}
                </span>
                <span v-else class="success-text">✓ 执行成功</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 操作链接 -->
        <div class="result-links-section">
          <el-button 
            type="primary" 
            :icon="Document"
            @click="handleViewLogs"
            v-if="executionResult.logsLink"
          >
            查看执行日志
          </el-button>
          <el-button 
            :icon="DocumentCopy"
            @click="handleViewReport"
            v-if="executionResult.reportId"
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
import { getModulesByProject, updateApi } from '@/api/project'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

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

const emit = defineEmits(['select-case', 'edit-case', 'delete-case', 'close', 'refresh-cases', 'refresh'])

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

// 模块相关状态
const availableModules = ref([])
const modulesLoading = ref(false)

// 计算属性：从props.api中获取真实数据
// 可编辑的接口数据
const apiData = reactive({
  project: '',
  module: '',
  moduleId: null,
  name: '',
  path: '',
  method: 'GET',
  description: '',
  precondition: '',
  tags: [],
  requestParameters: null,
  requestHeaders: null,
  requestBody: null,
  requestBodyType: 'json'
})

// 监听 props.api 变化，更新表单数据
watch(
  () => props.api,
  (newApi) => {
    if (newApi) {
      apiData.project = newApi.project_name || newApi.projectName || '-'
      apiData.module = newApi.module_name || newApi.moduleName || '-'
      apiData.moduleId = newApi.module_id || newApi.moduleId
      apiData.name = newApi.name || ''
      apiData.path = newApi.path || newApi.url || ''
      apiData.method = newApi.method || 'GET'
      apiData.description = newApi.description || ''
      apiData.precondition = newApi.precondition || newApi.pre_condition || ''
      apiData.tags = newApi.tags || []
      apiData.requestParameters = newApi.request_parameters || newApi.requestParameters
      apiData.requestHeaders = newApi.request_headers || newApi.requestHeaders
      apiData.requestBody = newApi.request_body || newApi.requestBody
      apiData.requestBodyType = newApi.request_body_type || newApi.requestBodyType || 'json'
    }
  },
  { immediate: true }
)

/**
 * 加载项目下的模块列表
 */
const loadModules = async () => {
  const projectId = props.api?.project_id || props.api?.projectId
  
  if (!projectId) {
    console.warn('无法获取项目ID，无法加载模块列表')
    return
  }
  
  try {
    modulesLoading.value = true
    console.log('开始加载项目模块列表，项目ID:', projectId)
    
    const response = await getModulesByProject(projectId, {
      structure: 'tree',
      status: 'active',
      includeStatistics: false
    })
    
    console.log('模块列表API响应:', response)
    console.log('响应数据类型:', typeof response.data)
    console.log('响应数据内容:', response.data)
    
    if (response.code === 1 && response.data) {
      // 扁平化树形结构，便于展示
      const flattenModules = (modules, level = 1) => {
        let result = []
        if (!modules || !Array.isArray(modules)) {
          console.warn('模块数据不是数组:', modules)
          return result
        }
        
        modules.forEach(module => {
          result.push({
            id: module.moduleId || module.module_id || module.id,
            name: module.name || module.moduleName || '未命名模块',
            level: level
          })
          if (module.children && Array.isArray(module.children) && module.children.length > 0) {
            result = result.concat(flattenModules(module.children, level + 1))
          }
        })
        return result
      }
      
      // 尝试多种可能的数据结构
      let modulesData = []
      if (Array.isArray(response.data)) {
        // 直接是数组
        modulesData = response.data
      } else if (response.data.items && Array.isArray(response.data.items)) {
        // 包含items字段
        modulesData = response.data.items
      } else if (response.data.modules && Array.isArray(response.data.modules)) {
        // 包含modules字段
        modulesData = response.data.modules
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // 嵌套data字段
        modulesData = response.data.data
      }
      
      console.log('提取的模块数据:', modulesData)
      availableModules.value = flattenModules(modulesData)
      console.log('扁平化后的模块列表:', availableModules.value)
      console.log('模块数量:', availableModules.value.length)
    } else {
      console.warn('获取模块列表失败:', response.msg || '响应code不为1')
      availableModules.value = []
    }
  } catch (error) {
    console.error('加载模块列表失败:', error)
    ElMessage.error('加载模块列表失败')
    availableModules.value = []
  } finally {
    modulesLoading.value = false
  }
}

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

// ==================== 测试历史数据 ====================
const historySearchText = ref('')
const historyFilter = reactive({
  period: '7days',
  status: ''
})

const historyPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const historyTotal = ref(0)
const historyRecords = ref([])
const historyLoading = ref(false)
const historyDetailDialogVisible = ref(false)
const currentHistoryDetail = ref(null)

// 导出历史相关
const exportHistoryDialogVisible = ref(false)
const exportingHistory = ref(false)
const exportHistoryForm = reactive({
  format: 'excel',
  scope: 'current',
  includeFields: [
    'testTime', 'executor', 'environment', 'executionType', 
    'responseTime', 'status', 'totalCases', 'passedCases', 
    'failedCases', 'successRate'
  ],
  fileName: ''
})

// 所有可用字段
const allExportFields = [
  'testTime', 'executor', 'environment', 'executionType',
  'responseTime', 'status', 'totalCases', 'executedCases',
  'passedCases', 'failedCases', 'skippedCases', 'successRate',
  'errorMessage', 'browser', 'appVersion', 'reportUrl', 'executionConfig'
]

/**
 * 计算时间范围
 */
const getTimeRange = () => {
  if (!historyFilter.period || historyFilter.period === 'all') {
    return { start: null, end: null }
  }
  
  const now = new Date()
  const end = now.toISOString()
  let start = null
  
  switch (historyFilter.period) {
    case '7days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      break
    case '30days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      break
    case '90days':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      break
  }
  
  return { start, end }
}

/**
 * 加载执行历史记录
 */
const loadHistoryRecords = async () => {
  try {
    historyLoading.value = true
    
    const timeRange = getTimeRange()
    const params = {
      execution_scope: 'api',  // 接口执行历史
      ref_id: props.api?.api_id || props.api?.id,  // 接口ID
      status: historyFilter.status || undefined,
      start_time_begin: timeRange.start,
      start_time_end: timeRange.end,
      search_keyword: historySearchText.value || undefined,
      page: historyPagination.currentPage,
      page_size: historyPagination.pageSize,
      sort_by: 'start_time',
      sort_order: 'desc'
    }
    
    const response = await getExecutionRecords(params)
    
    if (response.code === 1 && response.data) {
      const { items, total } = response.data
      
      // 转换数据格式以适配模板 - 后端返回的是驼峰命名
      historyRecords.value = items.map(item => ({
        id: item.recordId,
        recordId: item.recordId,
        testTime: formatTime(item.startTime),
        startTime: item.startTime,
        endTime: item.endTime,
        executor: item.executorInfo?.name || '未知',
        executorId: item.executedBy,
        executorAvatar: item.executorInfo?.avatarUrl || '',
        responseTime: formatDuration(item.durationSeconds),
        durationSeconds: item.durationSeconds,
        status: mapExecutionStatus(item.status),
        executionStatus: item.status,
        executionType: item.executionType,
        environment: item.environment,
        totalCases: item.totalCases,
        executedCases: item.executedCases,
        passedCases: item.passedCases,
        failedCases: item.failedCases,
        skippedCases: item.skippedCases,
        successRate: item.successRate,
        errorMessage: item.errorMessage,
        reportUrl: item.reportUrl,
        scopeName: item.scopeName,
        browser: item.browser,
        appVersion: item.appVersion,
        executionConfig: item.executionConfig,
        logFilePath: item.logFilePath,
        triggeredTaskId: item.triggeredTaskId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
      
      historyTotal.value = total
    } else {
      ElMessage.error(response.msg || '加载执行历史失败')
      historyRecords.value = []
      historyTotal.value = 0
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
    ElMessage.error('加载执行历史失败: ' + (error.message || '未知错误'))
    historyRecords.value = []
    historyTotal.value = 0
  } finally {
    historyLoading.value = false
  }
}

/**
 * 格式化执行状态
 */
const mapExecutionStatus = (status) => {
  const statusMap = {
    'completed': 'passed',
    'failed': 'failed',
    'running': 'running',
    'cancelled': 'cancelled'
  }
  return statusMap[status] || status
}

/**
 * 格式化持续时间
 */
const formatDuration = (seconds) => {
  if (!seconds) return '-'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}分${remainingSeconds}秒`
}

/**
 * 过滤后的历史记录（前端额外过滤，主要筛选已在后端完成）
 */
const filteredHistoryRecords = computed(() => {
  return historyRecords.value
})

/**
 * 查看历史详情
 */
const handleViewHistoryDetail = async (record) => {
  try {
    const response = await getExecutionRecordById(record.recordId)
    if (response.code === 1 && response.data) {
      currentHistoryDetail.value = response.data
      historyDetailDialogVisible.value = true
    } else {
      ElMessage.error(response.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取执行记录详情失败:', error)
    ElMessage.error('获取详情失败: ' + (error.message || '未知错误'))
  }
}

/**
 * 从历史记录重新测试
 */
const handleRetestFromHistory = async (record) => {
  try {
    // 获取历史记录的执行配置
    const response = await getExecutionRecordById(record.recordId)
    if (response.code === 1 && response.data) {
      let historyConfig = response.data.executionConfig
      
      // 解析执行配置JSON
      if (historyConfig && typeof historyConfig === 'string') {
        try {
          historyConfig = JSON.parse(historyConfig)
        } catch (e) {
          console.error('解析执行配置失败:', e)
        }
      }
      
      // 使用历史配置重新执行
      ElMessageBox.confirm(
        `确定要使用历史记录 #${record.recordId} 的配置重新执行测试吗？`,
        '重新测试',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(async () => {
        const executeData = {
          environment: historyConfig?.environment || record.environment,
          baseUrl: historyConfig?.baseUrl,
          timeout: historyConfig?.timeout,
          authOverride: historyConfig?.authOverride,
          variables: historyConfig?.variables,
          async: false
        }
        
        // 执行测试
        const executeResponse = await executeTestCase(props.api.id, props.api.id, executeData)
        if (executeResponse.code === 1) {
          ElMessage.success('测试执行成功')
          // 刷新历史记录
          await loadHistoryRecords()
        } else {
          ElMessage.error(executeResponse.msg || '执行失败')
        }
      }).catch(() => {
        // 取消
      })
    }
  } catch (error) {
    console.error('重新测试失败:', error)
    ElMessage.error('重新测试失败: ' + (error.message || '未知错误'))
  }
}

/**
 * 删除历史记录
 */
const handleDeleteHistory = async (record) => {
  ElMessageBox.confirm(
    `确定要删除这条测试记录吗？删除后将无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const response = await deleteExecutionRecord(record.recordId)
      if (response.code === 1) {
    ElMessage.success('删除成功')
        // 刷新列表
        await loadHistoryRecords()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除执行记录失败:', error)
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 历史记录分页变化
 */
const handleHistorySizeChange = (pageSize) => {
  historyPagination.pageSize = pageSize
  historyPagination.currentPage = 1  // 重置到第一页
  loadHistoryRecords()
}

const handleHistoryPageChange = (page) => {
  historyPagination.currentPage = page
  loadHistoryRecords()
}

/**
 * 建议的文件名
 */
const suggestedFileName = computed(() => {
  const apiName = props.api?.name || '接口'
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const ext = exportHistoryForm.format === 'excel' ? 'xlsx' : exportHistoryForm.format
  return `${apiName}_测试历史_${timestamp}.${ext}`
})

/**
 * 字段选择快捷操作
 */
const selectAllFields = () => {
  exportHistoryForm.includeFields = [...allExportFields]
}

const clearAllFields = () => {
  exportHistoryForm.includeFields = []
}

const selectRecommendedFields = () => {
  exportHistoryForm.includeFields = [
    'testTime', 'executor', 'environment', 'executionType', 
    'responseTime', 'status', 'totalCases', 'passedCases', 
    'failedCases', 'successRate'
  ]
}

/**
 * 打开导出对话框
 */
const handleOpenExportHistoryDialog = () => {
  // 重置为推荐字段
  selectRecommendedFields()
  exportHistoryForm.format = 'excel'
  exportHistoryForm.scope = 'current'
  exportHistoryForm.fileName = ''
  
  exportHistoryDialogVisible.value = true
}

/**
 * 确认导出测试历史
 */
const handleConfirmExportHistory = async () => {
  try {
    exportingHistory.value = true
    
    // 确定要导出的数据
    const dataToExport = exportHistoryForm.scope === 'current' 
      ? filteredHistoryRecords.value 
      : historyRecords.value
    
    if (dataToExport.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    
    // 字段映射配置
    const fieldMapping = {
      'testTime': { label: '测试时间', getValue: (r) => r.testTime },
      'executor': { label: '执行人', getValue: (r) => r.executor },
      'environment': { label: '执行环境', getValue: (r) => r.environment || '-' },
      'executionType': { label: '执行类型', getValue: (r) => {
        const typeMap = {
          'manual': '手动执行',
          'auto': '自动执行',
          'scheduled': '定时执行',
          'api': '接口调用'
        }
        return typeMap[r.executionType] || r.executionType || '-'
      }},
      'responseTime': { label: '响应时间', getValue: (r) => r.responseTime },
      'status': { label: '测试结果', getValue: (r) => getStatusText(r.status) },
      'totalCases': { label: '总用例数', getValue: (r) => r.totalCases || 0 },
      'executedCases': { label: '已执行数', getValue: (r) => r.executedCases || 0 },
      'passedCases': { label: '通过数', getValue: (r) => r.passedCases || 0 },
      'failedCases': { label: '失败数', getValue: (r) => r.failedCases || 0 },
      'skippedCases': { label: '跳过数', getValue: (r) => r.skippedCases || 0 },
      'successRate': { label: '成功率', getValue: (r) => {
        if (r.successRate !== undefined && r.successRate !== null) {
          return `${(r.successRate * 100).toFixed(2)}%`
        }
        return '-'
      }},
      'errorMessage': { label: '错误信息', getValue: (r) => r.errorMessage || '-' },
      'browser': { label: '浏览器', getValue: (r) => r.browser || '-' },
      'appVersion': { label: '应用版本', getValue: (r) => r.appVersion || '-' },
      'reportUrl': { label: '报告地址', getValue: (r) => r.reportUrl || '-' },
      'executionConfig': { label: '执行配置', getValue: (r) => {
        if (!r.executionConfig) return '-'
        if (typeof r.executionConfig === 'string') {
          return r.executionConfig
        }
        return JSON.stringify(r.executionConfig)
      }}
    }
    
    // 根据选择的字段过滤数据
    const filteredData = dataToExport.map(record => {
      const filtered = {}
      exportHistoryForm.includeFields.forEach(field => {
        if (fieldMapping[field]) {
          filtered[fieldMapping[field].label] = fieldMapping[field].getValue(record)
        }
      })
      return filtered
    })
    
    // 文件名
    const fileName = exportHistoryForm.fileName || suggestedFileName.value
    
    // 根据格式导出
    if (exportHistoryForm.format === 'excel') {
      exportToExcel(filteredData, fileName)
    } else if (exportHistoryForm.format === 'json') {
      exportToJson(filteredData, fileName)
    } else if (exportHistoryForm.format === 'csv') {
      exportToCsv(filteredData, fileName)
    }
    
    ElMessage.success('导出成功')
    exportHistoryDialogVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败: ' + (error.message || '未知错误'))
  } finally {
    exportingHistory.value = false
  }
}

/**
 * 导出为Excel
 */
const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '测试历史')
  
  // 设置列宽
  const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
  worksheet['!cols'] = colWidths
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, fileName)
}

/**
 * 导出为JSON
 */
const exportToJson = (data, fileName) => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  saveAs(blob, fileName)
}

/**
 * 导出为CSV
 */
const exportToCsv = (data, fileName) => {
  if (data.length === 0) {
    ElMessage.warning('没有数据可以导出')
    return
  }
  
  // 获取列标题
  const headers = Object.keys(data[0])
  
  // 生成CSV内容
  const csvContent = [
    headers.join(','),  // 标题行
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || ''
        // 如果值包含逗号或引号，需要用引号包裹并转义
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  // 添加BOM以支持Excel正确识别UTF-8
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, fileName)
}

// 测试用例数据
const casesSearchText = ref('')
const casesFilter = reactive({
  type: '',
  priority: '',
  sortBy: 'default'
})

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
    priority: '高',
    testData: '有效的用户ID和完整更新信息（50字符以内的姓名、符合规则的电子邮箱和手机号码）',
    expectedResult: '状态码 200，更新成功'
  },
  {
    id: 2,
    name: '字段长度边界测试',
    caseType: 'boundary',
    priority: '中',
    testData: '用户名长度为最大允许值（…）',
    expectedResult: '响应包含验证错误信息'
  },
  {
    id: 3,
    name: '缺少必填字段测试',
    caseType: 'exception',
    priority: '高',
    testData: '缺少email、phone等关键字段',
    expectedResult: '状态码 400，参数错误'
  },
  {
    id: 4,
    name: '无权限用户操作测试',
    caseType: 'security',
    priority: '高',
    testData: '使用无权限用户的Token访问',
    expectedResult: '状态码 403，权限拒绝'
  },
  {
    id: 5,
    name: 'XSS注入测试',
    caseType: 'security',
    priority: '中',
    testData: '在各个字段中注入XSS代码',
    expectedResult: '状态码 400，参数错误'
  },
  {
    id: 6,
    name: '大数据量测试',
    caseType: 'boundary',
    priority: '低',
    testData: '提交包含大量数据的请求',
    expectedResult: '响应时间 < 2秒'
  }
])

// 过滤后的用例
const filteredCases = computed(() => {
  let cases = props.relatedCases.length > 0 ? props.relatedCases : testCasesList.value
  
  // 类型过滤
  if (casesFilter.type) {
    cases = cases.filter(c => c.caseType === casesFilter.type)
  }
  
  // 优先级过滤
  if (casesFilter.priority) {
    cases = cases.filter(c => c.priority === casesFilter.priority)
  }
  
  // 搜索过滤
  if (casesSearchText.value) {
    const keyword = casesSearchText.value.toLowerCase()
    cases = cases.filter(c => 
      c.name.toLowerCase().includes(keyword) ||
      (c.testData && c.testData.toLowerCase().includes(keyword))
    )
  }
  
  return cases
})

// 获取测试类型标签颜色
const getTestTypeTagType = (type) => {
  const typeMap = {
    'functional': 'primary',     // 蓝色 - 功能测试
    'boundary': 'warning',       // 橙色 - 边界测试
    'exception': 'danger',       // 红色 - 异常测试
    'security': 'success',       // 绿色 - 安全测试
    'performance': 'info',       // 灰色 - 性能测试
    'integration': 'primary',    // 蓝色 - 集成测试
    'smoke': 'success',          // 绿色 - 冒烟测试
    'regression': 'warning'      // 橙色 - 回归测试
  }
  return typeMap[type] || ''
}

// 获取测试类型文本
const getTestTypeText = (type) => {
  const textMap = {
    'functional': '功能测试',
    'boundary': '边界测试',
    'exception': '异常测试',
    'security': '安全测试',
    'performance': '性能测试',
    'integration': '集成测试',
    'smoke': '冒烟测试',
    'regression': '回归测试'
  }
  return textMap[type] || type || '未分类'
}

// 兼容旧函数名
const getCaseTypeTagType = getTestTypeTagType
const getCaseTypeText = getTestTypeText

// 获取优先级标签颜色
const getPriorityTagType = (priority) => {
  const priorityMap = {
    // P0-P3 优先级映射
    'P0': 'danger',    // 红色 - 最高优先级（严重/紧急）
    'P1': 'warning',   // 橙色 - 高优先级（重要）
    'P2': '',          // 灰色 - 中等优先级（正常）
    'P3': 'info',      // 蓝色 - 低优先级（次要）
    // 兼容中文优先级
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return priorityMap[priority] || ''
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 格式化测试数据（preConditions）
 */
const formatTestData = (preConditions) => {
  if (!preConditions) return '📋 无测试数据'
  
  // 如果是字符串，尝试解析为JSON
  if (typeof preConditions === 'string') {
    try {
      preConditions = JSON.parse(preConditions)
    } catch (e) {
      return `📝 ${preConditions}`
    }
  }
  
  // 如果是对象，格式化为键值对形式
  if (typeof preConditions === 'object' && preConditions !== null) {
    const pairs = []
    for (const [key, value] of Object.entries(preConditions)) {
      // 美化键名
      const displayKey = key.charAt(0).toUpperCase() + key.slice(1)
      // 处理空值
      const displayValue = value === '' ? '(空)' : value
      pairs.push(`${displayKey}: ${displayValue}`)
    }
    return pairs.length > 0 ? `📊 ${pairs.join(' | ')}` : '📋 无测试数据'
  }
  
  return `📝 ${String(preConditions)}`
}

/**
 * 格式化预期结果（expectedResponseBody）
 */
const formatExpectedResult = (expectedResponseBody) => {
  if (!expectedResponseBody) return '📋 无预期结果'
  
  // 如果是字符串，尝试解析为JSON并美化
  if (typeof expectedResponseBody === 'string') {
    try {
      const parsed = JSON.parse(expectedResponseBody)
      // 提取关键信息
      if (parsed.code !== undefined && parsed.msg) {
        // 根据code值添加不同图标
        const icon = parsed.code === 1 ? '✅' : parsed.code === -1 ? '❌' : '⚠️'
        return `${icon} code: ${parsed.code} | msg: ${parsed.msg}`
      }
      // 如果有data字段，显示它
      if (parsed.data !== undefined && parsed.data !== null) {
        return `✓ 包含数据: ${typeof parsed.data === 'object' ? 'Object' : parsed.data}`
      }
      return `📄 ${JSON.stringify(parsed)}`
    } catch (e) {
      // 如果解析失败，直接返回字符串
      return `📝 ${expectedResponseBody}`
    }
  }
  
  // 如果是对象，格式化为JSON字符串
  if (typeof expectedResponseBody === 'object' && expectedResponseBody !== null) {
    if (expectedResponseBody.code !== undefined && expectedResponseBody.msg) {
      const icon = expectedResponseBody.code === 1 ? '✅' : expectedResponseBody.code === -1 ? '❌' : '⚠️'
      return `${icon} code: ${expectedResponseBody.code} | msg: ${expectedResponseBody.msg}`
    }
    return `📄 ${JSON.stringify(expectedResponseBody)}`
  }
  
  return `📝 ${String(expectedResponseBody)}`
}

/**
 * 格式化完整测试数据（用于tooltip）
 */
const formatTestDataFull = (preConditions) => {
  if (!preConditions) return '暂无测试数据'
  
  // 如果是字符串，尝试解析为JSON
  if (typeof preConditions === 'string') {
    try {
      const parsed = JSON.parse(preConditions)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return preConditions
    }
  }
  
  // 如果是对象，格式化为美化的JSON
  if (typeof preConditions === 'object' && preConditions !== null) {
    return JSON.stringify(preConditions, null, 2)
  }
  
  return String(preConditions)
}

/**
 * 格式化完整预期结果（用于tooltip）
 */
const formatExpectedResultFull = (expectedResponseBody) => {
  if (!expectedResponseBody) return '暂无预期结果'
  
  // 如果是字符串，尝试解析为JSON
  if (typeof expectedResponseBody === 'string') {
    try {
      const parsed = JSON.parse(expectedResponseBody)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return expectedResponseBody
    }
  }
  
  // 如果是对象，格式化为美化的JSON
  if (typeof expectedResponseBody === 'object' && expectedResponseBody !== null) {
    return JSON.stringify(expectedResponseBody, null, 2)
  }
  
  return String(expectedResponseBody)
}

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

// 执行测试用例相关变量
const executeDialogVisible = ref(false)
const executing = ref(false)
const executeVariables = ref('')
const isExecutingApi = ref(false)  // 标记是否为执行接口测试（非单个用例）
const executeFormData = reactive({
  environment: 'dev',
  baseUrl: '',
  timeout: 30,
  variables: {},
  async: false,
  concurrency: 3,
  caseFilter: {
    priority: [],
    tags: [],
    enabledOnly: true
  },
  executionOrder: 'priority_desc'
})

// 执行结果对话框
const resultDialogVisible = ref(false)
const executionResult = ref(null)
const currentTestCase = ref(null)

// 运行测试用例
const handleRunTestCase = (testCase) => {
  currentTestCase.value = testCase
  isExecutingApi.value = false  // 标记为执行单个用例
  
  // 重置执行配置为默认值
  Object.assign(executeFormData, {
    environment: 'dev',
    baseUrl: '',
    timeout: 30,
    variables: {},
    async: false
  })
  executeVariables.value = ''
  
  executeDialogVisible.value = true
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

// 确认执行测试
const handleConfirmExecute = async () => {
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
    
    // 如果是执行接口测试
    if (isExecutingApi.value) {
      // 添加接口测试特有的配置
      if (executeFormData.concurrency) {
        requestData.concurrency = executeFormData.concurrency
      }
      
      // 添加用例过滤条件
      const caseFilter = {}
      if (executeFormData.caseFilter.priority && executeFormData.caseFilter.priority.length > 0) {
        caseFilter.priority = executeFormData.caseFilter.priority
      }
      if (executeFormData.caseFilter.tags && executeFormData.caseFilter.tags.length > 0) {
        caseFilter.tags = executeFormData.caseFilter.tags
      }
      caseFilter.enabled_only = executeFormData.caseFilter.enabledOnly
      
      if (Object.keys(caseFilter).length > 0) {
        requestData.case_filter = caseFilter
      }
      
      // 添加执行顺序
      if (executeFormData.executionOrder) {
        requestData.execution_order = executeFormData.executionOrder
      }
      
      // 获取API ID
      const apiId = props.api.api_id || props.api.id || props.api.apiId
      if (!apiId) {
        ElMessage.error('无法获取接口ID')
        executing.value = false
        return
      }
      
      // 调用接口测试执行API
      const response = await executeApiTest(apiId, requestData)
      
      if (response.code === 1) {
        if (requestData.async) {
          // 异步执行
          ElMessage.success(`接口测试任务已提交，任务ID: ${response.data.task_id || response.data.taskId}`)
          executeDialogVisible.value = false
        } else {
          // 同步执行 - 显示接口测试结果
          const totalCases = response.data.totalCases || response.data.total_cases || 0
          const passed = response.data.passed || 0
          const failed = response.data.failed || 0
          
          executionResult.value = {
            executionId: response.data.executionId || response.data.execution_id,
            apiId: response.data.apiId || response.data.api_id,
            apiName: response.data.apiName || response.data.api_name,
            caseName: `接口测试: ${response.data.apiName || response.data.api_name || props.api.name}`,
            status: failed === 0 && passed > 0 ? 'passed' : (failed > 0 ? 'failed' : 'not_executed'),
            duration: response.data.totalDuration || response.data.total_duration,
            startTime: response.data.startTime || response.data.start_time,
            endTime: response.data.endTime || response.data.end_time,
            responseStatus: 200,  // 接口级别的执行成功
            assertionsPassed: passed,
            assertionsFailed: failed,
            totalCases: totalCases,
            successRate: response.data.successRate || response.data.success_rate || 0,
            failureMessage: failed > 0 ? `${failed}个用例执行失败` : null,
            reportId: response.data.reportId || response.data.report_id,
            detailUrl: response.data.detailUrl || response.data.detail_url,
            caseResults: response.data.caseResults || response.data.case_results || []
          }
          
          executeDialogVisible.value = false
          resultDialogVisible.value = true
        }
        
        // 刷新历史记录和相关数据
        if (activeTab.value === 'history') {
          await loadHistoryRecords()
        }
        emit('refresh-cases')
      } else {
        ElMessage.error(response.msg || '执行失败')
      }
    } else {
      // 执行单个测试用例
      if (!currentTestCase.value) {
        ElMessage.error('未选择测试用例')
        executing.value = false
        return
      }
      
      const caseId = currentTestCase.value.caseId || currentTestCase.value.case_id || currentTestCase.value.id
      const response = await executeTestCase(null, caseId, requestData)
      
      if (response.code === 1) {
        if (requestData.async) {
          // 异步执行
          ElMessage.success(`测试任务已提交，任务ID: ${response.data.taskId || response.data.task_id}`)
          executeDialogVisible.value = false
        } else {
          // 同步执行 - 显示执行结果对话框
          executionResult.value = {
            executionId: response.data.executionId || response.data.execution_id,
            caseId: response.data.caseId || response.data.case_id,
            caseName: response.data.caseName || response.data.case_name,
            status: response.data.status,
            duration: response.data.duration,
            startTime: response.data.startTime || response.data.start_time,
            endTime: response.data.endTime || response.data.end_time,
            responseStatus: response.data.responseStatus || response.data.response_status,
            assertionsPassed: response.data.assertionsPassed || response.data.assertions_passed || 0,
            assertionsFailed: response.data.assertionsFailed || response.data.assertions_failed || 0,
            failureMessage: response.data.failureMessage || response.data.failure_message,
            logsLink: response.data.logsLink || response.data.logs_link,
            reportId: response.data.reportId || response.data.report_id
          }
          
          executeDialogVisible.value = false
          resultDialogVisible.value = true
        }
        
        // 刷新用例列表
        emit('refresh-cases')
      } else {
        ElMessage.error(response.msg || '执行失败')
      }
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
  if (executionResult.value && executionResult.value.logsLink) {
    window.open(executionResult.value.logsLink, '_blank')
  } else {
    ElMessage.info('日志链接不可用')
  }
}

// 查看测试报告
const handleViewReport = () => {
  if (executionResult.value && executionResult.value.reportId) {
    ElMessage.info(`查看报告ID: ${executionResult.value.reportId}`)
    // TODO: 跳转到报告详情页面
    // router.push(`/reports/${executionResult.value.reportId}`)
  } else {
    ElMessage.info('报告不可用')
  }
}

// 从结果对话框重新测试
const handleRetestFromResult = () => {
  resultDialogVisible.value = false
  executeDialogVisible.value = true
}

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
      
      // 更新测试状态
      testStatus.value = mapExecutionStatus(latestRecord.status)
      
      // 更新时间信息 - 使用驼峰命名
      testTime.value = formatTime(latestRecord.startTime)
      responseTime.value = formatDuration(latestRecord.durationSeconds)
      
      // 解析执行配置JSON
      let executionConfig = null
      if (latestRecord.executionConfig) {
        try {
          executionConfig = typeof latestRecord.executionConfig === 'string' 
            ? JSON.parse(latestRecord.executionConfig)
            : latestRecord.executionConfig
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
        formattedResponse.value = latestRecord.errorMessage || '暂无响应数据'
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
const formatTime = (time) => {
  if (!time) return '-'
  
  // ISO格式转换为本地时间
  if (typeof time === 'string' && time.includes('T')) {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }
  
  return time
}

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
    
    // 构造请求数据
    const updateData = {
      name: apiData.name.trim(),
      method: apiData.method,
      path: apiData.path.trim(),
      description: apiData.description || '',
      module_id: targetModuleId,
      precondition: apiData.precondition || '',
      tags: apiData.tags || [],
      request_parameters: apiData.requestParameters,
      request_headers: apiData.requestHeaders,
      request_body: apiData.requestBody,
      request_body_type: apiData.requestBodyType
    }
    
    // 调用API更新接口
    const response = await updateApi(apiId, updateData)
    
    if (response.code === 1) {
      ElMessage.success('保存成功')
      // 触发父组件刷新数据
      emit('refresh')
    } else {
      ElMessage.error(response.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存接口失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('保存失败，请稍后重试')
    }
  }
}

/**
 * 执行接口测试
 */
const handleTest = () => {
  // 重置执行配置为默认值
  Object.assign(executeFormData, {
    environment: 'dev',
    baseUrl: '',
    timeout: 30,
    variables: {},
    async: false,
    concurrency: 3,
    caseFilter: {
      priority: [],
      tags: [],
      enabledOnly: true
    },
    executionOrder: 'priority_desc'
  })
  executeVariables.value = ''
  
  // 打开执行配置对话框
  executeDialogVisible.value = true
  isExecutingApi.value = true  // 标记为执行接口测试
}

/**
 * 删除测试用例
 */
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除测试用例"${testCase?.name || '未知用例'}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        customClass: 'delete-confirm-dialog'
      }
    )
    
    // 用户确认后，触发父组件的删除事件，不在这里执行删除操作
    emit('delete-case', testCase)
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('删除确认失败:', error)
    }
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
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
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

.method-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
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

.result-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.result-banner.status-passed {
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f3d8 100%);
  border: 2px solid #67c23a;
}

.result-banner.status-failed {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 2px solid #f56c6c;
}

.banner-icon {
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.result-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.result-subtitle {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

/* 执行信息卡片 */
.result-info-section {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-grid-api {
  grid-template-columns: repeat(3, 1fr);
}

.info-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
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
  color: #409eff;
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
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
}

.failure-title {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 8px;
}

.failure-message {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 操作链接 */
.result-links-section {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 用例执行明细 */
.case-results-section {
  margin-bottom: 24px;
}

.case-results-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.case-results-table {
  width: 100%;
}

.case-results-table .case-code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.case-results-table .case-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.case-results-table .duration-text {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.case-results-table .failure-text {
  color: #f56c6c;
  font-size: 13px;
}

.case-results-table .success-text {
  color: #67c23a;
  font-size: 13px;
}

.total-count {
  color: #409eff;
  font-weight: 600;
}

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

