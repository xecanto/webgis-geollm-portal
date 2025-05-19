import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Dashboard } from './pages/Dashboard'
import { Homepage } from './pages/Homepage'

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    // Simple client-side router
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname)
    }

    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener('popstate', handleNavigation)

    // Handle clicks on anchor tags
    const handleLinkClick = (e) => {
      // Only handle links within our app
      if (e.target.tagName === 'A' && e.target.origin === window.location.origin) {
        e.preventDefault()
        const newPath = new URL(e.target.href).pathname
        window.history.pushState({}, '', newPath)
        setCurrentPath(newPath)
      }
    }

    document.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  // Simple routing logic
  let Component
  switch (currentPath) {
    case '/dashboard':
      Component = Dashboard
      break
    default:
      Component = Homepage
  }

  return (
    <div className="flex h-screen bg-[#1B263B]">
      <Component />
    </div>
  )
}
