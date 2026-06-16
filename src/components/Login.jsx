import { useEffect, useState } from 'react'
import { authenticateUser } from '../data/teamMembers'
import { loginModels } from '../data/loginShowcase'
import './Login.css'

const SLIDE_MS = 6500

export default function Login({ onAuthenticate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const active = loginModels[activeSlide]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % loginModels.length)
    }, SLIDE_MS)

    return () => window.clearInterval(timer)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const user = authenticateUser(username, password)
    if (user) {
      onAuthenticate(user.roleId)
      return
    }
    setError(true)
  }

  return (
    <div
      className="login"
      style={{
        '--login-accent': active.accent,
        '--login-glow': active.glow,
      }}
    >
      <div className="login__stage" aria-hidden="true">
        <div className="login__glow" />

        {loginModels.map((model, index) => (
          <figure
            key={model.look}
            className={[
              'login__model',
              'login__model--hero',
              `login__model--${model.side}`,
              index === activeSlide ? 'login__model--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <img src={model.src} alt="" />
          </figure>
        ))}

        <div className="login__caption" key={active.look}>
          <p className="login__caption-look">{active.look}</p>
          <p className="login__caption-collection">{active.collection}</p>
        </div>

        <div className="login__progress">
          {loginModels.map((model, index) => (
            <button
              key={model.look}
              type="button"
              className={`login__dot${
                index === activeSlide ? ' login__dot--active' : ''
              }`}
              aria-label={`Show ${model.look}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="login__layout">
        <div className="login__card">
          <p className="login__eyebrow">Internal Archivist</p>
          <img className="login__logo" src="/logo.png" alt="Azzi & Osta" />
          <p className="login__subtitle">Private collection access</p>

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            <div className="login__field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
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

            <button type="submit" className="login__submit">
              Enter the Atelier
            </button>
          </form>
        </div>
      </div>

      <p className="login__footer">Restricted access — authorized personnel only</p>
    </div>
  )
}
