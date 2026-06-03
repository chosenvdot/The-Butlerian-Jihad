import { useEffect, useMemo, useState } from 'react'
import { PHOTO_API, VBDATA } from './data'

let cachedLibrary = null

export function usePhotoLibrary(fallbackData = VBDATA) {
  const fallback = useMemo(() => makeFallbackLibrary(fallbackData), [fallbackData])
  const [library, setLibrary] = useState(cachedLibrary || fallback)

  useEffect(() => {
    let alive = true

    fetch(`${PHOTO_API}/library`)
      .then(response => {
        if (!response.ok) throw new Error(`photo library ${response.status}`)
        return response.json()
      })
      .then(payload => {
        const next = normalizeLibrary(payload, fallback)
        cachedLibrary = next
        if (alive) setLibrary(next)
      })
      .catch(() => {
        if (alive) setLibrary(current => ({ ...current, loading: false }))
      })

    return () => { alive = false }
  }, [fallback])

  return library
}

export function normalizeLibrary(payload, fallback) {
  if (!payload || !Array.isArray(payload.albums) || payload.albums.length === 0) return fallback

  const albums = payload.albums.map(album => ({
    id: album.id,
    name: album.name,
    places: album.places || album.name,
    totalCount: album.totalCount || (album.photos || []).length,
    photos: (album.photos || []).map(photo => ({
      ...photo,
      place: photo.title,
      exp: bestMeta(photo),
      date: photo.capturedAt ? displayDate(photo.capturedAt) : '',
      albumId: album.id,
      album: album.name,
    })),
  }))

  return {
    source: 'r2',
    loading: false,
    generatedAt: payload.generatedAt,
    privacy: payload.privacy,
    stats: payload.stats || countLibrary(albums),
    albums,
  }
}

export function makeFallbackLibrary(data = VBDATA) {
  const albums = data.albums || []
  return {
    source: 'static',
    loading: true,
    generatedAt: null,
    privacy: null,
    stats: countLibrary(albums),
    albums,
  }
}

export function frameTitle(frame) {
  if (Array.isArray(frame)) return frame[0]
  return frame.title || frame.place || frame.filename || 'PHOTO'
}

export function frameMeta(frame) {
  if (Array.isArray(frame)) return frame[1]
  return frame.exp || bestMeta(frame)
}

export function frameDate(frame) {
  if (Array.isArray(frame)) return frame[2]
  return frame.capturedAt ? displayDate(frame.capturedAt) : ''
}

export function frameSortDate(frame) {
  if (Array.isArray(frame)) return frame[2] || ''
  return frame.capturedAt || ''
}

export function frameIndex(frame) {
  const date = frameDate(frame)
  if (!date) return null
  return date.length >= 10 ? date.slice(5) : date
}

export function frameSrc(frame, width = 960, options = {}) {
  if (!frame || Array.isArray(frame)) return null
  if (Object.keys(options).length === 0 && frame.variants) {
    if (width <= 480 && frame.variants.thumb) return frame.variants.thumb
    if (width <= 1100 && frame.variants.medium) return frame.variants.medium
    if (frame.variants.large) return frame.variants.large
  }
  if (!frame.image) return null
  return imageUrl(frame.image, { ...options, w: width, h: transformHeight(width, options) })
}

export function frameFullSrc(frame) {
  return frameOriginalSrc(frame) || frameFullFallbackSrc(frame)
}

export function frameFullFallbackSrc(frame) {
  if (!frame || Array.isArray(frame) || !frame.image) return null
  return imageUrl(frame.image, { w: 12000, q: 98, fit: 'scale-down' })
}

function frameOriginalSrc(frame) {
  if (!frame || Array.isArray(frame)) return null
  if (frame.full) return frame.full
  if (frame.id) return absoluteUrl(`/full/${frame.id}`)
  return null
}

export function frameSrcSet(frame, options = {}) {
  if (!frame || Array.isArray(frame) || !frame.image) return undefined
  const widths = options.widths || [420, 960, 1600]
  return widths.map(width => {
    return `${imageUrl(frame.image, { ...options, w: width, h: transformHeight(width, options) })} ${width}w`
  }).join(', ')
}

export function statsLabel(library) {
  const stats = library.stats || countLibrary(library.albums || [])
  return `${stats.displayable} PHOTOS`
}

export function albumCountLabel(album) {
  const visible = (album.photos || []).length
  return `${visible} PHOTOS`
}

function bestMeta(frame) {
  if (!frame || Array.isArray(frame)) return ''
  if (frame.camera && cameraUsesSeparateLens(frame.camera) && frame.lens) return `${frame.camera} - ${frame.lens}`
  if (frame.camera) return frame.camera
  if (frame.lens) return frame.lens
  if (frame.exposure) return frame.exposure
  return ''
}

function cameraUsesSeparateLens(camera) {
  const value = String(camera || '').toLowerCase()
  if (!value) return false
  if (value.includes('iphone')) return false
  if (value.includes('powershot')) return false
  return true
}

function countLibrary(albums) {
  const displayable = albums.reduce((sum, album) => sum + ((album.photos && album.photos.length) || 0), 0)
  const total = albums.reduce((sum, album) => sum + (album.totalCount || ((album.photos && album.photos.length) || 0)), 0)
  return { displayable, total, raw: Math.max(0, total - displayable), byExtension: {} }
}

function absoluteUrl(value) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `${PHOTO_API}${value}`
}

function imageUrl(path, params) {
  const url = new URL(absoluteUrl(path))
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '' && key !== 'widths' && key !== 'ratio') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

function transformHeight(width, options) {
  if (options.ratio) return Math.round(width / options.ratio)
  return options.h
}

function displayDate(value) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})[-.](\d{2})[-.](\d{2})/)
  if (match) return `${match[1]}.${match[2]}.${match[3]}`
  return String(value)
}
