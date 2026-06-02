// house.jsx — the refined "house style" for Victor Brasil's site:
// Index structure + Atlas serif masthead, higher contrast, beige base kept,
// Mac-rainbow touches. Shared by both landing proposals.
// Exports to window: HOUSE, VBMasthead, VBNav, VBDATA.

const HOUSE = {
  paper:  '#efe7d6',   // clean apple beige
  panel:  '#e7ddc7',   // panel beige
  ink:    '#191307',   // near-black espresso — high contrast
  ink2:   '#574733',   // brown secondary
  brown:  '#7a5638',
  mocha:  '#6f4b34',
  muted:  '#8c8168',
  line:   'rgba(25,19,7,0.16)',
  lineHi: 'rgba(25,19,7,0.55)',
  apple:  window.FILM.apple,           // [green,yellow,orange,red,purple,blue]
  serif:  '"Newsreader", Georgia, serif',
  sans:   '"Archivo", system-ui, sans-serif',
  mono:   '"Space Mono", monospace',
};
window.HOUSE = HOUSE;

// The masthead from #5: tiny kicker, serif "Victor Brasil", rainbow rule.
function VBMasthead({ size = 86, kicker = true, align = 'center' }) {
  const H = HOUSE, Pops = window.Pops;
  return (
    <div style={{ textAlign: align }}>
      {kicker && <div style={{ fontFamily:H.mono, fontSize:10.5, letterSpacing:'0.42em', color:H.mocha, marginBottom:14, paddingLeft:'0.42em' }}>PHOTOGRAPHER · ENGINEER</div>}
      <h1 style={{ fontFamily:H.serif, fontWeight:500, fontSize:size, lineHeight:0.94, letterSpacing:'-0.02em', color:H.ink, margin:0, whiteSpace:'nowrap' }}>Victor Brasil</h1>
      <div style={{ display:'flex', justifyContent: align==='center'?'center':'flex-start', marginTop:16 }}>
        <Pops h={5} w={Math.round(size*0.42)} radius={2} />
      </div>
    </div>
  );
}
window.VBMasthead = VBMasthead;

