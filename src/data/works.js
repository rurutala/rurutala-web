import heroImg from '../assets/hero.webp'

const asset = (path) => `/assets/${path}`
const youtubeThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

export const workTags = ['PG', 'イラスト', 'DTM', 'Movie', 'Live2D', '3DCG']

const templates = {
  pg: [
    {
      heading: '概要',
      body: '作品の目的、制作時期、制作体制を記載します。',
    },
    {
      heading: '担当範囲',
      body: '実装した機能、画面、進行管理などの担当箇所を記載します。',
    },
    {
      heading: '使用技術',
      body: '使用した言語、エンジン、ライブラリ、開発ツールを記載します。',
    },
    {
      heading: 'メモ',
      body: '制作中に意識した点、課題、今後追記したい内容を記載します。',
    },
  ],
  illustration: [
    {
      heading: '概要',
      body: '作品のテーマ、制作時期、用途を記載します。',
    },
    {
      heading: '制作情報',
      body: '使用ツール、作業工程、差分や関連素材について記載します。',
    },
    {
      heading: 'メモ',
      body: '構図、色、描き込みなど後から補足したい内容を記載します。',
    },
  ],
  music: [
    {
      heading: '概要',
      body: '曲のテーマ、制作企画、公開先を記載します。',
    },
    {
      heading: '使用ツール',
      body: 'DAW、音源、ボーカル、ミキシングなどの制作環境を記載します。',
    },
    {
      heading: 'メモ',
      body: '曲調、構成、反省点など後から補足したい内容を記載します。',
    },
  ],
  movie: [
    {
      heading: '概要',
      body: '動画の目的、公開先、制作した素材を記載します。',
    },
    {
      heading: '担当範囲',
      body: 'イラスト、編集、撮影、モーションなど担当した工程を記載します。',
    },
    {
      heading: 'メモ',
      body: '演出や編集面で後から補足したい内容を記載します。',
    },
  ],
  live2d: [
    {
      heading: '概要',
      body: 'モデルの用途、制作時期、前バージョンとの差分を記載します。',
    },
    {
      heading: '表情・動作',
      body: '表情差分、パーツ分け、モーションや調整内容を記載します。',
    },
    {
      heading: 'メモ',
      body: '制作工程や改善点など後から補足したい内容を記載します。',
    },
  ],
  cg: [
    {
      heading: '概要',
      body: '3DCGモデルの用途、制作時期、使用ツールを記載します。',
    },
    {
      heading: '制作内容',
      body: 'モデリング、ボーン、シェイプキー、ウェイト調整などを記載します。',
    },
    {
      heading: 'メモ',
      body: '調整した点、課題、今後追記したい内容を記載します。',
    },
  ],
}

function createWork({
  id,
  title,
  subtitle,
  description,
  tags,
  publishedAt,
  dateLabel,
  sortDate,
  recommendedRank,
  coverImage,
  coverImagePosition = 'center',
  links = [],
  media = {},
  sections = [],
}) {
  const firstImage = media.images?.[0]
  const firstVideoPoster = media.videos?.find((video) => video.poster)?.poster
  const visibleSections = sections.filter((section) => section.heading && section.body)

  return {
    id,
    title,
    subtitle,
    description,
    tags,
    author: 'るるたぁ',
    publishedAt,
    dateLabel,
    sortDate,
    recommendedRank,
    coverImage: coverImage || firstImage || firstVideoPoster || heroImg,
    coverImagePosition,
    links,
    sections: visibleSections,
    media,
  }
}

