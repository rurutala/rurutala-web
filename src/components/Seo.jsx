import { useEffect } from 'react'
import { buildStructuredData, getSeoData, getSeoMeta, siteUrl } from '../utils/seo'

export function Seo({ route, work, article }) {
  useEffect(() => {
    const seo = getSeoData(route, work, article)
    document.documentElement.lang = 'ja'
    document.title = seo.title

    let canonical = document.head.querySelector("link[rel='canonical']")
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `${siteUrl}${seo.path}`
    for (const [attribute, key, content] of getSeoMeta(seo)) {
      let element = document.head.querySelector(`meta[${attribute}='${key}']`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    let structuredData = document.head.querySelector('#structured-data')
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.id = 'structured-data'
      structuredData.type = 'application/ld+json'
      document.head.appendChild(structuredData)
    }
    structuredData.textContent = JSON.stringify(buildStructuredData(seo, route, work, article))
  }, [route, work, article])

  return null
}
