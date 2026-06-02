import { HOUSE } from '../tokens'
import { VBDATA, SPOTIFY_URL } from '../data'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnimatedMasthead from '../components/AnimatedMasthead'
import Ph from '../components/Placeholder'

const H = HOUSE
const D = VBDATA

// Preview content for each card.
function PhotographyPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, flex: 1, minHeight: 170 }}>
        {D.photos.slice(0, 4).map((p, i) => <Ph key={i} label={p[0]} meta="" ticks={false} />)}
      </div>
      <span style={{ fontFamily: H.mono, fontSize: 11, color: H.muted }}>117 FRAMES · 9 SERIES</span>
    </div>
  )
}

function EngineeringPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <span style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.1em', color: H.mocha }}>CURRENTLY</span>
      <div>
        <div style={{ fontFamily: H.serif, fontSize: 23, fontWeight: 500, color: H.ink, lineHeight: 1.1 }}>Senior Software Engineer</div>
        <div style={{ fontFamily: H.sans, fontSize: 14, color: H.ink2, marginTop: 3 }}>Google · since 2021</div>
      </div>
      <p style={{ fontFamily: H.sans, fontSize: 13.5, color: H.ink2, lineHeight: 1.55, margin: 0 }}>Latency &amp; sharding for a service at 4B+ requests a day.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
        {['Distributed Systems', 'Go', 'C++', 'Reliability'].map((s, i) => (
          <span key={i} style={{ fontFamily: H.mono, fontSize: 10, color: H.ink2, border: `1px solid ${H.line}`, padding: '4px 9px', borderRadius: 999 }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function JournalPreview() {
  const j = D.journal[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <span style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.1em', color: H.mocha }}>LATEST · {j[0]}</span>
      <div style={{ fontFamily: H.serif, fontSize: 23, fontWeight: 500, color: H.ink, lineHeight: 1.2 }}>{j[1]}</div>
      <p style={{ fontFamily: H.sans, fontSize: 13.5, color: H.ink2, lineHeight: 1.55, margin: 0 }}>{j[2]}</p>
      <span style={{ fontFamily: H.mono, fontSize: 9.5, letterSpacing: '0.1em', color: H.apple[2], marginTop: 'auto' }}>{j[3]}</span>
    </div>
  )
}

const PREVIEWS = {
  photography: <PhotographyPreview />,
  engineering: <EngineeringPreview />,
  journal: <JournalPreview />,
}

const CARDS = [
  { key: 'photography', title: 'Photography', accent: H.apple[0] },
  { key: 'engineering', title: 'Engineering', accent: H.apple[5] },
  { key: 'journal', title: 'Journal', accent: H.apple[2] },
]

export default function Home({ onHome, onEnter }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: H.paper }}>
      <Nav active={null} onHome={onHome} onEnter={onEnter} />
      <main className="vb-pad" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 40px 56px', gap: 0 }}>
        <AnimatedMasthead H={H} size={108} />
        <p style={{ fontFamily: H.sans, fontSize: 17, color: H.ink2, margin: '28px 0 22px', maxWidth: 460, textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty' }}>
          I make pictures and systems — both about light, structure, and patience. Choose a way in.
        </p>
        <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer" className="vb-lastplayed"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none',
            border: `1px solid ${H.line}`, borderRadius: 999, padding: '7px 17px 7px 7px', background: '#f5efe1', marginBottom: 56,
          }}>
          <span style={{ width: 30, height: 30, borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}><Ph label="" ticks={false} tint={H.apple[3]} /></span>
          <span style={{ fontFamily: H.mono, fontSize: 9.5, letterSpacing: '0.12em', color: H.mocha }}>LAST PLAYED</span>
          <span style={{ fontFamily: H.sans, fontSize: 13.5, color: H.ink, whiteSpace: 'nowrap' }}>Northern Drift <span style={{ color: H.muted }}>· Glassbird</span></span>
          <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2.5, height: 13 }}>
            {[0, 1, 2].map(i => <span key={i} className="rot-bar" style={{ width: 3, height: 13, background: H.apple[3], animationDelay: (i * 0.16) + 's' }} />)}
          </span>
          <span style={{ fontFamily: H.mono, fontSize: 9.5, letterSpacing: '0.1em', color: H.mocha }}>SPOTIFY ↗</span>
        </a>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 26, width: '100%', maxWidth: 1140 }}>
          {CARDS.map(c => (
            <button key={c.key} className="vb-card" onClick={() => onEnter(c.key)}
              style={{
                '--accent': c.accent, display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer',
                background: '#f5efe1', border: `1px solid ${H.line}`, borderRadius: 8, overflow: 'hidden', padding: 0, minHeight: 372,
              }}>
              <div style={{ height: 3, background: c.accent }} />
              <div style={{ padding: '24px 26px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                  <span style={{ fontFamily: H.serif, fontSize: 27, fontWeight: 500, color: H.ink, whiteSpace: 'nowrap' }}>{c.title}</span>
                  <span className="vb-enter" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: H.mono, fontSize: 10, letterSpacing: '0.1em', color: H.mocha, transition: 'gap .2s, color .2s' }}>ENTER <span style={{ fontFamily: H.serif, fontSize: 18 }}>→</span></span>
                </div>
                {PREVIEWS[c.key]}
              </div>
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
