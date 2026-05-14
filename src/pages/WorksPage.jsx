import { useMemo, useState } from 'react'
import { WorkGrid } from '../components/WorkGrid'
import { sortOptions } from '../constants/site'
import { works, workTags } from '../data/works'
import { useLikes } from '../hooks/useLikes'
import { getWorkSortDate } from '../utils/date'

export function WorksPage({ navigate }) {
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const { getLikeCount } = useLikes()

  const visibleWorks = useMemo(() => {
    const filteredWorks =
      selectedTag === 'all'
        ? works
        : works.filter((work) => work.tags.includes(selectedTag))

    return [...filteredWorks].sort((workA, workB) => {
      if (sortBy === 'newest') {
        return getWorkSortDate(workB) - getWorkSortDate(workA)
      }

      if (sortBy === 'oldest') {
        return getWorkSortDate(workA) - getWorkSortDate(workB)
      }

      if (sortBy === 'likes') {
        return (
          getLikeCount(`work:${workB.id}`) - getLikeCount(`work:${workA.id}`) ||
          workB.recommendedRank - workA.recommendedRank
        )
      }

      return workB.recommendedRank - workA.recommendedRank
    })
  }, [getLikeCount, selectedTag, sortBy])

  return (
    <section className="works-page" aria-labelledby="works-page-title">
      <div className="page-heading">
        <p>Works</p>
        <h1 id="works-page-title">作品一覧</h1>
      </div>

      <div className="works-toolbar" aria-label="作品の絞り込みと並び替え">
        <div className="tag-filter" aria-label="タグで検索">
          <button
            className={selectedTag === 'all' ? 'is-selected' : ''}
            type="button"
            onClick={() => setSelectedTag('all')}
          >
            All
          </button>
          {workTags.map((tag) => (
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

      <p className="result-count">{visibleWorks.length} works</p>
      <WorkGrid works={visibleWorks} navigate={navigate} />
    </section>
  )
}
