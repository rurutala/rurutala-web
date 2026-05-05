import heroImg from '../assets/hero.png'

export const articleTags = ['PG', 'イラスト', 'DTM', 'Movie', 'Live2D', '3DCG']

export const articles = [
  {
    id: 'portfolio-data-design',
    title: '作品と記事を増やしやすくするデータ設計',
    excerpt:
      'ポートフォリオサイトを長く育てるために、作品や記事の情報をコンポーネントから切り離す考え方をまとめました。',
    tags: ['PG'],
    author: 'るるたぁ',
    publishedAt: '2026-05-03',
    recommendedRank: 94,
    coverImage: heroImg,
    sections: [
      {
        heading: 'なぜデータを分けるのか',
        body: '作品や記事が増えるほど、画面のコードに直接情報を書く方法は更新しづらくなります。データを配列として分けておくと、一覧、詳細、検索、並び替えを同じ情報から作れます。',
      },
      {
        heading: '運用のしやすさ',
        body: '新しい記事を追加するときは、データファイルに1件追加するだけで一覧と詳細ページの両方に反映される設計にしています。',
      },
    ],
  },
  {
    id: 'opening-motion-notes',
    title: 'オープニングアニメーションの調整メモ',
    excerpt:
      '短い演出で印象を残しつつ、毎回邪魔にならないようにするためのタイミング調整について。',
    tags: ['Movie', 'PG'],
    author: 'るるたぁ',
    publishedAt: '2026-04-28',
    recommendedRank: 88,
    coverImage: heroImg,
    sections: [
      {
        heading: '見せたいものを絞る',
        body: '演出が長すぎるとサイトに入る前の待ち時間になってしまいます。言葉、線、画面遷移の役割を分けて、短い時間で意味が伝わるようにしました。',
      },
      {
        heading: '速度の印象',
        body: '拡大やワイプの速度は、少し変えるだけで重く見えたり軽く見えたりします。最後の抜けは特にテンポを意識しています。',
      },
    ],
  },
  {
    id: 'live2d-expression-workflow',
    title: 'Live2D 表情差分を作るときのメモ',
    excerpt:
      '表情差分を整理しながら、後から調整しやすいパーツ分けにするための制作メモです。',
    tags: ['Live2D', 'イラスト'],
    author: 'るるたぁ',
    publishedAt: '2026-03-12',
    recommendedRank: 91,
    coverImage: heroImg,
    sections: [
      {
        heading: '最初に決めること',
        body: '通常、笑顔、驚き、困り顔など、使う場面が多い表情から優先して設計します。差分を増やしすぎる前に管理しやすい構成を作ることが大切です。',
      },
      {
        heading: '調整しやすい分け方',
        body: '目、眉、口、頬などの動きを独立して扱えるようにしておくと、後から表情を追加しやすくなります。',
      },
    ],
  },
  {
    id: 'small-room-rendering',
    title: '3DCG の小さな部屋を気持ちよく見せる',
    excerpt:
      '作業部屋のシーンを作るときに、光と小物の密度で雰囲気を整えるためのメモです。',
    tags: ['3DCG'],
    author: 'るるたぁ',
    publishedAt: '2026-02-19',
    recommendedRank: 80,
    coverImage: heroImg,
    sections: [
      {
        heading: '視線を集める場所',
        body: '机やモニターなど、見てほしい場所を先に決めてからライトを置くと、画面の印象がまとまりやすくなります。',
      },
      {
        heading: '小物の量',
        body: '小物は増やすほど生活感が出ますが、画面の情報量も増えます。見せたいテーマに合わせて密度を調整します。',
      },
    ],
  },
]

export const featuredArticles = articles.slice(0, 3)
