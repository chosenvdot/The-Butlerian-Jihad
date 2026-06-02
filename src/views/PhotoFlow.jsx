import { HOUSE } from '../tokens'
import { VBDATA } from '../data'
import Ph from '../components/Placeholder'

// Photography hub + sub-views. nav: 'hub' | 'recents' | 'albums' | 'album:<id>'
export default function PhotoFlow({ nav, setNav, H = HOUSE, D = VBDATA }) {
  const albums = D.albums
  const all = albums.flatMap(a => a.photos.map(p => ({ place: p[0], exp: p[1], date: p[2], album: a.name, albumId: a.id })))
  const recents = [...all].sort((x, y) => y.date.localeCompare(x.date))
  const cover = a => [...a.photos].sort((x, y) => y[2].localeCompare(x[2]))[0]
  const updated = a => cover(a)[2]
  const albumsSorted = [...albums].sort((x, y) => updated(y).localeCompare(updated(x)))
  const green = H.apple[0]

  const Crumb = ({ to, label, current }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, fontFamily: H.mono, fontSize: 11, letterSpacing: '0.06em' }}>
      <button onClick={() => setNav(to)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: H.muted, fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', padding: 0 }}>{label}</button>
      <span style={{ color: H.line }}>/</span>
      <span style={{ color: H.ink }}>{current}</span>
    </div>
  )

  // ---------------- HUB ----------------
  if (nav === 'hub') {
    const Pane = ({ title, sub, onAll, children, delay = 0 }) => (
      <div className="vb-rise" style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${H.line}`, borderRadius: 8, background: '#f5efe1', animationDelay: delay + 's' }}>
        <div style={{ height: 3, background: green, borderRadius: '8px 8px 0 0' }} />
        <button onClick={onAll} className="vb-panehead"
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '18px 22px 16px', border: 'none', borderBottom: `1px solid ${H.line}`, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
          <span>
            <span style={{ display: 'block', fontFamily: H.serif, fontSize: 30, fontWeight: 500, color: H.ink }}>{title}</span>
            <span style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.08em', color: H.mocha }}>{sub}</span>
          </span>
          <span className="vb-allarrow" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.1em', color: H.mocha, transition: 'gap .2s, color .2s' }}>VIEW ALL <span style={{ fontFamily: H.serif, fontSize: 17 }}>→</span></span>
        </button>
        <div style={{ padding: 20, flex: 1 }}>{children}</div>
      </div>
    )
    return (
      <div className="vb-twopane" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, alignItems: 'start' }}>
        <Pane title="Recents" sub="EVERYTHING · NEWEST FIRST" onAll={() => setNav('recents')} delay={0}>
          <div className="vb-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {recents.slice(0, 12).map((p, i) => (
              <button key={i} onClick={() => setNav('recents')} className="vb-photo vb-rise" style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', aspectRatio: '1', animationDelay: (0.22 + i * 0.035) + 's' }}>
                <Ph label={p.place} meta={p.date} ticks={false} />
              </button>
            ))}
          </div>
        </Pane>
        <Pane title="Albums" sub="BY COLLECTION" onAll={() => setNav('albums')} delay={0.1}>
          <div className="vb-grid2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {albumsSorted.slice(0, 6).map((a, i) => (
              <button key={a.id} onClick={() => setNav('album:' + a.id)} className="vb-album vb-rise" style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', animationDelay: (0.32 + i * 0.05) + 's' }}>
                <div className="vb-cover" style={{ aspectRatio: '4/3', borderRadius: 5, overflow: 'hidden' }}><Ph label={cover(a)[0]} meta="" ticks={false} /></div>
                <div style={{ fontFamily: H.serif, fontSize: 17, fontWeight: 500, color: H.ink, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                <div style={{ fontFamily: H.mono, fontSize: 9.5, color: H.muted, marginTop: 2 }}>{a.photos.length} · UPD {updated(a)}</div>
              </button>
            ))}
          </div>
        </Pane>
      </div>
    )
  }

  // ---------------- RECENTS — the overall gallery: every photo from every album, newest first ----------------
  if (nav === 'recents') {
    return (
      <div>
        <Crumb to="hub" label="PHOTOGRAPHY" current="RECENTS" />
        <div className="vb-grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
          {recents.map((p, i) => (
            <div key={i} className="vb-photo vb-rise" style={{ aspectRatio: '4/3', animationDelay: (Math.min(i, 24) * 0.028) + 's' }}>
              <Ph label={p.place} meta={p.exp} idx={p.date.slice(5)} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontFamily: H.mono, fontSize: 11, color: H.muted }}>{recents.length} FRAMES · NEWEST FIRST · ↓ FULL-RES RAW PER FRAME</div>
      </div>
    )
  }

  // ---------------- ALBUMS (all, by last updated) ----------------
  if (nav === 'albums') {
    return (
      <div>
        <Crumb to="hub" label="PHOTOGRAPHY" current="ALBUMS" />
        <div className="vb-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {albumsSorted.map((a, i) => (
            <button key={a.id} onClick={() => setNav('album:' + a.id)} className="vb-album vb-rise" style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', animationDelay: (i * 0.06) + 's' }}>
              <div className="vb-cover" style={{ aspectRatio: '4/3', borderRadius: 6, overflow: 'hidden' }}><Ph label={cover(a)[0]} meta="" ticks={false} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
                <span style={{ fontFamily: H.serif, fontSize: 22, fontWeight: 500, color: H.ink, whiteSpace: 'nowrap' }}>{a.name}</span>
                <span style={{ fontFamily: H.mono, fontSize: 10, color: H.muted }}>{a.photos.length} FRAMES</span>
              </div>
              <div style={{ fontFamily: H.sans, fontSize: 13, color: H.ink2, marginTop: 3 }}>{a.places}</div>
              <div style={{ fontFamily: H.mono, fontSize: 9.5, color: H.muted, marginTop: 4 }}>UPDATED {updated(a)}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---------------- ALBUM DETAIL ----------------
  if (nav.startsWith('album:')) {
    const a = albums.find(x => x.id === nav.slice(6))
    if (!a) { setNav('albums'); return null }
    const photos = [...a.photos].sort((x, y) => y[2].localeCompare(x[2]))
    return (
      <div>
        <Crumb to="albums" label="ALBUMS" current={a.name.toUpperCase()} />
        <div className="vb-rise" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontFamily: H.serif, fontSize: 34, fontWeight: 500, color: H.ink, margin: 0 }}>{a.name} <span style={{ fontFamily: H.sans, fontSize: 15, color: H.muted, fontWeight: 400 }}>· {a.places}</span></h3>
          <span style={{ fontFamily: H.mono, fontSize: 11, color: H.muted }}>{a.photos.length} FRAMES · UPDATED {updated(a)}</span>
        </div>
        <div className="vb-grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
          {photos.map((p, i) => <div key={i} className="vb-photo vb-rise" style={{ aspectRatio: '4/3', animationDelay: (Math.min(i, 24) * 0.03) + 's' }}><Ph label={p[0]} meta={p[1]} idx={p[2].slice(5)} /></div>)}
        </div>
        <div style={{ marginTop: 14, fontFamily: H.mono, fontSize: 11, color: H.muted }}>↓ DOWNLOAD FULL-RES RAW PER FRAME</div>
      </div>
    )
  }
  return null
}
