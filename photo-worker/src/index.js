// R2-backed photography API for victorbrasil.
//
// The bucket stays private. Public image responses are generated through the
// Cloudflare Images binding as WebP derivatives, so invisible EXIF/GPS metadata
// is not exposed with the displayed files.

const DISPLAYABLE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp'])
const RAW_EXT = new Set(['dng', 'raf', 'raw', 'arw', 'cr2', 'cr3', 'nef', 'orf'])
const METADATA_EXT = new Set([...DISPLAYABLE_EXT, ...RAW_EXT, 'heic'])
const DEFAULT_LIMIT = 1000
const METADATA_KEY = '_system/photo-metadata.json'
const SYSTEM_PREFIX = '_system/'
const METADATA_SCAN_BYTES = 1024 * 1024
const DEFAULT_METADATA_LIMIT = 16
const MAX_METADATA_LIMIT = 40

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405, cors)

    const url = new URL(request.url)

    try {
      if (url.pathname === '/' || url.pathname === '/library') {
        const library = await buildLibrary(url, env)
        return json(library, 200, {
          ...cors,
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        })
      }

      if (url.pathname === '/metadata/refresh') {
        if (!isMetadataRefreshAuthorized(url, env)) {
          return json({ error: 'not found' }, 404, cors)
        }
        const result = await refreshMetadataEndpoint(url, env, cors)
        return json(result, 200, { ...cors, 'Cache-Control': 'no-store' })
      }

      if (url.pathname.startsWith('/__source/')) {
        return sourceResponse(request, env)
      }

      if (url.pathname.startsWith('/full/')) {
        return fullResponse(request, env, cors)
      }

      if (url.pathname.startsWith('/image/')) {
        return imageResponse(request, env, cors)
      }

      return json({ error: 'not found' }, 404, cors)
    } catch (err) {
      return json({ error: String((err && err.message) || err) }, 502, cors)
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduledMetadataRefresh(env))
  },
}

async function buildLibrary(url, env) {
  const objects = await listAll(env.PHOTOS)
  const metadataManifest = await loadMetadataManifest(env.PHOTOS)
  const allFrames = objects.map(object => shapeFrame(object, url.origin, metadataManifest))
  const displayFrames = allFrames.filter(frame => frame.displayable)
  const byAlbum = new Map()
  const totalByAlbum = countBy(allFrames, frame => frame.albumId)

  for (const frame of displayFrames) {
    const id = frame.albumId
    if (!byAlbum.has(id)) {
      byAlbum.set(id, {
        id,
        name: albumName(id),
        places: albumName(id),
        totalCount: totalByAlbum[id] || 0,
        photos: [],
      })
    }
    byAlbum.get(id).photos.push(frame)
  }

  for (const album of byAlbum.values()) {
    album.photos.sort((a, b) => (b.sortDate || '').localeCompare(a.sortDate || ''))
  }

  const extCounts = countBy(allFrames, frame => frame.format.toLowerCase())
  const rawCount = allFrames.filter(frame => frame.raw).length

  return {
    generatedAt: new Date().toISOString(),
    bucket: 'photos',
    privacy: {
      originalsPublic: false,
      displayedDerivativesStripMetadata: true,
      gpsPublic: false,
    },
    stats: {
      total: allFrames.length,
      displayable: displayFrames.length,
      raw: rawCount,
      byExtension: extCounts,
    },
    albums: [...byAlbum.values()].sort((a, b) => albumUpdated(b).localeCompare(albumUpdated(a))),
  }
}

async function listAll(bucket) {
  const objects = []
  let cursor

  do {
    const listed = await bucket.list({ limit: DEFAULT_LIMIT, cursor })
    objects.push(...listed.objects.filter(object => !object.key.startsWith(SYSTEM_PREFIX)))
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)

  return objects
}

async function refreshMetadataEndpoint(url, env) {
  const limit = clampInt(url.searchParams.get('limit'), 1, MAX_METADATA_LIMIT, DEFAULT_METADATA_LIMIT)
  const objects = await listAll(env.PHOTOS)
  const manifest = await loadMetadataManifest(env.PHOTOS)
  const result = await refreshMetadata(env.PHOTOS, objects, manifest, limit)
  return {
    scanned: result.scanned,
    remaining: result.remaining,
    totalEntries: Object.keys(result.manifest.entries).length,
    manifestKey: METADATA_KEY,
  }
}

