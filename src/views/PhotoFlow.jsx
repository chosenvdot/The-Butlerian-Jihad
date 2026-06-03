import { useEffect, useRef, useState } from 'react'
import { VBDATA } from '../data'
import PhotoFrame from '../components/PhotoFrame'
import {
  frameDate,
  frameFullFallbackSrc,
  frameFullSrc,
  frameIndex,
  frameMeta,
  frameSortDate,
  frameTitle,
  usePhotoLibrary,
} from '../photos'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5
const CLICK_ZOOM = 2

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeZoom(value) {
  return clamp(Math.round(value * 10) / 10, MIN_ZOOM, MAX_ZOOM)
}

function zeroPan() {
  return { x: 0, y: 0 }
}

function samePan(a, b) {
  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5
}

function sameSize(a, b) {
  return Boolean(a && b) && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5
}

export default function PhotoFlow({ D = VBDATA }) {
  const [viewer, setViewer] = useState(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState(zeroPan)
  const [drag, setDrag] = useState(null)
  const [fitSize, setFitSize] = useState(null)
  const [fullSourceFailed, setFullSourceFailed] = useState(false)
  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const zoomRef = useRef(MIN_ZOOM)
  const didDragRef = useRef(false)
  const library = usePhotoLibrary(D)
  const recents = library.albums
    .flatMap(album => album.photos || [])
    .sort((x, y) => frameSortDate(y).localeCompare(frameSortDate(x)))

  function resetImageView() {
    zoomRef.current = MIN_ZOOM
    setZoom(MIN_ZOOM)
    setPan(zeroPan())
    setDrag(null)
    setFitSize(null)
    setFullSourceFailed(false)
    didDragRef.current = false
  }

  function openViewer(photo) {
    setViewer(photo)
    resetImageView()
  }

  function closeViewer() {
    setViewer(null)
    resetImageView()
  }

  function lightboxBounds() {
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const padding = mobile ? 18 : 28
    const width = Math.max(1, window.innerWidth - padding * 2)
    const height = Math.max(1, window.innerHeight - padding * 2)
    return {
      width: Math.min(width, window.innerWidth * 0.96, 1400),
      height: Math.min(height, window.innerHeight * (mobile ? 0.88 : 0.92)),
    }
  }

  function measureFitSize() {
    const image = imageRef.current
    if (!image || !image.naturalWidth || !image.naturalHeight) return null

    const bounds = lightboxBounds()
    const containScale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight, 1)
    return {
      width: image.naturalWidth * containScale,
      height: image.naturalHeight * containScale,
    }
  }

  function updateFitSize() {
    const nextFitSize = measureFitSize()
    if (!nextFitSize) return false

    setFitSize(current => sameSize(current, nextFitSize) ? current : nextFitSize)
    setPan(current => {
      const nextPan = clampPan(current, zoom, nextFitSize)
      return samePan(current, nextPan) ? current : nextPan
    })
    return true
  }

  function clampPan(nextPan, nextZoom = zoom, size = fitSize) {
    const stage = stageRef.current
    const image = imageRef.current

    if (!stage || !image) return zeroPan()

    const baseWidth = size?.width || image.offsetWidth || stage.clientWidth
    const baseHeight = size?.height || image.offsetHeight || stage.clientHeight
    if (!baseWidth || !baseHeight) return zeroPan()

    const stageWidth = stage.clientWidth || baseWidth
    const stageHeight = stage.clientHeight || baseHeight
    const maxX = Math.max(0, (baseWidth * nextZoom - stageWidth) / 2)
    const maxY = Math.max(0, (baseHeight * nextZoom - stageHeight) / 2)

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    }
  }

  function canPan(nextZoom = zoom, size = fitSize) {
    const stage = stageRef.current
    const image = imageRef.current
    if (!stage || !image) return false

    const baseWidth = size?.width || image.offsetWidth
    const baseHeight = size?.height || image.offsetHeight
    return baseWidth * nextZoom > stage.clientWidth || baseHeight * nextZoom > stage.clientHeight
  }

  function setZoomLevel(nextZoom, targetPan) {
    const currentZoom = zoomRef.current
    const requestedZoom = typeof nextZoom === 'function' ? nextZoom(currentZoom) : nextZoom
    const boundedZoom = normalizeZoom(requestedZoom)

    zoomRef.current = boundedZoom
    setZoom(boundedZoom)
    setPan(current => clampPan(targetPan || current, boundedZoom))
  }

  function zoomIn() {
    setZoomLevel(currentZoom => currentZoom + ZOOM_STEP)
  }

  function zoomOut() {
    setZoomLevel(currentZoom => currentZoom - ZOOM_STEP)
  }

  function resetZoom() {
    setZoomLevel(MIN_ZOOM, zeroPan())
  }

  function handleImageClick(event) {
    event.stopPropagation()

    if (didDragRef.current) {
      didDragRef.current = false
      return
    }

    if (zoom > MIN_ZOOM) {
      resetZoom()
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const targetPan = {
      x: -(event.clientX - rect.left - rect.width / 2) * CLICK_ZOOM,
      y: -(event.clientY - rect.top - rect.height / 2) * CLICK_ZOOM,
    }

    setZoomLevel(CLICK_ZOOM, targetPan)
  }

  function handlePointerDown(event) {
    if (!canPan() || (event.pointerType === 'mouse' && event.button !== 0)) return

    event.stopPropagation()
    didDragRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    })
  }

  function handlePointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return

    event.preventDefault()

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) didDragRef.current = true

    setPan(clampPan({
      x: drag.panX + deltaX,
      y: drag.panY + deltaY,
    }))
  }

  function handlePointerEnd(event) {
    if (!drag || event.pointerId !== drag.pointerId) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    setDrag(null)
  }

  function handleWheel(event) {
    event.preventDefault()
    event.stopPropagation()

    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  useEffect(() => {
    if (!viewer) return undefined

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeViewer()
        return
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomIn()
        return
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        zoomOut()
        return
      }

      if (event.key === '0') {
        event.preventDefault()
        resetZoom()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [viewer, zoom])

  useEffect(() => {
    if (!viewer) return undefined

    let retryTimer = null
    let attempts = 0

    function syncFitSize() {
      if (updateFitSize()) return
      attempts += 1
      if (attempts > 80) return
      retryTimer = window.setTimeout(syncFitSize, 50)
    }

    function handleResize() {
      const nextFitSize = measureFitSize()
      if (!nextFitSize) return
      setFitSize(current => sameSize(current, nextFitSize) ? current : nextFitSize)
      setPan(current => {
        const nextPan = clampPan(current, zoom, nextFitSize)
        return samePan(current, nextPan) ? current : nextPan
      })
    }

    syncFitSize()
    window.addEventListener('resize', handleResize)

    return () => {
      if (retryTimer) window.clearTimeout(retryTimer)
      window.removeEventListener('resize', handleResize)
    }
  }, [viewer, zoom])

  function renderLightbox() {
    if (!viewer) return null
    const fallbackSrc = frameFullFallbackSrc(viewer)
    const src = fullSourceFailed ? fallbackSrc : frameFullSrc(viewer)
    const date = frameDate(viewer)
    const detail = frameMeta(viewer)
    const zoomed = zoom > MIN_ZOOM
    const pannable = canPan()
    const stageClassName = [
      'vb-lightbox-stage',
      pannable ? 'vb-lightbox-pannable' : '',
      zoomed ? 'vb-lightbox-zoomed' : '',
      drag ? 'vb-lightbox-dragging' : '',
      !fitSize ? 'vb-lightbox-loading' : '',
    ].filter(Boolean).join(' ')

    return (
      <div className="vb-lightbox" role="dialog" aria-modal="true" aria-label="Expanded photo" onClick={closeViewer}>
        <button className="vb-lightbox-close" type="button" aria-label="Close expanded photo" onClick={closeViewer}>x</button>
        <div className="vb-lightbox-toolbar" aria-label="Photo zoom controls" onClick={event => event.stopPropagation()}>
          <button className="vb-lightbox-tool" type="button" aria-label="Zoom out" disabled={zoom <= MIN_ZOOM} onClick={zoomOut}>-</button>
          <span className="vb-lightbox-zoom-readout" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button className="vb-lightbox-tool" type="button" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={zoomIn}>+</button>
          <button className="vb-lightbox-tool vb-lightbox-reset" type="button" aria-label="Reset zoom" disabled={!zoomed} onClick={resetZoom}>1:1</button>
        </div>
        <div
          ref={stageRef}
          className={stageClassName}
          onClick={event => {
            if (event.target === event.currentTarget) closeViewer()
            else event.stopPropagation()
          }}
          onWheel={handleWheel}
          style={{
            '--vb-lightbox-zoom': zoom,
            '--vb-lightbox-pan-x': `${pan.x}px`,
            '--vb-lightbox-pan-y': `${pan.y}px`,
            '--vb-lightbox-frame-width': fitSize ? `${fitSize.width}px` : undefined,
            '--vb-lightbox-frame-height': fitSize ? `${fitSize.height}px` : undefined,
            '--vb-lightbox-render-width': fitSize ? `${fitSize.width * zoom}px` : undefined,
            '--vb-lightbox-render-height': fitSize ? `${fitSize.height * zoom}px` : undefined,
          }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={frameTitle(viewer)}
            draggable="false"
            onLoad={updateFitSize}
            onError={() => {
              if (!fullSourceFailed && fallbackSrc) {
                setFitSize(null)
                setFullSourceFailed(true)
              }
            }}
            onClick={handleImageClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          />
          {(date || detail) && (
            <div className="vb-lightbox-meta">
              {date && <span>{date}</span>}
              {detail && <span>{detail}</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="vb-photo-feed">
        {recents.map((p, i) => (
          <button key={p.id || i} type="button" onClick={() => openViewer(p)} className="vb-photo vb-photo-button vb-rise" style={{ aspectRatio: '4/3', animationDelay: (Math.min(i, 24) * 0.022) + 's' }}>
            <PhotoFrame
              frame={p}
              label=""
              meta={frameMeta(p)}
              idx={frameIndex(p)}
              width={420}
              height={315}
              fit="cover"
              gravity="auto"
              quality={76}
              ratio={4 / 3}
              sizes="(max-width: 760px) 16.6vw, 190px"
              widths={[240, 420, 640]}
            />
          </button>
        ))}
      </div>
      {renderLightbox()}
    </div>
  )
}
