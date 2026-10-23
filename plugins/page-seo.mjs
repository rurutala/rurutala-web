import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createServer } from 'vite'
import { getSeoPages } from '../src/utils/seo.js'
import { applySeoToHtml } from './seo-html.mjs'

async function loadPages(server) {
  const { works } = await server.ssrLoadModule('/src/data/works.js')
  const { articles } = await server.ssrLoadModule('/src/data/articles.js')
  return getSeoPages(works, articles)
}

export function pageSeo() {
  let config
  let pages
  return {
    name: 'page-seo',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved
    },
    async buildStart() {
      if (config.command !== 'build') return
      const server = await createServer({
        configFile: false,
        root: config.root,
        logLevel: 'error',
        server: { middlewareMode: true, watch: null, hmr: false },
        appType: 'custom',
        optimizeDeps: { noDiscovery: true, include: [] },
      })
      try {
        pages = await loadPages(server)
      } finally {
        await server.close()
      }
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, context) {
        const currentPages = context.server ? await loadPages(context.server) : pages
        const pathname = new URL(context.originalUrl || context.path, 'http://localhost')
          .pathname.replace(/\/+$/, '') || '/'
        return applySeoToHtml(html, currentPages.get(pathname) || currentPages.get('/'))
      },
    },
    async writeBundle() {
      const directory = resolve(config.root, config.build.outDir)
      const template = await readFile(resolve(directory, 'index.html'), 'utf8')
      for (const [path, page] of pages) {
        if (path === '/') continue
        const destination = resolve(directory, `${path.slice(1)}.html`)
        await mkdir(dirname(destination), { recursive: true })
        await writeFile(destination, applySeoToHtml(template, page), 'utf8')
      }
      config.logger.info(`Generated page-specific OGP HTML for ${pages.size} URLs.`)
    },
  }
}
