import { useState } from 'react'
import './App.css'
import { OpeningAnimation } from './components/OpeningAnimation'
import { DynamicFavicon } from './components/layout/DynamicFavicon'
import { ScrollTopButton } from './components/layout/ScrollTopButton'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { ThemePullCord } from './components/layout/ThemePullCord'
import { articles } from './data/articles'
import { works } from './data/works'
import { useRoute } from './hooks/useRoute'
import { ArticleDetailPage } from './pages/ArticleDetailPage'
import { ArticlesPage } from './pages/ArticlesPage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { WorkDetailPage } from './pages/WorkDetailPage'
import { WorksPage } from './pages/WorksPage'
import { shouldShowOpening } from './utils/opening'

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
