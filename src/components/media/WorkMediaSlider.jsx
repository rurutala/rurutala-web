import { useEffect, useRef, useState } from 'react'

export function WorkMediaSlider({ enableImageModal = false, items, title }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalImage, setModalImage] = useState(null)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const dragDeltaX = useRef(0)
  const isDragging = useRef(false)
  const didDrag = useRef(false)

  useEffect(() => {
    if (!modalImage) {
      return undefined
    }

    const scrollY = window.scrollY
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalWidth = document.body.style.width
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setModalImage(null)
      }
    }

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.width = originalWidth
      document.removeEventListener('keydown', handleKeyDown)
      window.scrollTo(0, scrollY)
    }
  }, [modalImage])

  const activeItem = items[activeIndex]
  const hasMultipleItems = items.length > 1
  const showPreviousItem = () => {
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1))
  }
  const showNextItem = () => {
    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1))
  }

  const handlePointerDown = (event) => {
    if (!hasMultipleItems || event.target.closest('video, iframe, button')) {
      return
    }

    isDragging.current = true
    dragStartX.current = event.clientX
    dragStartY.current = event.clientY
    dragDeltaX.current = 0
    didDrag.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!isDragging.current) {
      return
    }

    dragDeltaX.current = event.clientX - dragStartX.current
    didDrag.current = Math.abs(dragDeltaX.current) > 8
  }

  const handlePointerUp = (event) => {
    if (!isDragging.current) {
      return
    }

    const dragDeltaY = event.clientY - dragStartY.current
    const dragDistance = Math.abs(dragDeltaX.current)
    const isHorizontalDrag = dragDistance > Math.abs(dragDeltaY)

    isDragging.current = false

    if (dragDistance < 56 || !isHorizontalDrag) {
      return
    }

    if (dragDeltaX.current > 0) {
      showPreviousItem()
      return
    }

    showNextItem()
  }

  return (
    <div className="work-media__slider">
      <div
        className="work-media__slide"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          isDragging.current = false
        }}
      >
        {activeItem.type === 'image' && (
          <a
            href={activeItem.src}
            target="_blank"
            rel="noreferrer"
            draggable="false"
            onClick={(event) => {
              if (didDrag.current) {
                event.preventDefault()
                return
              }

              if (!enableImageModal) {
                return
              }

              event.preventDefault()
              setModalImage(activeItem)
            }}
          >
            <img src={activeItem.src} alt={activeItem.title || `${title} ${activeIndex + 1}`} />
          </a>
        )}
        {activeItem.type === 'video' && (
          <video controls poster={activeItem.poster}>
            <source src={activeItem.src} type={activeItem.mimeType || 'video/mp4'} />
            お使いのブラウザは動画再生に対応していません。
          </video>
        )}
        {activeItem.type === 'embed' && (
          <iframe
            src={activeItem.src}
            title={activeItem.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
        {activeItem.caption && <p className="work-media__caption">{activeItem.caption}</p>}
        {hasMultipleItems && (
          <>
            <button
              className="work-media__nav work-media__nav--previous"
              type="button"
              aria-label="前のメディア"
              onClick={showPreviousItem}
            >
              ‹
            </button>
            <button
              className="work-media__nav work-media__nav--next"
              type="button"
              aria-label="次のメディア"
              onClick={showNextItem}
            >
              ›
            </button>
          </>
        )}
      </div>
      {hasMultipleItems && (
        <div className="work-media__thumbs" aria-label={`${title} のメディア選択`}>
          {items.map((item, index) => (
            <button
              className={index === activeIndex ? 'is-active' : ''}
              key={`${item.type}-${item.src}`}
              type="button"
              aria-label={`${index + 1}番目を表示`}
              onClick={() => setActiveIndex(index)}
            >
              {item.type === 'image' && <img src={item.src} alt="" />}
              {item.type !== 'image' && item.poster && <img src={item.poster} alt="" />}
              {item.type !== 'image' && !item.poster && (
                <span>{item.type === 'video' ? 'Video' : 'YouTube'}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {modalImage && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} の拡大画像`}
          onClick={() => setModalImage(null)}
        >
          <button
            className="image-modal__close"
            type="button"
            aria-label="画像を閉じる"
            onClick={() => setModalImage(null)}
          >
            ×
          </button>
          <img src={modalImage.src} alt={modalImage.title || title} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
