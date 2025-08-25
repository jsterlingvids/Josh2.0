// src/components/MasonryGrid.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import Player from '@vimeo/player';
import './MasonryGrid.css';
import cardData from '../data/cards';
import { motion } from 'framer-motion';

export default function MasonryGrid() {
  const gridRef = useRef(null);

  // Modal only used for Vimeo (IG now opens in new tab)
  const [modal, setModal] = useState({ src: null, isIG: false });

  // Sort cards by order
  const sortedCards = useMemo(() => {
    const arr = [...cardData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return arr;
  }, []);

  // Masonry + ImagesLoaded
  useEffect(() => {
    if (!gridRef.current) return;
    let msnry;
    try {
      msnry = new Masonry(gridRef.current, {
        itemSelector: '.card',
        columnWidth: '.grid-sizer',
        gutter: 30,
        percentPosition: true,
        fitWidth: false,
      });
    } catch {
      return;
    }

    const imgLoad = imagesLoaded(gridRef.current);
    const layout = () => msnry.layout();
    imgLoad.on('progress', layout);
    imgLoad.on('done', layout);

    const onResize = debounce(layout, 120);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      try { msnry.destroy(); } catch {}
    };
  }, []);

  // Pause/resume Vimeo previews when modal opens/closes
  const prevModal = useRef(modal.src);
  useEffect(() => {
    if (!gridRef.current) return;
    gridRef.current
      .querySelectorAll('.thumb-container iframe')
      .forEach((iframe) => {
        const player = new Player(iframe);
        if (modal.src) {
          player.pause().catch(() => {});
        } else if (prevModal.current && !modal.src) {
          player.setCurrentTime(0).then(() => player.play()).catch(() => {});
        }
      });
    prevModal.current = modal.src;
  }, [modal.src]);

  return (
    <>
      <div className="grid" ref={gridRef}>
        <div className="grid-sizer" />

        {sortedCards.map((card, idx) => {
          const { vimeoId, title, instagramShortcode } = card;

          // Instagram card: open REEL in a new tab
          if (instagramShortcode && !vimeoId) {
            const imgName = title.replace(/\s+/g, '_') + '.jpg';
            const localPath = `/images/${imgName}`;
            return (
              <motion.div
                key={`ig-${idx}`}
                className="card instagram-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <a
                  href={`https://www.instagram.com/reel/${instagramShortcode}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={title || 'Open Instagram Reel'}
                  style={{ display: 'block' }}
                >
                  <div className="thumb-container ig" style={{ cursor: 'pointer' }}>
                    <img
                      src={localPath}
                      alt={title || 'Instagram Reel'}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="play-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          }

          // Vimeo / static image
          const imageUrl = vimeoId
            ? `https://vumbnail.com/${vimeoId}.jpg`
            : card.image;

          return (
            <motion.div
              key={vimeoId || `img-${idx}`}
              className={`card ${vimeoId ? 'video' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Thumbnail
                vimeoId={vimeoId}
                src={imageUrl}
                alt={title}
                onClick={
                  vimeoId
                    ? () =>
                        setModal({
                          src: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
                          isIG: false,
                        })
                    : null
                }
              />
            </motion.div>
          );
        })}
      </div>

      {modal.src && (
        <div className="lightbox" onClick={() => setModal({ src: null, isIG: false })}>
          <div
            className={`lightbox-content ${modal.isIG ? 'ig' : 'landscape'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              aria-label="Close video"
              type="button"
              onClick={() => setModal({ src: null, isIG: false })}
            >
              ×
            </button>
            <div className="video-wrapper">
              <iframe
                src={modal.src}
                frameBorder="0"
                allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Embedded video"
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
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; fullscreen';
    iframe.style.pointerEvents = 'none';
    containerRef.current?.appendChild(iframe);

    const player = new Player(iframe, { loop: false, autopause: false });
    player.ready().then(() => {
      setLoaded(true);
      player.on('timeupdate', ({ seconds }) => {
        if (seconds >= 6) player.setCurrentTime(0).catch(() => {});
      });
    }).catch(() => {});

    return () => {
      player.unload().catch(() => {});
      if (containerRef.current?.contains(iframe)) {
        containerRef.current.removeChild(iframe);
      }
    };
  }, [vimeoId]);

  return (
    <div
      className="thumb-container"
      ref={containerRef}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {!loaded && vimeoId && <div className="skeleton" />}
      {src && !vimeoId && (
        <img
          src={src}
          alt={alt || 'Video thumbnail'}
          loading="lazy"
        />
      )}
      {onClick && <div className="play-icon" />}
    </div>
  );
}

function debounce(fn, wait = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
