<template>
  <div class="project-list-skeleton">
    <!-- 工具栏区域 -->
    <div class="skeleton-toolbar">
      <div class="skeleton-toolbar-left">
        <SkeletonLoader variant="button" :width="120" />
        <SkeletonLoader variant="button" :width="80" />
      </div>
      <div class="skeleton-toolbar-right">
        <SkeletonLoader variant="text" :width="200" />
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="skeleton-search">
      <SkeletonLoader variant="text" :width="300" />
    </div>

    <!-- 树形结构区域 -->
    <div class="skeleton-tree">
      <!-- 项目节点 -->
      <div class="skeleton-project-node" v-for="projectIndex in projectCount" :key="`project-${projectIndex}`">
        <div class="skeleton-node-content">
          <SkeletonLoader variant="text" :width="160" />
        </div>
        <div class="skeleton-node-menu">
          <SkeletonLoader variant="text" :width="24" />
        </div>

        <!-- 展开的模块节点 -->
        <div class="skeleton-modules" v-if="expandedProjects.includes(projectIndex)">
          <div class="skeleton-module-node" v-for="moduleIndex in modulesPerProject" :key="`module-${projectIndex}-${moduleIndex}`">
            <div class="skeleton-node-content">
              <span class="skeleton-expand-icon">▶</span>
              <SkeletonLoader variant="text" :width="140" />
            </div>
            <div class="skeleton-node-menu">
              <SkeletonLoader variant="text" :width="24" />
            </div>

            <!-- 展开的API节点 -->
            <div class="skeleton-apis" v-if="expandedModules.includes(`${projectIndex}-${moduleIndex}`)">
              <div class="skeleton-api-node" v-for="apiIndex in apisPerModule" :key="`api-${projectIndex}-${moduleIndex}-${apiIndex}`">
                <div class="skeleton-node-content">
                  <span class="skeleton-expand-icon">▶</span>
                  <SkeletonLoader variant="text" :width="120" />
                </div>
                <div class="skeleton-node-menu">
                  <SkeletonLoader variant="text" :width="24" />
                </div>

                <!-- 测试用例列表 -->
                <div class="skeleton-cases" v-if="expandedApis.includes(`${projectIndex}-${moduleIndex}-${apiIndex}`)">
                  <div class="skeleton-case-item" v-for="caseIndex in casesPerApi" :key="`case-${projectIndex}-${moduleIndex}-${apiIndex}-${caseIndex}`">
                    <SkeletonLoader variant="text" :width="100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SkeletonLoader from '../SkeletonLoader.vue'

const props = defineProps({
  // 项目数量
  projectCount: {
    type: Number,
    default: 3
  },
  // 每个项目下的模块数量
  modulesPerProject: {
    type: Number,
    default: 2
  },
  // 每个模块下的API数量
  apisPerModule: {
    type: Number,
    default: 3
  },
  // 每个API下的用例数量
  casesPerApi: {
    type: Number,
    default: 5
  },
  // 默认展开的项目索引
  expandedProjects: {
    type: Array,
    default: () => [0, 1]
  },
  // 默认展开的模块索引
  expandedModules: {
    type: Array,
    default: () => ['0-0', '1-0']
  },
  // 默认展开的API索引
  expandedApis: {
    type: Array,
    default: () => ['0-0-0', '1-0-0']
  }
})
</script>

<style scoped>
.project-list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 工具栏区域 */
.skeleton-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(222, 226, 230, 0.3);
}

.skeleton-toolbar-left {
  display: flex;
  gap: 12px;
}

.skeleton-toolbar-right {
  display: flex;
  align-items: center;
}

/* 搜索区域 */
.skeleton-search {
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(222, 226, 230, 0.3);
}

/* 树形结构 */
.skeleton-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 项目节点 */
.skeleton-project-node {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
}

.skeleton-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(222, 226, 230, 0.3);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.skeleton-node-menu {
  margin-left: auto;
}

.skeleton-expand-icon {
  color: #c0c4cc;
  font-size: 12px;
  margin-right: 4px;
}

/* 模块节点 */
.skeleton-modules {
  margin-left: 24px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-module-node {
  display: flex;
  flex-direction: column;
}

/* API节点 */
.skeleton-apis {
  margin-left: 24px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-api-node {
  display: flex;
  flex-direction: column;
}

/* 测试用例列表 */
.skeleton-cases {
  margin-left: 24px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skeleton-case-item {
  padding: 8px 16px;
  margin-left: 8px;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 4px;
  border-left: 3px solid rgba(24, 144, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-list-skeleton {
    padding: 16px;
  }

  .skeleton-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .skeleton-toolbar-left {
    justify-content: center;
  }

  .skeleton-toolbar-right {
    justify-content: center;
  }

  .skeleton-modules,
  .skeleton-apis,
  .skeleton-cases {
    margin-left: 16px;
  }

  .skeleton-node-content {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .skeleton-toolbar {
    padding: 12px;
  }

  .skeleton-search {
    padding: 10px 12px;
  }

  .skeleton-modules,
  .skeleton-apis,
  .skeleton-cases {
    margin-left: 12px;
  }

  .skeleton-node-content {
    padding: 8px 10px;
  }

  .skeleton-case-item {
    padding: 6px 12px;
    margin-left: 4px;
  }
}
</style>
