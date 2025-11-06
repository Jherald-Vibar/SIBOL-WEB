import { useParams } from 'react-router-dom';
import UserSidebar from './parts/UserSidebar';
import UserNavbar from './parts/UserNavbar';
import { useEffect, useState } from 'react';
import axiosClient from './axios';

const DailyReport = () => {
  const { year, month, day } = useParams();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get(`/getDataByDay/${year}/${month}/${day}`);
        setData(response.data.data);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch data!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, month, day]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#F4F0E5]">
      <div role="status" className="max-w-sm w-full animate-pulse px-4">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4F0E5]">
      <div className="p-6 text-red-500 text-center bg-white rounded-lg shadow-md">
        {error}
      </div>
    </div>
  );

  return (
    <div className='bg-[#F4F0E5] min-h-screen flex flex-col'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <UserSidebar />
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col md:ml-64 pb-20 md:pb-0'>
        {/* Navbar */}
        <div className="shadow-md bg-white sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content Area */}
        <div className='flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-6'>
            <h1 className='font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-gray-800'>
              Daily Report
            </h1>
            <div className='flex items-center'>
              <span className='font-sans font-semibold text-sm sm:text-base md:text-lg text-gray-600'>
                Date: <span className='text-gray-800'>{year}/{month}/{day}</span>
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs bg-gray-100 text-gray-700 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 font-semibold whitespace-nowrap">Crop</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 font-semibold whitespace-nowrap">Soil Temp</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 font-semibold whitespace-nowrap">Moisture</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 font-semibold whitespace-nowrap">pH</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 font-semibold whitespace-nowrap">EC</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 font-semibold whitespace-nowrap">NPK</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-gray-900 whitespace-nowrap">
                        {item.crop?.name ?? '—'}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {item.soil_temperature ?? '—'}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {item.soil_moisture ?? '—'}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {item.ph ?? '—'}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {item.electrical_conductivity ?? '—'}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className='flex flex-col sm:flex-row sm:gap-2 text-xs sm:text-sm'>
                          <span className='whitespace-nowrap'>N: {item.nitrogen ?? '—'}</span>
                          <span className='whitespace-nowrap'>P: {item.phosphorus ?? '—'}</span>
                          <span className='whitespace-nowrap'>K: {item.potassium ?? '—'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        <div className='flex flex-col items-center gap-2'>
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className='font-medium'>No data found for this date</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Navigation */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40'>
        <UserSidebar />
      </div>
    </div>
  );
};

export default DailyReport;
