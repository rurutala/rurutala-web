import { AppLink } from '../components/AppLink'
import { WorkMedia } from '../components/media/WorkMedia'
import { formatWorkDate } from '../utils/date'

export function WorkDetailPage({ work, navigate }) {
  if (!work) {
    return (
      <section className="not-found" aria-labelledby="not-found-title">
        <p>Works</p>
        <h1 id="not-found-title">作品が見つかりません</h1>
        <AppLink className="button button--primary" href="/works" navigate={navigate}>
          作品一覧へ戻る
        </AppLink>
      </section>
    )
  }

  return (
    <article className="work-detail">
      <AppLink className="back-link" href="/works" navigate={navigate}>
        Works に戻る
      </AppLink>

      <header className="work-detail__header">
        <div>
          <p className="work-detail__eyebrow">{work.tags.join(' / ')}</p>
          <h1>{work.title}</h1>
          <p className="work-detail__meta-line">
            <span>Published {formatWorkDate(work)}</span>
            <span>Author {work.author}</span>
          </p>
          <p>{work.subtitle}</p>
        </div>
      </header>

      {(work.media?.images?.length ?? 0) === 0 && (
        <div className="work-detail__visual">
          <img
            src={work.coverImage}
            alt=""
            style={{ objectPosition: work.coverImagePosition }}
          />
        </div>
      )}

      <WorkMedia enableImageModal={work.tags.includes('イラスト')} media={work.media} title={work.title} />

      <div className="work-detail__content">
        <aside className="work-detail__side">
          <div className="work-tags" aria-label={`${work.title} のタグ`}>
            {work.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {work.links.length > 0 && (
            <div className="work-links">
              {work.links.map((link) => (
                <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </aside>

        <div className="work-detail__sections">
          {work.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
