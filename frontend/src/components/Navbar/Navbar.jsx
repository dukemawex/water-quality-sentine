import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__icon" aria-hidden="true">💧</span>
        <span className="navbar__title">Water Quality Sentinel</span>
      </div>
      <nav className="navbar__nav" aria-label="Main navigation">
        <Link
          to="/"
          className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/submit"
          className={`navbar__link ${location.pathname === '/submit' ? 'navbar__link--active' : ''}`}
        >
          Submit Data
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;
