import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const ROLES = [
  {
    id: 'admin',
    label: 'Atelier Admin',
    shortLabel: 'Admin',
    badge: 'Full Read / Write',
    badgeTone: 'success',
  },
  {
    id: 'designer',
    label: 'Design/Creative User',
    shortLabel: 'Designer',
    badge: 'Read-Only Archive',
    badgeTone: 'neutral',
  },
  {
    id: 'showroom',
    label: 'Showroom Staff',
    shortLabel: 'Showroom',
    badge: 'Scan-Only Access',
    badgeTone: 'neutral',
  },
]

export const ROLE_PROFILES = {
  admin: {
    name: 'Admin',
    roleLabel: 'Atelier Admin',
    initials: 'A',
  },
  designer: {
    name: 'Designer',
    roleLabel: 'Design/Creative User',
    initials: 'D',
  },
  showroom: {
    name: 'Showroom',
    roleLabel: 'Showroom Staff',
    initials: 'S',
    useCompactLabel: true,
  },
}

export function getCurrentUserLabel(profile) {
  if (profile.useCompactLabel) return profile.name
  return `${profile.name} (${profile.roleLabel})`
}

function getPermissions(roleId) {
  const isAdmin = roleId === 'admin'
  const isDesigner = roleId === 'designer'
  const isShowroom = roleId === 'showroom'

  return {
    isAdmin,
    isDesigner,
    isShowroom,
    canEditArchive: isAdmin,
    canAddLooks: isAdmin,
    canManageUsers: isAdmin,
    canUseFilters: !isShowroom,
    canAccessArchive: !isShowroom,
    canAccessSettings: true,
    defaultView: isShowroom ? 'look-finder' : 'archive',
    simplifiedScanner: isShowroom,
    readOnlyDetailMessage: 'Read-Only Access for Design Inspiration',
  }
}

const RoleContext = createContext(null)

export function RoleProvider({ children, initialRole = 'admin' }) {
  const [role, setRole] = useState(initialRole)

  useEffect(() => {
    setRole(initialRole)
  }, [initialRole])

  const activeRole = useMemo(
    () => ROLES.find((r) => r.id === role) ?? ROLES[0],
    [role],
  )

  const activeProfile = useMemo(
    () => ROLE_PROFILES[role] ?? ROLE_PROFILES.admin,
    [role],
  )

  const currentUser = useMemo(
    () => ({
      ...activeProfile,
      label: getCurrentUserLabel(activeProfile),
      roleId: role,
    }),
    [activeProfile, role],
  )

  const permissions = useMemo(() => getPermissions(role), [role])

  const value = useMemo(
    () => ({
      role,
      setRole,
      activeRole,
      activeProfile,
      currentUser,
      permissions,
    }),
    [role, activeRole, activeProfile, currentUser, permissions],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within RoleProvider')
  }
  return context
}
