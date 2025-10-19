<template>
  <div class="not-found">
    <div class="not-found__content">
      <div class="not-found__icon">
        <el-icon size="120">
          <Warning />
        </el-icon>
      </div>
      <h1 class="not-found__title">404</h1>
      <h2 class="not-found__subtitle">页面不存在</h2>
      <p class="not-found__description">
        抱歉，您访问的页面不存在或已被删除
      </p>
      <div class="not-found__actions">
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
        <el-button @click="goBack">
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Warning } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.not-found__content {
  text-align: center;
  max-width: 500px;
}

.not-found__icon {
  margin-bottom: 24px;
  color: #f56c6c;
}

.not-found__title {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
  margin: 0 0 16px 0;
  line-height: 1;
}

.not-found__subtitle {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.not-found__description {
  font-size: 16px;
  color: #909399;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.not-found__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .not-found__title {
    font-size: 48px;
  }
  
  .not-found__subtitle {
    font-size: 24px;
  }
  
  .not-found__actions {
    flex-direction: column;
    align-items: center;
  }
  
  .not-found__actions .el-button {
    width: 200px;
  }
}
</style>
