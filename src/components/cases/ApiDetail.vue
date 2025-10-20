<template>
  <div class="api-detail-panel">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="header-left">
        <h2 class="api-title">{{ api.name }}</h2>
        <span class="api-path">{{ api.url }}</span>
        <span class="method-tag" :class="'method-' + (api.method || '').toLowerCase()">
          {{ api.method }}
        </span>
      </div>
      <div class="header-right">
        <span class="time-info">创建时间：{{ api.created_time || '2024-02-15 10:30' }}</span>
        <span class="time-info">最后执行：{{ api.last_executed_time || '2024-03-10 14:40' }}</span>
        <button class="status-badge status-failed">失败</button>
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
          <el-select v-model="apiData.module" placeholder="请选择模块" class="form-select">
            <el-option label="用户模块" value="用户模块" />
          </el-select>
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
          <el-button type="danger" @click="handleDelete">删除</el-button>
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
            <el-button size="small" :icon="Download">导出</el-button>
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
            显示 1-10 / {{ historyTotal }} 条记录
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

          <el-table-column label="测试类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getCaseTypeTagType(row.caseType)" 
                size="small"
              >
                {{ getCaseTypeText(row.caseType) }}
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
                <el-tooltip :content="row.testData" placement="top">
                  <span class="test-data-text">{{ truncateText(row.testData, 50) }}</span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="预期结果" min-width="200">
            <template #default="{ row }">
              <div class="expected-result-cell">
                <span class="result-summary">{{ row.expectedResult }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="center" fixed="right">
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
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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
  Share,
  View,
  Delete,
  CaretRight
} from '@element-plus/icons-vue'

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

defineEmits(['select-case', 'edit-case', 'delete-case', 'close'])

const activeTab = ref('basic')

const apiData = reactive({
  project: '电商支付系统',
  module: '用户模块',
  name: props.api.name,
  path: props.api.url,
  method: props.api.method,
  description: props.api.description || '用于更新已存在用户的基本信息',
  precondition: '用户已登录且具有权限'
})

// 请求参数数据
const bodyType = ref('json')
const headerParams = ref([
  { name: 'Authorization', value: 'Bearer {token}', description: '认证令牌' },
  { name: 'Content-Type', value: 'application/json', description: '请求内容类型' }
])
const queryParams = ref([])
const bodyParams = ref([
  { name: 'userId', value: 'user_12345', description: '用户ID参数' },
  { name: 'userName', value: '测试用户', description: '用户名称' },
  { name: 'userEmail', value: 'test@example.com', description: '用户邮箱' },
  { name: 'userRole', value: 'admin', description: '用户角色' }
])
const formDataParams = ref([])
const rawBody = ref('')

// 测试历史数据
const historySearchText = ref('')
const historyFilter = reactive({
  period: '7days',
  status: ''
})

const historyPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const historyTotal = ref(42)

const historyRecords = ref([
  {
    id: 1,
    testTime: '2024-03-12 15:30:45',
    executor: '张工程师',
    executorAvatar: '',
    statusCode: 200,
    responseTime: '125ms',
    status: 'passed'
  },
  {
    id: 2,
    testTime: '2024-03-10 14:40:25',
    executor: '王测试',
    executorAvatar: '',
    statusCode: 400,
    responseTime: '231ms',
    status: 'failed'
  },
  {
    id: 3,
    testTime: '2024-03-08 11:15:32',
    executor: '李开发',
    executorAvatar: '',
    statusCode: 200,
    responseTime: '98ms',
    status: 'passed'
  },
  {
    id: 4,
    testTime: '2024-03-05 09:22:18',
    executor: '张工程师',
    executorAvatar: '',
    statusCode: 200,
    responseTime: '115ms',
    status: 'passed'
  },
  {
    id: 5,
    testTime: '2024-03-01 16:45:03',
    executor: '赵测试',
    executorAvatar: '',
    statusCode: 500,
    responseTime: '568ms',
    status: 'failed'
  },
  {
    id: 6,
    testTime: '2024-02-28 13:10:56',
    executor: '李开发',
    executorAvatar: '',
    statusCode: 200,
    responseTime: '132ms',
    status: 'passed'
  },
  {
    id: 7,
    testTime: '2024-02-25 10:05:42',
    executor: '王测试',
    executorAvatar: '',
    statusCode: 200,
    responseTime: '145ms',
    status: 'passed'
  }
])

