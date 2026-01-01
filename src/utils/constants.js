/**
 * 项目常量定义文件
 * 统一管理API路径、状态枚举、选项等常量
 */

// ==================== API路径常量 ====================

// 基础API路径
export const API_BASE = '/api'

// 测试用例相关API路径
export const API_PATHS = {
  // 测试用例
  TEST_CASES: '/testcases',

  // 项目相关
  PROJECTS: '/projects',
  PROJECT_MODULES: '/project-modules',

  // 用户相关
  USERS: '/users',
  USER_PROFILE: '/user/profile',
  USER_PROJECTS: '/user/projects',

  // 任务相关
  TASKS: '/tasks',

  // 报告相关
  REPORTS: '/reports',

  // 设置相关
  SETTINGS_BASIC: '/settings/basic',
  SETTINGS_CONFIGS: '/settings/configs',

  // 人员相关
  PERSONNEL: '/personnel',

  // 认证相关
  AUTH: '/auth',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

  // 环境相关
  ENVIRONMENTS: '/environments',

  // 统计相关
  STATISTICS: '/statistics',

  // 文件上传
  UPLOAD: '/upload',

  // 通知相关
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_SETTINGS: '/notification-settings',

  // 系统信息
  SYSTEM_INFO: '/system/info',

  // 集成相关
  INTEGRATION_LOGS: '/integration/logs',
  INTEGRATION_SETTINGS: '/integration/settings',

  // 权限相关
  PERMISSIONS: '/permissions',
  ROLES: '/roles',

  // 消息相关
  MESSAGES: '/messages',

  // 缓存相关
  CACHE: '/cache',
  CACHE_INVALIDATE: '/cache/invalidate'
}

// ==================== 状态枚举常量 ====================

// 任务状态
export const TASK_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

// 测试用例执行状态
export const TEST_CASE_STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
  PENDING: 'pending',
  RUNNING: 'running',
  SKIPPED: 'skipped'
}

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive'
}

// 测试用例优先级
export const TEST_PRIORITY = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3'
}

// 测试用例严重程度
export const TEST_SEVERITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

// 测试类型
export const TEST_TYPE = {
  FUNCTIONAL: 'functional',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  INTEGRATION: 'integration',
  REGRESSION: 'regression'
}

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// ==================== 选项配置 ====================

// 任务状态选项
export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.ENABLED, label: '启用' },
  { value: TASK_STATUS.DISABLED, label: '禁用' }
]

// 测试用例状态选项
export const TEST_CASE_STATUS_OPTIONS = [
  { value: TEST_CASE_STATUS.PASSED, label: '通过' },
  { value: TEST_CASE_STATUS.FAILED, label: '失败' },
  { value: TEST_CASE_STATUS.PENDING, label: '待执行' },
  { value: TEST_CASE_STATUS.RUNNING, label: '执行中' },
  { value: TEST_CASE_STATUS.SKIPPED, label: '跳过' }
]

// 用户状态选项
export const USER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: USER_STATUS.ACTIVE, label: '活跃' },
  { value: USER_STATUS.PENDING, label: '待审核' },
  { value: USER_STATUS.INACTIVE, label: '已禁用' }
]

// 优先级选项
export const PRIORITY_OPTIONS = [
  { value: TEST_PRIORITY.P1, label: 'P1 - 最高优先级' },
  { value: TEST_PRIORITY.P2, label: 'P2 - 中等优先级' },
  { value: TEST_PRIORITY.P3, label: 'P3 - 低优先级' }
]

// 严重程度选项
export const SEVERITY_OPTIONS = [
  { value: TEST_SEVERITY.HIGH, label: '高' },
  { value: TEST_SEVERITY.MEDIUM, label: '中' },
  { value: TEST_SEVERITY.LOW, label: '低' }
]

// 测试类型选项
export const TEST_TYPE_OPTIONS = [
  { value: TEST_TYPE.FUNCTIONAL, label: '功能测试' },
  { value: TEST_TYPE.PERFORMANCE, label: '性能测试' },
  { value: TEST_TYPE.SECURITY, label: '安全测试' },
  { value: TEST_TYPE.INTEGRATION, label: '集成测试' },
  { value: TEST_TYPE.REGRESSION, label: '回归测试' }
]

// ==================== 分页相关常量 ====================

// 默认分页大小
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_PAGE_SIZES = [10, 20, 50, 100]

// ==================== 时间相关常量 ====================

// 超时时间（毫秒）
export const TIMEOUTS = {
  REQUEST: 10000, // API请求超时
  EXECUTION: 30000, // 测试执行超时
  CACHE: 3600000 // 缓存过期时间（1小时）
}

// ==================== 文件大小限制 ====================

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024 // 50MB
}

// ==================== 正则表达式 ====================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
}

// ==================== 导出的便捷对象 ====================

export default {
  API_BASE,
  API_PATHS,
  TASK_STATUS,
  TEST_CASE_STATUS,
  USER_STATUS,
  TEST_PRIORITY,
  TEST_SEVERITY,
  TEST_TYPE,
  HTTP_STATUS,
  TASK_STATUS_OPTIONS,
  TEST_CASE_STATUS_OPTIONS,
  USER_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  SEVERITY_OPTIONS,
  TEST_TYPE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZES,
  TIMEOUTS,
  FILE_SIZE_LIMITS,
  REGEX
}
