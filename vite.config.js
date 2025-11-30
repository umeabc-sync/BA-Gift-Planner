import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'module'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const require = createRequire(import.meta.url)
const { version } = require('./package.json')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    vueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: '.'
        }
      ]
    })
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
})
