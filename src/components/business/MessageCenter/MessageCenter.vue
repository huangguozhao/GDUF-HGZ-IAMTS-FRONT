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
      <FilterSidebar
        :active="activeFilter"
        :total="messages.length"
        :counts="{ unread: messages.filter(m => !m.read).length }"
        @select="handleFilterSelect"
        @clear="() => { activeFilter = 'all'; currentPage = 1 }"
        @mark-all="markAllRead"
      />

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

      <div class="detail-column">
        <MessageDetailPane
          :message="selectedMessage"
          @mark="handleMark"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import MessageList from './MessageList.vue'
import FilterSidebar from './FilterSidebar.vue'
import MessageDetailPane from './MessageDetailPane.vue'

const props = defineProps({
  initialMessages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['messages-updated'])

// 使用传入的初始消息或默认消息
const messages = reactive([...props.initialMessages])

// 监听props变化，更新本地消息
watch(() => props.initialMessages, (newMessages) => {
  if (newMessages && newMessages.length > 0) {
    messages.splice(0, messages.length, ...newMessages)
  }
}, { deep: true })

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
  if (target) {
    target.read = true
    emit('messages-updated', messages)
  }
  selectedMessage.value = target
}

const markAllRead = () => {
  messages.forEach(m => { m.read = true })
  emit('messages-updated', messages)
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
  if (target) {
    target.read = !target.read
    emit('messages-updated', messages)
  }
}

const handleDelete = (msg) => {
  const idx = messages.findIndex(m => m.id === msg.id)
  if (idx !== -1) {
    messages.splice(idx, 1)
    if (selectedMessage.value && selectedMessage.value.id === msg.id) {
      selectedMessage.value = null
    }
    emit('messages-updated', messages)
  }
}
</script>

<style scoped>
.message-center {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.content-row {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.list-column {
  width: 380px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.detail-column {
  flex: 1;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.detail-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.detail-card.empty {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: rgba(255, 255, 255, 0.7);
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .message-center {
    padding: 20px;
    gap: 16px;
  }

  .content-row {
    gap: 20px;
  }

  .list-column {
    width: 340px;
  }

  .sidebar-filters {
    width: 180px;
  }
}

@media (max-width: 900px) {
  .content-row {
    flex-direction: column;
    gap: 16px;
  }

  .list-column,
  .detail-column {
    width: 100%;
  }

  .sidebar-filters {
    width: 100%;
    order: -1;
  }

  .header-row {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
    margin-bottom: 0;
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .message-center {
    padding: 16px;
    border-radius: 12px;
    gap: 16px;
  }

  .content-row {
    gap: 12px;
  }

  .list-column,
  .detail-column {
    padding: 16px;
  }

  .sidebar-filters {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .message-center {
    padding: 12px;
    border-radius: 8px;
  }

  .header-row {
    gap: 12px;
  }

  .content-row {
    gap: 8px;
  }

  .list-column,
  .detail-column {
    padding: 12px;
  }

  .sidebar-filters {
    padding: 8px;
  }
}

/* 新增样式：侧边筛选栏与更丰富的版面 */
.content-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.sidebar-filters {
  width: 200px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  height: auto;
}

.filter-menu {
  border-right: none;
  background: transparent;
}

.filters-footer {
  margin-top: 16px;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.search-input {
  width: 100%;
  margin-bottom: 12px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.empty-illustration {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}
</style>


