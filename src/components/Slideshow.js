import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Slideshow.css';

const importAll = (ctx) => ctx.keys().map((k) => ctx(k));
const photoFiles = importAll(
  require.context('../photos', false, /\.(png|jpe?g|gif|webp|avif)$/i)
);

const captions = [
  { caption: 'My Sweetheart 💕', sub: 'Every moment with you is magical' },
  { caption: 'My Love 💖',       sub: 'You light up my entire world' },
  { caption: 'My Life 🌸',       sub: 'I cannot imagine life without you' },
  { caption: 'My Everything 💗', sub: 'You are my greatest adventure' },
  { caption: 'My Forever ✨',    sub: 'Together is my favourite place to be' },
  { caption: 'My Sunshine ☀️',  sub: 'Your smile makes everything better' },
  { caption: 'My Heartbeat 💓', sub: 'My heart skips a beat for you' },
  { caption: 'My World 🌍',      sub: 'You are my whole universe' },
  { caption: 'My Joy 😊',        sub: 'You make every day worth living' },
  { caption: 'My Dream 🌙',      sub: 'I never want to wake up from you' },
];

const photos = photoFiles.map((src, i) => ({
  src,
  ...captions[i % captions.length],
}));

const SLIDE_DURATION = 3500;

function HeartBurst({ id, x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="heart-burst" style={{ left: x, top: y }} aria-hidden>
      {['♥','♡','❤','💕'].map((h, i) => (
        <span key={i} className={`hb hb-${i}`}>{h}</span>
      ))}
    </div>
  );
}

export default function Slideshow() {
  const [current, setCurrent]     = useState(0);
  const [captionKey, setCaptionKey] = useState(0);
  const [paused, setPaused]       = useState(false);
  const [progress, setProgress]   = useState(0);
  const [hearts, setHearts]       = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef    = useRef(null);
  const progressRef = useRef(null);
  const startTime   = useRef(null);
  const heartId     = useRef(0);

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setCaptionKey(k => k + 1);
      setIsTransitioning(false);
    }, 450);
  }, [isTransitioning]);

  const next = useCallback(() => goTo((current + 1) % photos.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + photos.length) % photos.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    startTime.current = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
    }, 30);

    timerRef.current = setTimeout(next, SLIDE_DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [current, paused, next]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === ' ')          setPaused(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const spawnHearts = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++heartId.current;
    setHearts(h => [...h, { id, x, y }]);
  }, []);

  const removeHeart = useCallback((id) => {
    setHearts(h => h.filter(p => p.id !== id));
  }, []);

  if (!photos.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📷</div>
        <p>No photos found in <code>src/photos/</code></p>
      </div>
    );
  }

  const getSlide = (offset) => {
    const index = (current + offset + photos.length) % photos.length;
    return { ...photos[index], index };
  };
  const slides = [-2, -1, 0, 1, 2].map(o => ({ offset: o, data: getSlide(o) }));

  return (
    <div
      className="carousel-wrapper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="orb orb-a" aria-hidden />
      <div className="orb orb-b" aria-hidden />
      <div className="orb orb-c" aria-hidden />

      <div className="film-strip" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => <span key={i} className="film-hole" />)}
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <div className="progress-glow" style={{ left: `${progress}%` }} />
      </div>

      <div className="slide-counter" aria-live="polite">
        <span className="sc-current">{String(current + 1).padStart(2, '0')}</span>
        <span className="sc-sep"> / </span>
        <span className="sc-total">{String(photos.length).padStart(2, '0')}</span>
      </div>

      <div className="carousel-stage">
        {slides.map(({ offset, data }) => (
          <div
            key={data.index}
            className={`carousel-slide offset-${offset}${offset === 0 && isTransitioning ? ' transitioning' : ''}`}
            onClick={offset === 0 ? spawnHearts : () => goTo(data.index)}
            aria-label={offset === 0 ? data.caption : `Go to ${data.caption}`}
            role={offset !== 0 ? 'button' : undefined}
            tabIndex={offset !== 0 ? 0 : undefined}
          >
            <div className="carousel-img-wrap">
              <img
                src={data.src}
                alt={data.caption}
                className="carousel-img"
                loading="lazy"
                decoding="async"
              />
              {offset === 0 && <div className="center-vignette" aria-hidden />}
              {offset === 0 && <div className="shine-sweep" aria-hidden />}
            </div>

            {offset === 0 && (
              <div className="corner-frame" aria-hidden>
                <span className="cf tl" /><span className="cf tr" />
                <span className="cf bl" /><span className="cf br" />
              </div>
            )}

            {offset === 0 && hearts.map(h => (
              <HeartBurst
                key={h.id}
                id={h.id}
                x={h.x}
                y={h.y}
                onDone={() => removeHeart(h.id)}
              />
            ))}
          </div>
        ))}

        <button className="nav-btn nav-prev" onClick={prev} aria-label="Previous photo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button className="nav-btn nav-next" onClick={next} aria-label="Next photo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div className="caption-area" key={captionKey}>
        <div className="caption-ornament">
          <span className="orn-line" /><span className="orn-heart">♥</span><span className="orn-line" />
        </div>
        <h2 className="caption-title">{photos[current].caption}</h2>
        <p className="caption-sub">{photos[current].sub}</p>
      </div>

      <div className="dots" role="tablist" aria-label="Photo navigation">
        {photos.map((p, i) => (
          <button
            key={i}
            className={`dot${i === current ? ' dot-active' : ''}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Photo ${i + 1}: ${p.caption}`}
          />
        ))}
      </div>

      <div className="film-strip" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => <span key={i} className="film-hole" />)}
      </div>
    </div>
  );
}