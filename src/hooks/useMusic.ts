import { useCallback, useEffect, useRef, useState } from 'react'

interface UseMusicOptions {
  src: string
  volume?: number
  loop?: boolean
}

interface UseMusicReturn {
  isPlaying: boolean
  /** False when the file is missing or the format is unsupported */
  isAvailable: boolean
  toggle: () => void
  play: () => Promise<boolean>
  pause: () => void
}

const FADE_MS = 900
const FADE_STEPS = 30
const DEBUG_PREFIX = '[music]'

function logMusic(message: string, details?: Record<string, unknown>) {
  console.log(DEBUG_PREFIX, message, details ?? '')
}

function getAudioState(audio: HTMLAudioElement) {
  return {
    autoplay: audio.autoplay,
    currentSrc: audio.currentSrc,
    currentTime: audio.currentTime,
    duration: Number.isFinite(audio.duration) ? audio.duration : null,
    ended: audio.ended,
    error: audio.error
      ? {
          code: audio.error.code,
          message: audio.error.message,
        }
      : null,
    muted: audio.muted,
    networkState: audio.networkState,
    paused: audio.paused,
    preload: audio.preload,
    readyState: audio.readyState,
    src: audio.getAttribute('src'),
    volume: audio.volume,
  }
}

/**
 * Background audio with gentle fades.
 *
 * Never autoplays on its own — `play()` must be called from a user gesture, or
 * the browser will reject it. If the source 404s or can't decode, `isAvailable`
 * goes false and the caller hides the control instead of erroring.
 */
export function useMusic({ src, volume = 0.3, loop = true }: UseMusicOptions): UseMusicReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeRef = useRef<number | undefined>(undefined)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    const existingAudio = document.getElementById('bg-music')
    const audio =
      existingAudio instanceof HTMLAudioElement ? existingAudio : new Audio(src)
    const ownsAudio = audio !== existingAudio

    logMusic('hook mounted', {
      foundExistingAudio: existingAudio instanceof HTMLAudioElement,
      ownsAudio,
      requestedSrc: src,
    })

    if (ownsAudio || audio.getAttribute('src') !== src) {
      audio.src = src
    }
    audio.loop = loop
    // Don't fetch the track until the guest opens the doors (it's ~4 MB).
    audio.preload = 'none'
    audio.volume = volume
    audioRef.current = audio

    const onError = () => {
      logMusic('audio error event', getAudioState(audio))
      setIsAvailable(false)
      setIsPlaying(false)
    }
    const onEnded = () => {
      logMusic('audio ended event', getAudioState(audio))
      if (!loop) setIsPlaying(false)
    }
    const onPlaying = () => {
      logMusic('audio playing event', getAudioState(audio))
      setIsPlaying(true)
    }
    const onPause = () => {
      logMusic('audio pause event', getAudioState(audio))
      setIsPlaying(false)
    }
    const onCanPlay = () => logMusic('audio canplay event', getAudioState(audio))
    const onLoadedMetadata = () => logMusic('audio loadedmetadata event', getAudioState(audio))

    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    logMusic('audio prepared', getAudioState(audio))
    setIsPlaying(!audio.paused)

    return () => {
      logMusic('hook cleanup', { ownsAudio, state: getAudioState(audio) })
      window.clearInterval(fadeRef.current)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      if (ownsAudio) {
        audio.pause()
        audio.src = ''
      }
      audioRef.current = null
    }
  }, [src, loop, volume])

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const audio = audioRef.current
    if (!audio) return
    window.clearInterval(fadeRef.current)

    const from = audio.volume
    const delta = (target - from) / FADE_STEPS
    let step = 0

    fadeRef.current = window.setInterval(() => {
      step += 1
      const next = from + delta * step
      audio.volume = Math.min(1, Math.max(0, next))
      if (step >= FADE_STEPS) {
        window.clearInterval(fadeRef.current)
        audio.volume = Math.min(1, Math.max(0, target))
        onDone?.()
      }
    }, FADE_MS / FADE_STEPS)
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) {
      logMusic('play requested but no audio element exists')
      return false
    }
    audio.preload = 'auto'
    audio.volume = volume
    logMusic('play requested', getAudioState(audio))

    try {
      await audio.play()
      logMusic('play resolved', getAudioState(audio))
      setIsPlaying(true)
      return true
    } catch (err) {
      logMusic('play rejected', {
        state: getAudioState(audio),
        error:
          err instanceof Error
            ? {
                name: err.name,
                message: err.message,
              }
            : err,
      })
      // Browser autoplay policy blocks attempts that are not tied to a real
      // gesture; missing/undecodable files are reported through the error event.
      setIsPlaying(false)
      if (err instanceof DOMException && err.name !== 'NotAllowedError') {
        setIsAvailable(false)
      }
      return false
    }
  }, [volume])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      logMusic('pause requested but no audio element exists')
      return
    }
    logMusic('pause requested', getAudioState(audio))
    fadeTo(0, () => {
      audio.pause()
      setIsPlaying(false)
    })
  }, [fadeTo])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else void play()
  }, [isPlaying, pause, play])

  // Duck the audio when the guest tabs away; resume when they return
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current
      if (!audio || !isPlaying) return
      if (document.hidden) {
        logMusic('document hidden, pausing', getAudioState(audio))
        audio.pause()
      } else {
        logMusic('document visible, resuming', getAudioState(audio))
        void audio.play().catch((err) => {
          logMusic('visibility resume rejected', {
            state: getAudioState(audio),
            error:
              err instanceof Error
                ? {
                    name: err.name,
                    message: err.message,
                  }
                : err,
          })
          setIsPlaying(false)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [isPlaying])

  return { isPlaying, isAvailable, toggle, play, pause }
}
