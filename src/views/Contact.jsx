import { HOUSE } from '../tokens'
import { VBDATA, CONTACT_EMAIL } from '../data'

// Contact — big mailto link + hairline list of socials.
export default function Contact({ H = HOUSE, D = VBDATA }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <a href={`mailto:${CONTACT_EMAIL}`} style={{ display: 'inline-block', fontFamily: H.serif, fontSize: 'clamp(30px,5vw,46px)', fontWeight: 500, color: H.ink, textDecoration: 'none', borderBottom: `2px solid ${H.apple[4]}`, paddingBottom: 4, marginBottom: 36 }}>{CONTACT_EMAIL}</a>
      <div style={{ borderTop: `1px solid ${H.line}` }}>
        {D.socials.map((s, i) => (
          <a key={i} href={s[2]} target="_blank" rel="noopener noreferrer" className="vb-row"
            style={{ display: 'grid', gridTemplateColumns: '160px 1fr 24px', alignItems: 'baseline', gap: 16, padding: '16px 4px', borderBottom: `1px solid ${H.line}`, textDecoration: 'none' }}>
            <span style={{ fontFamily: H.mono, fontSize: 11, letterSpacing: '0.12em', color: H.muted }}>{s[0].toUpperCase()}</span>
            <span style={{ fontFamily: H.serif, fontSize: 21, fontWeight: 500, color: H.ink }}>{s[1]}</span>
            <span style={{ fontFamily: H.serif, fontSize: 18, color: H.muted, textAlign: 'right' }}>↗</span>
          </a>
        ))}
      </div>
      <p style={{ fontFamily: H.mono, fontSize: 11, color: H.muted, marginTop: 24, letterSpacing: '0.04em' }}>BASED IN FRANKFURT · AVAILABLE WORLDWIDE</p>
    </div>
  )
}
