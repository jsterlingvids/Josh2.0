import React, { useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './MasonryGrid.css';

export default function Header({ menuOpen, setMenuOpen }) {
  // whenever menuOpen changes, toggle a class on <body>
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
  }, [menuOpen]);

  return (
    <header className="site-header">
      {/* your logo completely unchanged */}
      <div className="logo">My Portfolio</div>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <nav className={`site-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#home"   onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#about"  onClick={() => setMenuOpen(false)}>About</a>
        <a href="#contact"onClick={() => setMenuOpen(false)}>Contact</a>
      </nav>
    </header>
  );
}
