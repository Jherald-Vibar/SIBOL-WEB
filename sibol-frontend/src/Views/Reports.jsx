import React, { useState } from 'react';
import UserSidebar from './parts/UserSidebar';
import UserNavbar from './parts/UserNavbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axios';

const Reports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["SU", "M", "T", "W", "TH", "F", "SA"];

  // Calculate calendar days
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(year, currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysOfMonth = lastDayOfMonth.getDate();

  // Build days array
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDaysOfMonth; i++) {
    days.push(i);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const isWeekend = (day) => {
    if (!day) return false;
    const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const handleDateClick = (day) => {
    if (!day) return;
    navigate(`/user/report/daily-report/${year}/${month}/${day}`);
  };

  const handleDownloadMonthlyReport = async () => {
    setDownloading(true);
    try {
      const response = await axiosClient.get(`/monthly-report/${year}/${month}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Monthly_Report_${monthNames[currentDate.getMonth()]}_${year}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download monthly report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day &&
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === year
    );
  };

  return (
    <div className='bg-[#F4F0E5] flex flex-col md:flex-row min-h-screen'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <UserSidebar />
      </div>

      <div className='flex-1 flex flex-col pb-20 md:pb-0'>
        {/* Navbar */}
        <div className="shadow-md bg-white md:ml-64 sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col md:ml-64 px-4 sm:px-6 lg:px-10 py-5'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='font-bold text-2xl md:text-3xl text-black'>Calendar</h1>
          </div>

          {/* Calendar Container */}
          <div className='flex flex-col items-center justify-center flex-1'>
            <div className='w-full max-w-2xl'>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-green-900">
                  {monthNames[currentDate.getMonth()]} {year}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {daysOfWeek.map((day, index) => (
                  <div
                    key={index}
                    className="text-center font-serif font-semibold text-green-900 text-lg sm:text-xl md:text-2xl py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    disabled={!day}
                    className={`
                      aspect-square flex items-center justify-center text-lg sm:text-2xl md:text-4xl
                      font-medium font-serif rounded transition-all
                      ${!day ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                      ${isWeekend(day)
                        ? 'bg-[#879E7F] text-white hover:bg-[#748A6D]'
                        : 'text-green-800 hover:bg-gray-100'
                      }
                      ${isToday(day)
                        ? 'ring-2 ring-green-600 ring-offset-2'
                        : ''
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Download Button */}
              <div className="mt-8 flex justify-center sm:justify-end">
                <button
                  onClick={handleDownloadMonthlyReport}
                  disabled={downloading}
                  className="w-full sm:w-auto bg-[#6B8E73] hover:bg-[#5A7862] disabled:bg-gray-400
                           disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded
                           uppercase text-sm tracking-wide transition-colors flex items-center
                           justify-center gap-2 min-w-[250px]"
                >
                  {downloading ? (
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
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Monthly Report
                    </>
                  )}
                </button>
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#879E7F]"></div>
                  <span>Weekend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded ring-2 ring-green-600"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <UserSidebar />
      </div>
    </div>
  );
};

export default Reports;
