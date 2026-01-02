<template>
  <div class="case-detail-skeleton">
    <!-- 头部区域骨架屏 -->
    <div class="skeleton-header">
      <!-- 面包屑导航 -->
      <div class="skeleton-breadcrumb">
        <SkeletonLoader variant="text" :width="60" />
        <span class="breadcrumb-separator">›</span>
        <SkeletonLoader variant="text" :width="120" />
      </div>

      <!-- 标题和操作区域 -->
      <div class="skeleton-title-section">
        <div class="skeleton-title-row">
          <SkeletonLoader variant="text" :width="300" height="32" />
          <SkeletonLoader variant="button" :width="80" />
        </div>
        <div class="skeleton-actions">
          <SkeletonLoader variant="button" :width="100" />
          <SkeletonLoader variant="button" :width="80" />
          <SkeletonLoader variant="button" :width="80" />
          <SkeletonLoader variant="button" :width="80" />
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="skeleton-content">
      <!-- 左侧主要信息 -->
      <div class="skeleton-main">
        <!-- 基本信息卡片 -->
        <div class="skeleton-card">
          <div class="skeleton-card-header">
            <SkeletonLoader variant="text" :width="120" />
          </div>
          <div class="skeleton-card-content">
            <div class="skeleton-form-row" v-for="i in 4" :key="`basic-${i}`">
              <SkeletonLoader variant="text" :width="80" />
              <SkeletonLoader variant="text" :width="i % 2 === 0 ? 200 : 150" />
            </div>
          </div>
        </div>

        <!-- API信息卡片 -->
        <div class="skeleton-card">
          <div class="skeleton-card-header">
            <SkeletonLoader variant="text" :width="100" />
          </div>
          <div class="skeleton-card-content">
            <div class="skeleton-form-row" v-for="i in 6" :key="`api-${i}`">
              <SkeletonLoader variant="text" :width="90" />
              <SkeletonLoader variant="text" :width="i % 3 === 0 ? 250 : 180" />
            </div>
            <!-- 请求体预览 -->
            <div class="skeleton-code-block">
              <div class="skeleton-code-lines">
                <SkeletonLoader variant="text" :width="300" v-for="i in 3" :key="`code-${i}`" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏 -->
      <div class="skeleton-sidebar">
        <!-- 执行历史卡片 -->
        <div class="skeleton-card">
          <div class="skeleton-card-header">
            <SkeletonLoader variant="text" :width="100" />
          </div>
          <div class="skeleton-history-list">
            <div class="skeleton-history-item" v-for="i in 5" :key="`history-${i}`">
              <div class="skeleton-history-icon">
                <SkeletonLoader variant="avatar" :width="32" :height="32" circle />
              </div>
              <div class="skeleton-history-content">
                <SkeletonLoader variant="text" :width="120" />
                <SkeletonLoader variant="text" :width="80" />
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息卡片 -->
        <div class="skeleton-card">
          <div class="skeleton-card-header">
            <SkeletonLoader variant="text" :width="80" />
          </div>
          <div class="skeleton-stats">
            <div class="skeleton-stat-item" v-for="i in 4" :key="`stat-${i}`">
              <SkeletonLoader variant="metric" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonLoader from '../SkeletonLoader.vue'
</script>

<style scoped>
.case-detail-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

/* 头部区域 */
.skeleton-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
}

.breadcrumb-separator {
  color: #c0c4cc;
}

.skeleton-title-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skeleton-actions {
  display: flex;
  gap: 12px;
}

/* 主要内容区域 */
.skeleton-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.skeleton-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skeleton-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片样式 */
.skeleton-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.skeleton-card-header {
  margin-bottom: 16px;
}

.skeleton-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-form-row :deep(.skeleton-item) {
  margin-bottom: 0;
}

/* 代码块样式 */
.skeleton-code-block {
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(222, 226, 230, 0.5);
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.skeleton-code-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 历史列表样式 */
.skeleton-history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.skeleton-history-item:last-child {
  border-bottom: none;
}

.skeleton-history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

/* 统计信息样式 */
.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.skeleton-stat-item {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .skeleton-content {
    grid-template-columns: 1fr;
  }

  .skeleton-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .case-detail-skeleton {
    padding: 16px;
    gap: 20px;
  }

  .skeleton-card {
    padding: 20px;
  }

  .skeleton-stats {
    grid-template-columns: 1fr;
  }

  .skeleton-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .skeleton-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .skeleton-form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
