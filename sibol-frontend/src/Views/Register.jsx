import React, { useState } from 'react'
import Logo from '../assets/logo-left.png'
import { useNavigate, Link } from 'react-router-dom'
import axiosClient , { API_BASE_URL } from './axios';


const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", name: "", cp_number: "", password: "", confirmPassword: "", location: "" });
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleContinue = e => {
    e.preventDefault();
    setError("");
    if (!form.email) { setError("Please enter your email address."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setError("Please enter a valid email address."); return; }
    setStep(2);
  };

  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (!form.email || !form.name || !form.cp_number || !form.password) {
      setIsLoading(false); setError("All fields are required!"); return;
    }
    if (form.password !== form.confirmPassword) {
      setIsLoading(false); setError("Passwords do not match!"); return;
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
  };

  return (
    <div
      className="font-sans min-h-screen flex overflow-hidden"
      style={{ background: '#f7f4ee', fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
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
        .anim-fade-up { animation: fadeUp 0.9s 0.1s ease-out both; }
        .anim-fade-up-delay { animation: fadeUp 0.9s 0.3s ease-out both; }
        .anim-slide-right { animation: slideInRight 0.35s ease-out both; }
        .anim-float { animation: floatY 3s ease-in-out infinite; }
        .anim-pulse-dot { animation: livePulse 1.8s ease-in-out infinite; }
        .anim-shake { animation: shake 0.45s ease; }
        .anim-modal { animation: modalIn 0.35s ease-out both; }
        .anim-spin { animation: spin 0.7s linear infinite; }
        .left-panel-clip::after {
          content: '';
          position: absolute;
          right: -60px; top: 0;
          width: 120px; height: 100%;
          background: #f7f4ee;
          clip-path: polygon(60px 0, 100% 0, 100% 100%, 0 100%);
          z-index: 10;
        }
        .field-focus:focus-within {
          border-color: #2e8b57 !important;
          box-shadow: 0 0 0 3px rgba(46,139,87,0.1) !important;
          transform: translateY(-1px) !important;
        }
        .btn-submit:hover:not(:disabled) {
          background: #1a6636 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(11,61,30,0.3) !important;
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden md:flex w-[38%] min-h-screen flex-col justify-center items-center relative overflow-hidden flex-shrink-0 left-panel-clip"
        style={{ background: '#0b3d1e' }}
      >
        {/* Orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -top-24 -left-24"
          style={{ background: 'radial-gradient(circle, rgba(46,139,87,0.2) 0%, transparent 70%)' }} />
        <div className="absolute w-[280px] h-[280px] rounded-full pointer-events-none bottom-16 right-16"
          style={{ background: 'radial-gradient(circle, rgba(212,132,10,0.1) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-[5] flex flex-col items-center text-center px-12 py-12 pr-14 anim-fade-up">
          <Link to="/">
            <img
              src={Logo}
              alt="SIBOL"
              className="w-[90px] mb-6 anim-float cursor-pointer transition-transform duration-300 hover:scale-110 hover:rotate-2"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
            />
          </Link>

          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 border rounded-full mb-4"
            style={{ borderColor: 'rgba(212,132,10,0.4)', color: '#f0a830', fontSize: 10, letterSpacing: '1.8px' }}
          >
            <span className="w-1.5 h-1.5 rounded-full anim-pulse-dot" style={{ background: '#d4840a' }} />
            <span className="uppercase">IOT Crop Monitoring</span>
          </div>

          <h2 className="font-playfair font-bold leading-tight text-white mb-3" style={{ fontSize: 'clamp(24px,2.5vw,34px)' }}>
            Smart farming<br />starts with<br />
            <em className="not-italic" style={{ color: '#f0a830' }}>real data.</em>
          </h2>
          <p className="text-xs leading-7 max-w-[230px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Connect your fields. Monitor in real time. Make better decisions.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center py-10 px-6 md:pl-20 md:pr-12 overflow-y-auto anim-fade-up-delay">
        <div className="w-full max-w-[420px]">

          {/* Mobile brand */}
          <div className="flex md:hidden items-center gap-2.5 mb-7">
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: '#d4840a' }}>
              <img src={Logo} alt="" className="w-[22px] object-contain" />
            </button>
            <span className="font-playfair font-bold text-xl tracking-widest" style={{ color: '#0b3d1e' }}>SIBOL</span>
          </div>

          <div className="text-[10px] font-medium tracking-[2.5px] uppercase mb-1.5" style={{ color: '#2e8b57' }}>Get started</div>
          <h1 className="font-playfair font-bold leading-tight mb-1.5" style={{ color: '#0b3d1e', fontSize: 'clamp(28px,3.5vw,40px)' }}>
            Create <em className="not-italic" style={{ color: '#2e8b57' }}>an account</em>
          </h1>
          <p className="text-[13px] mb-7" style={{ color: '#7a8a80' }}>Fill in the details below to join the SIBOL platform.</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 px-4 rounded-[10px] mb-4 anim-shake"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '3px solid #ef4444' }}>
              <svg className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="text-[13px] leading-relaxed" style={{ color: '#991b1b' }}>{error}</span>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="anim-slide-right">
              <button onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[10px] text-[14px] font-medium transition-all duration-200 hover:-translate-y-px font-dm"
                style={{ border: '1.5px solid rgba(11,61,30,0.15)', background: '#fff', color: '#0b3d1e' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = 'rgba(11,61,30,0.3)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(11,61,30,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign up with Google
              </button>

              <div className="flex items-center gap-3 my-4 text-[12px]" style={{ color: '#b0bdb7' }}>
                <span className="flex-1 h-px" style={{ background: 'rgba(11,61,30,0.1)' }} />
                or
                <span className="flex-1 h-px" style={{ background: 'rgba(11,61,30,0.1)' }} />
              </div>

              <form onSubmit={handleContinue}>
                <div className="flex flex-col gap-3.5 mb-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium tracking-[0.5px] uppercase pl-1" style={{ color: '#0b3d1e' }}>Email address</label>
                    <div className="flex items-center gap-2.5 bg-white rounded-[10px] px-3 py-3 transition-all duration-200 field-focus" style={{ border: '1.5px solid rgba(11,61,30,0.15)' }}>
                      <svg style={{ color: '#2e8b57' }} className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z" />
                      </svg>
                      <input
                        name="email" value={form.email} onChange={handleChange}
                        type="email" placeholder="you@example.com" autoFocus
                        className="flex-1 border-none outline-none bg-transparent text-[13px] font-dm placeholder-[#b0bdb7]"
                        style={{ color: '#0b3d1e' }}
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 rounded-[10px] text-white font-playfair font-bold text-[15px] tracking-wide transition-all duration-200 btn-submit" style={{ background: '#0b3d1e', border: 'none' }}>
                  Continue
                </button>
              </form>

              <p className="text-center mt-4 text-[13px]" style={{ color: '#7a8a80' }}>
                Already have an account?{' '}
                <Link to="/guest/login" className="font-semibold no-underline pb-px transition-colors duration-200 hover:text-amber-500" style={{ color: '#0b3d1e', borderBottom: '1.5px solid #d4840a' }}>Sign in.</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="anim-slide-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-medium" style={{ color: '#7a8a80' }}>Sign up with Email</span>
              </div>
              <div className="h-px mb-4" style={{ background: 'rgba(11,61,30,0.1)' }} />

              {/* Email badge */}
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-5" style={{ background: 'rgba(46,139,87,0.07)', border: '1px solid rgba(46,139,87,0.2)' }}>
                <svg style={{ color: '#2e8b57', flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z" />
                </svg>
                <span className="text-[13px] flex-1" style={{ color: '#1a6636' }}>{form.email}</span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); }}
                  className="text-[11px] font-semibold font-dm bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-[#0b3d1e]"
                  style={{ color: '#2e8b57' }}
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-3.5 mb-5">
                  {/* Full Name */}
                  <FieldGroup label="Full Name">
                    <FieldWrap>
                      <svg style={{ color: '#2e8b57' }} className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1" />
                      </svg>
                      <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="John Doe" autoFocus className="flex-1 border-none outline-none bg-transparent text-[13px] font-dm placeholder-[#b0bdb7]" style={{ color: '#0b3d1e' }} />
                    </FieldWrap>
                  </FieldGroup>

                  {/* Phone */}
                  <FieldGroup label="Phone Number">
                    <FieldWrap>
                      <svg style={{ color: '#2e8b57' }} className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z" />
                      </svg>
                      <input name="cp_number" value={form.cp_number} onChange={handleChange} type="text" placeholder="09xxxxxxxxx" className="flex-1 border-none outline-none bg-transparent text-[13px] font-dm placeholder-[#b0bdb7]" style={{ color: '#0b3d1e' }} />
                    </FieldWrap>
                  </FieldGroup>

                  {/* Password */}
                  <FieldGroup label="Create Password">
                    <FieldWrap>
                      <LockIcon />
                      <input name="password" value={form.password} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="••••••••••••••" className="flex-1 border-none outline-none bg-transparent text-[13px] font-dm placeholder-[#b0bdb7]" style={{ color: '#0b3d1e' }} />
                      <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                    </FieldWrap>
                  </FieldGroup>

                  {/* Confirm Password */}
                  <FieldGroup label="Confirm Password">
                    <FieldWrap>
                      <LockIcon />
                      <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••••••••" className="flex-1 border-none outline-none bg-transparent text-[13px] font-dm placeholder-[#b0bdb7]" style={{ color: '#0b3d1e' }} />
                      <EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </FieldWrap>
                  </FieldGroup>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2.5 mb-5">
                  <input
                    type="checkbox" id="terms" checked={agreedToTerms} onChange={handleCheckboxChange}
                    className="mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded-[5px] cursor-pointer accent-[#0b3d1e]"
                    style={{ appearance: 'none', border: '1.5px solid rgba(11,61,30,0.3)', borderRadius: 5, background: agreedToTerms ? '#0b3d1e' : '#fff', cursor: 'pointer', flexShrink: 0, width: 18, height: 18, position: 'relative' }}
                  />
                  <label htmlFor="terms" className="text-[12px] leading-relaxed cursor-pointer" style={{ color: '#5a6472' }}>
                    I have read and agreed to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="font-semibold underline bg-transparent border-none cursor-pointer text-[12px] p-0 transition-colors duration-200 hover:text-amber-600"
                      style={{ color: '#0b3d1e' }}
                    >
                      Terms and Agreement
                    </button>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="w-full py-3.5 rounded-[10px] text-white font-playfair font-bold text-[15px] tracking-wide flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-200 btn-submit disabled:opacity-55 disabled:cursor-not-allowed"
                  style={{ background: '#0b3d1e', border: 'none' }}
                >
                  {loading ? (
                    <>
                      <svg className="anim-spin" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity="0.75" />
                      </svg>
                      Creating account…
                    </>
                  ) : "Register"}
                </button>
              </form>

              <p className="text-center mt-4 text-[13px]" style={{ color: '#7a8a80' }}>
                Already have an account?{' '}
                <Link to="/guest/login" className="font-semibold no-underline pb-px transition-colors duration-200" style={{ color: '#0b3d1e', borderBottom: '1.5px solid #d4840a' }}>Sign in.</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── TERMS MODAL ── */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && handleDeclineTerms()}
        >
          <div className="bg-white rounded-[20px] w-full max-w-[580px] max-h-[85vh] overflow-hidden flex flex-col anim-modal" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 flex-shrink-0" style={{ background: '#0b3d1e' }}>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#d4840a">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z" />
                </svg>
                <span className="font-playfair font-bold text-[20px] text-white">Terms & Agreement</span>
              </div>
              <button
                onClick={handleDeclineTerms}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-7 pt-7 pb-5 flex-1 text-[#4a5568]">
              <p className="text-[13px] leading-7 mb-4">By accessing or using the <strong>SIBOL Crop Management Website</strong>, you agree to comply with these Terms and Agreement. If you do not agree, you must discontinue use of the platform immediately.</p>

              {[
                { title: '1. Acceptance of Terms', content: <p className="text-[13px] leading-7 mb-4">By creating an account and using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p> },
                { title: '2. User Responsibilities', content: <ul className="list-disc pl-4 mb-4">{['Provide accurate and complete information during registration','Maintain the confidentiality of your account credentials','Use the platform for lawful purposes only','Comply with all applicable laws and regulations'].map((item, i) => <li key={i} className="text-[13px] leading-7 mb-1">{item}</li>)}</ul> },
                { title: '3. Privacy and Data Protection', content: <p className="text-[13px] leading-7 mb-4">We collect and process your personal data in accordance with our Privacy Policy. Your information will be used to improve our services and provide you with a better experience.</p> },
                { title: '4. Intellectual Property', content: <p className="text-[13px] leading-7 mb-4">All content, features, and functionality on this platform are the exclusive property of SIBOL and are protected by copyright and other intellectual property laws.</p> },
                { title: '5. Limitation of Liability', content: <p className="text-[13px] leading-7 mb-4">SIBOL shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p> },
                { title: '6. Termination', content: <p className="text-[13px] leading-7 mb-4">We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in activity that may harm the platform or other users.</p> },
                { title: '7. Changes to Terms', content: <p className="text-[13px] leading-7 mb-4">We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the modified terms.</p> },
              ].map(({ title, content }) => (
                <div key={title}>
                  <h3 className="font-playfair font-bold text-[15px] mt-5 mb-2" style={{ color: '#0b3d1e' }}>{title}</h3>
                  {content}
                </div>
              ))}

              <div className="rounded-r-lg pl-4 pr-4 py-3 mt-4 text-[12px] leading-relaxed" style={{ background: '#fffbeb', borderLeft: '3px solid #d4840a', color: '#92400e' }}>
                ⚠️ By clicking "I Agree", you confirm that you have read and accepted all terms and conditions outlined above.
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-4 flex justify-end gap-2.5 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafaf9' }}>
              <button
                onClick={handleDeclineTerms}
                className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 hover:bg-gray-100 font-dm"
                style={{ border: '1.5px solid rgba(0,0,0,0.12)', background: '#fff', color: '#4a5568', cursor: 'pointer' }}
              >
                Decline
              </button>
              <button
                onClick={handleAcceptTerms}
                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all duration-200 font-dm"
                style={{ background: '#0b3d1e', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a6636'}
                onMouseLeave={e => e.currentTarget.style.background = '#0b3d1e'}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small helper components ──

const FieldGroup = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-medium tracking-[0.5px] uppercase pl-1" style={{ color: '#0b3d1e' }}>{label}</label>
    {children}
  </div>
);

const FieldWrap = ({ children }) => (
  <div className="flex items-center gap-2.5 bg-white rounded-[10px] px-3 py-3 transition-all duration-200 field-focus" style={{ border: '1.5px solid rgba(11,61,30,0.15)' }}>
    {children}
  </div>
);

const LockIcon = () => (
  <svg style={{ color: '#2e8b57' }} className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
  </svg>
);

const EyeToggle = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} className="bg-transparent border-none cursor-pointer p-0 flex items-center transition-colors duration-200" style={{ color: '#2e8b57' }}
    onMouseEnter={e => e.currentTarget.style.color = '#0b3d1e'}
    onMouseLeave={e => e.currentTarget.style.color = '#2e8b57'}
  >
    {show ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" /></svg>
    )}
  </button>
);

export default Register;
