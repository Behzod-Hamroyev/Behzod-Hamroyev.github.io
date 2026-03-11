import React from 'react';

export default function WelcomePage({ onStartLogin }) {
  return (
    <main className="welcome-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="welcome-grid">
          <div className="welcome-copy">
            <p className="welcome-pill">Library Seating Platform</p>
            <h1 id="welcome-title">Find your perfect seat in seconds.</h1>
            <p>
              Check seat availability at a glance, book with confidence, and keep your library
              spaces running smoothly.
            </p>
            <div className="welcome-actions">
              <button type="button" className="btn" onClick={onStartLogin}>
                Log In
              </button>
            </div>
          </div>

          <aside className="welcome-preview" aria-label="Seat status preview">
            <header>
              <strong>Live Seat View</strong>
            </header>
            <div className="preview-grid">
              <span className="seat-dot available">A1</span>
              <span className="seat-dot reserved">A2</span>
              <span className="seat-dot occupied">A3</span>
              <span className="seat-dot available">B1</span>
              <span className="seat-dot available">B2</span>
              <span className="seat-dot reserved">B3</span>
              <span className="seat-dot occupied">C1</span>
              <span className="seat-dot available">C2</span>
              <span className="seat-dot available">C3</span>
            </div>
            <div className="preview-legend">
              <span><i className="dot available" aria-hidden="true" /> Available</span>
              <span><i className="dot reserved" aria-hidden="true" /> Reserved</span>
              <span><i className="dot occupied" aria-hidden="true" /> Occupied</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="welcome-feature-row" aria-label="Key features">
        <article className="welcome-feature-card">
          <h3>Easy Seat Map</h3>
          <p>See available, reserved, and busy seats instantly.</p>
        </article>
        <article className="welcome-feature-card">
          <h3>Clear Spaces for Everyone</h3>
          <p>Students and librarians each get the tools they need.</p>
        </article>
        <article className="welcome-feature-card">
          <h3>Quick Seat Updates</h3>
          <p>Librarians can update multiple seats in just a few clicks.</p>
        </article>
      </section>
    </main>
  );
}
