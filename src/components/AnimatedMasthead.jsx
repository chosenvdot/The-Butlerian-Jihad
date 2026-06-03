import { useEffect, useId, useRef, useState } from 'react'
import { HOUSE } from '../tokens'
import Pops from './Pops'

const PHASE_DURS = [6200, 5200, 5600]
const AUDIOWIDE_PALETTE = ['#9b776d', '#9d5125', '#c1974d', '#d4dbd3', '#687061']
const AUDIOWIDE_BAND_WEIGHTS = [1.34, 1.06, 0.8, 0.76, 1.04]

export default function AnimatedMasthead({ H = HOUSE, size = 88 }) {
  const [phase, setPhase] = useState(0) // 0 serif · 1 cursive draw · 2 Audiowide
  const [ready, setReady] = useState(false)
  const [reduced, setReduced] = useState(false)
  const rectRef = useRef(null)
  const uid = useId().replace(/[:]/g, '')

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  // SVG text does not re-layout reliably if web fonts arrive late.
  useEffect(() => {
    if (reduced) { setReady(false); setPhase(0); return }
    let cancelled = false
    const fonts = typeof document !== 'undefined' && document.fonts
    if (!fonts) { setReady(true); return }
    Promise.all([
      fonts.load('500 150px "Newsreader"', 'Victor Brasil'),
      fonts.load('196px "Sacramento"', 'Victor Brasil'),
      fonts.load('400 168px "Audiowide"', 'Victor Brasil'),
    ]).catch(() => {}).then(() => fonts.ready).then(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [reduced])

  useEffect(() => {
    if (!ready || reduced) return
    const t = setTimeout(() => setPhase(p => (p + 1) % 3), PHASE_DURS[phase])
    return () => clearTimeout(t)
  }, [phase, ready, reduced])

  useEffect(() => {
    if (phase !== 1 || !rectRef.current) return
    const rect = rectRef.current
    const W = 1180
    const dur = 1800
    const ease = t => 1 - Math.pow(1 - t, 3)
    let raf
    let start
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
  const stripeStops = A.flatMap((c, i) => [
    <stop key={i + 'a'} offset={(i * 100 / A.length) + '%'} stopColor={c} />,
    <stop key={i + 'b'} offset={((i + 1) * 100 / A.length) + '%'} stopColor={c} />,
  ])
  const txt = { textAnchor: 'middle', dominantBaseline: 'alphabetic', transition: 'opacity .6s ease' }
  const W = 1180, Hh = 230, cx = W / 2, by = 156
  const serifY = by + 9
  const cursiveY = by + 10
  const audioFont = 168
  const audioY = by + 14
  const audioBandTop = audioY - 140
  const audioBandHeight = 156
  const audioBandUnit = audioBandHeight / AUDIOWIDE_BAND_WEIGHTS.reduce((sum, weight) => sum + weight, 0)
  const audioBands = AUDIOWIDE_PALETTE.map((c, i) => {
    const offset = AUDIOWIDE_BAND_WEIGHTS.slice(0, i).reduce((sum, weight) => sum + weight, 0)
    return {
      c,
      y: audioBandTop + offset * audioBandUnit,
      h: AUDIOWIDE_BAND_WEIGHTS[i] * audioBandUnit,
    }
  })

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: Math.round(size * 10.6), margin: '0 auto' }}>
      <div style={{ fontFamily: H.mono, fontSize: 10.5, letterSpacing: '0.42em', color: H.mocha, marginBottom: 12, paddingLeft: '0.42em' }}>PHOTOGRAPHER · ENGINEER</div>
      <svg viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label="Victor Brasil"
        style={{ width: '100%', maxWidth: Math.round(size * 10.6), height: 'auto', display: 'block', margin: '0 auto', overflow: 'visible', opacity: ready ? 1 : 0, transition: 'opacity .18s ease' }}>
        <defs>
          <linearGradient id={uid + 'drawRainbow'} x1="0" y1="0" x2="1" y2="0">{stripeStops}</linearGradient>
          <clipPath id={uid + 'draw'}><rect ref={rectRef} x="-10" y="-70" width={phase === 1 ? 0 : W} height={Hh + 140} /></clipPath>
          {audioBands.map((band, i) => (
            <clipPath key={i} id={uid + 'audioBand' + i} clipPathUnits="userSpaceOnUse">
              <rect x="-10" y={band.y - 1.25} width={W + 20} height={band.h + 2.5} />
            </clipPath>
          ))}
        </defs>
        <text x={cx} y={serifY} style={{ ...txt, fontFamily: H.serif, fontWeight: 500, fontSize: 150, letterSpacing: '-2px', opacity: phase === 0 ? 1 : 0 }} fill={H.ink}>Victor Brasil</text>
        <text key={'cur' + phase} x={cx} y={cursiveY} clipPath={`url(#${uid}draw)`} style={{ ...txt, fontFamily: '"Sacramento", cursive', fontSize: 196, opacity: phase === 1 ? 1 : 0 }} fill={`url(#${uid}drawRainbow)`}>Victor Brasil</text>
        {phase === 2 && (
          <g key={'aud' + phase}>
            {audioBands.map(({ c }, i) => (
              <text
                key={c}
                x={cx}
                y={audioY}
                className="vb-audio-band"
                clipPath={`url(#${uid}audioBand${i})`}
                style={{
                  ...txt,
                  fontFamily: '"Audiowide", system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: audioFont,
                  letterSpacing: '0px',
                  animationDelay: (0.02 + i * 0.045) + 's',
                }}
                fill={c}
              >
                Victor Brasil
              </text>
            ))}
          </g>
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Pops h={5} w={Math.round(size * 0.42)} radius={2} />
      </div>
    </div>
  )
}
