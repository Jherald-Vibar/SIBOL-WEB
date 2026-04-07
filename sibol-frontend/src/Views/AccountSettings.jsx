import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axios';

const AccountSettings = () => {
  const navigate = useNavigate();

  // ── Read user from localStorage ──
  const storedName     = localStorage.getItem('username') || '';
  const storedEmail    = localStorage.getItem('email')    || '';
  const storedPhone    = localStorage.getItem('location') || '';
  const storedImage    = localStorage.getItem('image')    || '';
  const storedGoogleId = localStorage.getItem('google_id') || '';
  const isGoogleUser   = !!storedGoogleId;

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const passwordsMatch =
    form.new_password === form.confirm_password || form.confirm_password === '';

  // ── Change password ──
  const handleChangePass = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.current_password || !form.new_password || !form.confirm_password) {
      setError('All fields are required!'); return;
    }
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match!'); return;
    }
    if (form.new_password.length < 8) {
      setError('New password must be at least 8 characters!'); return;
    }
    setLoading(true);
    try {
      await axiosClient.put('/changePassword', form);
      setSuccess('Password changed successfully!');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password!');
    } finally { setLoading(false); }
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axiosClient.delete('/deleteAccount');
      localStorage.clear();
      navigate('/guest/login');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setShowDeleteModal(false);
    } finally { setDeleteLoading(false); }
  };

  // ── Password strength ──
  const strengthLevel = () => {
    const p = form.new_password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength      = strengthLevel();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-green-600'][strength];
  const strengthText  = ['', 'text-red-500', 'text-amber-500', 'text-green-500', 'text-green-700'][strength];

  // ── Shared styles ──
  const inputBox  = 'flex items-center gap-2 bg-white border border-gray-200 rounded-md px-4 py-2.5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)] focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all';
  const inputText = 'flex-1 bg-transparent outline-none font-semibold text-sm text-gray-800 placeholder:text-[#0B3D1E]/60';
  const readOnlyInput = 'flex-1 bg-transparent outline-none font-semibold text-sm text-gray-500 select-none cursor-default';

  const lockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af" className="shrink-0">
      <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
    </svg>
  );

  const EyeIcon = ({ open }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
    </svg>
  );

  return (
    <div className="bg-[#f7f4ee] min-h-screen font-['DM_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      <div className="px-4 sm:px-8 lg:px-16 py-10 pb-24 md:pb-12 flex flex-col items-center">

        {/* Page header */}
        <div className="mb-6 w-full">
          <h1 className="font-['Playfair_Display',serif] text-3xl md:text-4xl font-bold text-green-950">
            Account <em className="italic text-amber-500">Settings</em>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account information and security.</p>
          <div className="mt-4 border-b border-gray-200" />
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm w-full max-w-4xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" className="shrink-0 mt-0.5">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span><strong>Error: </strong>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm w-full max-w-4xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#16a34a" className="shrink-0 mt-0.5">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
            </svg>
            <span><strong>Success! </strong>{success}</span>
          </div>
        )}

        <div className="w-full max-w-4xl space-y-5">

          {/* ── Main card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

            {/* Avatar + Name row */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              {storedImage ? (
                <img
                  src={storedImage}
                  alt={storedName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-green-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#0b3d1e] flex items-center justify-center text-white text-xl font-bold font-['Playfair_Display',serif]">
                  {storedName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#0b3d1e] text-base">{storedName || '—'}</p>
                <p className="text-xs text-gray-400">{storedEmail || '—'}</p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Full Name</p>
              <div className={inputBox}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af" className="shrink-0">
                  <path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"/>
                </svg>
                <input type="text" value={storedName} readOnly className={readOnlyInput} />
              </div>
            </div>

            {/* Contacts */}
            <div>
              <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Contacts</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div>
                  <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Email</p>
                  <div className={inputBox}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <input type="email" value={storedEmail} readOnly className={readOnlyInput} />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Phone</p>
                  <div className={inputBox}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input type="tel" value={storedPhone} readOnly className={readOnlyInput} placeholder="—" />
                  </div>
                </div>
              </div>
            </div>

            {/* Password — hidden for Google users */}
            {!isGoogleUser && (
              <div>
                <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Password</p>
                <form onSubmit={handleChangePass}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Current Password */}
                    <div>
                      <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Current Password</p>
                      <div className={inputBox}>
                        {lockIcon}
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          name="current_password"
                          value={form.current_password}
                          onChange={handleChange}
                          placeholder="••••••••••••••"
                          className={inputText}
                        />
                        <button type="button" onClick={() => setShowCurrent(v => !v)} className="text-gray-400 hover:text-gray-600 shrink-0">
                          <EyeIcon open={showCurrent} />
                        </button>
                      </div>
                    </div>
                    {/* New Password */}
                    <div>
                      <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">New Password</p>
                      <div className={`${inputBox} ${!passwordsMatch && form.confirm_password ? '!border-red-300 !ring-2 !ring-red-100' : ''}`}>
                        {lockIcon}
                        <input
                          type={showNew ? 'text' : 'password'}
                          name="new_password"
                          value={form.new_password}
                          onChange={handleChange}
                          placeholder="••••••••••••••"
                          className={inputText}
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="text-gray-400 hover:text-gray-600 shrink-0">
                          <EyeIcon open={showNew} />
                        </button>
                      </div>
                      {/* Strength bar */}
                      {form.new_password && (
                        <div className="mt-1.5">
                          <div className="flex gap-1 mb-0.5">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-100'}`} />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${strengthText}`}>{strengthLabel}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirm + actions */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Confirm New Password</p>
                      <div className={`${inputBox} ${!passwordsMatch && form.confirm_password ? '!border-red-300 !ring-2 !ring-red-100' : ''}`}>
                        {lockIcon}
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          name="confirm_password"
                          value={form.confirm_password}
                          onChange={handleChange}
                          placeholder="••••••••••••••"
                          className={inputText}
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-gray-600 shrink-0">
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                      {!passwordsMatch && form.confirm_password && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={loading || !passwordsMatch}
                        className="flex items-center gap-1.5 bg-green-950 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity="0.75"/>
                            </svg>
                            Saving…
                          </>
                        ) : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Google user — show note instead of password */}
            {isGoogleUser && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"/>
                </svg>
                You signed in with Google. Password management is handled by your Google account.
              </div>
            )}

            {/* Connected Account */}
            <div>
              <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Connected Account</p>
              <div className="flex items-center gap-3 bg-[#D9D9D9]/30 border border-gray-200 rounded-lg px-4 py-3 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]">
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22l.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm text-gray-700 flex-1">Google</span>
                {isGoogleUser ? (
                  <span className="text-xs border border-green-300 text-green-600 bg-green-50 rounded px-2.5 py-1 font-medium">
                    ✓ Connected
                  </span>
                ) : (
                  <span className="text-xs border border-gray-300 text-gray-400 rounded px-2.5 py-1 font-medium">
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Delete Account card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-[20px] font-semibold text-black mb-1">Delete Account</p>
            <p className="text-[14px] text-black/60 mb-4">
              If you no longer want to use SIBOL, you can permanently delete your account. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 bg-red-500/70 hover:bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm0 5h2v9H9V8zm4 0h2v9h-2V8z"/>
              </svg>
              Delete my account
            </button>
          </div>

        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl"
            style={{ animation: 'modalIn 0.3s ease-out both' }}>
            <style>{`
              @keyframes modalIn {
                from { opacity: 0; transform: scale(0.94) translateY(12px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Delete Account</p>
                <p className="text-xs text-gray-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete your account? All your data including crop profiles, reports, and settings will be permanently removed.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity="0.75"/>
                    </svg>
                    Deleting…
                  </>
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
