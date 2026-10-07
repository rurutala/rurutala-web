import { useEffect, useState } from 'react'
import { AppLink } from '../components/AppLink'
import { compareWorksByRecommendation, works } from '../data/works'
import './RecommendedOrderPage.css'

const initialOrder = [...works].sort(compareWorksByRecommendation).map((work) => work.id)
const worksById = new Map(works.map((work) => [work.id, work]))
const endpoint = '/__local/recommended-order'

export default function RecommendedOrderPage({ navigate }) {
  const [order, setOrder] = useState(initialOrder)
  const [savedOrder, setSavedOrder] = useState(initialOrder)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [draggedId, setDraggedId] = useState(null)
  const [dropId, setDropId] = useState(null)
  const hasChanges = order.some((id, index) => id !== savedOrder[index])
  const isBusy = isLoading || isSaving

  useEffect(() => {
    let isActive = true

    async function loadOrder() {
      try {
        const response = await fetch(endpoint)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error)
        }
        if (isActive) {
          setOrder(data.order)
          setSavedOrder(data.order)
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || '読み込めませんでした。')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadOrder()
    return () => { isActive = false }
  }, [])

  function moveWork(id, targetIndex) {
    if (isBusy || targetIndex < 0 || targetIndex >= order.length) {
      return
    }
    setOrder((currentOrder) => {
      const nextOrder = [...currentOrder]
      const currentIndex = nextOrder.indexOf(id)
      nextOrder.splice(currentIndex, 1)
      nextOrder.splice(targetIndex, 0, id)
      return nextOrder
    })
    setError('')
  }

  async function saveOrder() {
    setIsSaving(true)
    setError('')
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error)
      }
      setSavedOrder(data.order)
    } catch (saveError) {
      setError(saveError.message || '保存できませんでした。')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="recommended-editor" aria-labelledby="recommended-editor-title">
      <AppLink className="back-link" href="/works" navigate={navigate}>Works に戻る</AppLink>
      <div className="recommended-editor__header">
        <div>
          <h1 id="recommended-editor-title">おすすめ順</h1>
          <p role="status">{order.length}作品 / {isBusy ? '処理中' : hasChanges ? '未保存' : '保存済み'}</p>
        </div>
        <div className="recommended-editor__actions">
          <button
            type="button"
            disabled={isBusy || !hasChanges}
            onClick={() => { setOrder(savedOrder); setError('') }}
          >
            元に戻す
          </button>
          <button className="recommended-editor__save" type="button" disabled={isBusy || !hasChanges} onClick={saveOrder}>
            {isSaving ? '保存中' : '保存'}
          </button>
        </div>
      </div>
      {error && <p className="recommended-editor__error" role="alert">{error}</p>}
      <ol className="recommended-editor__list" aria-label="作者のおすすめ順">
        {order.map((id, index) => {
          const work = worksById.get(id)
          return (
            <li
              className={`recommended-editor__row${draggedId === id ? ' is-dragging' : ''}${dropId === id ? ' is-drop-target' : ''}`}
              key={id}
              data-work-id={id}
              draggable={!isBusy}
              onDragStart={(event) => {
                setDraggedId(id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', id)
              }}
              onDragOver={(event) => {
                if (draggedId && draggedId !== id) {
                  event.preventDefault()
                  setDropId(id)
                }
              }}
              onDrop={(event) => {
                event.preventDefault()
                if (draggedId) {
                  moveWork(draggedId, index)
                }
                setDraggedId(null)
                setDropId(null)
              }}
              onDragEnd={() => { setDraggedId(null); setDropId(null) }}
            >
              <span className="recommended-editor__handle" title="ドラッグして並べ替え" aria-hidden="true">⋮⋮</span>
              <span className="recommended-editor__number" aria-hidden="true">{index + 1}</span>
              <img src={work.coverImage} alt="" loading="lazy" style={{ objectPosition: work.coverImagePosition }} />
              <div className="recommended-editor__work">
                <span>{work.title}</span>
                <small>{work.tags.join(' / ')}</small>
              </div>
              <div className="recommended-editor__move">
                <button type="button" title="上へ" aria-label={`${work.title}を上へ`} disabled={isBusy || index === 0} onClick={() => moveWork(id, index - 1)}>↑</button>
                <button type="button" title="下へ" aria-label={`${work.title}を下へ`} disabled={isBusy || index === order.length - 1} onClick={() => moveWork(id, index + 1)}>↓</button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
