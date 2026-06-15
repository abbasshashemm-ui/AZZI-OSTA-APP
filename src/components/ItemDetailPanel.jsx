import { useEffect, useState } from 'react'
import { useOverlayTransition } from '../hooks/useOverlayTransition'
import ImageWithSkeleton from './ImageWithSkeleton'
import './ItemDetailPanel.css'

const EDITABLE_FIELDS = [
  { key: 'collectionSeason', label: 'Collection & Season' },
  { key: 'code', label: 'Archival ID Code' },
  { key: 'description', label: 'Technical Description' },
  { key: 'fabrics', label: 'Primary Fabrics' },
  { key: 'constructionTime', label: 'Construction Time' },
  { key: 'patternReference', label: 'Pattern & Sketch Reference' },
]

function getEditableSnapshot(item) {
  return {
    collectionSeason: item.collectionSeason,
    code: item.code,
    description: item.description,
    fabrics: item.fabrics,
    constructionTime: item.constructionTime,
    patternReference: item.patternReference,
  }
}

export default function ItemDetailPanel({
  item,
  isOpen,
  onClose,
  canEdit = true,
  readOnlyMessage = 'Read-Only Access for Design Inspiration',
  onExport,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [resolvedItem, setResolvedItem] = useState(null)
  const { shouldRender, isVisible } = useOverlayTransition(isOpen && Boolean(item))

  useEffect(() => {
    if (item) {
      setResolvedItem(item)
      setEditData(getEditableSnapshot(item))
      setIsEditing(false)
    }
  }, [item])

  useEffect(() => {
    if (!canEdit) setIsEditing(false)
  }, [canEdit])

  useEffect(() => {
    if (!shouldRender) return undefined

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shouldRender, onClose])

  if (!shouldRender || !resolvedItem || !editData) return null

  function handleExport() {
    onExport?.()
  }

  function handleFieldChange(key, value) {
    setEditData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div
      className={`item-panel${isVisible ? ' item-panel--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-panel-title"
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        className={`item-panel__backdrop backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Close panel"
        tabIndex={isVisible ? 0 : -1}
      />

      <div
        className={`item-panel__drawer transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          type="button"
          className="item-panel__close transition-colors duration-500 ease-out"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="item-panel__layout">
          <div className="item-panel__image-col">
            <ImageWithSkeleton
              src={resolvedItem.imageHd || resolvedItem.image}
              alt={resolvedItem.name}
              wrapperClassName="item-panel__image-frame h-full"
              imageClassName="transition-transform duration-500 ease-out hover:scale-101"
              aspectClassName="aspect-[2/3] h-full min-h-full"
              loading="eager"
            />
          </div>

          <div className="item-panel__content">
            <p className="item-panel__eyebrow">Archival Record</p>
            <h2 id="item-panel-title" className="item-panel__name">
              {resolvedItem.name}
            </h2>
            <p className="item-panel__category">
              {resolvedItem.year} · {resolvedItem.category}
            </p>

            <dl className="item-panel__fields">
              {EDITABLE_FIELDS.map(({ key, label }) => (
                <div key={key} className="item-panel__field">
                  <dt>{label}</dt>
                  <dd>
                    {isEditing && canEdit ? (
                      <input
                        type="text"
                        className="item-panel__input transition-colors duration-500 ease-out"
                        value={editData[key]}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                      />
                    ) : (
                      editData[key]
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="item-panel__actions">
              <button
                type="button"
                className="item-panel__btn item-panel__btn--primary transition-colors duration-500 ease-out"
                onClick={handleExport}
              >
                Export Technical Sheet (PDF)
              </button>

              {canEdit ? (
                <button
                  type="button"
                  className={`item-panel__btn transition-colors duration-500 ease-out${isEditing ? ' item-panel__btn--active' : ''}`}
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? 'Save Archival Data' : 'Edit Archival Data'}
                </button>
              ) : (
                <div className="item-panel__locked" title={readOnlyMessage}>
                  <span className="item-panel__lock-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                      <rect x="5" y="11" width="14" height="10" rx="1" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                  <span className="item-panel__locked-label">Edit Archival Data</span>
                  <span className="item-panel__locked-tooltip">{readOnlyMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
