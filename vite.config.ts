import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { deferEntry, inlineCss, prerenderPreloader } from './vite-plugins/firstPaint.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderPreloader(), inlineCss(), deferEntry()],
  /**
   * Relative base: the production build is served from a GitHub Pages
   * subfolder (fegno.github.io/adhil-shimnaz-website/), so every asset URL
   * must resolve against the page, not the domain root.
   */
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  /**
   * `host: true` binds 0.0.0.0 instead of localhost, so anyone on the same
   * network can open the invitation from their own phone or laptop. Vite prints
   * the LAN URL as "Network:" on startup.
   *
   * strictPort makes it fail loudly rather than silently hopping to another
   * port — otherwise the URL you shared quietly stops working.
   */
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    // One stylesheet, inlined into the HTML (see vite-plugins/firstPaint.ts).
    // Split CSS would leave lazy chunks pointing at a file that no longer exists.
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        /**
         * Only React is pinned to a named chunk — it's the one dependency the
         * entry genuinely needs.
         *
         * Motion, GSAP and Lenis are deliberately NOT listed: naming a manual
         * chunk promotes it into the entry's static import graph, which is
         * exactly what we're trying to avoid. Left alone, the bundler keeps
         * them inside the dynamically-imported Site graph, so they load behind
         * the preloader instead of blocking it.
         */
        manualChunks(id: string) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
        },
      },
    },
  },
})
