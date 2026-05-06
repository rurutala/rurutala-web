function isHomePath() {
  return window.location.pathname === '/' || window.location.pathname === '/index.html'
}

function cameFromInternalPage() {
  if (!document.referrer) {
    return false
  }

  try {
    const referrerUrl = new URL(document.referrer)

    return referrerUrl.origin === window.location.origin
  } catch {
    return false
  }
}

function getNavigationType() {
  const navigationEntry = performance.getEntriesByType('navigation')[0]

  return navigationEntry?.type
}

export function shouldShowOpening() {
  if (typeof window === 'undefined') {
    return false
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion || !isHomePath()) {
    return false
  }

  return getNavigationType() === 'reload' || !cameFromInternalPage()
}
