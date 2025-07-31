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
  const [modalVideo, setModalVideo] = useState(null);

  // sort cards by `order` field
  const sortedCards = useMemo(
    () => [...cardData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    []
  );

  // 1) Masonry + ImagesLoaded
  useEffect(() => {
    const grid = gridRef.current;
    const msnry = new Masonry(grid, {
      itemSelector: '.card',
      columnWidth: '.grid-sizer',
      gutter: 30,
      percentPosition: true,
      fitWidth: false,
    });
    const imgLoad = imagesLoaded(grid);
    imgLoad.on('progress', () => msnry.layout());
    return () => {
      imgLoad.off('progress');
      msnry.destroy();
    };
  }, []);

  // 2) Process Instagram embeds
  useEffect(() => {
    if (window.instgrm?.Embeds) {
      window.instgrm.Embeds.process();
    }
  });

  // 3) Pause/resume Vimeo previews when lightbox toggles
  const prevModal = useRef(modalVideo);
  useEffect(() => {
    if (!gridRef.current) return;
    gridRef.current
      .querySelectorAll('.thumb-container iframe')
      .forEach((iframe) => {
        const player = new Player(iframe);
        if (modalVideo) {
          player.pause().catch(() => {});
        } else if (prevModal.current && !modalVideo) {
          player
            .setCurrentTime(0)
            .then(() => player.play().catch(() => {}))
            .catch(() => {});
        }
      });
    prevModal.current = modalVideo;
  }, [modalVideo]);

  return (
    <>
      <div className="grid" ref={gridRef}>
        <div className="grid-sizer" />

        {sortedCards.map((card) => {
          const { vimeoId, instagramShortcode, title } = card;

          // INSTAGRAM EMBED
          if (instagramShortcode && !vimeoId) {
            return (
              <motion.div
                key={`ig-${instagramShortcode}`}
                className="card instagram-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() =>
                  setModalVideo(
                    `https://www.instagram.com/reel/${instagramShortcode}/embed`
                  )
                }
                style={{ cursor: 'pointer' }}
              >
                <iframe
                  src={`https://www.instagram.com/reel/${instagramShortcode}/embed`}
                  frameBorder="0"
                  scrolling="no"
                  allow="clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={title}
                  style={{ width: '100%', height: '100%' }}
                />
              </motion.div>
            );
          }

          // VIMEO PREVIEW CARD
          const imageUrl = vimeoId
            ? `https://vumbnail.com/${vimeoId}.jpg`
            : card.image;

          return (
            <motion.div
              key={vimeoId}
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
                        setModalVideo(
                          `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
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
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
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
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Lazy-loading Thumbnail component
function Thumbnail({ vimeoId, src, alt, onClick }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 1) Observe when the card enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2) Inject the Vimeo iframe only when in view
  useEffect(() => {
    if (!vimeoId || !inView) return;

    const iframe = document.createElement('iframe');
    iframe.loading = 'lazy';
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&quality=144p`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; fullscreen';
    iframe.style.pointerEvents = 'none';
    containerRef.current.appendChild(iframe);

    const player = new Player(iframe, { loop: false, autopause: false });
    player.ready().then(() => {
      setLoaded(true);
      player.on('timeupdate', ({ seconds }) => {
        if (seconds >= 6) player.setCurrentTime(0);
      });
    });

    return () => {
      player.unload().catch(() => {});
      containerRef.current.removeChild(iframe);
    };
  }, [inView, vimeoId]);

  return (
    <div
      className="thumb-container"
      ref={containerRef}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {!loaded && <div className="skeleton" />}
      {onClick && <div className="play-icon" />}
    </div>
  );
}
