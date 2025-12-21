<template>
  <div class="project-list">
    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path></svg>
      <input v-model="keyword" type="text" placeholder="搜索项目..." />
    </div>

    <div class="projects">
      <div 
        v-for="p in filteredProjects" 
        :key="p.id" 
        class="project-card" 
        :class="{ active: p.id === selectedId }"
        @click="emit('select', p.id)"
      >
        <div class="title">{{ p.name || p.projectName }}</div>
        <div class="desc" v-if="p.description">{{ p.description }}</div>
        <div class="members"><svg class="user-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M512 544c141.4 0 256-114.6 256-256S653.4 32 512 32 256 146.6 256 288s114.6 256 256 256zm0 64C353.1 608 64 688.5 64 848v96h896v-96c0-159.5-289.1-240-448-240z"/></svg>
          {{ membersCountMap[p.id] || 0 }}名成员
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  projects: { type: Array, default: () => [] },
  selectedId: { type: [String, Number, null], default: null },
  membersCountMap: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['select']);

const keyword = ref('');

const filteredProjects = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return props.projects;
  return props.projects.filter(p => {
    const name = (p.name || p.projectName || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return name.includes(k) || desc.includes(k);
  });
});
</script>

<style scoped>
.project-list {
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.search-box {
  position: relative;
  margin-bottom: 12px;
}
.search-box input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #bfbfbf;
}

.projects {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 240px);
  overflow: auto;
}

.project-card {
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s, background .18s;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 4px 12px rgba(15,23,42,0.04);
  transform: translateZ(0);
}
.project-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 40px rgba(15,23,42,0.08);
  background: linear-gradient(180deg, #ffffff 0%, #f5fbff 100%);
  border-color: rgba(24,144,255,0.08);
}
.project-card.active {
  border-color: transparent;
  box-shadow: 0 18px 48px rgba(24,144,255,0.12);
  background: linear-gradient(90deg,#e6f7ff,#f0fbff);
}

.title { font-size: 14px; font-weight: 600; color: #1f1f1f; margin-bottom: 6px; }
.desc { font-size: 12px; color: #8c8c8c; margin-bottom: 8px; }
.members { font-size: 12px; color: #8c8c8c; display: flex; align-items: center; gap: 6px; }
.user-icon { width: 14px; height: 14px; }
</style>

