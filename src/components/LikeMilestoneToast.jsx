import { useEffect, useRef, useState } from 'react'
import { useLikes } from '../hooks/useLikes'

export function LikeMilestoneToast() {
  const { localWorkLikeTotal } = useLikes()
  const previousTotal = useRef(localWorkLikeTotal)
  const [milestone, setMilestone] = useState(null)

  useEffect(() => {
    if (
      localWorkLikeTotal > previousTotal.current &&
      localWorkLikeTotal > 0 &&
      localWorkLikeTotal % 5 === 0
    ) {
      setMilestone(localWorkLikeTotal)
    }

    previousTotal.current = localWorkLikeTotal
  }, [localWorkLikeTotal])

  useEffect(() => {
    if (!milestone) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setMilestone(null)
    }, 2800)

    return () => window.clearTimeout(timerId)
  }, [milestone])

  if (!milestone) {
    return null
  }

  return (
    <div className="like-milestone-toast" role="status" aria-live="polite">
      いいね{milestone}件ありがとう
    </div>
  )
}
