import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import path from 'path'

// When a .tsx file changes, invalidate all CSS modules so Tailwind rescans
// content files and generates any new utility classes. This is the programmatic
// equivalent of the "touch src/app.css" workaround from:
// https://github.com/crxjs/chrome-extension-tools/issues/609#issuecomment-1563634844
function tailwindContentHmr(): Plugin {
  return {
    name: 'tailwind-content-hmr',
    handleHotUpdate({ file, server, modules }) {
      if (/\.tsx?$/.test(file) && !file.includes('node_modules')) {
        const cssModules = [...server.moduleGraph.idToModuleMap.values()].filter(
          (m) => m.id?.includes('.css'),
        )
        cssModules.forEach((m) => server.moduleGraph.invalidateModule(m))
        return [...modules, ...cssModules]
      }
    },
  }
}

export default defineConfig({
  plugins: [
    tailwindContentHmr(),
    tailwindcss(),
    react(),
    crx({ manifest }),
  ],
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
