import React, { useEffect, useRef, useState } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import './MasonryGrid.css';
import cardData from '../data/cards';
import { motion } from 'framer-motion';

export default function MasonryGrid() {
  const gridRef = useRef(null);
  const [modalVideo, setModalVideo] = useState(null);

  useEffect(() => {
    const msnry = new Masonry(gridRef.current, {
      itemSelector: '.card',
      columnWidth: '.grid-sizer',
      gutter: 20,
      percentPosition: true
    });

    imagesLoaded(gridRef.current, () => {
      msnry.layout();
    });

    return () => msnry.destroy();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setModalVideo(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <div className="grid" ref={gridRef}>
        <div className="grid-sizer"></div>
        {cardData.map((card, index) => {
          const isVimeo = !!card.vimeoId;
          const imageUrl = isVimeo
            ? `https://vumbnail.com/${card.vimeoId}.jpg`
            : card.image;

          return (
            <motion.div
              key={index}
              className={`card ${isVimeo ? 'video' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Thumbnail
                src={imageUrl}
                alt={card.title}
                onClick={
                  isVimeo
                    ? () => setModalVideo(`https://player.vimeo.com/video/${card.vimeoId}?autoplay=1`)
                    : null
                }
              />
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {modalVideo && (
        <div className="lightbox" onClick={() => setModalVideo(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalVideo(null)}>×</button>
            <div className="video-wrapper">
              <iframe
                src={modalVideo}
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="Vimeo video"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Thumbnail({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const img = (
    <img
      src={src}
      alt={alt}
      onLoad={() => {
        setLoaded(true);
        imagesLoaded(document.querySelector('.grid'), () => {
          new Masonry(document.querySelector('.grid'), {
            itemSelector: '.card',
            columnWidth: '.grid-sizer',
            gutter: 20,
            percentPosition: true
          }).layout();
        });
      }}
    />
  );

  return (
    <div
      className={`thumb-container ${loaded ? 'loaded' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {!loaded && <div className="skeleton" />}
      {img}
      {onClick && <div className="play-icon" />}
    </div>
  );
}
