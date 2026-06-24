import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ImageLightbox
 * Props:
 *  images   — array of { url, publicId? } or just URL strings
 *  startIdx — index of the image to open first
 *  onClose  — callback when lightbox should close
 */
const ImageLightbox = ({ images = [], startIdx = 0, onClose }) => {
  const [current, setCurrent] = useState(startIdx);
  const [zoom, setZoom]       = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const imgRef = useRef(null);

  // Normalize images to array of URLs
  const urls = images.map(img => (typeof img === 'string' ? img : img.url));

  const goNext = useCallback(() => {
    setCurrent(i => (i + 1) % urls.length);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [urls.length]);

  const goPrev = useCallback(() => {
    setCurrent(i => (i - 1 + urls.length) % urls.length);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [urls.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  goNext();
      if (e.key === 'ArrowLeft')   goPrev();
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 4));
      if (e.key === '-')            setZoom(z => Math.max(z - 0.25, 0.5));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Mouse wheel zoom
  const onWheel = e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom(z => Math.min(Math.max(z + delta, 0.5), 4));
  };

  // Drag to pan when zoomed
  const onMouseDown = e => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = e => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => { setDragging(false); setDragStart(null); };

  // Touch support
  const touchRef = useRef(null);
  const onTouchStart = e => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, moved: false };
    }
  };
  const onTouchEnd = e => {
    if (!touchRef.current || touchRef.current.moved) return;
    const dx = (e.changedTouches[0].clientX - touchRef.current.x);
    if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev();
    }
    touchRef.current = null;
  };
  const onTouchMove = e => {
    if (touchRef.current) touchRef.current.moved = true;
  };

  const resetZoom = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  if (!urls.length) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {/* Close button */}
      <button className="lb-close" onClick={onClose} aria-label="Close lightbox">
        <i className="bi bi-x-lg" />
      </button>

      {/* Image counter */}
      {urls.length > 1 && (
        <div className="lb-counter">{current + 1} / {urls.length}</div>
      )}

      {/* Zoom controls */}
      <div className="lb-zoom-controls">
        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} aria-label="Zoom out">
          <i className="bi bi-zoom-out" />
        </button>
        <span className="lb-zoom-level" onClick={resetZoom}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} aria-label="Zoom in">
          <i className="bi bi-zoom-in" />
        </button>
      </div>

      {/* Prev arrow */}
      {urls.length > 1 && (
        <button className="lb-arrow lb-prev" onClick={goPrev} aria-label="Previous image">
          <i className="bi bi-chevron-left" />
        </button>
      )}

      {/* Main image */}
      <div
        className="lb-img-container"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={imgRef}
          src={urls[current]}
          alt={`View ${current + 1}`}
          className="lb-img"
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragging ? 'none' : 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Next arrow */}
      {urls.length > 1 && (
        <button className="lb-arrow lb-next" onClick={goNext} aria-label="Next image">
          <i className="bi bi-chevron-right" />
        </button>
      )}

      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div className="lb-thumbnails">
          {urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Thumb ${i + 1}`}
              className={`lb-thumb${i === current ? ' lb-thumb-active' : ''}`}
              onClick={() => { setCurrent(i); setZoom(1); setOffset({ x: 0, y: 0 }); }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
