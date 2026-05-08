import heroImg from '../assets/hero.webp'

export const articleTags = ['Info']

export const articles = [
  {
    id: 'personal-site-open',
    title: '個人サイトを開設したよ',
    excerpt: '~かっちょいいおもしろサイト作ろう~',
    tags: ['Info'],
    author: 'るるたぁ',
    publishedAt: '2026-05-08',
    recommendedRank: 10,
    coverImage: '/profile.webp',
    sections: [
      {
        heading: 'Hello World',
        body: [
          'みなさん、始めまして るるたぁ と申します。',
          '先日、ドメインを取得してノリと勢いのままに個人サイトを爆誕しました。',
          'やったね。',
          'ということでお知らせ兼記事になります。',
          '',
          'このサイトでは私の作品であったり適当な知見や記事を作成していきます。それはUnityだったりお絵描きだったり色々です。時には趣味とかの話もあるかも。',
          'といっても今回は特に書くことはないんですけどね。',
          '強いて言えば直近、Github Copilot君の学生向けのモデルがよわよわになってしまったのでCodexを使ってみようということでこのサイトはCodex君を叩きながらReactとか触れてみてます。おもしろいですね。',
          'UnityとかC#まわりでCodexをこれから使うのでそれについての知見はどこかで書き記すかもしれません。',
          '',
          'このサイトは今後も色々更新予定です。',
          '小ネタも仕込みたいと思います。',
          'では今後もぜひよろしくお願いしますね。',
          '','','','','',
        ].join('\n'),
        note: [
          '曲を流すと背景がオーディオスペクトラムになっていたりしますよ。',
          '他も探してみてね',
        ].join('\n'),
      },
    ],
  },
]

export const featuredArticles = [...articles]
  .sort((articleA, articleB) => articleB.recommendedRank - articleA.recommendedRank)
  .slice(0, 3)
