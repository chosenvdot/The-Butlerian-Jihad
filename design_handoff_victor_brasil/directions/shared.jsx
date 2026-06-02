// shared.jsx — palette + honest image placeholders shared by all 5 directions.
// Exports to window: FILM (palette), Ph (placeholder), Pops (rainbow stripe).

// Apple-beige / espresso-brown / olive-green ground, with the classic
// Macintosh six-color rainbow used as sparing "shots of color."
const FILM = {
  paper:   '#ece3d1', // warm apple beige
  paper2:  '#ded1b6', // deeper beige panel
  ink:     '#2b2117', // espresso brown near-black
  ink2:    '#4c3f2e',
  noir:    '#17130e', // warm dark (darkroom)
  noir2:   '#221c15',
  brown:   '#7a5638', // mid brown accent
  ember:   '#a3673c', // warm sienna (small accents)
  green:   '#586b39', // olive-forest (primary green accent)
  green2:  '#74914a', // brighter leaf green
  clay:    '#bf4a30', // apple red
  olive:   '#586b39',
  teal:    '#4a6b5a', // muted green-teal
  muted:   '#8c8168', // warm gray-tan
  line:    'rgba(43,33,23,0.15)',
  // Classic Apple logo order, top→bottom: green, yellow, orange, red, purple, blue.
  apple:  ['#5f8a3e', '#e0ad38', '#d6822c', '#bf4a30', '#7a5a9e', '#3f73a0'],
};
window.FILM = FILM;

// The six-color stripe — a tasteful brand mark / divider, echoing the
// rainbow Apple logo. Vertical bars by default.
function Pops({ h = 18, w = 5, gap = 0, radius = 1, style = {} }) {
  return (
    <span style={{ display:'inline-flex', gap, verticalAlign:'middle', borderRadius:radius, overflow:'hidden', ...style }}>
      {FILM.apple.map((c,i)=>(<span key={i} style={{ width:w, height:h, background:c, display:'block' }} />))}
    </span>
  );
}
window.Pops = Pops;

// Diagonal-hatch placeholder. Honest: it announces what photo goes there
// via a monospace caption + frame index, with corner ticks for the
// "engineered" feel. `tint` gives it a muted color wash (used for the
// colorful album art in the music module). Never a fake photo.
function Ph({ label = 'PHOTO', meta, idx, tint, dark = false, radius = 0, style = {}, ticks = true, big = false }) {
  let base = dark ? '#1d1812' : '#ddd0b6';
  let stripe = dark ? 'rgba(255,255,255,0.035)' : 'rgba(43,33,23,0.05)';
  let fg = dark ? 'rgba(236,227,209,0.55)' : 'rgba(43,33,23,0.5)';
  if (tint) {
    base = `color-mix(in oklab, ${tint} ${dark?28:34}%, ${dark?'#1d1812':'#e3d8c0'})`;
    stripe = `color-mix(in oklab, ${tint} 40%, transparent)`;
    fg = dark ? 'rgba(255,255,255,0.7)' : 'rgba(43,33,23,0.55)';
  }
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: base,
      backgroundImage: `repeating-linear-gradient(45deg, ${stripe} 0 2px, transparent 2px 11px)`,
      borderRadius: radius, ...style,
    }}>
      {ticks && [['8px','8px','','8px'],['8px','','8px',''],['','8px','','8px'],['','','8px','8px']].map((p,i)=>(
        <span key={i} style={{ position:'absolute', top:p[0]||'auto', right:p[1]||'auto', bottom:p[2]||'auto', left:p[3]||'auto',
          width:7, height:7, borderTop: (p[0]?`1px solid ${fg}`:'none'), borderBottom:(p[2]?`1px solid ${fg}`:'none'),
          borderLeft:(p[3]?`1px solid ${fg}`:'none'), borderRight:(p[1]?`1px solid ${fg}`:'none') }} />
      ))}
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, textAlign:'center', padding:16 }}>
        <span style={{ fontFamily:'"Space Mono", monospace', fontSize: big?13:10.5, letterSpacing:'0.18em', color: fg, textTransform:'uppercase' }}>{label}</span>
        {meta && <span style={{ fontFamily:'"Space Mono", monospace', fontSize:9.5, letterSpacing:'0.04em', color: fg, opacity:0.8 }}>{meta}</span>}
      </div>
      {idx!=null && <span style={{ position:'absolute', top:8, left:10, fontFamily:'"Space Mono", monospace', fontSize:9.5, color:fg }}>{idx}</span>}
    </div>
  );
}
window.Ph = Ph;
