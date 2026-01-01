<template>
  <PageTransition name="message" :duration="800">
    <div class="messages-view">
      <Container type="inline-size" max-width="1400px" padding="24px">
        <div class="messages-container">
          <!-- 欢迎区域 -->
          <transition name="welcome-fade" appear>
            <MessageWelcome
              :messages="allMessages"
              @mark-all-read="handleMarkAllRead"
              @refresh="handleRefresh"
            />
          </transition>

          <!-- 主要内容区域 -->
          <transition name="content-slide" appear>
            <MessageCenter
              ref="messageCenterRef"
              :initial-messages="allMessages"
              @messages-updated="handleMessagesUpdated"
            />
          </transition>
        </div>
      </Container>
    </div>
  </PageTransition>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import Container from '@/components/ui/Container.vue'
import PageTransition from '@/components/ui/PageTransition.vue'
import MessageWelcome from '@/components/business/MessageCenter/MessageWelcome.vue'
import toast from '@/utils/toast'

// 懒加载消息中心组件
const MessageCenter = defineAsyncComponent(() =>
  import('@/components/business/MessageCenter/MessageCenter.vue')
)

// 消息数据管理
const allMessages = reactive([
  {
    id: 'm1',
    title: '测试报告生成完成',
    content: '<p>您的测试报告 <strong>#2025-12-28</strong> 已生成，点击查看详情。</p><p>报告包含了完整的测试结果分析和性能指标。</p>',
    time: '2025-12-28 21:05',
    read: false,
    type: 'system',
    priority: 'normal'
  },
  {
    id: 'm2',
    title: '用例执行失败提醒',
    content: '<p>用例 <em>支付流程-退款</em> 执行失败，错误代码 500。</p><p>请检查服务状态和网络连接。</p>',
    time: '2025-12-27 18:20',
    read: true,
    type: 'alerts',
    priority: 'high'
  },
  {
    id: 'm3',
    title: '权限变更通知',
    content: '<p>您已被添加到项目 <strong>电商支付系统</strong> 的测试成员组。</p><p>现在您可以访问项目的完整测试资源。</p>',
    time: '2025-12-25 09:12',
    read: false,
    type: 'system',
    priority: 'normal'
  },
  {
    id: 'm4',
    title: '系统维护通知',
    content: '<p>系统将在今晚 23:00-01:00 进行例行维护。</p><p>届时服务可能会短暂中断，请提前保存工作。</p>',
    time: '2025-12-24 14:30',
    read: false,
    type: 'system',
    priority: 'high'
  },
  {
    id: 'm5',
    title: 'API接口更新提醒',
    content: '<p>用户服务API接口已更新版本至 v2.1.0。</p><p>新增了数据验证功能，建议更新相关测试用例。</p>',
    time: '2025-12-23 11:15',
    read: true,
    type: 'system',
    priority: 'normal'
  },
  {
    id: 'm6',
    title: '项目协作邀请',
    content: '<p>用户 <strong>张三</strong> 邀请您加入 <em>物流管理系统</em> 项目。</p><p>点击接受邀请开始参与项目测试工作。</p>',
    time: '2025-12-22 16:45',
    read: false,
    type: 'system',
    priority: 'normal'
  }
])

const messageCenterRef = ref(null)

const handleMarkAllRead = () => {
  allMessages.forEach(msg => {
    msg.read = true
  })
  toast.success('已将所有消息标记为已读')
}

const handleRefresh = () => {
  // 模拟刷新数据
  setTimeout(() => {
    toast.success('消息列表已刷新')
  }, 500)
}

const handleMessagesUpdated = (updatedMessages) => {
  // 同步更新allMessages
  updatedMessages.forEach(updatedMsg => {
    const index = allMessages.findIndex(msg => msg.id === updatedMsg.id)
    if (index !== -1) {
      Object.assign(allMessages[index], updatedMsg)
    }
  })
}

onMounted(() => {
  // 页面加载完成后的额外处理
  console.log('消息页面加载完成')
})
</script>

<style scoped>
.messages-view {
  min-height: 100vh;
  background: linear-gradient(135deg,
    rgba(248, 250, 252, 1) 0%,
    rgba(241, 245, 249, 1) 100%);
  padding: 0;
}

.messages-container {
  max-width: 100%;
  margin: 0 auto;
}

/* 欢迎区域动画 */
.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.welcome-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.welcome-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 内容区域动画 */
.content-slide-enter-active,
.content-slide-leave-active {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.content-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.content-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .messages-view {
    background: #f8fafc;
  }

  .messages-container {
    padding: 0;
  }
}
</style>


