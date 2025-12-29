import { createApp } from 'vue'
import Toast from '@/components/ui/Toast.vue'

// 创建Toast实例
let toastInstance = null
let toastApp = null

const createToast = () => {
  if (!toastInstance) {
    // 创建挂载点
    const mountEl = document.createElement('div')
    mountEl.id = 'global-toast'
    document.body.appendChild(mountEl)

    // 创建Vue应用实例
    toastApp = createApp(Toast)
    toastInstance = toastApp.mount(mountEl)
  }

  return toastInstance
}

// Toast API
export const toast = {
  success: (message, options = {}) => {
    const instance = createToast()
    return instance.success(message, options)
  },

  error: (message, options = {}) => {
    const instance = createToast()
    return instance.error(message, options)
  },

  warning: (message, options = {}) => {
    const instance = createToast()
    return instance.warning(message, options)
  },

  info: (message, options = {}) => {
    const instance = createToast()
    return instance.info(message, options)
  },

  show: (options) => {
    const instance = createToast()
    return instance.add(options)
  },

  remove: (id) => {
    if (toastInstance) {
      toastInstance.remove(id)
    }
  },

  clear: () => {
    if (toastInstance) {
      toastInstance.clear()
    }
  }
}

// Vue插件
export const ToastPlugin = {
  install(app) {
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}

export default toast
