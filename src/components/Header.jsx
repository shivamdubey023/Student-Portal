import React from 'react';
import '../styles.css';

export default function Header({ userType = 'student', navigation = [], currentNav = null, onNavClick = null, onLogout = null }) {
  const logout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback for backward compatibility
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          {userType === 'admin' ? '👨‍💼 AdminPortal' : '📚 StudentPortal'}
        </div>

        {navigation && navigation.length > 0 && (
          <nav className="header-nav">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${currentNav === item.id ? 'active' : ''}`}
                onClick={() => onNavClick && onNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="header-actions">
          <span className="user-role">{userType === 'admin' ? 'Admin' : 'Student'}</span>
          <button className="btn-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
