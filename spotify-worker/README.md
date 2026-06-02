# victorbrasil-spotify

Tiny Cloudflare Worker that powers the **Last Played / Now Playing** pill on the
home page. Holds the Spotify refresh token as a secret, swaps it for an access
token, proxies the player API, and caches the result in KV (~45s).

Kept as a **separate worker** on purpose: the main `victorbrasil` site deploys
via wrangler's zero-config Vite auto-detect, and adding a config there would
break that. This one is deployed manually.

## Endpoint

`GET /last-played` →

```json
{ "isPlaying": true, "title": "...", "artist": "...", "album": "...",
  "url": "https://open.spotify.com/track/...", "image": "https://...", "playedAt": null }
```

## One-time setup

Steps marked **[you]** require your Spotify login and only you can do them.
Steps marked **[claude]** I do for you with the Cloudflare API token.

1. **[you]** Create a Spotify app: <https://developer.spotify.com/dashboard> → *Create app*.
   - Redirect URI (exact): `http://127.0.0.1:8888/callback`
   - Copy the **Client ID** and **Client Secret**.
2. **[claude]** Create the KV namespace and put its id in `wrangler.toml`:
   `wrangler kv namespace create SPOTIFY_KV`
3. **[claude]** Deploy the worker: `wrangler deploy`
4. **[claude]** Set the production origin allowlist (`ALLOWED_ORIGINS` in `wrangler.toml`)
   and update `SPOTIFY_API` in `src/data.js` with the deployed `*.workers.dev` URL.
5. **[you]** From this folder, authorize + set secrets in one shot:
   `node setup-token.mjs <CLIENT_ID> <CLIENT_SECRET>`
   A browser opens, you click **Agree**, and the three secrets are pushed to the
   worker over stdin (never printed). Done — the pill goes live.

## Refreshing later

Refresh tokens are long-lived. If Spotify ever revokes it, just re-run step 5.
