import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from './parts/UserNavbar';
import { useEffect, useState } from 'react';
import axiosClient from './axios';
import { ArrowLeft, Loader2, FileX } from 'lucide-react';

const DailyReport = () => {
  const { year, month, day } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthName = monthNames[(parseInt(month) - 1)] ?? '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/getDataByDay/${year}/${month}/${day}`);
        setData(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month, day]);

  return (
    <div className="bg-[#f7f4ee] min-h-screen font-['DM_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Content */}
      <div className="px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-10">

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-[#2e8b57] mb-1">Reports</p>
            <h1 className="font-['Playfair_Display',serif] text-3xl md:text-4xl font-bold text-[#0b3d1e]">
              Daily <em className="italic text-[#2e8b57]">Report</em>
            </h1>
          </div>
          <button
            onClick={() => navigate('/user/report')}
            className="flex items-center gap-1.5 text-[#0b3d1e]/50 hover:text-[#0b3d1e] text-xs font-medium transition-colors mt-1"
          >
            <ArrowLeft size={14} />
            Back to Calendar
          </button>
        </div>

        {/* Report card */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden max-w-5xl">

          {/* Card header */}
          <div className="bg-[#0b3d1e] px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium tracking-[2px] uppercase text-white/30 mb-0.5">Daily View</p>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-white">
                {monthName}{' '}
                <em className="italic text-[#f0a830]">{day}</em>
                <span className="text-white/50 text-lg">, {year}</span>
              </h2>
            </div>
            {/* Record count badge */}
            {!loading && !error && (
              <div className="bg-white/[0.08] border border-white/10 rounded-xl px-4 py-2 text-center">
                <p className="text-[9px] font-medium tracking-[1.5px] uppercase text-white/30 mb-0.5">Records</p>
                <p className="font-['Playfair_Display',serif] text-xl font-bold text-[#f0a830]">{data.length}</p>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-5">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-7 h-7 text-[#2e8b57] animate-spin" />
                <p className="text-[#0b3d1e]/40 text-sm font-medium">Loading report data…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <FileX className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="overflow-x-auto rounded-xl border border-black/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0b3d1e]/[0.03] border-b border-black/5">
                      {['Crop','Soil Temp','Moisture','pH','EC','N','P','K'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-[#0b3d1e]/40 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-black/[0.04] transition-colors hover:bg-[#0b3d1e]/[0.02] ${index % 2 !== 0 ? 'bg-[#f7f4ee]/60' : ''}`}
                      >
                        <td className="px-4 py-3.5 font-semibold text-[#0b3d1e] whitespace-nowrap">
                          {item.crop?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[#0b3d1e]/60 whitespace-nowrap">
                          {item.soil_temperature != null ? <><span className="text-[#0b3d1e]">{item.soil_temperature}</span> °C</> : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[#0b3d1e]/60 whitespace-nowrap">
                          {item.soil_moisture != null ? <><span className="text-[#0b3d1e]">{item.soil_moisture}</span> %</> : '—'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {item.ph != null ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${
                              item.ph < 6 ? 'bg-amber-50 text-amber-700' :
                              item.ph > 7.5 ? 'bg-blue-50 text-blue-700' :
                              'bg-[#2e8b57]/10 text-[#2e8b57]'
                            }`}>
                              {item.ph}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[#0b3d1e]/60 whitespace-nowrap">
                          {item.electrical_conductivity ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[#0b3d1e]/60 whitespace-nowrap">{item.nitrogen ?? '—'}</td>
                        <td className="px-4 py-3.5 text-[#0b3d1e]/60 whitespace-nowrap">{item.phosphorus ?? '—'}</td>
                        <td className="px-4 py-3.5 text-[#0b3d1e]/60 whitespace-nowrap">{item.potassium ?? '—'}</td>
                      </tr>
                    ))}

                    {data.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#0b3d1e]/[0.04] flex items-center justify-center">
                              <FileX className="w-6 h-6 text-[#0b3d1e]/20" />
                            </div>
                            <p className="text-[#0b3d1e]/40 text-sm font-medium">No data found for this date</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer legend */}
          {!loading && !error && data.length > 0 && (
            <div className="border-t border-black/5 px-5 py-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#2e8b57]/10 text-[#2e8b57]">6.5</span>
                <span className="text-[11px] text-[#0b3d1e]/40">Neutral pH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">5.5</span>
                <span className="text-[11px] text-[#0b3d1e]/40">Acidic pH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">8.0</span>
                <span className="text-[11px] text-[#0b3d1e]/40">Alkaline pH</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
