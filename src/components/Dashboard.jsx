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
              <p className="dashboard__count">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="dashboard__search">
              <label className="dashboard__search-label" htmlFor="archive-search">
                Archive Lookup
              </label>
              <input
                id="archive-search"
                type="search"
                className="dashboard__search-input transition-colors duration-500 ease-out"
                placeholder="Search SKU, materials, or look title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
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

            {filteredItems.length > 0 ? (
              <div className="archive-grid">
                {filteredItems.map((item) => (
                  <ArchiveCard
                    key={item.id}
                    item={item}
                    onSelect={openItemPanel}
                  />
                ))}
              </div>
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
