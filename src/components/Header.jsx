// src/components/Header.jsx
import React from 'react';
import './MasonryGrid.css'; // header/menu styles live here

export default function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <div className="logo">My Portfolio</div>

      <div
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </div>

      <nav className={`site-menu ${menuOpen ? 'open' : ''}`}> 
        <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </nav>
    </header>
  );
}
