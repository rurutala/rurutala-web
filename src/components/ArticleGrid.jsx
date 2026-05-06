import { AppLink } from './AppLink'
import { formatDate } from '../utils/date'

export function ArticleGrid({ articles: gridArticles, navigate }) {
  return (
    <div className={`work-grid article-grid ${gridArticles.length === 1 ? 'article-grid--single' : ''}`}>
      {gridArticles.map((article) => (
        <article className="work-card article-card" key={article.id}>
          <AppLink
            className="work-card__media"
            href={`/articles/${article.id}`}
            navigate={navigate}
          >
            <img src={article.coverImage} alt="" />
          </AppLink>
          <div className="work-card__body">
            <div className="work-card__meta">
              <span>{formatDate(article.publishedAt)}</span>
              <span>{article.author}</span>
            </div>
            <h3>
              <AppLink href={`/articles/${article.id}`} navigate={navigate}>
                {article.title}
              </AppLink>
            </h3>
            <p>{article.excerpt}</p>
            <div className="work-tags" aria-label={`${article.title} のタグ`}>
              {article.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
