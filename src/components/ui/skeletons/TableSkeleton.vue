<template>
  <div class="table-skeleton">
    <!-- 表格头部 -->
    <div class="skeleton-table-header">
      <div class="skeleton-table-title">
        <SkeletonLoader variant="text" :width="150" />
      </div>
      <div class="skeleton-table-actions">
        <SkeletonLoader variant="button" :width="100" v-for="i in actionCount" :key="`action-${i}`" />
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="skeleton-table-container">
      <table class="skeleton-table">
        <!-- 表头 -->
        <thead class="skeleton-table-thead">
          <tr class="skeleton-table-row">
            <th
              v-for="col in columns"
              :key="`header-${col.key}`"
              :class="['skeleton-table-cell', `skeleton-table-cell--${col.key}`]"
              :style="{ width: col.width }"
            >
              <SkeletonLoader variant="text" :width="col.headerWidth || 80" />
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody class="skeleton-table-tbody">
          <tr
            v-for="rowIndex in rowCount"
            :key="`row-${rowIndex}`"
            class="skeleton-table-row"
          >
            <td
              v-for="col in columns"
              :key="`cell-${rowIndex}-${col.key}`"
              :class="['skeleton-table-cell', `skeleton-table-cell--${col.key}`]"
            >
              <!-- 头像列 -->
              <div v-if="col.type === 'avatar'" class="skeleton-avatar-cell">
                <SkeletonLoader variant="avatar" :width="32" :height="32" circle />
                <SkeletonLoader variant="text" :width="col.contentWidth || 80" />
              </div>

              <!-- 标签列 -->
              <div v-else-if="col.type === 'tag'" class="skeleton-tag-cell">
                <SkeletonLoader variant="text" :width="col.contentWidth || 60" />
              </div>

              <!-- 按钮列 -->
              <div v-else-if="col.type === 'actions'" class="skeleton-actions-cell">
                <SkeletonLoader variant="button" :width="col.buttonWidth || 60" v-for="i in col.buttonCount || 2" :key="`btn-${rowIndex}-${i}`" />
              </div>

              <!-- 普通文本列 -->
              <SkeletonLoader
                v-else
                variant="text"
                :width="col.contentWidth || (col.key === 'name' ? 100 : 80)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页区域 -->
    <div class="skeleton-pagination" v-if="showPagination">
      <div class="skeleton-pagination-info">
        <SkeletonLoader variant="text" :width="120" />
      </div>
      <div class="skeleton-pagination-controls">
        <SkeletonLoader variant="button" :width="60" />
        <SkeletonLoader variant="text" :width="200" />
        <SkeletonLoader variant="button" :width="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SkeletonLoader from '../SkeletonLoader.vue'

const props = defineProps({
  // 表格列配置
  columns: {
    type: Array,
    default: () => [
      { key: 'name', type: 'text', width: '20%', contentWidth: 100 },
      { key: 'email', type: 'text', width: '25%', contentWidth: 150 },
      { key: 'role', type: 'tag', width: '15%', contentWidth: 60 },
      { key: 'date', type: 'text', width: '20%', contentWidth: 80 },
      { key: 'actions', type: 'actions', width: '20%', buttonCount: 2, buttonWidth: 50 }
    ]
  },
  // 行数
  rowCount: {
    type: Number,
    default: 5
  },
  // 头部操作按钮数量
  actionCount: {
    type: Number,
    default: 2
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 是否显示表头
  showHeader: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.table-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

/* 表格头部 */
.skeleton-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: 1px solid rgba(222, 226, 230, 0.3);
}

.skeleton-table-title {
  flex: 1;
}

.skeleton-table-actions {
  display: flex;
  gap: 12px;
}

/* 表格容器 */
.skeleton-table-container {
  overflow-x: auto;
}

.skeleton-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.skeleton-table-thead {
  background: rgba(248, 249, 250, 0.6);
}

.skeleton-table-row {
  border-bottom: 1px solid rgba(222, 226, 230, 0.3);
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-table-cell {
  padding: 16px 12px;
  text-align: left;
  vertical-align: middle;
  border-right: 1px solid rgba(222, 226, 230, 0.2);
}

.skeleton-table-cell:last-child {
  border-right: none;
}

.skeleton-table-cell--name {
  font-weight: 500;
}

.skeleton-table-cell--actions {
  text-align: center;
}

/* 特殊单元格类型 */
.skeleton-avatar-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-tag-cell {
  display: flex;
  justify-content: center;
}

.skeleton-actions-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 分页区域 */
.skeleton-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(248, 249, 250, 0.6);
  border-top: 1px solid rgba(222, 226, 230, 0.3);
}

.skeleton-pagination-info {
  flex: 1;
}

.skeleton-pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .skeleton-table-cell {
    padding: 12px 8px;
  }

  .skeleton-table-header {
    padding: 16px 20px;
  }

  .skeleton-pagination {
    padding: 12px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .skeleton-pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .table-skeleton {
    border-radius: 8px;
  }

  .skeleton-table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 16px;
  }

  .skeleton-table-actions {
    justify-content: center;
  }

  .skeleton-table-cell {
    padding: 10px 6px;
    font-size: 13px;
  }

  /* 移动端隐藏一些列 */
  .skeleton-table-cell--email {
    display: none;
  }

  .skeleton-table-cell--date {
    display: none;
  }
}

@media (max-width: 480px) {
  .skeleton-table-header {
    padding: 12px;
  }

  .skeleton-pagination {
    padding: 12px 16px;
  }

  .skeleton-table-cell {
    padding: 8px 4px;
    font-size: 12px;
  }

  /* 在小屏幕上只显示姓名和操作列 */
  .skeleton-table-cell--role {
    display: none;
  }
}
</style>
