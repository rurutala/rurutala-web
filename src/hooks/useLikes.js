import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const LIKED_STORAGE_KEY = 'rurutala-liked-items'

const LikesContext = createContext(null)

function readLikedItems() {
  if (typeof window === 'undefined') {
    return new Set()
  }

  try {
    const storedItems = JSON.parse(window.localStorage.getItem(LIKED_STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(storedItems) ? storedItems : [])
  } catch {
    return new Set()
  }
}

function writeLikedItems(items) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...items]))
  } catch {
    // Ignore storage failures; the in-memory React state still updates for this session.
  }
}

export function LikesProvider({ children }) {
  const [counts, setCounts] = useState({})
  const [likedItems, setLikedItems] = useState(() => readLikedItems())
  const [pendingItems, setPendingItems] = useState(() => new Set())

  useEffect(() => {
    let isActive = true

    async function loadLikeCounts() {
      try {
        const response = await fetch('/api/likes', {
          headers: { Accept: 'application/json' },
        })
        const contentType = response.headers.get('content-type') ?? ''

        if (!response.ok || !contentType.includes('application/json')) {
          return
        }

        const data = await response.json()
        if (isActive && data?.counts) {
          setCounts(data.counts)
        }
      } catch {
        // The Vite dev server does not serve Vercel Functions; local likes still work.
      }
    }

    loadLikeCounts()

    return () => {
      isActive = false
    }
  }, [])

  const isLiked = useCallback((itemKey) => likedItems.has(itemKey), [likedItems])
  const isPending = useCallback((itemKey) => pendingItems.has(itemKey), [pendingItems])
  const getLikeCount = useCallback((itemKey) => counts[itemKey] ?? 0, [counts])

  const toggleLike = useCallback(
    async (itemKey) => {
      if (pendingItems.has(itemKey)) {
        return
      }

      const nextLiked = !likedItems.has(itemKey)
      const delta = nextLiked ? 1 : -1

      setPendingItems((currentItems) => new Set(currentItems).add(itemKey))
      setLikedItems((currentItems) => {
        const nextItems = new Set(currentItems)

        if (nextLiked) {
          nextItems.add(itemKey)
        } else {
          nextItems.delete(itemKey)
        }

        writeLikedItems(nextItems)
        return nextItems
      })
      setCounts((currentCounts) => ({
        ...currentCounts,
        [itemKey]: Math.max(0, (currentCounts[itemKey] ?? 0) + delta),
      }))

      try {
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemKey, delta }),
        })
        const contentType = response.headers.get('content-type') ?? ''

        if (!response.ok || !contentType.includes('application/json')) {
          return
        }

        const data = await response.json()
        if (Number.isFinite(data?.count)) {
          setCounts((currentCounts) => ({
            ...currentCounts,
            [itemKey]: data.count,
          }))
        }
      } catch {
        // Keep the optimistic local state when the shared counter is unavailable.
      } finally {
        setPendingItems((currentItems) => {
          const nextItems = new Set(currentItems)
          nextItems.delete(itemKey)
          return nextItems
        })
      }
    },
    [likedItems, pendingItems],
  )

  const value = useMemo(
    () => ({
      counts,
      getLikeCount,
      isLiked,
      isPending,
      toggleLike,
    }),
    [counts, getLikeCount, isLiked, isPending, toggleLike],
  )

  return createElement(LikesContext.Provider, { value }, children)
}

export function useLikes() {
  const context = useContext(LikesContext)

  if (!context) {
    throw new Error('useLikes must be used within LikesProvider')
  }

  return context
}
