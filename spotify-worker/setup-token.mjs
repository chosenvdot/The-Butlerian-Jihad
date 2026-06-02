// One-time Spotify OAuth helper — RUN THIS YOURSELF (it needs your Spotify login).
//
// What it does:
//   1. Opens Spotify's consent page in your browser.
//   2. Captures the redirect on http://127.0.0.1:8888/callback.
//   3. Exchanges the code for a refresh token.
//   4. Pushes CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN straight into the
//      Worker as secrets via `wrangler secret put` — so the refresh token is
//      never printed or pasted anywhere.
//
// Prereqs:
//   - Spotify app created at https://developer.spotify.com/dashboard
//   - Redirect URI registered there EXACTLY: http://127.0.0.1:8888/callback
//   - Run from this folder so wrangler picks up wrangler.toml.
//
// Usage (portable Node is fine):
//   node setup-token.mjs <CLIENT_ID> <CLIENT_SECRET>

import http from 'node:http'
import { spawn } from 'node:child_process'

const [CLIENT_ID, CLIENT_SECRET] = process.argv.slice(2)
const REDIRECT = 'http://127.0.0.1:8888/callback'
const SCOPES = 'user-read-currently-playing user-read-recently-played'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Usage: node setup-token.mjs <CLIENT_ID> <CLIENT_SECRET>')
  process.exit(1)
}

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT,
    show_dialog: 'true',
  })

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:8888')
  if (url.pathname !== '/callback') {
    res.writeHead(404).end()
    return
  }
  const code = url.searchParams.get('code')
  const err = url.searchParams.get('error')
  if (err || !code) {
    res.writeHead(400, { 'Content-Type': 'text/html' }).end(`<h1>Auth failed: ${err || 'no code'}</h1>`)
    server.close()
    process.exit(1)
  }

  try {
    const refreshToken = await exchange(code)
    await setSecret('SPOTIFY_CLIENT_ID', CLIENT_ID)
    await setSecret('SPOTIFY_CLIENT_SECRET', CLIENT_SECRET)
    await setSecret('SPOTIFY_REFRESH_TOKEN', refreshToken)
    res.writeHead(200, { 'Content-Type': 'text/html' })
      .end('<h1>Done ✓</h1><p>Secrets set on the worker. You can close this tab.</p>')
    console.log('\n✓ All three secrets set on victorbrasil-spotify. The pill is now live.')
    server.close()
    process.exit(0)
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/html' }).end(`<h1>Error</h1><pre>${e.message}</pre>`)
    console.error(e)
    server.close()
    process.exit(1)
  }
})

server.listen(8888, '127.0.0.1', () => {
  console.log('Listening on', REDIRECT)
  console.log('Opening Spotify consent page...\n', authUrl, '\n')
  open(authUrl)
})

async function exchange(code) {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  })
  const data = await res.json()
  if (!res.ok || !data.refresh_token) throw new Error('token exchange failed: ' + JSON.stringify(data))
  return data.refresh_token
}

// Feed the secret to wrangler over stdin so it never lands in argv/logs.
function setSecret(name, value) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const p = spawn(cmd, ['wrangler', 'secret', 'put', name], { stdio: ['pipe', 'inherit', 'inherit'] })
    p.on('error', reject)
    p.on('close', code => (code === 0 ? resolve() : reject(new Error(`wrangler secret put ${name} exited ${code}`))))
    p.stdin.write(value + '\n')
    p.stdin.end()
  })
}

function open(u) {
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', u] : [u]
  spawn(cmd, args, { stdio: 'ignore', detached: true }).unref()
}
