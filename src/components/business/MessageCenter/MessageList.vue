<template>
  <div class="message-list" tabindex="-1" role="list" aria-label="Message list">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="message-row"
      :class="{ unread: !msg.read }"
      @click="select(msg)"
      @keydown.enter.prevent="select(msg)"
      role="listitem"
      tabindex="0"
      :aria-label="msg.title"
      :aria-current="!msg.read ? 'false' : 'true'"
    >
      <MessageItem
        :message="msg"
        @mark="(m) => emit('mark', m)"
        @delete="(m) => emit('delete', m)"
      />
    </div>
  </div>
</template>

<script setup>
import MessageItem from './MessageItem.vue'
import { toRefs } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const select = (msg) => {
  emit('select', msg)
}
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.message-row.unread {
  /* 移除外层的左侧高亮，避免与 MessageItem 内部的高亮重复显示。
     高亮效果由 MessageItem[data-read="false"] 负责（左侧高亮条 + 阴影）。 */
  background: transparent;
  border-left: none;
  border-radius: 6px;
}
.message-row {
  cursor: pointer;
  padding: 8px;
  transition: background 0.12s ease, transform 0.08s ease;
  display: block;
}
.message-row:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(24,144,255,0.12);
  border-radius: 6px;
}
</style>


