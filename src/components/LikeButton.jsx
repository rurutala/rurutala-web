import { useLikes } from '../hooks/useLikes'

export function LikeButton({ className = '', itemKey, label }) {
  const { getLikeCount, isLiked, isPending, toggleLike } = useLikes()
  const liked = isLiked(itemKey)
  const count = getLikeCount(itemKey)
  const pending = isPending(itemKey)

  return (
    <button
      aria-label={`${label} like count ${count}`}
      aria-pressed={liked}
      className={`like-button ${liked ? 'is-liked' : ''} ${className}`.trim()}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleLike(itemKey)
      }}
      title={liked ? 'Liked' : 'Like'}
      type="button"
    >
      <span className="like-button__heart" aria-hidden="true">
        {liked ? '♥' : '♡'}
      </span>
      <span className="like-button__count">{count}</span>
    </button>
  )
}
