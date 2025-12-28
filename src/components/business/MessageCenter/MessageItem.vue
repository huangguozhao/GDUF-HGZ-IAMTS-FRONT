<template>
  <el-card class="message-item" shadow="hover" :aria-label="message.title + (message.read ? ' 已读' : ' 未读')">
    <div class="item-row">
      <div class="left">
        <div class="title-row">
          <span class="title">{{ message.title }}</span>
          <el-tag v-if="!message.read" type="danger" size="mini" class="unread-tag">未读</el-tag>
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
  padding: 10px;
}
.item-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
.title {
  font-weight: 600;
  color: #303133;
}
.preview {
  font-size: 13px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
.unread-tag {
  margin-left: 6px;
}
</style>


