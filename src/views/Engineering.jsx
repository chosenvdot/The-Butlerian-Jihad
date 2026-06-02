import { HOUSE } from '../tokens'
import { VBDATA } from '../data'

// CV roles as native <details>; click a row to expand its bullets. First open.
export default function Engineering({ H = HOUSE, D = VBDATA }) {
  return (
    <div style={{ borderTop: `1px solid ${H.line}`, maxWidth: 980 }}>
      {D.cv.map((r, i) => (
        <details key={i} open={i === 0} className="vb-cv vb-rise" style={{ borderBottom: `1px solid ${H.line}`, animationDelay: (i * 0.07) + 's' }}>
          <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 200px 140px 22px', alignItems: 'baseline', padding: '17px 0', gap: 14 }}>
            <span style={{ fontFamily: H.serif, fontSize: 24, fontWeight: 500, color: H.ink }}>{r[0]}</span>
            <span style={{ fontFamily: H.sans, fontSize: 15, color: H.ink2 }}>{r[1]}</span>
            <span style={{ fontFamily: H.mono, fontSize: 11.5, color: H.muted, textAlign: 'right' }}>{r[2]}</span>
            <span className="vb-cv-plus" style={{ fontFamily: H.mono, fontSize: 15, color: H.apple[5], textAlign: 'right' }}>+</span>
          </summary>
          {r[3].length > 0 ? (
            <ul style={{ margin: '0 0 18px', paddingLeft: 18, fontFamily: H.sans, fontSize: 14.5, color: H.ink2, lineHeight: 1.7, maxWidth: 660 }}>
              {r[3].map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          ) : (
            <div aria-hidden="true" style={{ minHeight: 72, marginBottom: 18 }} />
          )}
        </details>
      ))}
    </div>
  )
}
