// src/components/MasonryGrid.jsx
import React, { useEffect, useRef, useState } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import Player from '@vimeo/player';
import './MasonryGrid.css';
import cardData from '../data/cards';
import { motion } from 'framer-motion';

export default function MasonryGrid() {
  const gridRef = useRef(null);
  const [modalVideo, setModalVideo] = useState(null);

  // Initialize Masonry and relayout on image load
  useEffect(() => {
    const grid = gridRef.current;
    const msnry = new Masonry(grid, {
      itemSelector: '.card',
      columnWidth: '.grid-sizer',
      gutter: 30,
      percentPosition: true,
      fitWidth: false
    });
    const imgLoad = imagesLoaded(grid);
    imgLoad.on('progress', () => msnry.layout());
    return () => {
      imgLoad.off('progress');
      msnry.destroy();
    };
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setModalVideo(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Reload 3s previews when lightbox closes
  const prevModal = useRef(modalVideo);
  useEffect(() => {
    if (prevModal.current && !modalVideo) {
      const containers = gridRef.current.querySelectorAll('.thumb-container');
      containers.forEach(c => {
        const iframe = c.querySelector('iframe');
        if (iframe) {
          // reset playback to 0
          const player = new Player(iframe);
          player.setCurrentTime(0);
        }
      });
    }
    prevModal.current = modalVideo;
  }, [modalVideo]);

  return (
    <>
      <div className="grid" ref={gridRef}>
        <div className="grid-sizer" />
        {cardData.map((card, i) => {
          const isVimeo = Boolean(card.vimeoId);
          const imageUrl = isVimeo
            ? `https://vumbnail.com/${card.vimeoId}.jpg`
            : card.image;

          return (
            <motion.div
              key={i}
              className={`card ${isVimeo ? 'video' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Thumbnail
                vimeoId={card.vimeoId}
                src={imageUrl}
                alt={card.title}
                onClick={
                  isVimeo
                    ? () =>
                        setModalVideo(
                          `https://player.vimeo.com/video/${card.vimeoId}?autoplay=1`
                        )
                    : null
                }
              />
            </motion.div>
          );
        })}
      </div>

      {modalVideo && (
        <div className="lightbox" onClick={() => setModalVideo(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setModalVideo(null)}
            >
              ×
            </button>
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

function Thumbnail({ vimeoId, src, alt, onClick }) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!vimeoId) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&quality=240p`;
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.style.pointerEvents = 'none';
    containerRef.current.appendChild(iframe);

    const player = new Player(iframe, {
      loop: false,
      autopause: false
    });

    player.ready().then(() => {
      setLoaded(true);
      player.on('timeupdate', ({ seconds }) => {
        if (seconds >= 6) {
          player.setCurrentTime(0);
        }
      });
    });

    return () => {
      player.unload().catch(() => {});
      containerRef.current.removeChild(iframe);
    };
  }, [vimeoId]);

  const handleImgLoad = () => setLoaded(true);

  return (
    <div
      className="thumb-container"
      ref={containerRef}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {!loaded && <div className="skeleton" />}
      {!vimeoId && (
        <img src={src} alt={alt} onLoad={handleImgLoad} />
      )}
      {onClick && <div className="play-icon" />}
    </div>
  );
}
