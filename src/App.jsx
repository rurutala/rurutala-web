import { useEffect, useMemo, useRef, useState } from 'react'
import { articleTags, articles, featuredArticles } from './data/articles'
import { featuredWorks, works, workTags } from './data/works'
import './App.css'

const socialLinks = [
  { label: 'Twitter', href: 'https://x.com/rurutala_ch', icon: '/twitter.svg' },
  { label: 'YouTube', href: 'https://www.youtube.com/@rurutala_ch', icon: '/youtube.svg' },
  { label: 'GitHub', href: 'https://github.com/rurutala', icon: '/github.svg' },
  { label: 'Pixiv', href: 'https://www.pixiv.net/users/96051201', icon: '/pixiv.svg' },
]

const sortOptions = [
  { value: 'recommended', label: '作者のおすすめ' },
  { value: 'newest', label: '投稿日時が新しい順' },
  { value: 'oldest', label: '投稿日時が古い順' },
]

const audioGraphByElement = new WeakMap()

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

function shouldShowOpening() {
  if (typeof window === 'undefined') {
    return false
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion || !isHomePath()) {
    return false
  }

  return getNavigationType() === 'reload' || !cameFromInternalPage()
}

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

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

function formatWorkDate(work) {
  return work.dateLabel || formatDate(work.publishedAt)
}

function getWorkSortDate(work) {
  return new Date(work.sortDate || work.publishedAt)
}

function useRoute() {
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

function AppLink({ href, navigate, children, ...props }) {
  const handleClick = (event) => {
    props.onClick?.(event)

    if (event.defaultPrevented) {
      return
    }

    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

    if (isModifiedClick || href.startsWith('#') || href.startsWith('http')) {
      return
    }

    event.preventDefault()
    navigate(href)
  }

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  )
}

