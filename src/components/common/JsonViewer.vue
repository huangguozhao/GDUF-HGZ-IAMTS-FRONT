<template>
  <div class="json-viewer">
    <json-node :value="value" :level="0" />
  </div>
</template>

<script>
const JsonNode = {
  name: 'JsonNode',
  props: {
    value: { required: true },
    level: { type: Number, default: 0 }
  },
  data() {
    return { collapsed: this.level >= 1 }
  },
  computed: {
    isObject() { return this.value && typeof this.value === 'object' && !Array.isArray(this.value) },
    isArray() { return Array.isArray(this.value) },
    display() { return this.value === null ? 'null' : String(this.value) },
    typeClass() {
      return typeof this.value === 'number' ? 'json-number' : typeof this.value === 'boolean' ? 'json-boolean' : 'json-string'
    }
  },
  methods: {
    toggle() { this.collapsed = !this.collapsed }
  },
  template: `
    <div class="json-node">
      <div class="json-node-line" :style="{ paddingLeft: level * 12 + 'px' }">
        <button class="json-toggle" @click="toggle" :aria-expanded="!collapsed">{{ collapsed ? '+' : '−' }}</button>
        <span v-if="isObject" class="json-brace">{ }</span>
        <span v-else-if="isArray" class="json-brace">[ ]</span>
        <span v-if="isObject" class="json-meta"> {{ Object.keys(value).length }} keys</span>
        <span v-else-if="isArray" class="json-meta"> {{ value.length }} items</span>
      </div>
      <div v-if="isObject && !collapsed" class="json-children">
        <div v-for="(v,k) in value" :key="k" class="json-pair">
          <span class="json-key" :style="{ paddingLeft: (level+1)*12 + 'px' }">{{ k }}: </span>
          <json-node :value="v" :level="level+1" />
        </div>
      </div>
      <div v-else-if="isArray && !collapsed" class="json-children">
        <div v-for="(item, idx) in value" :key="idx" class="json-item">
          <span class="json-index" :style="{ paddingLeft: (level+1)*12 + 'px' }">{{ idx }}: </span>
          <json-node :value="item" :level="level+1" />
        </div>
      </div>
      <span v-if="!isObject && !isArray" :class="['json-primitive', typeClass]" :style="{ paddingLeft: level*12 + 'px' }">{{ display }}</span>
    </div>
  `
}

export default {
  name: 'JsonViewer',
  props: { value: { required: true } },
  components: { JsonNode }
}
</script>

<style scoped>
.json-viewer { font-family: 'Courier New', monospace; font-size: 13px; color: #303133; }
.json-node-line { display:flex; align-items:center; gap:8px; padding:4px 0; }
.json-toggle { width:20px; height:20px; border-radius:4px; border:none; background:#f3f6fb; cursor:pointer; color:#409eff; }
.json-key { color:#a040f0; font-weight:500; }
.json-string { color:#0b7; }
.json-number { color:#d34a00; }
.json-boolean { color:#a71d5d; }
.json-brace { color:#909399; }
.json-meta { color:#909399; font-size:12px; margin-left:6px; }
.json-children { margin-top:4px; }
.json-primitive { white-space:pre-wrap; }
</style>


