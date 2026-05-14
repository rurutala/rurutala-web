import { AppLink } from '../components/AppLink'
import { LikeButton } from '../components/LikeButton'
import { formatDate } from '../utils/date'

export function ArticleDetailPage({ article, navigate }) {
  if (!article) {
    return (
      <section className="not-found" aria-labelledby="article-not-found-title">
        <p>Articles</p>
        <h1 id="article-not-found-title">記事が見つかりません</h1>
        <AppLink className="button button--primary" href="/articles" navigate={navigate}>
          記事一覧へ戻る
        </AppLink>
      </section>
    )
  }

  return (
    <article className="work-detail article-detail">
      <AppLink className="back-link" href="/articles" navigate={navigate}>
        Articles に戻る
      </AppLink>

      <header className="work-detail__header">
        <div>
          <p className="work-detail__eyebrow">{article.tags.join(' / ')}</p>
          <h1 className="title-with-like title-with-like--detail">
            <span>{article.title}</span>
            <LikeButton itemKey={`article:${article.id}`} label={article.title} />
          </h1>
          <p className="work-detail__meta-line">
            <span>Published {formatDate(article.publishedAt)}</span>
            <span>Author {article.author}</span>
          </p>
          <p>{article.excerpt}</p>
        </div>
      </header>

      <div className="work-detail__visual">
        <img src={article.coverImage} alt="" />
      </div>

      <div className="work-detail__content">
        <aside className="work-detail__side">
          <div className="work-tags" aria-label={`${article.title} のタグ`}>
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </aside>

        <div className="work-detail__sections">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.note && <p className="article-detail__note">{section.note}</p>}
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
