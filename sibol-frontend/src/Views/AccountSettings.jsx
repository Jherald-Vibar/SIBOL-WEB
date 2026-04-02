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
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
    </svg>
  );

  const fields = [
    { name: 'current_password', label: 'Current Password',    placeholder: 'Enter current password',    show: showCurrent, toggle: () => setShowCurrent(v => !v) },
    { name: 'new_password',     label: 'New Password',        placeholder: 'Min. 8 characters',          show: showNew,     toggle: () => setShowNew(v => !v),
      hint: 'Must be at least 8 characters' },
    { name: 'confirm_password', label: 'Confirm New Password', placeholder: 'Re-enter new password',    show: showConfirm, toggle: () => setShowConfirm(v => !v) },
  ];

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
        <div className="flex-1 px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-10">

          {/* Page header */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-[2.5px] uppercase text-green-600 mb-1">Settings</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-950">
              Account <span className="italic text-green-700">Settings</span>
            </h1>
          </div>

          <div className="max-w-lg">

            {/* Card */}
            <div className="bg-white rounded-2xl border border-green-900/10 shadow-md overflow-hidden">

              {/* Card dark header */}
              <div className="bg-green-950 px-6 py-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="#a8c5a0">
                    <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] tracking-[1.5px] uppercase text-white/35 font-medium">Security</p>
                  <h2 className="font-serif font-bold text-white text-base">Change Password</h2>
                </div>
              </div>

              <div className="px-6 pt-5">
                {/* Error alert */}
                {error && (
                  <div className="flex items-start gap-3 p-3.5 mb-2 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" className="flex-shrink-0 mt-0.5">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                    <span><strong>Error: </strong>{error}</span>
                  </div>
                )}

                {/* Success alert */}
                {success && (
                  <div className="flex items-start gap-3 p-3.5 mb-2 rounded-xl bg-green-50 border border-green-100 text-green-800 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="#16a34a" className="flex-shrink-0 mt-0.5">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    <span><strong>Success! </strong>{success}</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleChangePass} className="px-6 py-5 space-y-4">
                {fields.map(({ name, label, placeholder, show, toggle, hint }) => (
                  <div key={name}>
                    <label className="block text-[10px] font-semibold tracking-[1.5px] uppercase text-green-950/50 mb-1.5">
                      {label}
                    </label>
                    <div className={`flex items-center gap-2 bg-[#f7f4ee] border rounded-xl px-4 py-3 transition-all
                      ${name === 'confirm_password' && !passwordsMatch && form.confirm_password
                        ? 'border-red-300 ring-2 ring-red-100'
                        : 'border-green-900/15 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-600/10'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#2e8b57" className="flex-shrink-0 opacity-50">
                        <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                      </svg>
                      <input
                        type={show ? "text" : "password"}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-sm text-green-950 placeholder:text-green-900/25 font-medium"
                      />
                      <button type="button" onClick={toggle} className="text-green-700/50 hover:text-green-800 transition-colors flex-shrink-0">
                        <EyeIcon open={show} />
                      </button>
                    </div>

                    {/* Hint */}
                    {hint && form.new_password === '' && (
                      <p className="mt-1 text-xs text-slate-400">{hint}</p>
                    )}

                    {/* Password strength bar */}
                    {name === 'new_password' && form.new_password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-100'}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${['','text-red-500','text-amber-500','text-green-500','text-green-700'][strength]}`}>
                          {strengthLabel}
                        </p>
                      </div>
                    )}

                    {/* Mismatch */}
                    {name === 'confirm_password' && !passwordsMatch && form.confirm_password && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="pt-4 border-t border-green-900/8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    className="text-green-700 hover:text-amber-600 text-sm font-semibold transition-colors text-center sm:text-left"
                  >
                    Forgot your password?
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !passwordsMatch}
                    className="flex items-center justify-center gap-2 bg-green-950 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-7 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/25"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity="0.75"/>
                        </svg>
                        Saving…
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
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
