import React, { useState } from 'react';
import UserSidebar from './parts/UserSidebar';
import UserNavbar from './parts/UserNavbar';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axios';
import Footer from './parts/Footer';

const Reports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const monthNames  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysOfWeek  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const firstDay   = new Date(year, currentDate.getMonth(), 1);
  const lastDay    = new Date(year, currentDate.getMonth() + 1, 0);
  const startDay   = firstDay.getDay();
  const totalDays  = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const goToPrev = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const isWeekend = (day) => {
    if (!day) return false;
    const d = (startDay + day - 1) % 7;
    return d === 0 || d === 6;
  };

  const isToday = (day) => {
    const t = new Date();
    return day &&
      t.getDate() === day &&
      t.getMonth() === currentDate.getMonth() &&
      t.getFullYear() === year;
  };

  const handleDateClick = (day) => {
    if (!day) return;
    navigate(`/user/report/daily-report/${year}/${month}/${day}`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axiosClient.get(`/monthly-report/${year}/${month}`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `Monthly_Report_${monthNames[currentDate.getMonth()]}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download monthly report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-[#f7f4ee] min-h-screen flex font-['DM_Sans',sans-serif]">

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 fixed top-0 left-0 h-screen z-40">
        <UserSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-60">

        {/* Navbar */}
        <div className="sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-10">

          {/* Page header */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-[#2e8b57] mb-1">Reports</p>
            <h1 className="font-['Playfair_Display',serif] text-3xl md:text-4xl font-bold text-[#0b3d1e]">
              Farm <em className="italic text-[#2e8b57]">Calendar</em>
            </h1>
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden max-w-5xl">

            {/* Card header */}
            <div className="bg-[#0b3d1e] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium tracking-[2px] uppercase text-white/30 mb-0.5">
                  Monthly View
                </p>
                <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]}{' '}
                  <em className="italic text-[#f0a830]">{year}</em>
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={goToPrev}
                  className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 text-white/50 hover:bg-white/15 hover:text-white flex items-center justify-center transition-all"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={goToNext}
                  className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 text-white/50 hover:bg-white/15 hover:text-white flex items-center justify-center transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Day-of-week labels */}
            <div className="grid grid-cols-7 border-b border-black/5 bg-[#0b3d1e]/[0.02]">
              {daysOfWeek.map((d, i) => (
                <div
                  key={i}
                  className={`text-center py-3 text-[10px] font-semibold tracking-[1.5px] uppercase
                    ${i === 0 || i === 6 ? 'text-[#2e8b57]' : 'text-[#0b3d1e]/30'}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 p-4 gap-1">
              {days.map((day, i) => {
                const weekend = isWeekend(day);
                const today   = isToday(day);

                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(day)}
                    disabled={!day}
                    className={[
                      'relative flex items-center justify-center rounded-xl h-10 text-sm font-medium transition-all duration-150 select-none',
                      !day
                        ? 'cursor-default pointer-events-none'
                        : weekend
                          ? 'bg-[#0b3d1e] text-white hover:bg-[#1a6636] active:scale-95'
                          : 'text-[#0b3d1e]/70 hover:bg-[#0b3d1e]/8 hover:text-[#0b3d1e] active:scale-95',
                      today && !weekend
                        ? 'ring-2 ring-[#d4840a] ring-offset-1 text-[#0b3d1e] font-bold'
                        : '',
                      today && weekend
                        ? 'ring-2 ring-[#f0a830] ring-offset-1'
                        : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {day}
                    {today && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d4840a]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-black/5 px-5 py-4 flex flex-wrap items-center justify-between gap-3">

              {/* Legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#0b3d1e]" />
                  <span className="text-[11px] text-[#0b3d1e]/40">Weekend</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm ring-2 ring-[#d4840a] ring-offset-1" />
                  <span className="text-[11px] text-[#0b3d1e]/40">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#0b3d1e]/8" />
                  <span className="text-[11px] text-[#0b3d1e]/40">Tap to view daily report</span>
                </div>
              </div>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-[#d4840a] hover:bg-[#f0a830] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#d4840a]/25 hover:shadow-lg hover:shadow-[#d4840a]/30 hover:-translate-y-0.5"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Downloading…
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Monthly Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <UserSidebar />
      </div>
    </div>
  );
};

export default Reports;
