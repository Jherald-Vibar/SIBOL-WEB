import React, { useEffect, useState } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import Pic from '../assets/first_image.png'
import axiosClient from './axios';

const Cropcare = () => {
  const [isModelOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const [garden, setGarden] = useState([]);
  const [form, setForm] = useState({
    garden_name: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({
        ...form,
        [e.target.name]: e.target.value
    });
  }

  const handleModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const fetchGarden = async () => {
      setIsLoading(true);
      try {
          const response = await axiosClient.get("/getGardenData");
          setGarden(response.data);
      } catch (error) {
          setError("Failed to fetch data!");
      } finally {
          setIsLoading(false);
      }
  }

  useEffect(() => {
    fetchGarden();
    const interval = setInterval(() => {
      fetchGarden();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addGarden = async (e) => {
    e.preventDefault();

    if(!form.garden_name || !form.location) {
        setError("All fields are required!");
        return;
    }

    setIsLoading(true);

    try {
        const response = await axiosClient.post("/addGarden", form);
        setIsLoading(false);
        setModalOpen(false);
        fetchGarden();
    } catch (error) {
        setError(error.response?.data?.message || "Failed to add garden");
    } finally {
        setIsLoading(false);
    }
  }

  if(loading) return (
    <div className="flex justify-center items-center min-h-screen">
            <div role="status" className="max-w-sm w-full animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            <span className="sr-only">Loading.....</span>
            </div>
    </div>
  );

  return (
    <div className='bg-[#F4F0E5] flex min-h-screen relative'>
        <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md'>
            <UserSidebar/>
        </div>

        <div className="flex-1 flex flex-col">
            {/* Navbar */}
                <div className="shadow-md bg-white md:ml-64">
                <UserNavbar />
                </div>

            {/*Main*/}
                <div className='flex-1 flex flex-col md:ml-64 px-3 sm:px-6 lg:px-10 py-3 rounded-md'>
                    <div className='flex flex-col justify-center w-full h-[100px] border-b-2 border-gray-500'>
                        <h1 className='text-xl md:text-4xl font-semibold font-sans'>Which garden would you like to monitor?</h1>
                    </div>

                    <div className='flex flex-col items-end justify-center w-full h-[80px]'>
                        <button onClick={handleModal} type='button' className='bg-green-300 px-3 py-3 rounded-md text-white font-serif cursor-pointer'>CREATE NEW</button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 items-center justify-start px-3 py-3 gap-3 w-full'>
                        {/** Garden Data here mga G */}
                        {garden.map((gard) => (
                        <div key={gard.id} className='flex flex-col bg-white px-2 pt-2 rounded-lg'>
                            <div className='w-full h-full'>
                                <img src={Pic} alt="" />
                            </div>
                            <div className='flex flex-row'>
                                <div className='w-2/3 flex flex-col items-start justify-start px-3 py-1 border-r-2 border-gray-500'>
                                    <h1 className='font-serif text-[.9rem] md:text-2xl font-semibold'>{gard.name}</h1>
                                </div>
                                <div className='w-1/3 flex flex-row items-center justify-evenly px-3 py-1'>
                                    <button className='cursor-pointer'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 512 512"><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={32} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"></path><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={32} d="m272 336l80-80l-80-80M48 256h288"></path></svg>
                                    </button>

                                    <button className='cursor-pointer'>
                                         <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#e61010" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11v6m-4-6v6M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M4 7h16M7 7l2-4h6l2 4"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>

                    {/** Modal mga sah */}
                        {isModelOpen ? (
                        <div className='fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-30 backdrop-blur-sm z-50 animate-fadeIn'>
                            <div className='flex flex-col bg-white px-3 py-3 w-[400px] h-[320px] border-2 border-black rounded-lg shadow-lg transform transition-all duration-300 scale-100'>
                                <div className='flex flex-row py-3 items-center'>
                                    <div className='w-2/3 flex flex-col items-start justify-center px-3 py-3'>
                                        <h1 className='text-xl md:text-2xl font-sans font-bold'>Add Garden</h1>
                                    </div>
                                    <div className='w-1/3 flex flex-col items-end justify-center pr-5 py-3'>
                                        <button onClick={closeModal} className='cursor-pointer'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 32 32"><path fill="#151212" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12"></path><path fill="#151212" d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                {error ? <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                    <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="sr-only">Info</span>
                                    <div>
                                        <span className="font-medium">Danger alert!</span> {error}
                                    </div>
                                    </div> : <div></div>
                                }

                                <form onSubmit={addGarden} className='flex flex-col gap-2 px-3 py-3'>
                                    <div className='flex flex-row items-center justify-between px-3 py-3 gap-3'>
                                        <label className='text-[.9rem] md:text-xl font-semibold font-sans'>Garden Name</label>
                                        <input type="text" name='garden_name' onChange={handleChange} placeholder='Garden Name' className='px-1 py-1 border-2 border-gray-500 rounded-md placeholder:text-center' />
                                    </div>

                                    <div className='flex flex-row items-center justify-between px-3 py-3 gap-3'>
                                        <label className='text-[.9rem] md:text-xl font-semibold font-sans'>Location</label>
                                        <input type="text" name='location' onChange={handleChange} placeholder='Location' className='px-1 py-1 border-2 border-gray-500 rounded-md placeholder:text-center' />
                                    </div>

                                    <div className='flex flex-col items-end justify-center px-3 py-3'>
                                        <button type='submit' disabled={loading} className='bg-[#114320BA] border-1 border-black rounded-md font-bold font-sans text-white w-12 text-[.6rem] md:text-[.7rem] px-1 py-1'>
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
                                                Saving...
                                                </>
                                            ) : (
                                                "Save"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                            ) : (
                            ""
                        )}
                </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }

          .animate-fadeOut {
            animation: fadeOut 0.3s ease-in forwards;
          }
        `}</style>

    </div>
  )
}

export default Cropcare
