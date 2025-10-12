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
  if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;

  return (
    <div className='bg-[#F4F0E5] flex min-h-screen relative'>
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md'>
        <UserSidebar />
      </div>

      <div className='flex-1 flex flex-col'>
        <div className="shadow-md bg-white md:ml-64">
          <UserNavbar />
        </div>

        <div className='flex-1 flex flex-col md:ml-64 px-3 sm:px-6 lg:px-10 py-3 rounded-md'>
          <div className='flex items-center justify-start max-w-sm'>
            <h1 className='font-sans font-bold text-3xl md:text-4xl'>Daily Report</h1>
          </div>

          <div className='flex items-center justify-end max-w-full'>
            <h1 className='font-sans font-bold text-[.6rem] md:text-xl'>Date: {year}/{month}/{day}</h1>
          </div>

          <div className='flex flex-col items-center justify-center px-3 py-3'>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-full">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3 bg-gray-50">Crop</th>
                    <th className="px-6 py-3">Soil Temperature</th>
                    <th className="px-6 py-3 bg-gray-50">Soil Moisture</th>
                    <th className="px-6 py-3">pH</th>
                    <th className="px-6 py-3">EC</th>
                    <th className="px-6 py-3">NPK</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50">
                        {item.crop_id ?? '—'}
                      </td>
                      <td className="px-6 py-4">{item.soil_temperature ?? '—'}</td>
                      <td className="px-6 py-4 bg-gray-50">{item.soil_moisture ?? '—'}</td>
                      <td className="px-6 py-4">{item.ph ?? '—'}</td>
                      <td className="px-6 py-4">{item.electrical_conductivity ?? '—'}</td>
                      <td className="px-6 py-4">
                        N: {item.nitrogen ?? '—'}, P: {item.phosphorus ?? '—'}, K: {item.potassium ?? '—'}
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No data found for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
