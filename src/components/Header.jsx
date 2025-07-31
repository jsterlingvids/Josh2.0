// src/components/Header.jsx
import React from 'react';
import './Header.css';
import { Instagram, Youtube, Mail } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="logo">
        <img src="/images/josh_logo.png" alt="Josh Sterling Logo" />
      </div>
      <div className="social-icons">
        {/* Instagram */}
        <a
          href="https://www.instagram.com/jsterlingvids/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Instagram size={24} />
        </a>

        {/* YouTube */}
        <a
          href="https://www.youtube.com/channel/UC_c3BW3hXo1ADro9TMbs2Jg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <Youtube size={24} />
        </a>

        {/* Email */}
        <a
          href="mailto:jsterlingvids@gmail.com"
          aria-label="Email"
        >
          <Mail size={24} />
        </a>
      </div>
    </header>
  );
}
