import heroImg from '../assets/hero.webp'

export const articleTags = ['Info']

export const articles = [
  {
    id: 'coming-soon',
    title: 'Coming soon',
    excerpt: '記事は準備中です。',
    tags: ['Info'],
    author: 'るるたぁ',
    publishedAt: '2026-05-06',
    recommendedRank: 1,
    coverImage: heroImg,
    sections: [
      {
        heading: 'Coming soon',
        body: '記事は準備中です。',
      },
    ],
  },
]

export const featuredArticles = [...articles]
  .sort((articleA, articleB) => articleB.recommendedRank - articleA.recommendedRank)
  .slice(0, 3)
