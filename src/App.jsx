import { useState, useEffect } from 'react'

const STORAGE_KEY = 'subscription-tracker-data'

// Generate a simple emoji icon based on name
function getIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('netflix') || n.includes('prime') || n.includes('hotstar') || n.includes('disney') || n.includes('zee') || n.includes('sony') || n.includes('video') || n.includes('stream')) return '🎬'
  if (n.includes('spotify') || n.includes('music') || n.includes('apple music') || n.includes('gaana') || n.includes('jiosaavn')) return '🎵'
  if (n.includes('gym') || n.includes('fitness') || n.includes('yoga') || n.includes('cult')) return '💪'
  if (n.includes('cloud') || n.includes('drive') || n.includes('dropbox') || n.includes('storage')) return '☁️'
  if (n.includes('microsoft') || n.includes('office') || n.includes('365')) return '📝'
  if (n.includes('adobe') || n.includes('figma') || n.includes('design') || n.includes('canva')) return '🎨'
  if (n.includes('vpn') || n.includes('nord') || n.includes('express')) return '🔒'
  if (n.includes('github') || n.includes('gitlab') || n.includes('code')) return '💻'
  if (n.includes('chat') || n.includes('slack') || n.includes('zoom') || n.includes('meet')) return '💬'
  if (n.includes('game') || n.includes('xbox') || n.includes('play') || n.includes('steam')) return '🎮'
  if (n.includes('news') || n.includes('medium') || n.includes('read')) return '📰'
  if (n.includes('food') || n.includes('swiggy') || n.includes('zomato') || n.includes('eat')) return '🍔'
  if (n.includes('amazon') || n.includes('shop') || n.includes('flipkart')) return '🛍️'
  return '📦'
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable
    }
  }, [key, value])

  return [value, setValue]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="header">
      <span className="header-icon">💳</span>
      <h1>Subscription Cost Tracker</h1>
      <p className="header-subtitle">Know exactly where your money goes every month</p>
      <div className="owner-info">
        <span className="owner-name">Pasumarthy Abhinav</span>
        <span className="owner-email">pasumarthyabhinav955@gmail.com</span>
      </div>
    </header>
  )
}

function SummaryCards({ subscriptions }) {
  const monthly = subscriptions.reduce((sum, s) => sum + s.cost, 0)
  const yearly = monthly * 12

  return (
    <div className="summary-grid">
      <div className="summary-card monthly">
        <p className="summary-label">Monthly Total</p>
        <p className="summary-amount">₹{monthly.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
        <p className="summary-count">{subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="summary-card yearly">
        <p className="summary-label">Yearly Total</p>
        <p className="summary-amount">₹{yearly.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
        <p className="summary-count">monthly × 12</p>
      </div>
    </div>
  )
}

function AddSubscriptionForm({ onAdd }) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    const parsedCost = parseFloat(cost)

    if (!trimmedName) {
      setError('Please enter a subscription name.')
      return
    }
    if (!cost || isNaN(parsedCost) || parsedCost <= 0) {
      setError('Please enter a valid monthly cost (> 0).')
      return
    }

    onAdd({ id: crypto.randomUUID(), name: trimmedName, cost: parsedCost })
    setName('')
    setCost('')
    setError('')
  }

  return (
    <div className="form-card">
      <h2>➕ Add Subscription</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sub-name">Subscription Name</label>
            <input
              id="sub-name"
              type="text"
              placeholder="e.g. Netflix, Spotify…"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              autoComplete="off"
              maxLength={60}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sub-cost">Monthly Cost (₹)</label>
            <input
              id="sub-cost"
              type="number"
              placeholder="e.g. 499"
              value={cost}
              onChange={(e) => { setCost(e.target.value); setError('') }}
              min="0.01"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="btn-add"
            disabled={!name.trim() || !cost}
          >
            Add Subscription
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </div>
  )
}

function SubscriptionItem({ subscription, isPriciest, onDelete }) {
  const yearly = (subscription.cost * 12).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  const monthly = subscription.cost.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  return (
    <li className={`subscription-item${isPriciest ? ' is-priciest' : ''}`}>
      <div className="item-icon" aria-hidden="true">
        {getIcon(subscription.name)}
      </div>
      <div className="item-info">
        <p className="item-name" title={subscription.name}>{subscription.name}</p>
        <p className="item-yearly">₹<span>{yearly}</span> / year</p>
      </div>
      <div className="item-cost">
        <p className="item-monthly">₹{monthly}</p>
        <p className="item-label">per month</p>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDelete(subscription.id)}
        aria-label={`Delete ${subscription.name}`}
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </li>
  )
}

function SubscriptionList({ subscriptions, onDelete }) {
  const maxCost = subscriptions.length > 0 ? Math.max(...subscriptions.map(s => s.cost)) : 0

  return (
    <div className="list-card">
      <div className="list-header">
        <h2>📋 Your Subscriptions</h2>
        {subscriptions.length > 0 && <span className="badge">{subscriptions.length}</span>}
      </div>
      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <strong>No subscriptions yet</strong>
          <p>Add your first subscription above to start tracking.</p>
        </div>
      ) : (
        <ul className="subscription-list">
          {subscriptions.map(sub => (
            <SubscriptionItem
              key={sub.id}
              subscription={sub}
              isPriciest={sub.cost === maxCost}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function FooterCTA() {
  return (
    <footer className="footer-cta">
      <a
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hero"
        id="built-for-digital-heroes-btn"
      >
        ⚡ Built for Digital Heroes
      </a>
      <p className="footer-text">Subscription Cost Tracker &mdash; Built with ❤️ using React + Vite</p>
    </footer>
  )
}

// ─── App Root ────────────────────────────────────────────────────────────────

export default function App() {
  const [subscriptions, setSubscriptions] = useLocalStorage(STORAGE_KEY, [])

  function handleAdd(subscription) {
    setSubscriptions(prev => [subscription, ...prev])
  }

  function handleDelete(id) {
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="app-wrapper">
      <div className="container">
        <Header />
        <SummaryCards subscriptions={subscriptions} />
        <AddSubscriptionForm onAdd={handleAdd} />
        <SubscriptionList subscriptions={subscriptions} onDelete={handleDelete} />
        <FooterCTA />
      </div>
    </div>
  )
}
