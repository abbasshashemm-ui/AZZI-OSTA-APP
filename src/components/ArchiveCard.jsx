import ImageWithSkeleton from './ImageWithSkeleton'

export default function ArchiveCard({ item, onSelect, style }) {
  return (
    <article
      className="archive-card min-w-0 w-full"
      style={style}
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
      <div className="archive-card__image-col">
        <ImageWithSkeleton
          src={item.image}
          alt={item.name}
          wrapperClassName="archive-card__image-wrap"
          imageClassName="archive-card__image"
          aspectClassName="aspect-[2/3] w-full"
        />
      </div>
      <div className="archive-card__body p-2 md:p-[1.125rem] md:pb-5">
        <div className="archive-card__meta mb-1 gap-1 text-[10px] md:mb-2.5 md:gap-2 md:text-[0.625rem]">
          <span className="shrink-0">{item.year}</span>
          <span className="archive-card__divider shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{item.category}</span>
        </div>
        <h3 className="archive-card__name mb-0.5 line-clamp-2 text-xs leading-tight md:mb-1.5 md:line-clamp-none md:text-[1.0625rem] md:leading-snug">
          {item.name}
        </h3>
        <p className="archive-card__code mb-1 truncate text-[10px] md:mb-3.5 md:text-[0.6875rem]">
          {item.code}
        </p>
        <span className="archive-card__tag px-1.5 py-0.5 text-[10px] md:px-2.5 md:py-1 md:text-[0.5625rem]">
          {item.detailTag}
        </span>
      </div>
    </article>
  )
}
