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
      <div v-if="activeTab === 'params'" class="tab-content">
        <div class="params-editor">
          <div class="editor-toolbar">
            <span>请求参数示例</span>
            <el-button size="small" @click="copyParams">复制</el-button>
          </div>
          <div class="code-editor">
            <pre>{{ formatJSON(sampleParams) }}</pre>
          </div>
        </div>
      </div>

      <!-- 响应结果 -->
      <div v-if="activeTab === 'result'" class="tab-content">
        <div class="result-section">
          <div class="section-title">预期结果</div>
          <div class="result-box success">
            <div class="result-item">
              <span class="label">状态码：</span>
              <span class="value">200</span>
            </div>
            <div class="result-item">
              <span class="label">响应内容：</span>
              <span class="value">code=0, msg="success"</span>
            </div>
          </div>
        </div>

        <div class="result-section">
          <div class="section-title">实际结果</div>
          <div class="result-box error">
            <div class="result-item">
              <span class="label">状态码：</span>
              <span class="value">403</span>
            </div>
            <div class="result-item">
              <span class="label">响应内容：</span>
              <span class="value">code=1003, msg="权限不足"</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试历史 -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div class="history-list">
          <div 
            v-for="(record, index) in historyRecords" 
            :key="index"
            class="history-item"
          >
            <div class="history-left">
              <div class="history-status" :class="'status-' + record.status">
                {{ getStatusText(record.status) }}
              </div>
              <div class="history-info">
                <div class="history-executor">{{ record.executor }}</div>
                <div class="history-time">{{ record.time }}</div>
              </div>
            </div>
            <div class="history-right">
              <el-button size="small" text>查看详情</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关用例 -->
      <div v-if="activeTab === 'cases'" class="tab-content">
        <div class="cases-list">
          <div 
            v-for="testCase in relatedCases" 
            :key="testCase.id"
            class="case-item"
          >
            <div class="case-left" @click="$emit('select-case', testCase)">
              <span class="case-id">{{ testCase.id }}</span>
              <span class="case-name">{{ testCase.name }}</span>
            </div>
            <div class="case-right">
              <span class="status-dot" :class="'status-' + testCase.status"></span>
              <span class="status-text">{{ getStatusText(testCase.status) }}</span>
              <el-button size="small" text @click.stop="$emit('edit-case', testCase)">编辑</el-button>
              <el-button size="small" text type="danger" @click.stop="$emit('delete-case', testCase)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

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

const sampleParams = {
  name: "测试用户",
  email: "test@example.com",
  role: "user"
}

const historyRecords = [
  {
    status: 'passed',
    executor: '系统自动',
    time: '2024-03-10 14:40'
  },
  {
    status: 'failed',
    executor: '张三',
    time: '2024-03-08 11:25'
  },
  {
    status: 'passed',
    executor: '系统自动',
    time: '2024-03-05 09:15'
  }
]

const formatJSON = (obj) => {
  return JSON.stringify(obj, null, 2)
}

const copyParams = () => {
  navigator.clipboard.writeText(formatJSON(sampleParams))
  ElMessage.success('已复制到剪贴板')
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

/* 参数编辑器 */
.params-editor {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  color: #606266;
}

.code-editor {
  padding: 16px;
  background: #f5f7fa;
}

.code-editor pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}

/* 结果部分 */
.result-section {
  margin-bottom: 24px;
}

.result-box {
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.result-box.success {
  background: #f0f9ff;
  border-color: #b3d8ff;
}

.result-box.error {
  background: #fef0f0;
  border-color: #fbc4c4;
}

.result-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item .label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.result-item .value {
  flex: 1;
  color: #303133;
}

/* 历史记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  transition: all 0.3s;
}

.history-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.history-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.history-status.status-passed {
  background: #f0f9ff;
  color: #67c23a;
}

.history-status.status-failed {
  background: #fef0f0;
  color: #f56c6c;
}

.history-executor {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.history-time {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* 用例列表 */
.cases-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.case-item:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

.case-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.case-left:hover {
  color: #409eff;
}

.case-id {
  font-size: 13px;
  color: #909399;
  min-width: 70px;
}

.case-name {
  font-size: 14px;
  color: #303133;
}

.case-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
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

.status-text {
  font-size: 13px;
  color: #606266;
}
</style>

