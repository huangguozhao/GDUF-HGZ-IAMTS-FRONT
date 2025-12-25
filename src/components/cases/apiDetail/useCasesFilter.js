import { reactive, computed } from 'vue'

// 测试类型常量定义
export const TEST_TYPES = {
  FUNCTIONAL: 'functional',
  BOUNDARY: 'boundary',
  EXCEPTION: 'exception',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  INTEGRATION: 'integration',
  SMOKE: 'smoke',
  REGRESSION: 'regression'
}

// 测试类型显示文本映射
export const TEST_TYPE_LABELS = {
  [TEST_TYPES.FUNCTIONAL]: '功能测试',
  [TEST_TYPES.BOUNDARY]: '边界测试',
  [TEST_TYPES.EXCEPTION]: '异常测试',
  [TEST_TYPES.SECURITY]: '安全测试',
  [TEST_TYPES.PERFORMANCE]: '性能测试',
  [TEST_TYPES.INTEGRATION]: '集成测试',
  [TEST_TYPES.SMOKE]: '冒烟测试',
  [TEST_TYPES.REGRESSION]: '回归测试'
}

// 优先级常量定义
export const PRIORITY_LEVELS = {
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3'
}

// 优先级显示文本映射
export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.P0]: 'P0（最高优先级）',
  [PRIORITY_LEVELS.P1]: 'P1（高优先级）',
  [PRIORITY_LEVELS.P2]: 'P2（中等优先级）',
  [PRIORITY_LEVELS.P3]: 'P3（低优先级）'
}

// 排序选项定义
export const SORT_OPTIONS = {
  DEFAULT: 'default',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  CREATED_DESC: 'created_desc',
  UPDATED_DESC: 'updated_desc'
}

// 排序选项显示文本映射
export const SORT_LABELS = {
  [SORT_OPTIONS.DEFAULT]: '默认排序',
  [SORT_OPTIONS.NAME_ASC]: '按名称升序',
  [SORT_OPTIONS.NAME_DESC]: '按名称降序',
  [SORT_OPTIONS.CREATED_DESC]: '按创建时间降序',
  [SORT_OPTIONS.UPDATED_DESC]: '按更新时间降序'
}

// 测试类型标签颜色类型映射
export const TEST_TYPE_TAG_TYPES = {
  [TEST_TYPES.FUNCTIONAL]: 'primary',     // 蓝色 - 功能测试
  [TEST_TYPES.BOUNDARY]: 'warning',       // 橙色 - 边界测试
  [TEST_TYPES.EXCEPTION]: 'danger',       // 红色 - 异常测试
  [TEST_TYPES.SECURITY]: 'success',       // 绿色 - 安全测试
  [TEST_TYPES.PERFORMANCE]: 'info',       // 灰色 - 性能测试
  [TEST_TYPES.INTEGRATION]: 'primary',    // 蓝色 - 集成测试
  [TEST_TYPES.SMOKE]: 'success',          // 绿色 - 冒烟测试
  [TEST_TYPES.REGRESSION]: 'warning'      // 橙色 - 回归测试
}

// 优先级标签颜色类型映射
export const PRIORITY_TAG_TYPES = {
  [PRIORITY_LEVELS.P0]: 'danger',    // 红色 - 最高优先级（严重/紧急）
  [PRIORITY_LEVELS.P1]: 'warning',   // 橙色 - 高优先级（重要）
  [PRIORITY_LEVELS.P2]: '',          // 灰色 - 中等优先级（正常）
  [PRIORITY_LEVELS.P3]: 'info'       // 蓝色 - 低优先级（次要）
}

// 获取测试类型文本的函数
export function getTestTypeText(type) {
  return TEST_TYPE_LABELS[type] || type || '未分类'
}

