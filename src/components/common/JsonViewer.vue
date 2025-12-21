<template>
  <div class="json-viewer">
    <JsonNode :value="value" :path="''" :level="0" />
  </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'

const props = defineProps({
  value: { type: [Object, Array, String, Number, Boolean, null], required: true },
})

// Recursive node component
const JsonNode = {
  name: 'JsonNode',
  props: {
    value: { required: true },
    path: { type: String, required: true },
    level: { type: Number, required: true }
  },
  setup(props) {
    const collapsed = ref(props.level >= 1) // collapse child nodes by default
    const isObject = computed(() => props.value && typeof props.value === 'object' && !Array.isArray(props.value))
    const isArray = computed(() => Array.isArray(props.value))
    const toggle = () => { collapsed.value = !collapsed.value }
    return { collapsed, isObject, isArray, toggle }
  },
  render() {
    const h = arguments[0]
    const { value, level, isObject, isArray, collapsed, toggle } = this
    const indentStyle = { paddingLeft: `${level * 12}px` }

    if (isObject) {
      const keys = Object.keys(value)
      return h('div', { class: 'json-node' }, [
        h('div', { class: 'json-node-line', style: indentStyle }, [
          h('button', { class: 'json-toggle', onClick: toggle, 'aria-expanded': !collapsed }, collapsed ? '+' : '−'),
          h('span', { class: 'json-brace' }, '{ }'),
          h('span', { class: 'json-meta' }, ` ${keys.length} keys`)
        ]),
        !collapsed && h('div', { class: 'json-children' }, keys.map(k =>
          h('div', { class: 'json-pair', style: { paddingLeft: `${(level+1)*12}px` } }, [
            h('span', { class: 'json-key' }, `${k}: `),
            h(JsonNode, { value: value[k], path: this.path ? `${this.path}.${k}` : k, level: level + 1 })
          ])
        ))
      ])
    } else if (isArray) {
      return h('div', { class: 'json-node' }, [
        h('div', { class: 'json-node-line', style: indentStyle }, [
          h('button', { class: 'json-toggle', onClick: toggle, 'aria-expanded': !collapsed }, collapsed ? '+' : '−'),
          h('span', { class: 'json-brace' }, '[ ]'),
          h('span', { class: 'json-meta' }, ` ${value.length} items`)
        ]),
        !collapsed && h('div', { class: 'json-children' }, value.map((item, idx) =>
          h('div', { class: 'json-item', style: { paddingLeft: `${(level+1)*12}px` } }, [
            h('span', { class: 'json-index' }, `${idx}: `),
            h(JsonNode, { value: item, path: `${this.path}[${idx}]`, level: level + 1 })
          ])
        ))
      ])
    } else {
      // primitive
      const display = value === null ? 'null' : String(value)
      const typeClass = typeof value === 'number' ? 'json-number' : typeof value === 'boolean' ? 'json-boolean' : 'json-string'
      return h('span', { class: ['json-primitive', typeClass], style: indentStyle }, display)
    }
  }
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


