import React, { useState } from 'react'
import BG from '../assets/auth_img.png'
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
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="login min-h-screen w-full overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50">
            <style>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-slideInLeft {
                    animation: slideInLeft 0.8s ease-out forwards;
                }

                .animate-slideInRight {
                    animation: slideInRight 0.8s ease-out forwards;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.4s ease-out forwards;
                }

                .input-wrapper {
                    transition: all 0.3s ease;
                }

                .input-wrapper:focus-within {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                    border-color: #059669;
                }

                .input-wrapper input:focus {
                    outline: none;
                }

                .submit-button {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .submit-button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .submit-button:hover::before {
                    width: 300px;
                    height: 300px;
                }

                .submit-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                }

                .submit-button:active {
                    transform: translateY(-1px);
                }

                .stagger-1 { animation-delay: 0.1s; }
                .stagger-2 { animation-delay: 0.2s; }
                .stagger-3 { animation-delay: 0.3s; }
                .stagger-4 { animation-delay: 0.4s; }
                .stagger-5 { animation-delay: 0.5s; }

                .logo-hover {
                    transition: transform 0.3s ease;
                }

                .logo-hover:hover {
                    transform: scale(1.1) rotate(5deg);
                }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 overflow-hidden min-h-screen">
                {/* Left Side - Branding */}
                <div className="relative hidden md:flex flex-row h-full animate-slideInLeft">
                    <div
                        className="absolute top-0 left-6 h-full z-0"
                        style={{
                            width: "100%",
                            backgroundColor: "#0b542d",
                            opacity: 0.4,
                            clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
                        }}
                    />

                    <div
                        className="absolute top-0 left-0 h-full flex flex-col items-center justify-center text-white z-10 p-6"
                        style={{
                            width: "100%",
                            background: "linear-gradient(135deg, #0b542d 0%, #166534 100%)",
                            clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
                        }}
                    >
                        <div className="flex flex-col items-center justify-start text-center">
                            <Link to="/" className="logo-hover">
                                <img src={Logo} alt="" className="w-[180px] mb-6 animate-float" />
                            </Link>
                            <span className="font-serif text-2xl animate-fadeInUp stagger-1">
                                <span className="text-amber-300 text-5xl font-bold">S</span>mart Farming starts
                            </span>
                            <span className="font-serif text-2xl animate-fadeInUp stagger-2">
                                with the right <span className="text-amber-300 text-5xl font-bold">D</span>ata
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex flex-1 items-center justify-center min-h-screen w-full p-4 animate-slideInRight">
                    <div className='w-full max-w-md px-4 py-4 rounded-2xl border-2 border-green-800 bg-white/40 backdrop-blur-sm shadow-2xl animate-pulse-glow'>
                        <form onSubmit={handleRegister} className='w-full px-4 py-6 flex flex-col items-center rounded-xl bg-gradient-to-b from-green-50/50 to-white border-2 border-green-700'>
                            {/* Logo */}
                            <div className='flex items-center mb-3 animate-fadeInUp'>
                                <a href="/" className="logo-hover">
                                    <img src={Logo} alt="logo" className='w-14 md:w-16'/>
                                </a>
                            </div>

                            {/* Title */}
                            <h1 className='text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-900 to-green-600 mb-2 animate-fadeInUp stagger-1'>Sign up</h1>
                            <p className='text-sm text-green-700 mb-5 animate-fadeInUp stagger-2'>Create your account to get started</p>

                            {/* Error Alert */}
                            {error && (
                                <div className="flex items-center p-3 mb-4 text-sm text-red-800 rounded-xl bg-red-50 w-full border-l-4 border-red-500 animate-shake" role="alert">
                                    <svg className="shrink-0 w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            {/* Input Fields */}
                            <div className='flex flex-col gap-4 w-full'>
                                {/* Email */}
                                <div className='input-wrapper flex items-center gap-2 rounded-full px-4 py-3 h-[48px] border-2 border-green-800 bg-white animate-fadeInUp stagger-3' style={{ boxShadow: "4px 4px 6px rgba(0,0,0,0.1)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" className="text-green-700">
                                        <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/>
                                    </svg>
                                    <input
                                        name='email'
                                        value={form.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder='Email address'
                                        className='w-full outline-none bg-transparent placeholder:text-gray-500 text-green-900 font-medium'
                                    />
                                </div>

                                {/* Name */}
                                <div className='input-wrapper flex items-center gap-2 rounded-full px-4 py-3 h-[48px] border-2 border-green-800 bg-white animate-fadeInUp stagger-4' style={{ boxShadow: "4px 4px 6px rgba(0,0,0,0.1)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" className="text-green-700">
                                        <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"/>
                                    </svg>
                                    <input
                                        name='name'
                                        value={form.name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder='Full name'
                                        className='w-full outline-none bg-transparent placeholder:text-gray-500 text-green-900 font-medium'
                                    />
                                </div>

                                {/* Contact Number */}
                                <div className='input-wrapper flex items-center gap-2 rounded-full px-4 py-3 h-[48px] border-2 border-green-800 bg-white animate-fadeInUp stagger-5' style={{ boxShadow: "4px 4px 6px rgba(0,0,0,0.1)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" className="text-green-700">
                                        <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"/>
                                    </svg>
                                    <input
                                        name='cp_number'
                                        value={form.cp_number}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder='Contact number'
                                        className='w-full outline-none bg-transparent placeholder:text-gray-500 text-green-900 font-medium'
                                    />
                                </div>

                                {/* Password */}
                                <div className='input-wrapper flex items-center gap-2 rounded-full px-4 py-3 h-[48px] border-2 border-green-800 bg-white animate-fadeInUp' style={{ boxShadow: "4px 4px 6px rgba(0,0,0,0.1)", animationDelay: '0.6s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" className="text-green-700">
                                        <path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/>
                                    </svg>
                                    <input
                                        name='password'
                                        value={form.password}
                                        onChange={handleChange}
                                        type={showPassword ? "text" : "password"}
                                        placeholder='Password'
                                        className='w-full outline-none bg-transparent placeholder:text-gray-500 text-green-900 font-medium'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-green-700 hover:text-green-900 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"/>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <div className='flex items-center justify-center mt-2 animate-fadeInUp' style={{ animationDelay: '0.7s' }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="submit-button bg-gradient-to-r from-green-900 to-green-700 text-lg font-serif font-bold px-8 py-3 rounded-full min-w-[140px] h-[50px] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
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
                                <div className='text-center mt-3 mb-2 animate-fadeInUp' style={{ animationDelay: '0.8s' }}>
                                    <p className='text-sm text-green-900 font-medium'>
                                        Already have an account?{' '}
                                        <Link to="/guest/login" className='font-bold text-green-700 hover:text-green-500 underline decoration-2 underline-offset-2 transition-all hover:scale-105 inline-block'>
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
