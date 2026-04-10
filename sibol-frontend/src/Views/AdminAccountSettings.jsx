import React, { useState } from 'react'
import axiosClient from './axios';

const AdminAccountSettings = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(""); setSuccess("");
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

    const SpinIcon = () => (
        <svg style={{ animation: 'spin 0.8s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    );

    const inputStyle = (isError = false) => ({
        width: "100%",
        padding: "10px 14px",
        border: `1.5px solid ${isError ? "#fca5a5" : "rgba(0,0,0,0.1)"}`,
        borderRadius: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: "#0b3d1e",
        background: isError ? "#fff1f2" : "#f7f4ee",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
    });

    return (
        <div style={{ background: "#f0ece0", minHeight: "100%", fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                .pass-input:focus { border-color: #2e8b57 !important; box-shadow: 0 0 0 3px rgba(46,139,87,0.1) !important; background: #fff !important; }
                .save-btn:hover { background: #1a6636 !important; transform: translateY(-1px); }
                .forgot-btn:hover { color: #0b3d1e !important; text-decoration: underline; }
            `}</style>

            {/* Header */}
            <div style={{ background: "#f7f4ee", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#2e8b57", margin: "0 0 6px" }}>Admin Panel</p>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#0b3d1e" }}>
                        Account <em style={{ fontStyle: "italic", color: "#d4840a" }}>Settings</em>
                    </div>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>Manage your account credentials and security.</p>
                </div>
            </div>

            {/* Card */}
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>

                    {/* Card Header */}
                    <div style={{ background: "#0b3d1e", padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Change Password</span>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                    </div>

                    <div style={{ padding: 24 }}>

                        {/* Error */}
                        {error && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, fontSize: 13, color: "#be123c", marginBottom: 20 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, fontSize: 13, color: "#166534", marginBottom: 20 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                                {success}
                            </div>
                        )}

                        {/* Divider label */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#9ca3af", whiteSpace: "nowrap" }}>Credentials</p>
                            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
                        </div>

                        <form onSubmit={handleChangePass}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                                {/* Current Password */}
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6, display: "block" }}>
                                        Current Password
                                    </label>
                                    <input
                                        className="pass-input"
                                        type="password"
                                        name="current_password"
                                        value={form.current_password}
                                        onChange={handleChange}
                                        placeholder="Enter current password"
                                        style={inputStyle()}
                                        required
                                    />
                                </div>

                                {/* New Password */}
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6, display: "block" }}>
                                        New Password
                                    </label>
                                    <input
                                        className="pass-input"
                                        type="password"
                                        name="new_password"
                                        value={form.new_password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        style={inputStyle()}
                                        required
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6, display: "block" }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        className="pass-input"
                                        type="password"
                                        name="confirm_password"
                                        value={form.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Re-enter new password"
                                        style={inputStyle(!passwordsMatch && form.confirm_password)}
                                        required
                                    />
                                    {!passwordsMatch && form.confirm_password && (
                                        <p style={{ fontSize: 12, color: "#be123c", marginTop: 5 }}>Passwords do not match</p>
                                    )}
                                </div>

                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)", flexWrap: "wrap", gap: 12 }}>
                                <button
                                    type="button"
                                    className="forgot-btn"
                                    style={{ background: "none", border: "none", fontSize: 13, color: "#2e8b57", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, padding: 0, transition: "all 0.2s" }}
                                >
                                    Forgot your password?
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="save-btn"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: loading ? "#9ca3af" : "#0b3d1e", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? <><SpinIcon /> Saving…</> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAccountSettings;