function isMetadataRefreshAuthorized(url, env) {
  return !!env.METADATA_REFRESH_TOKEN && url.searchParams.get('token') === env.METADATA_REFRESH_TOKEN
}

async function runScheduledMetadataRefresh(env) {
  const objects = await listAll(env.PHOTOS)
  const manifest = await loadMetadataManifest(env.PHOTOS)
  return refreshMetadata(env.PHOTOS, objects, manifest, MAX_METADATA_LIMIT)
}

async function loadMetadataManifest(bucket) {
  const object = await bucket.get(METADATA_KEY)
  if (!object) return emptyMetadataManifest()

  try {
    const parsed = JSON.parse(await object.text())
    return {
      version: 1,
      generatedAt: parsed.generatedAt || null,
      entries: parsed.entries && typeof parsed.entries === 'object' ? parsed.entries : {},
    }
  } catch {
    return emptyMetadataManifest()
  }
}

function emptyMetadataManifest() {
  return { version: 1, generatedAt: null, entries: {} }
}

async function refreshMetadata(bucket, objects, manifest, limit) {
  const candidates = objects
    .filter(object => METADATA_EXT.has(extension(object.key)))
    .filter(object => metadataIsStale(object, manifest.entries[object.key]))

  const batch = candidates.slice(0, limit)

  for (const object of batch) {
    manifest.entries[object.key] = await extractObjectMetadata(bucket, object)
  }

  if (batch.length) {
    manifest.generatedAt = new Date().toISOString()
    await bucket.put(METADATA_KEY, JSON.stringify(manifest), {
      httpMetadata: { contentType: 'application/json' },
    })
  }

  return {
    scanned: batch.length,
    remaining: Math.max(0, candidates.length - batch.length),
    manifest,
  }
}

function metadataIsStale(object, entry) {
  if (!entry) return true
  if (entry.etag !== object.etag) return true
  if (entry.size !== object.size) return true
  return false
}

async function extractObjectMetadata(bucket, object) {
  const ext = extension(object.key)
  const entry = {
    key: object.key,
    etag: object.etag || null,
    size: object.size || 0,
    uploaded: toIso(object.uploaded),
    parsedAt: new Date().toISOString(),
    parser: 'exif-tiff-v1',
    status: 'pending',
    gpsFound: false,
    approved: {},
  }

  try {
    const head = await bucket.get(object.key, { range: { offset: 0, length: METADATA_SCAN_BYTES } })
    if (!head) {
      entry.status = 'missing'
      return entry
    }

    const buffer = await head.arrayBuffer()
    const parsed = parseMetadataBuffer(buffer, ext)
    entry.status = parsed.status
    entry.gpsFound = parsed.gpsFound
    entry.approved = parsed.approved
    return entry
  } catch (error) {
    entry.status = 'error'
    entry.error = String((error && error.message) || error)
    return entry
  }
}

function parseMetadataBuffer(buffer, ext) {
  if (ext === 'heic') return { status: 'unsupported-heic', gpsFound: false, approved: {} }

  const located = locateTiffMetadata(buffer, ext)
  if (!located) return { status: 'not-found', gpsFound: false, approved: {} }

  const parsed = parseTiff(buffer, located.offset)
  if (!parsed) return { status: 'parse-failed', gpsFound: false, approved: {} }

  return {
    status: 'parsed',
    gpsFound: parsed.gpsFound,
    approved: approvedMetadata(parsed.tags),
  }
}

function locateTiffMetadata(buffer, ext) {
  const bytes = new Uint8Array(buffer)

  if (looksLikeTiff(bytes, 0)) return { offset: 0, container: ext || 'tiff' }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    const jpegOffset = locateJpegExif(bytes)
    if (jpegOffset != null) return { offset: jpegOffset, container: 'jpeg' }
  }

  if (asciiAt(bytes, 0, 'RIFF') && asciiAt(bytes, 8, 'WEBP')) {
    const webpOffset = locateWebpExif(bytes)
    if (webpOffset != null) return { offset: webpOffset, container: 'webp' }
  }

  const exifOffset = findAscii(bytes, 'Exif\0\0')
  if (exifOffset >= 0 && looksLikeTiff(bytes, exifOffset + 6)) {
    return { offset: exifOffset + 6, container: 'embedded-exif' }
  }

  const tiffOffset = findTiffHeader(bytes)
  if (tiffOffset >= 0) return { offset: tiffOffset, container: 'embedded-tiff' }

  return null
}

