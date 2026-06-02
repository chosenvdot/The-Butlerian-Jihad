import { useEffect, useState } from 'react'
import { HOUSE } from '../tokens'
import { VBDATA, SPOTIFY_URL, SPOTIFY_API } from '../data'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnimatedMasthead from '../components/AnimatedMasthead'
import Ph from '../components/Placeholder'

const H = HOUSE
const D = VBDATA

function PhotographyPreview() {
  const photos = D.albums
    .flatMap(a => a.photos)
    .sort((x, y) => y[2].localeCompare(x[2]))
  const frameLabel = `${photos.length} FRAMES \u00b7 ${D.albums.length} ALBUMS`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, flex: 1, minHeight: 170 }}>
        {photos.slice(0, 4).map((p, i) => <Ph key={i} label={p[0]} meta="" ticks={false} />)}
      </div>
      <span style={{ fontFamily: H.mono, fontSize: 11, color: H.muted }}>{frameLabel}</span>
    </div>
  )
}

function EngineeringPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <span style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.1em', color: H.mocha }}>CURRENTLY</span>
      <div>
        <div style={{ fontFamily: H.serif, fontSize: 23, fontWeight: 500, color: H.ink, lineHeight: 1.1 }}>Design Manager</div>
        <div style={{ fontFamily: H.sans, fontSize: 14, color: H.ink2, marginTop: 3 }}>Amazon Web Services - since 2025</div>
      </div>
      <div aria-hidden="true" style={{ minHeight: 72 }} />
      <div aria-hidden="true" style={{ marginTop: 'auto', minHeight: 62 }} />
    </div>
  )
}

function JournalPreview() {
  const j = D.journal[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <span style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.1em', color: H.mocha }}>LATEST &middot; {j[0]}</span>
      <div style={{ fontFamily: H.serif, fontSize: 23, fontWeight: 500, color: H.ink, lineHeight: 1.2 }}>{j[1]}</div>
      <p style={{ fontFamily: H.sans, fontSize: 13.5, color: H.ink2, lineHeight: 1.55, margin: 0 }}>{j[2]}</p>
      <span style={{ fontFamily: H.mono, fontSize: 9.5, letterSpacing: '0.1em', color: H.apple[2], marginTop: 'auto' }}>{j[3]}</span>
    </div>
  )
}

function LastPlayed() {
  const [t, setT] = useState(null)
  useEffect(() => {
    let on = true
    fetch(`${SPOTIFY_API}/last-played`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (on && d && d.title) setT(d) })
      .catch(() => {})
    return () => { on = false }
  }, [])

  const href = SPOTIFY_URL
  const kicker = t && t.isPlaying ? 'NOW PLAYING' : 'LAST PLAYED'
  const title = t ? t.title : '-'
  const artist = t ? t.artist : 'Spotify'
  const live = !t || t.isPlaying

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="vb-lastplayed"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none',
        border: `1px solid ${H.line}`, borderRadius: 999, padding: '7px 17px 7px 7px', background: '#f5efe1', marginBottom: 56,
      }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, overflow: 'hidden', flexShrink: 0, display: 'block' }}>
        {t && t.image
          ? <img src={t.image} alt="" width={30} height={30} style={{ display: 'block', objectFit: 'cover' }} />
          : <Ph label="" ticks={false} tint={H.apple[3]} />}
      </span>
      <span style={{ fontFamily: H.mono, fontSize: 9.5, letterSpacing: '0.12em', color: H.mocha }}>{kicker}</span>
      <span style={{ fontFamily: H.sans, fontSize: 13.5, color: H.ink, whiteSpace: 'nowrap' }}>{title} <span style={{ color: H.muted }}>&middot; {artist}</span></span>
      <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2.5, height: 13 }}>
        {[0, 1, 2].map(i => <span key={i} className="rot-bar" style={{ width: 3, height: 13, background: H.apple[3], animationDelay: (i * 0.16) + 's', animationPlayState: live ? 'running' : 'paused' }} />)}
      </span>
      <span style={{ fontFamily: H.mono, fontSize: 9.5, letterSpacing: '0.1em', color: H.mocha }}>SPOTIFY &#8599;</span>
    </a>
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
          Plan all the time so your impulsive decisions are calculated
        </p>
        <LastPlayed />
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
                  <span className="vb-enter" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: H.mono, fontSize: 10, letterSpacing: '0.1em', color: H.mocha, transition: 'gap .2s, color .2s' }}>ENTER <span style={{ fontFamily: H.serif, fontSize: 18 }}>&#8594;</span></span>
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
