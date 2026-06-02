// data.js — all site content (lifted from landing/house.jsx → VBDATA).
// In production, photography frames/albums and journal posts could move to
// content files or a CMS; the CV is fine as static data.

export const VBDATA = {
  cv: [
    ['Senior Software Engineer', 'Google', '2021 — Now', [
      'Led latency work on a search-adjacent service handling 4B+ daily requests; cut p99 by 38%.',
      'Designed the sharding layer now adopted by three sister teams.',
      'Mentored five engineers; ran the team’s design-review practice.',
    ]],
    ['Software Engineer', 'Stripe', '2018 — 2021', [
      'Built ledger reconciliation tooling for the payments core.',
    ]],
    ['B.S. Computer Science', 'UC Berkeley', '2014 — 2018', [
      'Distributed systems & computational photography.',
    ]],
  ],
  journal: [
    ['2026.04.12', 'Waiting for the blue hour in Lofoten', 'On patience, weather apps, and the frames you don’t take.', 'FIELD', [
      'The forecast said clear at 04:40. I had been awake since three, boots already wet, watching a band of cloud refuse to move off the ridge. This is most of landscape photography: standing somewhere cold, betting on light that may never arrive.',
      'When it finally broke, it lasted about ninety seconds — a wash of cobalt over the peaks before the sun took the colour out of everything. I made four frames. Two of them are sharp. One of those two is the picture.',
      'People ask how many shots a trip like this produces. The honest answer is a handful you keep and a hard drive you don’t. The discipline isn’t in shooting more; it’s in knowing which mornings to get up for, and being there when the ninety seconds happen.',
    ]],
    ['2026.02.28', 'Sharding without tears', 'What photography taught me about distributed systems.', 'ENGINEERING', [
      'A sharding key is a composition decision. You are choosing what sits in the frame together and what gets cropped out — which rows travel as a unit, which queries stay cheap, which ones fall off the edge into a scatter-gather you’ll regret at 3am.',
      'The mistake I see most often is the same one beginners make with a wide lens: trying to fit everything in. A shard that serves every access pattern serves none of them well. Pick the dominant read path the way you pick a subject, and let the rest blur.',
      'We cut p99 latency by 38% not by adding capacity but by re-framing. Same data, different boundaries. The best optimisation, in code and in pictures, is usually subtraction.',
    ]],
    ['2026.01.05', 'A roll of Portra in Porto', 'Notes on shooting film in a city built for it.', 'FIELD', [
      'Thirty-six frames forces a kind of honesty. You stop spraying and start seeing. By the second day in Porto I was down to maybe six exposures and walking past things I would have shot a hundred of on a digital body.',
      'Portra wants the warm light of late afternoon on those tiled facades. I metered for the shadows and let the highlights take care of themselves, which is the whole trick with negative film and the opposite of everything sensors taught me.',
      'The roll is at the lab now. I won’t see it for two weeks, and I’ve made my peace with that. Delayed gratification is underrated — in photography and, lately, in most things.',
    ]],
  ],
  // Albums — each photo is [place, exposure, date]. Cover = most recent photo;
  // album "last updated" = its newest photo date.
  albums: [
    { id: 'north-atlantic', name: 'North Atlantic', places: 'Iceland · Faroe · Lofoten', photos: [
      ['Lofoten · blue hour', 'f/4 · 1/1000', '2026.04.18'], ['Reykjavík', 'f/8 · 1/250', '2026.04.11'], ['Faroe stacks', 'f/16 · 30s', '2026.04.02'], ['Vestrahorn', 'f/11 · 1/125', '2026.03.28'], ['Reine', 'f/5.6 · 1/500', '2026.03.20'],
    ] },
    { id: 'quiet-cities', name: 'Quiet Cities', places: 'Kyoto · Lisbon · Porto', photos: [
      ['Kyoto alley', 'f/2 · 1/125', '2026.03.30'], ['Lisbon tram', 'f/5.6 · 1/500', '2026.03.12'], ['Porto rooftops', 'f/2.8 · 1/160', '2026.02.26'], ['Gion dusk', 'f/1.8 · 1/80', '2026.02.10'],
    ] },
    { id: 'mountains', name: 'Mountains', places: 'Dolomites · Hokkaido', photos: [
      ['Tre Cime', 'f/5.6 · 1/800', '2026.02.14'], ['Hokkaido birches', 'f/8 · 1/2000', '2026.01.22'], ['Seceda ridge', 'f/9 · 1/400', '2026.01.08'],
    ] },
    { id: 'deserts', name: 'Deserts', places: 'Atacama · Namib', photos: [
      ['Atacama stars', 'f/2.8 · 30s', '2025.11.30'], ['Namib dunes', 'f/9 · 1/400', '2025.11.12'], ['Deadvlei', 'f/11 · 1/250', '2025.10.28'], ['Valle de la Luna', 'f/8 · 1/500', '2025.10.15'],
    ] },
    { id: 'patagonia', name: 'Patagonia', places: 'Torres del Paine', photos: [
      ['Torres dawn', 'f/11 · 1/200', '2025.09.20'], ['Grey glacier', 'f/8 · 1/500', '2025.09.08'], ['Guanaco', 'f/4 · 1/1000', '2025.08.30'],
    ] },
    { id: 'svalbard', name: 'Svalbard', places: 'Arctic 78°N', photos: [
      ['Pack ice', 'f/4 · 1/2000', '2025.06.18'], ['Midnight sun', 'f/8 · 1/250', '2025.06.05'], ['Glacier front', 'f/9 · 1/400', '2025.05.24'],
    ] },
  ],
  socials: [
    ['Instagram', '@victorbrasil', 'https://instagram.com/victorbrasil'],
    ['GitHub', 'chosenvdot', 'https://github.com/chosenvdot'],
    ['LinkedIn', 'in/victor-m-brasil', 'https://www.linkedin.com/in/victor-m-brasil/'],
  ],
};

export const SPOTIFY_URL = 'https://open.spotify.com/user/victorbrasil';

// Last-played proxy worker (see spotify-worker/). Filled in with the deployed
// *.workers.dev URL after the first `wrangler deploy`.
export const SPOTIFY_API = 'https://victorbrasil-spotify.chosenvictor12.workers.dev';

export const CONTACT_EMAIL = 'v.brasil8@icloud.com';
