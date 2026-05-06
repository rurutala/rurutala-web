import { useEffect, useRef, useState } from 'react'

export function ThemePullCord() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('rurutala-theme') === 'dark')
  const [pullDistance, setPullDistance] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSwinging, setIsSwinging] = useState(false)
  const dragStartY = useRef(0)
  const latestPullDistance = useRef(0)
  const didDrag = useRef(false)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('rurutala-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    if (!isDragging) {
      return undefined
    }

    const handlePointerMove = (event) => {
      const nextPull = Math.max(0, Math.min(event.clientY - dragStartY.current, 150))
      latestPullDistance.current = nextPull
      didDrag.current = nextPull > 6
      setPullDistance(nextPull)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      setPullDistance(0)
      setIsSwinging(true)

      if (latestPullDistance.current > 72) {
        setIsDark((current) => !current)
      }

      window.setTimeout(() => setIsSwinging(false), 850)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp, { once: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging])

  const startPull = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragStartY.current = event.clientY
    latestPullDistance.current = 0
    didDrag.current = false
    setIsDragging(true)
    setIsSwinging(false)
  }

  const toggleTheme = (event) => {
    if (didDrag.current) {
      event.preventDefault()
      return
    }

    setIsSwinging(true)
    setIsDark((current) => !current)
    window.setTimeout(() => setIsSwinging(false), 850)
  }

  return (
    <button
      className={`theme-pull-cord ${isDragging ? 'is-pulling' : ''} ${
        isSwinging ? 'is-swinging' : ''
      }`}
      type="button"
      aria-label={isDark ? 'ライトモードに切り替える' : 'ダークモードに切り替える'}
      aria-pressed={isDark}
      onClick={toggleTheme}
      onPointerDown={startPull}
      style={{ '--pull': `${pullDistance}px` }}
    >
      <span className="theme-pull-cord__mount" aria-hidden="true" />
      <span className="theme-pull-cord__string" aria-hidden="true" />
      <span className="theme-pull-cord__handle" aria-hidden="true">
        <span />
        <span className="theme-pull-cord__arrow" />
      </span>
    </button>
  )
}
