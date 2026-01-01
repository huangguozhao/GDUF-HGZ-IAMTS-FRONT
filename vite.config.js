import { fileURLToPath, URL } from 'node:url'
import { getCacheStrategy } from './src/utils/cacheConfig.js'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    // 启用哈希文件名，确保缓存失效
    rollupOptions: {
      output: {
        // 为chunk文件添加哈希
        chunkFileNames: 'assets/[name]-[hash].js',
        // 为入口文件添加哈希
        entryFileNames: 'assets/[name]-[hash].js',
        // 为资源文件添加哈希
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${extType}`
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${extType}`
          }
          return `assets/[name]-[hash].${extType}`
        }
      }
    },
    // 生成source map（生产环境可设为false以减小文件大小）
    sourcemap: false,
    // 压缩
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    configureServer(server) {
      // 为不同类型的静态资源设置缓存头
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        const cacheStrategy = getCacheStrategy(url, false) // 开发环境

        // 设置缓存头
        Object.entries(cacheStrategy).forEach(([key, value]) => {
          res.setHeader(key, value)
        })

        next()
      })
    }
  }
})
