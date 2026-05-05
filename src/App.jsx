import { useEffect, useMemo, useRef, useState } from 'react'
import { articleTags, articles, featuredArticles } from './data/articles'
import { featuredWorks, works, workTags } from './data/works'
import './App.css'

const sortOptions = [
  { value: 'recommended', label: '作者のおすすめ' },
  { value: 'newest', label: '投稿日時が新しい順' },
  { value: 'oldest', label: '投稿日時が古い順' },
]

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

  return { name: 'home' }
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
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
        <a href="/#profile" onClick={closeMenu}>
          Profile
        </a>
      </nav>
    </header>
  )
}

function SiteFooter() {
  const socialLinks = [
    { label: 'X', href: 'https://x.com/' },
    { label: 'YouTube', href: 'https://www.youtube.com/' },
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'Mail', href: 'mailto:hello@rurutala.net' },
  ]

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
              <a href={link.href} key={link.label} aria-label={link.label}>
                {link.label.slice(0, 2)}
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
  const heroBubbles = works.slice(0, 8).map((work, index) => ({
    work,
    size: [420, 260, 560, 320, 210, 500, 280, 720][index],
    top: [-15, 75, -5, 85, -10, 60, 95, -20][index],
    left: [108, 126, 146, 166, 184, 202, 224, 246][index],
    duration: [26, 32, 30, 36, 24, 34, 28, 38][index],
    delay: [-2, -10, -5, -16, -8, -20, -13, -24][index],
  }))

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__stage">
          <div className="hero__bubbles" aria-label="注目作品">
            {heroBubbles.map((bubble) => (
              <AppLink
                className="hero__bubble"
                href={`/works/${bubble.work.id}`}
                key={bubble.work.id}
                navigate={navigate}
                style={{
                  '--bubble-size': `${bubble.size}px`,
                  '--bubble-top': `${bubble.top}%`,
                  '--bubble-left': `${bubble.left}%`,
                  '--bubble-duration': `${bubble.duration}s`,
                  '--bubble-delay': `${bubble.delay}s`,
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
        return new Date(workB.publishedAt) - new Date(workA.publishedAt)
      }

      if (sortBy === 'oldest') {
        return new Date(workA.publishedAt) - new Date(workB.publishedAt)
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
              <span>{formatDate(work.publishedAt)}</span>
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
          <p>{work.subtitle}</p>
        </div>
        <dl className="work-detail__info">
          <div>
            <dt>Published</dt>
            <dd>{formatDate(work.publishedAt)}</dd>
          </div>
          <div>
            <dt>Author</dt>
            <dd>{work.author}</dd>
          </div>
        </dl>
      </header>

      <div className="work-detail__visual">
        <img src={work.coverImage} alt="" />
      </div>

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
    <div className="work-grid">
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
          <p>{article.excerpt}</p>
        </div>
        <dl className="work-detail__info">
          <div>
            <dt>Published</dt>
            <dd>{formatDate(article.publishedAt)}</dd>
          </div>
          <div>
            <dt>Author</dt>
            <dd>{article.author}</dd>
          </div>
        </dl>
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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', resetTabState)
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

        <SiteFooter />
      </main>
      <ThemePullCord />
      <DynamicFavicon />
      <ScrollTopButton />
    </>
  )
}

export default App
