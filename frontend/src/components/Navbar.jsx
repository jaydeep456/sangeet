import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setExpanded(false);

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
          <div className="nav-links-group ms-auto py-2 py-lg-0">
            <NavLink id="nav-home" to="/" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} end onClick={close}>
              <i className="bi bi-house-door" /> Home
            </NavLink>
            <NavLink id="nav-collection" to="/products" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} onClick={close}>
              <i className="bi bi-grid-3x3-gap" /> Collection
            </NavLink>
            <NavLink id="nav-add" to="/add-product" className={({ isActive }) => `s-nav-link${isActive ? ' active' : ''}`} onClick={close}>
              <i className="bi bi-plus-circle" /> Add Product
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
