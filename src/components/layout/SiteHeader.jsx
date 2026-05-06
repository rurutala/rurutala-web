import { AppLink } from '../AppLink'

export function SiteHeader({ currentRoute, isMenuOpen, setIsMenuOpen, navigate }) {
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
