<template>
  <div class="case-detail-sidebar">
    <!-- 执行历史 -->
    <div class="sidebar-section">
      <h4 class="sidebar-title">执行历史</h4>
      <div v-loading="executionHistoryLoading" element-loading-text="加载中..." style="min-height: 100px;">
        <div v-if="displayHistory.length > 0" class="history-list">
          <div
            v-for="(history, index) in displayHistory"
            :key="index"
            class="history-card clickable"
            @click="$emit('view-history-detail', history)"
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
            @click="$emit('view-more-history')"
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
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheckFilled, CircleCloseFilled, View, Link, WarningFilled, User } from '@element-plus/icons-vue'

const props = defineProps({
  displayHistory: {
    type: Array,
    default: () => []
  },
  executionHistoryLoading: {
    type: Boolean,
    default: false
  },
  executionHistoryTotal: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['view-history-detail', 'view-more-history'])

// 是否显示"查看更多"按钮
const showViewMore = computed(() => {
  return props.executionHistoryTotal > 3
})

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
</script>

<style scoped>
.case-detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 320px;
  flex-shrink: 0;
}

.sidebar-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-card:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.executor-info {
  flex: 1;
  min-width: 0;
}

.executor-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 2px;
}

.executor-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.execution-type {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 3px;
}

.environment {
  background-color: #f0f9ff;
  color: #0ea5e9;
  padding: 2px 6px;
  border-radius: 3px;
}

.history-body {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.execution-time {
  flex: 1;
}

.duration {
  color: #67c23a;
  margin-right: 8px;
}

.view-detail-icon {
  color: #c0c4cc;
  transition: color 0.2s ease;
}

.history-card:hover .view-detail-icon {
  color: #409eff;
}

.empty-history {
  text-align: center;
  padding: 20px;
}

.empty-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.view-more-section {
  margin-top: 16px;
  text-align: center;
}

.view-more-btn {
  width: 100%;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
}

.related-content {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.related-code {
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

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
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .case-detail-sidebar {
    width: 100%;
    order: -1;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .sidebar-section {
    padding: 16px;
  }

  .history-card,
  .related-item {
    padding: 10px;
  }

  .comment-item {
    gap: 10px;
  }
}
</style>
