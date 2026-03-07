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
        <h1 id="credentials-title">Sign In as {role === 'librarian' ? 'Librarian' : 'User'}</h1>
        <p>Enter your details to continue.</p>

        <form className="login-form" onSubmit={submit}>
          <label>
            Username
            <input
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
            Demo login: user / user for User, admin / admin for Librarian.
          </p>

          {error ? <p className="alert error">{error}</p> : null}

          <div className="login-actions">
            <button type="button" className="btn light" onClick={onBack}>
              Back
            </button>
            <button type="submit" className="btn">Log In</button>
          </div>
        </form>
      </section>
    </main>
  );
}
