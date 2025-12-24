<template>
  <div class="case-detail-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">测试用例</span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">{{ testCase?.caseCode || testCase?.case_code || testCase?.id || '未知用例' }}</span>
    </div>

    <!-- 用例标题 -->
    <div class="case-header">
      <div class="case-title-row">
        <h2 class="case-title">{{ testCase?.name || '未知用例' }}</h2>
        <el-tag v-if="testCase && !testCase.isEnabled" type="danger" size="small" class="disabled-tag">
          已禁用
        </el-tag>
      </div>
      <div class="case-actions">
        <el-button 
          type="primary" 
          size="default"
          :icon="CaretRight"
          :disabled="!testCase?.isEnabled"
          @click="handleExecute"
        >
          执行测试
        </el-button>
        <el-button 
          size="default"
          :icon="Edit"
          @click="handleEdit"
        >
          编辑
        </el-button>
        <el-button 
          size="default"
          :icon="CopyDocument"
          @click="handleCopy"
        >
          复制
        </el-button>
        <el-dropdown @command="handleMoreAction">
          <el-button size="default" :icon="MoreFilled">
            更多
        </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export" :icon="Download">
                导出用例
              </el-dropdown-item>
              <el-dropdown-item command="history" :icon="Clock">
                查看历史
              </el-dropdown-item>
              <el-dropdown-item command="share" :icon="Share">
                分享用例
              </el-dropdown-item>
              <el-dropdown-item 
                v-if="props.testCase?.isEnabled" 
                divided 
                command="disable" 
                :icon="CircleClose"
              >
                禁用用例
              </el-dropdown-item>
              <el-dropdown-item 
                v-else 
                divided 
                command="enable" 
                :icon="CircleCheck"
              >
                启用用例
              </el-dropdown-item>
              <el-dropdown-item command="delete" :icon="Delete">
                <span style="color: #f56c6c;">删除用例</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="case-content">
      <!-- 左侧主要信息 -->
      <div class="case-main">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">优先级</span>
              <el-tag 
                :type="getPriorityType(testCase?.priority)" 
                size="small"
              >
                {{ testCase?.priority || 'P0' }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">严重程度</span>
              <el-tag 
                :type="getSeverityType(testCase?.severity)" 
                size="small"
              >
                {{ getSeverityText(testCase?.severity) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">测试类型</span>
              <el-tag 
                :type="getTestTypeTagType(testCase?.testType || testCase?.test_type)" 
                size="small"
                class="test-type-tag"
              >
                {{ getTestTypeText(testCase?.testType || testCase?.test_type) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">创建人</span>
              <span class="info-value">{{ getCreatorName() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value">{{ testCase?.version || '1.0' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatTime(testCase?.createdAt || testCase?.created_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后修改</span>
              <span class="info-value">{{ formatTime(testCase?.updatedAt || testCase?.updated_time) }}</span>
            </div>
          </div>
      </div>

        <!-- 用例描述 -->
        <div class="section-card" v-if="testCase?.description">
          <h3 class="section-title">用例描述</h3>
          <p class="description-text">{{ testCase?.description }}</p>
        </div>

        <!-- 标签 -->
        <div class="section-card" v-if="displayTags.length > 0">
          <h3 class="section-title">标签</h3>
          <div class="tags-container">
            <el-tag 
              v-for="(tag, index) in displayTags" 
              :key="index"
              class="tag-item"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 测试步骤 -->
        <div class="section-card">
          <h3 class="section-title">测试步骤</h3>
          <div v-if="displaySteps.length > 0" class="steps-list">
            <div v-for="(step, index) in displaySteps" :key="index" class="step-item">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-operation">{{ step.operation }}</div>
                <div class="step-expected" v-if="step.expected">
                  预期结果：{{ step.expected }}
                </div>
                <div class="step-actual" v-if="step.actual">
                  实际结果：{{ step.actual }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-steps">
            <el-empty 
              :image-size="80"
              description="暂无测试步骤"
            >
              <template #description>
                <p>该测试用例尚未配置测试步骤</p>
                <p class="empty-tip">请联系测试人员添加具体的测试步骤</p>
              </template>
            </el-empty>
          </div>
        </div>

        <!-- 测试数据 -->
        <div class="section-card">
          <h3 class="section-title">测试数据</h3>
          <div v-if="displayTestData.length > 0" class="data-grid">
            <div v-for="(item, index) in displayTestData" :key="index" class="data-item">
              <span class="data-label">{{ item.label }}</span>
              <span class="data-value">{{ item.value }}</span>
            </div>
          </div>
          <div v-else class="empty-data">
            <el-empty 
              :image-size="60"
              description="暂无测试数据"
            >
              <template #description>
                <p>该测试用例尚未配置测试数据</p>
                <p class="empty-tip">请联系测试人员添加具体的测试数据</p>
              </template>
            </el-empty>
          </div>
        </div>

        <!-- 预期响应 -->
        <div class="section-card">
          <h3 class="section-title">预期响应</h3>
          <div class="expected-response-section">
            <div class="response-item">
              <span class="response-label">状态码</span>
              <el-tag 
                :type="getStatusCodeType(testCase?.expectedHttpStatus || testCase?.expected_http_status)" 
                size="small"
              >
                {{ testCase?.expectedHttpStatus || testCase?.expected_http_status || 200 }}
              </el-tag>
            </div>
            <div class="response-item">
              <span class="response-label">响应时间</span>
              <span class="response-value">&lt; {{ testCase?.expectedResponseTime || testCase?.expected_response_time || '2秒' }}</span>
            </div>
            <div class="response-item full-width" v-if="displayValidationRules.length > 0">
              <span class="response-label">验证规则</span>
              <div class="validation-rules">
                <div 
                  v-for="(rule, index) in displayValidationRules" 
                  :key="index"
                  class="rule-tag"
                >
                  {{ rule }}
                </div>
              </div>
            </div>
            <div class="response-item full-width">
              <span class="response-label">响应体</span>
              <div class="response-code">
                <el-button class="copy-btn" size="mini" type="text" :icon="CopyDocument" @click="handleCopyExpectedResponse" title="复制响应体" />
                <pre>{{ formatExpectedResponse() }}</pre>
              </div>
            </div>
            <div class="response-item full-width" v-if="hasExpectedResponseSchema">
              <span class="response-label">响应Schema</span>
              <div class="response-code">
                <el-button class="copy-btn" size="mini" type="text" :icon="CopyDocument" @click="handleCopyExpectedResponseSchema" title="复制响应Schema" />
                <pre>{{ formatExpectedResponseSchema() }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- 响应提取规则 -->
        <div class="section-card" v-if="displayExtractors.length > 0">
          <h3 class="section-title">响应提取规则</h3>
          <div class="extractors-list">
            <div 
              v-for="(extractor, index) in displayExtractors" 
              :key="index"
              class="extractor-item"
            >
              <div class="extractor-header">
                <span class="extractor-name">{{ extractor.name }}</span>
                <el-tag size="small" type="success">提取变量</el-tag>
              </div>
              <div class="extractor-expression">
                <span class="expression-label">表达式:</span>
                <code class="expression-code">{{ extractor.expression }}</code>
              </div>
              <div class="extractor-description" v-if="extractor.description">
                {{ extractor.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧辅助信息 -->
      <div class="case-sidebar">
        <!-- 执行历史 -->
        <div class="sidebar-section">
          <h4 class="sidebar-title">执行历史</h4>
          <div v-loading="executionHistoryLoading" element-loading-text="加载中..." style="min-height: 100px;">
          <div v-if="displayHistory.length > 0" class="history-list">
            <div 
              v-for="(history, index) in displayHistory" 
              :key="index" 
              class="history-card clickable"
              @click="handleViewHistoryDetail(history)"
            >
              <div class="history-header">
                <el-icon 
                  :color="history.status === 'passed' ? '#67c23a' : '#f56c6c'"
                  :size="16"
                >
                  <CircleCheckFilled v-if="history.status === 'passed'" />
                  <CircleCloseFilled v-else />
                </el-icon>
                  <div class="executor-info">
                    <div class="executor-name">{{ history.executor }}</div>
                    <div class="executor-meta">
                      <span class="execution-type">{{ history.action }}</span>
                      <span class="environment" v-if="history.environment">{{ history.environment }}</span>
                    </div>
                  </div>
              </div>
              <div class="history-body">{{ history.note }}</div>
                <div class="history-footer">
                  <span class="execution-time">{{ history.executed_time }}</span>
                  <span class="duration" v-if="history.durationSeconds > 0">
                    ({{ formatDuration(history.durationSeconds) }})
                  </span>
                  <el-icon class="view-detail-icon"><View /></el-icon>
            </div>
          </div>
            </div>
            <div v-else-if="!executionHistoryLoading" class="empty-history">
            <el-empty 
              :image-size="50"
              description="暂无执行记录"
            >
              <template #description>
                <p>该测试用例尚未执行</p>
                <p class="empty-tip">执行测试后将显示历史记录</p>
              </template>
            </el-empty>
            </div>
            
            <!-- 查看更多按钮 -->
            <div v-if="showViewMore && !executionHistoryLoading" class="view-more-section">
              <el-button 
                type="primary" 
                size="small" 
                text
                :icon="View"
                @click="handleViewMoreHistory"
                class="view-more-btn"
              >
                查看更多执行历史 (共{{ executionHistoryTotal }}条)
              </el-button>
            </div>
          </div>
        </div>

        <!-- 关联信息 -->
        <div class="sidebar-section">
          <h4 class="sidebar-title">关联信息</h4>
          <div class="related-list">
            <div class="related-item">
              <el-icon color="#409eff" :size="16">
                <Link />
              </el-icon>
              <div class="related-content">
                <div class="related-title">用户认证功能需求</div>
                <div class="related-code">REQ-2024-001</div>
              </div>
        </div>
            <div class="related-item">
              <el-icon color="#f56c6c" :size="16">
                <WarningFilled />
              </el-icon>
              <div class="related-content">
                <div class="related-title">密码输入框显示问题</div>
                <div class="related-code">BUG-1002</div>
          </div>
          </div>
        </div>
      </div>

        <!-- 讨论区 -->
        <div class="sidebar-section">
          <h4 class="sidebar-title">讨论</h4>
          <div class="comments-list">
            <div class="comment-item">
              <el-avatar :size="32" class="comment-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">李华</span>
                  <span class="comment-time">2024-01-20 17:00</span>
                </div>
                <div class="comment-text">
                  已完成此次测试，所有步骤均按正常执行
                </div>
              </div>
            </div>
            <div class="comment-item">
              <el-avatar :size="32" class="comment-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">张明</span>
                  <span class="comment-time">2024-01-20 16:45</span>
                </div>
                <div class="comment-text">
                  请关注密码输入框的显示效果是否正确
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- 执行测试配置对话框 -->
    <el-dialog
      v-model="executeDialogVisible"
      title="执行测试配置"
      width="680px"
      class="execute-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="executeFormData" label-width="120px" class="execute-form">
        <div class="execute-form-grid">
          <el-form-item label="执行环境">
            <el-select v-model="executeFormData.environment" placeholder="请选择执行环境">
              <el-option label="开发环境 (dev)" value="dev" />
              <el-option label="测试环境 (test)" value="test" />
              <el-option label="预发布环境 (staging)" value="staging" />
              <el-option label="生产环境 (prod)" value="prod" />
            </el-select>
          </el-form-item>

          <el-form-item label="执行模式">
            <el-radio-group v-model="executeFormData.async">
              <el-radio :label="false">同步</el-radio>
              <el-radio :label="true">异步</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Base URL" class="full-width">
            <el-input 
              v-model="executeFormData.baseUrl" 
              placeholder="留空则使用环境默认 URL（例如 https://api.example.com）"
            />
          </el-form-item>

          <el-form-item label="超时时间" class="timeout-item">
            <el-input-number 
              v-model="executeFormData.timeout" 
              :min="1" 
              :max="300"
            />
            <span class="timeout-unit">秒</span>
          </el-form-item>

          <el-form-item label="执行变量" class="full-width variables-field">
            <el-input 
              v-model="executeVariables" 
              type="textarea"
              :rows="6"
              placeholder='可选，JSON 格式变量，例如：{"username":"testuser","password":"Test@123"}'
            />
            <div v-if="variablesError" class="variables-error">{{ variablesError }}</div>
            <div v-else class="variables-hint">支持 JSON 格式变量；留空将使用默认值。</div>
          </el-form-item>
        </div>
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
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">执行ID</div>
              <div class="info-value">{{ executionResult.executionId }}</div>
            </div>
            <div class="info-card">
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
              <div class="info-value highlight">{{ executionResult.duration }}ms</div>
            </div>
            <div class="info-card">
              <div class="info-label">断言结果</div>
              <div class="info-value">
                <span class="success-count">{{ executionResult.assertionsPassed }} 通过</span>
                <span class="divider">/</span>
                <span class="failed-count">{{ executionResult.assertionsFailed }} 失败</span>
              </div>
            </div>
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

    <!-- 复制测试用例对话框 -->
    <el-dialog
      v-model="copyDialogVisible"
      title="复制测试用例"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="copyFormRef"
        :model="copyFormData"
        :rules="copyFormRules"
        label-width="100px"
      >
        <el-form-item label="用例编码" prop="caseCode">
          <el-input 
            v-model="copyFormData.caseCode" 
            placeholder="请输入新的用例编码"
            maxlength="50"
            show-word-limit
          />
          <div class="form-tip">系统将自动生成唯一编码，您也可以自定义</div>
        </el-form-item>
        
        <el-form-item label="用例名称" prop="name">
          <el-input 
            v-model="copyFormData.name" 
            placeholder="请输入新的用例名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="用例描述" prop="description">
          <el-input 
            v-model="copyFormData.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入用例描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <div class="copy-info">
          <el-alert
            title="复制说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>复制后将创建新的测试用例，包含以下内容：</p>
              <ul>
                <li>• 接口关联和请求配置</li>
                <li>• 前置条件和测试步骤</li>
                <li>• 断言规则和验证器</li>
                <li>• 响应提取规则</li>
                <li>• 优先级和标签</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="copyDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmCopy" 
            :loading="copying"
          >
            {{ copying ? '复制中...' : '确认复制' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分享测试用例对话框 -->
    <el-dialog
      v-model="shareDialogVisible"
      title="分享测试用例"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="share-content">
        <div class="share-info">
          <el-alert
            title="分享说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>生成分享链接后，其他用户可以通过链接查看此测试用例的详细信息。</p>
              <ul>
                <li>• 分享链接包含用例的完整信息</li>
                <li>• 链接具有访问权限控制</li>
                <li>• 可以设置链接有效期</li>
                <li>• 支持密码保护（可选）</li>
              </ul>
            </template>
          </el-alert>
        </div>

        <el-form
          ref="shareFormRef"
          :model="shareFormData"
          :rules="shareFormRules"
          label-width="100px"
          style="margin-top: 20px;"
        >
          <el-form-item label="分享标题" prop="title">
            <el-input 
              v-model="shareFormData.title" 
              placeholder="请输入分享标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="有效期" prop="expireDays">
            <el-select 
              v-model="shareFormData.expireDays" 
              placeholder="选择有效期"
              style="width: 100%;"
            >
              <el-option label="1天" :value="1" />
              <el-option label="7天" :value="7" />
              <el-option label="30天" :value="30" />
              <el-option label="90天" :value="90" />
              <el-option label="永久" :value="0" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="访问密码" prop="password">
            <el-input 
              v-model="shareFormData.password" 
              type="password"
              placeholder="设置访问密码（可选）"
              maxlength="20"
              show-password
            />
            <div class="form-tip">设置密码后，访问者需要输入密码才能查看</div>
          </el-form-item>
          
          <el-form-item label="权限设置" prop="permissions">
            <el-checkbox-group v-model="shareFormData.permissions">
              <el-checkbox label="view">允许查看</el-checkbox>
              <el-checkbox label="download">允许下载</el-checkbox>
              <el-checkbox label="comment">允许评论</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>

        <!-- 生成的分享链接 -->
        <div v-if="shareLink" class="share-result">
          <el-alert
            title="分享链接已生成"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="share-link-container">
                <div class="share-link">
                  <el-input
                    v-model="shareLink"
                    readonly
                    placeholder="分享链接"
                  >
                    <template #append>
                      <el-button 
                        @click="copyShareLink"
                        :icon="CopyDocument"
                      >
                        复制
                      </el-button>
                    </template>
                  </el-input>
                </div>
                <div class="share-stats">
                  <span>访问次数: {{ shareStats.views || 0 }}</span>
                  <span>有效期: {{ shareStats.expireTime || '永久' }}</span>
                </div>
              </div>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="shareDialogVisible = false">取消</el-button>
          <el-button 
            v-if="!shareLink"
            type="primary" 
            @click="handleGenerateShare" 
            :loading="generating"
          >
            {{ generating ? '生成中...' : '生成分享链接' }}
          </el-button>
          <el-button 
            v-if="shareLink"
            type="success" 
            @click="copyShareLink"
            :icon="CopyDocument"
          >
            复制链接
          </el-button>
          <el-button 
            v-if="shareLink"
            type="danger" 
            @click="handleRevokeShare"
            :icon="Delete"
          >
            撤销分享
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 执行历史弹窗 -->
    <ExecutionHistoryModal
      v-model:visible="executionHistoryModalVisible"
      :test-case="testCase"
      @close="executionHistoryModalVisible = false"
    />

    <!-- 执行历史详情对话框 -->
    <el-dialog
      v-model="historyDetailDialogVisible"
      title="执行历史详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="currentHistoryDetail" class="history-detail-content" v-loading="loadingHistoryDetail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4 class="detail-section-title">📋 基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="执行ID">
              {{ currentHistoryDetail.recordId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="执行状态">
              <el-tag :type="getHistoryStatusType(currentHistoryDetail.status)">
                {{ getHistoryStatusText(currentHistoryDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行人">
              {{ currentHistoryDetail.executor || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="执行环境">
              <el-tag size="small">{{ currentHistoryDetail.environment || '-' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行类型">
              {{ currentHistoryDetail.action || currentHistoryDetail.executionType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ currentHistoryDetail.start_time || currentHistoryDetail.executed_time || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">
              {{ currentHistoryDetail.end_time || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="执行耗时">
              <el-tag type="info" size="small">
                {{ formatDuration(currentHistoryDetail.durationSeconds) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 执行结果统计 -->
        <div class="detail-section" v-if="currentHistoryDetail.totalCases">
          <h4 class="detail-section-title">📊 执行统计</h4>
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
              <el-progress 
                :percentage="(currentHistoryDetail.successRate || 0) * 100"
                :status="(currentHistoryDetail.successRate || 0) >= 0.8 ? 'success' : 'exception'"
                :stroke-width="10"
              />
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 执行配置 -->
        <div class="detail-section" v-if="currentHistoryDetail.executionConfig">
          <h4 class="detail-section-title">⚙️ 执行配置</h4>
          <el-input
            type="textarea"
            :value="formatExecutionConfig(currentHistoryDetail.executionConfig)"
            :rows="6"
            readonly
          />
        </div>

        <!-- 错误信息 -->
        <div class="detail-section" v-if="currentHistoryDetail.errorMessage">
          <h4 class="detail-section-title">❌ 错误信息</h4>
          <el-alert
            :title="currentHistoryDetail.errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 执行说明 -->
        <div class="detail-section" v-if="currentHistoryDetail.note">
          <h4 class="detail-section-title">📝 执行说明</h4>
          <div class="note-content">
            {{ currentHistoryDetail.note }}
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="detail-section">
          <h4 class="detail-section-title">ℹ️ 其他信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="浏览器" v-if="currentHistoryDetail.browser">
              {{ currentHistoryDetail.browser }}
            </el-descriptions-item>
            <el-descriptions-item label="应用版本" v-if="currentHistoryDetail.appVersion">
              {{ currentHistoryDetail.appVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="报告地址" v-if="currentHistoryDetail.reportUrl">
              <el-link :href="currentHistoryDetail.reportUrl" target="_blank" type="primary">
                查看报告
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="日志文件" v-if="currentHistoryDetail.logFilePath">
              {{ currentHistoryDetail.logFilePath }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="historyDetailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentHistoryDetail?.reportUrl" 
            type="primary" 
            :icon="View"
            @click="openReport(currentHistoryDetail.reportUrl)"
          >
            查看完整报告
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出测试用例对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出测试用例"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="export-content">
        <div class="export-info">
          <el-alert
            title="导出说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>选择导出格式和选项，系统将生成包含测试用例详细信息的文件。</p>
              <ul>
                <li>• Excel：适合查看和编辑，支持公式和格式化</li>
                <li>• JSON：适合程序处理和数据交换</li>
                <li>• YAML：适合配置管理和版本控制</li>
                <li>• CSV：适合简单的表格数据处理</li>
              </ul>
            </template>
          </el-alert>
        </div>

        <el-form
          ref="exportFormRef"
          :model="exportFormData"
          :rules="exportFormRules"
          label-width="120px"
          style="margin-top: 24px;"
        >
          <el-form-item label="导出格式" prop="format">
            <el-select 
              v-model="exportFormData.format" 
              placeholder="选择导出格式"
              style="width: 100%;"
            >
              <el-option 
                label="Excel (.xlsx)" 
                value="excel"
              >
                <span class="format-option">
                  <span class="format-icon">📊</span>
                  <span class="format-name">Excel (.xlsx)</span>
                  <span class="format-desc">推荐，适合查看和编辑</span>
                </span>
              </el-option>
              <el-option 
                label="JSON (.json)" 
                value="json"
              >
                <span class="format-option">
                  <span class="format-icon">{ }</span>
                  <span class="format-name">JSON (.json)</span>
                  <span class="format-desc">适合程序处理</span>
                </span>
              </el-option>
              <el-option 
                label="YAML (.yaml)" 
                value="yaml"
              >
                <span class="format-option">
                  <span class="format-icon">📄</span>
                  <span class="format-name">YAML (.yaml)</span>
                  <span class="format-desc">适合配置管理</span>
                </span>
              </el-option>
              <el-option 
                label="CSV (.csv)" 
                value="csv"
              >
                <span class="format-option">
                  <span class="format-icon">📋</span>
                  <span class="format-name">CSV (.csv)</span>
                  <span class="format-desc">适合表格处理</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-divider content-position="left">导出内容</el-divider>

          <el-form-item label="包含内容">
            <el-checkbox-group v-model="exportFormData.includeOptions">
              <div class="checkbox-grid">
                <el-checkbox label="basic" checked disabled>
                  <span class="checkbox-label">
                    <span class="checkbox-icon">📋</span>
                    基本信息
                  </span>
                </el-checkbox>
                <el-checkbox label="requestData">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">📤</span>
                    请求数据
                  </span>
                </el-checkbox>
                <el-checkbox label="expectedResponse">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">📥</span>
                    预期响应
                  </span>
                </el-checkbox>
                <el-checkbox label="steps">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">📝</span>
                    测试步骤
                  </span>
                </el-checkbox>
                <el-checkbox label="assertions">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">✅</span>
                    断言规则
                  </span>
                </el-checkbox>
                <el-checkbox label="extractors">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">🔍</span>
                    提取规则
                  </span>
                </el-checkbox>
                <el-checkbox label="validators">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">🔒</span>
                    验证器
                  </span>
                </el-checkbox>
                <el-checkbox label="history">
                  <span class="checkbox-label">
                    <span class="checkbox-icon">📊</span>
                    执行历史
                  </span>
                </el-checkbox>
              </div>
            </el-checkbox-group>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <el-button size="small" text type="primary" @click="selectAllExportOptions">全选</el-button>
              <el-button size="small" text @click="clearAllExportOptions">清空</el-button>
              <el-button size="small" text @click="selectRecommendedExportOptions">推荐选项</el-button>
            </div>
            <div class="form-tip">基本信息始终包含（用例名称、编码、描述等）</div>
          </el-form-item>

          <el-divider content-position="left">高级选项</el-divider>

          <el-form-item label="文件命名">
            <el-input 
              v-model="exportFormData.fileName" 
              placeholder="自动生成（可选）"
              maxlength="100"
            >
              <template #suffix>
                <span class="file-ext">.{{ getFileExtension(exportFormData.format) }}</span>
              </template>
            </el-input>
            <div class="form-tip">留空将使用默认命名：用例编码_日期时间</div>
          </el-form-item>

          <el-form-item label="编码格式" v-if="exportFormData.format === 'csv'">
            <el-select v-model="exportFormData.encoding" style="width: 100%;">
              <el-option label="UTF-8" value="utf-8" />
              <el-option label="GBK（中文Excel兼容）" value="gbk" />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 导出统计信息 -->
        <div class="export-stats" v-if="exportFormData.format">
          <div class="stat-item">
            <span class="stat-label">导出格式:</span>
            <span class="stat-value">{{ getFormatName(exportFormData.format) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">用例数量:</span>
            <span class="stat-value">1 个</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预计大小:</span>
            <span class="stat-value">{{ getEstimatedSize() }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmExport" 
            :loading="exporting"
            :icon="Download"
          >
            {{ exporting ? '导出中...' : '开始导出' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  Delete, 
  CircleCheckFilled, 
  CircleCloseFilled,
  CircleCheck,
  Link,
  WarningFilled,
  User,
  CaretRight,
  CopyDocument,
  MoreFilled,
  Download,
  Clock,
  Share,
  CircleClose,
  Document,
  Refresh
} from '@element-plus/icons-vue'
import { 
  executeTestCase, 
  copyTestCase, 
  getTestCaseForCopy, 
  createTestCase, 
  updateTestCase, 
  createTestCaseShare, 
  revokeTestCaseShare,
  getExecutionRecords,
  exportTestCase
} from '../../api/testCase'
import { exportTestCaseLocal } from '../../utils/exportTestCase'
import ExecutionHistoryModal from './ExecutionHistoryModal.vue'

const props = defineProps({
  testCase: {
    type: Object,
    required: true
  },
  executionHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'refresh'])

// 显示标签
const displayTags = computed(() => {
  const tags = props.testCase?.tags
  
  if (tags && Array.isArray(tags)) {
    return tags
  }
  
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // 解析失败，返回空数组
      return []
    }
  }
  
  return []
})

// 显示提取器
const displayExtractors = computed(() => {
  const extractors = props.testCase?.extractors
  
  if (extractors && Array.isArray(extractors)) {
    return extractors
  }
  
  if (typeof extractors === 'string') {
    try {
      const parsed = JSON.parse(extractors)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // 解析失败，返回空数组
      return []
    }
  }
  
  return []
})

// 是否有预期响应Schema
const hasExpectedResponseSchema = computed(() => {
  return !!(props.testCase?.expectedResponseSchema || props.testCase?.expected_response_schema)
})

// 显示测试步骤
const displaySteps = computed(() => {
  if (props.testCase?.test_steps && Array.isArray(props.testCase?.test_steps)) {
    return props.testCase?.test_steps
  }
  
  // 如果没有测试步骤，返回空数组
  return []
})

// 显示测试数据
const displayTestData = computed(() => {
  // 优先使用 preConditions（后端返回的驼峰命名）
  const data = props.testCase?.preConditions 
    || props.testCase?.pre_conditions 
    || props.testCase?.request_override 
    || props.testCase?.request_params
  
  if (data && typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }))
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return Object.entries(parsed).map(([key, value]) => ({
        label: key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }))
    } catch (e) {
      // 解析失败，使用默认数据
    }
  }
  
  // 如果没有测试数据，返回空数组
  return []
})

// ==================== 执行历史相关 ====================
const executionHistoryData = ref([])
const executionHistoryLoading = ref(false)
const executionHistoryTotal = ref(0)  // 总记录数

// 执行历史弹窗
const executionHistoryModalVisible = ref(false)

// 执行历史详情对话框
const historyDetailDialogVisible = ref(false)
const currentHistoryDetail = ref(null)
const loadingHistoryDetail = ref(false)

/**
 * 加载执行历史
 */
const loadExecutionHistory = async () => {
  try {
    executionHistoryLoading.value = true
    
    // 获取用例ID
    const caseId = props.testCase?.caseId || props.testCase?.case_id || props.testCase?.id
    console.log('开始加载执行历史，用例ID:', caseId, '用例信息:', props.testCase)
    
    if (!caseId) {
      console.warn('用例ID为空，无法加载执行历史')
      executionHistoryData.value = []
      return
    }
    
    const params = {
      execution_scope: 'test_case',
      ref_id: caseId,
      page: 1,
      page_size: 3,  // 侧边栏只显示最近3条
      sort_by: 'start_time',
      sort_order: 'desc'
    }
    
    console.log('请求执行历史参数:', params)
    const response = await getExecutionRecords(params)
    console.log('执行历史API响应:', response)
    console.log('响应类型:', typeof response)
    console.log('响应数据结构:', Object.keys(response))
    
    if (response.code === 1 && response.data && response.data.items) {
      console.log('成功获取执行历史数据，条数:', response.data.items.length)
      // 转换数据格式
      executionHistoryData.value = response.data.items.map(item => {
        // 根据实际执行结果判断状态
        const failedCount = item.failed_cases || item.failedCases || 0
        const totalCount = item.total_cases || item.totalCases || 0
        const rawStatus = item.status
        
        // 计算实际状态
        let actualStatus = mapExecutionStatus(rawStatus)
        if (rawStatus === 'completed' && totalCount > 0) {
          // 如果是完成状态，根据失败数判断是否真的通过
          actualStatus = failedCount === 0 ? 'passed' : 'failed'
        }
        
        return {
          id: item.record_id || item.recordId,
          recordId: item.record_id || item.recordId,
          status: actualStatus,
          action: getExecutionTypeText(item.execution_type || item.executionType),
          note: generateHistoryNote(item),
          executed_time: formatTime(item.start_time || item.startTime),
          startTime: item.start_time || item.startTime,
          endTime: item.end_time || item.endTime,
          executor: item.executor_info?.name || item.executorInfo?.name || '未知',
          executorInfo: item.executor_info || item.executorInfo,
          environment: item.environment,
          duration: item.duration_seconds || item.durationSeconds,
          durationSeconds: item.duration_seconds || item.durationSeconds,
          totalCases: item.total_cases || item.totalCases,
          passedCases: item.passed_cases || item.passedCases,
          failedCases: item.failed_cases || item.failedCases,
          skippedCases: item.skipped_cases || item.skippedCases,
          successRate: item.success_rate || item.successRate,
          executionType: item.execution_type || item.executionType,
          reportUrl: item.report_url || item.reportUrl,
          errorMessage: item.error_message || item.errorMessage
        }
      })
      
      // 保存总记录数
      executionHistoryTotal.value = response.data.total || 0
      
      console.log('转换后的执行历史数据:', executionHistoryData.value)
      console.log('总记录数:', executionHistoryTotal.value)
    } else {
      console.log('API返回空数据或失败:', response)
      executionHistoryData.value = []
      executionHistoryTotal.value = 0
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
    executionHistoryData.value = []
  } finally {
    console.log('执行历史加载完成，设置loading为false')
    executionHistoryLoading.value = false
    console.log('executionHistoryLoading.value:', executionHistoryLoading.value)
  }
}

/**
 * 映射执行状态（基础映射）
 * 注意：对于 'completed' 状态，调用方需要根据实际执行结果（失败数）判断是 passed 还是 failed
 */
const mapExecutionStatus = (status) => {
  const statusMap = {
    'completed': 'completed',  // 返回原始状态，由调用方根据执行结果判断
    'failed': 'failed',
    'running': 'running',
    'cancelled': 'cancelled'
  }
  return statusMap[status] || status
}

/**
 * 获取执行类型文本
 */
const getExecutionTypeText = (type) => {
  const typeMap = {
    'manual': '手动执行',
    'scheduled': '定时任务',
    'triggered': '触发执行'
  }
  return typeMap[type] || '手动执行'
}

/**
 * 生成历史记录的描述
 */
const generateHistoryNote = (item) => {
  const total = item.total_cases || item.totalCases || 0
  const passed = item.passed_cases || item.passedCases || 0
  const failed = item.failed_cases || item.failedCases || 0
  const successRate = item.success_rate || item.successRate || 0
  
  if (total > 0) {
    return `执行 ${total} 个用例，通过 ${passed} 个，失败 ${failed} 个，成功率 ${successRate.toFixed(2)}%`
  } else {
    const status = item.status
    if (status === 'completed') {
      return '执行成功'
    } else if (status === 'failed') {
      return item.error_message || item.errorMessage || '执行失败'
    } else {
      return '执行中...'
    }
  }
}

// 显示执行历史（只使用子组件自己获取的数据）
const displayHistory = computed(() => {
  // 只使用子组件自己通过API获取的数据，忽略父组件传递的数据
  // 这样可以确保数据的一致性和实时性
  return executionHistoryData.value || []
})

// 是否显示"查看更多"按钮
const showViewMore = computed(() => {
  return executionHistoryTotal.value > 3
})

// 查看更多执行历史
const handleViewMoreHistory = () => {
  const caseId = props.testCase?.caseId || props.testCase?.case_id || props.testCase?.id
  if (caseId) {
    // 打开执行历史弹窗
    executionHistoryModalVisible.value = true
  } else {
    ElMessage.error('无法获取用例ID')
  }
}

/**
 * 查看执行历史详情
 */
const handleViewHistoryDetail = async (history) => {
  try {
    loadingHistoryDetail.value = true
    currentHistoryDetail.value = history
    historyDetailDialogVisible.value = true
    
    // 如果有recordId，可以调用API获取更详细的信息
    // 这里先使用已有数据
    if (history.recordId) {
      // 可选：调用API获取更详细信息
      // const response = await getExecutionRecordById(history.recordId)
      // if (response.code === 1 && response.data) {
      //   currentHistoryDetail.value = { ...history, ...response.data }
      // }
    }
  } catch (error) {
    console.error('查看执行历史详情失败:', error)
    ElMessage.error('加载详情失败')
  } finally {
    loadingHistoryDetail.value = false
  }
}

/**
 * 获取执行状态类型
 */
const getHistoryStatusType = (status) => {
  const typeMap = {
    'passed': 'success',
    'failed': 'danger',
    'running': 'warning',
    'cancelled': 'info',
    'completed': 'success',
    'pending': 'info'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取执行状态文本
 */
const getHistoryStatusText = (status) => {
  const textMap = {
    'passed': '✅ 通过',
    'failed': '❌ 失败',
    'running': '🔄 执行中',
    'cancelled': '⛔ 已取消',
    'completed': '✅ 完成',
    'pending': '⏳ 待执行'
  }
  return textMap[status] || status || '未知'
}

/**
 * 格式化执行配置
 */
const formatExecutionConfig = (config) => {
  if (!config) return ''
  if (typeof config === 'string') {
    try {
      const parsed = JSON.parse(config)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return config
    }
  }
  return JSON.stringify(config, null, 2)
}

/**
 * 打开报告
 */
const openReport = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

// 显示验证规则
const displayValidationRules = computed(() => {
  // 从assertions解析验证规则
  if (props.testCase?.assertions && Array.isArray(props.testCase?.assertions)) {
    return props.testCase?.assertions.map(assertion => {
      if (assertion.type === 'status_code') {
        return `状态码 = ${assertion.expected}`
      } else if (assertion.type === 'json_path') {
        return `${assertion.expression} = ${assertion.expected}`
      }
      return assertion.expression || assertion.field
    })
  }
  
  // 从validation_rules字符串解析
  if (props.testCase?.validation_rules) {
    return props.testCase?.validation_rules.split(',').map(r => r.trim())
  }
  
  // 默认验证规则
  return ['code = 0', 'msg = "success"', 'data != null']
})

// 格式化预期响应
const formatExpectedResponse = () => {
  // 优先使用驼峰命名的字段
  const responseBody = props.testCase?.expectedResponseBody 
    || props.testCase?.expected_response_body
  
  if (responseBody) {
    try {
      const parsed = typeof responseBody === 'string' 
        ? JSON.parse(responseBody)
        : responseBody
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return responseBody
    }
  }
  
  // 默认响应
  return JSON.stringify({
    code: 200,
    message: '操作成功',
    data: null
  }, null, 2)
}

// 格式化预期响应Schema
const formatExpectedResponseSchema = () => {
  const responseSchema = props.testCase?.expectedResponseSchema 
    || props.testCase?.expected_response_schema
  
  if (responseSchema) {
    try {
      const parsed = typeof responseSchema === 'string'
        ? JSON.parse(responseSchema)
        : responseSchema
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return responseSchema
    }
  }
  
  return ''
}

// 复制预期响应到剪贴板（响应体）
const handleCopyExpectedResponse = async () => {
  try {
    await navigator.clipboard.writeText(formatExpectedResponse())
    ElMessage.success('响应体已复制到剪贴板')
  } catch (e) {
    console.error('复制响应体失败:', e)
    ElMessage.error('复制失败')
  }
}

// 复制预期响应 Schema 到剪贴板
const handleCopyExpectedResponseSchema = async () => {
  try {
    await navigator.clipboard.writeText(formatExpectedResponseSchema() || '')
    ElMessage.success('响应 Schema 已复制到剪贴板')
  } catch (e) {
    console.error('复制响应Schema失败:', e)
    ElMessage.error('复制失败')
  }
}

// 获取创建人名称
const getCreatorName = () => {
  if (props.testCase?.creatorInfo && props.testCase?.creatorInfo.name) {
    return props.testCase?.creatorInfo.name
  }
  if (props.testCase?.creator_info && props.testCase?.creator_info.name) {
    return props.testCase?.creator_info.name
  }
  return props.testCase?.creator_name || '未知'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  
  // 如果是ISO格式，转换为本地时间
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

// 格式化持续时间
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0秒'
  
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    let result = `${hours}小时`
    if (minutes > 0) {
      result += `${minutes}分钟`
    }
    if (remainingSeconds > 0) {
      result += `${remainingSeconds}秒`
    }
    return result
  }
}

// 获取严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': ''
  }
  return typeMap[severity] || 'info'
}

// 获取严重程度文本
const getSeverityText = (severity) => {
  const textMap = {
    'critical': '严重',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[severity] || severity || '中'
}

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
  return textMap[type] || type || '功能测试'
}

// 获取状态码标签类型
const getStatusCodeType = (code) => {
  if (!code) return 'success'
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'danger'
  return 'info'
}

const getStatusText = (status) => {
  const textMap = {
    passed: '通过',
    failed: '失败',
    not_executed: '未执行'
  }
  return textMap[status] || '未知'
}

const getPriorityType = (priority) => {
  const typeMap = {
    'P0': 'danger',
    'P1': 'danger',
    'P2': 'warning',
    'P3': 'info',
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[priority] || 'warning'
}

// 执行测试对话框
const executeDialogVisible = ref(false)
const executing = ref(false)
const executeVariables = ref('')
const variablesError = ref('')
const executeFormData = reactive({
  environment: 'dev',
  baseUrl: '',
  timeout: 30,
  variables: {},
  async: false
})

// 执行结果对话框
const resultDialogVisible = ref(false)
const executionResult = ref(null)

// 复制相关数据
const copyDialogVisible = ref(false)
const copying = ref(false)
const copyFormRef = ref(null)
const copyFormData = reactive({
  caseCode: '',
  name: '',
  description: ''
})

// 复制表单验证规则
const copyFormRules = {
  caseCode: [
    { required: true, message: '请输入用例编码', trigger: 'blur' },
    { min: 2, max: 50, message: '编码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_-]+$/, message: '编码只能包含大写字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入用例名称', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
  ]
}

// 分享相关数据
const shareDialogVisible = ref(false)
const generating = ref(false)
const shareFormRef = ref(null)
const shareFormData = reactive({
  title: '',
  expireDays: 7,
  password: '',
  permissions: ['view']
})

// 分享表单验证规则
const shareFormRules = {
  title: [
    { required: true, message: '请输入分享标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  expireDays: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ]
}

// 分享链接和统计
const shareLink = ref('')
const shareStats = ref({
  views: 0,
  expireTime: ''
})

// 导出相关数据
const exportDialogVisible = ref(false)
const exporting = ref(false)
const exportFormRef = ref(null)
const exportFormData = reactive({
  format: 'excel',
  includeOptions: ['basic', 'requestData', 'expectedResponse', 'steps', 'assertions', 'extractors'],
  fileName: '',
  encoding: 'utf-8'
})

// 所有可用的导出选项
const allExportOptions = ['basic', 'requestData', 'expectedResponse', 'steps', 'assertions', 'extractors', 'validators', 'history']

// 导出表单验证规则
const exportFormRules = {
  format: [
    { required: true, message: '请选择导出格式', trigger: 'change' }
  ]
}

// 执行测试
const handleExecute = () => {
  executeDialogVisible.value = true
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
    
    // 调用执行API
    const caseId = props.testCase?.caseId || props.testCase?.case_id
    
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
      
      // 刷新执行历史
      loadExecutionHistory()
      
      emit('refresh')
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

// 编辑用例
const handleEdit = () => {
  emit('edit', props.testCase)
}

// 复制用例
// 复制测试用例
const handleCopy = () => {
  // 生成默认的复制数据
  const originalCode = props.testCase?.caseCode || props.testCase?.case_code || props.testCase?.id
  const originalName = props.testCase?.name
  
  // 生成新的编码和名称
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  copyFormData.caseCode = `${originalCode}_COPY_${timestamp}`
  copyFormData.name = `${originalName}(副本)`
  copyFormData.description = props.testCase?.description || ''
  
  copyDialogVisible.value = true
}

// 确认复制
const handleConfirmCopy = async () => {
  if (!copyFormRef.value) return
  
  try {
    await copyFormRef.value.validate()
    
    copying.value = true
    
    console.log('开始复制测试用例...')
    console.log('原用例数据:', props.testCase)
    console.log('复制表单数据:', copyFormData)
    
    // 使用复制接口，传递新的编码、名称和描述
    const copyData = {
      caseCode: copyFormData.caseCode,
      name: copyFormData.name,
      description: copyFormData.description
    }
    
    console.log('复制数据:', copyData)
    
    const caseId = props.testCase?.case_id || props.testCase?.id
    const copyResponse = await copyTestCase(caseId, copyData)
    console.log('复制响应:', copyResponse)
    
    if (copyResponse.code === 1) {
      ElMessage.success('测试用例复制成功')
      copyDialogVisible.value = false
      emit('refresh') // 通知父组件刷新数据
    } else {
      ElMessage.error(copyResponse.msg || '复制失败')
    }
  } catch (error) {
    console.error('复制测试用例失败:', error)
    console.error('错误详情:', error.response || error.message)
    ElMessage.error('复制失败，请检查输入信息')
  } finally {
    copying.value = false
  }
}

// 分享测试用例
const handleShare = () => {
  // 初始化分享表单数据
  shareFormData.title = `分享测试用例: ${props.testCase?.name || '未知用例'}`
  shareFormData.expireDays = 7
  shareFormData.password = ''
  shareFormData.permissions = ['view']
  
  // 重置分享链接
  shareLink.value = ''
  shareStats.value = {
    views: 0,
    expireTime: ''
  }
  
  shareDialogVisible.value = true
}

// 生成分享链接
const handleGenerateShare = async () => {
  if (!shareFormRef.value) return
  
  try {
    await shareFormRef.value.validate()
    
    generating.value = true
    
    console.log('开始生成分享链接...')
    console.log('分享表单数据:', shareFormData)
    
    const caseId = props.testCase?.case_id || props.testCase?.id
    const shareData = {
      title: shareFormData.title,
      expireDays: shareFormData.expireDays,
      password: shareFormData.password,
      permissions: shareFormData.permissions
    }
    
    console.log('分享数据:', shareData)
    
    // 调用创建分享链接API
    const response = await createTestCaseShare(caseId, shareData)
    console.log('分享响应:', response)
    
    if (response.code === 1) {
      shareLink.value = response.data.shareUrl
      shareStats.value = {
        views: response.data.views || 0,
        expireTime: response.data.expireTime || (shareFormData.expireDays === 0 ? '永久' : `${shareFormData.expireDays}天`)
      }
      
      ElMessage.success('分享链接生成成功')
    } else {
      ElMessage.error(response.msg || '生成分享链接失败')
    }
    
  } catch (error) {
    console.error('生成分享链接失败:', error)
    console.error('错误详情:', error.response || error.message)
    ElMessage.error('生成分享链接失败，请重试')
  } finally {
    generating.value = false
  }
}

// 复制分享链接
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 撤销分享
const handleRevokeShare = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要撤销分享链接吗？撤销后该链接将无法访问。',
      '撤销分享',
      {
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 从分享链接中提取shareId
    const shareId = shareLink.value.split('/').pop()
    console.log('撤销分享链接:', shareLink.value, 'shareId:', shareId)
    
    // 调用撤销分享API
    const response = await revokeTestCaseShare(shareId)
    console.log('撤销分享响应:', response)
    
    if (response.code === 1) {
      // 重置分享状态
      shareLink.value = ''
      shareStats.value = {
        views: 0,
        expireTime: ''
      }
      
      ElMessage.success('分享链接已撤销')
    } else {
      ElMessage.error(response.msg || '撤销分享失败')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤销分享失败:', error)
      ElMessage.error('撤销分享失败')
    }
  }
}

// ==================== 导出相关函数 ====================

/**
 * 获取文件扩展名
 */
const getFileExtension = (format) => {
  const extMap = {
    excel: 'xlsx',
    json: 'json',
    yaml: 'yaml',
    csv: 'csv'
  }
  return extMap[format] || 'txt'
}

/**
 * 获取格式名称
 */
const getFormatName = (format) => {
  const nameMap = {
    excel: 'Excel (.xlsx)',
    json: 'JSON (.json)',
    yaml: 'YAML (.yaml)',
    csv: 'CSV (.csv)'
  }
  return nameMap[format] || format
}

/**
 * 估算文件大小
 */
const getEstimatedSize = () => {
  const includeOptions = exportFormData.includeOptions
  const baseSize = 5 // KB
  let size = baseSize
  
  if (includeOptions.includes('steps')) size += 2
  if (includeOptions.includes('assertions')) size += 1
  if (includeOptions.includes('extractors')) size += 1
  if (includeOptions.includes('history')) size += 5
  
  // 根据格式调整大小
  if (exportFormData.format === 'excel') size *= 1.5
  if (exportFormData.format === 'json') size *= 0.8
  
  return size < 10 ? `~${size.toFixed(1)} KB` : `~${(size / 1024).toFixed(2)} MB`
}

/**
 * 导出选项快捷操作
 */
const selectAllExportOptions = () => {
  exportFormData.includeOptions = [...allExportOptions]
}

const clearAllExportOptions = () => {
  exportFormData.includeOptions = ['basic'] // 基本信息始终保留
}

const selectRecommendedExportOptions = () => {
  exportFormData.includeOptions = ['basic', 'requestData', 'expectedResponse', 'steps', 'assertions', 'extractors']
}

/**
 * 打开导出对话框
 */
const handleExport = () => {
  // 重置为推荐选项
  selectRecommendedExportOptions()
  exportFormData.format = 'excel'
  exportFormData.fileName = ''
  exportFormData.encoding = 'utf-8'
  
  // 打开对话框
  exportDialogVisible.value = true
}

/**
 * 确认导出
 */
const handleConfirmExport = async () => {
  if (!exportFormRef.value) return
  
  try {
    await exportFormRef.value.validate()
    
    exporting.value = true
    
    console.log('开始导出测试用例...')
    console.log('导出表单数据:', exportFormData)
    console.log('测试用例数据:', props.testCase)
    
    // 构建导出选项
    const options = {
      includeRequestData: exportFormData.includeOptions.includes('requestData'),
      includeExpectedResponse: exportFormData.includeOptions.includes('expectedResponse'),
      includeSteps: exportFormData.includeOptions.includes('steps'),
      includeAssertions: exportFormData.includeOptions.includes('assertions'),
      includeExtractors: exportFormData.includeOptions.includes('extractors'),
      includeValidators: exportFormData.includeOptions.includes('validators'),
      includeHistory: exportFormData.includeOptions.includes('history'),
      encoding: exportFormData.encoding,
      fileName: exportFormData.fileName || null
    }
    
    console.log('导出选项:', options)
    
    // 使用本地导出功能
    const result = exportTestCaseLocal(
      props.testCase, 
      exportFormData.format, 
      options
    )
    
    if (result.success) {
      ElMessage.success(`导出成功：${result.fileName}`)
      exportDialogVisible.value = false
    } else {
      ElMessage.error(result.message || '导出失败')
    }
    
  } catch (error) {
    console.error('导出测试用例失败:', error)
    console.error('错误详情:', error.stack)
    
    ElMessage.error(error.message || '导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 更多操作
const handleMoreAction = async (command) => {
  switch (command) {
    case 'export':
      handleExport()
      break
      
    case 'history':
      handleViewMoreHistory()
      break
      
    case 'share':
      handleShare()
      break
      
    case 'disable':
      try {
        await ElMessageBox.confirm(
          `确定要禁用用例 "${props.testCase?.name || '未知用例'}" 吗？`,
          '禁用确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 调用API禁用测试用例 - 只发送必要的字段
        // 注意：不包含 api_id，修改测试用例时 API 关联不能改变
        const testCase = props.testCase
        const updateData = {
          case_code: testCase.case_code || testCase.caseCode,
          name: testCase.name,
          description: testCase.description,
          priority: testCase.priority,
          severity: testCase.severity,
          tags: testCase.tags || [],
          pre_conditions: testCase.pre_conditions || testCase.preConditions,
          test_steps: testCase.test_steps || testCase.testSteps,
          request_override: testCase.request_override || testCase.requestOverride,
          expected_http_status: testCase.expected_http_status || testCase.expectedHttpStatus,
          expected_response_schema: testCase.expected_response_schema || testCase.expectedResponseSchema,
          expected_response_body: testCase.expected_response_body || testCase.expectedResponseBody,
          assertions: testCase.assertions,
          extractors: testCase.extractors,
          validators: testCase.validators,
          is_enabled: false,
          is_template: testCase.is_template || testCase.isTemplate,
          template_id: testCase.template_id || testCase.templateId,
          version: testCase.version
        }
        
        const caseId = testCase.case_id || testCase.caseId || testCase.id
        await updateTestCase(caseId, updateData)
        
        ElMessage.success('用例已禁用')
        emit('refresh')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('禁用测试用例失败:', error)
          ElMessage.error('禁用测试用例失败')
        }
      }
      break
      
    case 'enable':
      try {
        await ElMessageBox.confirm(
          `确定要启用用例 "${props.testCase?.name || '未知用例'}" 吗？`,
          '启用确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'success'
          }
        )
        
        // 调用API启用测试用例 - 只发送必要的字段
        // 注意：不包含 api_id，修改测试用例时 API 关联不能改变
        const testCase = props.testCase
        const updateData = {
          case_code: testCase.case_code || testCase.caseCode,
          name: testCase.name,
          description: testCase.description,
          priority: testCase.priority,
          severity: testCase.severity,
          tags: testCase.tags || [],
          pre_conditions: testCase.pre_conditions || testCase.preConditions,
          test_steps: testCase.test_steps || testCase.testSteps,
          request_override: testCase.request_override || testCase.requestOverride,
          expected_http_status: testCase.expected_http_status || testCase.expectedHttpStatus,
          expected_response_schema: testCase.expected_response_schema || testCase.expectedResponseSchema,
          expected_response_body: testCase.expected_response_body || testCase.expectedResponseBody,
          assertions: testCase.assertions,
          extractors: testCase.extractors,
          validators: testCase.validators,
          is_enabled: true,
          is_template: testCase.is_template || testCase.isTemplate,
          template_id: testCase.template_id || testCase.templateId,
          version: testCase.version
        }
        
        const caseId = testCase.case_id || testCase.caseId || testCase.id
        await updateTestCase(caseId, updateData)
        
        ElMessage.success('用例已启用')
        emit('refresh')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('启用测试用例失败:', error)
          ElMessage.error('启用测试用例失败')
        }
      }
      break
      
    case 'delete':
      await handleDelete()
      break
  }
}

// 删除用例
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用例 "${props.testCase?.name || '未知用例'}" 吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    emit('delete', props.testCase)
    emit('close')
    ElMessage.success('用例已删除')
  } catch (error) {
    // 用户取消删除
  }
}

// ==================== 生命周期钩子 ====================

/**
 * 监听 testCase 变化，重新加载执行历史
 */
watch(
  () => props.testCase?.id || props.testCase?.caseId || props.testCase?.case_id,
  (newId, oldId) => {
    // 只有当用例ID真正发生变化时才重新加载
    if (newId && newId !== oldId) {
      console.log('测试用例ID变化，重新加载执行历史:', { oldId, newId })
      loadExecutionHistory()
    }
  },
  { immediate: true }  // 立即执行一次
)

// 监听执行变量输入并进行 JSON 校验（即时反馈）
watch(executeVariables, (val) => {
  if (!val || !val.trim()) {
    variablesError.value = ''
    return
  }

  try {
    JSON.parse(val)
    variablesError.value = ''
  } catch (e) {
    variablesError.value = 'JSON 格式错误：' + (e.message || '无法解析')
  }
})

/**
 * 组件挂载时加载执行历史
 */
onMounted(() => {
  // 如果 watch 没有触发（比如用例ID为空），则手动加载
  const caseId = props.testCase?.id || props.testCase?.caseId || props.testCase?.case_id
  if (caseId) {
    console.log('组件挂载，加载执行历史，用例ID:', caseId)
    loadExecutionHistory()
  }
})
</script>

<style scoped>
.case-detail-container {
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主题变量：圆角、阴影、过渡 */
.case-detail-container {
  --card-radius: 12px;
  --card-shadow: 0 10px 30px rgba(16,24,40,0.06);
  --card-shadow-hover: 0 18px 40px rgba(16,24,40,0.08);
  --card-transition: transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .18s cubic-bezier(.2,.8,.2,1);
}

/* 面包屑导航 */
.breadcrumb {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.breadcrumb-item {
  font-size: 14px;
  color: #606266;
}

.breadcrumb-item.active {
  color: #303133;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #c0c4cc;
  font-size: 14px;
}

/* 用例标题 */
.case-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.case-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 内容区域 */
.case-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.case-content::-webkit-scrollbar {
  width: 8px;
}

.case-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
}

.case-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.case-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 左侧主要内容 */
.case-main {
  flex: 1;
  min-width: 0;
}

/* 右侧辅助信息 */
.case-sidebar {
  width: 320px;
  flex-shrink: 0;
}

/* 使侧边栏在滚动内容时保持可见 */
.case-sidebar {
  align-self: flex-start;
  position: sticky;
  top: 96px; /* 保持在标题下方，可根据实际头部高度微调 */
  max-height: calc(100vh - 112px);
  overflow: auto;
}

/* 信息卡片 */
.info-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: var(--card-radius);
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: var(--card-shadow);
  transition: var(--card-transition);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 测试类型标签样式 */
.info-item .test-type-tag {
  margin: 0 auto;
  font-weight: 500;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  align-self: flex-start;
}

.info-item .test-type-tag.el-tag--primary {
  background: linear-gradient(135deg, #409eff 0%, #3b82f6 100%);
  color: white;
  border: none;
}

.info-item .test-type-tag.el-tag--warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f59e0b 100%);
  color: white;
  border: none;
}

.info-item .test-type-tag.el-tag--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #ef4444 100%);
  color: white;
  border: none;
}

.info-item .test-type-tag.el-tag--success {
  background: linear-gradient(135deg, #67c23a 0%, #10b981 100%);
  color: white;
  border: none;
}

.info-item .test-type-tag.el-tag--info {
  background: linear-gradient(135deg, #909399 0%, #6b7280 100%);
  color: white;
  border: none;
}

/* 区块卡片 */
.section-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: var(--card-radius);
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--card-shadow);
  transition: var(--card-transition);
  animation: fadeInUp .28s cubic-bezier(.2,.8,.2,1) both;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 测试步骤 */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-operation {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  font-weight: 500;
}

.step-expected {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.step-actual {
  font-size: 13px;
  color: #909399;
}

/* 空状态样式 */
.empty-steps {
  padding: 40px 20px;
  text-align: center;
}

.empty-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.empty-data {
  padding: 30px 20px;
  text-align: center;
}

.empty-history {
  padding: 20px;
  text-align: center;
}

/* 测试数据 */
.data-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  display: flex;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  width: 120px;
  color: #909399;
  flex-shrink: 0;
}

.data-value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

/* 预期响应部分 */
.expected-response-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.response-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.response-item.full-width {
  flex-direction: column;
}

.response-label {
  min-width: 80px;
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
}

.response-value {
  font-size: 14px;
  color: #606266;
}

.validation-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-tag {
  padding: 6px 12px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  border: 1px solid #b3d8ff;
}

.response-code {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: calc(var(--card-radius) - 6px);
  padding: 12px;
  overflow-x: auto;
  margin-top: 8px;
}

.response-code {
  position: relative;
}

.response-code .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #409eff;
  z-index: 5;
}

.response-code pre {
  margin: 0;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}

/* 侧边栏区块 */
.sidebar-section {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: calc(var(--card-radius) - 2px);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 8px 26px rgba(16,24,40,0.04);
  transition: var(--card-transition);
}

.sidebar-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 执行历史 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #fafafa;
  border-radius: calc(var(--card-radius) - 6px);
  padding: 12px;
  border: 1px solid transparent;
  box-shadow: 0 6px 18px rgba(16,24,40,0.04);
  transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s cubic-bezier(.2,.8,.2,1);
}

.history-card.clickable {
  cursor: pointer;
}

.history-card.clickable:hover {
  background: #ecf5ff;
  border-color: #409eff;
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-6px);
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.executor-info {
  flex: 1;
  margin-left: 8px;
}

.executor-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.executor-meta {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.execution-type {
  font-size: 11px;
  color: #409eff;
  background: #f0f9ff;
  padding: 1px 4px;
  border-radius: 2px;
}

.environment {
  font-size: 11px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 4px;
  border-radius: 2px;
}

.history-body {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.history-footer {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.execution-time {
  flex: 1;
}

.view-detail-icon {
  color: #409eff;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-card.clickable:hover .view-detail-icon {
  opacity: 1;
}

.duration {
  font-size: 11px;
  color: #c0c4cc;
  margin-left: 8px;
}

/* 关联信息 */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  background: #f0f0f0;
}

.related-content {
  flex: 1;
}

.related-title {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
}

.related-code {
  font-size: 12px;
  color: #909399;
}

/* 讨论区 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
  background: #409eff;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
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
  border-radius: calc(var(--card-radius) + 2px);
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
  transition: var(--card-transition);
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

/* 结果横幅图标入场动画 */
.banner-icon {
  animation: bannerPop .32s cubic-bezier(.2,.8,.2,1) both;
}

@keyframes bannerPop {
  0% { transform: scale(.7); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 通用卡片 hover 微交互 */
.info-card:hover,
.section-card:hover,
.sidebar-section:hover,
.extractor-item:hover {
  transform: translateY(-6px);
  box-shadow: var(--card-shadow-hover);
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

/* 用例描述 */
.description-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

/* 响应提取规则 */
.extractors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.extractor-item {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.extractor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.extractor-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.extractor-expression {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.expression-label {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.expression-code {
  flex: 1;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #409eff;
}

.extractor-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

/* 复制对话框样式 */
.copy-info {
  margin-top: 20px;
}

.copy-info .el-alert {
  margin-bottom: 0;
}

.copy-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.copy-info li {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 分享对话框样式 */
.share-content {
  max-height: 60vh;
  overflow-y: auto;
}

.share-info {
  margin-bottom: 20px;
}

.share-info .el-alert {
  margin-bottom: 0;
}

.share-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.share-info li {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.share-result {
  margin-top: 20px;
}

.share-link-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-link {
  width: 100%;
}

.share-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #606266;
}

.share-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 分享对话框按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 80px;
}

/* 禁用状态样式 */
.case-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.disabled-tag {
  font-size: 12px;
  font-weight: 500;
}

/* 查看更多按钮样式 */
.view-more-section {
  padding: 12px 0;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.view-more-btn {
  width: 100%;
  font-size: 13px;
  color: #409eff;
}

.view-more-btn:hover {
  color: #66b1ff;
  background-color: #f0f9ff;
}

/* ==================== 导出对话框样式 ==================== */

/* 导出内容容器 */
.export-content {
  max-height: 70vh;
  overflow-y: auto;
}

.export-info {
  margin-bottom: 20px;
}

.export-info .el-alert {
  margin-bottom: 0;
}

.export-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.export-info li {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

/* 格式选项样式 */
.format-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 4px 0;
}

.format-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.format-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 120px;
}

.format-desc {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

/* 复选框列表 */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 复选框网格 */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* 文件扩展名后缀 */
.file-ext {
  color: #909399;
  font-size: 13px;
  font-weight: 500;
  padding-right: 8px;
}

/* 导出统计信息 */
.export-stats {
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

/* 导出对话框分隔线样式 */
.export-content :deep(.el-divider__text) {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  background-color: white;
}

/* 导出复选框样式优化 */
.export-content :deep(.el-checkbox) {
  margin-right: 0;
  width: 100%;
}

.export-content :deep(.el-checkbox__label) {
  width: 100%;
}

/* 导出表单项间距优化 */
.export-content :deep(.el-form-item) {
  margin-bottom: 20px;
}

.export-content :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
/* 执行历史详情对话框 */
.history-detail-content {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.note-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 描述项样式优化 */
.detail-section :deep(.el-descriptions__label) {
  font-weight: 600;
  background: #f5f7fa;
}

.detail-section :deep(.el-descriptions__content) {
  font-size: 14px;
}

/* 进度条样式 */
.detail-section :deep(.el-progress__text) {
  font-weight: 600;
}

/* 对话框footer */
.history-detail-content + .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 执行对话框样式优化 */
.execute-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg,#f5f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e6eefc;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 14px 24px;
}
.execute-dialog .el-dialog__body {
  padding: 20px 24px;
}
.execute-form .execute-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  align-items: start;
}
.execute-form .full-width {
  grid-column: 1 / -1;
}
.execute-form .timeout-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.timeout-unit {
  color: #909399;
}
.variables-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
.variables-error {
  margin-top: 8px;
  font-size: 12px;
  color: #f56c6c;
  background: #fff6f6;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ffd6d6;
  white-space: pre-wrap;
}

/* 对话框入场动画 */
.execute-dialog :deep(.el-dialog) {
  animation: dialogFadeIn .22s ease;
}
@keyframes dialogFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 按钮与可交互元素微交互 */
.case-actions .el-button,
.dialog-footer .el-button,
.view-more-btn,
.result-links-section .el-button {
  transition: transform .14s cubic-bezier(.2,.8,.2,1), box-shadow .14s cubic-bezier(.2,.8,.2,1), background-color .14s ease;
}

.case-actions .el-button:hover,
.dialog-footer .el-button:hover,
.view-more-btn:hover,
.result-links-section .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(16,24,40,0.06);
}

.step-number {
  box-shadow: 0 6px 18px rgba(16,24,40,0.04);
  transition: transform .16s ease, box-shadow .16s ease;
}

.step-item:hover .step-number {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(16,24,40,0.06);
}
</style>
