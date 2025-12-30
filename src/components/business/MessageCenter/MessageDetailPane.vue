<template>
  <div class="message-detail-pane" v-if="message">
    <div class="detail-header">
      <div class="left">
        <h2 class="title">{{ message.title }}</h2>
        <div class="meta">{{ message.time }}</div>
      </div>
      <div class="right actions">
        <el-button type="text" size="small" @click="$emit('mark', message)">
          <el-icon><CircleCheck /></el-icon>
        </el-button>
        <el-button type="text" size="small" @click="$emit('delete', message)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <el-card class="detail-card">
      <div class="detail-content" v-html="message.content"></div>
    </el-card>
  </div>

  <div v-else class="message-detail-placeholder">
    <el-card class="detail-card empty">
      <div class="empty-illustration">📭</div>
      <div class="empty-text">请选择左侧消息查看详情。</div>
    </el-card>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { CircleCheck, Delete } from '@element-plus/icons-vue'
const props = defineProps({
  message: { type: Object, default: null }
})
const emit = defineEmits(['mark', 'delete'])
</script>

<style scoped>
.message-detail-pane {
  display:flex;
  flex-direction:column;
  gap:12px;
}
.detail-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}
.detail-header .title {
  margin:0;
  font-size:20px;
  color:#303133;
}
.detail-header .meta {
  color:#909399;
  font-size:13px;
}
.detail-card {
  padding:20px;
  background:rgba(255,255,255,0.95);
  border-radius:12px;
  border:1px solid rgba(255,255,255,0.4);
}
.detail-content {
  line-height:1.8;
  color:#303133;
}
.message-detail-placeholder .empty-illustration {
  font-size:48px;
  text-align:center;
}
.message-detail-placeholder .empty-text {
  text-align:center;
  color:#909399;
  margin-top:12px;
}
</style>


