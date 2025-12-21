<template>
  <div class="welcome-section glass-card rounded-xl">
    <div class="welcome-left">
      <img v-if="userAvatar" :src="userAvatar" alt="avatar" class="avatar" />
      <div class="welcome-text">
        <h2 class="welcome-title">{{ greeting }}</h2>
        <p class="current-date">{{ formattedDate }}</p>
      </div>
    </div>
    <div class="welcome-actions">
      <button class="modern-btn" @click="quickCreate">新建用例</button>
      <button class="btn-gradient-primary" @click="quickRun">运行测试</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()
const userAvatar = computed(() => userStore.avatar || '/images/avatar.png')

// 生成问候语
const greeting = computed(() => {
  const userName = userStore.userName || '用户'
  const hour = new Date().getHours()
  let timeGreeting = ''
  
  if (hour < 6) {
    timeGreeting = '凌晨好'
  } else if (hour < 9) {
    timeGreeting = '早上好'
  } else if (hour < 12) {
    timeGreeting = '上午好'
  } else if (hour < 14) {
    timeGreeting = '中午好'
  } else if (hour < 18) {
    timeGreeting = '下午好'
  } else if (hour < 22) {
    timeGreeting = '晚上好'
  } else {
    timeGreeting = '夜深了'
  }
  
  return `${timeGreeting},${userName},欢迎回来!`
})

// 格式化日期
const formattedDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[now.getDay()]
  
  return `${year}年${month}月${day}日 ${weekday}`
})

// 快捷操作（临时前端行为）
const quickCreate = () => {
  // TODO: 跳转到新建用例页面或打开弹窗
  console.log('点击 新建用例')
}

const quickRun = () => {
  // TODO: 打开运行测试面板
  console.log('点击 运行测试')
}
</script>

<style scoped>
.welcome-section {
  margin-bottom: 32px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

.current-date {
  font-size: 15px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.welcome-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.welcome-text {
  display: flex;
  flex-direction: column;
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 22px;
  }
  
  .current-date {
    font-size: 14px;
  }
  .avatar { display: none; }
  .welcome-section { padding: 12px; flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>

