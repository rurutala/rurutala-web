import { useMemo, useState } from 'react'
import { ArticleGrid } from '../components/ArticleGrid'
import { sortOptions } from '../constants/site'
import { articleTags, articles } from '../data/articles'
import { useLikes } from '../hooks/useLikes'

export function ArticlesPage({ navigate }) {
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const { getLikeCount } = useLikes()

  const visibleArticles = useMemo(() => {
    const filteredArticles =
      selectedTag === 'all'
        ? articles
        : articles.filter((article) => article.tags.includes(selectedTag))

    return [...filteredArticles].sort((articleA, articleB) => {
      if (sortBy === 'newest') {
        return new Date(articleB.publishedAt) - new Date(articleA.publishedAt)
      }

      if (sortBy === 'oldest') {
        return new Date(articleA.publishedAt) - new Date(articleB.publishedAt)
      }

      if (sortBy === 'likes') {
        return (
          getLikeCount(`article:${articleB.id}`) - getLikeCount(`article:${articleA.id}`) ||
          articleB.recommendedRank - articleA.recommendedRank
        )
      }

      return articleB.recommendedRank - articleA.recommendedRank
    })
  }, [getLikeCount, selectedTag, sortBy])

  return (
    <section className="works-page" aria-labelledby="articles-page-title">
      <div className="page-heading">
        <p>Articles</p>
        <h1 id="articles-page-title">記事一覧</h1>
      </div>

      <div className="works-toolbar" aria-label="記事の絞り込みと並び替え">
        <div className="tag-filter" aria-label="タグで検索">
          <button
            className={selectedTag === 'all' ? 'is-selected' : ''}
            type="button"
            onClick={() => setSelectedTag('all')}
          >
            All
          </button>
          {articleTags.map((tag) => (
            <button
              className={selectedTag === tag ? 'is-selected' : ''}
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <label className="sort-control">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="result-count">{visibleArticles.length} articles</p>
      <ArticleGrid articles={visibleArticles} navigate={navigate} />
    </section>
  )
}
