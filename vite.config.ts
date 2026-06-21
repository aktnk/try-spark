import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@sparkjsdev')) return 'spark'
          if (id.includes('node_modules/nipplejs')) return 'nipplejs'
        },
      },
    },
  },
})
