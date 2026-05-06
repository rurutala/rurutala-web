import { AppLink } from './AppLink'
import { formatWorkDate } from '../utils/date'

export function WorkGrid({ works: gridWorks, navigate }) {
  return (
    <div className="work-grid">
      {gridWorks.map((work) => (
        <article className="work-card" key={work.id}>
          <AppLink className="work-card__media" href={`/works/${work.id}`} navigate={navigate}>
            <img
              src={work.coverImage}
              alt=""
              style={{ objectPosition: work.coverImagePosition }}
            />
          </AppLink>
          <div className="work-card__body">
            <div className="work-card__meta">
              <span>{formatWorkDate(work)}</span>
              <span>{work.author}</span>
            </div>
            <h3>
              <AppLink href={`/works/${work.id}`} navigate={navigate}>
                {work.title}
              </AppLink>
            </h3>
            <p>{work.description}</p>
            <div className="work-tags" aria-label={`${work.title} のタグ`}>
              {work.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
