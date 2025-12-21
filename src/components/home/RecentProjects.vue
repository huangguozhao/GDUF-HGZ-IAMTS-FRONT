<template>
  <div class="recent-projects">
    <div class="section-header">
      <h3 class="section-title">最近编辑的项目</h3>
      <el-link 
        href="#" 
        class="view-all-link hover-scale"
        @click="handleViewAll"
      >
        查看全部
      </el-link>
    </div>
    
    <div class="project-list">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.id || index"
        :project="project"
        :show-actions="showActions"
        @action="handleProjectAction"
      />
    </div>
    
    <div v-if="projects.length === 0" class="empty-state">
      <el-empty description="暂无最近编辑的项目" :image-size="100" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProjectCard from './ProjectCard.vue'

const props = defineProps({
  projects: {
    type: Array,
    required: true,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['view-all', 'project-action'])
const router = useRouter()

const handleViewAll = () => {
  emit('view-all')
  // 可以导航到项目列表页面
  // router.push('/projects')
}

const handleProjectAction = (data) => {
  emit('project-action', data)
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

