<template>
  <div id="app">
    <!-- 登录页面独立显示 -->
    <router-view v-if="isLoginPage" />
    
    <!-- 其他页面使用主布局 -->
    <MainLayout v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()

// 判断是否为登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}
</style>
