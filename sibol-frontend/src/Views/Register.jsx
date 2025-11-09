import React, { useState } from 'react'
import BG from '../assets/auth_image.png'
import '../login.css';
import Logo from '../assets/logo-left.png'
import { useNavigate, Link } from 'react-router-dom'
import axiosClient from './axios';

const Register = () => {
    const [form, setForm] = useState({
        email: "",
        name: "",
        cp_number: "",
        password: "",
        location: "",
    });
    const [error, setError] = useState("");
    const [loading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if(!form.email || !form.name || !form.cp_number || !form.password) {
            setIsLoading(false);
            setError("All fields are required!");
            return;
        }

        try {
            const response = await axiosClient.post("/register", form);
            setIsLoading(false);
            navigate("/guest/login");
        } catch (error) {
            if (error.response?.status === 422) {
                setError(error.response.data.errors.email?.[0] || "Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login min-h-screen w-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 overflow-hidden">
                {/* Left Side - Branding */}
                <div className="relative hidden md:flex flex-row h-full">
                    <div
                        className="absolute top-0 left-6 h-full z-0"
                        style={{
                            width: "100%",
                            backgroundColor: "#0b542d",
                            opacity: 0.6,
                            clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
                        }}
                    />

                    <div
                        className="absolute top-0 left-0 h-full flex flex-col items-center justify-center text-white z-10 p-6"
                        style={{
                            width: "100%",
                            backgroundColor: "#0b542d",
                            clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
                        }}
                    >
                        <div className="flex flex-col items-center justify-start text-center">
                            <Link to="/">
                                <img src={Logo} alt="" className="w-[180px] mb-6" />
                            </Link>
                            <span className="font-serif text-2xl">
                                <span className="text-amber-300 text-5xl">S</span>mart Farming starts
                            </span>
                            <span className="font-serif text-2xl">
                                with the right <span className="text-amber-300 text-5xl">D</span>ata
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex flex-1 items-center justify-center min-h-screen w-full">
                    <div className='w-full max-w-md px-2 py-2 rounded-lg border border-green-800 bg-[#FEFADFAA]'>
                        <form onSubmit={handleRegister} className='w-full px-3 py-3 flex flex-col items-center rounded-lg bg-[#FEFADF1A] border border-green-800'>
                            {/* Logo */}
                            <div className='flex items-center mb-2'>
                                <img src={Logo} alt="logo" className='w-10 md:w-12'/>
                            </div>

                            {/* Title */}
                            <h1 className='text-2xl md:text-3xl font-serif font-semibold text-green-950 mb-4'>Sign up</h1>

                            {/* Error Alert */}
                            {error && (
                                <div className="flex items-center p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50 w-full" role="alert">
                                    <svg className="shrink-0 w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* Input Fields */}
                            <div className='flex flex-col gap-3 w-full'>
                                {/* Email */}
                                <div className='flex items-center gap-2 rounded-full px-3 py-2 h-[40px] border border-black bg-transparent' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                        <path fill="#000" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/>
                                    </svg>
                                    <input
                                        name='email'
                                        value={form.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder='Email'
                                        className='w-full outline-none bg-transparent placeholder:text-[#504E4E] placeholder:text-sm'
                                    />
                                </div>

                                {/* Name */}
                                <div className='flex items-center gap-2 rounded-full px-3 py-2 h-[40px] border border-black bg-transparent' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                        <path fill="#000" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"/>
                                    </svg>
                                    <input
                                        name='name'
                                        value={form.name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder='Name'
                                        className='w-full outline-none bg-transparent placeholder:text-[#504E4E] placeholder:text-sm'
                                    />
                                </div>

                                {/* Contact Number */}
                                <div className='flex items-center gap-2 rounded-full px-3 py-2 h-[40px] border border-black bg-transparent' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                        <path fill="#000" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"/>
                                    </svg>
                                    <input
                                        name='cp_number'
                                        value={form.cp_number}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder='Contact No.'
                                        className='w-full outline-none bg-transparent placeholder:text-[#504E4E] placeholder:text-sm'
                                    />
                                </div>

                                {/* Password */}
                                <div className='flex items-center gap-2 rounded-full px-3 py-2 h-[40px] border border-black bg-transparent' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                        <path fill="#000" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                                    </svg>
                                    <input
                                        name='password'
                                        value={form.password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder='Password'
                                        className='w-full outline-none bg-transparent placeholder:text-[#504E4E] placeholder:text-sm'
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className='flex items-center justify-center mt-2'>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-950 text-base md:text-lg font-serif px-6 py-2 rounded-lg min-w-[120px] h-[40px] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-green-900"
                                    >
                                        {loading ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    />
                                                </svg>
                                                Loading...
                                            </>
                                        ) : (
                                            "SIGN UP"
                                        )}
                                    </button>
                                </div>

                                {/* Login Link */}
                                <div className='text-center mt-3 mb-2'>
                                    <p className='text-sm text-green-950'>
                                        Already have an account?{' '}
                                        <Link to="/guest/login" className='font-semibold text-green-800 hover:text-green-600 underline transition-colors'>
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
