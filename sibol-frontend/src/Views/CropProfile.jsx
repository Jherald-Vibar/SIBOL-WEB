import React, { useState, useEffect } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios'

const CropProfile = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCrops = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosClient.get('/user/crop-profile');
        setCrops(response.data);

      } catch (error) {
        console.error('Error fetching crops:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch crops');
        setCrops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCrops();
  }, []);

  return (
    <div className='bg-gradient-to-br from-[#F4F0E5] to-[#E8E4D9] flex flex-col min-h-screen'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-xl z-40'>
        <UserSidebar/>
      </div>

      <div className="flex-1 flex flex-col md:ml-64 pb-20 md:pb-0">
        {/* Navbar */}
        <div className="shadow-sm bg-white/95 backdrop-blur-sm sticky top-0 z-30">
          <UserNavbar/>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col px-4 sm:px-6 lg:px-10 py-6'>
          {/* Header */}
          <div className='flex flex-col items-start justify-center mb-8'>
            <h1 className='font-bold text-3xl md:text-4xl font-sans text-gray-900 tracking-tight'>
              Crop Profile
            </h1>
            <p className='text-sm text-gray-500 mt-2 font-medium'>
              {loading ? 'Loading your crops...' : `${crops.length} crop${crops.length !== 1 ? 's' : ''} in your profile`}
            </p>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-24'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-10 h-10 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin'></div>
                <span className='text-gray-600 font-medium'>Loading crop profiles...</span>
              </div>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-red-200'>
              <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4'>
                <svg className='w-10 h-10 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <p className='text-red-700 text-lg font-semibold'>Error loading crops</p>
              <p className='text-red-500 text-sm mt-2'>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className='mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium'
              >
                Retry
              </button>
            </div>
          ) : crops.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-gray-200'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                </svg>
              </div>
              <p className='text-gray-700 text-lg font-semibold'>No crops found</p>
              <p className='text-gray-500 text-sm mt-2'>Add crops to see their profiles here</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th
                          rowSpan="2"
                          className="border-r border-gray-200 px-6 py-5 text-left text-base font-bold text-gray-800 bg-gradient-to-b from-gray-50 to-white align-middle"
                        >
                          Crop Name
                        </th>
                        <th
                          colSpan="5"
                          className="px-6 py-4 text-center text-base font-bold text-gray-800 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200"
                        >
                          Optimal Conditions
                        </th>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700 bg-white border-r border-gray-100">
                          Temperature
                        </th>
                        <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700 bg-white border-r border-gray-100">
                          Humidity
                        </th>
                        <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700 bg-white border-r border-gray-100">
                          Soil pH
                        </th>
                        <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700 bg-white border-r border-gray-100">
                          EC
                        </th>
                        <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700 bg-white">
                          NPK
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {crops.map((crop, index) => (
                        <tr
                          key={crop.id}
                          className={`transition-colors hover:bg-gray-50 ${
                            index !== crops.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          <td className="border-r border-gray-200 px-6 py-5 font-bold text-base text-gray-800 bg-gradient-to-r from-gray-50 to-white">
                            {crop.name}
                          </td>
                          <td className="px-5 py-5 text-center text-sm text-gray-700 border-r border-gray-100">
                            {crop.temperature}
                          </td>
                          <td className="px-5 py-5 text-center text-sm text-gray-700 border-r border-gray-100">
                            {crop.humidity}
                          </td>
                          <td className="px-5 py-5 text-center text-sm text-gray-700 border-r border-gray-100">
                            {crop.soilPH}
                          </td>
                          <td className="px-5 py-5 text-center text-sm text-gray-700 border-r border-gray-100">
                            {crop.ec}
                          </td>
                          <td className="px-5 py-5 text-center text-sm text-gray-700">
                            {crop.npk}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {crops.map((crop) => (
                  <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-lg text-gray-800">{crop.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Optimal Growing Conditions</p>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm">Temperature</span>
                        <span className="text-gray-600 text-sm font-medium">{crop.temperature}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm">Humidity</span>
                        <span className="text-gray-600 text-sm font-medium">{crop.humidity}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm">Soil pH</span>
                        <span className="text-gray-600 text-sm font-medium">{crop.soilPH}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm">EC</span>
                        <span className="text-gray-600 text-sm font-medium">{crop.ec}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-semibold text-gray-700 text-sm">NPK Ratio</span>
                        <span className="text-gray-600 text-sm font-medium">{crop.npk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Footer Sidebar */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-50'>
        <UserSidebar/>
      </div>
    </div>
  )
}

export default CropProfile
