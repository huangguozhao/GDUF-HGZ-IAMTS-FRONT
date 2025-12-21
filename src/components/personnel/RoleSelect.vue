<template>
  <div class="role-select-root" :class="{ disabled }" ref="root">
    <button
      class="role-toggle"
      type="button"
      :aria-expanded="open"
      :aria-haspopup="true"
      @click="toggle"
      :disabled="disabled"
    >
      <span class="value">{{ displayLabel }}</span>
      <svg class="arrow" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
    </button>

    <div v-if="open" class="dropdown" role="dialog" @click.stop>
      <div class="dropdown-search" v-if="showSearch">
        <input v-model="query" type="text" placeholder="搜索角色..." autofocus />
      </div>

      <ul class="options" role="listbox" :aria-activedescendant="activeId">
        <template v-for="(opt, idx) in filteredOptions">
          <li
            v-if="opt.group"
            :key="'group-' + opt.group"
            class="group-label"
          >{{ opt.group }}</li>

          <li
            v-else
            :key="opt.value"
            class="option-item"
            :class="{ selected: opt.value === value }"
            role="option"
            @click="select(opt.value)"
          >
            <div class="option-label">{{ opt.label }}</div>
            <div class="option-desc" v-if="opt.desc">{{ opt.desc }}</div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  value: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] }, // { label, value, group?, desc? }
  disabled: { type: Boolean, default: false },
  showSearch: { type: Boolean, default: true }
})
const emit = defineEmits(['change'])

const open = ref(false)
const query = ref('')
const root = ref(null)

const displayLabel = computed(() => {
  const found = props.options.find(o => o.value === props.value)
  return found ? found.label : (props.value || '选择角色')
})

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(o => (o.label || '').toLowerCase().includes(q) || (o.desc||'').toLowerCase().includes(q) || (o.group||'').toLowerCase().includes(q))
})

function toggle() {
  if (props.disabled) return
  open.value = !open.value
  if (!open.value) query.value = ''
}

function select(val) {
  emit('change', val)
  open.value = false
  query.value = ''
}

// emit open/close for parent to react (so parent can prevent hover/stacking issues)
watch(open, (v) => {
  if (v) emit('open')
  else emit('close')
})

function onClickOutside(e) {
  if (!root.value) return
  if (!root.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

watch(() => props.options, () => {
  // close when options change
  open.value = false
})
</script>

<style scoped>
.role-select-root { position: relative; display: inline-block; min-width: 140px; }
.role-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e6eef8;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
  cursor: pointer;
}
.role-toggle:disabled { opacity: 0.6; cursor: not-allowed; }
.role-toggle .value { color: #1f2937; font-size: 14px; }
.role-toggle .arrow { width: 14px; height: 14px; fill: currentColor; color: #8c8c8c; }
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 40px rgba(15,23,42,0.08);
  z-index: 60;
  max-height: 280px;
  overflow: auto;
  padding: 8px;
}
.dropdown-search { padding: 6px; }
.dropdown-search input { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #e6eef8; }
.options { list-style: none; margin: 0; padding: 6px; display: block; }
.group-label { font-size: 12px; color: #6b7280; padding: 6px 10px; }
.option-item { padding: 8px 10px; border-radius: 8px; cursor: pointer; display:flex; flex-direction:column; gap:2px; }
.option-item:hover { background: #f5fbff; transform: translateY(-2px); box-shadow: 0 8px 18px rgba(15,23,42,0.04); }
.option-item.selected { background: linear-gradient(90deg,#e6f7ff,#f0fbff); color: #0b5fff; font-weight:600; }
.option-label { font-size: 14px; }
.option-desc { font-size: 12px; color: #6b7280; }
</style>


