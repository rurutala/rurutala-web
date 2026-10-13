import { useEffect, useMemo, useRef, useState } from 'react'
import { AppLink } from '../components/AppLink'
import { ArticleGrid } from '../components/ArticleGrid'
import { WorkGrid } from '../components/WorkGrid'
import { featuredArticles } from '../data/articles'
import { compareWorksByRecommendation, featuredWorks, works } from '../data/works'
import { useLikes } from '../hooks/useLikes'

const openingSlots = [
  { size: 320, top: 25, duration: 24, delay: 0, tilt: -16 },
  { size: 220, top: 85, duration: 24, delay: 6, tilt: 14 },
  { size: 340, top: 25, duration: 24, delay: 12, tilt: -12 },
  { size: 240, top: 85, duration: 24, delay: 18, tilt: 18 },
]
const openingMaxSize = Math.max(...openingSlots.map((slot) => slot.size))
const visualWorks = works.filter(
  (work) =>
    work.media.images?.length ||
    work.media.embeds?.length ||
    work.media.videos?.some((video) => video.poster) ||
    work.sections.some((section) => section.media?.images?.length),
)

export function HomePage({ navigate, isOpeningVisible = false }) {
  const { getLikeCount } = useLikes()
  const popularWorks = useMemo(
    () => [...visualWorks].sort((workA, workB) =>
      getLikeCount(`work:${workB.id}`) - getLikeCount(`work:${workA.id}`) ||
      compareWorksByRecommendation(workA, workB),
    ),
    [getLikeCount],
  )
  const [openingWorkIndices, setOpeningWorkIndices] = useState(() => openingSlots.map((_, index) => index))
  const [changingSlotIds, setChangingSlotIds] = useState([])
  const changingSlots = useRef(new Set())
  const transitionTimers = useRef([])
  const nextOpeningWorkIndex = useRef(openingSlots.length)

  useEffect(() => {
    const timers = transitionTimers.current

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [])

  const replaceOpeningWork = (slotIndex) => {
    if (!popularWorks.length || changingSlots.current.has(slotIndex)) {
      return
    }

    changingSlots.current.add(slotIndex)
    setChangingSlotIds((currentIds) => [...currentIds, slotIndex])

    const swapTimer = window.setTimeout(() => {
      const nextWorkIndex = nextOpeningWorkIndex.current % popularWorks.length
      nextOpeningWorkIndex.current += 1
      setOpeningWorkIndices((currentIndices) =>
        currentIndices.map((workIndex, index) => {
          if (index !== slotIndex) {
            return workIndex
          }

          return nextWorkIndex
        }),
      )
    }, 220)

    const revealTimer = window.setTimeout(() => {
      changingSlots.current.delete(slotIndex)
      setChangingSlotIds((currentIds) => currentIds.filter((id) => id !== slotIndex))
    }, 460)

    transitionTimers.current.push(swapTimer, revealTimer)
  }

  const heroBubbles = openingSlots.map((slot, index) => ({
    ...slot,
    work: popularWorks[openingWorkIndices[index] % popularWorks.length],
  })).filter((bubble) => bubble.work)

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__stage">
          <div
            className={`hero__bubbles${isOpeningVisible ? ' is-paused' : ''}`}
            aria-label="注目作品"
            style={{ '--bubble-max-size': `${openingMaxSize}px` }}
          >
            {heroBubbles.map((bubble, index) => (
              <AppLink
                className={`hero__bubble ${changingSlotIds.includes(index) ? 'is-changing' : ''}`}
                href={`/works/${bubble.work.id}`}
                aria-label={bubble.work.title}
                key={`opening-${index}`}
                navigate={navigate}
                onAnimationIteration={(event) => {
                  if (event.target === event.currentTarget && event.animationName === 'bubble-flow') {
                    replaceOpeningWork(index)
                  }
                }}
                style={{
                  '--bubble-size': `${bubble.size}px`,
                  '--bubble-top': `${bubble.top}%`,
                  '--bubble-duration': `${bubble.duration}s`,
                  '--bubble-delay': `${bubble.delay}s`,
                  '--bubble-tilt': `${bubble.tilt}deg`,
                }}
              >
                <img
                  src={bubble.work.coverImage}
                  alt=""
                  style={{ objectPosition: bubble.work.coverImagePosition }}
                />
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
          <p>Works</p>
          <h2 id="works-title">作品</h2>
          <AppLink className="section-link" href="/works" navigate={navigate}>
            すべて見る
          </AppLink>
        </div>
        <WorkGrid works={featuredWorks} navigate={navigate} />
      </section>

      <section className="work-preview" id="articles" aria-labelledby="articles-title">
        <div className="section-heading">
          <p>Articles</p>
          <h2 id="articles-title">記事</h2>
          <AppLink className="section-link" href="/articles" navigate={navigate}>
            すべて読む
          </AppLink>
        </div>
        <ArticleGrid articles={featuredArticles} navigate={navigate} />
      </section>
    </>
  )
}
