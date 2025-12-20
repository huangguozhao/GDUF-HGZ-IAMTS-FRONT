<template>
  <div class="user-search-selector">
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path>
      </svg>
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input"
        placeholder="输入用户名或邮箱搜索..."
        @input="handleSearch"
        @focus="showDropdown = true"
      />
    </div>

    <!-- 搜索结果下拉框 -->
    <div v-if="showDropdown" class="dropdown">
      <div v-if="searching" class="dropdown-item disabled">
        <span>搜索中...</span>
      </div>
      <div v-else-if="filteredUsers.length > 0">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="dropdown-item"
          @click="handleSelectUser(user)"
        >
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-email">{{ user.email }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="searchKeyword && !searching" class="dropdown-item disabled">
        未找到匹配的用户
      </div>
      <div v-else-if="!searchKeyword" class="dropdown-item disabled">
        请输入用户名或邮箱进行搜索
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { searchUsers } from '@/api/user';

const props = defineProps({
  selectedUserIds: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select']);

const searchKeyword = ref('');
const showDropdown = ref(false);
const filteredUsers = ref([]);
const searching = ref(false);
let searchTimer = null;

// 调用后端接口搜索用户
const performSearch = async (keyword) => {
  if (!keyword || keyword.trim().length === 0) {
    filteredUsers.value = [];
    return;
  }

  searching.value = true;
  try {
    const response = await searchUsers(keyword.trim());
    const users = response?.data || [];
    
    // 排除已选中的用户
    const selectedSet = new Set(props.selectedUserIds);
    filteredUsers.value = users
      .map(user => ({
        id: user.userId || user.id,
        name: user.name,
        email: user.email,
      }))
      .filter(user => !selectedSet.has(user.id))
      .slice(0, 20); // 最多显示20个结果
  } catch (error) {
    console.error('搜索用户失败:', error);
    filteredUsers.value = [];
  } finally {
    searching.value = false;
  }
};

// 防抖搜索
const handleSearch = () => {
  showDropdown.value = true;
  
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  
  // 如果关键词为空，清空结果
  if (!searchKeyword.value || searchKeyword.value.trim().length === 0) {
    filteredUsers.value = [];
    return;
  }
  
  // 延迟300ms执行搜索，避免频繁请求
  searchTimer = setTimeout(() => {
    performSearch(searchKeyword.value);
  }, 300);
};

const handleSelectUser = (user) => {
  emit('select', user);
  searchKeyword.value = '';
  showDropdown.value = false;
  filteredUsers.value = [];
};

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-search-selector')) {
    showDropdown.value = false;
  }
};

// 监听点击外部事件
watch(
  () => showDropdown.value,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }
);

// 监听已选用户ID变化，重新过滤结果
watch(
  () => props.selectedUserIds,
  () => {
    if (filteredUsers.value.length > 0) {
      const selectedSet = new Set(props.selectedUserIds);
      filteredUsers.value = filteredUsers.value.filter(user => !selectedSet.has(user.id));
    }
  },
  { deep: true }
);

// 组件卸载时清理
onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-search-selector {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #bfbfbf;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover:not(.disabled) {
  background-color: #f5f5f5;
}

.dropdown-item.disabled {
  color: #8c8c8c;
  cursor: default;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: #8c8c8c;
}
</style>

