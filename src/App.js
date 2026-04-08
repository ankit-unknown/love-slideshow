import React from 'react';
import Slideshow from './components/Slideshow';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="hearts-bg" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`heart heart-${i + 1}`}>♥</span>
        ))}
      </div>

      <header className="app-header">
        <h1 className="app-title">Our Moments</h1>
        <p className="app-subtitle">A collection of beautiful memories</p>
      </header>

      <main className="app-main">
        <Slideshow />
      </main>

      <footer className="app-footer">
        <p>Made with <span className="heart-icon">♥</span> for you</p>
      </footer>
    </div>
  );
}

export default App;