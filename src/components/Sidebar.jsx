import { CATEGORIES, YEARS } from '../data/archiveItems'

export default function Sidebar({
  selectedYears,
  selectedCategories,
  onToggleYear,
  onToggleCategory,
  onClearFilters,
}) {
  const hasFilters = selectedYears.length > 0 || selectedCategories.length > 0

  return (
    <aside className="sidebar sidebar--desktop" aria-label="Archive filters">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            className="sidebar__clear transition-opacity duration-500 ease-out"
            onClick={onClearFilters}
          >
            Clear
          </button>
        )}
      </div>

      <section className="sidebar__section">
        <h3 className="sidebar__label">Year</h3>
        <ul className="sidebar__list">
          {YEARS.map((year) => (
            <li key={year}>
              <label className="sidebar__option transition-colors duration-500 ease-out">
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => onToggleYear(year)}
                />
                <span>{year}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__label">Category</h3>
        <ul className="sidebar__list sidebar__list--compact">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <label className="sidebar__option transition-colors duration-500 ease-out">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => onToggleCategory(category)}
                />
                <span>{category}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
