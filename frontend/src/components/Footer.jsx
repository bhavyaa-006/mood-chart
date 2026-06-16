import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '16px', display: 'block' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5 19l14-14" />
          </svg>
          <span className="font-semibold text-body">Mood Cockpit</span>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li><a href="#logger">Logger</a></li>
            <li><a href="#analytics">Analytics</a></li>
            <li><a href="#history">Journal</a></li>
          </ul>
        </div>
        <div>
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4>Connect</h4>
          <ul>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
