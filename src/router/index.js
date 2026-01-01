import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/useUserStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      requiresGuest: true
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: true
    }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('../views/Cases.vue'),
    meta: {
      title: '用例管理',
      requiresAuth: true
    },
    children: [
      {
        path: ':caseId',
        name: 'CaseDetail',
        component: () => import('../views/CaseDetailPage.vue'),
        meta: {
          title: '用例详情',
          requiresAuth: true
        }
      },
      {
        path: 'create',
        name: 'CreateCase',
        component: () => import('../views/CreateCase.vue'),
        meta: {
          title: '创建用例',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: {
      title: '报告中心',
      requiresAuth: true
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: {
      title: '任务安排',
      requiresAuth: true
    }
  },
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('../views/Personnel.vue'),
    meta: {
      title: '人员管理',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '系统设置',
      requiresAuth: true
    }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue'),
    meta: {
      title: '消息中心',
      requiresAuth: true
    }
  },
  {
    path: '/share/testcase/:shareId',
    name: 'ShareTestCase',
    component: () => import('../views/ShareTestCase.vue'),
    meta: {
      title: '分享测试用例',
      requiresAuth: false  // 分享页面不需要登录
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 初始化用户状态
  if (!userStore.isLoggedIn) {
    userStore.initializeAuth()
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 接口自动化管理平台`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
  // 检查是否需要游客状态（如登录页面）
  else if (to.meta.requiresGuest) {
    if (userStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
  // 其他情况直接通过
  else {
    next()
  }
})

export default router
