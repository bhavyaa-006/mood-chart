import React, { useState, useEffect } from 'react'

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`primary-nav ${isScrolled ? 'scrolled' : 'transparent'}`}>
      <div className="container nav-container">
        <div className="logo-cluster">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5 19l14-14" />
          </svg>
          <span>Mood Cockpit</span>
        </div>
        <div className="nav-links">
          <a href="#logger" className="nav-link">Logger</a>
          <a href="#analytics" className="nav-link">Analytics</a>
          <a href="#history" className="nav-link">Journal</a>
          <a href="#logger" className="signup-btn">Log Today</a>
        </div>
      </div>
    </nav>
  )
}
