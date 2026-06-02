// "Now Playing / Last Played" proxy for the victorbrasil site.
//
// Holds the long-lived Spotify refresh token as a Worker secret, swaps it for a
// short-lived access token on demand, and proxies Spotify's player API. Results
// are cached in KV (~45s) so the pill is fast and we never hammer Spotify.
//
// Secrets (set with `wrangler secret put`): SPOTIFY_CLIENT_ID,
// SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN.
// Var: ALLOWED_ORIGINS (comma-separated site origins permitted to call this).

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'
const CACHE_KEY = 'last-played'
const CACHE_TTL = 60 // seconds (KV minimum is 60)

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405, cors)

    const url = new URL(request.url)
    if (url.pathname !== '/last-played' && url.pathname !== '/') {
      return json({ error: 'not found' }, 404, cors)
    }

    try {
      // Serve from cache when warm.
      const cached = await env.SPOTIFY_KV.get(CACHE_KEY)
      if (cached) {
        return new Response(cached, { headers: { ...cors, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } })
      }

      const access = await getAccessToken(env)
      const payload = await fetchTrack(access)
      const body = JSON.stringify(payload)
      await env.SPOTIFY_KV.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL })
      return new Response(body, { headers: { ...cors, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } })
    } catch (err) {
      return json({ error: String((err && err.message) || err) }, 502, cors)
    }
  },
}

// Trade the refresh token for a fresh access token.
async function getAccessToken(env) {
  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN }),
  })
  if (!res.ok) throw new Error(`spotify token ${res.status}`)
  const data = await res.json()
  return data.access_token
}

// Prefer a currently-playing track; fall back to the most recently played.
async function fetchTrack(access) {
  const auth = { headers: { Authorization: `Bearer ${access}` } }

  const now = await fetch(NOW_URL, auth)
  if (now.status === 200) {
    const d = await now.json()
    if (d && d.item) return shape(d.item, true, null)
  }

  const recent = await fetch(RECENT_URL, auth)
  if (recent.status === 200) {
    const d = await recent.json()
    const it = d.items && d.items[0]
    if (it && it.track) return shape(it.track, false, it.played_at)
  }

  return empty()
}

function shape(track, isPlaying, playedAt) {
  const images = (track.album && track.album.images) || []
  const img = images[images.length - 1] // smallest available
  return {
    isPlaying,
    title: track.name,
    artist: (track.artists || []).map(a => a.name).join(', '),
    album: (track.album && track.album.name) || null,
    url: (track.external_urls && track.external_urls.spotify) || null,
    image: (img && img.url) || null,
    playedAt: playedAt || null,
  }
}

function empty() {
  return { isPlaying: false, title: null, artist: null, album: null, url: null, image: null, playedAt: null }
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const ok = allowed.length === 0 || allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': ok ? (origin || '*') : (allowed[0] || '*'),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}
