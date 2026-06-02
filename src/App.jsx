import { useEffect, useState } from 'react'
import { HOUSE } from './tokens'
import Section from './components/Section'
import Home from './views/Home'
import PhotoFlow from './views/PhotoFlow'
import Engineering from './views/Engineering'
import Journal from './views/Journal'
import Contact from './views/Contact'

const H = HOUSE

// Per-section masthead metadata (accent dot + kicker + title + right-hand intro).
const SECTION_META = {
  photography: { accent: H.apple[0], kicker: 'GALLERY', title: 'Photography', intro: 'Albums and recent frames from the edges of the map. Full-resolution RAW available per frame.' },
  engineering: { accent: H.apple[5], kicker: 'CURRICULUM', title: 'Engineering', intro: 'Fifteen years of distributed systems. Click a role to expand. PDF available.' },
  journal: { accent: H.apple[2], kicker: 'WRITING', title: 'Journal', intro: 'Field notes and engineering essays. The throughline is patience.' },
  contact: { accent: H.apple[4], kicker: 'SAY HELLO', title: 'Contact', intro: 'For commissions, prints, or engineering work — the inbox is open.' },
}

export default function App() {
  const [view, setView] = useState('home') // home | photography | engineering | journal | contact
  const [photoNav, setPhotoNav] = useState('hub') // hub | recents | albums | album:<id>
  const [journalNav, setJournalNav] = useState(null) // null | <index>

  // Every view change returns to the top.
  useEffect(() => { window.scrollTo(0, 0) }, [view, photoNav, journalNav])

  const enter = k => {
    if (k === 'photography') setPhotoNav('hub')
    if (k === 'journal') setJournalNav(null)
    setView(k)
  }
  const goHome = () => setView('home')

  if (view === 'home') {
    return <Home onHome={goHome} onEnter={enter} />
  }

  const meta = SECTION_META[view] || SECTION_META.photography
  const body = {
    photography: <PhotoFlow nav={photoNav} setNav={setPhotoNav} />,
    engineering: <Engineering />,
    journal: <Journal journalNav={journalNav} setJournalNav={setJournalNav} />,
    contact: <Contact />,
  }[view]

  return (
    <Section key={view} accent={meta.accent} kicker={meta.kicker} title={meta.title} intro={meta.intro}
      active={view} onHome={goHome} onEnter={enter}>
      {body}
    </Section>
  )
}
