// animated_name.jsx — masthead wordmark as one inline SVG (reliable gradient
// fills + draw reveal; HTML background-clip:text is mangled by the editor's
// text instrumentation). Cycles every few seconds:
// serif (rest) → cursive rainbow that draws itself in → retro Apple
// horizontal-stripe fill → back to serif.
function AnimatedMasthead({ H, size = 88 }) {
  const Pops = window.Pops;
  const [phase, setPhase] = React.useState(0); // 0 serif · 1 cursive · 2 retro
  const rectRef = React.useRef(null);
  const uid = React.useRef('vb' + Math.random().toString(36).slice(2, 7)).current;

  React.useEffect(()=>{
    const durs = [5000, 4400, 3000];
    const t = setTimeout(()=> setPhase(p=>(p+1)%3), durs[phase]);
    return ()=>clearTimeout(t);
  }, [phase]);

  // draw the cursive in (RAF on the clip rect width)
  React.useEffect(()=>{
    if (phase!==1 || !rectRef.current) return;
    const rect = rectRef.current, W = 1180, dur = 1800;
    const ease = t => 1 - Math.pow(1 - t, 3);
    let raf, start;
    const step = (ts)=>{ if(!start) start=ts; const t=Math.min(1,(ts-start)/dur); rect.setAttribute('width',(ease(t)*W).toFixed(1)); if(t<1) raf=requestAnimationFrame(step); };
    rect.setAttribute('width','0');
    raf = requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(raf);
  }, [phase]);

  const A = H.apple;
  const rainbowStops = A.map((c,i)=>(<stop key={i} offset={(i/(A.length-1)*100)+'%'} stopColor={c} />));
  const stripeStops = A.flatMap((c,i)=>[
    <stop key={i+'a'} offset={(i*100/6)+'%'} stopColor={c} />,
    <stop key={i+'b'} offset={((i+1)*100/6)+'%'} stopColor={c} />,
  ]);

  const txt = { textAnchor:'middle', dominantBaseline:'alphabetic', transition:'opacity .6s ease' };
  const W = 1180, Hh = 230, cx = W/2, by = 156;

  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontFamily:H.mono, fontSize:10.5, letterSpacing:'0.42em', color:H.mocha, marginBottom:12, paddingLeft:'0.42em' }}>PHOTOGRAPHER · ENGINEER</div>
      <svg viewBox={`0 0 ${W} ${Hh}`} style={{ width:'100%', maxWidth:Math.round(size*10.6), height:'auto', display:'block', margin:'0 auto', overflow:'visible' }}>
        <defs>
          <linearGradient id={uid+'r'} x1="0" y1="0" x2="1" y2="0">{rainbowStops}</linearGradient>
          <linearGradient id={uid+'s'} x1="0" y1="0" x2="0" y2="1">{stripeStops}</linearGradient>
          <clipPath id={uid+'c'}><rect ref={rectRef} x="-10" y="0" width="0" height={Hh} /></clipPath>
        </defs>
        <text x={cx} y={by} style={{ ...txt, fontFamily:H.serif, fontWeight:500, fontSize:150, letterSpacing:'-2px', opacity: phase===0?1:0 }} fill={H.ink}>Victor Brasil</text>
        <text key={'cur'+phase} x={cx} y={by+6} clipPath={`url(#${uid}c)`} style={{ ...txt, fontFamily:'"Sacramento", cursive', fontSize:196, opacity: phase===1?1:0 }} fill={`url(#${uid}r)`}>Victor Brasil</text>
        <text x={cx} y={by} style={{ ...txt, fontFamily:'"Baloo 2", system-ui, sans-serif', fontWeight:800, fontSize:124, letterSpacing:'1px', opacity: phase===2?1:0 }} fill={`url(#${uid}s)`}>Victor Brasil</text>
      </svg>
      <div style={{ display:'flex', justifyContent:'center', marginTop:6 }}>
        <Pops h={5} w={Math.round(size*0.42)} radius={2} />
      </div>
    </div>
  );
}
window.AnimatedMasthead = AnimatedMasthead;