function locateJpegExif(bytes) {
  let offset = 2
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1]
    if (marker === 0xda || marker === 0xd9) return null
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3]
    if (length < 2 || offset + 2 + length > bytes.length) return null
    const payload = offset + 4
    if (marker === 0xe1 && asciiAt(bytes, payload, 'Exif\0\0') && looksLikeTiff(bytes, payload + 6)) {
      return payload + 6
    }
    offset += 2 + length
  }
  return null
}

function locateWebpExif(bytes) {
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const chunk = ascii(bytes, offset, 4)
    const size = readUint32Le(bytes, offset + 4)
    const payload = offset + 8
    if (chunk === 'EXIF' && looksLikeTiff(bytes, payload)) return payload
    offset = payload + size + (size % 2)
  }
  return null
}

function findTiffHeader(bytes) {
  for (let index = 0; index + 8 < bytes.length; index += 1) {
    if (looksLikeTiff(bytes, index)) return index
  }
  return -1
}

function looksLikeTiff(bytes, offset) {
  if (offset < 0 || offset + 8 > bytes.length) return false
  const little = bytes[offset] === 0x49 && bytes[offset + 1] === 0x49 && bytes[offset + 2] === 0x2a && bytes[offset + 3] === 0x00
  const big = bytes[offset] === 0x4d && bytes[offset + 1] === 0x4d && bytes[offset + 2] === 0x00 && bytes[offset + 3] === 0x2a
  if (!little && !big) return false
  const firstIfd = little ? readUint32Le(bytes, offset + 4) : readUint32Be(bytes, offset + 4)
  return firstIfd > 0 && firstIfd < bytes.length - offset
}

function parseTiff(buffer, base) {
  const view = new DataView(buffer)
  const little = view.getUint8(base) === 0x49 && view.getUint8(base + 1) === 0x49
  const big = view.getUint8(base) === 0x4d && view.getUint8(base + 1) === 0x4d
  if (!little && !big) return null
  if (u16(view, base + 2, little) !== 42) return null

  const firstIfd = u32(view, base + 4, little)
  const ifd0 = parseIfd(view, base, firstIfd, little)
  if (!ifd0) return null

  const exifOffset = numberValue(ifd0.values[0x8769])
  const gpsOffset = numberValue(ifd0.values[0x8825])
  const exif = exifOffset ? parseIfd(view, base, exifOffset, little) : null

  return {
    gpsFound: !!gpsOffset,
    tags: { ...ifd0.values, ...(exif ? exif.values : {}) },
  }
}

function parseIfd(view, base, ifdOffset, little) {
  const offset = base + ifdOffset
  if (offset < 0 || offset + 2 > view.byteLength) return null
  const count = u16(view, offset, little)
  if (count > 512 || offset + 2 + count * 12 > view.byteLength) return null

  const values = {}
  for (let index = 0; index < count; index += 1) {
    const entry = offset + 2 + index * 12
    const tag = u16(view, entry, little)
    const type = u16(view, entry + 2, little)
    const itemCount = u32(view, entry + 4, little)
    const value = readTiffValue(view, base, entry + 8, type, itemCount, little)
    if (value != null) values[tag] = value
  }

  return { values }
}

function readTiffValue(view, base, inlineOffset, type, count, little) {
  const typeSize = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 }[type]
  if (!typeSize || count < 0 || count > 10000) return null

  const byteLength = typeSize * count
  const valueOffset = byteLength <= 4 ? inlineOffset : base + u32(view, inlineOffset, little)
  if (valueOffset < 0 || valueOffset + byteLength > view.byteLength) return null

  if (type === 2) return readAsciiValue(view, valueOffset, byteLength)
  if (type === 3) return readNumberArray(count, i => u16(view, valueOffset + i * 2, little))
  if (type === 4) return readNumberArray(count, i => u32(view, valueOffset + i * 4, little))
  if (type === 5) return readNumberArray(count, i => rational(view, valueOffset + i * 8, little, false))
  if (type === 9) return readNumberArray(count, i => view.getInt32(valueOffset + i * 4, little))
  if (type === 10) return readNumberArray(count, i => rational(view, valueOffset + i * 8, little, true))
  return null
}

