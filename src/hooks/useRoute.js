import { useEffect, useState } from 'react'

const workAliases = {
  'illust-uzawa-reisa': 'illust-2026-05-summary',
  'illust-natsu-bando': 'illust-2026-05-summary',
  'illust-tyoko': 'illust-2026-05-summary',
  'illust-ema': 'illust-2026-07-summary',
  'illust-rurune': 'illust-2025-11-summary',
  'illust-leur': 'illust-2025-11-summary',
}

function getRoute(pathname) {
  if (import.meta.env.DEV && pathname === '/manage/recommended') {
    return { name: 'recommendedEditor' }
  }

  if (pathname === '/works') {
    return { name: 'works' }
  }

  if (pathname.startsWith('/works/')) {
    const id = decodeURIComponent(pathname.replace('/works/', ''))

    return { name: 'workDetail', id: workAliases[id] || id }
  }

  if (pathname === '/articles') {
    return { name: 'articles' }
  }

  if (pathname.startsWith('/articles/')) {
    return { name: 'articleDetail', id: decodeURIComponent(pathname.replace('/articles/', '')) }
  }

  if (pathname === '/profile') {
    return { name: 'profile' }
  }

  return { name: 'home' }
}

export function useRoute() {
  const [route, setRoute] = useState(() => getRoute(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute(window.location.pathname))

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (href) => {
    if (href === `${window.location.pathname}${window.location.hash}`) {
      return
    }

    window.history.pushState({}, '', href)
    setRoute(getRoute(window.location.pathname))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return { route, navigate }
}
