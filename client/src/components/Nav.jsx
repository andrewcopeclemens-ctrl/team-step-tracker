import { NavLink } from 'react-router-dom';
import './Nav.css';

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function IconLog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  );
}

function IconTrends() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IconFoot() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 2C11 2 9 4 9 6.5c0 1.5.7 2.8 1.7 3.7L9.5 16c-.3 1.4.6 2.8 2 3.1l.5.1c1.4.3 2.8-.6 3.1-2l1.2-5.8c1-.4 1.8-1.3 2.1-2.4.1-.4.1-.7.1-1.1 0-2.7-2-4.9-4.5-4.9zM8 17.5C6 17.5 4.5 19 4.5 21S6 24.5 8 24.5s3.5-1.5 3.5-3.5-1.5-3.5-3.5-3.5z"/>
    </svg>
  );
}

const navItems = [
  { path: '/',        label: 'Dashboard', icon: <IconDashboard />, end: true },
  { path: '/log',     label: 'Log Steps', icon: <IconLog /> },
  { path: '/trends',  label: 'Trends',    icon: <IconTrends /> },
  { path: '/settings',label: 'Settings',  icon: <IconSettings /> },
];

export default function Nav() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon"><IconFoot /></span>
        <span className="sidebar-brand-name">Team Steps</span>
      </div>
      <ul className="sidebar-links">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'
              }
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
