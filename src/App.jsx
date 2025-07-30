import React, { useState } from 'react';
import Header from './components/Header';
import MasonryGrid from './components/MasonryGrid';
import './index.css'; // loads the reset + push styles

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main style={{ flex: 1, paddingTop: '60px' }}>
        <MasonryGrid />
      </main>
    </div>
  );
}
