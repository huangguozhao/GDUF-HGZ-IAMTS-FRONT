<template>
  <div class="messages-view">
    <MessageCenter />
  </div>
</template>

<script setup>
import MessageCenter from '@/components/business/MessageCenter/MessageCenter.vue'
</script>

<style scoped>
.messages-view {
  padding: 20px;
  min-height: calc(100vh - 80px);
}
</style>


