<template>
  <div v-if="visible" class="edit-task-modal">
    <div class="modal-backdrop" @click="close"></div>
    <div class="modal-card">
      <header class="modal-header">
        <h3>编辑任务</h3>
        <button class="close" @click="close">×</button>
      </header>
      <section class="modal-body">
        <label>任务名称</label>
        <input v-model="local.name" />

        <label>代码（ID）</label>
        <input v-model="local.code" />

        <label>执行计划</label>
        <select v-model="local.frequency">
          <option value="daily">每日</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>

        <div class="time-row">
          <label>时间</label>
          <input v-model="local.timeFrom" type="time" /> - <input v-model="local.timeTo" type="time" />
        </div>

        <label>超时时间（分钟）</label>
        <input v-model.number="local.timeoutMinutes" type="number" />
      </section>
      <footer class="modal-footer">
        <button @click="close">取消</button>
        <button @click="save">保存</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['update:visible', 'updated']);

const local = reactive({
  id: null,
  name: '',
  code: '',
  frequency: 'daily',
  timeFrom: '10:00',
  timeTo: '11:00',
  timeoutMinutes: 60
});

watch(() => props.task, (t) => {
  if (t) {
    local.id = t.id;
    local.name = t.name || '';
    local.code = t.code || '';
    // infer frequency from planLabel when possible
    if (t.planLabel && t.planLabel.includes('每周')) local.frequency = 'weekly';
    else if (t.planLabel && t.planLabel.includes('每月')) local.frequency = 'monthly';
    else local.frequency = 'daily';
    local.timeFrom = t.timeFrom || t.nextRunAt ? (t.nextRunAt.slice(11,16)) : '10:00';
    local.timeTo = t.timeTo || '11:00';
    local.timeoutMinutes = t.timeoutMinutes || 60;
  }
}, { immediate: true });

function close() {
  emit('update:visible', false);
}

function save() {
  const updated = {
    id: local.id,
    name: local.name,
    code: local.code,
    frequency: local.frequency,
    timeFrom: local.timeFrom,
    timeTo: local.timeTo,
    timeoutMinutes: local.timeoutMinutes,
    planLabel: local.frequency === 'daily' ? `每日 ${local.timeFrom}` : local.frequency === 'weekly' ? `每周 ${local.timeFrom}` : `每月 ${local.timeFrom}`
  };
  emit('updated', updated);
  emit('update:visible', false);
}
</script>

<style scoped>
.edit-task-modal { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index:1100; }
.modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.36); }
.modal-card { position:relative; width:640px; background:#fff; border-radius:8px; padding:12px; box-shadow:0 12px 32px rgba(0,0,0,0.12); }
.modal-header { display:flex; justify-content:space-between; align-items:center; }
.modal-body { padding:8px 0; display:flex; flex-direction:column; gap:8px; }
.modal-footer { display:flex; justify-content:flex-end; gap:8px; padding-top:8px; }
.time-row { display:flex; gap:8px; align-items:center; }
.close { background:transparent; border:0; font-size:20px; cursor:pointer; }
</style>


