export function formatDate(dateString) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function formatWorkDate(work) {
  return work.dateLabel || formatDate(work.publishedAt)
}

export function getWorkSortDate(work) {
  return new Date(work.sortDate || work.publishedAt)
}
