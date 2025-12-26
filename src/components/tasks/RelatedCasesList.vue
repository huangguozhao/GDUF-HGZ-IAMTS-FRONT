<template>
  <div class="related-cases-list">
    <h4>关联用例列表</h4>
    <ul>
      <li v-for="c in cases" :key="c.id">
        <div class="case-line">
          <div class="code">{{ c.code }}</div>
          <div class="name">{{ c.name }}</div>
          <div class="status">
            <span :class="['dot', c.enabled ? 'ok' : 'err']"></span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
const props = defineProps({ cases: { type: Array, default: () => ([
  { id: 'TC-001', code: 'TC-001', name: '支付下单接口回测', enabled: true },
  { id: 'TC-008', code: 'TC-008', name: '订单支付状态查询回测', enabled: true },
  { id: 'TC-015', code: 'TC-015', name: '支付退款接口回测', enabled: false }
]) }});
</script>

<style scoped>
.related-cases-list h4 { margin:0 0 8px 0; }
.related-cases-list ul { list-style:none; padding:0; margin:0; }
.case-line { display:flex; gap:8px; align-items:center; padding:6px 0; border-bottom:1px solid #f0f3f6; }
.code { width:72px; color:#2b6fb3; }
.name { flex:1; color:#333; }
.dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
.dot.ok { background:#2f8f3f; }
.dot.err { background:#d9534f; }
</style>


