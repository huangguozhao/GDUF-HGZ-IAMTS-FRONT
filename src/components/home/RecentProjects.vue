<template>
  <div class="recent-projects">
    <div class="section-header">
      <h3 class="section-title">最近编辑的项目</h3>
      <el-link
        href="#"
        class="view-all-link hover-scale"
        :loading="loading"
        @click="handleViewAll"
      >
        查看全部
      </el-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <SkeletonLoader variant="card" :count="3" />
    </div>

    <!-- 内容区域 -->
    <div v-else-if="!loading">
      <div v-if="projects.length > 0" class="project-list">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.id || index"
          :project="project"
          :show-actions="showActions"
          @action="handleProjectAction"
        />
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else
        title="暂无项目"
        description="您还没有编辑过任何项目，开始创建您的第一个项目吧"
        action-text="创建项目"
        @action="handleCreateProject"
      >
        <template #icon>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.8954 17 5V7M7 7H17"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProjectCard from './ProjectCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import toast from '@/utils/toast'

const props = defineProps({
  projects: {
    type: Array,
    required: true,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-all', 'project-action', 'create-project'])
const router = useRouter()

const handleViewAll = () => {
  emit('view-all')
  // 可以导航到项目列表页面
  // router.push('/projects')
}

const handleProjectAction = (data) => {
  const { command, project } = data

  try {
    // 执行操作逻辑
    emit('project-action', data)

    // 操作成功反馈
    let message = ''
    switch (command) {
      case 'edit':
        message = `正在编辑项目 "${project.name}"`
        break
      case 'delete':
        message = `项目 "${project.name}" 已删除`
        break
      case 'duplicate':
        message = `项目 "${project.name}" 已复制`
        break
      default:
        message = '操作成功'
    }

    toast.success(message)
  } catch (error) {
    toast.error('操作失败，请重试')
    console.error('Project action error:', error)
  }
}

const handleCreateProject = () => {
  emit('create-project')
  toast.info('正在跳转到项目创建页面...')
}
</script>

<style scoped>
.recent-projects {
  padding: 24px;
  background: transparent;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.view-all-link {
  font-size: 14px;
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-all-link:hover {
  color: #40a9ff;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .recent-projects {
    padding: 16px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .project-list {
    gap: 12px;
  }
}
</style>

