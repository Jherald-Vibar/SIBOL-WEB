import React, { useEffect, useState } from 'react'
import Logo from '../assets/logo-left.png'
import { useNavigate } from 'react-router-dom'
import axiosClient, { API_BASE_URL } from './axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email || !password) {
      setError("Both fields are required!");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axiosClient.post("/login", { email, password });
      const data = response.data;
      const role = data.role;
      const token = data.token;

      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", data.user.name || '');
      localStorage.setItem("email", data.user.email || '');
      localStorage.setItem("location", data.user.location || '');
      localStorage.setItem("image", data.user.image || '');
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("google_id", data.user.google_id || '');

      if (role === "admin") { navigate("/admin/crop-profile"); return; }
      if (role === "user")  { navigate("/user/dashboard");    return; }

      setIsLoading(false);
      setError("Unrecognized role.");
    } catch (error) {
      setIsLoading(false);
      setError("Login failed! Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "https://sibol-web.onrender.com/api/auth/google"; // ✅ use backend URL
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', display: 'flex', background: '#f7f4ee', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --forest: #0b3d1e;
          --moss: #1a6636;
          --fern: #2e8b57;
          --cream: #f7f4ee;
          --amber: #d4840a;
          --amber-light: #f0a830;
        }

        .auth-left {
          width: 42%;
          min-height: 100vh;
          background: var(--forest);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          right: -60px; top: 0;
          width: 120px; height: 100%;
          background: var(--cream);
          clip-path: polygon(60px 0, 100% 0, 100% 100%, 0 100%);
          z-index: 10;
        }
        .auth-left-orb {
          position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.2) 0%, transparent 70%);
          top: -100px; left: -100px; pointer-events: none;
        }
        .auth-left-orb2 {
          position: absolute;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(212,132,10,0.1) 0%, transparent 70%);
          bottom: 50px; right: 50px; pointer-events: none;
        }
        .auth-left-content {
          position: relative; z-index: 5;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 48px 56px 48px 48px;
          animation: fadeUp 0.9s 0.1s ease-out both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-10px); }
        }
        @keyframes livePulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.4; transform:scale(1.4); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-logo {
          width: 100px; margin-bottom: 28px;
          animation: floatY 3s ease-in-out infinite;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
          cursor: pointer; transition: transform 0.3s;
        }
        .auth-logo:hover { transform: scale(1.08) rotate(4deg); }

        .auth-left-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px;
          border: 1px solid rgba(212,132,10,0.4);
          border-radius: 100px;
          color: var(--amber-light);
          font-size: 10px; letter-spacing: 1.8px;
          text-transform: uppercase; margin-bottom: 20px;
        }
        .auth-left-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--amber);
          animation: livePulse 1.8s ease-in-out infinite;
        }
        .auth-left-h {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 700; line-height: 1.15;
          color: #fff; margin-bottom: 14px;
        }
        .auth-left-h em { font-style: italic; color: var(--amber-light); }
        .auth-left-sub {
          font-size: 13px; color: rgba(255,255,255,0.42);
          line-height: 1.8; max-width: 240px;
        }

        /* RIGHT */
        .auth-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 48px 48px 80px;
          animation: fadeUp 0.9s 0.3s ease-out both;
        }
        .auth-form-wrap { width: 100%; max-width: 400px; }

        .auth-brand-mobile {
          display: none;
          align-items: center; gap: 10px;
          margin-bottom: 32px;
        }
        .auth-brand-chip {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--amber);
          display: flex; align-items: center; justify-content: center;
        }
        .auth-brand-chip img { width: 22px; object-fit: contain; }
        .auth-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: var(--forest); letter-spacing: 2px;
        }

        .auth-eyebrow {
          font-size: 10px; font-weight: 500; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--fern);
          margin-bottom: 8px;
        }
        .auth-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 700; color: var(--forest);
          line-height: 1.1; margin-bottom: 6px;
        }
        .auth-title em { font-style: italic; color: var(--fern); }
        .auth-subtitle { font-size: 13px; color: #7a8a80; margin-bottom: 28px; }

        /* Google button */
        .google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px 20px;
          background: #fff;
          border: 1.5px solid rgba(11,61,30,0.15);
          border-radius: 12px;
          font-size: 14px; font-weight: 500;
          color: #0b3d1e;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 22px;
        }
        .google-btn:hover {
          background: #f9fafb;
          border-color: rgba(11,61,30,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.07);
          transform: translateY(-1px);
        }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 22px;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(11,61,30,0.1);
        }
        .auth-divider span { font-size: 11px; color: #b0bdb7; letter-spacing: 1px; }

        /* Error */
        .auth-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 3px solid #ef4444;
          border-radius: 10px;
          margin-bottom: 20px;
          animation: shake 0.45s ease;
        }
        .auth-error svg { color: #ef4444; flex-shrink: 0; margin-top: 1px; }
        .auth-error-text { font-size: 13px; color: #991b1b; line-height: 1.5; }

        /* Fields */
        .auth-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
        .auth-field-group { display: flex; flex-direction: column; gap: 6px; }
        .auth-field-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.5px;
          color: var(--forest); padding-left: 4px;
        }
        .auth-field {
          display: flex; align-items: center; gap: 12px;
          background: #fff;
          border: 1.5px solid rgba(11,61,30,0.18);
          border-radius: 12px; padding: 13px 16px;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
        }
        .auth-field:focus-within {
          border-color: var(--fern);
          box-shadow: 0 0 0 3px rgba(46,139,87,0.1);
          transform: translateY(-1px);
        }
        .auth-field svg { color: var(--fern); flex-shrink: 0; }
        .auth-field input {
          flex: 1; border: none; outline: none;
          background: transparent;
          font-size: 14px; color: var(--forest);
          font-family: 'DM Sans', sans-serif;
        }
        .auth-field input::placeholder { color: #b0bdb7; }
        .auth-field button { background: none; border: none; cursor: pointer; color: var(--fern); padding: 0; display: flex; transition: color 0.2s; }
        .auth-field button:hover { color: var(--forest); }

        .auth-forgot {
          text-align: right; margin-top: -2px;
          font-size: 12px; color: var(--fern);
          text-decoration: none; font-weight: 500;
          transition: color 0.2s; display: block;
        }
        .auth-forgot:hover { color: var(--amber); }

        /* Submit */
        .auth-submit {
          width: 100%; padding: 15px;
          background: var(--forest);
          border: none; border-radius: 12px;
          color: #fff;
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-submit:hover:not(:disabled) {
          background: var(--moss);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(11,61,30,0.3);
        }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { animation: spin 0.7s linear infinite; }

        .auth-bottom-link {
          text-align: center; margin-top: 22px;
          font-size: 13px; color: #7a8a80;
        }
        .auth-bottom-link a {
          color: var(--amber); font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-bottom-link a:hover { color: var(--amber-light); }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { padding: 40px 24px; }
          .auth-brand-mobile { display: flex; }
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left-orb" />
        <div className="auth-left-orb2" />
        <div className="auth-left-content">
          <a href="/"><img src={Logo} alt="SIBOL" className="auth-logo" /></a>
          <div className="auth-left-pill">
            <span className="auth-left-dot" />
            IoT Crop Monitoring
          </div>
          <h2 className="auth-left-h">
            Smart farming<br />starts with<br /><em>real data.</em>
          </h2>
          <p className="auth-left-sub">
            Connect your fields. Monitor in real time. Make better decisions.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Mobile brand */}
          <div className="auth-brand-mobile">
            <button onClick={() => navigate('/')} className="auth-brand-chip"><img src={Logo} alt="" /></button>
            <span className="auth-brand-name">SIBOL</span>
          </div>

          <div className="auth-eyebrow">Welcome back</div>
          <h1 className="auth-title">Sign <em>in</em></h1>
          <p className="auth-subtitle">Enter your credentials to access your farm dashboard.</p>

          {/* Google Sign In */}
          <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="auth-divider"><span>or</span></div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="auth-error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="auth-fields">
              <div className="auth-field-group">
                <label className="auth-field-label">Email address</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/>
                  </svg>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
                  </svg>
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
                      </svg>
                    )}
                  </button>
                </div>
                <a href="#" className="auth-forgot">Forgot password?</a>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <>
                  <svg className="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity="0.75" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p className="auth-bottom-link">
            Don't have an account? <a href="/guest/sign_up">Sign up.</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
