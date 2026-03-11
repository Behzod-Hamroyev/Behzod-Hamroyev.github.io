import React, { useEffect, useMemo, useState } from 'react';
import LibrarianPage from './pages/LibrarianPage';
import LoginCredentialsPage from './pages/LoginCredentialsPage';
import LoginPage from './pages/LoginPage';
import UserPage from './pages/UserPage';
import WelcomePage from './pages/WelcomePage';

const AUTH_KEY = 'library-seating-auth-v1';
const BOOKING_STATE_KEY = 'library-seating-state-v1';

function routeFromHash(hashValue) {
  if (!hashValue || hashValue === '#/' || hashValue === '#') return 'welcome';
  if (hashValue === '#/welcome') return 'welcome';
  if (hashValue.startsWith('#/login/credentials/')) return 'credentials';
  if (hashValue === '#/login') return 'login';
  if (hashValue === '#/user') return 'user';
  if (hashValue.startsWith('#/librarian')) return 'librarian';
  return 'welcome';
}

function roleFromCredentialsHash(hashValue) {
  const prefix = '#/login/credentials/';
  if (!hashValue.startsWith(prefix)) return '';
  const maybeRole = hashValue.slice(prefix.length);
  return maybeRole === 'user' || maybeRole === 'librarian' ? maybeRole : '';
}

function readAuthSession() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readLibraryName(libraryId) {
  if (!libraryId) return '';

  const raw = localStorage.getItem(BOOKING_STATE_KEY);
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);
    const library = parsed?.libraries?.find((item) => item.id === libraryId);
    return library?.name || '';
  } catch {
    return '';
  }
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash(window.location.hash));
  const [session, setSession] = useState(readAuthSession);
  const selectedLoginRole = roleFromCredentialsHash(window.location.hash);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(routeFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  useEffect(() => {
    if (!session && !['welcome', 'login', 'credentials'].includes(route)) {
      window.location.hash = '/welcome';
      return;
    }

    if (!session && route === 'credentials' && !selectedLoginRole) {
      window.location.hash = '/login';
      return;
    }

    if (session && ['welcome', 'login', 'credentials'].includes(route)) {
      window.location.hash = session.role === 'librarian' ? '/librarian/overview' : '/user';
      return;
    }

    if (session?.role !== 'librarian' && route === 'librarian') {
      window.location.hash = '/user';
      return;
    }

    if (session?.role === 'librarian' && route === 'user') {
      window.location.hash = '/librarian/overview';
    }
  }, [session, route, selectedLoginRole]);

  const navigate = (nextRoute) => {
    if (nextRoute === 'welcome') {
      window.location.hash = '/welcome';
      return;
    }

    if (nextRoute === 'librarian') {
      window.location.hash = '/librarian/overview';
      return;
    }

    if (nextRoute === 'login') {
      window.location.hash = '/login';
      return;
    }

    if (nextRoute === 'user') {
      window.location.hash = '/user';
      return;
    }

    window.location.hash = '/welcome';
  };

  const handleLogin = (authData) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    setSession(authData);
  };

  const updateSession = (nextSession) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const handleSelectLibrarianLibrary = (libraryId) => {
    if (!session) return;
    updateSession({ ...session, libraryId });
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
    navigate('welcome');
  };

  const librarianLibraryName = useMemo(
    () => readLibraryName(session?.libraryId),
    [session?.libraryId]
  );

  const isLoggedIn = Boolean(session);

  return (
    <div className="app-shell">
      {isLoggedIn ? (
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-mark" aria-hidden="true">LS</span>
            <span className="brand-name">Library Seating</span>
            {session?.role === 'librarian' && librarianLibraryName ? (
              <span className="brand-sub">{librarianLibraryName}</span>
            ) : null}
          </div>
          <div className="topbar-right">
            <div className="session-box">
              <div className="avatar" aria-label={`Logged in as ${session?.name}`}>
                {session?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="role-badge">{session?.role}</span>
              <button type="button" className="btn light" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </header>
      ) : null}

      {!isLoggedIn && route === 'welcome' ? <WelcomePage onStartLogin={() => navigate('login')} /> : null}
      {!isLoggedIn && route === 'login' ? (
        <LoginPage
          onBack={() => navigate('welcome')}
          onSelectRole={(role) => {
            window.location.hash = `/login/credentials/${role}`;
          }}
        />
      ) : null}
      {!isLoggedIn && route === 'credentials' && selectedLoginRole ? (
        <LoginCredentialsPage
          role={selectedLoginRole}
          onBack={() => {
            window.location.hash = '/login';
          }}
          onLogin={handleLogin}
        />
      ) : null}
      {isLoggedIn && route === 'user' ? <UserPage /> : null}
      {isLoggedIn && route === 'librarian' && session?.role === 'librarian' ? (
        <LibrarianPage
          selectedLibraryId={session.libraryId || ''}
          onSelectLibrary={handleSelectLibrarianLibrary}
        />
      ) : null}
    </div>
  );
}