// 获取优先级标签类型的函数
export function getPriorityTagType(priority) {
  // 支持 P0-P3 格式
  const priorityMap = {
    [PRIORITY_LEVELS.P0]: 'danger',
    [PRIORITY_LEVELS.P1]: 'warning',
    [PRIORITY_LEVELS.P2]: '',
    [PRIORITY_LEVELS.P3]: 'info',
    // 兼容中文优先级
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return priorityMap[priority] || ''
}

// 获取测试类型标签类型的函数
export function getTestTypeTagType(type) {
  return TEST_TYPE_TAG_TYPES[type] || ''
}

// 获取测试类型选项列表（用于下拉选择）
export function getTestTypeOptions() {
  return [
    { label: '所有测试类型', value: '' },
    ...Object.entries(TEST_TYPE_LABELS).map(([value, label]) => ({
      label,
      value
    }))
  ]
}

// 获取优先级选项列表（用于下拉选择）
export function getPriorityOptions() {
  return [
    { label: '所有优先级', value: '' },
    ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
      label,
      value
    }))
  ]
}

// 获取排序选项列表（用于下拉选择）
export function getSortOptions() {
  return Object.entries(SORT_LABELS).map(([value, label]) => ({
    label,
    value
  }))
}

// 用例筛选和排序 composable
export function useCasesFilter(cases, searchText = '') {
  // 筛选条件响应式对象
  const filterOptions = reactive({
    type: '',          // 测试类型筛选
    priority: '',      // 优先级筛选
    sortBy: SORT_OPTIONS.DEFAULT  // 排序方式
  })

  // 筛选和排序后的用例列表
  const filteredCases = computed(() => {
    let result = [...cases.value]

    // 类型筛选
    if (filterOptions.type) {
      result = result.filter(caseItem => {
        const caseType = caseItem.testType || caseItem.caseType
        return caseType === filterOptions.type
      })
    }

    // 优先级筛选
    if (filterOptions.priority) {
      result = result.filter(caseItem => caseItem.priority === filterOptions.priority)
    }

    // 搜索文本筛选
    if (searchText.value && searchText.value.trim()) {
      const keyword = searchText.value.toLowerCase().trim()
      result = result.filter(caseItem => {
        const searchableFields = [
          caseItem.name,
          caseItem.description,
          caseItem.priority,
          getTestTypeText(caseItem.testType || caseItem.caseType),
          caseItem.testData || caseItem.preConditions,
          caseItem.expectedResult || caseItem.expectedResponseBody
        ].filter(Boolean)

        return searchableFields.some(field =>
          String(field).toLowerCase().includes(keyword)
        )
      })
    }

    // 排序
    result.sort((a, b) => {
      switch (filterOptions.sortBy) {
        case SORT_OPTIONS.NAME_ASC:
          return (a.name || '').localeCompare(b.name || '')
        case SORT_OPTIONS.NAME_DESC:
          return (b.name || '').localeCompare(a.name || '')
        case SORT_OPTIONS.CREATED_DESC:
          const aCreated = new Date(a.createdAt || a.created_time || 0)
          const bCreated = new Date(b.createdAt || b.created_time || 0)
          return bCreated - aCreated
        case SORT_OPTIONS.UPDATED_DESC:
          const aUpdated = new Date(a.updatedAt || a.updated_time || 0)
          const bUpdated = new Date(b.updatedAt || b.updated_time || 0)
          return bUpdated - aUpdated
        case SORT_OPTIONS.DEFAULT:
        default:
          // 默认排序：优先级降序，然后按名称升序
          const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
          const aPriority = priorityOrder[a.priority] ?? 999
          const bPriority = priorityOrder[b.priority] ?? 999

          if (aPriority !== bPriority) {
            return aPriority - bPriority
          }

          return (a.name || '').localeCompare(b.name || '')
      }
    })

    return result
  })

  // 重置筛选条件
  const resetFilters = () => {
    filterOptions.type = ''
    filterOptions.priority = ''
    filterOptions.sortBy = SORT_OPTIONS.DEFAULT
  }

  // 获取当前筛选统计信息
  const getFilterStats = () => {
    const total = cases.value.length
    const filtered = filteredCases.value.length

    return {
      total,
      filtered,
      isFiltered: total !== filtered
    }
  }

  return {
    // 筛选选项
    filterOptions,

    // 计算属性
    filteredCases,

    // 方法
    resetFilters,
    getFilterStats,

    // 常量和工具函数
    TEST_TYPES,
    PRIORITY_LEVELS,
    SORT_OPTIONS,
    getTestTypeText,
    getTestTypeTagType,
    getPriorityTagType,
    getTestTypeOptions,
    getPriorityOptions,
    getSortOptions
  }
}

export default useCasesFilter
