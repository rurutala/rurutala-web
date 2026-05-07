import { useEffect } from 'react'
import { socialLinks } from '../constants/site'

const siteUrl = 'https://rurutala.net'
const siteName = 'るるたぁ official site'
const creatorName = 'るるたぁ'
const defaultTitle = 'るるたぁ official site | rurutala'
const defaultDescription =
  'るるたぁ（rurutala）の公式ポートフォリオサイト。ゲーム制作、イラスト、Live2D、3DCG、音楽、映像などの作品と活動情報を掲載しています。'
const defaultImage = `${siteUrl}/profile.webp`

function absoluteUrl(path) {
  if (!path) {
    return defaultImage
  }

  if (path.startsWith('http')) {
    return path
  }

  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertCanonical(url) {
  let element = document.head.querySelector("link[rel='canonical']")

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', url)
}

function upsertStructuredData(data) {
  let element = document.head.querySelector('#structured-data')

  if (!element) {
    element = document.createElement('script')
    element.id = 'structured-data'
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

function buildBaseStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteName,
        alternateName: ['rurutala', 'rurutala_ch'],
        url: `${siteUrl}/`,
        inLanguage: 'ja',
        description: defaultDescription,
        publisher: { '@id': `${siteUrl}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: creatorName,
        alternateName: ['rurutala', 'rurutala_ch'],
        url: `${siteUrl}/`,
        image: defaultImage,
        sameAs: socialLinks.map((link) => link.href),
        knowsAbout: ['ゲーム制作', 'Unity', 'イラスト', 'Live2D', '3DCG', 'DTM', '映像制作'],
      },
    ],
  }
}

function getSeoData(route, work, article) {
  if (route.name === 'works') {
    return {
      title: `Works | ${siteName}`,
      description: 'るるたぁ（rurutala）の制作実績一覧。Unityゲーム、イラスト、Live2D、3DCG、音楽、映像などの作品を掲載しています。',
      path: '/works',
      image: defaultImage,
      type: 'website',
    }
  }

  if (route.name === 'workDetail' && work) {
    return {
      title: `${work.title} | るるたぁ works`,
      description: `${work.subtitle || work.description} - るるたぁ（rurutala）の作品ページ。`,
      path: `/works/${work.id}`,
      image: absoluteUrl(work.coverImage),
      type: 'article',
    }
  }

  if (route.name === 'articles') {
    return {
      title: `Articles | ${siteName}`,
      description: 'るるたぁ（rurutala）の記事一覧。制作記録、活動情報、ポートフォリオ更新情報を掲載しています。',
      path: '/articles',
      image: defaultImage,
      type: 'website',
    }
  }

  if (route.name === 'articleDetail' && article) {
    return {
      title: `${article.title} | るるたぁ articles`,
      description: `${article.excerpt} - るるたぁ（rurutala）の記事ページ。`,
      path: `/articles/${article.id}`,
      image: absoluteUrl(article.coverImage),
      type: 'article',
    }
  }

  if (route.name === 'profile') {
    return {
      title: `Profile | ${siteName}`,
      description: 'るるたぁ（rurutala）のプロフィール。ゲーム制作、イラスト、Live2D、3DCG、音楽、映像制作などの活動と連絡先を掲載しています。',
      path: '/profile',
      image: defaultImage,
      type: 'profile',
    }
  }

  return {
    title: defaultTitle,
    description: defaultDescription,
    path: '/',
    image: defaultImage,
    type: 'website',
  }
}

function buildStructuredData(seo, route, work, article) {
  const baseData = buildBaseStructuredData()
  const graph = [...baseData['@graph']]
  const pageUrl = `${siteUrl}${seo.path}`

  graph.push({
    '@type': seo.type === 'article' ? 'WebPage' : 'CollectionPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: seo.title,
    description: seo.description,
    inLanguage: 'ja',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#person` },
    primaryImageOfPage: { '@type': 'ImageObject', url: seo.image },
  })

  if (route.name === 'workDetail' && work) {
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#creative-work`,
      name: work.title,
      headline: work.title,
      description: work.description || work.subtitle,
      url: pageUrl,
      image: seo.image,
      datePublished: work.publishedAt,
      author: { '@id': `${siteUrl}/#person` },
      creator: { '@id': `${siteUrl}/#person` },
      keywords: ['るるたぁ', 'rurutala', ...work.tags].join(', '),
    })
  }

  if (route.name === 'articleDetail' && article) {
    graph.push({
      '@type': 'Article',
      '@id': `${pageUrl}#article`,
      headline: article.title,
      description: article.excerpt,
      url: pageUrl,
      image: seo.image,
      datePublished: article.publishedAt,
      author: { '@id': `${siteUrl}/#person` },
      publisher: { '@id': `${siteUrl}/#person` },
      keywords: ['るるたぁ', 'rurutala', ...article.tags].join(', '),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function Seo({ route, work, article }) {
  useEffect(() => {
    const seo = getSeoData(route, work, article)
    const url = `${siteUrl}${seo.path}`

    document.documentElement.lang = 'ja'
    document.title = seo.title
    upsertCanonical(url)
    upsertMeta("meta[name='description']", { name: 'description', content: seo.description })
    upsertMeta("meta[name='author']", { name: 'author', content: creatorName })
    upsertMeta("meta[property='og:site_name']", { property: 'og:site_name', content: siteName })
    upsertMeta("meta[property='og:title']", { property: 'og:title', content: seo.title })
    upsertMeta("meta[property='og:description']", { property: 'og:description', content: seo.description })
    upsertMeta("meta[property='og:type']", { property: 'og:type', content: seo.type === 'article' ? 'article' : 'website' })
    upsertMeta("meta[property='og:url']", { property: 'og:url', content: url })
    upsertMeta("meta[property='og:image']", { property: 'og:image', content: seo.image })
    upsertMeta("meta[property='og:image:alt']", { property: 'og:image:alt', content: `${creatorName}のポートフォリオ画像` })
    upsertMeta("meta[property='og:locale']", { property: 'og:locale', content: 'ja_JP' })
    upsertMeta("meta[name='twitter:card']", { name: 'twitter:card', content: 'summary' })
    upsertMeta("meta[name='twitter:site']", { name: 'twitter:site', content: '@rurutala_ch' })
    upsertMeta("meta[name='twitter:title']", { name: 'twitter:title', content: seo.title })
    upsertMeta("meta[name='twitter:description']", { name: 'twitter:description', content: seo.description })
    upsertMeta("meta[name='twitter:image']", { name: 'twitter:image', content: seo.image })
    upsertMeta("meta[name='twitter:image:alt']", { name: 'twitter:image:alt', content: `${creatorName}のポートフォリオ画像` })
    upsertStructuredData(buildStructuredData(seo, route, work, article))
  }, [route, work, article])

  return null
}
