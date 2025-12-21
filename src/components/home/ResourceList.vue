<template>
  <div class="resource-list-component">
    <ResourceItem
      v-for="(res, idx) in resources"
      :key="res.label + idx"
      :label="res.label"
      :value="res.value"
      :percent="res.percent"
      :color="res.color"
    />
  </div>
</template>

<script setup>
import ResourceItem from './ResourceItem.vue'
const props = defineProps({
  resources: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.resource-list-component {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>


