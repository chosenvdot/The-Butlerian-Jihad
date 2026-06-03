// data.js - all site content.

export const VBDATA = {
  cv: [
    ['Design Manager', 'Amazon Web Services', '2025 - Now', []],
    ['Google', 'Google', '2024 - 2025', []],
    ['Microsoft', 'Microsoft', '2023 - 2024', []],
  ],
  journal: [
    ['2026.04.12', 'Waiting for the blue hour in Lofoten', "On patience, weather apps, and the frames you don't take.", 'FIELD', [
      'The forecast said clear at 04:40. I had been awake since three, boots already wet, watching a band of cloud refuse to move off the ridge. This is most of landscape photography: standing somewhere cold, betting on light that may never arrive.',
      'When it finally broke, it lasted about ninety seconds - a wash of cobalt over the peaks before the sun took the colour out of everything. I made four frames. Two of them are sharp. One of those two is the picture.',
      "People ask how many shots a trip like this produces. The honest answer is a handful you keep and a hard drive you don't. The discipline isn't in shooting more; it's in knowing which mornings to get up for, and being there when the ninety seconds happen.",
    ]],
    ['2026.02.28', 'Sharding without tears', 'What photography taught me about distributed systems.', 'ENGINEERING', [
      "A sharding key is a composition decision. You are choosing what sits in the frame together and what gets cropped out - which rows travel as a unit, which queries stay cheap, which ones fall off the edge into a scatter-gather you'll regret at 3am.",
      'The mistake I see most often is the same one beginners make with a wide lens: trying to fit everything in. A shard that serves every access pattern serves none of them well. Pick the dominant read path the way you pick a subject, and let the rest blur.',
      'We cut p99 latency by 38% not by adding capacity but by re-framing. Same data, different boundaries. The best optimisation, in code and in pictures, is usually subtraction.',
    ]],
    ['2026.01.05', 'A roll of Portra in Porto', 'Notes on shooting film in a city built for it.', 'FIELD', [
      'Thirty-six frames forces a kind of honesty. You stop spraying and start seeing. By the second day in Porto I was down to maybe six exposures and walking past things I would have shot a hundred of on a digital body.',
      'Portra wants the warm light of late afternoon on those tiled facades. I metered for the shadows and let the highlights take care of themselves, which is the whole trick with negative film and the opposite of everything sensors taught me.',
      "The roll is at the lab now. I won't see it for two weeks, and I've made my peace with that. Delayed gratification is underrated - in photography and, lately, in most things.",
    ]],
  ],
  // Albums - each photo is [place, exposure, date]. Cover = most recent photo;
  // album "last updated" = its newest photo date.
  albums: [
    { id: 'north-atlantic', name: 'North Atlantic', places: 'Iceland \u00b7 Faroe \u00b7 Lofoten', photos: [
      ['Lofoten \u00b7 blue hour', 'f/4 \u00b7 1/1000', '2026.04.18'], ['Reykjav\u00edk', 'f/8 \u00b7 1/250', '2026.04.11'], ['Faroe stacks', 'f/16 \u00b7 30s', '2026.04.02'], ['Vestrahorn', 'f/11 \u00b7 1/125', '2026.03.28'], ['Reine', 'f/5.6 \u00b7 1/500', '2026.03.20'],
    ] },
    { id: 'quiet-cities', name: 'Quiet Cities', places: 'Kyoto \u00b7 Lisbon \u00b7 Porto', photos: [
      ['Kyoto alley', 'f/2 \u00b7 1/125', '2026.03.30'], ['Lisbon tram', 'f/5.6 \u00b7 1/500', '2026.03.12'], ['Porto rooftops', 'f/2.8 \u00b7 1/160', '2026.02.26'], ['Gion dusk', 'f/1.8 \u00b7 1/80', '2026.02.10'],
    ] },
    { id: 'mountains', name: 'Mountains', places: 'Dolomites \u00b7 Hokkaido', photos: [
      ['Tre Cime', 'f/5.6 \u00b7 1/800', '2026.02.14'], ['Hokkaido birches', 'f/8 \u00b7 1/2000', '2026.01.22'], ['Seceda ridge', 'f/9 \u00b7 1/400', '2026.01.08'],
    ] },
    { id: 'deserts', name: 'Deserts', places: 'Atacama \u00b7 Namib', photos: [
      ['Atacama stars', 'f/2.8 \u00b7 30s', '2025.11.30'], ['Namib dunes', 'f/9 \u00b7 1/400', '2025.11.12'], ['Deadvlei', 'f/11 \u00b7 1/250', '2025.10.28'], ['Valle de la Luna', 'f/8 \u00b7 1/500', '2025.10.15'],
    ] },
    { id: 'patagonia', name: 'Patagonia', places: 'Torres del Paine', photos: [
      ['Torres dawn', 'f/11 \u00b7 1/200', '2025.09.20'], ['Grey glacier', 'f/8 \u00b7 1/500', '2025.09.08'], ['Guanaco', 'f/4 \u00b7 1/1000', '2025.08.30'],
    ] },
    { id: 'svalbard', name: 'Svalbard', places: 'Arctic 78\u00b0N', photos: [
      ['Pack ice', 'f/4 \u00b7 1/2000', '2025.06.18'], ['Midnight sun', 'f/8 \u00b7 1/250', '2025.06.05'], ['Glacier front', 'f/9 \u00b7 1/400', '2025.05.24'],
    ] },
  ],
  socials: [
    ['Instagram', '@chsnvictor', 'https://instagram.com/chsnvictor'],
    ['X', '@chosenvdot', 'https://x.com/chosenvdot'],
    ['GitHub', 'chosenvdot', 'https://github.com/chosenvdot'],
    ['LinkedIn', 'in/victor-m-brasil', 'https://www.linkedin.com/in/victor-m-brasil/'],
  ],
};

export const SPOTIFY_URL = 'https://open.spotify.com/user/31fpyir2tdzq5ibgleoap3loy2tu?si=29732e33a4e54de7';

// Last-played proxy worker (see spotify-worker/).
export const SPOTIFY_API = 'https://victorbrasil-spotify.chosenvictor12.workers.dev';

// R2-backed photo library proxy (see photo-worker/).
export const PHOTO_API = import.meta.env.VITE_PHOTOS_API || 'https://victorbrasil-photos.chosenvictor12.workers.dev';

export const CONTACT_EMAIL = 'v.brasil8@icloud.com';
export const LOCATION = 'Washington, DC';
