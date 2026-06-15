import ImageWithSkeleton from './ImageWithSkeleton'

export default function ArchiveCard({ item, onSelect }) {
  return (
    <article
      className="archive-card group transition-colors duration-500 ease-out"
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(item)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.name}`}
    >
      <ImageWithSkeleton
        src={item.image}
        alt={item.name}
        wrapperClassName="archive-card__image-wrap"
        imageClassName="transition-transform duration-500 ease-out group-hover:scale-101"
        aspectClassName="aspect-[2/3] w-full"
      />
      <div className="archive-card__body">
        <div className="archive-card__meta">
          <span>{item.year}</span>
          <span className="archive-card__divider" aria-hidden="true" />
          <span>{item.category}</span>
        </div>
        <h3 className="archive-card__name">{item.name}</h3>
        <p className="archive-card__code">{item.code}</p>
        <span className="archive-card__tag">{item.detailTag}</span>
      </div>
    </article>
  )
}
