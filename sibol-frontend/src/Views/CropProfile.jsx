import React, { useState } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'

const CropProfile = () => {
  const [crops] = useState([
     {
      id: 1,
      name: "Tomato",
      temperature: "20-25°C",
      humidity: "60-80%",
      soilPH: "6.0-6.8",
      ec: "2.0-3.5",
      npk: "5-10-10"
    },
    {
      id: 2,
      name: "Lettuce",
      temperature: "15-20°C",
      humidity: "50-70%",
      soilPH: "6.0-7.0",
      ec: "1.2-1.8",
      npk: "8-15-36"
    },
    {
      id: 3,
      name: "Cucumber",
      temperature: "18-24°C",
      humidity: "70-90%",
      soilPH: "5.5-6.5",
      ec: "1.7-2.5",
      npk: "7-9-5"
    }
  ]);

  return (
    <div className='bg-[#F4F0E5] flex min-h-screen relative'>
        <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md'>
            <UserSidebar/>
        </div>

         <div className="flex-1 flex flex-col">
            <div className="shadow-md bg-white md:ml-64">
                <UserNavbar/>
            </div>

            <div className='flex-1 flex flex-col md:ml-64 px-3 sm:px-6 lg:px-10 py-3 rounded-md'>
                <div className='flex flex-col items-start justify-center mb-6'>
                    <h1 className='font-bold text-2xl md:text-4xl font-sans text-black'>Crop Profile</h1>
                </div>

                <div className='flex flex-col w-full items-center justify-center'>
                    <div className='w-full flex flex-col items-center justify-start'>
                        <div className="w-full flex items-start justify-center">
                            <div className="bg-white rounded-lg shadow-lg overflow-x-auto border-2 border-gray-300 w-full max-w-6xl">
                                <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                    <th
                                        rowSpan="2"
                                        className="border-r-2 border-gray-300 px-3 sm:px-6 md:px-8 py-4 md:py-6 text-center text-sm sm:text-base md:text-lg font-bold text-gray-700 bg-gray-50 align-middle"
                                    >
                                        Crop Name
                                    </th>
                                    <th
                                        colSpan="5"
                                        className="px-3 sm:px-6 md:px-8 py-3 md:py-5 text-center text-sm sm:text-base md:text-lg font-bold text-gray-700 bg-gray-50 border-b border-gray-300"
                                    >
                                        Optimal Condition
                                    </th>
                                    </tr>
                                    <tr className="border-b-2 border-gray-300">
                                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                        Temp
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                        Humidity
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                        Soil PH
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                        EC
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 bg-gray-50">
                                        NPK
                                    </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {crops.map((crop, index) => (
                                    <tr
                                        key={crop.id}
                                        className={`${index !== crops.length - 1 ? 'border-b border-gray-300' : ''}`}
                                    >
                                        <td className="border-r-2 border-gray-300 px-3 sm:px-6 md:px-8 py-3 md:py-6 font-bold text-sm sm:text-base md:text-lg text-gray-800 bg-gray-50 text-center">
                                        {crop.name}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 md:py-6 text-center text-xs sm:text-sm md:text-base text-gray-700 border-r border-gray-300">
                                        {crop.temperature}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 md:py-6 text-center text-xs sm:text-sm md:text-base text-gray-700 border-r border-gray-300">
                                        {crop.humidity}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 md:py-6 text-center text-xs sm:text-sm md:text-base text-gray-700 border-r border-gray-300">
                                        {crop.soilPH}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 md:py-6 text-center text-xs sm:text-sm md:text-base text-gray-700 border-r border-gray-300">
                                        {crop.ec}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-3 md:py-6 text-center text-xs sm:text-sm md:text-base text-gray-700">
                                        {crop.npk}
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
    </div>
  )
}

export default CropProfile