function approvedMetadata(tags) {
  const make = cleanTag(tags[0x010f])
  const model = cleanTag(tags[0x0110])
  const lens = cleanTag(first(tags[0xa434], tags[0xa433]))
  const capturedAt = cleanTag(first(tags[0x9003], tags[0x9004], tags[0x0132]))
  const exposureTime = numberValue(tags[0x829a])
  const fNumber = numberValue(tags[0x829d])
  const iso = numberValue(first(tags[0x8827], tags[0x8833]))
  const focalLength = numberValue(tags[0x920a])
  const camera = cameraName(make, model)

  return removeEmpty({
    capturedAt: normalizeCaptureDate(capturedAt),
    camera,
    cameraMake: make,
    cameraModel: model,
    lens,
    shutter: formatShutter(exposureTime),
    aperture: formatAperture(fNumber),
    iso: iso ? String(Math.round(iso)) : null,
    focalLength: formatFocalLength(focalLength),
  })
}

function metadataSource(customMeta, parsedEntry) {
  if (Object.keys(customMeta).length) return 'r2-custom'
  if (parsedEntry && parsedEntry.status === 'parsed' && Object.keys(parsedEntry.approved || {}).length) return 'exif'
  if (parsedEntry) return parsedEntry.status
  return 'pending-exif'
}

async function imageResponse(request, env, cors) {
  const url = new URL(request.url)
  const encoded = url.pathname.slice('/image/'.length)
  const key = decodeKey(encoded)
  const ext = extension(key)

  if (!DISPLAYABLE_EXT.has(ext)) {
    return json({ error: 'source format is not browser-transformable yet' }, 415, cors)
  }

  const object = await env.PHOTOS.get(key)
  if (!object) return json({ error: 'image not found' }, 404, cors)
  if (!env.SOURCE_TOKEN) return json({ error: 'source token unavailable' }, 503, cors)

  const width = clampInt(url.searchParams.get('w'), 160, 12000, 1200)
  const height = clampInt(url.searchParams.get('h'), 0, 12000, 0)
  const quality = clampInt(url.searchParams.get('q'), 55, 98, 82)
  const fit = imageFit(url.searchParams.get('fit'))
  const gravity = imageGravity(url.searchParams.get('g') || url.searchParams.get('gravity'), fit)

  if (url.searchParams.get('debug') === '1') {
    return json({
      key,
      ext,
      size: object.size,
      width,
      height,
      fit,
      gravity,
      sourceUrl: `${url.origin}/__source/${encoded}`,
      hasImagesBinding: !!env.IMAGES,
      imageBindingKeys: env.IMAGES ? Object.keys(env.IMAGES) : [],
    }, 200, cors)
  }

  const sourceUrl = new URL(`/__source/${encoded}`, url.origin)
  sourceUrl.searchParams.set('token', env.SOURCE_TOKEN)

  const image = { width, fit, quality, format: 'webp', metadata: 'none' }
  if (height) image.height = height
  if (gravity) image.gravity = gravity

  const transformed = await fetch(sourceUrl, {
    cf: { image, cacheEverything: true, cacheTtl: 31536000 },
  })
  const headers = new Headers(transformed.headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers,
  })
}

async function sourceResponse(request, env) {
  const url = new URL(request.url)
  if (!env.SOURCE_TOKEN || url.searchParams.get('token') !== env.SOURCE_TOKEN) {
    return new Response('not found', { status: 404 })
  }

  const encoded = url.pathname.slice('/__source/'.length)
  const key = decodeKey(encoded)
  const object = await env.PHOTOS.get(key)
  if (!object) return new Response('not found', { status: 404 })

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata && object.httpMetadata.contentType ? object.httpMetadata.contentType : 'application/octet-stream',
      'Cache-Control': 'no-store',
    },
  })
}

