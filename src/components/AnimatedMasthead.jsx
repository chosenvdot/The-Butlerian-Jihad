import { useEffect, useId, useRef, useState } from 'react'
import { HOUSE } from '../tokens'
import Pops from './Pops'

// AnimatedMasthead — the wordmark "Victor Brasil" as one inline SVG (reliable
// gradient fills + a draw reveal). Cycles every few seconds:
//   serif (rest) → cursive rainbow that draws itself in → retro Apple stripes → back.
//
// Production notes the handoff flagged:
//  - SVG <text> does not reflow when a web font loads late, so we gate the cycle
//    on the needed faces actually being loaded (document.fonts.load) and remount
//    the cursive layer (key) on phase change to force re-layout.
//  - prefers-reduced-motion: hold the serif, skip the cycle.
const PHASE_DURS = [5000, 4400, 3000]

export default function AnimatedMasthead({ H = HOUSE, size = 88 }) {
  const [phase, setPhase] = useState(0) // 0 serif · 1 cursive · 2 retro
  const [ready, setReady] = useState(false)
  const [reduced, setReduced] = useState(false)
  const rectRef = useRef(null)
  const uid = useId().replace(/[:]/g, '')

  // Respect reduced-motion (and react if the user flips the OS setting).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  // Only begin cycling once the three faces used in the SVG are loaded.
  useEffect(() => {
    if (reduced) { setReady(false); setPhase(0); return }
    let cancelled = false
    const fonts = typeof document !== 'undefined' && document.fonts
    if (!fonts) { setReady(true); return }
    Promise.all([
      fonts.load('500 150px "Newsreader"', 'Victor Brasil'),
      fonts.load('196px "Sacramento"', 'Victor Brasil'),
      fonts.load('400 92px "Audiowide"', 'Victor Brasil'),
    ]).catch(() => {}).then(() => fonts.ready).then(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [reduced])

  // Phase timer.
  useEffect(() => {
    if (!ready || reduced) return
    const t = setTimeout(() => setPhase(p => (p + 1) % 3), PHASE_DURS[phase])
    return () => clearTimeout(t)
  }, [phase, ready, reduced])

  // Draw the cursive in by growing the clip-rect width (RAF, ease-out cubic).
  useEffect(() => {
    if (phase !== 1 || !rectRef.current) return
    const rect = rectRef.current, W = 1180, dur = 1800
    const ease = t => 1 - Math.pow(1 - t, 3)
    let raf, start
    const step = ts => {
      if (!start) start = ts
      const t = Math.min(1, (ts - start) / dur)
      rect.setAttribute('width', (ease(t) * W).toFixed(1))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    rect.setAttribute('width', '0')
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const A = H.apple
  const rainbowStops = A.map((c, i) => <stop key={i} offset={(i / (A.length - 1) * 100) + '%'} stopColor={c} />)
  const stripeStops = A.flatMap((c, i) => [
    <stop key={i + 'a'} offset={(i * 100 / 6) + '%'} stopColor={c} />,
    <stop key={i + 'b'} offset={((i + 1) * 100 / 6) + '%'} stopColor={c} />,
  ])

  const txt = { textAnchor: 'middle', dominantBaseline: 'alphabetic', transition: 'opacity .6s ease' }
  const W = 1180, Hh = 230, cx = W / 2, by = 156

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: Math.round(size * 10.6), margin: '0 auto' }}>
      <div style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.42em', color: H.mocha, marginBottom: 12, paddingLeft: '0.42em' }}>PHOTOGRAPHER · ENGINEER</div>
      <svg viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label="Victor Brasil"
        style={{ width: '100%', maxWidth: Math.round(size * 10.6), height: 'auto', display: 'block', margin: '0 auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={uid + 'r'} x1="0" y1="0" x2="1" y2="0">{rainbowStops}</linearGradient>
          <linearGradient id={uid + 's'} x1="0" y1="0" x2="0" y2="1">{stripeStops}</linearGradient>
          <clipPath id={uid + 'c'}><rect ref={rectRef} x="-10" y="0" width="0" height={Hh} /></clipPath>
        </defs>
        <text x={cx} y={by} style={{ ...txt, fontFamily: H.serif, fontWeight: 500, fontSize: 150, letterSpacing: '-2px', opacity: phase === 0 ? 1 : 0 }} fill={H.ink}>Victor Brasil</text>
        <text key={'cur' + phase} x={cx} y={by + 6} clipPath={`url(#${uid}c)`} style={{ ...txt, fontFamily: '"Sacramento", cursive', fontSize: 196, opacity: phase === 1 ? 1 : 0 }} fill={`url(#${uid}r)`}>Victor Brasil</text>
        <text x={cx} y={by} style={{ ...txt, fontFamily: '"Audiowide", system-ui, sans-serif', fontWeight: 400, fontSize: 92, letterSpacing: '0px', opacity: phase === 2 ? 1 : 0 }} fill={`url(#${uid}s)`}>Victor Brasil</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Pops h={5} w={Math.round(size * 0.42)} radius={2} />
      </div>
    </div>
  )
}
