<template>
  <div v-if="visible" class="create-task-modal">
    <div class="modal-backdrop" @click="close"></div>
    <div class="modal-card">
      <header class="modal-header">
        <h3>创建定时任务</h3>
        <button class="close" @click="close">×</button>
      </header>
      <section class="modal-body">
        <div class="step-indicator">步骤 {{ step }} / 3</div>

        <div v-if="step === 1" class="step step-1">
          <label>任务名称</label>
          <input v-model="form.name" />
          <label>代码（ID）</label>
          <input v-model="form.code" />
        </div>

        <div v-if="step === 2" class="step step-2">
          <label>执行计划</label>
          <select v-model="form.frequency">
            <option value="daily">每日</option>
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
          </select>
          <label>时间</label>
          <input v-model="form.timeFrom" type="time" /> - <input v-model="form.timeTo" type="time" />
        </div>

        <div v-if="step === 3" class="step step-3">
          <label>关联用例（逗号分隔ID）</label>
          <input v-model="form.relatedCaseIds" />
          <label>超时时间（分钟）</label>
          <input v-model.number="form.timeoutMinutes" type="number" />
        </div>
      </section>
      <footer class="modal-footer">
        <button @click="prev" :disabled="step===1">上一步</button>
        <button @click="next">{{ step === 3 ? '创建' : '下一步' }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue';
const props = defineProps({
  visible: { type: Boolean, default: false }
});
const emit = defineEmits(['update:visible', 'created']);

const step = reactive({ value: 1 });
const form = reactive({
  name: '',
  code: '',
  frequency: 'daily',
  timeFrom: '10:00',
  timeTo: '11:00',
  relatedCaseIds: '',
  timeoutMinutes: 60
});

watch(() => props.visible, (v) => {
  if (v) reset();
});

function reset() {
  step.value = 1;
  form.name = '';
  form.code = '';
  form.frequency = 'daily';
  form.timeFrom = '10:00';
  form.timeTo = '11:00';
  form.relatedCaseIds = '';
  form.timeoutMinutes = 60;
}

function close() {
  emit('update:visible', false);
}

function prev() {
  if (step.value > 1) step.value -= 1;
}

function next() {
  if (step.value < 3) {
    step.value += 1;
    return;
  }
  // create task (emit created event with minimal shape)
  const newTask = {
    id: Date.now(),
    code: form.code || `TS-${Date.now()}`,
    name: form.name || '新任务',
    planLabel: form.frequency === 'daily' ? `每日 ${form.timeFrom}` : form.frequency === 'weekly' ? `每周 ${form.timeFrom}` : `每月 ${form.timeFrom}`,
    nextRunAt: null,
    enabled: true,
    creator: '当前用户',
    createdAt: new Date().toISOString(),
    relatedCases: (form.relatedCaseIds || '').split(',').filter(Boolean).map((id, idx) => ({ id: id.trim(), code: id.trim(), name: `用例 ${id.trim()}` })),
    timeoutMinutes: form.timeoutMinutes,
    recentRuns: []
  };
  emit('created', newTask);
  emit('update:visible', false);
}
</script>

<style scoped>
.create-task-modal { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.4); }
.modal-card { position:relative; width:680px; background:#fff; border-radius:8px; padding:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
.modal-header { display:flex; justify-content:space-between; align-items:center; }
.modal-body { padding:12px 0; }
.modal-footer { display:flex; justify-content:flex-end; gap:8px; padding-top:8px; }
.step-indicator { color:#666; margin-bottom:8px; }
.step label { display:block; margin-top:8px; font-size:13px; color:#333; }
.step input, .step select { width:100%; padding:8px; margin-top:6px; box-sizing:border-box; }
</style>