async function fullResponse(request, env, cors) {
  const url = new URL(request.url)
  const encoded = url.pathname.slice('/full/'.length)
  const key = decodeKey(encoded)
  const ext = extension(key)

  if (!DISPLAYABLE_EXT.has(ext)) {
    return json({ error: 'full source format is not browser-displayable' }, 415, cors)
  }

  const manifest = await loadMetadataManifest(env.PHOTOS)
  const metadata = manifest.entries[key]
  if (metadata && metadata.gpsFound) {
    return json({ error: 'full source unavailable for gps-bearing image' }, 403, cors)
  }

  const object = await env.PHOTOS.get(key)
  if (!object) return json({ error: 'image not found' }, 404, cors)

  const headers = new Headers(cors)
  headers.set('Content-Type', object.httpMetadata && object.httpMetadata.contentType ? object.httpMetadata.contentType : contentTypeForExtension(ext))
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('Content-Disposition', 'inline')
  headers.set('X-Content-Type-Options', 'nosniff')
  if (object.size) headers.set('Content-Length', String(object.size))

  return new Response(object.body, { headers })
}

function shapeFrame(object, origin, metadataManifest) {
  const key = object.key
  const ext = extension(key)
  const parsedEntry = metadataManifest.entries[key]
  const parsedMeta = parsedEntry && parsedEntry.approved ? parsedEntry.approved : {}
  const customMeta = object.customMetadata || {}
  const meta = { ...parsedMeta, ...customMeta }
  const displayable = DISPLAYABLE_EXT.has(ext)
  const id = encodeKey(key)
  const uploaded = toIso(object.uploaded)
  const capturedAt = first(meta.capturedAt, meta.captureDate, meta.dateTaken, meta.date)
  const title = first(meta.title, meta.caption, titleFromKey(key))
  const camera = first(meta.camera, meta.cameraModel, meta.model)
  const lens = first(meta.lens, meta.lensModel)
  const exposure = exposureLine(meta)
  const image = displayable ? `/image/${id}` : null

  return {
    id,
    key,
    filename: key.split('/').pop(),
    albumId: albumId(key),
    title,
    format: ext.toUpperCase(),
    contentType: object.httpMetadata && object.httpMetadata.contentType,
    size: object.size || 0,
    uploaded,
    capturedAt: capturedAt || null,
    sortDate: sortableDate(capturedAt),
    date: displayDate(capturedAt),
    camera: camera || null,
    lens: lens || null,
    exposure: exposure || null,
    raw: RAW_EXT.has(ext),
    displayable,
    metadata: {
      source: metadataSource(customMeta, parsedEntry),
      gpsPublic: false,
      gpsFound: !!(parsedEntry && parsedEntry.gpsFound),
      parsedAt: parsedEntry ? parsedEntry.parsedAt : null,
    },
    image,
    variants: displayable ? {
      thumb: `${origin}${image}?w=420`,
      medium: `${origin}${image}?w=960`,
      large: `${origin}${image}?w=1600`,
    } : null,
  }
}

function exposureLine(meta) {
  const parts = []
  if (meta.aperture) parts.push(meta.aperture)
  if (meta.shutter) parts.push(meta.shutter)
  if (meta.iso) parts.push(`ISO ${meta.iso}`)
  if (meta.focalLength) parts.push(meta.focalLength)
  return parts.join(' - ')
}

function titleFromKey(key) {
  return key
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim()
}

function albumId(key) {
  return key.includes('/') ? key.split('/')[0] : 'archive'
}

function albumName(id) {
  if (id === 'archive') return 'Archive'
  return id.replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

function albumUpdated(album) {
  return album.photos[0] && album.photos[0].sortDate ? album.photos[0].sortDate : ''
}

function displayDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})[-.:](\d{2})[-.:](\d{2})/)
  if (match) return `${match[1]}.${match[2]}.${match[3]}`
  return String(value)
}

function sortableDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})[-.:](\d{2})[-.:](\d{2})(?:[ T](\d{2})[:.](\d{2})[:.](\d{2}))?/)
  if (!match) return String(value)
  return `${match[1]}-${match[2]}-${match[3]}${match[4] ? `T${match[4]}:${match[5]}:${match[6]}` : ''}`
}

