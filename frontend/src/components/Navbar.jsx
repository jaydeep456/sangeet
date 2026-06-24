import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('#auth-dropdown-wrapper')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', clickOutside);
    return () => document.removeEventListener('click', clickOutside);
  }, [dropdownOpen]);

  const close = () => setExpanded(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(v => !v);
  };

  // Read authentication & role state
  const token = localStorage.getItem('sangeet_token');
  const userJson = localStorage.getItem('sangeet_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('sangeet_token');
    localStorage.removeItem('sangeet_user');
    toast.success('Logged out successfully');
    setDropdownOpen(false);
    close();
    navigate('/login');
  };

  const handleAdminLoginClick = () => {
    setDropdownOpen(false);
    close();
    navigate('/login?prefill=admin');
  };

  return (
    <nav className={`sangeet-navbar navbar navbar-expand-lg ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="navbar-brand-wrapper" onClick={close}>
          <div className="navbar-logo-gem">S</div>
          <div className="brand-text-stack">
            <span className="brand-name">SANGEET</span>
            <span className="brand-tagline">Tune of Trends</span>
          </div>
        </Link>

        {/* Toggler for mobile menu */}
        <button
          id="navbar-toggler-btn"
          className="navbar-toggler"
          type="button"
          aria-controls="mainNav"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={() => setExpanded(v => !v)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Navbar links & actions container */}
        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="mainNav">
          <div className="nav-links-group ms-auto py-2 py-lg-0 align-items-center">
            {/* Home is public */}
            <NavLink id="nav-home" to="/" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} end onClick={close}>
              <i className="bi bi-house-door" /> Home
            </NavLink>
            
            {/* Collection is public */}
            <NavLink id="nav-collection" to="/products" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} onClick={close}>
              <i className="bi bi-grid-3x3-gap" /> Collection
            </NavLink>
            
            {/* Add Product is admin only */}
            {isAdmin && (
              <NavLink id="nav-add" to="/add-product" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} onClick={close}>
                <i className="bi bi-plus-circle" /> Add Product
              </NavLink>
            )}

            {/* Profile / Admin Login Dropdown wrapper */}
            <div id="auth-dropdown-wrapper" className="position-relative ms-lg-3 py-2 py-lg-0">
              <button
                id="auth-dropdown-btn"
                className="d-flex align-items-center gap-2"
                onClick={toggleDropdown}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-pale)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast) var(--ease)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold-bright)'; e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gold-pale)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <i className="bi bi-person-circle" style={{ fontSize: '1rem', color: 'var(--gold)' }} />
                {user ? (
                  <span>{user.username}</span>
                ) : (
                  <span>Admin</span>
                )}
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.6rem', color: 'rgba(201,168,76,0.6)' }} />
              </button>

              {dropdownOpen && (
                <div
                  className="auth-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#0D2A1C',
                    border: '1px solid rgba(201, 168, 76, 0.4)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    minWidth: '220px',
                    padding: '8px 0',
                    zIndex: 1100,
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  {user ? (
                    <>
                      {/* Header for Logged-In User */}
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(201,168,76,0.15)', marginBottom: '6px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(245,230,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</div>
                        <div style={{ fontSize: '0.8rem', color: '#FAF6EE', fontWeight: 600, fontFamily: 'var(--font-display)', marginTop: '2px', wordBreak: 'break-all' }}>{user.username}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--gold-bright)', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.05em' }}>Role: {user.role}</div>
                      </div>
                      
                      {/* Logout Action */}
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#FF7675',
                          padding: '8px 16px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 118, 117, 0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <i className="bi bi-box-arrow-right" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Admin Login Option for Guests */}
                      <button
                        onClick={handleAdminLoginClick}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#FAF6EE',
                          padding: '10px 16px',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)', fontWeight: 600 }}>
                          <i className="bi bi-shield-lock" /> Admin Login
                        </div>
                        <div
                          style={{
                            fontSize: '0.62rem',
                            color: 'rgba(245, 230, 184, 0.55)',
                            textTransform: 'none',
                            letterSpacing: '0.02em',
                            border: '1px dashed rgba(201,168,76,0.25)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            marginTop: '2px',
                            background: 'rgba(201,168,76,0.04)',
                            width: '100%'
                          }}
                        >
                          Username: <code>Sangeet</code><br />
                          Password: <code>Sangeet@123</code>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
