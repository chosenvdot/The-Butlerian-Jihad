// Placeholder.jsx — the honest diagonal-hatch image placeholder ("Ph" in the
// handoff). Announces what photo goes where via a mono caption + frame index,
// with corner ticks. `tint` gives a muted colour wash (album art). Never a
// fake photo — swap each for a real image at the same aspect ratio.

const TICKS = [
  ['8px', '8px', '', '8px'],
  ['8px', '', '8px', ''],
  ['', '8px', '', '8px'],
  ['', '', '8px', '8px'],
]

export default function Placeholder({
  label = 'PHOTO', meta, idx, tint, dark = false, radius = 0, style = {}, ticks = true, big = false,
}) {
  let base = dark ? '#1d1812' : '#ddd0b6'
  let stripe = dark ? 'rgba(255,255,255,0.035)' : 'rgba(43,33,23,0.05)'
  let fg = dark ? 'rgba(236,227,209,0.55)' : 'rgba(43,33,23,0.5)'
  if (tint) {
    base = `color-mix(in oklab, ${tint} ${dark ? 28 : 34}%, ${dark ? '#1d1812' : '#e3d8c0'})`
    stripe = `color-mix(in oklab, ${tint} 40%, transparent)`
    fg = dark ? 'rgba(255,255,255,0.7)' : 'rgba(43,33,23,0.55)'
  }
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: base,
      backgroundImage: `repeating-linear-gradient(45deg, ${stripe} 0 2px, transparent 2px 11px)`,
      borderRadius: radius, ...style,
    }}>
      {ticks && TICKS.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', top: p[0] || 'auto', right: p[1] || 'auto', bottom: p[2] || 'auto', left: p[3] || 'auto',
          width: 7, height: 7,
          borderTop: p[0] ? `1px solid ${fg}` : 'none',
          borderBottom: p[2] ? `1px solid ${fg}` : 'none',
          borderLeft: p[3] ? `1px solid ${fg}` : 'none',
          borderRight: p[1] ? `1px solid ${fg}` : 'none',
        }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', padding: 16 }}>
        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: big ? 13 : 10.5, letterSpacing: '0.18em', color: fg, textTransform: 'uppercase' }}>{label}</span>
        {meta && <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 9.5, letterSpacing: '0.04em', color: fg, opacity: 0.8 }}>{meta}</span>}
      </div>
      {idx != null && <span style={{ position: 'absolute', top: 8, left: 10, fontFamily: '"Space Mono", monospace', fontSize: 9.5, color: fg }}>{idx}</span>}
    </div>
  )
}
