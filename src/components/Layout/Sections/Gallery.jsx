import React, { useState, useEffect, useRef } from "react";

const IMGS = [
  "https://i.pinimg.com/1200x/88/b9/13/88b91315550eddddde352a7c3764cfc1.jpg",
  "https://i.pinimg.com/1200x/bd/fc/27/bdfc27350c27ffe77e740171400824cd.jpg",
  "https://i.pinimg.com/1200x/ea/15/28/ea1528ef6bea2c627acc6995d4a554d1.jpg",
  "https://i.pinimg.com/736x/ea/6e/f2/ea6ef278844fec6a1bdfe2a4d97014cb.jpg",
  "https://i.pinimg.com/736x/56/10/eb/5610eb710a1505cd5efb1b956e007278.jpg",
  "https://i.pinimg.com/1200x/2e/df/c8/2edfc813f5699684e2fd0b97d4a61040.jpg",
  "https://i.pinimg.com/1200x/37/02/d3/3702d3ea28786c2b219b98659bccac64.jpg",
];

const Gallery = () => {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % IMGS.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <section id="gallery" className="gallery-section">
      <div className="section-wrap">
        <div className="section-label">Our Gallery</div>
        <h2 className="section-title">Event <em>Memories</em></h2>
        <div className="slider"
          onTouchStart={e => touchStart.current = e.changedTouches[0].screenX}
          onTouchEnd={e => {
            const d = touchStart.current - e.changedTouches[0].screenX;
            if (Math.abs(d) > 40) setIdx(p => d > 0 ? (p + 1) % IMGS.length : (p - 1 + IMGS.length) % IMGS.length);
          }}>
          <div className="slides" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {IMGS.map((src, i) => <img key={i} src={src} alt={`gallery-${i}`} loading="lazy" />)}
          </div>
          <button className="prev" onClick={() => setIdx(p => (p - 1 + IMGS.length) % IMGS.length)}>&#10094;</button>
          <button className="next" onClick={() => setIdx(p => (p + 1) % IMGS.length)}>&#10095;</button>
        </div>
        <div className="dots">
          {IMGS.map((_, i) => <span key={i} className={i === idx ? "active" : ""} onClick={() => setIdx(i)} />)}
        </div>
      </div>
    </section>
  );
};

export default Gallery;