<template>
  <div class="case-detail-container">
    <!-- 头部信息 -->
    <CaseDetailHeader
      :test-case="testCase"
      @execute="handleExecute"
      @edit="handleEdit"
      @copy="handleCopy"
      @more-action="handleMoreAction"
    />

    <!-- 主要内容区域 -->
    <div class="case-content">
      <!-- 左侧主要信息 -->
      <div class="case-main">
        <!-- 基本信息 -->
        <CaseDetailBasicInfo :test-case="testCase" />

        <!-- API信息 -->
        <CaseDetailApiInfo :test-case="testCase" />
      </div>

      <!-- 右侧辅助信息 -->
      <CaseDetailSidebar
        :display-history="displayHistory"
        :execution-history-loading="executionHistoryLoading"
        :execution-history-total="executionHistoryTotal"
        @view-history-detail="handleViewHistoryDetail"
        @view-more-history="handleViewMoreHistory"
      />
    </div>

    <!-- 执行测试配置对话框 -->
    <ExecuteConfigDialog
      v-model="executeDialogVisible"
      target-type="case"
      :target-id="testCase?.caseId"
      :target-name="testCase?.name"
      :case-count="1"
      :project-id="testCase?.projectId"
      @execute="handleExecuteFromDialog"
    />

    <!-- 执行结果对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="🎯 测试执行结果"
      width="850px"
      :close-on-click-modal="false"
      class="execution-result-dialog"
    >
      <div class="execution-result-container" v-if="executionResult">
        <!-- 结果状态横幅 -->
        <div class="result-banner" :class="'status-' + executionResult.status">
          <div class="banner-icon-wrapper" :class="executionResult.status">
            <el-icon v-if="executionResult.status === 'passed'" :size="48">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else :size="48">
              <CircleCloseFilled />
            </el-icon>
          </div>
          <div class="banner-content">
            <h3 class="result-title">
              {{ executionResult.status === 'passed' ? '🎉 测试通过' : '😞 测试失败' }}
            </h3>
            <p class="result-subtitle">
              <el-tag size="small" effect="plain">
                {{ executionResult.caseName || '未知用例' }}
              </el-tag>
            </p>
          </div>
          <div class="banner-badge" :class="executionResult.status">
            {{ executionResult.status === 'passed' ? 'SUCCESS' : 'FAILED' }}
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
              <div class="info-value code">{{ executionResult.executionId }}</div>
            </div>

            <!-- 响应状态 -->
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Connection /></el-icon>
                <span class="info-label">响应状态</span>
              </div>
              <div class="info-value">
                <el-tag 
                  :type="getStatusTagType(executionResult.responseStatus)"
                  size="large"
                  effect="dark"
                >
                  {{ executionResult.responseStatus || '-' }}
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
                <span class="duration-value">{{ formatDuration(executionResult.duration) }}</span>
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
                  {{ executionResult.assertionsPassed || 0 }} 通过
                </span>
                <span class="assertion-divider">|</span>
                <span class="assertion-item failed">
                  <el-icon><CircleClose /></el-icon>
                  {{ executionResult.assertionsFailed || 0 }} 失败
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
              <span class="time-value">{{ formatTime(executionResult.startTime) || '-' }}</span>
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
              <span class="time-value">{{ formatTime(executionResult.endTime) || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 失败信息（如果有） -->
        <div class="result-failure-section" v-if="executionResult.status === 'failed'">
          <!-- 失败概览卡片 -->
          <div class="failure-overview">
            <div class="failure-icon">
              <el-icon :size="28"><WarningFilled /></el-icon>
            </div>
            <div class="failure-summary">
              <div class="failure-title-row">
                <span class="failure-title-text">执行失败</span>
                <el-tag size="small" type="danger" effect="dark" v-if="executionResult.failureType">
                  {{ getFailureTypeText(executionResult.failureType) }}
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
              <div class="detail-item" v-if="executionResult.failureMessage">
                <div class="detail-label">
                  <el-icon><InfoFilled /></el-icon>
                  失败原因
                </div>
                <div class="detail-content error-content">
                  <pre class="error-message">{{ executionResult.failureMessage }}</pre>
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

          <!-- 一键修复提示 -->
          <div class="auto-fix-section" v-if="canAutoFix(executionResult.failureMessage)">
            <el-alert
              :title="getAutoFixTitle(executionResult.failureMessage)"
              type="warning"
              :closable="false"
              show-icon
            />
            <el-button 
              type="primary" 
              size="small"
              @click="handleQuickFix"
            >
              <el-icon><Setting /></el-icon>
              去配置
            </el-button>
          </div>
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
      width="640px"
      class="copy-dialog"
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
          >
            <template #suffix>
              <el-button size="small" type="text" :icon="Refresh" @click="generateCopyCode" title="生成新编码">生成</el-button>
              <el-button size="small" type="text" :icon="CopyDocument" @click="copyCaseCodeToClipboard" title="复制编码">复制</el-button>
            </template>
          </el-input>
          <div class="form-tip">系统将自动生成唯一编码，您也可以自定义</div>
          <div v-if="copyCodeError" class="copy-error">{{ copyCodeError }}</div>
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
        
        <!-- 复制预览卡片 -->
        <div class="copy-preview" aria-hidden="false">
          <div class="preview-header">复制预览</div>
          <div class="preview-body">
            <div class="preview-row"><span class="label">用例编码</span><span class="value">{{ copyFormData.caseCode || '（自动生成）' }}</span></div>
            <div class="preview-row"><span class="label">用例名称</span><span class="value">{{ copyFormData.name || '（空）' }}</span></div>
            <div class="preview-row desc"><span class="label">描述</span><span class="value">{{ copyFormData.description || '（空）' }}</span></div>
          </div>
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
      width="650px"
      :close-on-click-modal="false"
      class="share-dialog"
    >
      <div class="share-content">
        <div class="share-header-section">
          <div class="share-header-icon">
            <el-icon size="24" color="#409eff"><Share /></el-icon>
          </div>
          <div class="share-header-info">
            <h3 class="share-title">分享设置</h3>
            <p class="share-subtitle">配置分享参数，生成安全的访问链接</p>
          </div>
        </div>

        <div class="share-info-banner">
          <el-alert
            title="分享说明"
            type="info"
            :closable="false"
            show-icon
            class="share-info-alert"
          >
            <template #default>
              <div class="share-features">
                <div class="feature-item">
                  <el-icon class="feature-icon"><Document /></el-icon>
                  <span>完整用例信息</span>
                </div>
                <div class="feature-item">
                  <el-icon class="feature-icon"><Lock /></el-icon>
                  <span>权限控制</span>
                </div>
                <div class="feature-item">
                  <el-icon class="feature-icon"><Clock /></el-icon>
                  <span>有效期设置</span>
                </div>
                <div class="feature-item">
                  <el-icon class="feature-icon"><Key /></el-icon>
                  <span>密码保护</span>
                </div>
              </div>
            </template>
          </el-alert>
        </div>

        <div class="share-form-section">
          <el-form
            ref="shareFormRef"
            :model="shareFormData"
            :rules="shareFormRules"
            label-width="120px"
            class="share-form"
          >
            <el-form-item label="分享标题" prop="title" class="form-item-enhanced">
              <el-input
                v-model="shareFormData.title"
                placeholder="请输入分享标题"
                maxlength="100"
                show-word-limit
                class="enhanced-input"
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="有效期" prop="expireDays" class="form-item-enhanced">
              <el-select
                v-model="shareFormData.expireDays"
                placeholder="选择有效期"
                class="enhanced-select"
              >
                <template #prefix>
                  <el-icon><Clock /></el-icon>
                </template>
                <el-option label="1天" :value="1">
                  <div class="option-content">
                    <span class="option-label">1天</span>
                    <span class="option-desc">临时分享</span>
                  </div>
                </el-option>
                <el-option label="7天" :value="7">
                  <div class="option-content">
                    <span class="option-label">7天</span>
                    <span class="option-desc">短期分享</span>
                  </div>
                </el-option>
                <el-option label="30天" :value="30">
                  <div class="option-content">
                    <span class="option-label">30天</span>
                    <span class="option-desc">中期分享</span>
                  </div>
                </el-option>
                <el-option label="90天" :value="90">
                  <div class="option-content">
                    <span class="option-label">90天</span>
                    <span class="option-desc">长期分享</span>
                  </div>
                </el-option>
                <el-option label="永久" :value="0">
                  <div class="option-content">
                    <span class="option-label">永久</span>
                    <span class="option-desc">永久有效</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="访问密码" prop="password" class="form-item-enhanced">
              <el-input
                v-model="shareFormData.password"
                type="password"
                placeholder="设置访问密码（可选）"
                maxlength="20"
                show-password
                class="enhanced-input"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
              <div class="form-tip">
                <el-icon class="tip-icon"><WarningFilled /></el-icon>
                <span>设置密码后，访问者需要输入密码才能查看用例详情</span>
              </div>
            </el-form-item>

            <el-form-item label="权限设置" prop="permissions" class="form-item-enhanced">
              <div class="permissions-grid">
                <el-checkbox-group v-model="shareFormData.permissions" class="permission-group">
                  <div class="permission-item">
                    <el-checkbox label="view" class="permission-checkbox">
                      <div class="permission-content">
                        <el-icon class="permission-icon"><Document /></el-icon>
                        <div class="permission-text">
                          <div class="permission-title">查看权限</div>
                          <div class="permission-desc">允许查看用例详情</div>
                        </div>
                      </div>
                    </el-checkbox>
                  </div>
                  <div class="permission-item">
                    <el-checkbox label="download" class="permission-checkbox">
                      <div class="permission-content">
                        <el-icon class="permission-icon"><Download /></el-icon>
                        <div class="permission-text">
                          <div class="permission-title">下载权限</div>
                          <div class="permission-desc">允许下载用例文件</div>
                        </div>
                      </div>
                    </el-checkbox>
                  </div>
                  <div class="permission-item">
                    <el-checkbox label="comment" class="permission-checkbox">
                      <div class="permission-content">
                        <el-icon class="permission-icon"><User /></el-icon>
                        <div class="permission-text">
                          <div class="permission-title">评论权限</div>
                          <div class="permission-desc">允许添加评论</div>
                        </div>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 生成的分享链接 -->
        <div v-if="shareLink" class="share-result-section">
          <div class="success-banner">
            <div class="success-icon">
              <el-icon size="32" color="#67c23a"><CircleCheckFilled /></el-icon>
            </div>
            <div class="success-content">
              <h4 class="success-title">分享链接已生成</h4>
              <p class="success-desc">复制下方链接分享给其他人查看用例</p>
            </div>
          </div>

          <div class="link-display-card">
            <div class="link-header">
              <el-icon class="link-icon"><Link /></el-icon>
              <span class="link-title">分享链接</span>
            </div>
            <div class="link-input-wrapper">
              <el-input
                v-model="shareLink"
                readonly
                class="share-link-input"
                placeholder="分享链接"
              >
                <template #suffix>
                  <el-button
                    @click="copyShareLink"
                    :icon="copyingLink ? CircleCheck : CopyDocument"
                    :type="copyingLink ? 'success' : 'primary'"
                    size="small"
                    class="copy-btn"
                    :disabled="copyingLink"
                  >
                    {{ copyingLink ? '已复制' : '复制链接' }}
                  </el-button>
                </template>
              </el-input>
            </div>

            <div class="link-stats">
              <div class="stat-item">
                <el-icon class="stat-icon"><User /></el-icon>
                <span class="stat-label">访问次数:</span>
                <span class="stat-value">{{ shareStats.views || 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon"><Clock /></el-icon>
                <span class="stat-label">有效期:</span>
                <span class="stat-value">{{ shareStats.expireTime || '永久' }}</span>
              </div>
              <div v-if="shareFormData.password" class="stat-item">
                <el-icon class="stat-icon"><Lock /></el-icon>
                <span class="stat-label">密码保护:</span>
                <span class="stat-value">已启用</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="share-dialog-footer">
          <div class="footer-left">
            <el-button @click="shareDialogVisible = false" plain>
              <el-icon><CircleClose /></el-icon>
              <span>取消</span>
            </el-button>
          </div>
          <div class="footer-right">
            <el-button
              v-if="!shareLink"
              type="primary"
              @click="handleGenerateShare"
              :loading="generating"
              class="generate-btn"
            >
              <el-icon v-if="!generating"><Share /></el-icon>
              <span>{{ generating ? '生成中...' : '生成分享链接' }}</span>
            </el-button>
            <el-button
              v-if="shareLink"
              type="success"
              @click="copyShareLink"
              :icon="CopyDocument"
              class="copy-link-btn"
            >
              <span>复制链接</span>
            </el-button>
            <el-button
              v-if="shareLink"
              type="danger"
              plain
              @click="handleRevokeShare"
              :icon="Delete"
              class="revoke-btn"
            >
              <span>撤销分享</span>
            </el-button>
          </div>
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
      class="history-detail-dialog"
    >
      <div v-if="currentHistoryDetail" class="history-detail-content" v-loading="loadingHistoryDetail">
        <!-- 状态卡片 -->
        <div class="status-overview-card" :class="getHistoryStatusClass(currentHistoryDetail.status)">
          <div class="status-icon-wrapper">
            <el-icon v-if="currentHistoryDetail.status === 'completed'" size="48"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="currentHistoryDetail.status === 'failed'" size="48"><CircleCloseFilled /></el-icon>
            <el-icon v-else-if="currentHistoryDetail.status === 'running'" size="48"><Loading /></el-icon>
            <el-icon v-else size="48"><WarningFilled /></el-icon>
          </div>
          <div class="status-info">
            <h2 class="status-title">{{ getHistoryStatusText(currentHistoryDetail.status) }}</h2>
            <p class="status-desc" v-if="currentHistoryDetail.status === 'completed'">测试执行已完成</p>
            <p class="status-desc" v-else-if="currentHistoryDetail.status === 'failed'">测试执行存在失败项</p>
            <p class="status-desc" v-else-if="currentHistoryDetail.status === 'running'">测试正在执行中</p>
            <p class="status-desc" v-else>测试执行已被取消</p>
          </div>
          <div class="status-badge">
            <el-tag size="large" :type="getHistoryStatusType(currentHistoryDetail.status)">
              {{ currentHistoryDetail.successRate ? (currentHistoryDetail.successRate * 100).toFixed(1) + '%' : '0%' }} 通过率
            </el-tag>
          </div>
        </div>

        <!-- 执行统计卡片 -->
        <div class="stats-grid" v-if="currentHistoryDetail.totalCases">
          <div class="stat-item passed">
            <div class="stat-icon"><el-icon><CircleCheckFilled /></el-icon></div>
            <div class="stat-value">{{ currentHistoryDetail.passedCases || 0 }}</div>
            <div class="stat-label">通过</div>
          </div>
          <div class="stat-item failed">
            <div class="stat-icon"><el-icon><CircleCloseFilled /></el-icon></div>
            <div class="stat-value">{{ currentHistoryDetail.failedCases || 0 }}</div>
            <div class="stat-label">失败</div>
          </div>
          <div class="stat-item skipped">
            <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
            <div class="stat-value">{{ currentHistoryDetail.skippedCases || 0 }}</div>
            <div class="stat-label">跳过</div>
          </div>
          <div class="stat-item total">
            <div class="stat-icon"><el-icon><List /></el-icon></div>
            <div class="stat-value">{{ currentHistoryDetail.totalCases || 0 }}</div>
            <div class="stat-label">总计</div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="detail-section">
          <h4 class="detail-section-title">
            <el-icon><Document /></el-icon>
            基本信息
          </h4>
          <el-descriptions :column="3" border class="info-descriptions">
            <el-descriptions-item label="执行ID">
              <span class="mono-text">{{ currentHistoryDetail.recordId || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="执行人">
              <div class="executor-info">
                <el-avatar :size="24" class="executor-avatar">{{ (currentHistoryDetail.executor || 'U').charAt(0) }}</el-avatar>
                <span>{{ currentHistoryDetail.executor || '-' }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="执行环境">
              <el-tag size="small" type="info">{{ currentHistoryDetail.environment || '默认环境' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行类型">
              <el-tag size="small">{{ currentHistoryDetail.action || currentHistoryDetail.executionType || '手动执行' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              <span class="time-text">{{ currentHistoryDetail.start_time || currentHistoryDetail.executed_time || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="执行耗时">
              <el-tag type="info" size="small" effect="plain">
                <el-icon><Timer /></el-icon>
                {{ formatDuration(currentHistoryDetail.durationSeconds) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 成功率进度条 -->
        <div class="detail-section" v-if="currentHistoryDetail.totalCases">
          <h4 class="detail-section-title">
            <el-icon><TrendCharts /></el-icon>
            执行结果
          </h4>
          <div class="progress-wrapper">
            <el-progress 
              :percentage="(currentHistoryDetail.successRate || 0) * 100"
              :status="(currentHistoryDetail.successRate || 0) >= 0.8 ? 'success' : 'exception'"
              :stroke-width="20"
              :text-inside="true"
            >
              <span class="progress-text">{{ (currentHistoryDetail.successRate || 0) >= 0.8 ? '通过' : '需要关注' }}</span>
            </el-progress>
            <div class="progress-stats">
              <span>已执行: {{ currentHistoryDetail.executedCases || 0 }} / {{ currentHistoryDetail.totalCases || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 执行配置 -->
        <div class="detail-section" v-if="currentHistoryDetail.executionConfig">
          <h4 class="detail-section-title">
            <el-icon><Setting /></el-icon>
            执行配置
          </h4>
          <el-input
            type="textarea"
            :value="formatExecutionConfig(currentHistoryDetail.executionConfig)"
            :rows="4"
            readonly
            class="config-textarea"
          />
        </div>

        <!-- 错误信息 -->
        <div class="detail-section" v-if="currentHistoryDetail.errorMessage">
          <h4 class="detail-section-title error-title">
            <el-icon><CircleCloseFilled /></el-icon>
            错误信息
          </h4>
          <el-alert
            :title="currentHistoryDetail.errorMessage"
            type="error"
            :closable="false"
            show-icon
            class="error-alert"
          />
        </div>

        <!-- 执行说明 -->
        <div class="detail-section" v-if="currentHistoryDetail.note">
          <h4 class="detail-section-title">
            <el-icon><EditPen /></el-icon>
            执行说明
          </h4>
          <div class="note-content">
            {{ currentHistoryDetail.note }}
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="detail-section" v-if="currentHistoryDetail.reportUrl || currentHistoryDetail.browser || currentHistoryDetail.appVersion">
          <h4 class="detail-section-title">
            <el-icon><InfoFilled /></el-icon>
            其他信息
          </h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="浏览器" v-if="currentHistoryDetail.browser">
              {{ currentHistoryDetail.browser }}
            </el-descriptions-item>
            <el-descriptions-item label="应用版本" v-if="currentHistoryDetail.appVersion">
              {{ currentHistoryDetail.appVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="报告地址" v-if="currentHistoryDetail.reportUrl">
              <el-link :href="currentHistoryDetail.reportUrl" target="_blank" type="primary">
                <el-icon><Link /></el-icon>
                查看完整报告
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="日志文件" v-if="currentHistoryDetail.logFilePath">
              <el-tag size="small" type="info">{{ currentHistoryDetail.logFilePath }}</el-tag>
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
            :icon="DataAnalysis"
            @click="openReport(currentHistoryDetail.reportUrl)"
          >
            查看完整报告
          </el-button>
          <el-button 
            type="success" 
            :icon="Refresh"
            @click="handleRerunHistory(currentHistoryDetail)"
          >
            重新执行
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出测试用例对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出测试用例"
      width="720px"
      class="export-dialog"
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
          style="margin-top: 18px;"
        >
          <el-form-item label="导出格式" prop="format" class="format-picker-item">
            <div class="format-cards" role="list">
              <div
                role="listitem"
                tabindex="0"
                class="format-card"
                :class="{ selected: exportFormData.format === 'excel' }"
                @click="exportFormData.format = 'excel'"
              >
                <div class="card-icon">📊</div>
                <div class="card-title">Excel</div>
                <div class="card-desc">.xlsx · 推荐 · 适合查看与编辑</div>
              </div>

              <div
                role="listitem"
                tabindex="0"
                class="format-card"
                :class="{ selected: exportFormData.format === 'json' }"
                @click="exportFormData.format = 'json'"
              >
                <div class="card-icon">{ }</div>
                <div class="card-title">JSON</div>
                <div class="card-desc">.json · 适合程序化处理</div>
              </div>

              <div
                role="listitem"
                tabindex="0"
                class="format-card"
                :class="{ selected: exportFormData.format === 'yaml' }"
                @click="exportFormData.format = 'yaml'"
              >
                <div class="card-icon">📄</div>
                <div class="card-title">YAML</div>
                <div class="card-desc">.yaml · 适合配置与版本管理</div>
              </div>

              <div
                role="listitem"
                tabindex="0"
                class="format-card"
                :class="{ selected: exportFormData.format === 'csv' }"
                @click="exportFormData.format = 'csv'"
              >
                <div class="card-icon">📋</div>
                <div class="card-title">CSV</div>
                <div class="card-desc">.csv · 适合简单表格</div>
              </div>
            </div>
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
          
          <!-- 右侧导出统计浮层 -->
          <div class="export-preview-float" aria-hidden="false">
            <div class="preview-top">
              <div class="preview-format">格式：<strong>{{ getFormatName(exportFormData.format) }}</strong></div>
              <div class="preview-size">预计大小：<strong>{{ getEstimatedSize() }}</strong></div>
            </div>
            <div class="preview-actions">
              <el-button size="small" type="primary" @click="handleConfirmExport" :loading="exporting" :icon="Download">开始导出</el-button>
              <el-button size="small" @click="exportDialogVisible = false">取消</el-button>
            </div>
          </div>

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
  Refresh,
  Lock,
  Key,
  Monitor,
  Timer,
  InfoFilled,
  Warning,
  MagicStick,
  ArrowDown,
  ArrowUp,
  Setting,
  Ticket,
  Connection,
  Checked,
  Right,
  Loading,
  TrendCharts,
  List,
  EditPen,
  DataAnalysis
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
import { diagnose, getDiagnosisResult } from '../../api/diagnosis'
import { exportTestCaseLocal } from '../../utils/exportTestCase'
import ExecutionHistoryModal from './ExecutionHistoryModal.vue'
import CaseDetailHeader from './CaseDetailHeader.vue'
import CaseDetailBasicInfo from './CaseDetailBasicInfo.vue'
import CaseDetailApiInfo from './CaseDetailApiInfo.vue'
import CaseDetailSidebar from './CaseDetailSidebar.vue'
import ExecuteConfigDialog from './ExecuteConfigDialog.vue'

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

const emit = defineEmits(['close', 'edit', 'delete', 'refresh', 'execute'])

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
 * 获取执行状态CSS类
 */
const getHistoryStatusClass = (status) => {
  const classMap = {
    'passed': 'status-success',
    'failed': 'status-failed',
    'running': 'status-running',
    'cancelled': 'status-cancelled',
    'completed': 'status-success',
    'pending': 'status-pending'
  }
  return classMap[status] || 'status-unknown'
}

/**
 * 获取执行状态文本
 */
const getHistoryStatusText = (status) => {
  const textMap = {
    'passed': '通过',
    'failed': '失败',
    'running': '执行中',
    'cancelled': '已取消',
    'completed': '完成',
    'pending': '待执行'
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

/**
 * 重新执行历史记录
 */
const handleRerunHistory = (history) => {
  historyDetailDialogVisible.value = false
  // 使用历史的执行配置来重新执行
  ElMessage.info('正在使用历史配置重新执行测试...')
  // 这里可以触发执行逻辑，使用历史的 executionConfig
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
  environment: null,
  baseUrl: '',
  timeout: 30,
  variables: {},
  async: false
})

// 执行目标信息
const executeTargetInfo = computed(() => {
  const testCase = props.testCase
  return {
    name: testCase?.name || '测试用例',
    tag: testCase?.case_code || testCase?.caseCode || '自动生成',
    tagType: 'success',
    description: testCase ? `用例编码：${testCase.case_code || testCase.caseCode || '自动生成'}` : '',
    stats: [
      { label: '优先级', value: testCase?.priority || 'P2' },
      { label: '严重程度', value: testCase?.severity || 'Medium' }
    ]
  }
})

// 处理执行配置对话框的确认
const handleExecuteFromDialog = async (config) => {
  // 更新执行表单数据
  Object.assign(executeFormData, config)
  // 关闭配置对话框
  executeDialogVisible.value = false
  // 调用原来的执行方法
  await handleConfirmExecute()
}

// 执行结果对话框
const resultDialogVisible = ref(false)
const executionResult = ref(null)
const showErrorDetail = ref(true)
const showAIDiagnosis = ref(false)
const aiDiagnosisLoading = ref(false)
const aiDiagnosisResult = ref(null)

const triggerAIDiagnosis = async () => {
  if (!executionResult.value) return
  
  aiDiagnosisLoading.value = true
  showAIDiagnosis.value = true
  
  try {
    const params = {
      failureMessage: executionResult.value.failureMessage || '',
      failureType: executionResult.value.failureType || '',
      responseStatus: executionResult.value.responseStatus || null,
      responseBody: executionResult.value.responseBody || '',
      apiPath: executionResult.value.apiPath || '',
      apiMethod: executionResult.value.apiMethod || '',
      caseName: executionResult.value.caseName || ''
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
  const maxAttempts = 60  // 增加轮询次数，因为AI诊断可能需要更长时间
  const interval = 2000
  let attempts = 0
  
  const poll = async () => {
    try {
      attempts++
      const res = await getDiagnosisResult(diagnosisId)
      console.log('CaseDetail轮询结果:', res)
      console.log('CaseDetail轮询结果详情 - code:', res.code, 'data:', res.data, 'severity:', res.data?.severity, 'aiStatus:', res.data?.aiStatus)
      
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

// 失败类型和修复建议相关函数
const getFailureTypeText = (type) => {
  const typeMap = {
    'URL_FORMAT_ERROR': 'URL格式错误',
    'NETWORK_ERROR': '网络错误',
    'TIMEOUT': '请求超时',
    'ASSERTION_FAILED': '断言失败',
    'AUTH_ERROR': '认证错误',
    'VALIDATION_ERROR': '验证错误',
    'SCRIPT_ERROR': '脚本错误',
    'UNKNOWN_ERROR': '未知错误'
  }
  return typeMap[type] || type || '未知错误'
}

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
  
  if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    suggestions.push('检查API路径是否正确')
    suggestions.push('确认接口是否已部署')
  }
  
  if (errorMessage.includes('500')) {
    suggestions.push('检查服务器端代码是否有bug')
    suggestions.push('查看服务器日志获取详细错误信息')
  }
  
  return suggestions
}

const canAutoFix = (errorMessage) => {
  if (!errorMessage) return false
  return errorMessage.includes('no protocol') || errorMessage.includes('URL格式错误')
}

const getAutoFixTitle = (errorMessage) => {
  if (errorMessage.includes('no protocol')) {
    return '检测到URL缺少协议前缀，将自动添加 http://'
  }
  return '检测到配置问题'
}

const handleQuickFix = () => {
  resultDialogVisible.value = false
  // 打开执行配置对话框
  executeDialogVisible.value = true
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

// 复制相关数据
const copyDialogVisible = ref(false)
const copying = ref(false)
const copyFormRef = ref(null)
const copyFormData = reactive({
  caseCode: '',
  name: '',
  description: ''
})

// 复制对话框相关：实时校验与复制功能
const copyCodeError = ref('')

const generateCopyCode = () => {
  const originalCode = props.testCase?.caseCode || props.testCase?.case_code || props.testCase?.id || 'CASE'
  const timestamp = new Date().toISOString().slice(0,19).replace(/[-:T]/g,'').slice(0,14)
  copyFormData.caseCode = `${originalCode}_COPY_${timestamp}`
  ElMessage.success('已生成新的用例编码')
}

const copyCaseCodeToClipboard = async () => {
  try {
    if (!copyFormData.caseCode) {
      ElMessage.warning('用例编码为空，无法复制')
      return
    }
    await navigator.clipboard.writeText(copyFormData.caseCode)
    ElMessage.success('用例编码已复制到剪贴板')
  } catch (e) {
    console.error('复制编码失败:', e)
    ElMessage.error('复制失败，请手动复制')
  }
}

watch(() => copyFormData.caseCode, (val) => {
  if (!val) {
    copyCodeError.value = ''
    return
  }
  if (val.length < 2 || val.length > 50) {
    copyCodeError.value = '编码长度应为 2 到 50 个字符'
    return
  }
  const pattern = /^[A-Z0-9_-]+$/
  if (!pattern.test(val)) {
    copyCodeError.value = '编码只能包含大写字母、数字、下划线和连字符'
    return
  }
  copyCodeError.value = ''
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
const copyingLink = ref(false)
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
  // 直接打开执行配置对话框
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
        // 对于连接失败等情况，断言肯定是失败的
        const hasError = response.data.failure_message || response.data.failureMessage || response.data.status === 'failed'
        executionResult.value = {
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
          logsLink: response.data.logsLink || response.data.logs_link,
          reportId: response.data.reportId || response.data.report_id,
          // 额外信息
          environment: requestData.environment || 'dev',
          executionType: 'manual',
          scopeName: response.data.caseName || response.data.case_name || '单个测试用例'
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
  copyingLink.value = true
  try {
    await navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('分享链接已复制到剪贴板')
    setTimeout(() => {
      copyingLink.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
    copyingLink.value = false
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
  if (!baseUrl) return ''
  return baseUrl
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

// 格式化变量 JSON
const formatVariables = () => {
  if (!executeVariables.value || !executeVariables.value.trim()) {
    return
  }
  try {
    const parsed = JSON.parse(executeVariables.value)
    executeVariables.value = JSON.stringify(parsed, null, 2)
    variablesError.value = ''
  } catch (e) {
    variablesError.value = 'JSON 格式错误：' + (e.message || '无法解析')
  }
}

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

/* 结果横幅 */
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
  border-color: #409eff;
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
  color: #409eff;
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
  color: #409eff;
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
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
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
  width: 44px;
  height: 44px;
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
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 失败详情 */
.failure-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #fbc4c4;
}

.detail-item {
  margin-bottom: 12px;
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
  color: #409eff;
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
  margin-top: 12px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae7ff;
}

.quick-fix-section .detail-label {
  color: #096dd9;
  margin-bottom: 10px;
}

.quick-fix-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-fix-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.fix-step {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.fix-content {
  flex: 1;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  padding-top: 2px;
}

/* 自动修复 */
.auto-fix-section {
  margin-top: 12px;
  padding: 10px;
  background: #fffbe6;
  border-radius: 6px;
  border: 1px solid #ffe58f;
  display: flex;
  align-items: center;
  gap: 12px;
}

.auto-fix-section .el-alert {
  flex: 1;
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

/* 复制对话框样式 */
.copy-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg,#fbfdff 0%, #ffffff 100%);
  border-bottom: 1px solid #eaf3ff;
}
.copy-dialog .copy-info {
  margin-top: 12px;
}
.copy-dialog .copy-preview {
  margin-top: 16px;
  border: 1px solid #eaf3ff;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(16,24,40,0.04);
}
.copy-dialog .preview-header {
  font-weight: 600;
  color: #2b3a4b;
  margin-bottom: 8px;
}
.copy-dialog .preview-body .preview-row {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  align-items: center;
}
.copy-dialog .preview-body .label {
  min-width: 90px;
  color: #909399;
  font-size: 13px;
}
.copy-dialog .preview-body .value {
  color: #303133;
  font-weight: 600;
}
.copy-dialog .preview-body .desc .value {
  font-weight: 400;
  color: #606266;
  white-space: pre-wrap;
}
.copy-dialog .copy-error {
  margin-top: 8px;
  color: #f56c6c;
  font-size: 13px;
}

/* 分享对话框样式 */
.share-dialog .el-dialog__body {
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

.share-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 24px;
}

/* 分享头部区域 */
.share-header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #e3f2fd;
}

.share-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #409eff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.share-header-info {
  flex: 1;
}

.share-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.share-subtitle {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

/* 分享信息横幅 */
.share-info-banner {
  margin-bottom: 24px;
}

.share-info-alert .el-alert__content {
  padding-top: 16px;
}

.share-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.feature-icon {
  color: #409eff;
  font-size: 16px;
}

/* 表单区域 */
.share-form-section {
  margin-bottom: 24px;
}

.share-form {
  background: #fafbfc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.form-item-enhanced .el-form-item__label {
  font-weight: 500;
  color: #303133;
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
  font-weight: 500;
  color: #303133;
}

.option-desc {
  font-size: 12px;
  color: #909399;
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #e6a23c;
}

.form-tip .tip-icon {
  font-size: 14px;
}

/* 权限设置网格 */
.permissions-grid {
  margin-top: 8px;
}

.permission-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.permission-item {
  padding: 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.permission-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.05), transparent);
  transition: left 0.5s ease;
}

.permission-item:hover::before {
  left: 100%;
}

.permission-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.permission-item .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #409eff;
}

.permission-item .el-checkbox__input.is-checked .el-checkbox__inner {
  background: #409eff;
  border-color: #409eff;
  animation: checkPulse 0.3s ease;
}

@keyframes checkPulse {
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

.permission-checkbox {
  width: 100%;
  margin-right: 0 !important;
}

.permission-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.permission-icon {
  color: #409eff;
  font-size: 20px;
  flex-shrink: 0;
}

.permission-text {
  flex: 1;
}

.permission-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.permission-desc {
  font-size: 12px;
  color: #909399;
}

/* 结果区域 */
.share-result-section {
  margin-top: 24px;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
  border: 1px solid #d4edda;
  border-radius: 12px;
  margin-bottom: 20px;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #67c23a;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.success-content {
  flex: 1;
}

.success-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.success-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

/* 链接展示卡片 */
.link-display-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.link-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.link-icon {
  color: #409eff;
  font-size: 16px;
}

.link-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.link-input-wrapper {
  margin-bottom: 16px;
}

.share-link-input .el-input__inner {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  border-radius: 6px;
}

.copy-btn {
  border-radius: 0 6px 6px 0;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.copy-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.copy-btn:active::before {
  width: 120px;
  height: 120px;
}

.copy-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.copy-btn:disabled {
  background: linear-gradient(135deg, #67c23a 0%, #5cad4c 100%);
  border-color: #67c23a;
  color: white;
  cursor: not-allowed;
  transform: none;
}

/* 链接统计 */
.link-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.stat-icon {
  color: #909399;
  font-size: 14px;
}

.stat-label {
  color: #909399;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

/* 对话框底部 */
.share-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
}

.generate-btn {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.copy-link-btn {
  background: linear-gradient(135deg, #67c23a 0%, #5cad4c 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.revoke-btn {
  color: #f56c6c;
  border-color: #f56c6c;
}

.revoke-btn:hover {
  background: #fef0f0;
  border-color: #fab1a0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-dialog {
    width: 95% !important;
    margin: 10px;
  }

  .share-content {
    padding: 16px;
    max-height: 60vh;
  }

  .share-header-section {
    flex-direction: column;
    text-align: center;
    padding: 16px;
    gap: 12px;
  }

  .share-header-icon {
    width: 40px;
    height: 40px;
  }

  .share-title {
    font-size: 16px;
  }

  .share-subtitle {
    font-size: 13px;
  }

  .share-features {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .feature-item {
    padding: 6px 0;
  }

  .share-form {
    padding: 16px;
  }

  .permission-group {
    gap: 8px;
  }

  .permission-item {
    padding: 10px;
  }

  .permission-content {
    gap: 8px;
  }

  .permission-icon {
    font-size: 18px;
  }

  .success-banner {
    padding: 16px;
    gap: 12px;
  }

  .success-icon {
    width: 40px;
    height: 40px;
  }

  .success-title {
    font-size: 15px;
  }

  .link-display-card {
    padding: 16px;
  }

  .link-stats {
    flex-direction: column;
    gap: 12px;
    padding-top: 12px;
  }

  .share-dialog-footer {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .footer-left,
  .footer-right {
    justify-content: center;
    width: 100%;
  }

  .footer-right {
    flex-direction: column;
    gap: 8px;
  }

  .generate-btn,
  .copy-link-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .share-dialog {
    width: 98% !important;
    margin: 5px;
  }

  .share-content {
    padding: 12px;
  }

  .share-header-section {
    padding: 12px;
  }

  .share-form {
    padding: 12px;
  }

  .link-display-card {
    padding: 12px;
  }

  .success-banner {
    padding: 12px;
  }

  .permission-item {
    padding: 8px;
  }
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

/* 导出对话框 - 格式卡片 */
.export-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg,#f7fbff 0%, #ffffff 100%);
  border-bottom: 1px solid #eaf3ff;
}
.format-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.format-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  width: 160px;
  border-radius: 10px;
  background: linear-gradient(180deg,#ffffff 0%, #fbfdff 100%);
  border: 1px solid transparent;
  box-shadow: 0 8px 22px rgba(16,24,40,0.04);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
  outline: none;
}
.format-card:focus,
.format-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 46px rgba(16,24,40,0.06);
}
.format-card.selected {
  border-color: #409eff;
  box-shadow: 0 20px 56px rgba(64,158,255,0.08);
}
.format-card .card-icon {
  font-size: 22px;
}
.format-card .card-title {
  font-weight: 700;
  color: #2b3a4b;
}
.format-card .card-desc {
  font-size: 12px;
  color: #6b7280;
}

/* 浮动预览区域 */
.export-preview-float {
  margin-top: 18px;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg,#fbfdff 0%, #f5f9ff 100%);
  border: 1px solid #eaf3ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(16,24,40,0.04);
}
.export-preview-float .preview-top {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.export-preview-float .preview-actions {
  display: flex;
  gap: 8px;
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

.history-detail-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 16px 24px;
}

.history-detail-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.history-detail-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
}

/* 状态概览卡片 */
.status-overview-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.status-overview-card.status-success {
  background: linear-gradient(135deg, #e8f8f0 0%, #d4f0e3 100%);
  border-color: #b8e6c3;
}

.status-overview-card.status-failed {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-color: #fbcaca;
}

.status-overview-card.status-running {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe9cc 100%);
  border-color: #ffd9b3;
}

.status-overview-card.status-cancelled {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-color: #c0c0c0;
}

.status-icon-wrapper {
  margin-right: 20px;
}

.status-overview-card.status-success .status-icon-wrapper {
  color: #67c23a;
}

.status-overview-card.status-failed .status-icon-wrapper {
  color: #f56c6c;
}

.status-overview-card.status-running .status-icon-wrapper {
  color: #e6a23c;
}

.status-overview-card.status-cancelled .status-icon-wrapper {
  color: #909399;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #303133;
}

.status-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-item .stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-item.passed .stat-icon {
  color: #67c23a;
}

.stat-item.failed .stat-icon {
  color: #f56c6c;
}

.stat-item.skipped .stat-icon {
  color: #e6a23c;
}

.stat-item.total .stat-icon {
  color: #409eff;
}

.stat-item .stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-item .stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* 详细信息卡片样式 */
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

.detail-section-title .el-icon {
  font-size: 18px;
  color: #409eff;
}

.detail-section-title.error-title {
  border-bottom-color: #f56c6c;
}

.detail-section-title.error-title .el-icon {
  color: #f56c6c;
}

/* 执行人信息 */
.executor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.executor-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

/* 等宽文本 */
.mono-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

/* 时间文本 */
.time-text {
  color: #606266;
  font-size: 13px;
}

/* 进度条包装器 */
.progress-wrapper {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.progress-text {
  font-weight: 600;
}

.progress-stats {
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  color: #909399;
}

/* 配置文本域 */
.config-textarea {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

/* 错误提示 */
.error-alert {
  border-radius: 8px;
}

/* 描述项样式优化 */
.detail-section :deep(.el-descriptions__label) {
  font-weight: 600;
  background: #f5f7fa;
}

.detail-section :deep(.el-descriptions__content) {
  font-size: 14px;
}

.detail-section :deep(.el-progress__text) {
  font-weight: 600;
}

/* 对话框footer */
.history-detail-content + .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-overview-card {
    flex-direction: column;
    text-align: center;
  }

  .status-icon-wrapper {
    margin-right: 0;
    margin-bottom: 12px;
  }
}

/* 执行弹窗增强样式 */
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

.target-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* 配置区块 */
.config-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

.config-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.config-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
}

.config-card .el-card__body {
  padding: 20px;
}

/* 超时单位 */
.timeout-unit {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
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
}

/* 执行变量样式 */
.variables-wrapper {
  width: 100%;
}

.variables-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variables-textarea .el-textarea__inner {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
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

.variables-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.variables-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
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
  background: #409eff;
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
  border-color: #409eff;
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.mode-option .el-radio__input.is-checked + .el-radio__label {
  color: #409eff;
}

.mode-option .el-radio__input.is-checked .el-radio__inner {
  background: #409eff;
  border-color: #409eff;
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
  color: #409eff;
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
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.variables-container:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.variables-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.variables-icon {
  color: #409eff;
  font-size: 16px;
}

.variables-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.format-btn {
  margin-left: auto;
  color: #409eff;
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
  border-radius: 6px;
}

.variables-hint,
.variables-error {
  margin-top: 8px;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.variables-hint {
  background: #f0f9ff;
  border: 1px solid #d1ecf1;
  color: #31708f;
}

.variables-hint .hint-icon {
  color: #17a2b8;
}

.variables-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

.variables-error .error-icon {
  color: #e53e3e;
}

/* 对话框底部 */
.execute-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
}

.execute-btn {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.execute-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.execute-btn:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.execute-btn.is-loading {
  position: relative;
  overflow: hidden;
}

.execute-btn.is-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loadingShimmer 2s infinite;
}

@keyframes loadingShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 下拉框动画 */
.enhanced-select .el-select-dropdown {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.enhanced-select .el-select-dropdown__item {
  transition: all 0.2s ease;
  padding: 8px 16px;
}

.enhanced-select .el-select-dropdown__item:hover {
  background: #f0f9ff;
  color: #409eff;
}

.enhanced-select .el-select-dropdown__item.selected {
  background: #409eff;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .execute-dialog {
    width: 95% !important;
    margin: 10px;
  }

  .execute-content {
    padding: 16px;
  }

  .execute-header-section {
    flex-direction: column;
    text-align: center;
    padding: 16px;
    gap: 12px;
  }

  .execute-header-icon {
    width: 40px;
    height: 40px;
  }

  .execute-title {
    font-size: 16px;
  }

  .execute-subtitle {
    font-size: 13px;
  }

  .execute-form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .execution-mode-group {
    gap: 8px;
  }

  .mode-option {
    padding: 10px;
  }

  .mode-content {
    gap: 8px;
  }

  .mode-icon {
    font-size: 18px;
  }

  .variables-container {
    padding: 12px;
  }

  .execute-dialog-footer {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .footer-left,
  .footer-right {
    justify-content: center;
    width: 100%;
  }
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
