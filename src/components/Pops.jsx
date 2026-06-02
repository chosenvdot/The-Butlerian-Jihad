import { HOUSE } from '../tokens'

// The six-colour stripe — tasteful brand mark / divider echoing the rainbow
// Apple logo. Vertical bars by default.
export default function Pops({ h = 18, w = 5, gap = 0, radius = 1, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', gap, verticalAlign: 'middle', borderRadius: radius, overflow: 'hidden', ...style }}>
      {HOUSE.apple.map((c, i) => (
        <span key={i} style={{ width: w, height: h, background: c, display: 'block' }} />
      ))}
    </span>
  )
}
