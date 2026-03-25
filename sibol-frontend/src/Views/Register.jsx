import React, { useState } from 'react'
import Logo from '../assets/logo-left.png'
import { useNavigate, Link } from 'react-router-dom'
import axiosClient from './axios';

const Register = () => {
  const [form, setForm] = useState({ email: "", name: "", cp_number: "", password: "", location: "" });
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckboxChange = e => {
    if (e.target.checked) setShowTermsModal(true);
    else setAgreedToTerms(false);
  };

  const handleAcceptTerms = () => { setAgreedToTerms(true); setShowTermsModal(false); };
  const handleDeclineTerms = () => { setAgreedToTerms(false); setShowTermsModal(false); };

  const handleRegister = async e => {
    e.preventDefault();
    setIsLoading(true);
    if (!form.email || !form.name || !form.cp_number || !form.password) {
      setIsLoading(false); setError("All fields are required!"); return;
    }
    if (!agreedToTerms) {
      setIsLoading(false); setError("You must agree to the Terms and Agreement to continue!"); return;
    }
    try {
      await axiosClient.post("/register", form);
      setIsLoading(false);
      navigate("/guest/login");
    } catch (error) {
      if (error.response?.status === 422)
        setError(error.response.data.errors.email?.[0] || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

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
          width: 38%;
          min-height: 100vh;
          background: var(--forest);
          position: relative;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          overflow: hidden; flex-shrink: 0;
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
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.2) 0%, transparent 70%);
          top: -100px; left: -100px; pointer-events: none;
        }
        .auth-left-orb2 {
          position: absolute; width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(212,132,10,0.1) 0%, transparent 70%);
          bottom: 60px; right: 60px; pointer-events: none;
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
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-logo {
          width: 90px; margin-bottom: 24px;
          animation: floatY 3s ease-in-out infinite;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
          cursor: pointer; transition: transform 0.3s;
        }
        .auth-logo:hover { transform: scale(1.08) rotate(4deg); }
        .auth-left-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px;
          border: 1px solid rgba(212,132,10,0.4); border-radius: 100px;
          color: var(--amber-light);
          font-size: 10px; letter-spacing: 1.8px; text-transform: uppercase;
          margin-bottom: 18px;
        }
        .auth-left-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--amber); animation: livePulse 1.8s ease-in-out infinite;
        }
        .auth-left-h {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 2.5vw, 34px);
          font-weight: 700; line-height: 1.2; color: #fff; margin-bottom: 12px;
        }
        .auth-left-h em { font-style: italic; color: var(--amber-light); }
        .auth-left-sub {
          font-size: 12px; color: rgba(255,255,255,0.38);
          line-height: 1.8; max-width: 230px;
        }

        /* Steps indicator */
        .auth-steps {
          margin-top: 32px;
          display: flex; flex-direction: column; gap: 12px;
          width: 100%; max-width: 220px; align-self: flex-start;
          padding-left: 8px;
        }
        .auth-step {
          display: flex; align-items: center; gap: 12px;
        }
        .auth-step-circle {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        .auth-step-circle.done {
          background: var(--amber); border-color: var(--amber);
          color: #fff;
        }
        .auth-step-text { font-size: 12px; color: rgba(255,255,255,0.38); }
        .auth-step-text.done { color: rgba(255,255,255,0.7); }

        /* Right panel */
        .auth-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 48px 40px 80px;
          overflow-y: auto;
          animation: fadeUp 0.9s 0.3s ease-out both;
        }
        .auth-form-wrap { width: 100%; max-width: 420px; }

        .auth-brand-mobile {
          display: none; align-items: center; gap: 10px; margin-bottom: 28px;
        }
        .auth-brand-chip {
          width: 36px; height: 36px; border-radius: 10px; background: var(--amber);
          display: flex; align-items: center; justify-content: center;
        }
        .auth-brand-chip img { width: 22px; object-fit: contain; }
        .auth-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: var(--forest); letter-spacing: 2px;
        }

        .auth-eyebrow {
          font-size: 10px; font-weight: 500; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--fern); margin-bottom: 6px;
        }
        .auth-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 700; color: var(--forest); line-height: 1.1; margin-bottom: 6px;
        }
        .auth-title em { font-style: italic; color: var(--fern); }
        .auth-subtitle { font-size: 13px; color: #7a8a80; margin-bottom: 28px; }

        .auth-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px;
          background: #fef2f2; border: 1px solid #fecaca;
          border-left: 3px solid #ef4444; border-radius: 10px;
          margin-bottom: 18px; animation: shake 0.45s ease;
        }
        .auth-error svg { color: #ef4444; flex-shrink: 0; margin-top: 1px; }
        .auth-error-text { font-size: 13px; color: #991b1b; line-height: 1.5; }

        /* Two-column grid for fields */
        .auth-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .auth-fields .full { grid-column: 1 / -1; }

        .auth-field-group { display: flex; flex-direction: column; gap: 5px; }
        .auth-field-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.5px;
          color: var(--forest); padding-left: 4px; text-transform: uppercase;
        }
        .auth-field {
          display: flex; align-items: center; gap: 10px;
          background: #fff;
          border: 1.5px solid rgba(11,61,30,0.15);
          border-radius: 10px; padding: 11px 13px;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
        }
        .auth-field:focus-within {
          border-color: var(--fern);
          box-shadow: 0 0 0 3px rgba(46,139,87,0.1);
          transform: translateY(-1px);
        }
        .auth-field svg { color: var(--fern); flex-shrink: 0; }
        .auth-field input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 13px; color: var(--forest); font-family: 'DM Sans', sans-serif;
        }
        .auth-field input::placeholder { color: #b0bdb7; }
        .auth-field button { background: none; border: none; cursor: pointer; color: var(--fern); padding: 0; display: flex; transition: color 0.2s; }
        .auth-field button:hover { color: var(--forest); }

        /* Terms checkbox */
        .auth-terms {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 20px;
        }
        .auth-terms input[type="checkbox"] {
          appearance: none; width: 18px; height: 18px; flex-shrink: 0;
          border: 1.5px solid rgba(11,61,30,0.3); border-radius: 5px;
          cursor: pointer; position: relative; margin-top: 1px;
          transition: all 0.2s; background: #fff;
        }
        .auth-terms input[type="checkbox"]:checked {
          background: var(--forest); border-color: var(--forest);
        }
        .auth-terms input[type="checkbox"]:checked::after {
          content: '✓'; position: absolute;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          color: #fff; font-size: 11px; font-weight: 700;
        }
        .auth-terms label { font-size: 12px; color: #5a6472; line-height: 1.6; cursor: pointer; }
        .auth-terms-btn { color: var(--forest); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer; font-size: 12px; padding: 0; transition: color 0.2s; }
        .auth-terms-btn:hover { color: var(--amber); }

        .auth-submit {
          width: 100%; padding: 14px;
          background: var(--forest); border: none; border-radius: 10px;
          color: #fff; font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 700; letter-spacing: 1px;
          cursor: pointer; transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-submit:hover:not(:disabled) {
          background: var(--moss); transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(11,61,30,0.3);
        }
        .auth-submit:active { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .auth-bottom-link {
          text-align: center; margin-top: 18px;
          font-size: 13px; color: #7a8a80;
        }
        .auth-bottom-link a {
          color: var(--forest); font-weight: 600; text-decoration: none;
          border-bottom: 1.5px solid var(--amber); padding-bottom: 1px; transition: color 0.2s;
        }
        .auth-bottom-link a:hover { color: var(--amber); }

        .spin { animation: spin 0.7s linear infinite; }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
          z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .modal-box {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 580px;
          max-height: 85vh; overflow: hidden;
          display: flex; flex-direction: column;
          animation: modalIn 0.35s ease-out both;
          box-shadow: 0 32px 80px rgba(0,0,0,0.3);
        }
        .modal-header {
          background: var(--forest); padding: 22px 28px;
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }
        .modal-header-left { display: flex; align-items: center; gap: 12px; }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #fff;
        }
        .modal-close {
          background: rgba(255,255,255,0.1); border: none;
          width: 32px; height: 32px; border-radius: 8px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.6); transition: all 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.18); color: #fff; }
        .modal-body {
          overflow-y: auto; padding: 28px 28px 20px; flex: 1;
        }
        .modal-body p { font-size: 13px; line-height: 1.8; color: #4a5568; margin-bottom: 16px; }
        .modal-body h3 {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 700; color: var(--forest);
          margin: 20px 0 8px;
        }
        .modal-body ul { padding-left: 16px; }
        .modal-body ul li { font-size: 13px; line-height: 1.8; color: #4a5568; margin-bottom: 4px; }
        .modal-notice {
          background: #fffbeb; border-left: 3px solid var(--amber);
          border-radius: 0 8px 8px 0; padding: 12px 16px; margin-top: 16px;
          font-size: 12px; color: #92400e; line-height: 1.6;
        }
        .modal-footer {
          padding: 16px 28px; border-top: 1px solid rgba(0,0,0,0.06);
          display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;
          background: #fafaf9;
        }
        .btn-modal-decline {
          padding: 10px 22px; border-radius: 8px;
          border: 1.5px solid rgba(0,0,0,0.12);
          background: #fff; color: #4a5568;
          font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .btn-modal-decline:hover { background: #f3f4f6; }
        .btn-modal-accept {
          padding: 10px 22px; border-radius: 8px;
          background: var(--forest); border: none;
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-modal-accept:hover { background: var(--moss); }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { padding: 36px 24px; }
          .auth-brand-mobile { display: flex; }
          .auth-fields { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left-orb" />
        <div className="auth-left-orb2" />
        <div className="auth-left-content">
          <Link to="/"><img src={Logo} alt="SIBOL" className="auth-logo" /></Link>
          <div className="auth-left-pill">
            <span className="auth-left-dot" />
            Join SIBOL
          </div>
          <h2 className="auth-left-h">
            Grow smarter,<br />farm <em>better.</em>
          </h2>
          <p className="auth-left-sub">
            Create your account and connect your first field in minutes.
          </p>

          {/* Steps */}
          <div className="auth-steps">
            {[
              "Create your account",
              "Add your farm location",
              "Connect IoT sensors",
              "Monitor in real time",
            ].map((step, i) => (
              <div className="auth-step" key={i}>
                <div className={`auth-step-circle${i === 0 ? ' done' : ''}`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <span className={`auth-step-text${i === 0 ? ' done' : ''}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          <div className="auth-brand-mobile">
            <div className="auth-brand-chip"><img src={Logo} alt="" /></div>
            <span className="auth-brand-name">SIBOL</span>
          </div>

          <div className="auth-eyebrow">Get started</div>
          <h1 className="auth-title">Create <em>account</em></h1>
          <p className="auth-subtitle">Fill in the details below to join the SIBOL platform.</p>

          {error && (
            <div className="auth-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="auth-error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="auth-fields">
              {/* Full name */}
              <div className="auth-field-group full">
                <label className="auth-field-label">Full Name</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1" />
                  </svg>
                  <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Juan dela Cruz" />
                </div>
              </div>

              {/* Email */}
              <div className="auth-field-group full">
                <label className="auth-field-label">Email Address</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z" />
                  </svg>
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="juan@example.com" />
                </div>
              </div>

              {/* Contact */}
              <div className="auth-field-group">
                <label className="auth-field-label">Contact No.</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z" />
                  </svg>
                  <input name="cp_number" value={form.cp_number} onChange={handleChange} type="text" placeholder="09XX XXX XXXX" />
                </div>
              </div>

              {/* Location */}
              <div className="auth-field-group">
                <label className="auth-field-label">Location</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5" />
                  </svg>
                  <input name="location" value={form.location} onChange={handleChange} type="text" placeholder="Barangay / City" />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group full">
                <label className="auth-field-label">Password</label>
                <div className="auth-field">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
                  </svg>
                  <input name="password" value={form.password} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="auth-terms">
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={handleCheckboxChange} />
              <label htmlFor="terms">
                I have read and agree to the{' '}
                <button type="button" className="auth-terms-btn" onClick={() => setShowTermsModal(true)}>
                  Terms & Agreement
                </button>
              </label>
            </div>

            <button type="submit" disabled={loading || !agreedToTerms} className="auth-submit">
              {loading ? (
                <>
                  <svg className="spin" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity="0.75" />
                  </svg>
                  Creating account…
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="auth-bottom-link">
            Already have an account? <Link to="/guest/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── TERMS MODAL ── */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleDeclineTerms()}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-header-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#d4840a">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z" />
                </svg>
                <span className="modal-title">Terms & Agreement</span>
              </div>
              <button className="modal-close" onClick={handleDeclineTerms}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>By accessing or using the <strong>SIBOL Crop Management Website</strong>, you agree to comply with these Terms and Agreement. If you do not agree, you must discontinue use of the platform immediately.</p>
              <h3>1. Acceptance of Terms</h3>
              <p>By creating an account and using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p>
              <h3>2. User Responsibilities</h3>
              <ul>
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform for lawful purposes only</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <h3>3. Privacy and Data Protection</h3>
              <p>We collect and process your personal data in accordance with our Privacy Policy. Your information will be used to improve our services and provide you with a better experience.</p>
              <h3>4. Intellectual Property</h3>
              <p>All content, features, and functionality on this platform are the exclusive property of SIBOL and are protected by copyright and other intellectual property laws.</p>
              <h3>5. Limitation of Liability</h3>
              <p>SIBOL shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
              <h3>6. Termination</h3>
              <p>We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in activity that may harm the platform or other users.</p>
              <h3>7. Changes to Terms</h3>
              <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the modified terms.</p>
              <div className="modal-notice">
                ⚠️ By clicking "I Agree", you confirm that you have read and accepted all terms and conditions outlined above.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-decline" onClick={handleDeclineTerms}>Decline</button>
              <button className="btn-modal-accept" onClick={handleAcceptTerms}>I Agree</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
