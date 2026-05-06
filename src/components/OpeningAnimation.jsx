import { useEffect } from 'react'

export function OpeningAnimation({ onFinish }) {
  useEffect(() => {
    const scrollY = window.scrollY
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalWidth = document.body.style.width
    const timerId = window.setTimeout(onFinish, 3600)

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      window.clearTimeout(timerId)
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalBodyOverflow
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.width = originalWidth
      window.scrollTo(0, scrollY)
    }
  }, [onFinish])

  return (
    <div className="opening" role="status" aria-label="サイトのオープニング">
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
    </div>
  )
}
