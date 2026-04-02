import { useParams } from 'react-router-dom';
import UserSidebar from './parts/UserSidebar';
import UserNavbar from './parts/UserNavbar';
import { useEffect, useState } from 'react';
import axiosClient from './axios';

const DailyReport = () => {
  const { year, month, day } = useParams();
  const [loading, setIsLoading] = useState(false);
  const [error, setError]     = useState("");
  const [data, setData]       = useState([]);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const monthLabel = monthNames[parseInt(month) - 1] ?? month;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get(`/getDataByDay/${year}/${month}/${day}`);
        setData(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [year, month, day]);

  /* ── helpers ── */
  const avg = (key) => {
    const vals = data.map(d => parseFloat(d[key])).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  const statChips = [
    { label: 'Soil Temp', key: 'soil_temperature', unit: '°C', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-900',   dot: 'bg-amber-500'   },
    { label: 'Moisture',  key: 'soil_moisture',    unit: '%',  bg: 'bg-green-50',    border: 'border-green-200',   text: 'text-green-900',   dot: 'bg-green-600'   },
    { label: 'pH',        key: 'ph',               unit: '',   bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-900', dot: 'bg-emerald-600' },
    { label: 'EC',        key: 'electrical_conductivity', unit: '', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', dot: 'bg-indigo-500' },
  ];

  /* ── loading ── */
  if (loading) return (
    <div className="bg-[#f7f4ee] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-green-900/10 border-t-green-950 animate-spin mx-auto mb-4" />
        <p className="font-serif text-green-950 text-base">Loading report…</p>
      </div>
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div className="bg-[#f7f4ee] min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl px-10 py-8 text-center border border-red-100 shadow-md">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20" fill="#ef4444">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
        </div>
        <p className="text-red-800 font-semibold text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f7f4ee] min-h-screen flex">

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 fixed top-0 left-0 h-screen shadow-md z-40">
        <UserSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-60">

        {/* Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-10">

          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[2.5px] uppercase text-green-600 mb-1">Reports / Daily</p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-950">
                Sensor <span className="italic text-green-700">Report</span>
              </h1>
            </div>
            {/* Date badge */}
            <div className="flex items-center gap-2 bg-green-950 text-white text-sm px-4 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-white/60">{monthLabel}</span>
              <span className="font-serif font-bold text-base">{day}</span>
              <span className="text-white/40">,</span>
              <span className="text-white/60">{year}</span>
            </div>
          </div>

          {/* Stat chips */}
          {data.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {statChips.map(({ label, key, unit, bg, border, text, dot }) => (
                <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${bg} ${border} ${text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className="opacity-70">{label} avg:</span>
                  <strong>{avg(key)}{unit}</strong>
                </div>
              ))}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium bg-green-50 border-green-200 text-green-900">
                <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                <span className="opacity-70">Records:</span>
                <strong>{data.length}</strong>
              </div>
            </div>
          )}

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-green-900/10 shadow-md overflow-hidden">

            {/* Card header */}
            <div className="bg-green-950 px-6 py-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-white/45">Sensor Readings</span>
              <span className="text-xs text-white/45">
                <span className="font-serif font-bold text-amber-400 text-base">{data.length}</span>
                {' '}{data.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-green-900/10 bg-green-950/[0.025]">
                    {['Crop','Soil Temp','Moisture','pH','EC','NPK'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold tracking-[2px] uppercase text-green-950/45 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-green-900/8 hover:bg-green-950/[0.02] transition-colors ${index % 2 === 1 ? 'bg-green-950/[0.015]' : ''}`}
                    >
                      {/* Crop */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#2e8b57">
                              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s3 2.5 4 5c-5-2.5-8-4-8-4S8 10 8 12s2.5 5.5 5 7"/>
                            </svg>
                          </div>
                          <span className="font-semibold text-green-950 text-sm">{item.crop?.name ?? '—'}</span>
                        </div>
                      </td>

                      {/* Soil Temp */}
                      <td className="px-5 py-3.5">
                        {item.soil_temperature != null
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-xs font-medium border border-amber-100">{item.soil_temperature}°C</span>
                          : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Moisture */}
                      <td className="px-5 py-3.5">
                        {item.soil_moisture != null
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-800 text-xs font-medium border border-green-100">{item.soil_moisture}%</span>
                          : <span className="text-slate-300">—</span>}
                      </td>

                      {/* pH */}
                      <td className="px-5 py-3.5">
                        {item.ph != null
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">{item.ph}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>

                      {/* EC */}
                      <td className="px-5 py-3.5">
                        {item.electrical_conductivity != null
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-100">{item.electrical_conductivity}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>

                      {/* NPK */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          {[['N', item.nitrogen], ['P', item.phosphorus], ['K', item.potassium]].map(([label, val]) => (
                            <span key={label} className="px-2 py-0.5 rounded bg-green-950/8 text-green-950 text-xs font-semibold">
                              <span className="opacity-40 font-normal">{label} </span>{val ?? '—'}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {data.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-green-950/6 flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <p className="font-serif text-lg font-bold text-green-950 mb-1">No data for this date</p>
                        <p className="text-sm text-slate-400">No sensor readings were recorded on {monthLabel} {day}, {year}.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <UserSidebar />
      </div>
    </div>
  );
};

export default DailyReport;
