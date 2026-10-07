import { useEffect, useState } from 'react'

export function OpeningAnimation({ onFinish }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const scrollY = window.scrollY
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalWidth = document.body.style.width
    let isCancelled = false
    let hasStarted = false
    const startOpening = () => {
      if (isCancelled || hasStarted) {
        return
      }

      hasStarted = true
      window.clearTimeout(timerId)
      setIsReady(true)
    }
    // Continue with fallback fonts if the font service is unavailable.
    const timerId = window.setTimeout(startOpening, 12000)

    const fontLoading = document.fonts
      ? Promise.all([
          document.fonts.load('700 1em "M PLUS 1p"', '創作は生活を豊かに'),
          document.fonts.load('400 1em "Orbitron"', 'rurutala'),
        ]).then(() => document.fonts.ready)
      : Promise.resolve()

    fontLoading.then(startOpening, startOpening)

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      isCancelled = true
      window.clearTimeout(timerId)
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalBodyOverflow
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.width = originalWidth
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div
      className={`opening${isReady ? ' is-ready' : ''}`}
      role="status"
      aria-busy={!isReady}
      aria-label={isReady ? 'サイトのオープニング' : 'フォントを読み込み中'}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'opening-exit') {
          onFinish()
        }
      }}
    >
      {!isReady && (
        <div className="opening__loading">
          <p>
            Now Loading<span aria-hidden="true">...</span>
          </p>
          <div className="opening__loading-track" aria-hidden="true">
            <span />
          </div>
        </div>
      )}
      {isReady && (
        <>
          <span className="opening__shape opening__shape--ring" aria-hidden="true" />
          <span className="opening__shape opening__shape--line" aria-hidden="true" />
          <span className="opening__shape opening__shape--dot" aria-hidden="true" />
          <p className="opening__message" aria-label="創作は生活を豊かに">
            <span className="opening__creative" aria-hidden="true">
              創作
            </span>
            <span className="opening__divider" aria-hidden="true" />
            <span className="opening__life" aria-hidden="true">
              は生活を豊かに
            </span>
          </p>
        </>
      )}
    </div>
  )
}
