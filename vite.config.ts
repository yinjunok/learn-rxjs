import { defineConfig } from 'vite'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ command }) => ({
  server: {
    host: '0.0.0.0',
    port: 4001
  },
  plugins: [
    viteMockServe({
      // default
      mockPath: 'mock',
      localEnabled: command === 'serve',
    }),
  ]
}))
