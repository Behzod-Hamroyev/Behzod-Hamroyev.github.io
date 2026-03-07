import React, { useState } from 'react';

export default function LoginPage({ onSelectRole, onBack }) {
  const [role, setRole] = useState('user');

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Choose Your Role</h1>
        <p>Pick how you want to sign in.</p>

        <div className="login-form">
          <fieldset className="role-picker">
            <legend>Choose Role</legend>
            <button
              type="button"
              className={role === 'user' ? 'role-card active' : 'role-card'}
              onClick={() => setRole('user')}
            >
              <strong>User</strong>
              <span>Find a seat and book it quickly.</span>
            </button>
            <button
              type="button"
              className={role === 'librarian' ? 'role-card active' : 'role-card'}
              onClick={() => setRole('librarian')}
            >
              <strong>Librarian</strong>
              <span>Keep rooms and seat availability up to date.</span>
            </button>
          </fieldset>

          <div className="login-actions">
            <button type="button" className="btn light" onClick={onBack}>
              Back
            </button>
            <button type="button" className="btn" onClick={() => onSelectRole(role)}>
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
