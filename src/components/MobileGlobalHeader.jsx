import { MOBILE_YEAR_PILLS } from '../data/archiveItems'

const CATEGORY_PILLS = [
  { label: 'Couture', value: 'Haute Couture' },
  { label: 'Bridal', value: 'Bridal' },
  { label: 'RTW', value: 'Ready-to-Wear' },
]

const NAV_VIEWS = [
  { id: 'archive', label: 'Archive' },
  { id: 'look-finder', label: 'AI' },
]

export default function MobileGlobalHeader({
  activeView,
  onViewChange,
  onHome,
  onOpenSettings,
  showMobileBack,
  onBack,
  visibleViews,
  currentUser,
  searchQuery,
  onSearchChange,
  showFilters = true,
  selectedYears,
  selectedCategories,
  onToggleYear,
  onToggleCategory,
  onClearYears,
  onGoToArchive,
}) {
  const isArchive = activeView === 'archive'
  const isAi = activeView === 'look-finder'
  const allYearsActive = selectedYears.length === 0
  const navViews = NAV_VIEWS.filter((view) => visibleViews?.includes(view.id))

  if (!isArchive && !isAi) return null

  return (
    <header className="mobile-global-header md:hidden" aria-label="Mobile navigation">
      <div className="mgh__brand-row">
        <div className="mgh__start">
          {showMobileBack && (
            <button
              type="button"
              className="mgh__back"
              onClick={onBack}
              aria-label="Go back"
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="mgh__logo"
            onClick={onHome}
            aria-label="Go home"
          >
            <img className="mgh__logo-img" src="/logo.png" alt="Azzi & Osta" />
          </button>
        </div>

        <div className="mgh__end">
          {currentUser && (
            <span
              className="mgh__avatar"
              aria-label={`Signed in as ${currentUser.label}`}
            >
              {currentUser.initials}
            </span>
          )}

          <button
            type="button"
            className="mgh__settings"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
          >
            <svg
              className="mgh__settings-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </button>
        </div>
      </div>

      {navViews.length > 1 && (
        <div className="mgh__view-switch" role="tablist" aria-label="Main views">
          {navViews.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeView === id}
              className={`mgh__view-tab${activeView === id ? ' mgh__view-tab--active' : ''}`}
              onClick={() => onViewChange(id)}
            >
              {id === 'look-finder' ? 'AI Look Finder' : label}
            </button>
          ))}
        </div>
      )}

      {isArchive && (
        <div className="mgh__archive animate-fadeIn">
          <div className="mgh__search-wrap">
            <label className="sr-only" htmlFor="archive-search-mobile">
              Search archive
            </label>
            <input
              id="archive-search-mobile"
              type="search"
              placeholder="Search archive..."
              className="mgh__search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
            />
          </div>

          {showFilters && (
            <>
              <div className="mgh__pills brand-scroll scrollbar-none">
                <button
                  type="button"
                  className={`mgh__pill${allYearsActive ? ' mgh__pill--active' : ''}`}
                  onClick={onClearYears}
                >
                  All Years
                </button>
                {MOBILE_YEAR_PILLS.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`mgh__pill${
                      selectedYears.includes(year) ? ' mgh__pill--active' : ''
                    }`}
                    onClick={() => onToggleYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>

              <div className="mgh__pills mgh__pills--last brand-scroll scrollbar-none">
                {CATEGORY_PILLS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    className={`mgh__pill${
                      selectedCategories.includes(value) ? ' mgh__pill--active' : ''
                    }`}
                    onClick={() => onToggleCategory(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {isAi && (
        <div className="mgh__ai-strip animate-fadeIn">
          <span className="mgh__ai-label">AI Visual Scanner Enabled</span>
          {onGoToArchive && (
            <button type="button" onClick={onGoToArchive} className="mgh__ai-back">
              Back
            </button>
          )}
        </div>
      )}
    </header>
  )
}
