<template>
  <div class="message-center">
    <div class="header-row" role="banner" aria-label="消息中心头部">
      <a href="#main-messages" class="sr-only">跳转到消息列表</a>
      <h2 id="main-messages">消息中心</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索消息标题或内容"
          size="small"
          class="search-input"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <el-button type="text" icon="Search" @click="handleSearch" aria-label="Search messages"/>
          </template>
        </el-input>
        <el-button
          type="primary"
          size="small"
          @click="markAllRead"
          aria-label="Mark all messages as read"
        >
          全部标记已读
        </el-button>
      </div>
    </div>

    <div class="content-row" role="region" aria-label="消息列表与详情">
      <aside class="sidebar-filters" aria-label="消息筛选">
        <el-menu
          class="filter-menu"
          :default-active="activeFilter"
          @select="handleFilterSelect"
          :router="false"
        >
          <el-menu-item index="all">全部</el-menu-item>
          <el-menu-item index="unread">未读</el-menu-item>
          <el-menu-item index="read">已读</el-menu-item>
          <el-menu-item index="system">系统</el-menu-item>
          <el-menu-item index="alerts">告警</el-menu-item>
        </el-menu>
        <div class="filters-footer">
          <small class="muted">共 {{ messages.length }} 条消息</small>
        </div>
      </aside>

      <div class="list-column" aria-label="消息列表" id="messages-list">
        <MessageList
          :messages="pagedMessages"
          @select="handleSelect"
          @mark="handleMark"
          @delete="handleDelete"
        />

        <div class="pagination-wrapper" v-if="totalPages > 1">
          <el-pagination
            background
            layout="prev, pager, next, sizes, total"
            :page-sizes="[5,10,20]"
            :page-size="pageSize"
            :current-page="currentPage"
            :total="filteredMessages.length"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <div class="detail-column" v-if="selectedMessage">
        <el-card class="detail-card">
          <div class="detail-title">
            <h3>{{ selectedMessage.title }}</h3>
            <div class="meta">{{ selectedMessage.time }}</div>
          </div>
          <div class="detail-body" v-html="selectedMessage.content"></div>
        </el-card>
      </div>

      <div class="detail-column placeholder" v-else>
        <el-card class="detail-card empty">
          <div class="empty-illustration">📭</div>
          <div class="empty-text">
            当前没有选中的消息。点击左侧或列表中的消息以查看详情。
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import MessageList from './MessageList.vue'

// Mock 数据（静态页面）
const messages = reactive([
  {
    id: 'm1',
    title: '测试报告生成完成',
    content: '<p>您的测试报告 <strong>#2025-12-28</strong> 已生成，点击查看详情。</p>',
    time: '2025-12-28 21:05',
    read: false,
    type: 'system'
  },
  {
    id: 'm2',
    title: '用例执行失败提醒',
    content: '<p>用例 <em>支付流程-退款</em> 执行失败，错误代码 500，请排查。</p>',
    time: '2025-12-27 18:20',
    read: true,
    type: 'alerts'
  },
  {
    id: 'm3',
    title: '权限变更通知',
    content: '<p>您已被添加到项目 <strong>电商支付系统</strong> 的测试成员组。</p>',
    time: '2025-12-25 09:12',
    read: false,
    type: 'system'
  }
])

const selectedMessage = ref(null)
const activeFilter = ref('all')
const searchKeyword = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(5)

const filteredMessages = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  return messages.filter(m => {
    if (activeFilter.value === 'unread' && m.read) return false
    if (activeFilter.value === 'read' && !m.read) return false
    if (activeFilter.value === 'system' && m.type !== 'system') return false
    if (activeFilter.value === 'alerts' && m.type !== 'alerts') return false
    if (!kw) return true
    return (m.title + ' ' + (m.content || '')).toLowerCase().includes(kw)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMessages.value.length / pageSize.value)))

const pagedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMessages.value.slice(start, start + pageSize.value)
})

const handleSelect = (msg) => {
  const target = messages.find(m => m.id === msg.id)
  if (target) target.read = true
  selectedMessage.value = target
}

const markAllRead = () => {
  messages.forEach(m => { m.read = true })
}

const handleFilterSelect = (key) => {
  activeFilter.value = key
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleMark = (msg) => {
  const target = messages.find(m => m.id === msg.id)
  if (target) target.read = !target.read
}

const handleDelete = (msg) => {
  const idx = messages.findIndex(m => m.id === msg.id)
  if (idx !== -1) {
    messages.splice(idx, 1)
    if (selectedMessage.value && selectedMessage.value.id === msg.id) {
      selectedMessage.value = null
    }
  }
}
</script>

<style scoped>
.message-center {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content-row {
  display: flex;
  gap: 20px;
}
.list-column {
  width: 360px;
}
.detail-column {
  flex: 1;
}
.detail-card.empty {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.detail-body {
  line-height: 1.8;
  color: #303133;
}

/* 可聚焦元素的可见聚焦样式，提高键盘可访问性 */
.message-list:focus-within .message-row:focus,
.message-row:focus {
  outline: 3px solid rgba(24, 144, 255, 0.18);
  border-radius: 8px;
}

/* 响应式：小屏幕堆叠 */
@media (max-width: 900px) {
  .content-row {
    flex-direction: column;
  }
  .list-column {
    width: 100%;
  }
  .detail-column {
    width: 100%;
  }
}

/* 新增样式：侧边筛选栏与更丰富的版面 */
.content-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.sidebar-filters {
  width: 180px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  height: auto;
}
.filter-menu {
  border-right: none;
}
.filters-footer {
  margin-top: 12px;
  text-align: center;
}
.search-input {
  width: 280px;
  margin-right: 12px;
}
.pagination-wrapper {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
.empty-illustration {
  font-size: 36px;
  margin-bottom: 8px;
}
.empty-text {
  color: #909399;
}
</style>


