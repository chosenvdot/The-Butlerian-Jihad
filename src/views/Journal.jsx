import { HOUSE } from '../tokens'
import { VBDATA } from '../data'

// Journal — list of entries, or a single entry when journalNav is an index.
export default function Journal({ journalNav, setJournalNav, H = HOUSE, D = VBDATA }) {
  if (journalNav === null) {
    return (
      <div style={{ borderTop: `1px solid ${H.line}`, maxWidth: 980 }}>
        {D.journal.map((j, i) => (
          <button key={i} className="vb-jrow" onClick={() => setJournalNav(i)}
            style={{ width: '100%', display: 'grid', gridTemplateColumns: '130px 1fr 120px', gap: 22, alignItems: 'baseline', padding: '24px 8px', background: 'transparent', border: 'none', borderBottom: `1px solid ${H.line}`, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontFamily: H.mono, fontSize: 11.5, color: H.muted }}>{j[0]}</span>
            <div>
              <h3 style={{ fontFamily: H.serif, fontSize: 26, fontWeight: 500, margin: '0 0 6px', color: H.ink }}>{j[1]}</h3>
              <p style={{ fontFamily: H.sans, fontSize: 14.5, color: H.ink2, margin: 0, lineHeight: 1.55, maxWidth: 560 }}>{j[2]}</p>
            </div>
            <span style={{ fontFamily: H.mono, fontSize: 10, letterSpacing: '0.1em', color: H.apple[2], textAlign: 'right' }}>{j[3]}</span>
          </button>
        ))}
      </div>
    )
  }

  const j = D.journal[journalNav]
  const body = j[4] || ['(Draft — content coming soon.)']
  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => setJournalNav(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, marginBottom: 26, fontFamily: H.mono, fontSize: 11, letterSpacing: '0.08em', color: H.mocha }}>
        <span style={{ fontFamily: H.serif, fontSize: 16 }}>←</span> ALL ENTRIES
      </button>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, fontFamily: H.mono, fontSize: 11, letterSpacing: '0.08em' }}>
        <span style={{ color: H.muted }}>{j[0]}</span>
        <span style={{ color: H.apple[2] }}>{j[3]}</span>
      </div>
      <h3 style={{ fontFamily: H.serif, fontSize: 'clamp(30px,4.4vw,42px)', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.12, color: H.ink, margin: '0 0 10px' }}>{j[1]}</h3>
      <p style={{ fontFamily: H.sans, fontSize: 16, color: H.ink2, lineHeight: 1.5, margin: '0 0 30px', fontStyle: 'italic' }}>{j[2]}</p>
      <div style={{ borderTop: `1px solid ${H.line}`, paddingTop: 28 }}>
        {body.map((para, i) => <p key={i} style={{ fontFamily: H.serif, fontSize: 18.5, lineHeight: 1.72, color: H.ink, margin: '0 0 20px' }}>{para}</p>)}
      </div>
      <div style={{ marginTop: 30, paddingTop: 18, borderTop: `1px solid ${H.line}`, fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.06em', color: H.muted }}>— VICTOR BRASIL</div>
    </div>
  )
}
