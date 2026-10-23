import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { applySeoToHtml, renderSeoHead } from '../plugins/seo-html.mjs'
import { buildStructuredData, getSeoData, getSeoMeta, getSeoPages } from '../src/utils/seo.js'
import { profileIntroduction } from '../src/data/profile.js'

const work = {
  id: 'example-game',
  title: 'ゲーム & "イラスト"',
  subtitle: 'サブタイトル',
  description: '作品ごとの詳しい説明。',
  coverImage: '/assets/PG/example.webp',
  publishedAt: '2026-10-23',
  tags: ['PG', 'イラスト'],
}
const route = { name: 'workDetail', id: work.id }

test('main pages have distinct copy and use the shared icon on works, articles and profile', () => {
  const pages = ['home', 'works', 'articles', 'profile'].map((name) => getSeoData({ name }))
  for (const field of ['title', 'description', 'path']) {
    assert.equal(new Set(pages.map((page) => page[field])).size, 4, field)
  }
  for (const page of pages) {
    const meta = new Map(getSeoMeta(page).map(([, key, content]) => [key, content]))
    assert.equal(meta.get('og:title'), page.title)
    assert.equal(meta.get('twitter:description'), page.description)
    assert.equal(meta.get('twitter:image'), page.image)
    if (page.path === '/') {
      assert.equal(page.image, 'https://rurutala.net/ogp/home.jpg')
      assert.equal(meta.get('twitter:card'), 'summary_large_image')
    } else {
      assert.equal(page.image, 'https://rurutala.net/profile.webp')
      assert.equal(meta.get('twitter:card'), 'summary')
    }
  }
})

test('profile sharing uses exactly the introduction displayed on the profile page', () => {
  const seo = getSeoData({ name: 'profile' })
  assert.equal(seo.description, profileIntroduction.join(' '))
  const meta = new Map(getSeoMeta(seo).map(([, key, content]) => [key, content]))
  assert.equal(meta.get('description'), seo.description)
  assert.equal(meta.get('og:description'), seo.description)
  assert.equal(meta.get('twitter:description'), seo.description)
  assert.equal(buildStructuredData(seo, { name: 'profile' })['@graph'][2].description, seo.description)
})

test('work shares use the work description and cover, including external thumbnails', () => {
  const seo = getSeoData(route, work)
  assert.equal(seo.title, `${work.title} | るるたぁ Works`)
  assert.equal(seo.description, work.description)
  assert.equal(seo.image, 'https://rurutala.net/assets/PG/example.webp')
  assert.equal(seo.imageAlt, `${work.title} / るるたぁの作品`)
  assert.equal(seo.path, '/works/example-game')
  const external = 'https://img.youtube.com/vi/example/hqdefault.jpg'
  assert.equal(getSeoData(route, { ...work, coverImage: external }).image, external)
  const graph = buildStructuredData(seo, route, work)['@graph']
  assert.equal(graph.at(-1)['@type'], 'CreativeWork')
  assert.equal(graph.at(-1).datePublished, work.publishedAt)
})

test('works without imagery or descriptions have valid, work-specific fallbacks', () => {
  const pending = { ...work, title: 'SHADOW', coverImage: '/src/assets/hero.webp', description: '', subtitle: '' }
  const seo = getSeoData(route, pending)
  assert.equal(seo.image, 'https://rurutala.net/ogp/works.jpg')
  assert(seo.description.includes('SHADOW'))
  assert.equal(getSeoData(route, { ...pending, subtitle: '制作中' }).description, '制作中')
  assert.equal(Array.from(getSeoData(route, { ...work, description: 'あ'.repeat(200) }).description).length, 160)
})

test('article details use their own excerpt, cover and structured data', () => {
  const article = { id: 'note', title: '制作ノート', excerpt: 'この記事の概要', coverImage: '/icon/essay.webp', tags: ['Essay'] }
  const page = { name: 'articleDetail', id: article.id }
  const seo = getSeoData(page, undefined, article)
  assert.equal(seo.description, article.excerpt)
  assert.equal(seo.image, 'https://rurutala.net/icon/essay.webp')
  assert.equal(buildStructuredData(seo, page, undefined, article)['@graph'].at(-1)['@type'], 'Article')
})

test('all detail pages and legacy work URLs are generated with canonical metadata', () => {
  const summary = { ...work, id: 'illust-2026-05-summary' }
  const article = { id: 'note', title: '記事', excerpt: '概要' }
  const pages = getSeoPages([work, summary], [article])
  assert(pages.has('/works/example-game'))
  assert(pages.has('/articles/note'))
  const legacy = pages.get('/works/illust-uzawa-reisa')
  assert.equal(legacy.work, summary)
  assert(renderSeoHead(legacy).includes('href="https://rurutala.net/works/illust-2026-05-summary"'))
})

test('initial HTML includes escaped OGP and JSON-LD without JavaScript execution', () => {
  const html = '<head><!-- seo:start -->old metadata<!-- seo:end --><script src="/app.js"></script></head>'
  const page = { route, work: { ...work, description: '</script><script>alert("test")</script>' } }
  const result = applySeoToHtml(html, page)
  assert(result.includes('ゲーム &amp; &quot;イラスト&quot;'))
  assert(result.includes('property="og:image" content="https://rurutala.net/assets/PG/example.webp"'))
  assert(result.includes('\\u003c/script>'))
  assert(!result.includes('<script>alert'))
  assert(!result.includes('old metadata'))
  assert(result.includes('<script src="/app.js"></script>'))
  assert.equal(applySeoToHtml(result, page), result)
  assert.throws(() => applySeoToHtml('<head></head>', page), /markers/)
})

test('deployment routes serve page HTML while preserving sword and API routing', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
  const destinations = new Map(config.rewrites.map(({ source, destination }) => [source, destination]))
  for (const path of ['/works', '/articles', '/profile', '/works/:id', '/articles/:id']) {
    assert.equal(destinations.get(path), `${path}.html`)
  }
  assert.equal(destinations.get('/sword'), '/sword/index.html')
  assert.equal(destinations.get('/sword/'), '/sword/index.html')
  assert.equal(config.rewrites.at(-1).source, '/:path((?!api/).*)')
  assert.equal(config.rewrites.at(-1).destination, '/index.html')
  assert(config.headers.some(({ source }) => source === '/api/sword'))
  assert(config.functions['api/sword.js'])
})
