# victorbrasil-photos

Cloudflare Worker that fronts the private R2 `photos` bucket for the website.

## What it does

- `GET /library` lists R2 objects and returns a gallery manifest.
- `GET /image/:encodedKey?w=960` returns a transformed WebP derivative.
- A 15-minute cron scans private originals and refreshes the safe metadata manifest.
- `GET /metadata/refresh?limit=40&token=...` exists as a token-gated manual refresh path.
- Original R2 objects stay private.
- Displayed derivatives are generated through the Images binding, so public image responses do not expose invisible EXIF/GPS metadata.
- The private source route is token-gated with `SOURCE_TOKEN`; it is used only internally by Cloudflare's image transform fetch.

The metadata manifest lives at `_system/photo-metadata.json` inside the private R2 bucket and is filtered out of public library counts. It keeps only approved display fields: capture date, camera, lens, aperture, shutter, ISO, and focal length. GPS coordinates are not emitted; the public manifest only exposes `metadata.gpsFound` and `metadata.gpsPublic = false`.

Current web-ready source formats are JPEG, PNG, and WebP. DNG/RAF/HEIC stay in the private archive until an ingest step creates derivatives.

## Deploy

Run from this folder once Wrangler is authenticated:

```sh
wrangler secret put SOURCE_TOKEN
wrangler secret put METADATA_REFRESH_TOKEN
wrangler deploy
```

The site defaults to:

```txt
https://victorbrasil-photos.chosenvictor12.workers.dev
```

Override locally with `VITE_PHOTOS_API` if needed.
