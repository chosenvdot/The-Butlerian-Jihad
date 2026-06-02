import { HOUSE } from '../tokens'
import { CONTACT_EMAIL } from '../data'
import Pops from './Pops'

export default function Footer({ H = HOUSE }) {
  return (
    <div className="vb-pad" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 40px',
      borderTop: `1px solid ${H.line}`, fontFamily: H.mono, fontSize: 11, color: H.muted,
    }}>
      <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${H.line}` }}>{CONTACT_EMAIL.toUpperCase()}</a>
      <Pops h={11} w={3} />
      <span>© 2026</span>
    </div>
  )
}