function OpeningAnimation({ onFinish }) {
  useEffect(() => {
    const timerId = window.setTimeout(onFinish, 3600)

    return () => window.clearTimeout(timerId)
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

function SiteHeader({ currentRoute, isMenuOpen, setIsMenuOpen, navigate }) {
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="site-header">
      <AppLink className="brand" href="/" aria-label="rurutala.net ホーム" navigate={navigate}>
        rurutala.net
      </AppLink>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="site-nav"
        aria-label="メニューを開閉"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={`site-nav ${isMenuOpen ? 'is-open' : ''}`}
        id="site-nav"
        aria-label="主要ナビゲーション"
      >
        <AppLink
          href="/works"
          className={currentRoute.name.startsWith('work') ? 'is-active' : ''}
          navigate={navigate}
          onClick={closeMenu}
        >
          Works
        </AppLink>
        <AppLink
          href="/articles"
          className={currentRoute.name.startsWith('article') ? 'is-active' : ''}
          navigate={navigate}
          onClick={closeMenu}
        >
          Articles
        </AppLink>
        <AppLink
          href="/profile"
          className={currentRoute.name === 'profile' ? 'is-active' : ''}
          navigate={navigate}
          onClick={closeMenu}
        >
          Profile
        </AppLink>
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p>rurutala.net</p>
          <span>るるたぁ Official Site</span>
        </div>

        <div className="site-footer__social">
          <nav className="social-links" aria-label="SNSリンク">
            {socialLinks.map((link) => (
              <a href={link.href} key={link.label} aria-label={link.label} target="_blank" rel="noreferrer">
                <img src={link.icon} alt="" aria-hidden="true" />
              </a>
            ))}
          </nav>
          <p>© rurutala All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}

function HomePage({ navigate }) {
  const [openingWorks, setOpeningWorks] = useState(() => {
    const shuffledWorks = [...works]

    for (let index = shuffledWorks.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      ;[shuffledWorks[index], shuffledWorks[randomIndex]] = [shuffledWorks[randomIndex], shuffledWorks[index]]
    }

    return shuffledWorks.slice(0, 8)
  })
  const [changingSlotIds, setChangingSlotIds] = useState([])
  const changingSlots = useRef(new Set())
  const transitionTimers = useRef([])

  useEffect(() => {
    return () => {
      transitionTimers.current.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [])

  const replaceOpeningWork = (slotIndex) => {
    if (changingSlots.current.has(slotIndex)) {
      return
    }

    changingSlots.current.add(slotIndex)
    setChangingSlotIds((currentIds) => [...currentIds, slotIndex])

    const swapTimer = window.setTimeout(() => {
      setOpeningWorks((currentWorks) =>
        currentWorks.map((work, index) => {
          if (index !== slotIndex) {
            return work
          }

          const candidates = works.filter((candidate) => candidate.id !== work.id)
          return candidates[Math.floor(Math.random() * candidates.length)] || work
        }),
      )
    }, 220)

    const revealTimer = window.setTimeout(() => {
      changingSlots.current.delete(slotIndex)
      setChangingSlotIds((currentIds) => currentIds.filter((id) => id !== slotIndex))
    }, 460)

    transitionTimers.current.push(swapTimer, revealTimer)
  }

  const heroBubbles = openingWorks.map((work, index) => ({
    work,
    size: [420, 260, 560, 320, 210, 500, 280, 720][index],
    top: [-15, 75, -5, 85, -10, 60, 95, -20][index],
    left: [108, 126, 146, 166, 184, 202, 224, 246][index],
    duration: [26, 32, 30, 36, 24, 34, 28, 38][index],
    delay: [-2, -10, -5, -16, -8, -20, -13, -24][index],
    tilt: [-16, 14, -12, 18, -14, 12, -18, 16][index],
  }))

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__stage">
          <div className="hero__bubbles" aria-label="注目作品">
            {heroBubbles.map((bubble, index) => (
              <AppLink
                className={`hero__bubble ${changingSlotIds.includes(index) ? 'is-changing' : ''}`}
                href={`/works/${bubble.work.id}`}
                key={`opening-${index}`}
                navigate={navigate}
                onAnimationIteration={() => replaceOpeningWork(index)}
                style={{
                  '--bubble-size': `${bubble.size}px`,
                  '--bubble-top': `${bubble.top}%`,
                  '--bubble-left': `${bubble.left}%`,
                  '--bubble-duration': `${bubble.duration}s`,
                  '--bubble-delay': `${bubble.delay}s`,
                  '--bubble-tilt': `${bubble.tilt}deg`,
                }}
              >
                <img src={bubble.work.coverImage} alt="" />
                <span>{bubble.work.title}</span>
              </AppLink>
            ))}
          </div>

          <div className="hero__content">
            <p className="hero__eyebrow">Portfolio and notes for creative living</p>
            <h1 id="hero-title">
              <span>創作</span>は
              <br />
               生活を
              <br />
               豊かに
            </h1>
          </div>
        </div>
      </section>

      <section className="work-preview" id="works" aria-labelledby="works-title">
        <div className="section-heading">
          <p>Selected Works</p>
          <h2 id="works-title">最近の作品</h2>
          <AppLink className="section-link" href="/works" navigate={navigate}>
            すべて見る
          </AppLink>
        </div>
        <WorkGrid works={featuredWorks} navigate={navigate} />
      </section>

      <section className="work-preview" id="articles" aria-labelledby="articles-title">
        <div className="section-heading">
          <p>Latest Articles</p>
          <h2 id="articles-title">最近の記事</h2>
          <AppLink className="section-link" href="/articles" navigate={navigate}>
            すべて読む
          </AppLink>
        </div>
        <ArticleGrid articles={featuredArticles} navigate={navigate} />
      </section>
    </>
  )
}

function WorksPage({ navigate }) {
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  const visibleWorks = useMemo(() => {
    const filteredWorks =
      selectedTag === 'all'
        ? works
        : works.filter((work) => work.tags.includes(selectedTag))

    return [...filteredWorks].sort((workA, workB) => {
      if (sortBy === 'newest') {
        return getWorkSortDate(workB) - getWorkSortDate(workA)
      }

      if (sortBy === 'oldest') {
        return getWorkSortDate(workA) - getWorkSortDate(workB)
      }

      return workB.recommendedRank - workA.recommendedRank
    })
  }, [selectedTag, sortBy])

  return (
    <section className="works-page" aria-labelledby="works-page-title">
      <div className="page-heading">
        <p>Works</p>
        <h1 id="works-page-title">作品一覧</h1>
      </div>

      <div className="works-toolbar" aria-label="作品の絞り込みと並び替え">
        <div className="tag-filter" aria-label="タグで検索">
          <button
            className={selectedTag === 'all' ? 'is-selected' : ''}
            type="button"
            onClick={() => setSelectedTag('all')}
          >
            All
          </button>
          {workTags.map((tag) => (
            <button
              className={selectedTag === tag ? 'is-selected' : ''}
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <label className="sort-control">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="result-count">{visibleWorks.length} works</p>
      <WorkGrid works={visibleWorks} navigate={navigate} />
    </section>
  )
}

function WorkGrid({ works: gridWorks, navigate }) {
  return (
    <div className="work-grid">
      {gridWorks.map((work) => (
        <article className="work-card" key={work.id}>
          <AppLink className="work-card__media" href={`/works/${work.id}`} navigate={navigate}>
            <img src={work.coverImage} alt="" />
          </AppLink>
          <div className="work-card__body">
            <div className="work-card__meta">
              <span>{formatWorkDate(work)}</span>
              <span>{work.author}</span>
            </div>
            <h3>
              <AppLink href={`/works/${work.id}`} navigate={navigate}>
                {work.title}
              </AppLink>
            </h3>
            <p>{work.description}</p>
            <div className="work-tags" aria-label={`${work.title} のタグ`}>
              {work.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function WorkMediaSlider({ enableImageModal = false, items, title }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalImage, setModalImage] = useState(null)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const dragDeltaX = useRef(0)
  const isDragging = useRef(false)
  const didDrag = useRef(false)

  useEffect(() => {
    setActiveIndex(0)
  }, [items])

  useEffect(() => {
    if (!modalImage) {
      return undefined
    }

    const scrollY = window.scrollY
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalWidth = document.body.style.width
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setModalImage(null)
      }
    }

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.width = originalWidth
      document.removeEventListener('keydown', handleKeyDown)
      window.scrollTo(0, scrollY)
    }
  }, [modalImage])

  const activeItem = items[activeIndex]
  const hasMultipleItems = items.length > 1
  const showPreviousItem = () => {
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1))
  }
  const showNextItem = () => {
    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1))
  }

  const handlePointerDown = (event) => {
    if (!hasMultipleItems || event.target.closest('video, iframe, button')) {
      return
    }

    isDragging.current = true
    dragStartX.current = event.clientX
    dragStartY.current = event.clientY
    dragDeltaX.current = 0
    didDrag.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!isDragging.current) {
      return
    }

    dragDeltaX.current = event.clientX - dragStartX.current
    didDrag.current = Math.abs(dragDeltaX.current) > 8
  }

  const handlePointerUp = (event) => {
    if (!isDragging.current) {
      return
    }

    const dragDeltaY = event.clientY - dragStartY.current
    const dragDistance = Math.abs(dragDeltaX.current)
    const isHorizontalDrag = dragDistance > Math.abs(dragDeltaY)

    isDragging.current = false

    if (dragDistance < 56 || !isHorizontalDrag) {
      return
    }

    if (dragDeltaX.current > 0) {
      showPreviousItem()
      return
    }

    showNextItem()
  }

  return (
    <div className="work-media__slider">
      <div
        className="work-media__slide"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          isDragging.current = false
        }}
      >
        {activeItem.type === 'image' && (
          <a
            href={activeItem.src}
            target="_blank"
            rel="noreferrer"
            draggable="false"
            onClick={(event) => {
              if (didDrag.current) {
                event.preventDefault()
                return
              }

              if (!enableImageModal) {
                return
              }

              event.preventDefault()
              setModalImage(activeItem)
            }}
          >
            <img src={activeItem.src} alt={activeItem.title || `${title} ${activeIndex + 1}`} />
          </a>
        )}
        {activeItem.type === 'video' && (
          <video controls poster={activeItem.poster}>
            <source src={activeItem.src} type={activeItem.mimeType || 'video/mp4'} />
            お使いのブラウザは動画再生に対応していません。
          </video>
        )}
        {activeItem.type === 'embed' && (
          <iframe
            src={activeItem.src}
            title={activeItem.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
        {activeItem.caption && <p className="work-media__caption">{activeItem.caption}</p>}
        {hasMultipleItems && (
          <>
            <button
              className="work-media__nav work-media__nav--previous"
              type="button"
              aria-label="前のメディア"
              onClick={showPreviousItem}
            >
              ‹
            </button>
            <button
              className="work-media__nav work-media__nav--next"
              type="button"
              aria-label="次のメディア"
              onClick={showNextItem}
            >
              ›
            </button>
          </>
        )}
      </div>
      {hasMultipleItems && (
        <div className="work-media__thumbs" aria-label={`${title} のメディア選択`}>
          {items.map((item, index) => (
            <button
              className={index === activeIndex ? 'is-active' : ''}
              key={`${item.type}-${item.src}`}
              type="button"
              aria-label={`${index + 1}番目を表示`}
              onClick={() => setActiveIndex(index)}
            >
              {item.type === 'image' && <img src={item.src} alt="" />}
              {item.type !== 'image' && item.poster && <img src={item.poster} alt="" />}
              {item.type !== 'image' && !item.poster && (
                <span>{item.type === 'video' ? 'Video' : 'YouTube'}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {modalImage && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} の拡大画像`}
          onClick={() => setModalImage(null)}
        >
          <button
            className="image-modal__close"
            type="button"
            aria-label="画像を閉じる"
            onClick={() => setModalImage(null)}
          >
            ×
          </button>
          <img src={modalImage.src} alt={modalImage.title || title} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function WorkMedia({ enableImageModal = false, media, title }) {
  const images = media?.images ?? []
  const embeds = media?.embeds ?? []
  const audio = media?.audio ?? []
  const videos = media?.videos ?? []
  const sliderItems = [
    ...videos.map((video) => ({
      type: 'video',
      src: video.src,
      title: video.title,
      caption: video.title,
      poster: video.poster,
      mimeType: video.type,
    })),
    ...embeds.map((embed) => ({
      type: 'embed',
      src: embed.src,
      title: embed.title,
      caption: embed.title,
    })),
    ...images.map((image, index) => ({
      type: 'image',
      src: image,
      title: `${title} ${index + 1}`,
    })),
  ]

  if (images.length === 0 && embeds.length === 0 && audio.length === 0 && videos.length === 0) {
    return null
  }

  return (
    <div className="work-media" aria-label={`${title} のメディア`}>
      {sliderItems.length > 0 && (
        <WorkMediaSlider enableImageModal={enableImageModal} items={sliderItems} title={title} />
      )}

      {audio.map((track) => (
        <AudioWorkPlayer key={track.src}>
          <figcaption>{track.title}</figcaption>
          <audio controls src={track.src}>
            お使いのブラウザは音声再生に対応していません。
          </audio>
        </AudioWorkPlayer>
      ))}
    </div>
  )
}

function AudioWorkPlayer({ children }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(0)
  const frequencyDataRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const audio = container?.querySelector('audio')

    if (!container || !canvas || !audio) {
      return undefined
    }

    const canvasContext = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const ensureAudioGraph = () => {
      if (audioContextRef.current) {
        return audioContextRef.current
      }

      const existingGraph = audioGraphByElement.get(audio)

      if (existingGraph) {
        audioContextRef.current = existingGraph.audioContext
        analyserRef.current = existingGraph.analyser
        frequencyDataRef.current = existingGraph.frequencyData

        return existingGraph.audioContext
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext

      if (!AudioContext) {
        return null
      }

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.82

      const source = audioContext.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const frequencyData = new Uint8Array(analyser.frequencyBinCount)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      frequencyDataRef.current = frequencyData
      audioGraphByElement.set(audio, { analyser, audioContext, frequencyData, source })

      return audioContext
    }

    const drawSpectrum = () => {
      const analyser = analyserRef.current
      const frequencyData = frequencyDataRef.current

      canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight)

      if (!analyser || !frequencyData || audio.paused || audio.ended) {
        return
      }

      analyser.getByteFrequencyData(frequencyData)

      const gridSize = 42
      const columns = Math.ceil(window.innerWidth / gridSize) + 1
      const centerY = window.innerHeight / 2

      canvasContext.save()
      canvasContext.globalCompositeOperation = 'screen'
      canvasContext.lineCap = 'round'

      const themeRgb =
        getComputedStyle(document.documentElement).getPropertyValue('--theme-rgb').trim() ||
        '30, 47, 74'

      for (let column = 0; column < columns; column += 1) {
        const dataIndex = Math.floor((column / columns) * frequencyData.length)
        const strength = frequencyData[dataIndex] / 255
        const neighbor = frequencyData[Math.min(dataIndex + 3, frequencyData.length - 1)] / 255
        const height = Math.max(8, (strength * 0.74 + neighbor * 0.26) * window.innerHeight * 0.34)
        const x = column * gridSize

        canvasContext.strokeStyle = `rgba(${themeRgb}, ${0.018 + strength * 0.11})`
        canvasContext.lineWidth = 1 + strength * 1.4
        canvasContext.beginPath()
        canvasContext.moveTo(x, centerY - height)
        canvasContext.lineTo(x, centerY + height)
        canvasContext.stroke()
      }

      canvasContext.restore()
      animationFrameRef.current = window.requestAnimationFrame(drawSpectrum)
    }

    const startVisualizer = async () => {
      setIsPlaying(true)

      if (reducedMotion) {
        return
      }

      resizeCanvas()
      const audioContext = ensureAudioGraph()

      if (audioContext?.state === 'suspended') {
        await audioContext.resume()
      }

      window.cancelAnimationFrame(animationFrameRef.current)
      drawSpectrum()
    }

    const stopVisualizer = () => {
      setIsPlaying(false)
      window.cancelAnimationFrame(animationFrameRef.current)
      canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }

    audio.addEventListener('play', startVisualizer)
    audio.addEventListener('pause', stopVisualizer)
    audio.addEventListener('ended', stopVisualizer)
    window.addEventListener('resize', resizeCanvas)

    return () => {
      audio.removeEventListener('play', startVisualizer)
      audio.removeEventListener('pause', stopVisualizer)
      audio.removeEventListener('ended', stopVisualizer)
      window.removeEventListener('resize', resizeCanvas)
      window.cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-audio-reactive', isPlaying)

    return () => {
      document.documentElement.classList.remove('is-audio-reactive')
    }
  }, [isPlaying])

  return (
    <figure className={`work-media__audio ${isPlaying ? 'is-playing' : ''}`} ref={containerRef}>
      <canvas className="audio-spectrum-backdrop" ref={canvasRef} aria-hidden="true" />
      {children}
    </figure>
  )
}

function WorkDetailPage({ work, navigate }) {
  if (!work) {
    return (
      <section className="not-found" aria-labelledby="not-found-title">
        <p>Works</p>
        <h1 id="not-found-title">作品が見つかりません</h1>
        <AppLink className="button button--primary" href="/works" navigate={navigate}>
          作品一覧へ戻る
        </AppLink>
      </section>
    )
  }

  return (
    <article className="work-detail">
      <AppLink className="back-link" href="/works" navigate={navigate}>
        Works に戻る
      </AppLink>

      <header className="work-detail__header">
        <div>
          <p className="work-detail__eyebrow">{work.tags.join(' / ')}</p>
          <h1>{work.title}</h1>
          <p className="work-detail__meta-line">
            <span>Published {formatWorkDate(work)}</span>
            <span>Author {work.author}</span>
          </p>
          <p>{work.subtitle}</p>
        </div>
      </header>

      {(work.media?.images?.length ?? 0) === 0 && (
        <div className="work-detail__visual">
          <img src={work.coverImage} alt="" />
        </div>
      )}

      <WorkMedia enableImageModal={work.tags.includes('イラスト')} media={work.media} title={work.title} />

      <div className="work-detail__content">
        <aside className="work-detail__side">
          <div className="work-tags" aria-label={`${work.title} のタグ`}>
            {work.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {work.links.length > 0 && (
            <div className="work-links">
              {work.links.map((link) => (
                <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </aside>

        <div className="work-detail__sections">
          {work.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}

function ArticlesPage({ navigate }) {
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  const visibleArticles = useMemo(() => {
    const filteredArticles =
      selectedTag === 'all'
        ? articles
        : articles.filter((article) => article.tags.includes(selectedTag))

    return [...filteredArticles].sort((articleA, articleB) => {
      if (sortBy === 'newest') {
        return new Date(articleB.publishedAt) - new Date(articleA.publishedAt)
      }

      if (sortBy === 'oldest') {
        return new Date(articleA.publishedAt) - new Date(articleB.publishedAt)
      }

      return articleB.recommendedRank - articleA.recommendedRank
    })
  }, [selectedTag, sortBy])

  return (
    <section className="works-page" aria-labelledby="articles-page-title">
      <div className="page-heading">
        <p>Articles</p>
        <h1 id="articles-page-title">記事一覧</h1>
      </div>

      <div className="works-toolbar" aria-label="記事の絞り込みと並び替え">
        <div className="tag-filter" aria-label="タグで検索">
          <button
            className={selectedTag === 'all' ? 'is-selected' : ''}
            type="button"
            onClick={() => setSelectedTag('all')}
          >
            All
          </button>
          {articleTags.map((tag) => (
            <button
              className={selectedTag === tag ? 'is-selected' : ''}
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <label className="sort-control">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="result-count">{visibleArticles.length} articles</p>
      <ArticleGrid articles={visibleArticles} navigate={navigate} />
    </section>
  )
}

function ArticleGrid({ articles: gridArticles, navigate }) {
  return (
    <div className={`work-grid article-grid ${gridArticles.length === 1 ? 'article-grid--single' : ''}`}>
      {gridArticles.map((article) => (
        <article className="work-card article-card" key={article.id}>
          <AppLink
            className="work-card__media"
            href={`/articles/${article.id}`}
            navigate={navigate}
          >
            <img src={article.coverImage} alt="" />
          </AppLink>
          <div className="work-card__body">
            <div className="work-card__meta">
              <span>{formatDate(article.publishedAt)}</span>
              <span>{article.author}</span>
            </div>
            <h3>
              <AppLink href={`/articles/${article.id}`} navigate={navigate}>
                {article.title}
              </AppLink>
            </h3>
            <p>{article.excerpt}</p>
            <div className="work-tags" aria-label={`${article.title} のタグ`}>
              {article.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ArticleDetailPage({ article, navigate }) {
  if (!article) {
    return (
      <section className="not-found" aria-labelledby="article-not-found-title">
        <p>Articles</p>
        <h1 id="article-not-found-title">記事が見つかりません</h1>
        <AppLink className="button button--primary" href="/articles" navigate={navigate}>
          記事一覧へ戻る
        </AppLink>
      </section>
    )
  }

  return (
    <article className="work-detail article-detail">
      <AppLink className="back-link" href="/articles" navigate={navigate}>
        Articles に戻る
      </AppLink>

      <header className="work-detail__header">
        <div>
          <p className="work-detail__eyebrow">{article.tags.join(' / ')}</p>
          <h1>{article.title}</h1>
          <p className="work-detail__meta-line">
            <span>Published {formatDate(article.publishedAt)}</span>
            <span>Author {article.author}</span>
          </p>
          <p>{article.excerpt}</p>
        </div>
      </header>

      <div className="work-detail__visual">
        <img src={article.coverImage} alt="" />
      </div>

      <div className="work-detail__content">
        <aside className="work-detail__side">
          <div className="work-tags" aria-label={`${article.title} のタグ`}>
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </aside>

        <div className="work-detail__sections">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}

function ProfilePage() {
  const toolGroups = [
    {
      title: 'Programming',
      tools: ['Unity', 'C#', 'C', 'HTML / CSS', 'React / JavaScript', 'Java', 'Python'],
    },
    {
      title: 'Illustration',
      tools: ['CLIP STUDIO PAINT'],
    },
    {
      title: 'Music',
      tools: ['Studio One 6 Artist', '初音ミク V4X'],
    },
    {
      title: 'Other',
      tools: ['GitHub', 'AfterEffect', 'Live2D', 'Blender'],
    },
  ]
  const faqs = [
    {
      question: '制作依頼はできますか？',
      answer:
        '内容やスケジュールによって相談可能です。まずは問い合わせフォームから概要を送ってください。',
    },
    {
      question: 'どんなジャンルの制作が多いですか？',
      answer:
        'プログラミングを主軸としてその他の制作も行っています。',
    },
    {
      question: '返信にはどのくらいかかりますか？',
      answer:
        '内容を確認したうえで返信します。急ぎの場合は、希望納期や優先事項も一緒に書いてください。',
    },
  ]

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-hero">
        <div className="profile-hero__image">
          <img src="/profile.webp" alt="るるたぁのアイコン" />
        </div>
        <div className="profile-hero__content">
          <p>Profile</p>
          <h1 id="profile-title">るるたぁ</h1>
          <div className="profile-copy">
            <p>ゲーム・イラスト・音楽など興味のある分野を横断して制作しています。</p>
            <p>作品づくりの過程や試作の記録を、ポートフォリオと記事としてまとめています。</p>
            <p>作品を見ていただける人を少しでも楽しませれたら嬉しいなと思います。</p>
          </div>
          <nav className="profile-social" aria-label="SNSリンク">
            {socialLinks.map((link) => (
              <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                <img src={link.icon} alt="" aria-hidden="true" />
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <section className="profile-section" aria-labelledby="profile-tools-title">
        <div className="section-heading">
          <p>Tools</p>
          <h2 id="profile-tools-title">制作ツールと経験</h2>
        </div>
        <div className="tool-grid">
          {toolGroups.map((group) => (
            <article className="tool-card" key={group.title}>
              <h3>{group.title}</h3>
              <div className="work-tags">
                {group.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="profile-section contact-section" aria-labelledby="contact-title">
        <div>
          <p className="profile-section__eyebrow">Contact</p>
          <h2 id="contact-title">お問い合わせ</h2>
          <p>
            制作依頼、相談、連絡事項はこちらのフォームから送信してください。
          </p>
        </div>
        <a
          className="button button--primary"
          href="https://docs.google.com/forms/d/e/1FAIpQLSfbFb3CNXMYajr4rsrIj3ylBlDKGgNCpPXFgIBqklhi_ko8Lw/viewform"
          target="_blank"
          rel="noreferrer"
        >
          問い合わせフォームを開く
        </a>
      </section>

      <section className="profile-section" aria-labelledby="faq-title">
        <div className="section-heading">
          <p>FAQ</p>
          <h2 id="faq-title">よくある質問</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </section>
  )
}

function ScrollTopButton() {
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

function ThemePullCord() {
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

function DynamicFavicon() {
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

function App() {
  const { route, navigate } = useRoute()
  const [isOpeningVisible, setIsOpeningVisible] = useState(() => shouldShowOpening())
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const currentWork = route.name === 'workDetail'
    ? works.find((work) => work.id === route.id)
    : null
  const currentArticle = route.name === 'articleDetail'
    ? articles.find((article) => article.id === route.id)
    : null

  return (
    <>
      {isOpeningVisible && (
        <OpeningAnimation onFinish={() => setIsOpeningVisible(false)} />
      )}

      <main className="site-shell" aria-label="rurutala.net">
        <SiteHeader
          currentRoute={route}
          isMenuOpen={isMenuOpen}
          navigate={navigate}
          setIsMenuOpen={setIsMenuOpen}
        />

        {route.name === 'home' && <HomePage navigate={navigate} />}
        {route.name === 'works' && <WorksPage navigate={navigate} />}
        {route.name === 'workDetail' && (
          <WorkDetailPage navigate={navigate} work={currentWork} />
        )}
        {route.name === 'articles' && <ArticlesPage navigate={navigate} />}
        {route.name === 'articleDetail' && (
          <ArticleDetailPage article={currentArticle} navigate={navigate} />
        )}
        {route.name === 'profile' && <ProfilePage />}

        <SiteFooter />
      </main>
      <ThemePullCord />
      <DynamicFavicon />
      <ScrollTopButton />
    </>
  )
}

export default App
