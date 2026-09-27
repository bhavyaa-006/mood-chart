import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CompanionCharacter from './CompanionCharacter';
import MoodCheckInModal from '../mood/MoodCheckInModal';
import {
  LayoutDashboard,
  Smile,
  BookOpen,
  LineChart,
  Gamepad2,
  Award,
  Sparkles,
  Settings,
} from 'lucide-react';

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
  { to: '/moods', label: 'Moods', icon: <Smile size={20} /> },
  { to: '/journal', label: 'Journal', icon: <BookOpen size={20} /> },
  { to: '/analytics', label: 'Analytics', icon: <LineChart size={20} /> },
  { to: '/activities', label: 'Activities', icon: <Gamepad2 size={20} /> },
  { to: '/insights', label: 'Insights', icon: <Sparkles size={20} /> },
];

export const AppLayout = () => {
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: '70px' }}>
        <Header onOpenMoodModal={() => setIsMoodModalOpen(true)} />

        <main style={{ flex: 1, padding: '1.75rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ openMoodModal: () => setIsMoodModalOpen(true) }} />
        </main>
      </div>

      {/* Interactive Companion Character */}
      <CompanionCharacter />

      {/* Quick Check-in Modal */}
      <MoodCheckInModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 35,
        }}
        className="mobile-only-nav"
      >
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              fontSize: '0.6875rem',
              color: isActive ? 'var(--primary-600)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 500,
              gap: '2px',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
