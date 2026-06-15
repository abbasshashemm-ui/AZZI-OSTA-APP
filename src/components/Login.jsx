import { useState } from 'react'
import './Login.css'

export default function Login({ onAuthenticate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      onAuthenticate()
      return
    }
    setError(true)
  }

  return (
    <div className="login transition-opacity duration-500 ease-out">
      <div className="login__card">
        <p className="login__eyebrow">Internal Archivist</p>
        <img
          className="login__logo"
          src="/logo.png"
          alt="Azzi & Osta"
        />
        <p className="login__subtitle">Private collection access</p>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="login__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              autoComplete="username"
              className="transition-colors duration-500 ease-out"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(false)
              }}
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="transition-colors duration-500 ease-out"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
            />
          </div>

          {error && (
            <p className="login__error" role="alert">
              Credentials not recognized.
            </p>
          )}

          <button
            type="submit"
            className="login__submit transition-colors duration-500 ease-out"
          >
            Enter
          </button>
        </form>
      </div>

      <p className="login__footer">Restricted access — authorized personnel only</p>
    </div>
  )
}
