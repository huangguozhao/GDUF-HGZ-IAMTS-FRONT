<template>
  <el-container class="layout-container">
    <!-- 顶部标题栏 -->
    <el-header class="header">
      <div class="header-left">
        <h1 class="system-title">接口自动化管理</h1>
        <p class="system-subtitle">API AutoOps</p>
      </div>
      <div class="header-right">
        <el-link href="#" class="nav-link">首页</el-link>
        <el-input
          v-model="searchText"
          placeholder="搜索..."
          class="search-input"
          :prefix-icon="Search"
        />
        <el-badge :value="3" class="notification-badge">
          <el-icon class="notification-icon">
            <Bell />
          </el-icon>
        </el-badge>
        <div class="user-info" @click="handleUserClick">
          <el-avatar :size="40" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="user-details">
            <div class="user-name">{{ userStore.userName }}</div>
            <div class="user-team">测试团队</div>
          </div>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
      </div>
    </el-header>

    <el-container>
      <!-- 左侧菜单栏 -->
      <el-aside :width="sidebarCollapsed ? '60px' : '200px'" class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-menu">
          <div 
            v-for="item in menuItems" 
            :key="item.index"
            class="menu-item"
            :class="{ 'is-active': activeMenu === item.index }"
            @click="handleMenuSelect(item.index)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label" v-if="!sidebarCollapsed">{{ item.label }}</span>
          </div>
        </div>
        <div class="collapse-nav" v-if="!sidebarCollapsed">
          <button class="collapse-btn" @click="toggleSidebar">
            <span class="collapse-icon">‹</span>
            <span>收起导航</span>
          </button>
        </div>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  Search,
  Bell,
  User,
  ArrowDown,
  House,
  Document,
  List,
  UserFilled,
  Setting,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/useUserStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchText = ref('')
const sidebarCollapsed = ref(false)

// 菜单项配置
const menuItems = [
  { index: 'home', label: '首页', icon: '🏠' },
  { index: 'cases', label: '用例管理', icon: '📋' },
  { index: 'reports', label: '报告中心', icon: '📊' },
  { index: 'tasks', label: '任务安排', icon: '📅' },
  { index: 'personnel', label: '人员管理', icon: '👥' },
  { index: 'settings', label: '系统设置', icon: '⚙️' }
]

// 根据当前路由设置活动菜单
const activeMenu = computed(() => {
  const routeMap = {
    '/': 'home',
    '/cases': 'cases',
    '/reports': 'reports',
    '/tasks': 'tasks',
    '/personnel': 'personnel',
    '/settings': 'settings'
  }
  return routeMap[route.path] || 'home'
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMenuSelect = (index) => {
  // 根据菜单项跳转到对应页面
  const routeMap = {
    'home': '/',
    'cases': '/cases',
    'reports': '/reports',
    'tasks': '/tasks',
    'personnel': '/personnel',
    'settings': '/settings'
  }
  
  if (routeMap[index]) {
    router.push(routeMap[index])
  }
}

const handleUserClick = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await userStore.logout()
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.system-title {
  font-family: '楷体', 'KaiTi', serif;
  font-size: 30px;
  font-weight: bold;
  color: #303133;
  margin: 0;
  line-height: 1;
}

.system-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  font-size: 16px;
  color: #606266;
  text-decoration: none;
}

.search-input {
  width: 200px;
}

.notification-badge {
  cursor: pointer;
}

.notification-icon {
  font-size: 20px;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-avatar {
  background-color: #409eff;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-team {
  font-size: 12px;
  color: #909399;
}

.dropdown-icon {
  font-size: 12px;
  color: #c0c4cc;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 60px !important;
}

.sidebar-menu {
  flex: 1;
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #606266;
  margin: 2px 8px;
  border-radius: 4px;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.is-active {
  background: #409eff;
  color: white;
}

.menu-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.menu-label {
  font-size: 14px;
  flex: 1;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 12px;
}

.collapse-nav {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
}

.collapse-btn {
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #909399;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  border-radius: 4px;
}

.collapse-btn:hover {
  color: #606266;
  background: #f5f7fa;
}

.collapse-icon {
  font-size: 18px;
}

.main-content {
  background: #f5f7fa;
  padding: 0;
  overflow: hidden;
}
</style>
