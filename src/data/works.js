import heroImg from '../assets/hero.png'

export const workTags = ['PG', 'イラスト', 'DTM', 'Movie', 'Live2D', '3DCG']

export const works = [
  {
    id: 'daily-creative-journal',
    title: 'Daily Creative Journal',
    subtitle: '暮らしの中で見つけた創作の種を記録する実験。',
    description:
      '文章、写真、短いビジュアルを組み合わせて、日々の制作ログを残すためのポートフォリオ実験です。',
    tags: ['PG', 'イラスト'],
    author: 'るるたぁ',
    publishedAt: '2026-05-01',
    recommendedRank: 92,
    coverImage: heroImg,
    links: [
      { label: 'Demo', href: 'https://rurutala.net/' },
      { label: 'GitHub', href: 'https://github.com/' },
    ],
    sections: [
      {
        heading: '制作意図',
        body: '小さな創作をきちんと残せる場所を作るため、読みやすさと更新しやすさを重視しました。',
      },
      {
        heading: 'こだわり',
        body: '余白、文字サイズ、作品カードの密度を調整し、作品数が増えても見通しが悪くならない構成にしています。',
      },
    ],
  },
  {
    id: 'quiet-interface-study',
    title: 'Quiet Interface Study',
    subtitle: '読むこと、見ること、残すことに集中できる画面設計。',
    description:
      '主張しすぎない UI をテーマに、創作物と文章が自然に並ぶインターフェイスを検証しました。',
    tags: ['PG', 'Movie'],
    author: 'るるたぁ',
    publishedAt: '2026-04-24',
    recommendedRank: 86,
    coverImage: heroImg,
    links: [{ label: 'Preview', href: 'https://rurutala.net/' }],
    sections: [
      {
        heading: '概要',
        body: 'ポートフォリオと記事投稿が共存するサイトを想定し、一覧性と詳細閲覧の切り替えを設計しました。',
      },
      {
        heading: '今後の展開',
        body: '作品ごとの制作過程、メイキング、関連リンクをまとめられる詳細ページへ発展させます。',
      },
    ],
  },
  {
    id: 'motion-logo-study',
    title: 'Motion Logo Study',
    subtitle: '創作という言葉が広がって画面を切り替えるロゴモーション。',
    description:
      'オープニングアニメーションの試作として、タイポグラフィと図形を組み合わせた短いモーションを制作しました。',
    tags: ['Movie', 'DTM'],
    author: 'るるたぁ',
    publishedAt: '2026-03-18',
    recommendedRank: 98,
    coverImage: heroImg,
    links: [],
    sections: [
      {
        heading: 'テーマ',
        body: 'サイトに入った瞬間の印象を作るため、短く、強く、何度も見ても邪魔にならない演出を目指しました。',
      },
      {
        heading: '音と動き',
        body: '今後は DTM で作った短いサウンドロゴと組み合わせ、よりサイト全体の個性を出せるようにします。',
      },
    ],
  },
  {
    id: 'avatar-live2d-prototype',
    title: 'Avatar Live2D Prototype',
    subtitle: '表情差分と待機モーションを備えた Live2D 試作。',
    description:
      '配信用・紹介動画用に使えるキャラクターモデルの基礎検証です。表情管理と軽い動きを中心に作成しました。',
    tags: ['Live2D', 'イラスト'],
    author: 'るるたぁ',
    publishedAt: '2026-02-09',
    recommendedRank: 90,
    coverImage: heroImg,
    links: [],
    sections: [
      {
        heading: '制作範囲',
        body: 'キャラクターラフ、パーツ分け、表情差分、簡易的な待機モーションまでをまとめています。',
      },
      {
        heading: '課題',
        body: '髪や服の動きにもう少し自然な揺れを加え、視線誘導のバリエーションも増やしたいです。',
      },
    ],
  },
  {
    id: 'small-room-3dcg',
    title: 'Small Room 3DCG',
    subtitle: '小さな作業部屋をテーマにした 3DCG シーン。',
    description:
      '創作机、モニター、照明、壁の小物を配置し、落ち着いた作業部屋の雰囲気を作った 3DCG 作品です。',
    tags: ['3DCG'],
    author: 'るるたぁ',
    publishedAt: '2026-01-15',
    recommendedRank: 82,
    coverImage: heroImg,
    links: [],
    sections: [
      {
        heading: 'シーン設計',
        body: '画面内の視線が机に集まるように、ライトの強さと小物の密度を調整しています。',
      },
      {
        heading: '見どころ',
        body: '大きな派手さよりも、何かを作り始めたくなる静かな空気感を大切にしました。',
      },
    ],
  },
]

export const featuredWorks = works.slice(0, 3)
