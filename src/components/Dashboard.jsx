import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRole } from '../context/RoleContext'
import { useToast } from '../context/ToastContext'
import { archiveItems } from '../data/archiveItems'
import AILookFinder from './AILookFinder'
import ArchiveCard from './ArchiveCard'
import CollectionOnboarding from './CollectionOnboarding'
import ItemDetailPanel from './ItemDetailPanel'
import MobileFilterBar from './MobileFilterBar'
import Navbar from './Navbar'
import SettingsPanel from './SettingsPanel'
import Sidebar from './Sidebar'
import './Dashboard.css'

const HOME_PREVIEW_LIMIT = 24
const FILTERED_PAGE_SIZE = 50

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function Dashboard() {
  const { role, permissions, currentUser } = useRole()
  const { showToast } = useToast()
  const [activeView, setActiveView] = useState('archive')
  const [selectedYears, setSelectedYears] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const hasActiveFilters =
    selectedYears.length > 0 ||
    selectedCategories.length > 0 ||
    searchQuery.trim().length > 0

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedYears, selectedCategories, searchQuery])

  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  useEffect(() => {
    if (permissions.isShowroom) {
      setActiveView('look-finder')
      setSelectedYears([])
      setSelectedCategories([])
      setSettingsOpen(false)
    } else if (!permissions.isAdmin && activeView === 'onboarding') {
      setActiveView('archive')
    }
  }, [role, permissions.isShowroom, permissions.isAdmin, activeView])

  const openItemPanel = useCallback((item) => {
    setSelectedItem(item)
    setPanelOpen(true)
  }, [])

  const closeItemPanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const goHome = useCallback(() => {
    if (permissions.canAccessArchive) {
      setActiveView('archive')
    } else {
      setActiveView('look-finder')
    }
    setPanelOpen(false)
    setSettingsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [permissions.canAccessArchive])

  const handleMobileBack = useCallback(() => {
    if (settingsOpen) {
      setSettingsOpen(false)
      return
    }
    if (panelOpen) {
      closeItemPanel()
      return
    }
    if (activeView === 'onboarding') {
      setActiveView('archive')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (permissions.canAccessArchive && activeView !== 'archive') {
      setActiveView('archive')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeView, panelOpen, settingsOpen, closeItemPanel, permissions.canAccessArchive])

  const showMobileBack =
    settingsOpen ||
    panelOpen ||
    activeView === 'onboarding' ||
    (permissions.canAccessArchive && activeView !== 'archive')

  const visibleViews = useMemo(() => {
    if (permissions.isShowroom) return ['look-finder']
    return ['archive', 'look-finder']
  }, [permissions.isShowroom])

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return archiveItems.filter((item) => {
      const yearMatch =
        selectedYears.length === 0 || selectedYears.includes(item.year)
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category)
      const searchMatch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.fabrics.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
      return yearMatch && categoryMatch && searchMatch
    })
  }, [selectedYears, selectedCategories, searchQuery])

  const totalPages = hasActiveFilters
    ? Math.max(1, Math.ceil(filteredItems.length / FILTERED_PAGE_SIZE))
    : 1

  const displayedItems = useMemo(() => {
    if (!hasActiveFilters) {
      return filteredItems.slice(0, HOME_PREVIEW_LIMIT)
    }
    const start = (currentPage - 1) * FILTERED_PAGE_SIZE
    return filteredItems.slice(start, start + FILTERED_PAGE_SIZE)
  }, [filteredItems, hasActiveFilters, currentPage])

  const resultsLabel = useMemo(() => {
    if (filteredItems.length === 0) return '0 items'

    if (!hasActiveFilters) {
      const shown = Math.min(HOME_PREVIEW_LIMIT, filteredItems.length)
      return `Showing ${shown} of ${filteredItems.length} — filter by year to browse all`
    }

    const start = (currentPage - 1) * FILTERED_PAGE_SIZE + 1
    const end = Math.min(currentPage * FILTERED_PAGE_SIZE, filteredItems.length)
    return `Showing ${start}–${end} of ${filteredItems.length}`
  }, [filteredItems.length, hasActiveFilters, currentPage])

  const resetFilters = useCallback(() => {
    setSelectedYears([])
    setSelectedCategories([])
    setSearchQuery('')
  }, [])

  const handleViewChange = useCallback(
    (view) => {
      if (view === 'archive' && !permissions.canAccessArchive) return
      setActiveView(view)
    },
    [permissions.canAccessArchive],
  )

  const openOnboarding = useCallback(() => {
    if (!permissions.canAddLooks) return
    setActiveView('onboarding')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [permissions.canAddLooks])

  return (
    <div className="dashboard">
      <Navbar
        activeView={activeView === 'onboarding' ? 'archive' : activeView}
        onViewChange={handleViewChange}
        onHome={goHome}
        showMobileBack={showMobileBack}
        onBack={handleMobileBack}
        onOpenSettings={() => setSettingsOpen(true)}
        visibleViews={visibleViews}
        currentUser={currentUser}
      />

      <div className="dashboard__body">
        {activeView === 'archive' && permissions.canUseFilters && (
          <Sidebar
            selectedYears={selectedYears}
            selectedCategories={selectedCategories}
            onToggleYear={(year) => setSelectedYears((prev) => toggleInList(prev, year))}
            onToggleCategory={(category) =>
              setSelectedCategories((prev) => toggleInList(prev, category))
            }
            onClearFilters={() => {
              setSelectedYears([])
              setSelectedCategories([])
            }}
          />
        )}

        {activeView === 'onboarding' && permissions.isAdmin ? (
          <CollectionOnboarding
            onComplete={() => setActiveView('archive')}
            showToast={showToast}
          />
        ) : activeView === 'archive' && permissions.canAccessArchive ? (
          <main className="dashboard__main" id="archive">
            {permissions.canUseFilters && (
              <MobileFilterBar
                selectedYears={selectedYears}
                selectedCategories={selectedCategories}
                onToggleYear={(year) =>
                  setSelectedYears((prev) => toggleInList(prev, year))
                }
                onToggleCategory={(category) =>
                  setSelectedCategories((prev) => toggleInList(prev, category))
                }
                onClearYears={() => setSelectedYears([])}
              />
            )}

            <div className="dashboard__main-header">
              <div className="dashboard__main-header-left">
                <h1 className="dashboard__heading">Archive</h1>
                {permissions.isAdmin && (
                  <span className="dashboard__access-badge dashboard__access-badge--success">
                    Full Read / Write
                  </span>
                )}
              </div>
              <p className="dashboard__count">{resultsLabel}</p>
            </div>

            {!hasActiveFilters && filteredItems.length > HOME_PREVIEW_LIMIT && (
              <div className="dashboard__preview-hint">
                <span className="dashboard__preview-hint-icon" aria-hidden="true">
                  i
                </span>
                <p className="dashboard__preview-hint-text">
                  Curated preview of the atelier archive. Select a{' '}
                  <strong>year</strong> or <strong>category</strong> in the filters to
                  browse the full collection, 50 looks per page.
                </p>
              </div>
            )}

            <div className="dashboard__search">
              <label className="dashboard__search-label" htmlFor="archive-search">
                Archive Lookup
              </label>
              <div className="dashboard__search-input-wrap">
                <svg
                  className="dashboard__search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
                <input
                  id="archive-search"
                  type="search"
                  className="dashboard__search-input"
                  placeholder="Search SKU, materials, or look title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {permissions.canAddLooks && (
              <button
                type="button"
                className="dashboard__add-btn transition-all duration-500 ease-out"
                onClick={openOnboarding}
              >
                + Add New Collection Look
              </button>
            )}

            {displayedItems.length > 0 ? (
              <>
                <div className="archive-grid archive-grid--animate">
                  {displayedItems.map((item, index) => (
                    <ArchiveCard
                      key={item.id}
                      item={item}
                      onSelect={openItemPanel}
                      style={{
                        animationDelay: `${Math.min(index, 11) * 45}ms`,
                      }}
                    />
                  ))}
                </div>

                {hasActiveFilters && totalPages > 1 && (
                  <nav
                    className="dashboard__pagination"
                    aria-label="Archive pages"
                  >
                    <button
                      type="button"
                      className="dashboard__pagination-btn"
                      onClick={() => setCurrentPage((page) => page - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="dashboard__pagination-status">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="dashboard__pagination-btn"
                      onClick={() => setCurrentPage((page) => page + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="dashboard__empty-state">
                <p className="dashboard__empty-title">
                  No archival records match these active filters. Try expanding your
                  season selection.
                </p>
                <button
                  type="button"
                  className="dashboard__empty-reset transition-colors duration-500 ease-out"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        ) : (
          <AILookFinder
            onMatchComplete={openItemPanel}
            simplified={permissions.simplifiedScanner}
          />
        )}
      </div>

      <ItemDetailPanel
        item={selectedItem}
        isOpen={panelOpen}
        onClose={closeItemPanel}
        canEdit={permissions.canEditArchive}
        readOnlyMessage={permissions.readOnlyDetailMessage}
        onExport={() =>
          showToast('Technical sheet successfully exported to cloud archive')
        }
      />

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
