import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setExpanded(false);

  // Read authentication & role state
  const token = localStorage.getItem('sangeet_token');
  const userJson = localStorage.getItem('sangeet_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('sangeet_token');
    localStorage.removeItem('sangeet_user');
    toast.success('Logged out successfully');
    close();
    navigate('/login');
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

        {token && (
          <>
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

            <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="mainNav">
              <div className="nav-links-group ms-auto py-2 py-lg-0 align-items-center">
                <NavLink id="nav-home" to="/" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} end onClick={close}>
                  <i className="bi bi-house-door" /> Home
                </NavLink>
                <NavLink id="nav-collection" to="/products" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} onClick={close}>
                  <i className="bi bi-grid-3x3-gap" /> Collection
                </NavLink>
                
                {isAdmin && (
                  <NavLink id="nav-add" to="/add-product" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} onClick={close}>
                    <i className="bi bi-plus-circle" /> Add Product
                  </NavLink>
                )}

                {/* User profile identifier */}
                <span className="text-white ms-lg-3 me-lg-2 py-2 py-lg-0 d-inline-flex align-items-center" style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', color: 'var(--gold-pale)' }}>
                  <i className="bi bi-person-fill me-1" style={{ color: 'var(--gold)' }} /> {user?.username} 
                  <span className="ms-1" style={{ fontSize: '0.62rem', color: 'var(--gold-bright)', opacity: 0.8, textTransform: 'uppercase' }}>({user?.role})</span>
                </span>

                {/* Logout Action */}
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline-danger btn-sm ms-lg-2 mt-2 mt-lg-0 py-1 px-3"
                  style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '4px', border: '1px solid rgba(220, 53, 69, 0.4)', color: '#FF7675' }}
                >
                  <i className="bi bi-box-arrow-right" /> Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
