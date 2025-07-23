import React, { useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import './MasonryGrid.css';
import cardData from '../data/cards';

export default function MasonryGrid() {
  const gridRef = useRef(null);

  useEffect(() => {
    new Masonry(gridRef.current, {
      itemSelector: '.card',
      columnWidth: '.grid-sizer',
      gutter: 20,
      percentPosition: true
    });
  }, []);

  return (
   <div className="grid" ref={gridRef}>
  <div className="grid-sizer"></div> {/* 👈 This tells Masonry the column width */}
  {cardData.map((card, index) => (
    <div key={index} className={`card ${card.tall ? 'tall' : ''}`}>
      <img src={card.image} alt={card.title} />
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  ))}
</div>

  );
}
