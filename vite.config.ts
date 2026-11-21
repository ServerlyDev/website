import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      // L'application est toujours en thème sombre (classe `dark` sur <html>)
      colorMode: false,
      ui: {
        colors: {
          primary: 'indigo',
          neutral: 'zinc'
        }
      },
      // Auto-import des API Vue (ref, computed, onMounted...) et Vue Router (useRoute, useRouter)
      autoImport: {
        imports: ['vue', 'vue-router']
      }
    })
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
})
