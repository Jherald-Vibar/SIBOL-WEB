import React, { useState } from 'react'
import axiosClient from './axios';
import AdminSidebar from './parts/AdminSidebar';
import AdminNavbar from './parts/AdminNavbar';

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
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        setError("");
        setSuccess("");
    }

    const passwordsMatch = form.new_password === form.confirm_password || form.confirm_password === "";

    const handleChangePass = async(e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if(!form.current_password || !form.new_password || !form.confirm_password) {
            setError("All fields are required!");
            return;
        }

        if(form.new_password !== form.confirm_password) {
            setError("New passwords do not match!");
            return;
        }

        if(form.new_password.length < 8) {
            setError("New password must be at least 8 characters!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosClient.put("/changePassword", form);
            setSuccess("Password changed successfully!");
            setForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (error) {
            setError(error.response?.data?.message || "Failed to change password!");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='bg-[#F4F0E5] min-h-screen'>
            {/* Desktop Sidebar */}
            <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
                <AdminSidebar/>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
                <AdminSidebar />
            </div>

            <div className='flex flex-col md:ml-64'>
                {/* Navbar */}
                <div className="shadow-md bg-white sticky top-0 z-30">
                    <AdminNavbar/>
                </div>

                {/* Main Content - Added bottom padding for mobile */}
                <div className='flex-1 px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-20 md:pb-6'> {/* Added pb-20 for mobile */}
                    {/* Header */}
                    <div className='mb-6'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Account Settings</h1>
                    </div>

                    {/* Change Password Card */}
                    <div className='flex justify-center'>
                        <div className='w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden'>
                            {/* Card Header */}
                            <div className='px-4 sm:px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-lg font-semibold text-gray-800'>Change Password</h2>
                            </div>

                            {/* Alerts */}
                            <div className='px-4 sm:px-6'>
                                {error && (
                                    <div className="mt-4 flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                                        <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                        </svg>
                                        <span className="sr-only">Error</span>
                                        <div>
                                            <span className="font-medium">Error!</span> {error}
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="mt-4 flex items-center p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                                        <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                        </svg>
                                        <span className="sr-only">Success</span>
                                        <div>
                                            <span className="font-medium">Success!</span> {success}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleChangePass} className='p-4 sm:p-6 space-y-4'>
                                {/* Current Password */}
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Current Password</label>
                                    <div className='bg-gray-50 rounded-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors'>
                                        <input
                                            type="password"
                                            value={form.current_password}
                                            onChange={handleChange}
                                            name="current_password"
                                            placeholder='Enter current password'
                                            className='w-full px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-500'
                                            required
                                        />
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>New Password</label>
                                    <div className='bg-gray-50 rounded-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors'>
                                        <input
                                            type="password"
                                            value={form.new_password}
                                            onChange={handleChange}
                                            name="new_password"
                                            placeholder='Enter new password'
                                            className='w-full px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-500'
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Confirm New Password</label>
                                    <div className={`bg-gray-50 rounded-lg border transition-colors ${
                                        !passwordsMatch && form.confirm_password
                                            ? 'border-red-500 ring-1 ring-red-500'
                                            : 'border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'
                                    }`}>
                                        <input
                                            type="password"
                                            value={form.confirm_password}
                                            onChange={handleChange}
                                            name="confirm_password"
                                            placeholder='Re-enter new password'
                                            className='w-full px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-500'
                                            required
                                        />
                                    </div>
                                    {!passwordsMatch && form.confirm_password && (
                                        <p className='text-red-500 text-xs'>Passwords do not match</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-4'>
                                    <button
                                        type="button"
                                        className='text-green-700 hover:text-green-800 hover:underline text-sm font-medium transition-colors w-full sm:w-auto text-center py-2'
                                    >
                                        Forgot your password?
                                    </button>

                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='bg-green-900 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg px-8 py-3 text-white font-semibold transition-colors w-full sm:w-auto text-center'
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminAccountSettings
