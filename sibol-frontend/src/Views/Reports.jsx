import React, { useState } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [araw, setAraw] = useState(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const navigate = useNavigate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = [
    "SU", 'M', 'T', 'W', "TH", 'F', "SA"
  ];

  const firstDayofMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayofMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayofWeek = firstDayofMonth.getDay();
  const totalDaysofMonth = lastDayofMonth.getDate();

  const days = [];

  for (let i = 0; i < startingDayofWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDaysofMonth; i++) {
    days.push(i);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() -1, 1))
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  };

  const isWeekend = (day, index) => {
    if(!day) return false;
    const dayofWeek = (startingDayofWeek + day - 1) % 7;
    return dayofWeek === 0 || dayofWeek === 6;
  }

  const handleDate = (day) => {
    if (!day) return;
    setAraw(day);
    navigate(`/user/report/daily-report/${year}/${month}/${day}`);
  }

   return (
    <div className='bg-[#F4F0E5] flex min-h-screen relative'>
        <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md'>
            <UserSidebar/>
        </div>

        <div className='flex-1 flex flex-col'>
            <div className="shadow-md bg-white md:ml-64">
                <UserNavbar/>
            </div>

            <div className='flex-1 flex flex-col md:ml-64 px-3 sm:px-6 lg:px-10 py-3 rounded-md'>
                <div className='rounded-lg p-6 w-full max-w-md'>
                    <h1 className='font-bold text-xl md:text-3xl font-sans text-black'>Calendar</h1>
                </div>
                {/*Calendar mga sah*/}
                <div className='flex items-center justify-center'>
                    <div className='w-[500px] flex flex-col'>
                        <div className="flex items-center justify-between mb-6">
                        <h3 className="text-3xl font-serif font-semibold text-green-900">
                            {monthNames[currentDate.getMonth()]}
                        </h3>
                        <div className="flex gap-2">
                            <button
                            onClick={goToPreviousMonth}
                            className="p-1 hover:bg-gray-100 rounded"
                            >
                            <ChevronLeft size={20} />
                            </button>
                            <button
                            onClick={goToNextMonth}
                            className="p-1 hover:bg-gray-100 rounded"
                            >
                            <ChevronRight size={20} />
                            </button>
                        </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2">
                        {daysOfWeek.map((day, index) => (
                            <div
                            key={index}
                            className="text-center font-serif font-semibold text-green-900 text-2xl"
                            >
                            {day}
                            </div>
                        ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => (
                            <button
                            onClick={() => handleDate(day)}
                            key={index}
                            className={`
                                aspect-square cursor-pointer flex items-center justify-center text-sm
                                ${day ? 'font-medium font-serif text-[2.3rem]' : ''}
                                ${isWeekend(day, index)
                                ? 'bg-[#879E7F] text-white rounded'
                                : 'text-green-800'
                                }
                            `}
                            >
                            {day}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>

                {/* Download Button */}
                <div className='flex flex-col items-end'>
                    <div className="mt-6 max-w-md">
                    <button className="w-full bg-[#6B8E73] hover:bg-[#5A7862] text-white font-medium py-3 px-4 rounded uppercase text-sm tracking-wide transition-colors">
                        Download Monthly Report
                    </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Reports
