import { useEffect, useState } from 'react'

const DEFAULT_DURATION_MS = 500

export function useOverlayTransition(isActive, durationMs = DEFAULT_DURATION_MS) {
  const [shouldRender, setShouldRender] = useState(isActive)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      setShouldRender(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    const timer = setTimeout(() => setShouldRender(false), durationMs)
    return () => clearTimeout(timer)
  }, [isActive, durationMs])

  return { shouldRender, isVisible }
}
