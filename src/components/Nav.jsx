import { HOUSE } from '../tokens'
import Pops from './Pops'

const ITEMS = ['Photography', 'Engineering', 'Journal', 'Contact']

// Sticky top bar: rainbow chip + wordmark (home) on the left, section links right.
export default function Nav({ active, onHome, onEnter, H = HOUSE }) {
  return (
    <div className="vb-pad" style={{
      position: 'sticky', top: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '16px 40px',
      borderBottom: `1px solid ${H.line}`, background: 'rgba(239,231,214,0.86)', backdropFilter: 'blur(10px)',
    }}>
      <button onClick={onHome} aria-label="Victor Brasil — home" className="vb-home"
        style={{ display: 'flex', alignItems: 'center', gap: 11, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
        <Pops h={14} w={3} />
        <span style={{ fontFamily: H.mono, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.16em', color: H.ink }}>VICTOR BRASIL</span>
      </button>
      <span className="vb-navlinks" style={{ display: 'flex', gap: 24, fontFamily: H.mono, fontSize: 11.5, letterSpacing: '0.04em', alignItems: 'center' }}>
        {ITEMS.map(it => {
          const k = it.toLowerCase()
          const isActive = active === k
          return (
            <button key={it} onClick={() => onEnter(k)} className="vb-navlink"
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 0 2px',
                color: isActive ? H.ink : H.muted, fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit',
                borderBottom: isActive ? `2px solid ${H.ink}` : '2px solid transparent',
              }}>{it.toUpperCase()}</button>
          )
        })}
      </span>
    </div>
  )
}
