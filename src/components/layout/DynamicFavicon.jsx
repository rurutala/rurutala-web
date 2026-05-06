import { useEffect } from 'react'

export function DynamicFavicon() {
  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']")
    const defaultHref = favicon?.getAttribute('href') || '/favicon.svg'
    const defaultTitle = 'るるたぁ official site'
    let titleResetTimer = null
    const sleepyIcon = `data:image/svg+xml,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><text y='48' font-size='48'>💤</text></svg>",
    )}`

    const setFavicon = (href) => {
      favicon?.setAttribute('href', href)
    }

    const clearTitleTimer = () => {
      window.clearTimeout(titleResetTimer)
    }

    const resetTabState = () => {
      clearTitleTimer()
      setFavicon(defaultHref)
      document.title = defaultTitle
    }

    resetTabState()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTitleTimer()
        setFavicon(sleepyIcon)
        document.title = 'るるたぁはすやすや...'
        titleResetTimer = window.setTimeout(() => {
          if (document.hidden) {
            document.title = defaultTitle
          }
        }, 2600)
        return
      }

      resetTabState()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pageshow', resetTabState)
    window.addEventListener('pagehide', resetTabState)
    window.addEventListener('beforeunload', resetTabState)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', resetTabState)
      window.removeEventListener('pagehide', resetTabState)
      window.removeEventListener('beforeunload', resetTabState)
      resetTabState()
    }
  }, [])

  return null
}