// 过滤后的历史记录
const filteredHistoryRecords = computed(() => {
  let records = historyRecords.value
  
  // 状态过滤
  if (historyFilter.status) {
    records = records.filter(r => r.status === historyFilter.status)
  }
  
  // 搜索过滤
  if (historySearchText.value) {
    const keyword = historySearchText.value.toLowerCase()
    records = records.filter(r => 
      r.executor.toLowerCase().includes(keyword) ||
      r.testTime.includes(keyword)
    )
  }
  
  return records
})

// 查看历史详情
const handleViewHistoryDetail = (record) => {
  ElMessage.info(`查看测试记录 ${record.id} 的详情`)
}

// 从历史记录重新测试
const handleRetestFromHistory = (record) => {
  ElMessage.info(`使用历史记录 ${record.id} 的参数重新测试`)
}

// 删除历史记录
const handleDeleteHistory = (record) => {
  ElMessageBox.confirm(
    `确定要删除这条测试记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 历史记录分页变化
const handleHistorySizeChange = (pageSize) => {
  historyPagination.pageSize = pageSize
  // 加载数据
}

const handleHistoryPageChange = (page) => {
  historyPagination.currentPage = page
  // 加载数据
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

// 获取用例类型标签颜色
const getCaseTypeTagType = (type) => {
  const typeMap = {
    'functional': 'primary',
    'boundary': 'warning',
    'exception': 'danger',
    'security': 'success'
  }
  return typeMap[type] || ''
}

// 获取用例类型文本
const getCaseTypeText = (type) => {
  const textMap = {
    'functional': '功能测试',
    'boundary': '边界测试',
    'exception': '异常测试',
    'security': '安全测试'
  }
  return textMap[type] || type
}

// 获取优先级标签颜色
const getPriorityTagType = (priority) => {
  const priorityMap = {
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

// 添加测试用例
const handleAddTestCase = () => {
  ElMessage.info('打开添加测试用例对话框')
}

// 运行测试用例
const handleRunTestCase = (testCase) => {
  ElMessage.info(`运行测试用例：${testCase.name}`)
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
const testStatus = ref('failed') // 'passed' | 'failed' | 'not_executed'
const resultTab = ref('response')
const searchText = ref('')
const responseTime = ref('231ms')
const testTime = ref('2024-03-10 14:40:25')

const actualResponse = reactive({
  statusCode: '400 Bad Request',
  responseCode: 'error',
  body: {
    "status": "error",
    "code": 400,
    "message": "验证失败",
    "errors": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      },
      {
        "field": "phone",
        "message": "手机号格式不正确"
      }
    ],
    "timestamp": "2024-03-10T14:40:25.231Z"
  }
})

const formattedResponse = ref(JSON.stringify(actualResponse.body, null, 2))

// 断言结果
const assertionResults = ref([
  {
    field: 'status',
    expected: 'success',
    actual: 'error',
    passed: false,
    message: '状态码不匹配'
  },
  {
    field: 'code',
    expected: '200',
    actual: '400',
    passed: false,
    message: '响应码不正确'
  }
])

// 响应头
const responseHeaders = ref([
  { name: 'Content-Type', value: 'application/json; charset=utf-8' },
  { name: 'Content-Length', value: '256' },
  { name: 'Date', value: 'Sun, 10 Mar 2024 14:40:25 GMT' },
  { name: 'Server', value: 'nginx/1.18.0' }
])

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

const getStatusText = (status) => {
  const map = {
    passed: '通过',
    failed: '失败',
    not_executed: '未执行'
  }
  return map[status] || status
}

const handleSave = () => {
  ElMessage.success('保存成功')
}

const handleTest = () => {
  ElMessage.info('执行测试中...')
}

const handleDelete = () => {
  ElMessage.warning('删除功能')
}
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
}

.header-left {
  flex: 1;
}

.api-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.api-path {
  font-size: 14px;
  color: #606266;
  margin-right: 12px;
}

.method-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
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

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.time-info {
  font-size: 13px;
  color: #909399;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  border: none;
  cursor: default;
}

.status-badge.status-failed {
  background: #fef0f0;
  color: #f56c6c;
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

.test-data-cell {
  padding: 4px 0;
}

.test-data-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expected-result-cell {
  padding: 4px 0;
}

.result-summary {
  font-size: 13px;
  color: #606266;
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
</style>

