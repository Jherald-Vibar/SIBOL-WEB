import React, { useState } from 'react'
import BG from '../assets/auth_img.png'
import '../login.css';
import Logo from '../assets/logo-left.png'
import { useNavigate } from 'react-router-dom'
import axiosClient from './axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(!email || !password) {
        setError("Both fields are required!");
        setIsLoading(false);
        return;
    }
    try {
        const response = await axiosClient.post("/login", {
            email, password,
        });

        const data = response.data;
        const role = data.role;
        const token = data.token;
        const name = data.user.name;
        const location = data.user.location;

        localStorage.setItem("authToken", token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", name);
        localStorage.setItem("location", location);

        if(role == "admin") {
             console.log('Admin');
             navigate("/admin/crop-profile");
        }

        if(role != "user") {
            console.log('gumagana di ka user');
            setIsLoading(false);
            setError("You're not a user!");
            return;
        }
         navigate("/user/dashboard");
    } catch (error) {
        setIsLoading(false);
        setError("Login Failed! Please check your credentials!");
    }
    finally {
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

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
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

        .link-hover {
          transition: all 0.3s ease;
          position: relative;
        }

        .link-hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .link-hover:hover::after {
          width: 100%;
        }

        .link-hover:hover {
          transform: translateX(3px);
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }

        .logo-hover {
          transition: transform 0.3s ease;
        }

        .logo-hover:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .gradient-text {
          background: linear-gradient(90deg, #14532d, #166534, #14532d);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
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
              <a href="/" className="logo-hover">
                <img src={Logo} alt="" className="w-[180px] mb-6 animate-float" />
              </a>
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
          <div className='w-full max-w-md px-4 py-4 rounded-2xl border-2 border-green-800 bg-white/30 backdrop-blur-sm shadow-2xl animate-pulse-glow'>
            <form
              onSubmit={handleLogin}
              className="w-full px-6 py-8 flex flex-col justify-center items-center rounded-xl bg-gradient-to-b from-green-50/50 to-white border-2 border-green-700"
            >
              {/* Logo */}
              <div className="flex items-center justify-center mb-3 animate-fadeInUp">
                <a href="/" className="logo-hover">
                  <img src={Logo} alt="logo" className="w-16 md:w-20" />
                </a>
              </div>

              {/* Title */}
              <div className="text-center mb-2 animate-fadeInUp stagger-1">
                <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text mb-1">
                  LOGIN
                </h1>
                <p className="text-sm text-green-700">Welcome back! Please login to continue</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  className="flex items-center p-3 mb-4 mt-4 text-sm text-red-800 rounded-xl bg-red-50 w-full border-l-4 border-red-500 animate-shake"
                  role="alert"
                >
                  <svg
                    className="w-5 h-5 mr-2 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <div>
                    <span className="font-semibold">Error: </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Inputs */}
              <div className="flex flex-col gap-5 w-full mt-6">
                {/* Email Input */}
                <div
                  className="input-wrapper flex items-center gap-3 rounded-full px-4 py-3 h-[52px] border-2 border-green-800 bg-white animate-fadeInUp stagger-3"
                  style={{ boxShadow: "4px 4px 6px rgba(0,0,0,0.1)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    className="text-green-700 shrink-0"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={4}
                      d="M24 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14M6 40.8V42h36v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C35.92 28 33.68 28 29.2 28H18.8c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8"
                    />
                  </svg>
                  <input
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="text"
                    placeholder="Email address"
                    className="w-full outline-none bg-transparent placeholder:text-gray-500 text-green-900 font-medium"
                  />
                </div>

                {/* Password Input */}
                <div
                  className="input-wrapper flex items-center gap-3 rounded-full px-4 py-3 h-[52px] border-2 border-green-800 bg-white animate-fadeInUp stagger-4"
                  style={{ boxShadow: "4px 4px 6px rgba(0,0,0,0.1)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="text-green-700 shrink-0"
                  >
                    <path
                      fill="currentColor"
                      d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"
                    />
                  </svg>
                  <input
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full outline-none bg-transparent placeholder:text-gray-500 text-green-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-green-700 hover:text-green-900 transition-colors shrink-0"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-center mt-6 w-full animate-fadeInUp stagger-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button bg-gradient-to-r from-green-900 to-green-700 text-white font-serif text-xl font-bold px-10 py-3 rounded-full min-w-[150px] h-[54px] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
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
                    "LOGIN"
                  )}
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mt-6 animate-fadeInUp stagger-6">
                <a
                  href="#"
                  className="link-hover text-sm sm:text-base font-serif font-semibold text-green-700 hover:text-green-500 transition-colors"
                >
                  Forgot password?
                </a>
                <span className="hidden sm:inline text-green-700">•</span>
                <a
                  href="/guest/sign_up"
                  className="link-hover text-sm sm:text-base font-serif font-semibold text-green-700 hover:text-green-500 transition-colors"
                >
                  Create an account
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
