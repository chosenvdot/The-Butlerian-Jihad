import Ph from './Placeholder'
import { frameDate, frameIndex, frameMeta, frameSrc, frameSrcSet, frameTitle } from '../photos'

export default function PhotoFrame({
  frame,
  label,
  meta,
  idx,
  ticks = false,
  caption = true,
  width = 960,
  height,
  fit,
  gravity,
  quality,
  ratio,
  sizes = '(max-width: 760px) 50vw, 25vw',
  widths,
}) {
  const title = label !== undefined ? label : frameTitle(frame)
  const detail = meta || frameMeta(frame)
  const index = idx !== undefined ? idx : frameIndex(frame)
  const date = frameDate(frame)
  const transform = { h: height, fit, g: gravity, q: quality, ratio, widths }
  const src = frameSrc(frame, width, transform)

  if (!src) return <Ph label={title} meta={detail} idx={index} ticks={ticks} />

  return (
    <div className={`vb-frame-real${caption ? '' : ' vb-frame-no-caption'}`}>
      <img
        src={src}
        srcSet={frameSrcSet(frame, transform)}
        sizes={sizes}
        alt={title}
        loading="lazy"
        decoding="async"
      />
      {caption && (date || detail) && (
        <span className="vb-frame-caption">
          {date && <span>{date}</span>}
          {detail && <span>{detail}</span>}
        </span>
      )}
      {index != null && <span className="vb-frame-index">{index}</span>}
    </div>
  )
}
