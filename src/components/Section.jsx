import { HOUSE } from '../tokens'
import Nav from './Nav'
import Footer from './Footer'

// Section shell — sticky nav, a masthead row (accent dot + kicker + serif title
// + right-aligned intro), the section body, then the footer.
export default function Section({ accent, kicker, kickerStyle, title, intro, active, onHome, onEnter, children, H = HOUSE }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: H.paper }}>
      <Nav active={active} onHome={onHome} onEnter={onEnter} />
      <div className="vb-pad" style={{
        padding: '34px 40px 18px', borderBottom: `1px solid ${H.line}`,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div className="vb-rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            <span style={{ width: 11, height: 11, borderRadius: 11, background: accent }} />
            <span style={{ fontFamily: H.mono, fontSize: 11, letterSpacing: '0.14em', color: H.mocha, ...kickerStyle }}>{kicker}</span>
          </div>
          <h2 style={{ fontFamily: H.serif, fontSize: 52, fontWeight: 500, letterSpacing: '-0.015em', color: H.ink, margin: 0 }}>{title}</h2>
        </div>
        <p className="vb-rise" style={{ fontFamily: H.sans, fontSize: 14.5, color: H.ink2, maxWidth: 360, textAlign: 'right', lineHeight: 1.5, margin: 0, animationDelay: '.08s' }}>{intro}</p>
      </div>
      <div className="vb-pad" style={{ flex: 1, padding: '30px 40px 50px' }}>{children}</div>
      <Footer />
    </div>
  )
}
