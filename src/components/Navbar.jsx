const VIEWS = [
  { id: 'archive', label: 'Archive' },
  { id: 'look-finder', label: 'AI Look Finder' },
]

export default function Navbar({
  activeView,
  onViewChange,
  onHome,
  showMobileBack,
  onBack,
  onOpenSettings,
  visibleViews,
  currentUser,
}) {
  const navViews = VIEWS.filter((view) => visibleViews.includes(view.id))

  return (
    <header className="navbar">
      <div className="navbar__start">
        {showMobileBack && (
          <button
            type="button"
            className="navbar__back transition-colors duration-500 ease-out"
            onClick={onBack}
            aria-label="Go back"
          >
            Back
          </button>
        )}

        <button
          type="button"
          className="navbar__logo transition-opacity duration-500 ease-out"
          onClick={onHome}
          aria-label="Go to archive home"
        >
          <img
            className="navbar__logo-img"
            src="/logo.png"
            alt="Azzi & Osta"
          />
        </button>
      </div>

      <div className="navbar__end">
        <nav className="navbar__links" aria-label="Main navigation">
          {navViews.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`navbar__link transition-colors duration-500 ease-out${activeView === id ? ' navbar__link--active' : ''}`}
              onClick={() => onViewChange(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {currentUser && (
          <div className="navbar__profile" aria-label={`Signed in as ${currentUser.label}`}>
            <span className="navbar__avatar" aria-hidden="true">
              {currentUser.initials}
            </span>
            <span className="navbar__profile-label">{currentUser.label}</span>
          </div>
        )}

        <button
          type="button"
          className="navbar__settings transition-colors duration-500 ease-out"
          onClick={onOpenSettings}
          aria-label="Settings and user directory"
          title="Settings"
        >
          <svg
            className="navbar__settings-icon"
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
    </header>
  )
}
