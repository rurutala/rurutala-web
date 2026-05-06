import { useEffect, useState } from 'react'

export function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 520)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      className={`scroll-top ${isVisible ? 'is-visible' : ''}`}
      type="button"
      aria-label="ページの一番上へ戻る"
      onClick={scrollToTop}
    >
      <img src="/scroll-top.svg" alt="" />
    </button>
  )
}
