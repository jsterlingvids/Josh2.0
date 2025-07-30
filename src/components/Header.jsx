import React from 'react';
import './Header.css';
import { Instagram, Youtube, Mail } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="logo">My Portfolio</div>
      <div className="social-icons">
        <a
          href="https://instagram.com/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Instagram size={24} />
        </a>
        <a
          href="https://youtube.com/yourchannel"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <Youtube size={24} />
        </a>
        <a href="mailto:you@example.com" aria-label="Email">
          <Mail size={24} />
        </a>
      </div>
    </header>
  );
}
