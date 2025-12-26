<template>
  <div class="task-detail-panel">
    <h3>{{ task.name }}</h3>
    <div class="meta-row">
      <div><strong>创建者：</strong>{{ task.creator || '-' }}</div>
      <div><strong>创建时间：</strong>{{ task.createdAt || '-' }}</div>
    </div>

    <div class="plan-card">
      <h4>执行计划</h4>
      <div>{{ task.planLabel || '-' }}</div>
      <div>下次执行：{{ task.nextRunAt || '-' }}</div>
      <div>超时时间：{{ task.timeoutMinutes != null ? task.timeoutMinutes + ' 分钟' : '-' }}</div>
    </div>

    <div class="related-cases">
      <h4>关联用例</h4>
      <ul>
        <li v-for="c in task.relatedCases || []" :key="c.id">{{ c.code }} - {{ c.name }}</li>
      </ul>
    </div>

    <div class="recent-results">
      <h4>最近执行结果</h4>
      <div v-if="task.recentRuns && task.recentRuns.length">
        <div v-for="r in task.recentRuns" :key="r.id" class="run-item">
          <div>{{ r.time }} — 通过 {{ r.passed }} / 失败 {{ r.failed }} / 警告 {{ r.warn }}</div>
        </div>
      </div>
      <div v-else>暂无执行记录</div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue';
const props = defineProps({
  task: { type: Object, required: true }
});

const task = toRef(props, 'task');
</script>

<style scoped>
.task-detail-panel { padding: 12px; }
.meta-row { display:flex; gap:16px; color:#666; margin-bottom:12px; }
.plan-card { background:#fafafa; padding:12px; border-radius:6px; margin-bottom:12px; }
.related-cases ul { padding-left:18px; margin:0; }
.run-item { padding:8px 0; border-bottom:1px dashed #eee; }
</style>


