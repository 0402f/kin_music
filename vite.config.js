import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    proxy: {
      // 音乐源代理（必须在 /api 通用规则之前）
      '/api/music-source': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/music-source/, '/api'),
      },
      // 后端 API（Java 服务）
      '/api': {
        target: 'http://127.0.0.1:5210',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 添加以下配置来解决 global is not defined 错误
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client'],
  },
})
