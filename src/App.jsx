import React, { useState } from 'react';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';

export default function App() {
  const [mode, setMode] = useState('user');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Library Seating Platform</h1>
          <p>Map-first reservation flow with librarian management.</p>
        </div>
        <div className="mode-switch" role="tablist" aria-label="App mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'user'}
            className={mode === 'user' ? 'active' : ''}
            onClick={() => setMode('user')}
          >
            User View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'admin'}
            className={mode === 'admin' ? 'active' : ''}
            onClick={() => setMode('admin')}
          >
            Librarian View
          </button>
        </div>
      </header>

      {mode === 'user' ? <UserPage /> : <AdminPage />}
    </div>
  );
}
