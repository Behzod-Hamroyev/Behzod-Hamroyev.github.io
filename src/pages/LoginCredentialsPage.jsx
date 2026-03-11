import React, { useState } from 'react';

export default function LoginCredentialsPage({ role, onBack, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setError('Please enter both username and password.');
      return;
    }

    const expectedUsername = role === 'librarian' ? 'admin' : 'user';
    const expectedPassword = role === 'librarian' ? 'admin' : 'user';

    if (normalizedUsername !== expectedUsername || password !== expectedPassword) {
      setError('That username or password is not correct for this role.');
      return;
    }

    onLogin({
      name: normalizedUsername,
      role,
      loggedInAt: new Date().toISOString()
    });
  };

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="credentials-title">
        <h1 id="credentials-title">{role === 'librarian' ? 'Librarian Sign In' : 'Welcome Back'}</h1>
        <p>{role === 'librarian' ? 'Sign in to manage your library.' : 'Sign in to browse and reserve seats.'}</p>

        <form className="login-form" onSubmit={submit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) setError('');
              }}
              placeholder={role === 'librarian' ? 'admin' : 'user'}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              placeholder={role === 'librarian' ? 'admin' : 'user'}
            />
          </label>

          <p className="hint">
            Demo credentials — {role === 'librarian' ? 'username: admin, password: admin' : 'username: user, password: user'}
          </p>

          {error ? <p className="alert error">{error}</p> : null}

          <div className="login-actions">
            <button type="button" className="btn light" onClick={onBack}>
              Back
            </button>
            <button type="submit" className="btn">Sign In</button>
          </div>
        </form>
      </section>
    </main>
  );
}