function extension(key) {
  const match = String(key).toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

function contentTypeForExtension(ext) {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'application/octet-stream'
}

function normalizeCaptureDate(value) {
  if (!value) return null
  const match = String(value).trim().match(/^(\d{4})[:.-](\d{2})[:.-](\d{2})(?:[ T](\d{2})[:.](\d{2})[:.](\d{2}))?/)
  if (!match) return String(value).trim()
  return `${match[1]}-${match[2]}-${match[3]}${match[4] ? `T${match[4]}:${match[5]}:${match[6]}` : ''}`
}

function u16(view, offset, little) {
  return view.getUint16(offset, little)
}

function u32(view, offset, little) {
  return view.getUint32(offset, little)
}

function rational(view, offset, little, signed) {
  const numerator = signed ? view.getInt32(offset, little) : view.getUint32(offset, little)
  const denominator = signed ? view.getInt32(offset + 4, little) : view.getUint32(offset + 4, little)
  if (!denominator) return null
  return numerator / denominator
}

function readAsciiValue(view, offset, byteLength) {
  let value = ''
  for (let index = 0; index < byteLength; index += 1) {
    const code = view.getUint8(offset + index)
    if (code === 0) break
    value += String.fromCharCode(code)
  }
  return value.trim()
}

function readNumberArray(count, reader) {
  const values = []
  for (let index = 0; index < count; index += 1) values.push(reader(index))
  return count === 1 ? values[0] : values
}

function readUint32Le(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0
}

function readUint32Be(bytes, offset) {
  return (((bytes[offset] << 24) >>> 0) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0
}

function asciiAt(bytes, offset, text) {
  if (offset < 0 || offset + text.length > bytes.length) return false
  for (let index = 0; index < text.length; index += 1) {
    if (bytes[offset + index] !== text.charCodeAt(index)) return false
  }
  return true
}

function ascii(bytes, offset, length) {
  let value = ''
  for (let index = 0; index < length && offset + index < bytes.length; index += 1) {
    value += String.fromCharCode(bytes[offset + index])
  }
  return value
}

function findAscii(bytes, text) {
  for (let offset = 0; offset + text.length <= bytes.length; offset += 1) {
    if (asciiAt(bytes, offset, text)) return offset
  }
  return -1
}

function numberValue(value) {
  if (Array.isArray(value)) return numberValue(value[0])
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function cleanTag(value) {
  if (Array.isArray(value)) return cleanTag(value[0])
  if (value == null) return null
  const cleaned = String(value).replace(/\u0000/g, '').replace(/\s+/g, ' ').trim()
  return cleaned || null
}

function cameraName(make, model) {
  if (!make && !model) return null
  if (!make) return model
  if (!model) return make
  return model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`
}

function removeEmpty(object) {
  const result = {}
  for (const [key, value] of Object.entries(object)) {
    if (value != null && String(value).trim() !== '') result[key] = value
  }
  return result
}

function formatAperture(value) {
  if (!value) return null
  return `f/${roundNice(value)}`
}

function formatFocalLength(value) {
  if (!value) return null
  return `${roundNice(value)}mm`
}

function formatShutter(value) {
  if (!value) return null
  if (value >= 1) return `${roundNice(value)}s`
  const denominator = Math.round(1 / value)
  return denominator > 0 ? `1/${denominator}` : null
}

function roundNice(value) {
  if (!Number.isFinite(value)) return value
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

function encodeKey(key) {
  const bytes = new TextEncoder().encode(key)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeKey(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array([...binary].map(char => char.charCodeAt(0)))
  return new TextDecoder().decode(bytes)
}

function countBy(items, fn) {
  const counts = {}
  for (const item of items) {
    const key = fn(item) || 'unknown'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

function clampInt(value, min, max, fallback) {
  const number = Number.parseInt(value, 10)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, number))
}

function imageFit(value) {
  const fit = String(value || 'scale-down').toLowerCase()
  return ['scale-down', 'cover', 'crop', 'contain', 'pad'].includes(fit) ? fit : 'scale-down'
}

function imageGravity(value, fit) {
  if (!['cover', 'crop'].includes(fit)) return null
  const gravity = String(value || 'auto').toLowerCase()
  if (['auto', 'face', 'center', 'left', 'right', 'top', 'bottom'].includes(gravity)) return gravity
  if (/^(0(\.\d+)?|1(\.0+)?)x(0(\.\d+)?|1(\.0+)?)$/.test(gravity)) return gravity
  return 'auto'
}

function toIso(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function first(...values) {
  return values.find(value => value != null && String(value).trim() !== '')
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean)
  const ok = !origin || allowed.length === 0 || allowed.includes(origin)
  const allowOrigin = ok ? (origin || '*') : (allowed[0] || '*')
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}