// Slim top bar: rainbow chip + wordmark left, nav right.
function VBNav({ onHome, active, items = ['Photography','Engineering','Journal','About'], onNav, right }) {
  const H = HOUSE, Pops = window.Pops;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 40px', borderBottom:`1px solid ${H.line}`, background:H.paper }}>
      <button onClick={onHome} style={{ display:'flex', alignItems:'center', gap:11, border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
        <Pops h={14} w={3} />
        <span style={{ fontFamily:H.mono, fontSize:12.5, fontWeight:700, letterSpacing:'0.16em', color:H.ink }}>VICTOR BRASIL</span>
      </button>
      {right!==undefined ? right : (
        <span style={{ display:'flex', gap:26, fontFamily:H.mono, fontSize:11.5, letterSpacing:'0.04em' }}>
          {items.map((it,i)=>(
            <button key={i} onClick={()=>onNav&&onNav(it.toLowerCase())} style={{ border:'none', background:'transparent', cursor:'pointer', padding:0,
              color: active===it.toLowerCase()?H.ink:H.muted, fontFamily:'inherit', fontSize:'inherit', letterSpacing:'inherit',
              borderBottom: active===it.toLowerCase()?`2px solid ${H.ink}`:'2px solid transparent', paddingBottom:2 }}>{it.toUpperCase()}</button>
          ))}
        </span>
      )}
    </div>
  );
}
window.VBNav = VBNav;

window.VBDATA = {
  photos: [['Reykjavík','f/8 · 1/250'],['Atacama','f/11 · 1/60'],['Lofoten','f/4 · 1/1000'],['Kyoto','f/2 · 1/125'],
           ['Faroe','f/16 · 30s'],['Namib','f/9 · 1/400'],['Dolomites','f/5.6 · 1/800'],['Hokkaido','f/8 · 1/2000'],
           ['Lisbon','f/5.6 · 1/500'],['Patagonia','f/11 · 1/200'],['Svalbard','f/4 · 1/2000'],['Porto','f/2.8 · 1/160']],
  series: [['North Atlantic','Iceland · Faroe · Lofoten','34'],['Deserts','Atacama · Namib','22'],['Quiet Cities','Kyoto · Lisbon · Porto','41']],
  cv: [
    ['Senior Software Engineer','Google','2021 — Now',['Led latency work on a search-adjacent service handling 4B+ daily requests; cut p99 by 38%.','Designed the sharding layer now adopted by three sister teams.','Mentored five engineers; ran the team\u2019s design-review practice.']],
    ['Software Engineer','Stripe','2018 — 2021',['Built ledger reconciliation tooling for the payments core.']],
    ['B.S. Computer Science','UC Berkeley','2014 — 2018',['Distributed systems & computational photography.']],
  ],
  journal: [
    ['2026.04.12','Waiting for the blue hour in Lofoten','On patience, weather apps, and the frames you don\u2019t take.','FIELD',
      ['The forecast said clear at 04:40. I had been awake since three, boots already wet, watching a band of cloud refuse to move off the ridge. This is most of landscape photography: standing somewhere cold, betting on light that may never arrive.',
       'When it finally broke, it lasted about ninety seconds \u2014 a wash of cobalt over the peaks before the sun took the colour out of everything. I made four frames. Two of them are sharp. One of those two is the picture.',
       'People ask how many shots a trip like this produces. The honest answer is a handful you keep and a hard drive you don\u2019t. The discipline isn\u2019t in shooting more; it\u2019s in knowing which mornings to get up for, and being there when the ninety seconds happen.']],
    ['2026.02.28','Sharding without tears','What photography taught me about distributed systems.','ENGINEERING',
      ['A sharding key is a composition decision. You are choosing what sits in the frame together and what gets cropped out \u2014 which rows travel as a unit, which queries stay cheap, which ones fall off the edge into a scatter-gather you\u2019ll regret at 3am.',
       'The mistake I see most often is the same one beginners make with a wide lens: trying to fit everything in. A shard that serves every access pattern serves none of them well. Pick the dominant read path the way you pick a subject, and let the rest blur.',
       'We cut p99 latency by 38% not by adding capacity but by re-framing. Same data, different boundaries. The best optimisation, in code and in pictures, is usually subtraction.']],
    ['2026.01.05','A roll of Portra in Porto','Notes on shooting film in a city built for it.','FIELD',
      ['Thirty-six frames forces a kind of honesty. You stop spraying and start seeing. By the second day in Porto I was down to maybe six exposures and walking past things I would have shot a hundred of on a digital body.',
       'Portra wants the warm light of late afternoon on those tiled facades. I metered for the shadows and let the highlights take care of themselves, which is the whole trick with negative film and the opposite of everything sensors taught me.',
       'The roll is at the lab now. I won\u2019t see it for two weeks, and I\u2019ve made my peace with that. Delayed gratification is underrated \u2014 in photography and, lately, in most things.']],
  ],
  // Albums — each photo is [place, exposure, date]. Cover = most recent photo;
  // album "last updated" = its newest photo date.
  albums: [
    { id:'north-atlantic', name:'North Atlantic', places:'Iceland · Faroe · Lofoten', photos:[
      ['Lofoten · blue hour','f/4 · 1/1000','2026.04.18'],['Reykjavík','f/8 · 1/250','2026.04.11'],['Faroe stacks','f/16 · 30s','2026.04.02'],['Vestrahorn','f/11 · 1/125','2026.03.28'],['Reine','f/5.6 · 1/500','2026.03.20'] ] },
    { id:'quiet-cities', name:'Quiet Cities', places:'Kyoto · Lisbon · Porto', photos:[
      ['Kyoto alley','f/2 · 1/125','2026.03.30'],['Lisbon tram','f/5.6 · 1/500','2026.03.12'],['Porto rooftops','f/2.8 · 1/160','2026.02.26'],['Gion dusk','f/1.8 · 1/80','2026.02.10'] ] },
    { id:'mountains', name:'Mountains', places:'Dolomites · Hokkaido', photos:[
      ['Tre Cime','f/5.6 · 1/800','2026.02.14'],['Hokkaido birches','f/8 · 1/2000','2026.01.22'],['Seceda ridge','f/9 · 1/400','2026.01.08'] ] },
    { id:'deserts', name:'Deserts', places:'Atacama · Namib', photos:[
      ['Atacama stars','f/2.8 · 30s','2025.11.30'],['Namib dunes','f/9 · 1/400','2025.11.12'],['Deadvlei','f/11 · 1/250','2025.10.28'],['Valle de la Luna','f/8 · 1/500','2025.10.15'] ] },
    { id:'patagonia', name:'Patagonia', places:'Torres del Paine', photos:[
      ['Torres dawn','f/11 · 1/200','2025.09.20'],['Grey glacier','f/8 · 1/500','2025.09.08'],['Guanaco','f/4 · 1/1000','2025.08.30'] ] },
    { id:'svalbard', name:'Svalbard', places:'Arctic 78°N', photos:[
      ['Pack ice','f/4 · 1/2000','2025.06.18'],['Midnight sun','f/8 · 1/250','2025.06.05'],['Glacier front','f/9 · 1/400','2025.05.24'] ] },
  ],
  socials: [
    ['Email','victor@brasil.photo','mailto:victor@brasil.photo'],
    ['Instagram','@victorbrasil','https://instagram.com/victorbrasil'],
    ['GitHub','victorbrasil','https://github.com/victorbrasil'],
    ['LinkedIn','in/victorbrasil','https://linkedin.com/in/victorbrasil'],
    ['Spotify','Victor Brasil','https://open.spotify.com/user/victorbrasil'],
  ],
};