export const works = [
  createWork({
    id: 'color-connect',
    title: 'カラーコネクト',
    subtitle: '2Dアクションと複数人プレイを軸に制作しているプレイヤー体験を求めたゲーム作品。',
    description: 'Unity / C# で制作している、色を使った二人プレイ対応の2Dアクションゲームです。',
    tags: ['PG'],
    publishedAt: '2026-01-31',
    dateLabel: '2025/7/ ~ 2025/1',
    sortDate: '2026-01-31',
    recommendedRank: 230,
    links: [
      { label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/colorconnect' },
      { label: '作品資料', href: asset('PG/PG_COLORCONNECT/colorconnect_ex.pdf') },
    ],
    media: {
      images: [
        asset('PG/PG_COLORCONNECT/colorconnect1.webp'),
        asset('PG/PG_COLORCONNECT/colorconnect2.webp'),
        asset('PG/PG_COLORCONNECT/colorconnect3.webp'),
        asset('PG/PG_COLORCONNECT/colorconnect4.webp'),
      ],
      videos: [
        {
          title: 'カラーコネクト',
          src: asset('PG/PG_COLORCONNECT/colorconnect_movie.mp4'),
          type: 'video/mp4',
          poster: asset('PG/PG_COLORCONNECT/colorconnect1.webp'),
        },
      ],
    },
    sections: [
      {
        heading: '概要',
        body: 'PGからイラストなど多くの作品を作成してきた知識と経験を活かして、現状できる最大限の作品を作成したいと考え制作に至りました。テーマは2Dアクション×複数人プレイが可能なワイワイ遊べるゲームを目標に「色」をテーマにした作品です。',
      },
      {
        heading: '担当範囲',
        body: '個人製作（PG、イラスト）',
      },
      {
        heading: '使用技術',
        body: '環境\nUnity6, C#\n\nライブラリ\nDoTween, UniTask, R3',
      },
      {
        heading: 'メモ',
        body: 'プレイ体験をより良くすることに注力しました。キーコンフィグの実装やプレイヤーのジャンプに関わるバッファ制御といった目に見えない所や、色を使うことがコンセプトのためビビッドなカラーリングとサポートの機能を追加するなど、細かい部分までプレイヤーに不快感を与えることがないように努め、時にはテストプレイやアンケートなどを取りより改善をしてきました。\nその他には新しくR3といったライブラリを実践的に活用できるように日々挑戦してきました。\n具体的な内容は作品資料をご覧ください。',
      },
    ],
  }),
  createWork({
    id: 'minamo-rua-live2d-v2',
    title: '水面ルア ver2',
    subtitle: 'オリジナルキャラクター「水面ルア」のLive2Dモデル。',
    description: 'Live2D、CLIP STUDIO PAINTなどを使用したモデル制作です。',
    tags: ['Live2D', 'イラスト'],
    publishedAt: '2024-12-31',
    dateLabel: '2024',
    sortDate: '2024-12-31',
    recommendedRank: 60,
    coverImagePosition: 'center 30%',
    media: {
      images: [
        asset('LIVE2D/minamoruav2.webp'),
        asset('LIVE2D/minamov2-1.webp'),
        asset('LIVE2D/minamov2-2.webp'),
        asset('LIVE2D/minamov2-3.webp'),
        asset('LIVE2D/minamov2-4.webp'),
      ],
    },
    sections: templates.live2d,
  }),
  createWork({
    id: 'minamo-rua-3dcg',
    title: '水面ルア（3DCG）',
    subtitle: 'Blenderで制作した水面ルアの3DCGモデル。',
    description: 'Blenderでモデリング、ボーン、シェイプキーなどを扱った3DCG作品です。',
    tags: ['3DCG'],
    publishedAt: '2025-02-28',
    dateLabel: '2025/2',
    sortDate: '2025-02-28',
    recommendedRank: 180,
    coverImagePosition: 'center 30%',
    media: {
      images: [
        asset('3DCG/minamorua_3d1.webp'),
        asset('3DCG/minamorua_3d2.webp'),
        asset('3DCG/minamorua_3d3.webp'),
        asset('3DCG/minamorua_3d4.webp'),
      ],
    },
    sections: [
      {
        heading: '概要',
        body: 'オリジナルキャラクター水面ルアの3DCG作品です。\nほぼ初めてのBlenderでしたが最後まで作成できたことがまず良かったと思います。ですが、完成度はまだまだなのでいつかリベンジしたいです。',
      },
      {
        heading: '制作内容',
        body: 'モデリング、ボーン、シェイプキー、ウェイトペイント',
      },
    ],
  }),
  createWork({
    id: 'eruption',
    title: 'Eruption: ~焼け焦げた運命~',
    subtitle: '5daysインターンでチーム制作したUnityゲーム。',
    description: 'Unity / C# で制作したチーム開発作品です。GitHubとUnityRoomへのリンクを掲載しています。',
    tags: ['PG'],
    publishedAt: '2024-09-06',
    dateLabel: '2024/9/2 ~ 9/6',
    sortDate: '2024-09-06',
    recommendedRank: 70,
    links: [
      { label: 'リポジトリ(NoAsset)', href: 'https://github.com/rurutala/eruption_noasset' },
      {
        label: '作品ページ(UnityRoom)',
        href: 'https://unityroom.com/games/epsilon-software_5daysinternship_summer2024_a',
      },
    ],
    media: {
      images: [
        asset('PG/PG_ERUPTION/eruption.webp'),
        asset('PG/PG_ERUPTION/eruption1.webp'),
        asset('PG/PG_ERUPTION/eruption2.webp'),
        asset('PG/PG_ERUPTION/eruption3.webp'),
        asset('PG/PG_ERUPTION/eruption4.gif'),
        asset('PG/PG_ERUPTION/eruption5.gif'),
        asset('PG/PG_ERUPTION/eruption6.gif'),
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'notes-knights',
    title: 'ノーツナイツ',
    subtitle: 'サークル企画で制作した3Dタワーディフェンスゲーム。',
    description: 'Unity / C# を使用したチーム制作の3Dタワーディフェンスゲーム作品です。',
    tags: ['PG'],
    publishedAt: '2024-10-31',
    dateLabel: '2024/8/ ~ 10/31',
    sortDate: '2024-10-31',
    recommendedRank: 156,
    links: [
      { label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/notesknights' },
      { label: '操作説明', href: asset('PG/PG_NOTESKNIGHTS/NotesKnights.pdf') },
    ],
    media: {
      images: [
        asset('PG/PG_NOTESKNIGHTS/notesknights0.png'),
        asset('PG/PG_NOTESKNIGHTS/notesknights1.webp'),
        asset('PG/PG_NOTESKNIGHTS/notesknights2.webp'),
        asset('PG/PG_NOTESKNIGHTS/notesknights3.webp'),
        asset('PG/PG_NOTESKNIGHTS/notesknights4.webp'),
        asset('PG/PG_NOTESKNIGHTS/notesknights5.webp'),
        asset('PG/PG_NOTESKNIGHTS/notesknights6.webp'),
      ],
    },
    sections: [
      {
        heading: '概要',
        body: 'アークナイツという作品を参考にした3Dタワーディフェンス×ローグライク作品です。6人で約1カ月で制作しました。\n3D作品を創る機会が少なかったため1カ月でこのシステムに挑戦し形にすることが出来て非常に良かった経験だと思います。',
      },
      {
        heading: '担当範囲',
        body: 'Unity周り、プログラム全般',
      },
      {
        heading: 'メモ',
        body: '【反省点】\n敵の進行の実装をこちらで配置したポイントに直線的に移動していくように実装をしているため、進行不可に陥る可能性を含んでいるので移動方式をNavMeshAgentを併用してスムーズに移動を行えるように実装を行うことが出来れば、より良い作品に仕上げることが出来たと思います。',
      },
    ],
  }),
  createWork({
    id: 'deainder',
    title: 'Deainder',
    subtitle: 'Unity1Weekで開発したノベルゲーム作品。',
    description: 'Unity / C# とGitHubを使用した共同開発作品です。クリーンアーキテクチャなど設計に触れる機会になりました。',
    tags: ['PG'],
    publishedAt: '2025-05-11',
    dateLabel: '2025/4/14 ~ 5/11',
    sortDate: '2025-05-11',
    recommendedRank: 220,
    links: [{ label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/deainder' }],
    media: {
      images: [
        asset('PG/PG_DEAIINDER/deainder0.png'),
        asset('PG/PG_DEAIINDER/deainder1.webp'),
        asset('PG/PG_DEAIINDER/deainder2.webp'),
        asset('PG/PG_DEAIINDER/deainder3.webp'),
      ],
    },
    sections: [
      {
        heading: '概要',
        body: 'Unity1Weekで開発したゲーム作品です。期間は伸びてしまいましたが非常にためになる経験になりました。\n\nゲームプログラマーとして働いているメンバーとの共同開発で、自身の知らない知識、技術やチームで開発する上で意識する点などを学ぶことが出来ました。普段主に一人で開発を行っているときには出来ていなかった、部品ごとに機能を分けて開発を行うことや、コードの空気を読むといったこれまででは意識の外にあったことについて気づくことが出来ました。',
      },
      {
        heading: '担当範囲',
        body: 'ペア選択\nプロフィール詳細\n会話パートなど',
      },
      {
        heading: '使用技術',
        body: 'ライブラリ\nUniTask, R3\n\nパターンなど\nクリーンアーキテクチャ, MVRPパターン, サービスロケータ',
      },
      {
        heading: 'メモ',
        body: '個人製作で必要だろうと感じていたUniTaskであったりデザインパターンであったり、現場で開発するための技術というようなものに初めて触れ圧倒された開発でした。',
      },
    ],
  }),
  createWork({
    id: 'dango-no-unmei',
    title: '団子の運命',
    subtitle: '3day制作で作成したタワーディフェンスゲーム。',
    description: 'Unity / C# で制作したチーム開発作品です。Githubやソースツリーなどの経験になりました。',
    tags: ['PG'],
    publishedAt: '2023-12-31',
    dateLabel: '2023',
    sortDate: '2023-12-31',
    recommendedRank: 50,
    links: [{ label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/dango' }],
    media: {
      images: [
        asset('PG/PG_DANGO/dango-0.webp'),
        asset('PG/PG_DANGO/dango-1.webp'),
        asset('PG/PG_DANGO/dango-2.webp'),
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'kudamono-samurai-online',
    title: 'くだもの侍Online',
    subtitle: 'オンライン対戦を扱った早押しUnityゲーム。',
    description: 'Unity / C# とPUN2を使用したリアルタイムオンラインゲームです。',
    tags: ['PG'],
    publishedAt: '2024-08-31',
    dateLabel: '2024/8',
    sortDate: '2024-08-31',
    recommendedRank: 30,
    links: [{ label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/fruitsamurai' }],
    media: {
      images: [
        asset('PG/PG_SAMURAI/samurai0.webp'),
        asset('PG/PG_SAMURAI/samurai1.webp'),
        asset('PG/PG_SAMURAI/samurai2.webp'),
        asset('PG/PG_SAMURAI/samurai3.webp'),
        asset('PG/PG_SAMURAI/samurai4.webp'),
        asset('PG/PG_SAMURAI/samurai5.webp'),
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'sweets-bang',
    title: 'SweetsBang',
    subtitle: 'サークル内ゲームジャムで制作したUnityゲーム。',
    description: 'Unity / C# で制作したゲームジャム作品です。ノベルちっくな場面と落ち物系の経験になりました。',
    tags: ['PG'],
    publishedAt: '2024-12-28',
    dateLabel: '2024/12/26 ~ 28',
    sortDate: '2024-12-28',
    recommendedRank: 40,
    links: [{ label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/sweetsbang' }],
    media: {
      images: [
        asset('PG/PG_SWEETSBANG/sweetsbang0.webp'),
        asset('PG/PG_SWEETSBANG/sweetsbang1.webp'),
        asset('PG/PG_SWEETSBANG/sweetsbang2.webp'),
        asset('PG/PG_SWEETSBANG/sweetsbang3.webp'),
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'magic-magic',
    title: 'MagicMagic',
    subtitle: '芝浦祭でライブ制作したシューティングゲーム。',
    description: 'Unity / C# で制作した2Dシューティングゲーム作品です。',
    tags: ['PG'],
    publishedAt: '2024-11-03',
    dateLabel: '2024/11/1 ~ 3',
    sortDate: '2024-11-03',
    recommendedRank: 20,
    links: [{ label: '作品ページ(UnityRoom)', href: 'https://unityroom.com/games/magicmagic' }],
    media: {
      images: [
        asset('PG/PG_MAGICMAGIC/magicmagic1.webp'),
        asset('PG/PG_MAGICMAGIC/magicmagic2.webp'),
        asset('PG/PG_MAGICMAGIC/magicmagic3.webp'),
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'deadoralive',
    title: 'DeadorAlive',
    subtitle: 'Windows Formsで半年間チームで制作した脱出ゲーム。',
    description: 'チームで半年間、C# .NET Windows Formsを使用した脱出ゲームです。',
    tags: ['PG'],
    publishedAt: '2021-12-31',
    dateLabel: '2021',
    sortDate: '2021-12-31',
    recommendedRank: 80,
    media: {
      images: [
        asset('PG/PG_DOA/deadoralive1.webp'),
        asset('PG/PG_DOA/deadoralive2.webp'),
        asset('PG/PG_DOA/deadoralive3.webp'),
        asset('PG/PG_DOA/deadoralive4.webp'),
        asset('PG/PG_DOA/deadoralive5.webp'),
        asset('PG/PG_DOA/deadoralive6.webp'),
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'saityou-yuusha-party',
    title: '世界最長の勇者パーティは数の暴力で魔王を撃退するようです',
    subtitle: '多くのNPCを仲間にして進むUnityゲーム。',
    description: 'Unity / C# で制作したゲーム作品です。クリーンアーキテクチャやR3を使ったMVRPなど設計を意識して制作しました。',
    tags: ['PG'],
    publishedAt: '2025-12-28',
    dateLabel: '2025/12/25 ~ 12/28',
    sortDate: '2025-12-28',
    recommendedRank: 190,
    media: {
      images: [
        asset('PG/PG_SAITYOU/saityou0.webp'),
        asset('PG/PG_SAITYOU/saityou1.webp'),
      ],
      videos: [
        {
          title: '世界最長の勇者パーティは数の暴力で魔王を撃退するようです',
          src: asset('PG/PG_SAITYOU/saityou.mp4'),
          type: 'video/mp4',
          poster: asset('PG/PG_SAITYOU/saityou0.webp'),
        },
      ],
    },
    sections: [
      {
        heading: '概要',
        body: 'プレイヤーの移動する方向を操作し、多くのNPCを仲間にして敵を倒すゲームです。マップに落ちているアイテムなどを拾いボスを倒すことで勝利となります。',
      },
      {
        heading: '担当箇所',
        body: 'NPCのシステム（ステータス、攻撃、追尾処理など全般）\nボス（黒騎士）の実装\n宝箱の実装\n音周りの実装\nタイトル画面、ゲームオーバー画面の実装',
      },
      {
        heading: '使用した技術',
        body: 'クリーンアーキテクチャ\nR3, UniTask, VContainer',
      },
      {
        heading: 'メモ',
        body: 'UniTaskやR3に触れたDeainderから、よりR3であったりインターフェースの理解を進めることが出来ていたことを再認識できた作品でした。\n\nもっと良いコードを作成できるようなエンジニアになりたいと思いました。',
      },
    ],
  }),
  createWork({
    id: 'double-cross',
    title: 'ダブルクロス',
    subtitle: 'VR視点とドローン探索を扱うゲーム作品。',
    description: 'Unity / C# で制作したVRゲームです。',
    tags: ['PG'],
    publishedAt: '2025-11-13',
    dateLabel: '2025/11/3 ~ 11/13',
    sortDate: '2025-11-13',
    recommendedRank: 90,
    coverImage: asset('PG/PG_DOUBLECROSS/doublecross2.png'),
    media: {
      images: [asset('PG/PG_DOUBLECROSS/doublecross2.png')],
      embeds: [
        {
          title: 'ダブルクロス',
          src: 'https://www.youtube.com/embed/tIN7Xy1FSa8?si=IYREp1nls7CpYE-B',
        },
      ],
    },
    sections: templates.pg,
  }),
  createWork({
    id: 'kaze-yadoru-douketsu',
    title: '風宿る洞穴',
    subtitle: 'MV企画に提出した音楽作品。',
    description: 'Studio One 6 Artistで制作した音楽作品です。音源とYouTubeリンクを掲載しています。',
    tags: ['DTM'],
    publishedAt: '2024-08-31',
    dateLabel: '2024/8',
    sortDate: '2024-08-31',
    recommendedRank: 160,
    coverImage: youtubeThumbnail('nykxaC50U1s'),
    links: [{ label: 'MV企画(Youtube)', href: 'https://youtu.be/nykxaC50U1s?si=8Pb9v0Ybq6LzLO2a&t=1699' }],
    media: {
      embeds: [
        {
          title: '風宿る洞穴 MV企画',
          src: 'https://www.youtube.com/embed/nykxaC50U1s?si=8Pb9v0Ybq6LzLO2a&start=1699',
        },
      ],
      audio: [{ title: '風宿る洞穴', src: asset('MUSIC/douketu.wav') }],
    },
    sections: [
      {
        heading: '概要',
        body: '神秘的ではあるもののどこかものがなしく不安になるようなイメージで作曲しました。序盤でテーマの洞穴に引き寄せられ内部に引き寄せられると風の音が聞こえてきます。一定のフレーズに音を重ねていき単調さを感じさせないように意識をしてしました。\n\n最終的にこの洞穴から脱出したのかはたまた...',
      },
      {
        heading: '使用ツール',
        body: 'Studio One 6 Artist',
      },
      {
        heading: 'メモ',
        body: 'ピアノフレーズを実際に引きながらたくさん悩みました。いいフレーズが出来たと思います！',
      },
    ],
  }),
  createWork({
    id: 'masked-dedede-full-flavor',
    title: 'マスクド・デデデのテーマ(FullFlavor)',
    subtitle: 'サークル内企画で制作したアレンジ楽曲。',
    description: 'Studio One 6 Artistで制作した音楽作品です。',
    tags: ['DTM'],
    publishedAt: '2025-03-03',
    dateLabel: '2025/3/2 ~ 3/3',
    sortDate: '2025-03-03',
    recommendedRank: 130,
    media: {
      audio: [
        {
          title: 'マスクド・デデデのテーマ(FullFlavor)',
          src: asset('MUSIC/マスクド・デデデのテーマ(FullFlavor).wav'),
        },
      ],
    },
    sections: [
      {
        heading: 'ジャンル',
        body: 'HardStyle\nArtcore\nChiptune\nKawaii Future Bass\nDubStep\nHi-tech\nTrance\nHardStyle',
      },
      {
        heading: 'メモ',
        body: '初心者が1dayでやる内容ではありませんでした。ですが、多くのジャンルに挑戦し、雰囲気を掴むという点では非常によい経験になりました。非常に！大変でした！',
      },
    ],
  }),
  createWork({
    id: 'illustration-beginner-course',
    title: 'イラスト初心者講座',
    subtitle: 'サークル向けに制作したイラスト講座動画。',
    description: '動画の撮影、編集、サムネイル制作などを扱ったMovie作品です。',
    tags: ['Movie'],
    publishedAt: '2024-12-31',
    dateLabel: '2023 - 2024',
    sortDate: '2024-12-31',
    recommendedRank: 10,
    coverImage: youtubeThumbnail('b5Gy-ha_Zb4'),
    media: {
      embeds: [
        {
          title: 'イラスト初心者講座',
          src: 'https://www.youtube.com/embed/b5Gy-ha_Zb4',
        },
      ],
    },
    sections: [
      {
        heading: 'メモ',
        body: '映像編集に少し慣れることが出来てよかったです！',
      },
    ],
  }),
  createWork({
    id: 'rapsody-mv',
    title: 'らぷそでぃ...?',
    subtitle: 'MV制作企画で制作した映像作品。',
    description: 'イラストとAfter Effectsでの動画編集を担当したMovie作品です。',
    tags: ['Movie', 'イラスト'],
    publishedAt: '2025-05-11',
    dateLabel: '2025/4/ ~ 5/11',
    sortDate: '2025-05-11',
    recommendedRank: 170,
    coverImage: youtubeThumbnail('69_7AFYwrMk'),
    media: {
      embeds: [
        {
          title: 'らぷそでぃ...?',
          src: 'https://www.youtube.com/embed/69_7AFYwrMk?si=ueHfp99Q1J_x0UKs&start=1299',
        },
      ],
    },
    sections: [
      {
        heading: '概要',
        body: 'MV制作企画にてイラスト及び映像制作を担当しました。\n一枚絵での制作ではなく、アニメーションを用いて制作を行ったため、よりよく見えるように工夫をしながら制作を行いました。\nまた、動画編集にはAfter Effectsを使用し、動画編集の技術の向上になりました。\n一か月ほど取り組み完成することが出来たので非常に達成感がある作品です。',
      },
    ],
  }),
  createWork({
    id: 'illust-ema',
    title: '桜羽エマ',
    subtitle: '合同誌に提出する予定の作品です。仮ページ',
    description: '続報は合同誌をお待ちください',
    tags: ['イラスト'],
    publishedAt: '2026-5-2',
    dateLabel: '未定',
    sortDate: '2025-12-31',
    recommendedRank: 100,
    coverImagePosition: 'center 10%',
    media: { images: [asset('ILLUST/ILLUST_EMA/raf.webp')] },
    sections: templates.illustration,
  }),
  createWork({
    id: 'illust-leur',
    title: 'ルウル',
    subtitle: '次世代バーチャルシンガー「ルウル」の二次創作',
    description: '次世代バーチャルシンガー「ルウル」の二次創作イラスト。',
    tags: ['イラスト'],
    publishedAt: '2025-11-12',
    dateLabel: '2025/11/12',
    sortDate: '2025-11-12',
    recommendedRank: 120,
    coverImagePosition: 'center 40%',
    media: { images: [asset('ILLUST/ILLUST_LEUR/leur.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: '資料をたくさん見てたくさん吟味するようになってルルネ同様に絵の全体的な完成度が上がりました！',
      },
    ],
  }),
  createWork({
    id: 'illust-rua-1',
    title: '水面ルア 1',
    subtitle: 'デジクリ合同誌に提出した作品',
    description: '合同誌に提出した「水面ルア」のヴィネット風イラスト。',
    tags: ['イラスト'],
    publishedAt: '2025-5-31',
    dateLabel: '2025大宮祭',
    sortDate: '2025-5-31',
    recommendedRank: 150,
    coverImagePosition: 'center 10%',
    media: { images: [asset('ILLUST/ILLUST_RUA_1/rua.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: 'ヴィネット風のイラストに挑戦して、エフェクトや攻撃などかっこよく描けるように頑張りました。おへそも頑張りました。',
      },
    ],
  }),
  createWork({
    id: 'illust-rua-2',
    title: '水面ルア 2',
    subtitle: 'デジクリ合同誌に提出した作品',
    description: '合同誌に提出した「水面ルア」の振り「返る」をテーマにしたイラスト。',
    tags: ['イラスト'],
    publishedAt: '2025-11-31',
    dateLabel: '2025芝浦祭',
    sortDate: '2025-11-31',
    recommendedRank: 160,
    coverImagePosition: 'center 40%',
    media: { images: [asset('ILLUST/ILLUST_RUA_2/rua.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: '顔は良い！けど！振り向いてる首回りが何かおかしい！のが反省点です。\nちょっとまた絵柄を迷走した絵でもあるかもしれません。線の太さとかもちょっと太めに描いたはず...',
      },
    ],
  }),
  createWork({
    id: 'illust-rurune',
    title: 'ルルネ',
    subtitle: 'Paryi先生のオリジナルキャラクター「ルルネ」の二次創作',
    description: 'Paryi先生のオリジナルキャラクター「ルルネ」の二次創作イラスト。',
    tags: ['イラスト'],
    publishedAt: '2025-11-10',
    dateLabel: '2025/11/10',
    sortDate: '2025-11-10',
    recommendedRank: 210,
    coverImagePosition: 'center 40%',
    media: { images: [asset('ILLUST/ILLUST_RURUNE/rurune.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: 'VRChatでのシチュエーションを創造し、具体的な背景などを取り入れました。資料を今まで以上に集めて参考にし意識して絵を描くようになり、この時期から個人的に大きく成長したと感じる作品です。\n\nルルネちゃんが可愛いのも要因ですね。',
      },
    ],
  }),
  createWork({
    id: 'illust-4bansen',
    title: 'Ⅳ番線ちゃん',
    subtitle: 'r-906さん作「Catchy !? / r-906 feat. Ci flower」の二次創作イラスト。',
    description: 'r-906さん作「Catchy !? / r-906 feat. Ci flower」の二次創作イラスト。',
    tags: ['イラスト'],
    publishedAt: '2026-3-25',
    dateLabel: '2026/3/25',
    sortDate: '2026-3-25',
    recommendedRank: 155,
    coverImagePosition: 'center 20%',
    media: { images: [asset('ILLUST/ILLUST_4BANSEN/yonbansen.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: '限られた色の中でⅣ番線ちゃんの可愛さや無邪気そうな所などを表現できるように資料やラフを繰り返して完成まで頑張りました。とてもかわいく描けて満足です。',
      },
    ],
  }),
  createWork({
    id: 'illust-the-hole',
    title: 'THE HOLE',
    subtitle: 'r-906さん作「the Hole / 足立レイ」の二次創作イラスト。',
    description: 'r-906さん作 「the Hole / 足立レイ」の二次創作イラスト。',
    tags: ['イラスト'],
    publishedAt: '2026-4-27',
    dateLabel: '2026/4/27',
    sortDate: '2026-4-27',
    recommendedRank: 186,
    coverImagePosition: 'center 40%',
    media: { images: [asset('ILLUST/ILLUST_THEHOLE/thehole.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: '直近では構図集など色々参考にして普段イラストを描いているのですが、今回は構図などを一から自分でラフなどを作成しながら完成させました。サングラスを中心にミクとレイを描けて満足です。',
      },
    ],
  }),
  createWork({
    id: 'illust-tyoko',
    title: 'ちょこ',
    subtitle: 'ラストピリオド10周年記念の二次創作イラスト。',
    description: 'ラストピリオド10周年記念の二次創作イラスト。',
    tags: [workTags[1]],
    publishedAt: '2026-05-12',
    dateLabel: '2026/5/12',
    sortDate: '2026-05-12',
    recommendedRank: 55,
    coverImagePosition: 'center 40%',
    media: { images: [asset('ILLUST/ILLUST_TYOKO/tyoko.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: 'ラスピリ10周年おめでとう！！\nお顔が可愛く描けて満足',
      },
    ],
  }),
  createWork({
    id: 'illust-natsu-bando',
    title: 'ナツ(バンド)',
    subtitle: 'ブルーアーカイブ放課後スイーツ部 ナツ(バンド)の二次創作イラスト。',
    description: 'ブルーアーカイブ放課後スイーツ部 ナツ(バンド)の二次創作イラスト。',
    tags: [workTags[1]],
    publishedAt: '2026-05-15',
    dateLabel: '2026/5/15',
    sortDate: '2026-05-15',
    recommendedRank: 189,
    coverImagePosition: 'center 10%',
    media: { images: [asset('ILLUST/ILLUST_NATSU(BANDO)/natsu-bando.webp')] },
    sections: [
      {
        heading: 'メモ',
        body: 'ルルネ辺りからの絵柄がまとまってきていると感じます。5時間半で完成した作品でもあり自身でも驚いてます。\n\nカラーラフを書き込んでイメージをつけてから線画に進むと完成度も上がることが分かり自分には合っていそうとより感じます。',
      },
    ],
  }),
  createWork({
    id: 'suisaiga-fishing-minigame',
    title: '水彩画は水底に沈む',
    subtitle: '釣りミニゲーム周りを担当しました。',
    description: '釣りミニゲーム周りを担当しました。',
    tags: ['PG'],
    publishedAt: '2026-05-17',
    dateLabel: '2026/5/17',
    sortDate: '2026-05-17',
    recommendedRank: 190,
    coverImagePosition: 'center',
    links: [{ label: 'Steamへ', href: 'https://store.steampowered.com/app/4389120/_/' }],
    media: { images: [asset('PG/PG_SUISAIGA/suisaiga_00.webp')] },
    sections: [
      {
        heading: '概要',
        body: 'ポイント＆クリックアドベンチャーゲーム『水彩画は水底に沈む』のミニゲームの組み込み、プログラムを担当しました。\n\n本編も多くの良いイラストと音楽、ストーリーなどあるのでまずはぜひ遊んでみてください。',
      },
      {
        heading: '担当箇所',
        body: '釣りミニゲーム',
      },
      {
        heading: '使用技術',
        body: 'UniTask',
      },
      {
        heading: 'メモ',
        body: '演出周りや図鑑など試行錯誤してます。3Dモデルを使ったちょっと面白い空間でありつつ世界観が保たれるように、UIや演出なども意識してます。ぜひ！遊んでみてください。',
      },
    ],
  }),
]

export const featuredWorks = [...works]
  .sort((workA, workB) => workB.recommendedRank - workA.recommendedRank)
  .slice(0, 3)
