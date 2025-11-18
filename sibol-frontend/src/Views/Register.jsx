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
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    const handleCheckboxChange = (e) => {
        if (e.target.checked) {
            setShowTermsModal(true);
        } else {
            setAgreedToTerms(false);
        }
    };

    const handleAcceptTerms = () => {
        setAgreedToTerms(true);
        setShowTermsModal(false);
    };

    const handleDeclineTerms = () => {
        setAgreedToTerms(false);
        setShowTermsModal(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if(!form.email || !form.name || !form.cp_number || !form.password) {
            setIsLoading(false);
            setError("All fields are required!");
            return;
        }

        if (!agreedToTerms) {
            setIsLoading(false);
            setError("You must agree to the Terms and Agreement to continue!");
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

                .custom-checkbox {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #166534;
                    border-radius: 4px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .custom-checkbox:checked {
                    background-color: #166534;
                    border-color: #166534;
                }

                .custom-checkbox:checked::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                }

                .custom-checkbox:hover {
                    border-color: #059669;
                    box-shadow: 0 0 8px rgba(5, 150, 105, 0.3);
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

                                {/* Terms & Agreement Checkbox */}
                                <div className='flex items-start gap-3 mt-2 animate-fadeInUp' style={{ animationDelay: '0.65s' }}>
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={handleCheckboxChange}
                                        className="custom-checkbox mt-1 flex-shrink-0"
                                    />
                                    <label htmlFor="terms" className="text-sm text-green-900 font-medium cursor-pointer">
                                        I agree to the{' '}
                                        <button
                                            type="button"
                                            onClick={() => setShowTermsModal(true)}
                                            className="text-green-700 font-bold underline hover:text-green-500 transition-colors"
                                        >
                                            Terms and Agreement
                                        </button>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className='flex items-center justify-center mt-2 animate-fadeInUp' style={{ animationDelay: '0.7s' }}>
                                    <button
                                        type="submit"
                                        disabled={loading || !agreedToTerms}
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

            {/* Terms & Agreement Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-scaleIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-4 border-green-700">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-900 to-green-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="text-amber-300">
                                    <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z"/>
                                </svg>
                                <h2 className="text-2xl font-bold text-white font-serif">Terms & Agreement</h2>
                            </div>
                            <button
                                onClick={handleDeclineTerms}
                                className="text-white hover:text-amber-300 transition-colors p-2 rounded-full hover:bg-white/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh] bg-gradient-to-b from-green-50/30 to-white">
                            <div className="prose prose-green max-w-none">
                                <p className="text-green-900 text-base leading-relaxed mb-4">
                                    By accessing or using the <strong>SIBOL Crop Management Website</strong>, you agree to comply with these Terms and Agreement. If you do not agree, you must discontinue use of the platform immediately.
                                </p>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">1. Acceptance of Terms</h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    By creating an account and using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                                </p>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">2. User Responsibilities</h3>
                                <ul className="list-disc list-inside text-green-900 text-sm space-y-2">
                                    <li>Provide accurate and complete information during registration</li>
                                    <li>Maintain the confidentiality of your account credentials</li>
                                    <li>Use the platform for lawful purposes only</li>
                                    <li>Comply with all applicable laws and regulations</li>
                                </ul>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">3. Privacy and Data Protection</h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    We collect and process your personal data in accordance with our Privacy Policy. Your information will be used to improve our services and provide you with a better user experience.
                                </p>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">4. Intellectual Property</h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    All content, features, and functionality on this platform are the exclusive property of SIBOL and are protected by copyright and other intellectual property laws.
                                </p>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">5. Limitation of Liability</h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    SIBOL shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or inability to access our services.
                                </p>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">6. Termination</h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in any activity that may harm the platform or other users.
                                </p>

                                <h3 className="text-green-800 font-bold text-lg mt-6 mb-3">7. Changes to Terms</h3>
                                <p className="text-green-900 text-sm leading-relaxed">
                                    We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the modified terms.
                                </p>

                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-6 rounded-r-lg">
                                    <p className="text-amber-900 text-sm font-semibold">
                                        ⚠️ Important: By clicking "I Agree", you confirm that you have read and accepted all terms and conditions outlined above.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end border-t-2 border-green-200">
                            <button
                                onClick={handleDeclineTerms}
                                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-all transform hover:scale-105 active:scale-95"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAcceptTerms}
                                className="px-6 py-3 bg-gradient-to-r from-green-900 to-green-700 text-white rounded-lg font-semibold hover:from-green-800 hover:to-green-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                            >
                                I Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Register
