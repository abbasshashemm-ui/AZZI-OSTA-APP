import { useState } from 'react'

export default function ImageWithSkeleton({
  src,
  alt,
  wrapperClassName = '',
  imageClassName = '',
  aspectClassName = 'aspect-[2/3]',
  loading = 'lazy',
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div
      className={`relative overflow-hidden ${aspectClassName} ${wrapperClassName}`}
    >
      <div
        className={`skeleton-luxury absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isLoaded || hasError ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageClassName}`}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(197,160,124,0.03)]">
          <span className="font-[family-name:var(--sans)] text-[0.625rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Image unavailable
          </span>
        </div>
      )}
    </div>
  )
}
