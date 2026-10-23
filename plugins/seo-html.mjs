import { buildStructuredData, getSeoData, getSeoMeta, siteUrl } from '../src/utils/seo.js'

const startMarker = '<!-- seo:start -->'
const endMarker = '<!-- seo:end -->'
const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => entities[character])

export function renderSeoHead({ route, work, article }) {
  const seo = getSeoData(route, work, article)
  const structuredData = JSON.stringify(buildStructuredData(seo, route, work, article))
    .replace(/</g, '\\u003c')
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(`${siteUrl}${seo.path}`)}" />`,
    ...getSeoMeta(seo).map(([attribute, key, content]) =>
      `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`,
    ),
    `<script type="application/ld+json" id="structured-data">${structuredData}</script>`,
  ].join('\n    ')
}

export function applySeoToHtml(html, page) {
  const start = html.indexOf(startMarker)
  const end = html.indexOf(endMarker)
  if (start < 0 || end < start) throw new Error('SEO template markers are missing in index.html')
  return `${html.slice(0, start + startMarker.length)}\n    ${renderSeoHead(page)}\n    ${html.slice(end)}`
}
