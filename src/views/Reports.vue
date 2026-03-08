<template>
  <div class="reports-container">
    <!-- 顶部工具栏 -->
    <div class="reports-header">
      <div class="header-left">
        <h2 class="page-title">📊 报告中心</h2>
        <div class="reports-stats">
          <span class="stat-item">
            <span class="stat-label">总报告数:</span>
            <span class="stat-value">{{ totalReports }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">本月新增:</span>
            <span class="stat-value text-success">{{ monthlyReports }}</span>
          </span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和过滤区域 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="关键词搜索">
          <el-input
            v-model="filterForm.searchKeyword"
            placeholder="搜索报告名称、描述"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="报告类型">
        <el-select 
            v-model="filterForm.reportType"
            placeholder="全部"
          clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="执行报告" value="execution" />
            <el-option label="趋势报告" value="trend" />
            <el-option label="API测试" value="api" />
            <el-option label="性能测试" value="performance" />
            <el-option label="自动化测试" value="automation" />
            <el-option label="手工测试" value="manual" />
        </el-select>
        </el-form-item>

        <el-form-item label="环境">
          <el-select
            v-model="filterForm.environment"
            placeholder="全部"
          clearable
            @change="handleSearch"
            style="width: 120px"
          >
            <el-option label="开发环境" value="dev" />
            <el-option label="测试环境" value="test" />
            <el-option label="预发布环境" value="staging" />
            <el-option label="生产环境" value="prod" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="filterForm.reportStatus"
            placeholder="全部"
            clearable
            @change="handleSearch"
            style="width: 120px"
          >
            <el-option label="生成中" value="generating" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>

        <el-form-item label="成功率">
          <el-input-number
            v-model="filterForm.successRateMin"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="最小"
            @change="handleSearch"
            style="width: 100px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input-number
            v-model="filterForm.successRateMax"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="最大"
            @change="handleSearch"
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleResetFilter">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级过滤 -->
      <el-collapse v-model="advancedFilterVisible" style="margin-top: 16px">
        <el-collapse-item title="高级筛选" name="advanced">
          <el-form :model="filterForm" inline>
            <el-form-item label="开始时间">
        <el-date-picker
                v-model="filterForm.startTimeBegin"
                type="datetime"
                placeholder="选择开始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                @change="handleSearch"
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item label="结束时间">
              <el-date-picker
                v-model="filterForm.startTimeEnd"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                @change="handleSearch"
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item label="文件格式">
        <el-select 
                v-model="filterForm.fileFormat"
                placeholder="全部"
          clearable
                @change="handleSearch"
                style="width: 120px"
              >
                <el-option label="HTML" value="html" />
                <el-option label="JSON" value="json" />
                <el-option label="PDF" value="pdf" />
                <el-option label="Excel" value="excel" />
        </el-select>
            </el-form-item>

            <el-form-item label="包含已删除">
              <el-switch
                v-model="filterForm.includeDeleted"
                @change="handleSearch"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
      </div>

    <!-- 调试信息面板 -->
    <el-alert
      v-if="reportList.length === 0 && !loading"
      title="调试信息"
      type="info"
      closable
      style="margin-bottom: 20px"
    >
      <template #default>
        <div style="font-size: 14px; line-height: 1.8">
          <p><strong>数据状态：</strong></p>
          <p>报告列表长度: {{ reportList.length }}</p>
          <p>总记录数: {{ pagination.total }}</p>
          <p>当前页: {{ pagination.page }}</p>
          <p>每页条数: {{ pagination.pageSize }}</p>
          <p>加载状态: {{ loading ? '加载中' : '已完成' }}</p>
          <p style="color: #e6a23c">
            ⚠️ 如果数据已查询到但未显示，请检查浏览器控制台日志
          </p>
      </div>
      </template>
    </el-alert>

    <!-- 报告列表 -->
    <div class="reports-list">
    <el-table 
      :data="reportList" 
      v-loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange"
        style="width: 100%; min-width: 1200px"
        :default-sort="{ prop: 'startTime', order: 'descending' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column prop="reportId" label="报告ID" width="80" align="center" />
        
        <el-table-column prop="reportName" label="报告名称" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="report-name-cell">
              <span class="report-name-text" @click="handleViewDetail(row)" style="cursor: pointer; color: #409eff">
                {{ row.reportName }}
              </span>
              <el-tag v-if="row.projectName" size="small" type="info" style="margin-left: 8px">
                {{ row.projectName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="reportType" label="报告类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getReportTypeTag(row.reportType)" size="small">
              {{ formatReportType(row.reportType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="environment" label="环境" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getEnvironmentTag(row.environment)" size="small">
              {{ formatEnvironment(row.environment) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reportStatus" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.reportStatus)" size="small">
              {{ formatStatus(row.reportStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="successRate" label="成功率" width="120" align="center">
          <template #default="{ row }">
            <div style="padding: 0 10px">
            <el-progress 
                :percentage="parseFloat(row.successRate || 0)"
                :color="getSuccessRateColor(row.successRate)"
                :stroke-width="6"
                :show-text="true"
                :format="() => `${(row.successRate || 0).toFixed(1)}%`"
              />
          </div>
        </template>
      </el-table-column>
      
        <el-table-column label="测试统计" width="240">
          <template #default="{ row }">
            <div class="test-stats">
              <span class="stat-badge total">总数: {{ row.totalCases || 0 }}</span>
              <span class="stat-badge success">通过: {{ row.passedCases || 0 }}</span>
              <span class="stat-badge danger">失败: {{ row.failedCases || 0 }}</span>
              <span class="stat-badge warning">跳过: {{ row.skippedCases || 0 }}</span>
          </div>
        </template>
      </el-table-column>
      
        <el-table-column prop="startTime" label="开始时间" width="160" align="center">
          <template #default="{ row }">
            <div style="line-height: 1.5; white-space: nowrap">
              {{ formatDateTime(row.startTime) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="耗时" width="90" align="center">
          <template #default="{ row }">
            <div style="white-space: nowrap">
              {{ formatDuration(row.duration) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="测试人员" width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.executorName" class="executor-cell">
              <span class="executor-name">{{ row.executorName }}</span>
              <span v-if="row.executorEmail" class="executor-email">{{ row.executorEmail }}</span>
            </div>
            <span v-else-if="row.executorId" class="text-gray">ID:{{ row.executorId }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" link @click="handleViewDetail(row)" :icon="View">
                查看
          </el-button>
              <el-button size="small" type="success" link @click="handleExport(row)" :icon="Download">
                导出
          </el-button>
              <el-button size="small" type="danger" link @click="handleDelete(row)" :icon="Delete">
                删除
              </el-button>
            </div>
        </template>
      </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <el-empty description="暂无报告数据">
            <template #image>
              <div style="font-size: 80px">📊</div>
            </template>
            <el-button type="primary" @click="handleRefresh">刷新数据</el-button>
          </el-empty>
        </template>
    </el-table>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedReports.length > 0" class="batch-actions">
        <span class="batch-info">已选择 {{ selectedReports.length }} 项</span>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    </div>

    <!-- 报告详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`报告详情 - ${currentReport?.reportName || ''}`"
      width="90%"
      :close-on-click-modal="false"
      class="report-detail-dialog"
      top="5vh"
    >
      <transition name="fade-scale" mode="out-in">
      <div v-if="currentReport" class="report-detail">
        <!-- 顶部概览卡片 -->
        <div class="detail-overview">
          <!-- 使用封装后的 StatsCard 组件，视觉与交互保持一致 -->
          <StatsCard flat label="通过用例" :value="currentReport.passedCases || 0" icon="✅" variant="success" />
          <StatsCard flat label="失败用例" :value="currentReport.failedCases || 0" icon="❌" variant="danger" />
          <StatsCard flat label="跳过用例" :value="currentReport.skippedCases || 0" icon="⚠️" variant="warning" />
          <StatsCard flat label="总用例数" :value="currentReport.totalCases || 0" icon="📊" variant="info" />
          <StatsCard flat label="成功率" :value="`${(currentReport.successRate || 0).toFixed(1)}%`" icon="🎯" variant="primary" />
          <StatsCard flat label="执行耗时" :value="formatDuration(currentReport.duration)" icon="⏱️" />
        </div>

        <!-- 标签页内容 -->
        <el-tabs v-model="activeDetailTab" class="detail-tabs">
          <!-- 数据可视化 -->
          <el-tab-pane label="📊 数据可视化" name="charts">
            <div class="charts-container">
              <div class="chart-row">
                <div class="chart-half">
                  <ChartCard flat title="测试用例分布">
                  <div ref="pieChartRef" class="chart-content"></div>
                  </ChartCard>
                </div>
                <div class="chart-half">
                  <ChartCard flat title="成功率仪表盘">
                  <div ref="gaugeChartRef" class="chart-content"></div>
                  </ChartCard>
                </div>
              </div>
              <div class="chart-row">
                <ChartCard flat title="测试结果统计" class="chart-full">
                  <div ref="barChartRef" class="chart-content"></div>
                </ChartCard>
              </div>
            </div>
          </el-tab-pane>

          <!-- 基本信息 -->
          <el-tab-pane label="ℹ️ 基本信息" name="basic">
            <el-descriptions :column="2" border class="detail-descriptions">
              <el-descriptions-item label="报告ID">
                <el-tag size="small">{{ currentReport.reportId }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="报告名称">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span v-if="!isEditingReportName">{{ currentReport.reportName }}</span>
                  <el-input
                    v-else
                    v-model="editingReportName"
                    size="small"
                    style="width: 250px;"
                    :maxlength="255"
                    show-word-limit
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
                    <el-button type="primary" size="small" @click="saveReportName">保存</el-button>
                    <el-button size="small" @click="cancelEditReportName">取消</el-button>
                  </template>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="项目名称">
                {{ currentReport.projectName }}
              </el-descriptions-item>
              <el-descriptions-item label="报告类型">
                <el-tag :type="getReportTypeTag(currentReport.reportType)" size="small">
                  {{ formatReportType(currentReport.reportType) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="环境">
                <el-tag :type="getEnvironmentTag(currentReport.environment)" size="small">
                  {{ formatEnvironment(currentReport.environment) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTag(currentReport.reportStatus)" size="small">
                  {{ formatStatus(currentReport.reportStatus) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开始时间">
                <span>{{ formatDateTime(currentReport.startTime) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="结束时间">
                <span>{{ formatDateTime(currentReport.endTime) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="执行耗时">
                <el-tag type="info" size="small">{{ formatDuration(currentReport.duration) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="测试人员">
                <div v-if="currentReport.executorName">
                  <div>{{ currentReport.executorName }}</div>
                  <div v-if="currentReport.executorEmail" class="text-gray" style="font-size: 12px;">{{ currentReport.executorEmail }}</div>
                </div>
                <span v-else-if="currentReport.executorId">用户ID: {{ currentReport.executorId }}</span>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="文件格式">
                {{ currentReport.fileFormat || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="文件大小">
                {{ formatFileSize(currentReport.fileSize) }}
              </el-descriptions-item>
              <el-descriptions-item label="生成人">
                {{ currentReport.generatorName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="下载地址" :span="2">
                <el-link v-if="currentReport.downloadUrl" :href="currentReport.downloadUrl" type="primary" target="_blank">
                  <el-icon><Download /></el-icon>
                  {{ currentReport.downloadUrl }}
                </el-link>
                <span v-else class="text-muted">暂无下载地址</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 详细数据 -->
          <el-tab-pane label="📋 详细数据" name="details">
            <div class="data-grid">
              <div class="data-card">
                <div class="data-card-header">
                  <div class="data-card-title">✅ 成功用例</div>
                  <div class="data-card-count success-text">{{ currentReport.passedCases || 0 }}</div>
                </div>
                <el-progress
                  :percentage="parseFloat((currentReport.passedCases / currentReport.totalCases * 100).toFixed(2))"
                  :stroke-width="10"
                  status="success"
                />
              </div>

              <div class="data-card">
                <div class="data-card-header">
                  <div class="data-card-title">❌ 失败用例</div>
                  <div class="data-card-count danger-text">{{ currentReport.failedCases || 0 }}</div>
                </div>
                <el-progress
                  :percentage="parseFloat((currentReport.failedCases / currentReport.totalCases * 100).toFixed(2))"
                  :stroke-width="10"
                  status="exception"
                />
              </div>

              <div class="data-card">
                <div class="data-card-header">
                  <div class="data-card-title">💔 异常用例</div>
                  <div class="data-card-count danger-text">{{ currentReport.brokenCases || 0 }}</div>
                </div>
                <el-progress
                  :percentage="parseFloat((currentReport.brokenCases / currentReport.totalCases * 100).toFixed(2))"
                  :stroke-width="10"
                  color="#f56c6c"
                />
              </div>

              <div class="data-card">
                <div class="data-card-header">
                  <div class="data-card-title">⏭️ 跳过用例</div>
                  <div class="data-card-count warning-text">{{ currentReport.skippedCases || 0 }}</div>
                </div>
                <el-progress
                  :percentage="parseFloat((currentReport.skippedCases / currentReport.totalCases * 100).toFixed(2))"
                  :stroke-width="10"
                  status="warning"
                />
              </div>
            </div>

            <!-- 汇总信息 -->
            <div class="summary-section">
              <h3 class="section-title">📈 统计汇总</h3>
              <el-descriptions :column="3" border>
                <el-descriptions-item label="总用例数">
                  <el-tag size="large" type="info">{{ currentReport.totalCases || 0 }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="已执行">
                  <el-tag size="large">{{ currentReport.executedCases || 0 }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="未执行">
                  <el-tag size="large" type="info">{{ (currentReport.totalCases || 0) - (currentReport.executedCases || 0) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="通过数">
                  <el-tag size="large" type="success">{{ currentReport.passedCases || 0 }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="失败数">
                  <el-tag size="large" type="danger">{{ currentReport.failedCases || 0 }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="跳过数">
                  <el-tag size="large" type="warning">{{ currentReport.skippedCases || 0 }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="成功率" :span="3">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <el-progress
                      :percentage="parseFloat(currentReport.successRate || 0)"
                      :color="getSuccessRateColor(currentReport.successRate || 0)"
                      :stroke-width="20"
                      style="flex: 1"
                    />
                    <el-tag size="large" :type="(currentReport.successRate || 0) >= 80 ? 'success' : 'danger'">
                      {{ (currentReport.successRate || 0).toFixed(1) }}%
                    </el-tag>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>

          <!-- 测试用例详情 -->
          <el-tab-pane label="🧪 用例详情" name="caseDetails">
            <div class="case-details-container" v-if="reportCaseResults.length > 0">
              <!-- 筛选功能 -->
              <div class="case-filter-bar">
                <el-input
                  v-model="caseFilterText"
                  placeholder="搜索用例名称或编码"
                  size="small"
                  clearable
                  style="width: 250px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select
                  v-model="caseFilterStatus"
                  placeholder="筛选状态"
                  size="small"
                  clearable
                  style="width: 120px; margin-left: 10px;"
                >
                  <el-option label="全部" value="" />
                  <el-option label="通过" value="passed" />
                  <el-option label="失败" value="failed" />
                  <el-option label="跳过" value="skipped" />
                  <el-option label="错误" value="broken" />
                </el-select>
              </div>
              
              <!-- 用例列表 -->
              <div class="case-list">
                <div
                  v-for="(caseItem, index) in filteredReportCaseResults"
                  :key="caseItem.resultId || index"
                  class="case-item"
                  :class="'case-status-' + caseItem.status"
                >
                  <!-- 用例基本信息 -->
                  <div class="case-item-header" @click="toggleReportCaseDetail(index)">
                    <div class="case-status-icon">
                      <el-icon v-if="caseItem.status === 'passed'" color="#67c23a"><CircleCheckFilled /></el-icon>
                      <el-icon v-else-if="caseItem.status === 'failed'" color="#f56c6c"><CircleCloseFilled /></el-icon>
                      <el-icon v-else-if="caseItem.status === 'skipped'" color="#e6a23c"><WarningFilled /></el-icon>
                      <el-icon v-else color="#909399"><WarningFilled /></el-icon>
                    </div>
                    <div class="case-item-info">
                      <div class="case-item-name">{{ caseItem.caseName || caseItem.caseCode || '未知用例' }}</div>
                      <div class="case-item-code">
                        <span v-if="caseItem.caseCode">{{ caseItem.caseCode }}</span>
                        <span v-if="caseItem.moduleName" class="case-tag">{{ caseItem.moduleName }}</span>
                        <span v-if="caseItem.apiName" class="case-tag">{{ caseItem.apiName }}</span>
                      </div>
                    </div>
                    <div class="case-item-meta">
                      <el-tag size="small" :type="getCaseStatusTagType(caseItem.status)">
                        {{ getCaseStatusText(caseItem.status) }}
                      </el-tag>
                      <span class="case-duration" v-if="caseItem.duration">
                        {{ formatCaseDuration(caseItem.duration) }}
                      </span>
                      <span class="case-response-status" v-if="caseItem.responseStatus">
                        HTTP {{ caseItem.responseStatus }}
                      </span>
                    </div>
                    <div class="case-item-toggle">
                      <el-icon>
                        <ArrowDown v-if="expandedReportCaseIndex !== index" />
                        <ArrowUp v-else />
                      </el-icon>
                    </div>
                  </div>
                  
                  <!-- 用例详情（可展开） -->
                  <el-collapse-transition>
                    <div class="case-item-detail" v-show="expandedReportCaseIndex === index">
                      <!-- 基本信息 -->
                      <div class="case-basic-info" v-if="caseItem.moduleName || caseItem.apiName || caseItem.environment || caseItem.browser || caseItem.testType">
                        <div class="detail-label">
                          <el-icon><InfoFilled /></el-icon>
                          基本信息
                        </div>
                        <div class="case-info-grid">
                          <div class="info-item" v-if="caseItem.moduleName">
                            <span class="info-label">模块：</span>
                            <span class="info-value">{{ caseItem.moduleName }}</span>
                          </div>
                          <div class="info-item" v-if="caseItem.apiName">
                            <span class="info-label">接口：</span>
                            <span class="info-value">{{ caseItem.apiName }}</span>
                          </div>
                          <div class="info-item" v-if="caseItem.environment">
                            <span class="info-label">环境：</span>
                            <el-tag size="small" type="info">{{ caseItem.environment }}</el-tag>
                          </div>
                          <div class="info-item" v-if="caseItem.browser">
                            <span class="info-label">浏览器：</span>
                            <span class="info-value">{{ caseItem.browser }}</span>
                          </div>
                          <div class="info-item" v-if="caseItem.testType">
                            <span class="info-label">测试类型：</span>
                            <el-tag size="small">{{ caseItem.testType }}</el-tag>
                          </div>
                          <div class="info-item" v-if="caseItem.testLayer">
                            <span class="info-label">测试层级：</span>
                            <el-tag size="small" type="success">{{ caseItem.testLayer }}</el-tag>
                          </div>
                          <div class="info-item" v-if="caseItem.severity">
                            <span class="info-label">严重程度：</span>
                            <el-tag size="small" :type="caseItem.severity === 'high' ? 'danger' : caseItem.severity === 'medium' ? 'warning' : 'info'">{{ caseItem.severity }}</el-tag>
                          </div>
                          <div class="info-item" v-if="caseItem.priority">
                            <span class="info-label">优先级：</span>
                            <el-tag size="small" type="warning">{{ caseItem.priority }}</el-tag>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 失败信息 -->
                      <div class="case-failure-info" v-if="caseItem.status === 'failed' && caseItem.failureMessage">
                        <div class="detail-label">
                          <el-icon><WarningFilled /></el-icon>
                          失败原因
                        </div>
                        <pre class="failure-message">{{ caseItem.failureMessage }}</pre>
                      </div>
                      
                      <!-- 失败类型 -->
                      <div class="case-failure-type" v-if="caseItem.failureType">
                        <div class="detail-label">
                          <el-icon><InfoFilled /></el-icon>
                          失败类型
                        </div>
                        <el-tag type="danger" size="small">{{ caseItem.failureType }}</el-tag>
                        <span v-if="caseItem.errorCode" class="error-code">错误代码: {{ caseItem.errorCode }}</span>
                      </div>
                      
                      <!-- 失败堆栈 -->
                      <div class="case-failure-trace" v-if="caseItem.failureTrace">
                        <div class="detail-label">
                          <el-icon><WarningFilled /></el-icon>
                          失败堆栈
                        </div>
                        <pre class="failure-trace">{{ caseItem.failureTrace }}</pre>
                      </div>
                      
                      <!-- 参数信息 -->
                      <div class="case-parameters" v-if="caseItem.parametersJson">
                        <div class="detail-label">
                          <el-icon><Document /></el-icon>
                          测试参数
                        </div>
                        <pre class="case-json-content">{{ formatCaseJson(caseItem.parametersJson) }}</pre>
                      </div>
                      
                      <!-- 步骤信息 -->
                      <div class="case-steps" v-if="caseItem.stepsJson">
                        <div class="detail-label">
                          <el-icon><List /></el-icon>
                          执行步骤
                        </div>
                        <pre class="case-json-content">{{ formatCaseJson(caseItem.stepsJson) }}</pre>
                      </div>
                      
                      <!-- 附件链接 -->
                      <div class="case-attachments" v-if="caseItem.screenshotLink || caseItem.logsLink">
                        <div class="detail-label">
                          <el-icon><Link /></el-icon>
                          附件
                        </div>
                        <div class="attachment-links">
                          <el-button v-if="caseItem.logsLink" type="primary" link size="small">
                            <el-icon><Document /></el-icon>
                            查看日志
                          </el-button>
                          <el-button v-if="caseItem.screenshotLink" type="success" link size="small">
                            <el-icon><Picture /></el-icon>
                            查看截图
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </el-collapse-transition>
                </div>
              </div>
              
              <!-- 无结果提示 -->
              <el-empty v-if="filteredReportCaseResults.length === 0" description="没有匹配的用例结果" />
            </div>
            <el-empty v-else description="暂无用例详情数据" />
          </el-tab-pane>
        </el-tabs>
      </div>
      </transition>

      <template #footer>
        <div class="dialog-footer-actions">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            type="warning" 
            @click="handleAIDiagnosis"
            :disabled="!currentReport || currentReport.failedCases === 0"
          >
            <el-icon><MagicStick /></el-icon>
            AI智能诊断
          </el-button>
          <el-button type="primary" @click="handleExport(currentReport)">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI智能诊断对话框 -->
    <el-dialog
      v-model="showAIDiagnosis"
      title="AI智能诊断"
      width="700px"
      :close-on-click-modal="false"
      append-to-body
    >
      <AIDiagnosisPanel
        v-if="showAIDiagnosis"
        ref="diagnosisPanelRef"
        :executionData="diagnosisExecutionData"
        :initialDiagnosisType="diagnosisExecutionData?.diagnosisType || 'test_failure'"
        :autoDiagnose="true"
      />
    </el-dialog>

    <!-- 导出选项对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出报告"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="exportForm" label-width="140px">
        <el-form-item label="导出格式">
          <el-select v-model="exportForm.exportFormat" style="width: 100%">
            <el-option label="HTML" value="html" />
            <el-option label="JSON" value="json" />
            <el-option label="PDF" value="pdf" />
            <el-option label="Excel" value="excel" />
          </el-select>
        </el-form-item>

        <el-form-item label="包含详细结果">
          <el-switch v-model="exportForm.includeDetails" />
        </el-form-item>

        <el-form-item label="包含附件信息">
          <el-switch v-model="exportForm.includeAttachments" />
        </el-form-item>

        <el-form-item label="包含失败详情">
          <el-switch v-model="exportForm.includeFailureDetails" />
        </el-form-item>

        <el-form-item label="时区">
          <el-select v-model="exportForm.timezone" style="width: 100%">
            <el-option label="上海 (GMT+8)" value="Asia/Shanghai" />
            <el-option label="香港 (GMT+8)" value="Asia/Hong_Kong" />
            <el-option label="东京 (GMT+9)" value="Asia/Tokyo" />
            <el-option label="伦敦 (GMT+0)" value="Europe/London" />
            <el-option label="纽约 (GMT-5)" value="America/New_York" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport" :loading="exporting">
          <el-icon v-if="!exporting"><Download /></el-icon>
          {{ exporting ? '导出中...' : '确认导出' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh,
  Search,
  RefreshLeft,
  View, 
  Download,
  Delete,
  MagicStick,
  Edit,
  CircleCheckFilled,
  CircleCloseFilled,
  WarningFilled,
  InfoFilled,
  ArrowDown,
  ArrowUp,
  List,
  Link,
  Picture,
  Document
} from '@element-plus/icons-vue'
import StatsCard from '../components/ui/StatsCard.vue'
import ChartCard from '../components/ui/ChartCard.vue'
import AIDiagnosisPanel from '@/components/diagnosis/AIDiagnosisPanel.vue'
import {
  getReportList,
  getReportById,
  deleteReport,
  batchDeleteReports,
  exportReport,
  updateReportName
} from '../api/report'
import { getTestCaseResultsByReportId } from '../api/testCase'
// 异步加载echarts库
let echartsPromise = null
const loadEcharts = async () => {
  if (!echartsPromise) {
    echartsPromise = import('echarts')
  }
  return await echartsPromise
}

// 响应式数据
const loading = ref(false)
const reportList = ref([])
const selectedReports = ref([])
const detailDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const currentReport = ref(null)
const currentExportReport = ref(null)
const exporting = ref(false)
const advancedFilterVisible = ref([])
const activeDetailTab = ref('charts')

// AI诊断相关
const showAIDiagnosis = ref(false)
const diagnosisPanelRef = ref(null)
const diagnosisExecutionData = ref(null)

// 测试用例详情相关
const reportCaseResults = ref([])
const caseFilterText = ref('')
const caseFilterStatus = ref('')
const expandedReportCaseIndex = ref(-1)
const loadingCaseResults = ref(false)

// 编辑报告名称相关
const isEditingReportName = ref(false)
const editingReportName = ref('')

// 图表ref
const pieChartRef = ref(null)
const gaugeChartRef = ref(null)
const barChartRef = ref(null)

// 图表实例
let pieChartInstance = null
let gaugeChartInstance = null
let barChartInstance = null
// 图表初始化状态（防止重复初始化）
const chartsInitialized = ref(false)

// 过滤表单
const filterForm = reactive({
  searchKeyword: '',
  reportType: null,
  environment: null,
  reportStatus: null,
  fileFormat: null,
  startTimeBegin: null,
  startTimeEnd: null,
  successRateMin: null,
  successRateMax: null,
  tags: '',
  includeDeleted: false
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 导出表单
const exportForm = reactive({
  exportFormat: 'html',
  includeDetails: true,
  includeAttachments: false,
  includeFailureDetails: true,
  timezone: 'Asia/Shanghai'
})

// 计算属性
const totalReports = computed(() => pagination.total)
const monthlyReports = computed(() => {
  // 这里可以添加逻辑统计本月新增报告数
  return reportList.value.length
})

// 筛选后的用例结果
const filteredReportCaseResults = computed(() => {
  let results = reportCaseResults.value
  
  // 按状态筛选
  if (caseFilterStatus.value) {
    results = results.filter(item => item.status === caseFilterStatus.value)
  }
  
  // 按关键字搜索
  if (caseFilterText.value) {
    const keyword = caseFilterText.value.toLowerCase()
    results = results.filter(item => {
      const caseName = (item.caseName || '').toLowerCase()
      const caseCode = (item.caseCode || '').toLowerCase()
      return caseName.includes(keyword) || caseCode.includes(keyword)
    })
  }
  
  return results
})

// 转换后端数据为前端格式（兼容驼峰和下划线两种格式）
const transformBackendData = (item) => {
  return {
    // 主键 - 兼容驼峰和下划线
    reportId: item.reportId || item.report_id,
    reportName: item.reportName || item.report_name,
    reportType: item.reportType || item.report_type,
    // 执行ID
    executionId: item.executionId || item.execution_id,
    // 项目信息
    projectId: item.projectId || item.project_id,
    projectName: item.projectName || item.project_name,
    // 环境
    environment: item.environment,
    // 时间
    startTime: item.startTime || item.start_time,
    endTime: item.endTime || item.end_time,
    duration: item.duration,
    // 执行人信息
    executorId: item.executorId || item.executor_id,
    executorName: item.executorName || item.executor_name,
    executorEmail: item.executorEmail || item.executor_email,
    // 用例统计 - 兼容驼峰和下划线
    totalCases: item.totalCases ?? item.total_cases,
    executedCases: item.executedCases ?? item.executed_cases,
    passedCases: item.passedCases ?? item.passed_cases,
    failedCases: item.failedCases ?? item.failed_cases,
    brokenCases: item.brokenCases ?? item.broken_cases,
    skippedCases: item.skippedCases ?? item.skipped_cases,
    // 成功率 - 后端返回的是0-1的小数，需要转成百分比显示
    successRate: item.successRate ?? item.success_rate ?? 0,
    // 状态和格式
    reportStatus: item.reportStatus || item.report_status,
    fileFormat: item.fileFormat || item.file_format,
    // 生成者信息
    generatedBy: item.generatedBy || item.generated_by,
    generatorName: item.generatorName || item.generator_name,
    // 其他
    createdAt: item.createdAt || item.created_at,
    isDeleted: item.isDeleted ?? item.is_deleted,
    // 文件信息（详情可能返回）
    fileSize: item.fileSize || item.file_size,
    downloadUrl: item.downloadUrl || item.download_url
  }
}

// 加载报告列表
const loadReportList = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: 'start_time',
      sortOrder: 'desc'
    }

    console.log('=== 开始加载报告列表 ===')
    console.log('请求参数:', params)
    
    const response = await getReportList(params)
    
    console.log('=== API响应 ===')
    console.log('完整响应对象:', response)
    console.log('响应类型:', typeof response)
    console.log('响应码:', response?.code)
    console.log('响应消息:', response?.msg)
    console.log('响应数据:', response?.data)

    // 检查响应是否成功
    if (response && (response.code === 1 || response.code === '1') && response.data) {
      const items = response.data.items || []
      const total = response.data.total || 0
      
      console.log('=== 数据处理 ===')
      console.log('报告数量:', items.length)
      console.log('总记录数:', total)
      console.log('第一条报告:', items[0])
      
      // 转换后端数据为前端格式
      reportList.value = items.map(item => transformBackendData(item))
      pagination.total = total
      
      console.log('=== 数据赋值后 ===')
      console.log('reportList.value:', reportList.value)
      console.log('reportList.value.length:', reportList.value.length)
      
      ElMessage.success(`加载了 ${reportList.value.length} 条报告`)
    } else {
      console.error('API返回错误或数据格式不正确')
      console.error('响应对象:', response)
      ElMessage.error((response && response.msg) || '加载报告列表失败')
    }
  } catch (error) {
    console.error('=== 加载报告列表异常 ===')
    console.error('错误对象:', error)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
    console.log('=== 加载完成 ===')
    console.log('loading:', loading.value)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadReportList()
}

// 重置过滤
const handleResetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    if (typeof filterForm[key] === 'boolean') {
      filterForm[key] = false
  } else {
      filterForm[key] = null
    }
  })
  filterForm.searchKeyword = ''
  filterForm.tags = ''
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadReportList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedReports.value = selection
}

// 查看详情
const handleViewDetail = async (report) => {
  loading.value = true
  // 重置测试用例详情数据
  reportCaseResults.value = []
  caseFilterText.value = ''
  caseFilterStatus.value = ''
  expandedReportCaseIndex.value = -1
  
  try {
    const response = await getReportById(report.reportId)
    console.log('=== 报告详情 API 返回 ===', response.data)
    if (response.code === 1 && response.data) {
      // 详情接口返回的也是 snake_case，需要转换
      currentReport.value = transformBackendData(response.data)
      console.log('=== 转换后的报告详情 ===', currentReport.value)
      detailDialogVisible.value = true
      
      // 加载测试用例结果详情
      await loadReportCaseResults(report.reportId)
    } else {
      ElMessage.error(response.msg || '加载报告详情失败')
    }
  } catch (error) {
    console.error('加载报告详情失败:', error)
    ElMessage.error('加载报告详情失败')
  } finally {
    loading.value = false
  }
}

// 加载报告的测试用例结果
const loadReportCaseResults = async (reportId) => {
  if (!reportId) return
  
  loadingCaseResults.value = true
  try {
    const res = await getTestCaseResultsByReportId(reportId)
    if (res && res.data) {
      // 转换后端数据为前端格式
      reportCaseResults.value = res.data.map(item => ({
        resultId: item.resultId || item.result_id,
        caseId: item.caseId || item.case_id,
        caseCode: item.caseCode || item.case_code,
        caseName: item.caseName || item.case_name,
        status: item.status,
        duration: item.duration,
        responseStatus: item.responseStatus || item.response_status,
        failureMessage: item.failureMessage || item.failure_message,
        failureType: item.failureType || item.failure_type,
        failureTrace: item.failureTrace || item.failure_trace,
        errorCode: item.errorCode || item.error_code,
        logsLink: item.logsLink || item.logs_link,
        screenshotLink: item.screenshotLink || item.screenshot_link,
        stepsJson: item.stepsJson || item.steps_json,
        parametersJson: item.parametersJson || item.parameters_json,
        moduleName: item.moduleName || item.module_name,
        apiName: item.apiName || item.api_name,
        environment: item.environment,
        browser: item.browser,
        startTime: item.startTime || item.start_time,
        endTime: item.endTime || item.end_time,
        severity: item.severity,
        priority: item.priority,
        testType: item.testType || item.test_type,
        testLayer: item.testLayer || item.test_layer
      }))
      console.log('加载测试用例结果:', reportCaseResults.value.length, '条')
    }
  } catch (error) {
    console.error('加载测试用例结果失败:', error)
  } finally {
    loadingCaseResults.value = false
  }
}

// 切换用例详情展开状态
const toggleReportCaseDetail = (index) => {
  expandedReportCaseIndex.value = expandedReportCaseIndex.value === index ? -1 : index
}

// 获取状态标签类型
const getCaseStatusTagType = (status) => {
  const typeMap = {
    'passed': 'success',
    'failed': 'danger',
    'skipped': 'warning',
    'broken': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getCaseStatusText = (status) => {
  const textMap = {
    'passed': '通过',
    'failed': '失败',
    'skipped': '跳过',
    'broken': '错误'
  }
  return textMap[status] || status
}

// 格式化用例执行时长
const formatCaseDuration = (ms) => {
  if (!ms) return '-'
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

// 格式化JSON
const formatCaseJson = (jsonStr) => {
  if (!jsonStr) return ''
  try {
    if (typeof jsonStr === 'object') {
      return JSON.stringify(jsonStr, null, 2)
    }
    const parsed = JSON.parse(jsonStr)
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return jsonStr
  }
}

// AI智能诊断
const handleAIDiagnosis = async () => {
  if (!currentReport.value) {
    ElMessage.warning('请先选择报告')
    return
  }
  
  // 先获取测试用例结果详情
  let caseResults = []
  try {
    const reportId = currentReport.value.reportId
    if (reportId) {
      const res = await getTestCaseResultsByReportId(reportId)
      if (res && res.data) {
        // 转换后端数据为前端需要的格式
        caseResults = res.data.map(item => ({
          caseId: item.caseId || item.case_id,
          caseCode: item.caseCode || item.case_code,
          caseName: item.caseName || item.case_name,
          status: item.status,
          duration: item.duration,
          responseStatus: item.responseStatus || item.response_status,
          failureMessage: item.failureMessage || item.failure_message,
          logsLink: item.logsLink || item.logs_link
        }))
        console.log('获取到测试用例结果:', caseResults.length, '条')
      }
    }
  } catch (error) {
    console.error('获取测试用例结果失败:', error)
    // 继续执行，只是没有详细用例数据
  }
  
  // 注意：transformBackendData 已经将 snake_case 转换为 camelCase
  // 所以这里应该使用 camelCase 字段名
  diagnosisExecutionData.value = {
    // 传递 executionId（转换后的驼峰命名）- 优先使用 executionId，没有则用 recordId
    executionId: currentReport.value.executionId || currentReport.value.recordId || null,
    // 传递 reportId 作为后备查询方案
    reportId: currentReport.value.reportId || null,
    diagnosisType: 'test_failure',
    // 项目名
    scopeName: currentReport.value.reportName,
    environment: currentReport.value.environment,
    executionType: currentReport.value.reportType,
    startTime: currentReport.value.startTime,
    endTime: currentReport.value.endTime,
    totalCases: currentReport.value.totalCases,
    executedCases: currentReport.value.executedCases,
    passedCases: currentReport.value.passedCases,
    failedCases: currentReport.value.failedCases,
    brokenCases: currentReport.value.brokenCases,
    skippedCases: currentReport.value.skippedCases,
    successRate: currentReport.value.successRate,
    // 判断失败状态：failed_cases > 0 则为 failed
    status: (currentReport.value.failedCases && currentReport.value.failedCases > 0) ? 'failed' : 'passed',
    duration: currentReport.value.duration,
    // 传递详细的测试用例结果（用于批量AI诊断）
    caseResults: caseResults,
    // 添加AI诊断需要的其他字段（与接口详情页的ExecutionResult.vue保持一致）
    failureMessage: caseResults.length > 0 ? `${caseResults.length}个测试用例执行失败` : '测试执行失败',
    failureType: 'TEST_FAILURE',
    // 尝试从第一个失败的用例中获取更多信息
    responseStatus: caseResults.length > 0 ? caseResults[0].responseStatus : null,
    responseBody: '',
    apiPath: '',
    apiMethod: '',
    caseName: currentReport.value.reportName
  }
  
  console.log('AI诊断数据:', diagnosisExecutionData.value)
  
  showAIDiagnosis.value = true
}

// 开始编辑报告名称
const startEditReportName = () => {
  editingReportName.value = currentReport.value.reportName
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
  
  if (editingReportName.value === currentReport.value.reportName) {
    isEditingReportName.value = false
    return
  }
  
  try {
    const response = await updateReportName(currentReport.value.reportId, editingReportName.value.trim())
    
    if (response.code === 1) {
      currentReport.value.reportName = editingReportName.value.trim()
      isEditingReportName.value = false
      ElMessage.success('报告名称更新成功')
      handleSearch()
    } else {
      ElMessage.error(response.msg || '更新报告名称失败')
    }
  } catch (error) {
    console.error('更新报告名称失败:', error)
    ElMessage.error('更新报告名称失败')
  }
}

// 导出
const handleExport = (report) => {
  currentExportReport.value = report
  exportDialogVisible.value = true
}

// 确认导出
const handleConfirmExport = async () => {
  if (!currentExportReport.value) return

  exporting.value = true
  try {
    const response = await exportReport(currentExportReport.value.reportId, exportForm)

    // 检查响应类型
    if (response instanceof Blob) {
      // 检查是否是JSON错误响应
      if (response.type === 'application/json') {
        const text = await response.text()
        const errorData = JSON.parse(text)
        
        if (errorData.code !== 1) {
          ElMessage.error(errorData.msg || '导出报告失败')
          return
        }
      }

      // 创建下载链接
      const blob = response
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 根据格式设置文件扩展名
      const extensions = {
        html: '.html',
        json: '.json',
        pdf: '.pdf',
        excel: '.xlsx'
      }
      const ext = extensions[exportForm.exportFormat] || '.html'
      link.download = `${currentExportReport.value.reportName}_${Date.now()}${ext}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('报告导出成功')
      exportDialogVisible.value = false
    } else {
      // 如果返回的不是Blob，显示错误
      ElMessage.error(response.msg || '导出报告失败')
    }
  } catch (error) {
    console.error('导出报告失败:', error)
    
    // 尝试从错误响应中提取错误信息
    if (error.response && error.response.data) {
      const errorData = error.response.data
      if (errorData.msg) {
        ElMessage.error(errorData.msg)
      } else {
        ElMessage.error('导出报告失败：服务器错误')
      }
    } else if (error.message) {
      ElMessage.error(`导出报告失败：${error.message}`)
    } else {
      ElMessage.error('导出报告失败')
    }
  } finally {
    exporting.value = false
  }
}

// 删除
const handleDelete = async (report) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告 "${report.reportName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await deleteReport(report.reportId, false)

    if (response.code === 1) {
      ElMessage.success('报告删除成功')
      loadReportList()
    } else {
      ElMessage.error(response.msg || '删除报告失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除报告失败:', error)
      ElMessage.error('删除报告失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedReports.value.length} 个报告吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const reportIds = selectedReports.value.map(r => r.reportId)
    const response = await batchDeleteReports(reportIds)

    if (response.code === 1) {
      ElMessage.success(`成功删除 ${response.data} 个报告`)
      selectedReports.value = []
      loadReportList()
    } else {
      ElMessage.error(response.msg || '批量删除报告失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除报告失败:', error)
      ElMessage.error('批量删除报告失败')
    }
  }
}

// 分页变化
const handlePageChange = (page) => {
  pagination.page = page
  loadReportList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadReportList()
}

// 初始化图表
const initCharts = async () => {
  await nextTick()

  if (!currentReport.value) return

  if (chartsInitialized.value) {
    // already initialized, just resize to be safe
    if (pieChartInstance) pieChartInstance.resize()
    if (gaugeChartInstance) gaugeChartInstance.resize()
    if (barChartInstance) barChartInstance.resize()
    return
  }

  try {
    // 并行初始化所有图表
    await Promise.all([
      initPieChart(),
      initGaugeChart(),
      initBarChart()
    ])
    chartsInitialized.value = true
  } catch (error) {
    console.error('图表初始化失败:', error)
    ElMessage.error('图表加载失败')
  }
}

// 饼图 - 测试用例分布
const initPieChart = async () => {
  if (!pieChartRef.value) return

  if (pieChartInstance) {
    pieChartInstance.dispose()
  }

  // 异步加载echarts
  const echarts = await loadEcharts()
  pieChartInstance = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: '测试用例',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: [
          { 
            value: currentReport.value.passedCases || 0, 
            name: '通过', 
            itemStyle: { color: '#67c23a' } 
          },
          { 
            value: currentReport.value.failedCases || 0, 
            name: '失败', 
            itemStyle: { color: '#f56c6c' } 
          },
          { 
            value: currentReport.value.brokenCases || 0, 
            name: '异常', 
            itemStyle: { color: '#e6a23c' } 
          },
          { 
            value: currentReport.value.skippedCases || 0, 
            name: '跳过', 
            itemStyle: { color: '#909399' } 
          }
        ]
      }
    ]
  }
  
  pieChartInstance.setOption(option)
}

// 仪表盘 - 成功率
const initGaugeChart = async () => {
  if (!gaugeChartRef.value) return

  if (gaugeChartInstance) {
    gaugeChartInstance.dispose()
  }

  // 异步加载echarts
  const echarts = await loadEcharts()
  gaugeChartInstance = echarts.init(gaugeChartRef.value)
  
  const successRate = parseFloat(currentReport.value.successRate || 0)
  
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: successRate >= 80 ? '#67c23a' : successRate >= 60 ? '#e6a23c' : '#f56c6c'
        },
        progress: {
          show: true,
          width: 30
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 30,
            color: [[1, '#e5e5e5']]
          }
        },
        axisTick: {
          distance: -38,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        splitLine: {
          distance: -45,
          length: 14,
          lineStyle: {
            width: 3,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -20,
          color: '#999',
          fontSize: 14
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '100%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '0%'],
          fontSize: 50,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: 'inherit'
        },
        data: [
          {
            value: successRate
          }
        ]
      }
    ]
  }
  
  gaugeChartInstance.setOption(option)
}

// 柱状图 - 测试结果统计
const initBarChart = async () => {
  if (!barChartRef.value) return

  if (barChartInstance) {
    barChartInstance.dispose()
  }

  // 异步加载echarts
  const echarts = await loadEcharts()
  barChartInstance = echarts.init(barChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['总用例数', '已执行', '通过', '失败', '异常', '跳过'],
      axisLabel: {
        fontSize: 14
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 14
      }
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [
          {
            value: currentReport.value.totalCases || 0,
            itemStyle: { color: '#409eff' }
          },
          {
            value: currentReport.value.executedCases || 0,
            itemStyle: { color: '#409eff' }
          },
          {
            value: currentReport.value.passedCases || 0,
            itemStyle: { color: '#67c23a' }
          },
          {
            value: currentReport.value.failedCases || 0,
            itemStyle: { color: '#f56c6c' }
          },
          {
            value: currentReport.value.brokenCases || 0,
            itemStyle: { color: '#e6a23c' }
          },
          {
            value: currentReport.value.skippedCases || 0,
            itemStyle: { color: '#909399' }
          }
        ],
        label: {
          show: true,
          position: 'top',
          fontSize: 14,
          fontWeight: 'bold'
        },
        barWidth: '40%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0]
        }
      }
    ]
  }
  
  barChartInstance.setOption(option)
}

// 监听详情对话框打开，初始化图表
watch(detailDialogVisible, async (newVal) => {
  if (newVal && currentReport.value && activeDetailTab.value === 'charts') {
    // 等待DOM渲染完成
    await nextTick()
      initCharts()
  }
  // 如果对话框关闭，销毁图表以释放内存，下次打开重新初始化
  if (!newVal) {
    disposeCharts()
  }
})

// 监听标签页切换
watch(activeDetailTab, async (newVal) => {
  if (newVal === 'charts' && detailDialogVisible.value && currentReport.value) {
    await nextTick()
      initCharts()
  }
})

// 销毁图表实例并重置初始化状态
function disposeCharts() {
  if (pieChartInstance) {
    try { pieChartInstance.dispose() } catch (e) { /* ignore */ }
    pieChartInstance = null
  }
  if (gaugeChartInstance) {
    try { gaugeChartInstance.dispose() } catch (e) { /* ignore */ }
    gaugeChartInstance = null
  }
  if (barChartInstance) {
    try { barChartInstance.dispose() } catch (e) { /* ignore */ }
    barChartInstance = null
  }
  chartsInitialized.value = false
}

// 窗口大小改变时重新渲染图表
window.addEventListener('resize', () => {
  if (pieChartInstance) {
    pieChartInstance.resize()
  }
  if (gaugeChartInstance) {
    gaugeChartInstance.resize()
  }
  if (barChartInstance) {
    barChartInstance.resize()
  }
})

// 格式化函数
const formatReportType = (type) => {
  const types = {
    api: 'API测试',
    performance: '性能测试',
    automation: '自动化测试',
    manual: '手工测试',
    execution: '执行报告',
    trend: '趋势报告'
  }
  return types[type] || type
}

const formatEnvironment = (env) => {
  const environments = {
    dev: '开发环境',
    development: '开发环境',
    test: '测试环境',
    testing: '测试环境',
    staging: '预发布环境',
    prod: '生产环境',
    production: '生产环境'
  }
  return environments[env] || env
}

const formatStatus = (status) => {
  const statuses = {
    generating: '生成中',
    completed: '已完成',
    failed: '失败'
  }
  return statuses[status] || status
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  
  // 如果小于1秒，显示毫秒
  if (duration < 1000) {
    return `${duration}ms`
  }
  
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分${seconds % 60}秒`
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

const formatFileSize = (size) => {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

// 标签类型
const getReportTypeTag = (type) => {
  const tags = {
    api: 'primary',
    performance: 'success',
    automation: 'warning',
    manual: 'info',
    execution: 'primary',
    trend: 'success'
  }
  return tags[type] || ''
}

const getEnvironmentTag = (env) => {
  const tags = {
    dev: 'info',
    development: 'info',
    test: 'warning',
    testing: 'warning',
    staging: 'primary',
    prod: 'danger',
    production: 'danger'
  }
  return tags[env] || ''
}

const getStatusTag = (status) => {
  const tags = {
    generating: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return tags[status] || ''
}

const getSuccessRateColor = (rate) => {
  const rateNum = parseFloat(rate)
  if (rateNum >= 90) return '#67c23a'
  if (rateNum >= 70) return '#e6a23c'
  return '#f56c6c'
}

// 生命周期
onMounted(() => {
  loadReportList()
})
</script>

<style scoped>
.text-gray {
  color: #909399;
  font-size: 12px;
}

.executor-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.4;
}

.executor-cell .executor-name {
  font-weight: 500;
}

.executor-cell .executor-email {
  font-size: 11px;
  color: #909399;
}

.reports-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  writing-mode: horizontal-tb;
  word-break: normal;
  overflow-wrap: normal;
}

/* 顶部工具栏 */
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.reports-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

/* 过滤区域 */
.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 报告列表 */
.reports-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

/* 确保表格文本正常横向显示 */
.reports-list :deep(.el-table) {
  writing-mode: horizontal-tb;
  font-size: 14px;
}

.reports-list :deep(.el-table__header) {
  font-weight: 600;
  color: #303133;
}

.reports-list :deep(.el-table__cell) {
  writing-mode: horizontal-tb;
  word-break: normal;
  white-space: normal;
  padding: 12px 8px;
}

.reports-list :deep(.cell) {
  writing-mode: horizontal-tb;
  word-break: normal;
  white-space: normal;
  line-height: 1.6;
  overflow: visible;
}

.reports-list :deep(.el-table__row) {
  transition: background-color 0.2s;
}

.reports-list :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.report-name-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  writing-mode: horizontal-tb;
  word-break: normal;
}

.report-name-text {
  font-weight: 500;
  word-break: break-word;
  white-space: normal;
  line-height: 1.6;
  max-width: 100%;
}

.test-stats {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
}

.stat-badge.total {
  background: #f4f4f5;
  color: #606266;
  border: 1px solid #e4e7ed;
}

.stat-badge.success {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #c6e2ff;
}

.stat-badge.danger {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.stat-badge.warning {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* 批量操作 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ecf5ff;
  border-radius: 4px;
  margin-top: 16px;
}

.batch-info {
  color: #409eff;
  font-weight: 500;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* 报告详情对话框 */
.report-detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

.report-detail {
  padding: 0;
}

/* 强化对话框样式：毛玻璃 + 内边距微调 */
.report-detail-dialog {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.12);
}

.report-detail {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 在较大屏幕上把概览和标签页并排显示以提升信息密度 */
@media (min-width: 1200px) {
  .report-detail {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 20px;
    align-items: start;
  }
  .detail-tabs {
    grid-column: 2 / 3;
  }
  .detail-overview {
    grid-column: 1 / 2;
    margin-bottom: 0;
  }
}

/* 顶部概览卡片 */
.detail-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 36px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.success-icon {
  background: linear-gradient(135deg, #a8e6cf 0%, #67c23a 100%);
}

.danger-icon {
  background: linear-gradient(135deg, #ffa8a8 0%, #f56c6c 100%);
}

.warning-icon {
  background: linear-gradient(135deg, #ffe4a8 0%, #e6a23c 100%);
}

.info-icon {
  background: linear-gradient(135deg, #a8d5ff 0%, #409eff 100%);
}

.primary-icon {
  background: linear-gradient(135deg, #c6a8ff 0%, #9c27b0 100%);
}

.time-icon {
  background: linear-gradient(135deg, #ffd4a8 0%, #ff9800 100%);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.success-text {
  color: #67c23a;
}

.danger-text {
  color: #f56c6c;
}

.warning-text {
  color: #e6a23c;
}

.primary-text {
  color: #409eff;
}

.text-muted {
  color: #909399;
}

/* 标签页样式 */
.detail-tabs {
  margin-top: 24px;
}

.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.detail-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
}

/* 图表容器 */
.charts-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.chart-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-row:last-child {
  margin-bottom: 0;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-half {
  flex: 1;
  min-width: 0;
}

.chart-full {
  width: 100%;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}

.chart-content {
  width: 100%;
  height: 350px;
}

/* 详细描述样式 */
.detail-descriptions {
  margin-top: 16px;
}

.detail-descriptions :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
}

.detail-descriptions :deep(.el-descriptions__content) {
  color: #303133;
}

/* 数据网格 */
.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.data-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.data-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.data-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.data-card-count {
  font-size: 28px;
  font-weight: bold;
}

/* 汇总部分 */
.summary-section {
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

/* 对话框底部 */
.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .detail-overview {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .chart-row {
    flex-direction: column;
  }
  
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .detail-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .data-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .detail-overview {
    grid-template-columns: 1fr;
  }
  
  .card-value {
    font-size: 20px;
  }
  
  .chart-content {
    height: 250px;
  }
}

/* 测试用例详情样式 */
.case-details-container {
  padding: 16px 0;
}

.case-filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.case-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.case-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.case-item.case-status-passed {
  border-left: 3px solid #67c23a;
}

.case-item.case-status-failed {
  border-left: 3px solid #f56c6c;
}

.case-item.case-status-skipped {
  border-left: 3px solid #e6a23c;
}

.case-item.case-status-broken {
  border-left: 3px solid #909399;
}

.case-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  background: #fff;
}

.case-item-header:hover {
  background: #f5f7fa;
}

.case-status-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-item-info {
  flex: 1;
  min-width: 0;
}

.case-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.case-item-code {
  font-size: 12px;
  color: #909399;
  font-family: 'Monaco', 'Menlo', monospace;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.case-tag {
  display: inline-block;
  padding: 1px 6px;
  margin-right: 6px;
  font-size: 11px;
  color: #909399;
  background: #e4e7ed;
  border-radius: 3px;
}

.case-item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.case-duration {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.case-response-status {
  font-size: 12px;
  color: #909399;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.case-item-toggle {
  color: #c0c4cc;
  transition: transform 0.3s ease;
}

.case-item-detail {
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}

.case-basic-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.case-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.case-info-grid .info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.case-info-grid .info-label {
  color: #909399;
  flex-shrink: 0;
}

.case-info-grid .info-value {
  color: #303133;
  font-weight: 500;
}

.case-failure-info,
.case-failure-type,
.case-parameters,
.case-steps {
  margin-bottom: 16px;
}

.case-failure-info .detail-label,
.case-failure-type .detail-label,
.case-parameters .detail-label,
.case-steps .detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.case-failure-info .detail-label .el-icon {
  color: #f56c6c;
}

.case-failure-type .detail-label .el-icon {
  color: #f56c6c;
}

.failure-message {
  margin: 8px 0 0 0;
  padding: 12px;
  background: #1e1e1e;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu', monospace;
  font-size: 13px;
  color: #e6a23c;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.error-code {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.failure-trace {
  margin: 8px 0 0 0;
  padding: 12px;
  background: #1e1e1e;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu', monospace;
  font-size: 12px;
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.5;
}

.case-json-content {
  margin: 8px 0 0 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu', monospace;
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.case-attachments {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}

.attachment-links {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.detail-label .el-icon {
  color: #409eff;
}
</style>
