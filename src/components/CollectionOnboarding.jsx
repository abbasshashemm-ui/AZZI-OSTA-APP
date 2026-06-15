import { useCallback, useEffect, useRef, useState } from 'react'
import { onboardingLooks } from '../data/onboardingBatch'
import './CollectionOnboarding.css'

const PROCESSING_MS = 2000

export default function CollectionOnboarding({ onComplete, showToast }) {
  const [phase, setPhase] = useState('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(() =>
    Object.fromEntries(onboardingLooks.map((look) => [look.id, 0])),
  )
  const [committed, setCommitted] = useState(false)
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  const startProcessing = useCallback(() => {
    setPhase('processing')
    setProgress(Object.fromEntries(onboardingLooks.map((look) => [look.id, 0])))

    const start = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const ratio = Math.min(elapsed / PROCESSING_MS, 1)
      setProgress(
        Object.fromEntries(
          onboardingLooks.map((look) => [look.id, Math.round(ratio * 100)]),
        ),
      )
      if (ratio >= 1) {
        clearInterval(timerRef.current)
        setPhase('complete')
      }
    }, 40)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    startProcessing()
  }

  function handleCommit() {
    setCommitted(true)
    showToast?.(
      `Successfully synced ${onboardingLooks.length} new looks to the cloud archive`,
    )
    setTimeout(() => onComplete?.(), 1200)
  }

  return (
    <main className="onboarding">
      <header className="onboarding__header">
        <p className="onboarding__eyebrow">Atelier Admin</p>
        <h1 className="onboarding__title">Collection Onboarding</h1>
        <p className="onboarding__subtitle">
          Ingest new season lookbooks and auto-tag archive metadata
        </p>
      </header>

      {phase === 'idle' && (
        <div
          className={`onboarding__dropzone${isDragging ? ' onboarding__dropzone--active' : ''}`}
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
          aria-label="Upload collection lookbook"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,image/*"
            multiple
            className="onboarding__file-input"
            onChange={() => startProcessing()}
          />
          <span className="onboarding__dropzone-icon" aria-hidden="true">
            ↑
          </span>
          <p className="onboarding__dropzone-text">
            Drag &amp; Drop New Collection Lookbook (ZIP or Batch Images)
          </p>
          <p className="onboarding__dropzone-hint">or click to simulate upload</p>
        </div>
      )}

      {(phase === 'processing' || phase === 'complete') && (
        <div className="onboarding__batch">
          <div className="onboarding__batch-header">
            <h2 className="onboarding__batch-title">Batch Processing Queue</h2>
            <p className="onboarding__batch-count">
              {onboardingLooks.length} incoming looks
            </p>
          </div>

          <div className="onboarding__queue">
            {onboardingLooks.map((look) => (
              <article key={look.id} className="onboarding__item">
                <div className="onboarding__item-image-wrap">
                  <img
                    className="onboarding__item-image"
                    src={look.image}
                    alt={look.filename}
                  />
                  <span className="onboarding__item-filename">{look.filename}</span>
                </div>

                {phase === 'processing' && (
                  <div className="onboarding__progress">
                    <div className="onboarding__progress-track">
                      <div
                        className="onboarding__progress-bar"
                        style={{ width: `${progress[look.id]}%` }}
                      />
                    </div>
                    <p className="onboarding__progress-label">
                      AI Auto-Tagging in progress...
                    </p>
                  </div>
                )}

                {phase === 'complete' && (
                  <div className="onboarding__tags">
                    <span className="onboarding__tag">
                      Auto-Detected: {look.collection}
                    </span>
                    <span className="onboarding__tag">
                      Category: {look.category}
                    </span>
                    <span className="onboarding__tag">
                      Dominant Fabric: {look.fabric}
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>

          {phase === 'complete' && !committed && (
            <button
              type="button"
              className="onboarding__commit transition-all duration-500 ease-out"
              onClick={handleCommit}
            >
              Approve &amp; Commit to Archive Database
            </button>
          )}

          {committed && (
            <p className="onboarding__committed" role="status">
              Batch committed to archive database.
            </p>
          )}
        </div>
      )}
    </main>
  )
}
