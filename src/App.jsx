import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './context/ToastContext'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginExiting, setIsLoginExiting] = useState(false)

  function handleAuthenticate() {
    setIsLoginExiting(true)
    setTimeout(() => setIsAuthenticated(true), 700)
  }

  return (
    <div className="relative min-h-svh bg-[var(--black)]">
      {(isAuthenticated || isLoginExiting) && (
        <div
          className={
            isLoginExiting && !isAuthenticated
              ? 'animate-[dashboardEnter_700ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
              : 'opacity-100'
          }
        >
          <RoleProvider>
            <ToastProvider>
              <Dashboard />
            </ToastProvider>
          </RoleProvider>
        </div>
      )}

      {!isAuthenticated && (
        <div
          className={`${
            isLoginExiting ? 'pointer-events-none fixed inset-0 z-50' : ''
          } transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isLoginExiting
              ? 'scale-[0.98] opacity-0'
              : 'scale-100 opacity-100'
          }`}
        >
          <Login onAuthenticate={handleAuthenticate} isExiting={isLoginExiting} />
        </div>
      )}
    </div>
  )
}

export default App
