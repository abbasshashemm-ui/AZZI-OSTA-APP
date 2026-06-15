import './Toast.css'

export default function Toast({ toast }) {
  if (!toast) return null

  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span className="toast__indicator" aria-hidden="true" />
      <p className="toast__message">{toast.message}</p>
    </div>
  )
}
