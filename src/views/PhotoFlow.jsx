import { useEffect, useRef, useState } from 'react'
import { VBDATA } from '../data'
import PhotoFrame from '../components/PhotoFrame'
import {
  frameDate,
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

export default function PhotoFlow({ D = VBDATA }) {
  const [viewer, setViewer] = useState(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState(zeroPan)
  const [drag, setDrag] = useState(null)
  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const didDragRef = useRef(false)
  const library = usePhotoLibrary(D)
  const recents = library.albums
    .flatMap(album => album.photos || [])
    .sort((x, y) => frameSortDate(y).localeCompare(frameSortDate(x)))

  function resetImageView() {
    setZoom(MIN_ZOOM)
    setPan(zeroPan())
    setDrag(null)
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

  function clampPan(nextPan, nextZoom = zoom) {
    const stage = stageRef.current
    const image = imageRef.current

    if (!stage || !image || nextZoom <= MIN_ZOOM) return zeroPan()

    const maxX = Math.max(0, ((image.offsetWidth || stage.clientWidth) * nextZoom - stage.clientWidth) / 2)
    const maxY = Math.max(0, ((image.offsetHeight || stage.clientHeight) * nextZoom - stage.clientHeight) / 2)

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    }
  }

  function setZoomLevel(nextZoom, targetPan) {
    const boundedZoom = normalizeZoom(nextZoom)

    setZoom(boundedZoom)
    setPan(current => clampPan(targetPan || current, boundedZoom))
  }

  function zoomIn() {
    setZoomLevel(zoom + ZOOM_STEP)
  }

  function zoomOut() {
    setZoomLevel(zoom - ZOOM_STEP)
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
    if (zoom <= MIN_ZOOM || (event.pointerType === 'mouse' && event.button !== 0)) return

    event.preventDefault()
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

  const Lightbox = () => {
    if (!viewer) return null
    const src = frameFullSrc(viewer)
    const date = frameDate(viewer)
    const detail = frameMeta(viewer)
    const zoomed = zoom > MIN_ZOOM
    const stageClassName = [
      'vb-lightbox-stage',
      zoomed ? 'vb-lightbox-zoomed' : '',
      drag ? 'vb-lightbox-dragging' : '',
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
          onClick={event => event.stopPropagation()}
          onWheel={handleWheel}
          style={{
            '--vb-lightbox-zoom': zoom,
            '--vb-lightbox-pan-x': `${pan.x}px`,
            '--vb-lightbox-pan-y': `${pan.y}px`,
          }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={frameTitle(viewer)}
            draggable="false"
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
      <Lightbox />
    </div>
  )
}
