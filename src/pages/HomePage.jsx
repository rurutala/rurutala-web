import { useEffect, useRef, useState } from 'react'
import { AppLink } from '../components/AppLink'
import { ArticleGrid } from '../components/ArticleGrid'
import { WorkGrid } from '../components/WorkGrid'
import { featuredArticles } from '../data/articles'
import { featuredWorks, works } from '../data/works'

const recommendedWorks = [...works].sort((workA, workB) => workB.recommendedRank - workA.recommendedRank)
const pinnedOpeningWorkIds = ['illust-rurune', 'illust-the-hole', 'color-connect']
const pinnedOpeningSlots = [7, 2, 5]
const dynamicOpeningWorks = recommendedWorks.filter((work) => !pinnedOpeningWorkIds.includes(work.id))

function createOpeningWorks() {
  const openingWorks = []
  let dynamicIndex = 0

  pinnedOpeningSlots.forEach((slotIndex, pinnedIndex) => {
    openingWorks[slotIndex] = works.find((work) => work.id === pinnedOpeningWorkIds[pinnedIndex])
  })

  for (let slotIndex = 0; slotIndex < 8; slotIndex += 1) {
    if (openingWorks[slotIndex]) {
      continue
    }

    openingWorks[slotIndex] = dynamicOpeningWorks[dynamicIndex % dynamicOpeningWorks.length]
    dynamicIndex += 1
  }

  return openingWorks
}

export function HomePage({ navigate }) {
  const [openingWorks, setOpeningWorks] = useState(() => createOpeningWorks())
  const [changingSlotIds, setChangingSlotIds] = useState([])
  const changingSlots = useRef(new Set())
  const transitionTimers = useRef([])
  const nextOpeningWorkIndex = useRef(8 - pinnedOpeningSlots.length)

  useEffect(() => {
    const timers = transitionTimers.current

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [])

  const replaceOpeningWork = (slotIndex) => {
    if (pinnedOpeningSlots.includes(slotIndex) || changingSlots.current.has(slotIndex)) {
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

          const nextWork = dynamicOpeningWorks[nextOpeningWorkIndex.current % dynamicOpeningWorks.length]
          nextOpeningWorkIndex.current += 1

          return nextWork || work
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
    left: [104, 126, 150, 176, 204, 234, 266, 330][index],
    duration: [30, 38, 36, 42, 28, 40, 34, 52][index],
    delay: [-2, -9, -16, -23, -5, -30, -12, -32.5][index],
    exit: ['-220vw', '-220vw', '-220vw', '-220vw', '-220vw', '-220vw', '-220vw', '-430vw'][index],
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
                  '--bubble-exit': bubble.exit,
                  '--bubble-tilt': `${bubble.tilt}deg`,
                }}
              >
                <img
                  src={bubble.work.coverImage}
                  alt=""
                  style={{ objectPosition: bubble.work.coverImagePosition }}
                />
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
