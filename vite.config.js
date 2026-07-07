import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'module'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueDevTools from 'vite-plugin-vue-devtools'
import Font from 'vite-plugin-font';


const require = createRequire(import.meta.url)
const { version } = require('./package.json')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    vueDevTools(),
    Font.vite()
  ],
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Manually add the proxy headers
            proxyReq.setHeader('x-forwarded-host', req.headers.host || 'localhost:5173')
            proxyReq.setHeader('x-forwarded-proto', req.headers['x-forwarded-proto'] || 'http')
          })
        }
      }
    }
  }
})
