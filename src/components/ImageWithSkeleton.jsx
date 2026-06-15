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
        className={`absolute inset-0 animate-pulse bg-neutral-100/10 transition-opacity duration-500 ${
          isLoaded || hasError ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageClassName}`}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/5">
          <span className="font-[family-name:var(--sans)] text-[0.625rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Image unavailable
          </span>
        </div>
      )}
    </div>
  )
}
