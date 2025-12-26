<template>
  <div class="task-detail-panel">
    <div class="header-row">
      <div class="title">
        <h3>{{ task.name }}</h3>
        <div class="meta">
          <span>创建者：{{ task.creator || '-' }}</span>
          <span>创建时间：{{ task.createdAt ? formatDate(task.createdAt) : '-' }}</span>
        </div>
      </div>
      <div class="status-block">
        <div class="badge" :class="task.enabled ? 'on' : 'off'">{{ task.enabled ? '启用' : '停用' }}</div>
        <div class="controls">
          <button class="btn">运行</button>
          <button class="btn ghost">编辑</button>
        </div>
      </div>
    </div>

    <div class="summary-cards">
      <div class="card stat-card">
        <div class="label">最近执行</div>
        <div class="value">{{ recentRuns.length }}</div>
        <div class="sub">共 {{ totalRuns }} 次</div>
      </div>
      <div class="card pass-card">
        <div class="label">通过</div>
        <div class="value">{{ totalPassed }}</div>
        <div class="sub">成功率 {{ successRate }}%</div>
      </div>
      <div class="card fail-card">
        <div class="label">失败</div>
        <div class="value">{{ totalFailed }}</div>
        <div class="sub">需关注</div>
      </div>
    </div>

    <div class="plan-card">
      <h4>执行计划</h4>
      <div class="plan-row">
        <div class="plan-main">{{ task.planLabel || '-' }}</div>
        <div class="plan-meta">下次执行：{{ task.nextRunAt || '-' }}</div>
      </div>
      <div class="plan-extra">超时时间：{{ task.timeoutMinutes != null ? task.timeoutMinutes + ' 分钟' : '-' }}</div>
    </div>

    <related-cases-list :cases="task.relatedCases" />

    <div class="recent-results">
      <h4>最近执行结果</h4>
      <div v-if="recentRuns.length">
        <div v-for="r in recentRuns" :key="r.id" class="run-card">
          <div class="run-header">
            <div class="run-time">{{ r.time }}</div>
            <div class="run-summary">耗时 {{ r.duration || '-' }} / 警告 {{ r.warn || 0 }}</div>
          </div>
          <div class="run-stats">
            <div class="stat pass">通过 {{ r.passed }}</div>
            <div class="stat fail">失败 {{ r.failed }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty">暂无执行记录</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import RelatedCasesList from './RelatedCasesList.vue';

const props = defineProps({
  task: { type: Object, required: true }
});

function formatDate(s) {
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}

const recentRuns = computed(() => (props.task.recentRuns || []).slice(0, 5));

const totalPassed = computed(() => (props.task.recentRuns || []).reduce((acc, r) => acc + (r.passed || 0), 0));
const totalFailed = computed(() => (props.task.recentRuns || []).reduce((acc, r) => acc + (r.failed || 0), 0));
const totalRuns = computed(() => (props.task.recentRuns || []).reduce((acc, r) => acc + (r.passed || 0) + (r.failed || 0), 0));
const successRate = computed(() => {
  const runs = totalRuns.value;
  if (!runs) return 0;
  return Math.round((totalPassed.value / runs) * 100);
});
</script>

<style scoped>
.task-detail-panel { padding: 16px; }
.header-row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px; }
.title h3 { margin:0 0 6px 0; }
.meta { color:#666; display:flex; gap:12px; font-size:13px; }
.status-block { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
.badge { padding:6px 10px; border-radius:14px; font-weight:600; }
.badge.on { background:#e6f9ef; color:#2f8f3f; }
.badge.off { background:#f6f6f6; color:#999; }
.controls .btn { margin-left:6px; padding:6px 10px; border-radius:6px; }
.controls .ghost { background:transparent; border:1px solid #e6eef8; }

.summary-cards { display:flex; gap:12px; margin-bottom:12px; }
.card { flex:1; background:#fff; border-radius:8px; padding:12px; box-shadow:0 1px 0 rgba(0,0,0,0.03); }
.stat-card .label, .card .label { color:#888; font-size:13px; }
.card .value { font-size:20px; font-weight:700; margin-top:6px; }
.pass-card { border:1px solid #e6f9ee; background:#f6fffb; }
.fail-card { border:1px solid #fff0f0; background:#fff7f7; }

.plan-card { background:#fafafa; padding:12px; border-radius:8px; margin-bottom:12px; }
.plan-row { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.plan-main { font-weight:600; }
.plan-extra { color:#666; margin-top:8px; }

.recent-results { margin-top:12px; }
.run-card { background:#fff; border-radius:6px; padding:10px; margin-bottom:8px; border:1px solid #f0f3f6; }
.run-header { display:flex; justify-content:space-between; color:#666; font-size:13px; margin-bottom:8px; }
.run-stats { display:flex; gap:12px; }
.stat { padding:6px 10px; border-radius:6px; }
.stat.pass { background:#e9f9ee; color:#2f8f3f; }
.stat.fail { background:#fff0f0; color:#d9534f; }
.empty { color:#888; padding:12px; text-align:center; }
</style>


