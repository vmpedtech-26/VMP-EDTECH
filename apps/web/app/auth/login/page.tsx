'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../login.css';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('vmp_token');
    if (token) router.push('/admin/capacitaciones');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setError('Completá usuario y contraseña.'); return; }
    setLoading(true);
    setError('');

    try {
      // Step 1: Login
      const loginRes = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      });
      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Usuario o contraseña incorrectos.');
      }
      const loginData = await loginRes.json();
      const { access_token, user } = loginData;

      // Step 2: Get context (organizations → context)
      let contextToken = access_token;
      try {
        const ctxRes = await fetch(`${API}/api/auth/context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
          body: JSON.stringify({ organizationId: 'vmp-org-001' })
        });
        if (ctxRes.ok) {
          const ctx = await ctxRes.json();
          contextToken = ctx.accessToken || access_token;
          if (ctx.user) Object.assign(user, ctx.user);
        }
      } catch {}

      // Save session
      localStorage.setItem('vmp_token', contextToken);
      localStorage.setItem('vmp_user', JSON.stringify(user || {}));
      document.cookie = `vmp_token=${contextToken}; path=/; max-age=${60*60*24*7}`;

      router.push('/admin/capacitaciones');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo__mark">V</div>
          <div>
            <div className="auth-logo__name">VMP EdTech</div>
            <div className="auth-logo__tagline">Capacitaciones Profesionales</div>
          </div>
        </div>

        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-subtitle">Ingresá tus credenciales para acceder</p>

        {error && (
          <div className="auth-error">
            <span className="material-icons">warning</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Usuario o correo electrónico</label>
            <input
              id="identifier"
              type="text"
              className="auth-input"
              placeholder="usuario@empresa.com"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
}
