import React from 'react'
import AdminSidebar from './parts/AdminSidebar'
import AdminNavbar from './parts/AdminNavbar'

const AdminCropProfile = () => {
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
                        <div className='flex flex-row items-start justify-center mb-6'>
                            <div className='w-1/2 flex flex-col items-start justify-center px-3 py-3'>
                                <h1 className='font-bold text-2xl md:text-4xl font-sans text-black'>Crop Profile</h1>
                            </div>
                            <div className='w-1/2 flex flex-col items-end justify-center px-3 py-3'>
                                <button type='button' className='bg-green-300 px-3 py-3 rounded-md text-white font-serif cursor-pointer'>ADD CROP</button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
    }

export default AdminCropProfile
