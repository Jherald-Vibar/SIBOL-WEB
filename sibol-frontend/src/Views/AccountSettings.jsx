import React, { useState } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios';

const AccountSettings = () => {
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
        <div className='bg-[#F4F0E5] min-h-screen flex flex-col'>
            {/* Desktop Sidebar */}
            <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
                <UserSidebar/>
            </div>

            {/* Main Content */}
            <div className='flex-1 flex flex-col md:ml-64 pb-20 md:pb-0'>
                {/* Navbar */}
                <div className="shadow-md bg-white sticky top-0 z-30">
                    <UserNavbar/>
                </div>

                {/* Content Area */}
                <div className='flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6'>
                    {/* Page Header */}
                    <div className='mb-6'>
                        <h1 className='font-bold text-2xl sm:text-3xl md:text-4xl font-sans text-gray-800'>
                            Account Settings
                        </h1>
                    </div>

                    {/* Settings Card */}
                    <div className='flex justify-center'>
                        <div className='w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden'>
                            {/* Card Header */}
                            <div className='px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50'>
                                <h2 className='text-base sm:text-lg font-sans font-semibold text-gray-800'>
                                    Change Password
                                </h2>
                            </div>

                            {/* Alerts */}
                            <div className='px-4 sm:px-6'>
                                {error && (
                                    <div className="mt-4">
                                        <div className="flex items-start p-3 sm:p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
                                            <svg className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                            </svg>
                                            <div>
                                                <span className="font-semibold">Error!</span> {error}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="mt-4">
                                        <div className="flex items-start p-3 sm:p-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200" role="alert">
                                            <svg className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                            </svg>
                                            <div>
                                                <span className="font-semibold">Success!</span> {success}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleChangePass} className='px-4 sm:px-6 py-6'>
                                <div className='space-y-4'>
                                    {/* Current Password */}
                                    <div>
                                        <label htmlFor="current_password" className='block text-sm font-medium text-gray-700 mb-2'>
                                            Current Password
                                        </label>
                                        <input
                                            id="current_password"
                                            type="password"
                                            value={form.current_password}
                                            onChange={handleChange}
                                            name="current_password"
                                            placeholder='Enter current password'
                                            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="new_password" className='block text-sm font-medium text-gray-700 mb-2'>
                                            New Password
                                        </label>
                                        <input
                                            id="new_password"
                                            type="password"
                                            value={form.new_password}
                                            onChange={handleChange}
                                            name="new_password"
                                            placeholder='Enter new password'
                                            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                                        />
                                        <p className='mt-1 text-xs text-gray-500'>
                                            Must be at least 8 characters
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirm_password" className='block text-sm font-medium text-gray-700 mb-2'>
                                            Confirm New Password
                                        </label>
                                        <input
                                            id="confirm_password"
                                            type="password"
                                            value={form.confirm_password}
                                            onChange={handleChange}
                                            name="confirm_password"
                                            placeholder='Re-enter new password'
                                            className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                !passwordsMatch
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 focus:ring-green-500 focus:border-transparent'
                                            }`}
                                        />
                                        {!passwordsMatch && form.confirm_password && (
                                            <p className='mt-1 text-xs text-red-600 flex items-center gap-1'>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                                </svg>
                                                Passwords do not match
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className='mt-6 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4'>
                                    <button
                                        type='button'
                                        className='text-green-700 hover:text-green-800 font-semibold text-sm transition-colors text-center sm:text-left'
                                    >
                                        Forgot your password?
                                    </button>

                                    <button
                                        type='submit'
                                        disabled={loading || !passwordsMatch}
                                        className='w-full sm:w-auto bg-green-900 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg px-6 py-3 text-white font-semibold text-sm transition-colors shadow-sm hover:shadow-md'
                                    >
                                        {loading ? (
                                            <span className='flex items-center justify-center gap-2'>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Footer Navigation */}
            <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40'>
                <UserSidebar/>
            </div>
        </div>
    )
}

export default AccountSettings
