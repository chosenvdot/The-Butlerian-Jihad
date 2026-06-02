// House style tokens — lifted verbatim from the design handoff
// (landing/house.jsx → HOUSE, directions/shared.jsx → FILM.apple).

// Classic Macintosh six-colour rainbow, logo order: green, yellow, orange, red, purple, blue.
export const APPLE = ['#5f8a3e', '#e0ad38', '#d6822c', '#bf4a30', '#7a5a9e', '#3f73a0'];

export const HOUSE = {
  paper:  '#efe7d6', // clean apple beige (page background)
  panel:  '#e7ddc7', // panel beige
  card:   '#f5efe1', // card / pill surface (lighter than paper)
  ink:    '#191307', // near-black espresso — primary text
  ink2:   '#574733', // brown secondary text
  brown:  '#7a5638',
  mocha:  '#6f4b34', // mono labels / eyebrows
  muted:  '#8c8168', // warm gray-tan, de-emphasized
  line:   'rgba(25,19,7,0.16)',
  lineHi: 'rgba(25,19,7,0.55)',
  apple:  APPLE, // [green, yellow, orange, red, purple, blue]
  serif:  '"Newsreader", Georgia, serif',
  sans:   '"Archivo", system-ui, sans-serif',
  mono:   '"Space Mono", monospace',
};
