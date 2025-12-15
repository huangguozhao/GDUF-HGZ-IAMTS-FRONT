<template>
  <div class="assignment-header">
    <div class="header-left">
      <h2 class="header-title">{{ title }}</h2>
      <p class="header-subtitle">{{ memberCount }}名团队成员</p>
    </div>
    <button class="btn-add-member" @click="handleAddMember">
      <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm192 472H520v184h-16V536H312v-16h192V328h16v192h184v16z"></path>
      </svg>
      添加成员
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  memberCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['add-member']);

const handleAddMember = () => {
  emit('add-member');
};
</script>

<style scoped>
.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.btn-add-member {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-add-member:hover {
  background-color: #40a9ff;
}

.btn-add-member:active {
  background-color: #096dd9;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>

