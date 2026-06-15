import { useEffect, useState } from 'react'
import { ROLES, useRole } from '../context/RoleContext'
import { teamMembers as initialMembers } from '../data/teamMembers'
import { useOverlayTransition } from '../hooks/useOverlayTransition'
import './SettingsPanel.css'

export default function SettingsPanel({ isOpen, onClose }) {
  const { role, setRole, activeRole, permissions } = useRole()
  const [members, setMembers] = useState(initialMembers)
  const { shouldRender, isVisible } = useOverlayTransition(isOpen)

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

  function handleRevoke(id) {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, access: 'revoked' } : member,
      ),
    )
  }

  if (!shouldRender) return null

  return (
    <div
      className={`settings-panel${isVisible ? ' settings-panel--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        className={`settings-panel__backdrop backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Close settings"
        tabIndex={isVisible ? 0 : -1}
      />

      <div
        className={`settings-panel__drawer transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          type="button"
          className="settings-panel__close transition-colors duration-500 ease-out"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="settings-panel__content">
          <p className="settings-panel__eyebrow">Internal Console</p>
          <h2 id="settings-title" className="settings-panel__title">
            Settings &amp; User Directory
          </h2>

          <section className="settings-panel__section">
            <h3 className="settings-panel__label">Presentation Role Switcher</h3>
            <p className="settings-panel__hint">
              Instantly preview how the archive adapts per internal user type.
            </p>

            <div className="role-switcher">
              {ROLES.map((roleOption) => (
                <button
                  key={roleOption.id}
                  type="button"
                  className={`role-switcher__option transition-all duration-500 ease-out${
                    role === roleOption.id ? ' role-switcher__option--active' : ''
                  }`}
                  onClick={() => setRole(roleOption.id)}
                >
                  <span className="role-switcher__name">{roleOption.label}</span>
                  <span
                    className={`role-switcher__badge role-switcher__badge--${roleOption.badgeTone}${
                      role === roleOption.id ? ' role-switcher__badge--visible' : ''
                    }`}
                  >
                    {roleOption.badge}
                  </span>
                </button>
              ))}
            </div>

            <p className="settings-panel__active-role">
              Active session: <span>{activeRole.label}</span>
            </p>
          </section>

          {permissions.canManageUsers && (
            <section className="settings-panel__section">
              <div className="settings-panel__section-header">
                <h3 className="settings-panel__label">User Directory</h3>
                <span className="settings-panel__access-badge settings-panel__access-badge--success">
                  Full Read / Write
                </span>
              </div>

              <div className="user-table-wrap">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        className={
                          member.access === 'revoked' ? 'user-table__row--revoked' : ''
                        }
                      >
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td>
                          <span className="user-table__role">{member.role}</span>
                        </td>
                        <td>
                          {member.access === 'active' ? (
                            <button
                              type="button"
                              className="user-table__revoke transition-colors duration-500 ease-out"
                              onClick={() => handleRevoke(member.id)}
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <span className="user-table__revoked-label">Revoked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
