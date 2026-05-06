import { useRef, useState } from 'react'
import { socialLinks } from '../constants/site'

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

export function ProfilePage() {
  const [profileHearts, setProfileHearts] = useState([])
  const profileSwipeRef = useRef({
    lastDirection: 0,
    lastSpawnedAt: 0,
    lastX: null,
    turns: 0,
  })

  const spawnProfileHeart = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const id = `${Date.now()}-${Math.random()}`
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setProfileHearts((currentHearts) => [
      ...currentHearts,
      {
        drift: (Math.random() - 0.5) * 34,
        id,
        scale: 0.86 + Math.random() * 0.34,
        x,
        y,
      },
    ])

    window.setTimeout(() => {
      setProfileHearts((currentHearts) => currentHearts.filter((heart) => heart.id !== id))
    }, 1100)
  }

  const handleProfileIconPointerMove = (event) => {
    const swipe = profileSwipeRef.current

    if (swipe.lastX === null) {
      swipe.lastX = event.clientX
      return
    }

    const deltaX = event.clientX - swipe.lastX

    if (Math.abs(deltaX) < 8) {
      return
    }

    const nextDirection = Math.sign(deltaX)

    if (swipe.lastDirection !== 0 && nextDirection !== swipe.lastDirection) {
      swipe.turns += 1
    }

    swipe.lastDirection = nextDirection
    swipe.lastX = event.clientX

    const now = Date.now()

    if (swipe.turns >= 4 && now - swipe.lastSpawnedAt > 420) {
      swipe.turns = 0
      swipe.lastSpawnedAt = now
      spawnProfileHeart(event)
    }
  }

  const resetProfileIconSwipe = () => {
    profileSwipeRef.current.lastDirection = 0
    profileSwipeRef.current.lastX = null
    profileSwipeRef.current.turns = 0
  }

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-hero">
        <div
          className="profile-hero__image"
          onPointerLeave={resetProfileIconSwipe}
          onPointerMove={handleProfileIconPointerMove}
        >
          <img src="/profile.webp" alt="るるたぁのアイコン" />
          {profileHearts.map((heart) => (
            <span
              className="profile-heart"
              key={heart.id}
              style={{
                '--heart-drift': `${heart.drift}px`,
                '--heart-scale': heart.scale,
                left: `${heart.x}px`,
                top: `${heart.y}px`,
              }}
              aria-hidden="true"
            >
              ♥
            </span>
          ))}
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
