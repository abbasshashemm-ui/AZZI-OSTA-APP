import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { aiPartialMatches } from '../data/archiveItems'
import {
  analyzeGarmentImage,
  getGeminiErrorMessage,
} from '../lib/geminiAnalysis'
import ImageWithSkeleton from './ImageWithSkeleton'
import './AILookFinder.css'

const PARTIAL_CONFIDENCE_THRESHOLD = 85

function PartialMatchCard({ item, confidence, onSelect }) {
  return (
    <button
      type="button"
      className="partial-match group transition-all duration-500 ease-out"
      onClick={() => onSelect?.(item)}
    >
      <ImageWithSkeleton
        src={item.image}
        alt={item.name}
        wrapperClassName="partial-match__image-wrap"
        imageClassName="partial-match__image transition-transform duration-500 ease-out group-hover:scale-101"
        aspectClassName="aspect-[2/3] w-full"
      />
      <p className="partial-match__confidence">{confidence}%</p>
      <p className="partial-match__name">{item.name}</p>
      <p className="partial-match__code">{item.code}</p>
    </button>
  )
}

export default function AILookFinder({ onMatchComplete, simplified = false }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [analysisState, setAnalysisState] = useState('idle')
  const [lowLightMode, setLowLightMode] = useState(false)
  const [resultRevealed, setResultRevealed] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [analysisError, setAnalysisError] = useState(null)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const resultRef = useRef(null)
  const lastAnalyzedFileRef = useRef(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const startAnalysis = useCallback(async (file) => {
    if (!file) return

    lastAnalyzedFileRef.current = file
    setAnalysisState('loading')
    setResultRevealed(false)
    setMatchResult(null)
    setAnalysisError(null)

    try {
      const result = await analyzeGarmentImage(file)
      setMatchResult(result)
      setAnalysisState('complete')
      setResultRevealed(true)
    } catch (error) {
      setAnalysisError(getGeminiErrorMessage(error))
      setAnalysisState('error')
      setResultRevealed(true)
    }
  }, [])

  const retryAnalysis = useCallback(() => {
    if (lastAnalyzedFileRef.current) {
      startAnalysis(lastAnalyzedFileRef.current)
    }
  }, [startAnalysis])

  const setPreviewFromFile = useCallback(
    (file) => {
      if (!file?.type.startsWith('image/')) return
      stopCamera()
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
      startAnalysis(file)
    },
    [startAnalysis, stopCamera],
  )

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported in this browser.')
      setCameraActive(true)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)
    } catch {
      setCameraError('Unable to access camera. Grant permission or use image upload.')
      setCameraActive(true)
    }
  }, [])

  const captureAndAnalyze = useCallback(() => {
    const video = videoRef.current
    const stream = streamRef.current

    if (video && stream && video.videoWidth > 0) {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          stopCamera()
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return URL.createObjectURL(blob)
          })
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          startAnalysis(file)
        }
      }, 'image/jpeg')
    }
  }, [startAnalysis, stopCamera])

  const isPartial = useMemo(() => {
    if (!lowLightMode || !matchResult) return false
    return matchResult.confidence < PARTIAL_CONFIDENCE_THRESHOLD
  }, [lowLightMode, matchResult])

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraActive])

  useEffect(() => {
    if (
      analysisState === 'complete' &&
      !isPartial &&
      matchResult &&
      onMatchComplete
    ) {
      onMatchComplete(matchResult.item)
    }
  }, [analysisState, isPartial, matchResult, onMatchComplete])

  useEffect(() => {
    if (resultRevealed && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [resultRevealed])

  useEffect(() => {
    return () => {
      stopCamera()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, stopCamera])

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setPreviewFromFile(file)
  }

  const partialConfidence = matchResult?.confidence ?? aiPartialMatches.confidence

  return (
    <div className={`look-finder${simplified ? ' look-finder--simplified' : ''}`}>
      <header className="look-finder__header">
        <h1 className="look-finder__title">
          {simplified ? 'Floor Look Lookup' : 'AI Look Finder'}
        </h1>
        <p className="look-finder__subtitle">
          {simplified
            ? 'Capture or upload to identify a piece on the showroom floor'
            : 'Point, capture, or upload to identify archive pieces'}
        </p>
      </header>

      <div className="look-finder__columns">
        <div className="look-finder__input">
          {!simplified && (
            <label className="look-finder__toggle">
              <input
                type="checkbox"
                checked={lowLightMode}
                onChange={(e) => setLowLightMode(e.target.checked)}
              />
              <span className="look-finder__toggle-track" />
              <span className="look-finder__toggle-label">
                Simulate Low-Lighting Scan
              </span>
            </label>
          )}

          {!cameraActive ? (
            <>
              <div
                className={`look-finder__dropzone${isDragging ? ' look-finder__dropzone--active' : ''}${previewUrl ? ' look-finder__dropzone--filled' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload image"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="look-finder__file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setPreviewFromFile(file)
                    e.target.value = ''
                  }}
                />

                {previewUrl ? (
                  <img
                    className="look-finder__preview transition-opacity duration-500"
                    src={previewUrl}
                    alt="Uploaded garment"
                  />
                ) : (
                  <div className="look-finder__dropzone-content">
                    <span className="look-finder__dropzone-icon" aria-hidden="true">
                      ↑
                    </span>
                    <p className="look-finder__dropzone-text">
                      Drag &amp; drop an image
                    </p>
                    <p className="look-finder__dropzone-hint">or click to browse</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="look-finder__camera-btn transition-all duration-500 ease-out"
                onClick={startCamera}
              >
                Simulate Camera View
              </button>
            </>
          ) : (
            <div className="look-finder__camera">
              {cameraError ? (
                <div className="look-finder__camera-fallback">
                  <div className="look-finder__scan-overlay" aria-hidden="true">
                    <div className="look-finder__scan-grid look-finder__scan-grid--breathing" />
                    <div className="look-finder__scan-target" />
                    <div className="look-finder__scan-corners" />
                  </div>
                  <p className="look-finder__camera-fallback-text">{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="look-finder__video"
                  autoPlay
                  playsInline
                  muted
                />
              )}

              {!cameraError && (
                <div className="look-finder__scan-overlay" aria-hidden="true">
                  <div className="look-finder__scan-grid look-finder__scan-grid--breathing" />
                  <div className="look-finder__scan-target" />
                  <div className="look-finder__scan-corners" />
                  <div className="look-finder__scan-line" />
                </div>
              )}

              <div className="look-finder__camera-actions">
                <button
                  type="button"
                  className="look-finder__scan-btn transition-all duration-500 ease-out"
                  onClick={captureAndAnalyze}
                >
                  Scan &amp; Analyze
                </button>
                <button
                  type="button"
                  className="look-finder__cancel-btn transition-all duration-500 ease-out"
                  onClick={stopCamera}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <aside
          ref={resultRef}
          className={`look-finder__result${resultRevealed ? ' look-finder__result--revealed' : ''}`}
          aria-live="polite"
        >
          <h2 className="look-finder__result-title">AI Analysis Result</h2>

          {analysisState === 'idle' && (
            <div className="look-finder__result-empty">
              <p>Upload or scan a garment to begin analysis.</p>
            </div>
          )}

          {analysisState === 'loading' && (
            <div className="look-finder__skeleton">
              <div className="look-finder__skeleton-image aspect-[2/3] animate-pulse bg-neutral-100/10" />
              <div className="look-finder__skeleton-line look-finder__skeleton-line--wide" />
              <div className="look-finder__skeleton-line" />
              <div className="look-finder__skeleton-line look-finder__skeleton-line--short" />
              <p className="look-finder__skeleton-text">
                Gemini is analyzing silhouette and fabric textures...
              </p>
            </div>
          )}

          {analysisState === 'error' && (
            <div className="look-finder__error" role="alert">
              <p className="look-finder__error-title">Vision Analysis Unavailable</p>
              <p className="look-finder__error-message">{analysisError}</p>
              {lastAnalyzedFileRef.current && (
                <button
                  type="button"
                  className="look-finder__error-retry transition-colors duration-500 ease-out"
                  onClick={retryAnalysis}
                >
                  Retry Analysis
                </button>
              )}
            </div>
          )}

          {analysisState === 'complete' && isPartial && matchResult && (
            <div className="look-finder__partial">
              <p className="look-finder__low-light-alert" role="alert">
                Low-lighting detected. Showing closest matches ({partialConfidence}%
                confidence).
              </p>
              <p className="look-finder__match-reasoning">{matchResult.reasoning}</p>

              <div className="look-finder__partial-grid">
                {[matchResult.item, ...aiPartialMatches.items.filter((entry) => entry.id !== matchResult.item.id)]
                  .slice(0, 3)
                  .map((matchItem, index) => (
                    <PartialMatchCard
                      key={matchItem.id}
                      item={matchItem}
                      confidence={partialConfidence - index * 4}
                      onSelect={onMatchComplete}
                    />
                  ))}
              </div>
            </div>
          )}

          {analysisState === 'complete' && !isPartial && matchResult && (
            <div
              className="look-finder__match look-finder__match--clickable group transition-all duration-500 ease-out hover:opacity-90"
              onClick={() => onMatchComplete?.(matchResult.item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onMatchComplete?.(matchResult.item)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View matched archive record for ${matchResult.item.name}`}
            >
              <p className="look-finder__confidence">
                <span className="look-finder__confidence-value">
                  {matchResult.confidence}%
                </span>
                Match: {matchResult.seasonLabel} &mdash; {matchResult.lookLabel}
              </p>

              <ImageWithSkeleton
                src={matchResult.item.image}
                alt={matchResult.item.name}
                wrapperClassName="look-finder__match-image-wrap"
                imageClassName="look-finder__match-image transition-transform duration-500 ease-out group-hover:scale-101"
                aspectClassName="aspect-[2/3] w-full"
              />

              <div className="look-finder__match-details">
                <div className="look-finder__match-meta">
                  <span>{matchResult.item.year}</span>
                  <span className="look-finder__match-divider" aria-hidden="true" />
                  <span>{matchResult.item.category}</span>
                </div>
                <h3 className="look-finder__match-name">{matchResult.item.name}</h3>
                <p className="look-finder__match-code">{matchResult.item.code}</p>
                <p className="look-finder__match-reasoning">{matchResult.reasoning}</p>
                <span className="look-finder__match-tag">{matchResult.item.detailTag}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
