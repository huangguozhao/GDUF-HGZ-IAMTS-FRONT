<template>
  <div v-if="visible" class="create-task-modal">
    <div class="modal-backdrop" @click="close" />
    <div class="modal-card" role="dialog" aria-modal="true">
      <header class="modal-header">
        <h3>创建定时任务</h3>
        <button class="close" @click="close" aria-label="关闭">×</button>
      </header>
      <section class="modal-body">
        <div class="steps-row">
          <div :class="['step-dot', step === 1 ? 'active' : '']">1</div>
          <div :class="['step-dot', step === 2 ? 'active' : '']">2</div>
          <div :class="['step-dot', step === 3 ? 'active' : '']">3</div>
        </div>
        <div class="step-indicator">步骤 {{ step }} / 3</div>

        <transition name="fade" mode="out-in">
          <div :key="step" class="step-body">
            <div v-if="step === 1" class="step step-1">
              <label>任务名称</label>
              <input v-model="form.name" placeholder="例如：支付系统接口回检" />
              <label>代码（ID）</label>
              <input v-model="form.code" placeholder="例如：TS-002" />
            </div>

            <div v-else-if="step === 2" class="step step-2">
              <label>执行计划</label>
              <frequency-selector v-model:value="form.frequency" @change="onFrequencyChange" />

              <div class="time-picker-row">
                <label>执行时间区间</label>
                <time-range-picker @change="onTimeRangeChange" />
              </div>

              <div class="hint">选择频率与时间段，系统将根据设置决定下次执行时间。</div>
            </div>

            <div v-else class="step step-3">
              <label>关联用例（逗号分隔ID）</label>
              <input v-model="form.relatedCaseIds" placeholder="TC-001,TC-002" />
              <label>超时时间（分钟）</label>
              <input v-model.number="form.timeoutMinutes" type="number" min="1" />
            </div>
          </div>
        </transition>
      </section>
      <footer class="modal-footer">
        <button class="btn ghost" @click="prev" :disabled="step===1">上一步</button>
        <button class="btn primary" @click="next" :disabled="nextDisabled">{{ step === 3 ? '创建' : '下一步' }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';
import FrequencySelector from './FrequencySelector.vue';
import TimeRangePicker from './TimeRangePicker.vue';

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

function onFrequencyChange(v) {
  form.frequency = v;
}
function onTimeRangeChange({ from, to }) {
  form.timeFrom = from;
  form.timeTo = to;
}

const nextDisabled = computed(() => {
  if (step.value === 1) return !form.name;
  if (step.value === 2) return !form.frequency || !form.timeFrom || !form.timeTo;
  return false;
});

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
    relatedCases: (form.relatedCaseIds || '').split(',').filter(Boolean).map((id) => ({ id: id.trim(), code: id.trim(), name: `用例 ${id.trim()}` })),
    timeoutMinutes: form.timeoutMinutes,
    recentRuns: []
  };
  emit('created', newTask);
  emit('update:visible', false);
}
</script>

<style scoped>
.create-task-modal { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index:1000; padding:12px; }
.modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.36); }
.modal-card { position:relative; width:880px; max-width:100%; background:#fff; border-radius:8px; padding:16px; box-shadow:0 12px 32px rgba(0,0,0,0.12); transition:transform 160ms ease; }
.modal-card:focus { outline:none; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.modal-header h3 { margin:0; font-size:18px; }
.close { background:transparent; border:0; font-size:20px; cursor:pointer; }
.steps-row { display:flex; gap:8px; margin-bottom:8px; }
.step-dot { width:32px; height:32px; border-radius:50%; background:#f3f6f9; display:flex; align-items:center; justify-content:center; color:#666; transition:all .12s ease; }
.step-dot.active { background:#2f8f3f; color:#fff; transform:translateY(-2px); box-shadow:0 6px 18px rgba(47,143,63,0.12); }
.step-indicator { color:#666; margin-bottom:12px; }
.step-body { min-height:160px; }
.step label { display:block; margin-top:8px; font-size:13px; color:#333; }
.step input, .step select { width:100%; padding:8px; margin-top:6px; box-sizing:border-box; border:1px solid #e8f0f6; border-radius:6px; }
.time-picker-row { margin-top:12px; }
.hint { color:#888; margin-top:8px; font-size:13px; }
.modal-footer { display:flex; justify-content:flex-end; gap:8px; padding-top:12px; }
.btn { padding:8px 12px; border-radius:6px; cursor:pointer; border:0; }
.btn.ghost { background:transparent; border:1px solid #e6eef8; color:#333; }
.btn.primary { background:#2f8f3f; color:#fff; }
.btn:disabled { opacity:0.5; cursor:not-allowed; }

/* micro interactions */
.btn:hover:not(:disabled) { transform:translateY(-1px); transition:transform .08s ease; }
.close:hover { transform:rotate(90deg); transition:transform .18s ease; }
.fade-enter-active, .fade-leave-active { transition:opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }

@media (max-width: 900px) {
  .modal-card { width: 100%; padding:12px; }
  .steps-row { justify-content:space-between; }
}
</style>  


