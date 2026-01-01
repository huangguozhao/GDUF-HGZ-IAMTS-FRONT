<template>
  <div class="cache-manager">
    <el-card class="cache-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>缓存管理</span>
          <el-tag type="info" size="small">v{{ currentVersion }}</el-tag>
        </div>
      </template>

      <div class="cache-content">
        <!-- 缓存状态 -->
        <div class="cache-section">
          <h4>缓存状态</h4>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">当前版本:</span>
              <span class="value">{{ currentVersion }}</span>
            </div>
            <div class="status-item">
              <span class="label">Service Worker:</span>
              <el-tag :type="cacheStatus.hasServiceWorker ? 'success' : 'info'" size="small">
                {{ cacheStatus.hasServiceWorker ? '支持' : '不支持' }}
              </el-tag>
            </div>
            <div class="status-item">
              <span class="label">缓存存储:</span>
              <el-tag :type="cacheStatus.cacheStorage ? 'success' : 'info'" size="small">
                {{ cacheStatus.cacheStorage ? '支持' : '不支持' }}
              </el-tag>
            </div>
            <div class="status-item">
              <span class="label">本地存储:</span>
              <el-tag :type="cacheStatus.localStorage ? 'success' : 'info'" size="small">
                {{ cacheStatus.localStorage ? '支持' : '不支持' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 缓存操作 -->
        <div class="cache-section">
          <h4>缓存操作</h4>
          <div class="action-buttons">
            <el-button
              type="primary"
              size="small"
              @click="updateVersion"
              :loading="updating"
            >
              更新版本
            </el-button>

            <el-button
              type="warning"
              size="small"
              @click="clearCache"
              :loading="clearing"
            >
              清除缓存
            </el-button>

            <el-button
              type="danger"
              size="small"
              @click="forceRefresh"
              :loading="refreshing"
            >
              强制刷新
            </el-button>
          </div>
        </div>

        <!-- 缓存策略说明 -->
        <div class="cache-section">
          <h4>缓存策略</h4>
          <div class="strategy-list">
            <div class="strategy-item" v-for="(strategy, type) in cacheStrategies" :key="type">
              <div class="strategy-header">
                <span class="strategy-type">{{ type }}</span>
                <span class="strategy-desc">{{ getStrategyDescription(type) }}</span>
              </div>
              <div class="strategy-headers">
                <code v-for="(value, header) in strategy" :key="header">
                  {{ header }}: {{ value }}
                </code>
              </div>
            </div>
          </div>
        </div>

        <!-- 开发环境提示 -->
        <div v-if="!isProduction" class="cache-section dev-notice">
          <el-alert
            title="开发环境提示"
            description="当前处于开发环境，缓存策略已调整为开发模式（较短的缓存时间）"
            type="info"
            :closable="false"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  CACHE_STRATEGIES,
  getCacheStrategyDescription
} from '@/utils/cacheConfig.js'
import {
  getCurrentVersion,
  updateVersion as updateCacheVersion,
  clearAllCache,
  forceRefresh as forcePageRefresh,
  getCacheStatus,
  onVersionUpdate
} from '@/utils/cacheInvalidation.js'

// 响应式数据
const currentVersion = ref('')
const cacheStatus = ref({})
const updating = ref(false)
const clearing = ref(false)
const refreshing = ref(false)

// 计算属性
const cacheStrategies = computed(() => CACHE_STRATEGIES)
const isProduction = computed(() => import.meta.env.PROD)

// 方法
const updateVersion = async () => {
  updating.value = true
  try {
    updateCacheVersion()
    currentVersion.value = getCurrentVersion()
    ElMessage.success('版本已更新')
  } catch (error) {
    ElMessage.error('版本更新失败')
    console.error('Version update failed:', error)
  } finally {
    updating.value = false
  }
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有缓存吗？此操作不可撤销。',
      '确认清除缓存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    clearing.value = true
    await clearAllCache()
    currentVersion.value = getCurrentVersion()
    cacheStatus.value = getCacheStatus()
    ElMessage.success('缓存已清除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清除缓存失败')
      console.error('Cache clear failed:', error)
    }
  } finally {
    clearing.value = false
  }
}

const forceRefresh = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要强制刷新页面吗？将清除所有缓存并重新加载页面。',
      '确认强制刷新',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    refreshing.value = true
    forcePageRefresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('强制刷新失败')
      console.error('Force refresh failed:', error)
    }
    refreshing.value = false
  }
}

const getStrategyDescription = (type) => {
  return getCacheStrategyDescription(type)
}

// 生命周期
onMounted(() => {
  currentVersion.value = getCurrentVersion()
  cacheStatus.value = getCacheStatus()

  // 监听版本更新
  onVersionUpdate((newVersion) => {
    currentVersion.value = newVersion
    ElMessage.info(`版本已更新到: ${newVersion}`)
  })
})
</script>

<style scoped>
.cache-manager {
  max-width: 800px;
  margin: 0 auto;
}

.cache-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cache-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cache-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.cache-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.cache-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.status-item .label {
  font-weight: 500;
  color: #606266;
}

.status-item .value {
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.strategy-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.strategy-type {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.strategy-desc {
  font-size: 12px;
  color: #909399;
  flex: 1;
  text-align: right;
}

.strategy-headers {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.strategy-headers code {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #d73a49;
  word-break: break-all;
}

.dev-notice {
  border-bottom: none;
  padding-bottom: 0;
}

.dev-notice :deep(.el-alert) {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .strategy-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .strategy-desc {
    text-align: left;
  }
}
</style>
