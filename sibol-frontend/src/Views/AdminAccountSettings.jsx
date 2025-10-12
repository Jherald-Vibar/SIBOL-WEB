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
        <div className='bg-[#F4F0E5] flex min-h-screen relative'>
            <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md'>
                <AdminSidebar/>
            </div>

            <div className='flex-1 flex flex-col'>
                <div className="shadow-md bg-white md:ml-64">
                    <AdminNavbar/>
                </div>

                    <div className='flex-1 flex flex-col md:ml-64 px-3 sm:px-6 lg:px-10 py-3 rounded-md'>
                        <div className='flex flex-col items-start justify-center mb-6'>
                            <h1 className='font-bold text-2xl md:text-4xl font-sans text-black'>Account Settings</h1>
                        </div>

                        <div className='flex flex-col items-center justify-center px-3 py-3'>
                            <div className='w-full max-w-[600px] flex flex-col items-center rounded-lg bg-white justify-center shadow-md'>
                                <div className='flex flex-col items-start justify-center px-5 py-5 w-full border-b border-[#0000007a]'>
                                    <h1 className='text-sm md:text-base font-sans font-semibold'>Change Password</h1>
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <div className="w-full px-5 py-3">
                                        <div className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                                            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                            </svg>
                                            <span className="sr-only">Error</span>
                                            <div>
                                                <span className="font-medium">Error!</span> {error}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Success Alert */}
                                {success && (
                                    <div className="w-full px-5 py-3">
                                        <div className="flex items-center p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                                            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                            </svg>
                                            <span className="sr-only">Success</span>
                                            <div>
                                                <span className="font-medium">Success!</span> {success}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleChangePass} className='flex flex-col items-center justify-center bg-white px-3 py-3 gap-2 w-full'>
                                    <div className='flex flex-col w-full max-w-[500px] items-start justify-center bg-[#D9D9D961] px-3 py-3 rounded-md'>
                                        <input
                                            type="password"
                                            value={form.current_password}
                                            onChange={handleChange}
                                            name="current_password"
                                            placeholder='Current Password'
                                            className='px-3 py-3 w-full placeholder:text-start bg-transparent outline-none'
                                        />
                                    </div>
                                    <div className='flex flex-col w-full max-w-[500px] items-start justify-center bg-[#D9D9D961] px-3 py-3 rounded-md'>
                                        <input
                                            type="password"
                                            value={form.new_password}
                                            onChange={handleChange}
                                            name="new_password"
                                            placeholder='New Password'
                                            className='px-3 py-3 w-full placeholder:text-start bg-transparent outline-none'
                                        />
                                    </div>
                                    <div className={`flex flex-col w-full max-w-[500px] items-start justify-center bg-[#D9D9D961] px-3 py-3 rounded-md ${!passwordsMatch ? 'border-2 border-red-500' : ''}`}>
                                        <input
                                            type="password"
                                            value={form.confirm_password}
                                            onChange={handleChange}
                                            name="confirm_password"
                                            placeholder='Re-type new password'
                                            className='px-3 py-3 w-full placeholder:text-start bg-transparent outline-none'
                                        />
                                    </div>
                                    {!passwordsMatch && form.confirm_password && (
                                        <p className='text-red-500 text-xs w-full max-w-[500px] px-1'>Passwords do not match</p>
                                    )}

                                    {/**Button Section*/}
                                    <div className='w-full flex flex-col sm:flex-row items-center justify-between px-3 py-3 gap-3'>
                                        <div className='flex flex-col items-start justify-center'>
                                            <h1 className='font-sans font-semibold text-[#287500] text-xs md:text-sm cursor-pointer hover:underline'>
                                                Forgot your password?
                                            </h1>
                                        </div>

                                        <div className='flex flex-col items-end justify-center'>
                                            <button
                                                type='submit'
                                                disabled={loading}
                                                className='bg-green-900 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md px-6 py-2 text-center text-white font-sans text-sm font-semibold transition-colors'
                                            >
                                                {loading ? "Saving..." : "Save"}
                                            </button>
                                        </div>
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
