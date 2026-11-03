import type { Plugin, ViteDevServer } from 'vite'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

/**
 * First-paint plugins — they exist for slow phones.
 *
 * 1. prerenderPreloader: renders the real <Preloader> with React's server
 *    renderer and drops the markup into #boot in index.html. The door screen
 *    therefore paints from HTML alone, before any JavaScript has loaded, and
 *    it is pixel-identical to what React mounts over it a moment later.
 *
 * 2. inlineCss: inlines the stylesheet into the HTML, so first paint doesn't
 *    wait on a render-blocking request for it.
 *
 * 3. deferEntry: starts the app's JavaScript only after the first frame has
 *    painted. Module scripts may otherwise run before the first paint on a
 *    fast connection, making the door screen wait on React for no reason.
 */

const MARKER = '<!--preloader-ssr-->'

export function prerenderPreloader(): Plugin {
  let devServer: ViteDevServer | undefined

  async function render(server: ViteDevServer) {
    // React itself is externalised in SSR, so the component and this file
    // share one React instance.
    const mod = await server.ssrLoadModule('/src/components/Loading/Preloader.tsx')
    const noop = () => {}
    return renderToStaticMarkup(
      createElement(mod.Preloader, { onMusicIntent: noop, onOpenStart: noop, onOpen: noop }),
    )
  }

  return {
    name: 'prerender-preloader',
    configureServer(server) {
      devServer = server
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!html.includes(MARKER)) return html
        if (devServer) return html.replace(MARKER, await render(devServer))
        // Build: spin up a throwaway SSR server just to render the markup.
        const server = await createServer({
          configFile: 'vite.config.ts',
          server: { middlewareMode: true, hmr: false },
          appType: 'custom',
          logLevel: 'silent',
          plugins: [],
        })
        try {
          return html.replace(MARKER, await render(server))
        } finally {
          await server.close()
        }
      },
    },
  }
}

export function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        for (const [file, chunk] of Object.entries(ctx.bundle)) {
          if (chunk.type !== 'asset' || !file.endsWith('.css')) continue
          const link = new RegExp(`<link rel="stylesheet"[^>]*href="[^"]*${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`)
          if (!link.test(html)) continue
          // Relative URLs in the CSS were written for assets/; re-root them
          // for the HTML document they now live in.
          const css = String(chunk.source)
            .replace(/url\((['"]?)\.\/(?!\.)/g, 'url($1./assets/')
            .replace(/url\((['"]?)\.\.\//g, 'url($1./')
          html = html.replace(link, () => `<style>${css}</style>`)
          delete ctx.bundle[file]
        }
        return html
      },
    },
  }
}

export function deferEntry(): Plugin {
  return {
    name: 'defer-entry',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const entry = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
        if (!entry) return html
        const preloads = [...html.matchAll(/<link rel="modulepreload" crossorigin href="([^"]+)">/g)].map((m) => m[1])
        const loader = `<script>requestAnimationFrame(function(){setTimeout(function(){${preloads
          .map((h) => `var p=document.createElement('link');p.rel='modulepreload';p.href=${JSON.stringify(h)};document.head.appendChild(p);`)
          .join('')}var s=document.createElement('script');s.type='module';s.src=${JSON.stringify(entry[1])};document.head.appendChild(s)},0)})</script>`
        return html
          .replace(entry[0], '')
          .replace(/<link rel="modulepreload" crossorigin href="[^"]+">\n?/g, '')
          .replace('</body>', `${loader}\n</body>`)
      },
    },
  }
}
