import { socialLinks } from '../constants/site.js'
import { profileIntroduction } from '../data/profile.js'
import { workAliases } from '../data/work-aliases.js'

export const siteUrl = 'https://rurutala.net'
export const siteName = 'るるたぁ official site'
export const creatorName = 'るるたぁ'
const defaultDescription =
  'るるたぁ（rurutala）の公式ポートフォリオサイト。ゲーム制作、イラスト、Live2D、3DCG、音楽、映像などの作品と活動情報を掲載しています。'

const pages = {
  home: {
    title: 'るるたぁ official site | rurutala',
    description: defaultDescription,
    path: '/',
    image: '/profile.webp',
    imageAlt: 'るるたぁのアイコン',
    twitterCard: 'summary',
    type: 'website',
  },
  works: {
    title: '作品一覧 | るるたぁ Portfolio',
    description: 'るるたぁの作品一覧。Unity / C#のゲームから、イラスト、Live2D、3DCG、音楽、映像まで、制作した作品をまとめています。',
    path: '/works',
    image: '/profile.webp',
    imageAlt: 'るるたぁのアイコン',
    twitterCard: 'summary',
    type: 'website',
  },
  articles: {
    title: '記事一覧 | るるたぁ Portfolio',
    description: 'るるたぁの制作ノートと活動のお知らせ。創作を通じて考えたことや、ゲーム・イラストなどの制作記録を綴っています。',
    path: '/articles',
    image: '/profile.webp',
    imageAlt: 'るるたぁのアイコン',
    twitterCard: 'summary',
    type: 'website',
  },
  profile: {
    title: 'プロフィール | るるたぁ Portfolio',
    description: profileIntroduction.join(' '),
    path: '/profile',
    image: '/profile.webp',
    imageAlt: 'るるたぁのアイコン',
    twitterCard: 'summary',
    type: 'profile',
  },
}

function absoluteUrl(path) {
  return new URL(path, siteUrl).href
}

function description(text) {
  const compact = text.replace(/\s+/g, ' ').trim()
  const characters = Array.from(compact)
  return characters.length > 160 ? `${characters.slice(0, 159).join('')}…` : compact
}

function detailImage(image, fallback) {
  return image && (image.startsWith('/assets/') || /^https?:\/\//.test(image))
    ? image
    : fallback
}

export function getSeoData(route, work, article) {
  if (route.name === 'workDetail' && work) {
    const category = (work.tags || []).join('・')
    return {
      title: `${work.title} | るるたぁ Works`,
      description: description(work.description || work.subtitle || `${work.title}。るるたぁの${category || '創作'}作品。`),
      path: `/works/${work.id}`,
      image: absoluteUrl(detailImage(work.coverImage, '/ogp/works.jpg')),
      imageAlt: `${work.title} / るるたぁの作品`,
      twitterCard: 'summary_large_image',
      type: 'article',
    }
  }
  if (route.name === 'articleDetail' && article) {
    return {
      title: `${article.title} | るるたぁ Articles`,
      description: description(article.excerpt || article.title),
      path: `/articles/${article.id}`,
      image: absoluteUrl('/profile.webp'),
      imageAlt: 'るるたぁのアイコン',
      twitterCard: 'summary',
      type: 'article',
    }
  }
  const page = pages[route.name] || pages.home
  return { ...page, image: absoluteUrl(page.image) }
}

export function getSeoMeta(seo) {
  return [
    ['name', 'description', seo.description],
    ['name', 'author', creatorName],
    ['name', 'keywords', 'るるたぁ,rurutala,rurutala_ch,ポートフォリオ,ゲーム制作,Unity,イラスト,Live2D,3DCG,DTM'],
    ['property', 'og:site_name', siteName],
    ['property', 'og:title', seo.title],
    ['property', 'og:description', seo.description],
    ['property', 'og:type', seo.type],
    ['property', 'og:url', absoluteUrl(seo.path)],
    ['property', 'og:image', seo.image],
    ['property', 'og:image:alt', seo.imageAlt],
    ['property', 'og:locale', 'ja_JP'],
    ['name', 'twitter:card', seo.twitterCard || 'summary'],
    ['name', 'twitter:site', '@rurutala_ch'],
    ['name', 'twitter:title', seo.title],
    ['name', 'twitter:description', seo.description],
    ['name', 'twitter:image', seo.image],
    ['name', 'twitter:image:alt', seo.imageAlt],
  ]
}

export function buildStructuredData(seo, route, work, article) {
  const url = absoluteUrl(seo.path)
  const personId = `${siteUrl}/#person`
  const websiteId = `${siteUrl}/#website`
  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: siteName,
      alternateName: ['rurutala', 'rurutala_ch'],
      url: `${siteUrl}/`,
      inLanguage: 'ja',
      description: defaultDescription,
      publisher: { '@id': personId },
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: creatorName,
      alternateName: ['rurutala', 'rurutala_ch'],
      url: `${siteUrl}/`,
      image: `${siteUrl}/profile.webp`,
      sameAs: socialLinks.map((link) => link.href),
      knowsAbout: ['ゲーム制作', 'Unity', 'イラスト', 'Live2D', '3DCG', 'DTM', '映像制作'],
    },
    {
      '@type': ['works', 'articles'].includes(route.name) ? 'CollectionPage' : 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: seo.title,
      description: seo.description,
      inLanguage: 'ja',
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      primaryImageOfPage: { '@type': 'ImageObject', url: seo.image },
    },
  ]
  const content = route.name === 'workDetail' ? work : route.name === 'articleDetail' ? article : null
  if (content) {
    graph.push({
      '@type': work ? 'CreativeWork' : 'Article',
      '@id': `${url}#${work ? 'creative-work' : 'article'}`,
      name: content.title,
      headline: content.title,
      description: seo.description,
      url,
      image: seo.image,
      datePublished: content.publishedAt,
      author: { '@id': personId },
      keywords: ['るるたぁ', 'rurutala', ...(content.tags || [])].join(', '),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function getSeoPages(works, articles) {
  const result = new Map()
  for (const [name, page] of Object.entries(pages)) {
    result.set(page.path, { route: { name } })
  }
  for (const work of works) {
    result.set(`/works/${work.id}`, { route: { name: 'workDetail', id: work.id }, work })
  }
  for (const article of articles) {
    result.set(`/articles/${article.id}`, { route: { name: 'articleDetail', id: article.id }, article })
  }
  for (const [alias, id] of Object.entries(workAliases)) {
    const page = result.get(`/works/${id}`)
    if (page) result.set(`/works/${alias}`, page)
  }
  return result
}
