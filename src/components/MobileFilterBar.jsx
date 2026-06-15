import { MOBILE_YEAR_PILLS } from '../data/archiveItems'

const CATEGORY_PILLS = [
  { label: 'Couture', value: 'Haute Couture' },
  { label: 'Bridal', value: 'Bridal' },
  { label: 'RTW', value: 'Ready-to-Wear' },
]

export default function MobileFilterBar({
  selectedYears,
  selectedCategories,
  onToggleYear,
  onToggleCategory,
  onClearYears,
}) {
  const allYearsActive = selectedYears.length === 0

  return (
    <div className="mobile-filters" aria-label="Archive filters">
      <div className="mobile-filters__row brand-scroll">
        <button
          type="button"
          className={`mobile-filters__pill transition-all duration-500 ease-out${allYearsActive ? ' mobile-filters__pill--active' : ''}`}
          onClick={onClearYears}
        >
          All Years
        </button>
        {MOBILE_YEAR_PILLS.map((year) => (
          <button
            key={year}
            type="button"
            className={`mobile-filters__pill transition-all duration-500 ease-out${selectedYears.includes(year) ? ' mobile-filters__pill--active' : ''}`}
            onClick={() => onToggleYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="mobile-filters__row brand-scroll">
        {CATEGORY_PILLS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={`mobile-filters__pill transition-all duration-500 ease-out${selectedCategories.includes(value) ? ' mobile-filters__pill--active' : ''}`}
            onClick={() => onToggleCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
