import React, { useState } from 'react'
import BG from '../assets/auth_image.png'
import '../login.css';
import Logo from '../assets/logo-left.png'
import { data, useNavigate } from 'react-router-dom'
import axiosClient from './axios';

const Register = () => {

    const [form, setForm] = useState({
        email: "",
        name: "",
        cp_number: "",
        password: "",
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
            console.log(form);
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
              <div className="relative hidden md:flex flex-row h-full">
                <div
                  className="absolute top-0 left-6 h-full z-0"
                  style={{
                    width: "100%",
                    backgroundColor: "#0b542d",
                    opacity: 0.6,
                    clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
                  }}
                ></div>

                <div
                  className="absolute top-0 left-0 h-full flex flex-col items-center justify-center text-white z-10 p-6"
                  style={{
                    width: "100%",
                    backgroundColor: "#0b542d",
                    clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
                  }}
                >
                  <div className="flex flex-col items-center justify-start text-center">
                    <img src={Logo} alt="" className="w-[180px] mb-6" />
                    <span className="font-serif text-2xl">
                      <span className="text-amber-300 text-5xl">S</span>mart Farming starts
                    </span>
                    <span className="font-serif text-2xl">
                      with the right <span className="text-amber-300 text-5xl">D</span>ata
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center min-h-screen w-full">
                <div className='w-full max-w-md  px-2 py-2 rounded-lg border border-green-800 bg-[#FEFADFAA] flex items-center justify-center'>
                  <form onSubmit={handleRegister} className='w-full md:w-[99%] px-3 py-3 flex flex-col justify-center items-center rounded-lg bg-[#FEFADF1A] border border-green-800'>
                      <div className='flex items-center'>
                          <img src={Logo} alt="logo" className='w-30 md:w-10'/>
                      </div>
                      <div className='mt-2 md:mt-3 text-center'>
                          <h1 className='text-2xl md:text-3xl font-serif font-semibold text-green-950 mb-3'>Sign up</h1>
                      </div>
                      {error ? <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                      <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                      </svg>
                      <span className="sr-only">Info</span>
                      <div>
                          <span className="font-medium">Danger alert!</span> {error}
                      </div>
                      </div> : <div></div>}
                        <div className='flex flex-col gap-3'>
                          <div className='flex justify-between items-center rounded-full px-3 py-3 h-[40px] border border-black' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 48 48"><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M24 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14M6 40.8V42h36v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C35.92 28 33.68 28 29.2 28H18.8c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8"></path></svg>
                              <input name='email' value={form.email} onChange={handleChange}
                               type="text" placeholder='Email' className=' outline-none px-3 py-3 placeholder:text-[#504E4E] placeholder:text-center' />
                          </div>

                          <div className='flex justify-between items-center rounded-full px-3 py-3 h-[40px] border border-black' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 48 48"><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M24 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14M6 40.8V42h36v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C35.92 28 33.68 28 29.2 28H18.8c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8"></path></svg>
                              <input name='name' value={form.name} onChange={handleChange}
                               type="text" placeholder='Name' className=' outline-none px-3 py-3 placeholder:text-[#504E4E] placeholder:text-center' />
                          </div>

                           <div className='flex justify-between items-center rounded-full px-3 py-3 h-[40px] border border-black' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 48 48"><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M24 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14M6 40.8V42h36v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C35.92 28 33.68 28 29.2 28H18.8c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C6 34.08 6 36.32 6 40.8"></path></svg>
                              <input name='cp_number' value={form.cp_number} onChange={handleChange}
                               type="text" placeholder='Contact No.' className=' outline-none px-3 py-3 placeholder:text-[#504E4E] placeholder:text-center' />
                          </div>

                          <div className='flex justify-between items-center rounded-full px-3 py-3 h-[40px] border border-black' style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}>
                               <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="#000" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"></path></svg>
                              <input name='password' value={form.password} onChange={handleChange}
                               type="password" placeholder='Password' className=' outline-none px-3 py-3 placeholder:text-[#504E4E] placeholder:text-center'/>
                          </div>
                          <div className='flex items-center justify-center px-2 py-2 mb-3'>
                             <button
                              type="submit"
                              disabled={loading}
                              className="bg-green-950 text-[0.9rem] md:text-xl font-serif px-1 py-1 rounded-lg w-[120px] h-[35px] text-white cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
                                      ></circle>
                                      <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                      ></path>
                                  </svg>
                                  Loading...
                                  </>
                              ) : (
                                  "SIGN UP"
                              )}
                              </button>
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
