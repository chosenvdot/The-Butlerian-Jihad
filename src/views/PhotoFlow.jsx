import { useState } from 'react'
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

export default function PhotoFlow({ D = VBDATA }) {
  const [viewer, setViewer] = useState(null)
  const library = usePhotoLibrary(D)
  const recents = library.albums
    .flatMap(album => album.photos || [])
    .sort((x, y) => frameSortDate(y).localeCompare(frameSortDate(x)))

  const Lightbox = () => {
    if (!viewer) return null
    const src = frameFullSrc(viewer)
    const date = frameDate(viewer)
    const detail = frameMeta(viewer)

    return (
      <div className="vb-lightbox" role="dialog" aria-modal="true" aria-label="Expanded photo" onClick={() => setViewer(null)}>
        <button className="vb-lightbox-close" type="button" aria-label="Close expanded photo" onClick={() => setViewer(null)}>x</button>
        <div className="vb-lightbox-stage" onClick={event => event.stopPropagation()}>
          <img src={src} alt={frameTitle(viewer)} />
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
          <button key={p.id || i} type="button" onClick={() => setViewer(p)} className="vb-photo vb-photo-button vb-rise" style={{ aspectRatio: '4/3', animationDelay: (Math.min(i, 24) * 0.022) + 's' }}>
            <PhotoFrame frame={p} label="" meta={frameMeta(p)} idx={frameIndex(p)} width={720} />
          </button>
        ))}
      </div>
      <Lightbox />
    </div>
  )
}
