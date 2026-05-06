import { useEffect, useState } from 'react'

function getRoute(pathname) {
  if (pathname === '/works') {
    return { name: 'works' }
  }

  if (pathname.startsWith('/works/')) {
    return { name: 'workDetail', id: decodeURIComponent(pathname.replace('/works/', '')) }
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
