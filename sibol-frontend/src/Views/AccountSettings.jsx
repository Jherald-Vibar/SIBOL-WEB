import React, { useState } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios';

const AccountSettings = () => {
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const passwordsMatch = form.new_password === form.confirm_password || form.confirm_password === "";

  const handleChangePass = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.current_password || !form.new_password || !form.confirm_password) {
      setError("All fields are required!"); return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match!"); return;
    }
    if (form.new_password.length < 8) {
      setError("New password must be at least 8 characters!"); return;
    }

    setIsLoading(true);
    try {
      await axiosClient.put("/changePassword", form);
      setSuccess("Password changed successfully!");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password!");
    } finally {
      setIsLoading(false);
    }
  };

  const EyeIcon = ({ open }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
    </svg>
  );

  const strengthLevel = () => {
    const p = form.new_password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = strengthLevel();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-green-600'][strength];

  /* ── shared input wrapper style ── */
  const inputBox = "flex items-center gap-2 bg-white border border-gray-200 rounded-md px-4 py-2.5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)] focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all";
  const inputText = "flex-1 bg-transparent outline-none font-semibold text-sm text-gray-800 placeholder:text-[#0B3D1E]/60";

  return (
    <div className="bg-[#f7f4ee] min-h-screen flex">

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 fixed top-0 left-0 h-screen shadow-md z-40">
        <UserSidebar />
      </div>

      <div className="flex-1 flex flex-col md:ml-60">
        {/* Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-8 lg:px-16 py-10 pb-24 md:pb-12 flex flex-col items-center">

          {/* Page header */}
          <div className="mb-6 w-full max-w-2xl">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-950">
              Account <span className="italic text-amber-500">Settings</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage your account information and security.</p>
            <div className="mt-4 border-b border-gray-200" />
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm w-full max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" className="flex-shrink-0 mt-0.5">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span><strong>Error: </strong>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm w-full max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#16a34a" className="flex-shrink-0 mt-0.5">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
              </svg>
              <span><strong>Success! </strong>{success}</span>
            </div>
          )}

          <div className="w-full max-w-2xl space-y-5">

            {/* ── Main card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 ">

              {/* Full Name */}
              <div>
                <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Full Name</p>
                <div className={inputBox}>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className={inputText}
                    readOnly
                  />
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <input type="email" placeholder="you@gmail.com" className={inputText} readOnly />
                    </div>
                  </div>
                  {/* Phone */}
                  <div>
                    <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Phone</p>
                    <div className={inputBox}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <input type="tel" placeholder="09xxxxxxxxx" className={inputText} readOnly />
                      <button type="button" className="text-xs text-green-600 font-semibold hover:text-green-700 flex-shrink-0">Change</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Password</p>
                <form onSubmit={handleChangePass}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Current Password */}
                    <div>
                      <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Current Password</p>
                      <div className={inputBox}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af" className="flex-shrink-0">
                          <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                        </svg>
                        <input
                          type={showCurrent ? "text" : "password"}
                          name="current_password"
                          value={form.current_password}
                          onChange={handleChange}
                          placeholder="••••••••••••••"
                          className={inputText}
                        />
                        <button type="button" onClick={() => setShowCurrent(v => !v)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <EyeIcon open={showCurrent} />
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">New Password</p>
                      <div className={`${inputBox} ${!passwordsMatch && form.confirm_password ? '!border-red-300 !ring-2 !ring-red-100' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af" className="flex-shrink-0">
                          <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                        </svg>
                        <input
                          type={showNew ? "text" : "password"}
                          name="new_password"
                          value={form.new_password}
                          onChange={handleChange}
                          placeholder="••••••••••••••"
                          className={inputText}
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
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
                          <p className={`text-xs font-medium ${['','text-red-500','text-amber-500','text-green-500','text-green-700'][strength]}`}>
                            {strengthLabel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password + actions row */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <p className="text-[13px] text-[#0B3D1E] font-semibold mb-1.5">Confirm New Password</p>
                      <div className={`${inputBox} ${!passwordsMatch && form.confirm_password ? '!border-red-300 !ring-2 !ring-red-100' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#9ca3af" className="flex-shrink-0">
                          <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                        </svg>
                        <input
                          type={showConfirm ? "text" : "password"}
                          name="confirm_password"
                          value={form.confirm_password}
                          onChange={handleChange}
                          placeholder="••••••••••••••"
                          className={inputText}
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
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

                    {/* Set Password / Change buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <button
                        type="button"
                        className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
                      >
                        Set Password
                      </button>
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
                        ) : 'Change'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Connected Account */}
              <div>
                <p className="text-[20px] font-semibold text-[#0B3D1E] mb-2">Connected Account</p>
                <div className="flex items-center gap-3 bg-[#D9D9D9]/32 border border-gray-200 rounded-lg px-4 py-3 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)]">
                  {/* Google logo */}
                  <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22l.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm text-gray-700 flex-1">Google</span>
                  <span className="text-xs border border-gray-300 text-gray-500 rounded px-2.5 py-1 font-medium">Connected</span>
                </div>
              </div>

            </div>

            {/* ── Delete Account card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-[20px] font-semibold text-black mb-1">Delete Account</p>
              <p className="text-[14px] text-[#000000]/68 mb-4">If you no longer want to use SIBOL, you can permanently delete your account.</p>
              <button
                type="button"
                className="flex items-center gap-2 bg-[#FF0206]/70 hover:bg-[#FF0206] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                </svg>
                Delete my account
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <UserSidebar />
      </div>
    </div>
  );
};

export default AccountSettings;
