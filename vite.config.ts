import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { copyFileSync, writeFileSync } from 'node:fs'

function githubPagesSpa(): Plugin {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      if (process.env.GITHUB_PAGES !== '1') return
      writeFileSync(path.resolve('dist/.nojekyll'), '')
      copyFileSync(path.resolve('dist/index.html'), path.resolve('dist/404.html'))
    },
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === '1' ? '/listings-final/' : '/',
  plugins: [react(), tailwindcss(), githubPagesSpa()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
