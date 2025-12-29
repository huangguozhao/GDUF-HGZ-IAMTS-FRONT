<template>
  <el-card
    class="message-item"
    shadow="hover"
    :data-read="message.read"
    :aria-label="message.title + (message.read ? ' 已读' : ' 未读')"
    role="article"
  >
    <div class="item-row">
      <div class="left">
        <div class="title-row">
          <span class="title">{{ message.title }}</span>
          <el-tag
            v-if="!message.read"
            type="danger"
            size="mini"
            class="unread-tag unread-tag-accessible"
            aria-hidden="false"
          >未读</el-tag>
        </div>
        <div class="preview" v-html="message.content"></div>
      </div>
      <div class="right">
        <div class="time">{{ message.time }}</div>
        <div class="actions" role="group" aria-label="message actions">
          <el-button
            type="text"
            size="small"
            title="Toggle read"
            @click.stop="emit('mark', message)"
            aria-label="Toggle read"
          >
            <el-icon><CircleCheck /></el-icon>
          </el-button>
          <el-button
            type="text"
            size="small"
            title="Delete message"
            @click.stop="emit('delete', message)"
            aria-label="Delete message"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ElIcon } from 'element-plus'
import { CircleCheck, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['mark', 'delete'])
</script>

<style scoped>
.message-item {
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
  line-height: 1.4;
}

.preview {
  font-size: 14px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  margin-bottom: 8px;
}

.unread-tag {
  margin-left: 6px;
  background: linear-gradient(135deg, #f56c6c, #ff7875);
  border: none;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.message-item:hover .actions {
  opacity: 1;
}

/* 未读消息样式 */
.message-item[data-read="false"] {
  background: linear-gradient(135deg,
    rgba(24, 144, 255, 0.08) 0%,
    rgba(67, 192, 58, 0.04) 100%);
  border-left: 3px solid #1890ff;
}

.message-item[data-read="false"] .title {
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-item {
    padding: 14px;
  }

  .item-row {
    gap: 12px;
  }

  .title {
    font-size: 14px;
  }

  .preview {
    font-size: 13px;
  }

  .time {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .message-item {
    padding: 12px;
  }

  .title-row {
    margin-bottom: 6px;
  }

  .actions {
    opacity: 1;
  }
}</style>


