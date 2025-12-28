<template>
  <div class="message-center">
    <div class="header-row" role="banner" aria-label="消息中心头部">
      <h2>消息中心</h2>
      <div class="actions">
        <el-button
          type="primary"
          size="small"
          @click="markAllRead"
          aria-label="Mark all messages as read"
        >
          全部标记已读
        </el-button>
      </div>
    </div>

    <div class="content-row" role="region" aria-label="消息列表与详情">
      <div class="list-column" aria-label="消息列表">
        <MessageList
          :messages="messages"
          @select="handleSelect"
        />
      </div>
      <div class="detail-column" v-if="selectedMessage">
        <el-card class="detail-card">
          <div class="detail-title">
            <h3>{{ selectedMessage.title }}</h3>
            <div class="meta">{{ selectedMessage.time }}</div>
          </div>
          <div class="detail-body" v-html="selectedMessage.content"></div>
        </el-card>
      </div>
      <div class="detail-column placeholder" v-else>
        <el-card class="detail-card empty">
          请选择一条消息以查看详情
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import MessageList from './MessageList.vue'

// Mock 数据（静态页面）
const messages = reactive([
  {
    id: 'm1',
    title: '测试报告生成完成',
    content: '<p>您的测试报告 <strong>#2025-12-28</strong> 已生成，点击查看详情。</p>',
    time: '2025-12-28 21:05',
    read: false
  },
  {
    id: 'm2',
    title: '用例执行失败提醒',
    content: '<p>用例 <em>支付流程-退款</em> 执行失败，错误代码 500，请排查。</p>',
    time: '2025-12-27 18:20',
    read: true
  },
  {
    id: 'm3',
    title: '权限变更通知',
    content: '<p>您已被添加到项目 <strong>电商支付系统</strong> 的测试成员组。</p>',
    time: '2025-12-25 09:12',
    read: false
  }
])

const selectedMessage = ref(null)

const handleSelect = (msg) => {
  // 标记为已读并显示详情
  const target = messages.find(m => m.id === msg.id)
  if (target) target.read = true
  selectedMessage.value = target
}

const markAllRead = () => {
  messages.forEach(m => { m.read = true })
}
</script>

<style scoped>
.message-center {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content-row {
  display: flex;
  gap: 20px;
}
.list-column {
  width: 360px;
}
.detail-column {
  flex: 1;
}
.detail-card.empty {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.detail-body {
  line-height: 1.8;
  color: #303133;
}

/* 可聚焦元素的可见聚焦样式，提高键盘可访问性 */
.message-list:focus-within .message-row:focus,
.message-row:focus {
  outline: 3px solid rgba(24, 144, 255, 0.18);
  border-radius: 8px;
}

/* 响应式：小屏幕堆叠 */
@media (max-width: 900px) {
  .content-row {
    flex-direction: column;
  }
  .list-column {
    width: 100%;
  }
  .detail-column {
    width: 100%;
  }
}
</style>


