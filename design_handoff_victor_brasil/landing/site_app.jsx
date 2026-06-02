// site_app.jsx — the real Victor Brasil landing.
// Option A's masthead, kept; numbers removed; entries become preview cards
// (CV snapshot, latest journal post, photography thumbs, on rotation).
// Clicking a card travels into that section; wordmark/nav return home.
function SiteApp() {
  const H = window.HOUSE, Ph = window.Ph, D = window.VBDATA;
  const { VBMasthead, Pops } = window;
  const SPOTIFY_URL = 'https://open.spotify.com/user/victorbrasil'; // → real profile later
  const [view, setView] = React.useState('home');
  const [photoNav, setPhotoNav] = React.useState('hub');
  const [journalNav, setJournalNav] = React.useState(null);

  React.useEffect(()=>{ window.scrollTo(0,0); }, [view, photoNav, journalNav]);

  const enter = (k)=>{ if (k==='photography') setPhotoNav('hub'); if (k==='journal') setJournalNav(null); setView(k); };

  const cards = [
    { key:'photography', title:'Photography', accent:H.apple[0] },
    { key:'engineering', title:'Engineering', accent:H.apple[5] },
    { key:'journal',     title:'Journal',     accent:H.apple[2] },
  ];
  const navMap = { photography:'photography', engineering:'engineering', journal:'journal', contact:'contact' };

  // ---------- shared chrome ----------
  const Nav = ({ active }) => (
    <div className="vb-nav vb-pad" style={{ position:'sticky', top:0, zIndex:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10,
      padding:'16px 40px', borderBottom:`1px solid ${H.line}`, background:'rgba(239,231,214,0.86)', backdropFilter:'blur(10px)' }}>
      <button onClick={()=>setView('home')} style={{ display:'flex', alignItems:'center', gap:11, border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
        <Pops h={14} w={3} />
        <span style={{ fontFamily:H.mono, fontSize:12.5, fontWeight:700, letterSpacing:'0.16em', color:H.ink }}>VICTOR BRASIL</span>
      </button>
      <span className="vb-navlinks" style={{ display:'flex', gap:24, fontFamily:H.mono, fontSize:11.5, letterSpacing:'0.04em', alignItems:'center' }}>
        {['Photography','Engineering','Journal','Contact'].map(it=>{
          const k = navMap[it.toLowerCase()];
          return (
            <button key={it} onClick={()=>enter(k)} style={{ border:'none', background:'transparent', cursor:'pointer', padding:'0 0 2px',
              color: active===k?H.ink:H.muted, fontFamily:'inherit', fontSize:'inherit', letterSpacing:'inherit',
              borderBottom: active===k?`2px solid ${H.ink}`:'2px solid transparent' }}>{it.toUpperCase()}</button>
          );
        })}
      </span>
    </div>
  );

  const Footer = () => (
    <div className="vb-pad" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 40px', borderTop:`1px solid ${H.line}`, fontFamily:H.mono, fontSize:11, color:H.muted }}>
      <span>VICTOR@BRASIL.PHOTO</span>
      <Pops h={11} w={3} />
      <span>© 2026</span>
    </div>
  );

  // ---------- preview cards ----------
  const previews = {
    photography: (
      <div style={{ display:'flex', flexDirection:'column', gap:12, flex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:3, flex:1, minHeight:170 }}>
          {D.photos.slice(0,4).map((p,i)=>(<Ph key={i} label={p[0]} meta="" ticks={false} />))}
        </div>
        <span style={{ fontFamily:H.mono, fontSize:11, color:H.muted }}>117 FRAMES · 9 SERIES</span>
      </div>
    ),
    engineering: (
      <div style={{ display:'flex', flexDirection:'column', gap:14, flex:1 }}>
        <span style={{ fontFamily:H.mono, fontSize:10.5, letterSpacing:'0.1em', color:H.mocha }}>CURRENTLY</span>
        <div>
          <div style={{ fontFamily:H.serif, fontSize:23, fontWeight:500, color:H.ink, lineHeight:1.1 }}>Senior Software Engineer</div>
          <div style={{ fontFamily:H.sans, fontSize:14, color:H.ink2, marginTop:3 }}>Google · since 2021</div>
        </div>
        <p style={{ fontFamily:H.sans, fontSize:13.5, color:H.ink2, lineHeight:1.55, margin:0 }}>Latency &amp; sharding for a service at 4B+ requests a day.</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:'auto' }}>
          {['Distributed Systems','Go','C++','Reliability'].map((s,i)=>(
            <span key={i} style={{ fontFamily:H.mono, fontSize:10, color:H.ink2, border:`1px solid ${H.line}`, padding:'4px 9px', borderRadius:999 }}>{s}</span>
          ))}
        </div>
      </div>
    ),
    journal: (
      <div style={{ display:'flex', flexDirection:'column', gap:12, flex:1 }}>
        <span style={{ fontFamily:H.mono, fontSize:10.5, letterSpacing:'0.1em', color:H.mocha }}>LATEST · {D.journal[0][0]}</span>
        <div style={{ fontFamily:H.serif, fontSize:23, fontWeight:500, color:H.ink, lineHeight:1.2 }}>{D.journal[0][1]}</div>
        <p style={{ fontFamily:H.sans, fontSize:13.5, color:H.ink2, lineHeight:1.55, margin:0 }}>{D.journal[0][2]}</p>
        <span style={{ fontFamily:H.mono, fontSize:9.5, letterSpacing:'0.1em', color:H.apple[2], marginTop:'auto' }}>{D.journal[0][3]}</span>
      </div>
    ),
    rotation: (
      <div style={{ display:'flex', flexDirection:'column', gap:14, flex:1 }}>
        <span style={{ fontFamily:H.mono, fontSize:10.5, letterSpacing:'0.1em', color:H.muted }}>NOW PLAYING</span>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:52, height:52, borderRadius:4, overflow:'hidden', flexShrink:0 }}><Ph label="" ticks={false} tint={H.apple[3]} /></div>
          <div>
            <div style={{ fontFamily:H.sans, fontSize:15, fontWeight:600, color:H.ink }}>Northern Drift</div>
            <div style={{ fontFamily:H.sans, fontSize:13, color:H.ink2 }}>Glassbird</div>
          </div>
        </div>
        <span style={{ display:'inline-flex', alignItems:'flex-end', gap:3, height:18, marginTop:'auto' }}>
          {[0,1,2,3,4].map(i=>(<span key={i} className="rot-bar" style={{ width:4, height:18, background:H.apple[3], animationDelay:(i*0.14)+'s' }} />))}
        </span>
      </div>
    ),
  };

  const Home = (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:H.paper }}>
      <Nav active={null} />
      <main className="vb-pad" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 40px 56px', gap:0 }}>
        <window.AnimatedMasthead H={H} size={88} />
        <p style={{ fontFamily:H.sans, fontSize:17, color:H.ink2, margin:'28px 0 22px', maxWidth:460, textAlign:'center', lineHeight:1.5, textWrap:'pretty' }}>
          I make pictures and systems — both about light, structure, and patience. Choose a way in.
        </p>
        <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer" className="vb-lastplayed"
          style={{ display:'inline-flex', alignItems:'center', gap:12, textDecoration:'none',
            border:`1px solid ${H.line}`, borderRadius:999, padding:'7px 17px 7px 7px', background:'#f5efe1', marginBottom:56 }}>
          <span style={{ width:30, height:30, borderRadius:999, overflow:'hidden', flexShrink:0 }}><Ph label="" ticks={false} tint={H.apple[3]} /></span>
          <span style={{ fontFamily:H.mono, fontSize:9.5, letterSpacing:'0.12em', color:H.mocha }}>LAST PLAYED</span>
          <span style={{ fontFamily:H.sans, fontSize:13.5, color:H.ink, whiteSpace:'nowrap' }}>Northern Drift <span style={{ color:H.muted }}>· Glassbird</span></span>
          <span style={{ display:'inline-flex', alignItems:'flex-end', gap:2.5, height:13 }}>
            {[0,1,2].map(i=>(<span key={i} className="rot-bar" style={{ width:3, height:13, background:H.apple[3], animationDelay:(i*0.16)+'s' }} />))}
          </span>
          <span style={{ fontFamily:H.mono, fontSize:9.5, letterSpacing:'0.1em', color:H.mocha }}>SPOTIFY ↗</span>
        </a>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:26, width:'100%', maxWidth:1140 }}>
          {cards.map(c=>(
            <button key={c.key} className="vb-card" onClick={()=>enter(c.key)}
              style={{ '--accent':c.accent, display:'flex', flexDirection:'column', textAlign:'left', cursor:'pointer',
                background:'#f5efe1', border:`1px solid ${H.line}`, borderRadius:8, overflow:'hidden', padding:0, minHeight:372 }}>
              <div style={{ height:3, background:c.accent }} />
              <div style={{ padding:'24px 26px 26px', display:'flex', flexDirection:'column', flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
                  <span style={{ fontFamily:H.serif, fontSize:27, fontWeight:500, color:H.ink, whiteSpace:'nowrap' }}>{c.title}</span>
                  <span className="vb-enter" style={{ display:'flex', alignItems:'center', gap:6, fontFamily:H.mono, fontSize:10, letterSpacing:'0.1em', color:H.mocha, transition:'gap .2s, color .2s' }}>ENTER <span style={{ fontFamily:H.serif, fontSize:18 }}>→</span></span>
                </div>
                {previews[c.key]}
              </div>
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );

  // ---------- section shell ----------
  const Section = ({ accent, kicker, title, intro, children }) => (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:H.paper }}>
      <Nav active={view} />
      <div className="vb-pad" style={{ padding:'34px 40px 18px', borderBottom:`1px solid ${H.line}`, display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
            <span style={{ width:11, height:11, borderRadius:11, background:accent }} />
            <span style={{ fontFamily:H.mono, fontSize:11, letterSpacing:'0.14em', color:H.mocha }}>{kicker}</span>
          </div>
          <h2 style={{ fontFamily:H.serif, fontSize:52, fontWeight:500, letterSpacing:'-0.015em', color:H.ink, margin:0 }}>{title}</h2>
        </div>
        <p style={{ fontFamily:H.sans, fontSize:14.5, color:H.ink2, maxWidth:360, textAlign:'right', lineHeight:1.5, margin:0 }}>{intro}</p>
      </div>
      <div className="vb-pad" style={{ flex:1, padding:'30px 40px 50px' }}>{children}</div>
      <Footer />
    </div>
  );

  const PhotoView = (
    <Section accent={H.apple[0]} kicker="GALLERY" title="Photography" intro="Albums and recent frames from the edges of the map. Full-resolution RAW available per frame.">
      <window.PhotoFlow H={H} Ph={Ph} D={D} nav={photoNav} setNav={setPhotoNav} />
    </Section>
  );

  const EngView = (
    <Section accent={H.apple[5]} kicker="CURRICULUM" title="Engineering" intro="Fifteen years of distributed systems. Click a role to expand. PDF available.">
      <div style={{ borderTop:`1px solid ${H.line}`, maxWidth:980 }}>
        {D.cv.map((r,i)=>(
          <details key={i} open={i===0} style={{ borderBottom:`1px solid ${H.line}` }}>
            <summary style={{ listStyle:'none', cursor:'pointer', display:'grid', gridTemplateColumns:'1fr 200px 140px 22px', alignItems:'baseline', padding:'17px 0', gap:14 }}>
              <span style={{ fontFamily:H.serif, fontSize:24, fontWeight:500, color:H.ink }}>{r[0]}</span>
              <span style={{ fontFamily:H.sans, fontSize:15, color:H.ink2 }}>{r[1]}</span>
              <span style={{ fontFamily:H.mono, fontSize:11.5, color:H.muted, textAlign:'right' }}>{r[2]}</span>
              <span style={{ fontFamily:H.mono, fontSize:15, color:H.apple[5], textAlign:'right' }}>+</span>
            </summary>
            <ul style={{ margin:'0 0 18px', paddingLeft:18, fontFamily:H.sans, fontSize:14.5, color:H.ink2, lineHeight:1.7, maxWidth:660 }}>
              {r[3].map((b,j)=>(<li key={j}>{b}</li>))}
            </ul>
          </details>
        ))}
      </div>
    </Section>
  );

  const journalList = (
    <div style={{ borderTop:`1px solid ${H.line}`, maxWidth:980 }}>
      {D.journal.map((j,i)=>(
        <button key={i} className="vb-jrow" onClick={()=>setJournalNav(i)}
          style={{ width:'100%', display:'grid', gridTemplateColumns:'130px 1fr 120px', gap:22, alignItems:'baseline', padding:'24px 8px', borderBottom:`1px solid ${H.line}`, background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
          <span style={{ fontFamily:H.mono, fontSize:11.5, color:H.muted }}>{j[0]}</span>
          <div>
            <h3 style={{ fontFamily:H.serif, fontSize:26, fontWeight:500, margin:'0 0 6px', color:H.ink }}>{j[1]}</h3>
            <p style={{ fontFamily:H.sans, fontSize:14.5, color:H.ink2, margin:0, lineHeight:1.55, maxWidth:560 }}>{j[2]}</p>
          </div>
          <span style={{ fontFamily:H.mono, fontSize:10, letterSpacing:'0.1em', color:H.apple[2], textAlign:'right' }}>{j[3]}</span>
        </button>
      ))}
    </div>
  );

  const journalEntry = (idx)=>{
    const j = D.journal[idx];
    const body = j[4] || ['(Draft — content coming soon.)'];
    return (
      <div style={{ maxWidth:680 }}>
        <button onClick={()=>setJournalNav(null)} style={{ display:'flex', alignItems:'center', gap:8, border:'none', background:'transparent', cursor:'pointer', padding:0, marginBottom:26, fontFamily:H.mono, fontSize:11, letterSpacing:'0.08em', color:H.mocha }}>
          <span style={{ fontFamily:H.serif, fontSize:16 }}>←</span> ALL ENTRIES
        </button>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:14, fontFamily:H.mono, fontSize:11, letterSpacing:'0.08em' }}>
          <span style={{ color:H.muted }}>{j[0]}</span>
          <span style={{ color:H.apple[2] }}>{j[3]}</span>
        </div>
        <h3 style={{ fontFamily:H.serif, fontSize:'clamp(30px,4.4vw,42px)', fontWeight:500, letterSpacing:'-0.015em', lineHeight:1.12, color:H.ink, margin:'0 0 10px' }}>{j[1]}</h3>
        <p style={{ fontFamily:H.sans, fontSize:16, color:H.ink2, lineHeight:1.5, margin:'0 0 30px', fontStyle:'italic' }}>{j[2]}</p>
        <div style={{ borderTop:`1px solid ${H.line}`, paddingTop:28 }}>
          {body.map((para,i)=>(<p key={i} style={{ fontFamily:H.serif, fontSize:18.5, lineHeight:1.72, color:H.ink, margin:'0 0 20px' }}>{para}</p>))}
        </div>
        <div style={{ marginTop:30, paddingTop:18, borderTop:`1px solid ${H.line}`, fontFamily:H.mono, fontSize:10.5, letterSpacing:'0.06em', color:H.muted }}>— VICTOR BRASIL</div>
      </div>
    );
  };

  const JournalView = (
    <Section accent={H.apple[2]} kicker="WRITING" title="Journal" intro="Field notes and engineering essays. The throughline is patience.">
      {journalNav===null ? journalList : journalEntry(journalNav)}
    </Section>
  );

  const RotationView = null;

  const ContactView = (
    <Section accent={H.apple[4]} kicker="SAY HELLO" title="Contact" intro="For commissions, prints, or engineering work — the inbox is open.">
      <div style={{ maxWidth:760 }}>
        <a href="mailto:victor@brasil.photo" style={{ display:'inline-block', fontFamily:H.serif, fontSize:'clamp(30px,5vw,46px)', fontWeight:500, color:H.ink, textDecoration:'none', borderBottom:`2px solid ${H.apple[4]}`, paddingBottom:4, marginBottom:36 }}>victor@brasil.photo</a>
        <div style={{ borderTop:`1px solid ${H.line}` }}>
          {D.socials.filter(s=> s[0]!=='Email' && s[0]!=='Spotify').map((s,i)=>(
            <a key={i} href={s[2]} target="_blank" rel="noopener noreferrer" className="vb-row"
              style={{ display:'grid', gridTemplateColumns:'160px 1fr 24px', alignItems:'baseline', gap:16, padding:'16px 4px', borderBottom:`1px solid ${H.line}`, textDecoration:'none' }}>
              <span style={{ fontFamily:H.mono, fontSize:11, letterSpacing:'0.12em', color:H.muted }}>{s[0].toUpperCase()}</span>
              <span style={{ fontFamily:H.serif, fontSize:21, fontWeight:500, color:H.ink }}>{s[1]}</span>
              <span style={{ fontFamily:H.serif, fontSize:18, color:H.muted, textAlign:'right' }}>↗</span>
            </a>
          ))}
        </div>
        <p style={{ fontFamily:H.mono, fontSize:11, color:H.muted, marginTop:24, letterSpacing:'0.04em' }}>BASED IN FRANKFURT · AVAILABLE WORLDWIDE</p>
      </div>
    </Section>
  );

  const map = { home:Home, photography:PhotoView, engineering:EngView, journal:JournalView, contact:ContactView };
  return map[view] || Home;
}
window.SiteApp = SiteApp;
