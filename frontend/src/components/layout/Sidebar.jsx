import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Smile,
  BookOpen,
  LineChart,
  Gamepad2,
  Award,
  Sparkles,
  Settings,
  Waves,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
  { to: '/moods', label: 'Mood Tracker', icon: <Smile size={19} /> },
  { to: '/journal', label: 'Journal', icon: <BookOpen size={19} /> },
  { to: '/analytics', label: 'Analytics', icon: <LineChart size={19} /> },
  { to: '/activities', label: 'Activities', icon: <Gamepad2 size={19} /> },
  { to: '/achievements', label: 'Achievements', icon: <Award size={19} /> },
  { to: '/insights', label: 'AI Insights', icon: <Sparkles size={19} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={19} /> },
];

export const Sidebar = () => {
  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
      className="hidden-mobile"
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <Waves size={22} />
        </div>
        <div>
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--primary-900)',
              letterSpacing: '-0.3px',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Mood Cockpit
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Mental Wellness Hub
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer hint */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-100)',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 500, margin: 0 }}>
            Stay mindful
          </p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--primary-600)', margin: '2px 0 0 0' }}>
            Even small check-ins matter.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
