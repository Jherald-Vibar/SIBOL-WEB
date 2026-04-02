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

  const colMeta = [
    { label: 'Temperature', key: 'temperature', badge: 'bg-amber-50 text-amber-800 border border-amber-100' },
    { label: 'Humidity',    key: 'humidity',    badge: 'bg-sky-50 text-sky-800 border border-sky-100' },
    { label: 'Soil pH',     key: 'soilPH',      badge: 'bg-emerald-50 text-emerald-800 border border-emerald-100' },
    { label: 'EC',          key: 'ec',           badge: 'bg-indigo-50 text-indigo-800 border border-indigo-100' },
    { label: 'NPK',         key: 'npk',          badge: 'bg-green-50 text-green-800 border border-green-100' },
  ];

  return (
    <div className="bg-[#f7f4ee] min-h-screen flex">

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-60 fixed top-0 left-0 h-screen shadow-md z-40">
        <UserSidebar />
      </div>

      <div className="flex-1 flex flex-col md:ml-60">
        {/* Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-10">

          {/* Page header */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-[2.5px] uppercase text-green-600 mb-1">Crops</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-950">
              Crop <span className="italic text-green-700">Profile</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? 'Loading your crops…' : `${crops.length} crop${crops.length !== 1 ? 's' : ''} in your profile`}
            </p>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 rounded-full border-[3px] border-green-900/10 border-t-green-950 animate-spin" />
              <p className="font-serif text-green-950 text-base">Loading crop profiles…</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-red-100 shadow-md">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-serif text-lg font-bold text-red-800 mb-1">Error loading crops</p>
              <p className="text-sm text-red-400 mb-5">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-green-950 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/20"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && crops.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-green-900/10 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-green-950/6 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s3 2.5 4 5c-5-2.5-8-4-8-4S8 10 8 12s2.5 5.5 5 7" />
                </svg>
              </div>
              <p className="font-serif text-lg font-bold text-green-950 mb-1">No crops found</p>
              <p className="text-sm text-slate-400">Add crops to see their profiles here</p>
            </div>
          )}

          {/* ── Data ── */}
          {!loading && !error && crops.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-green-900/10 shadow-md overflow-hidden">

                {/* Table dark header */}
                <div className="bg-green-950 px-6 py-4 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-white/45">Optimal Conditions</span>
                  <span className="text-xs text-white/40">
                    <span className="font-serif font-bold text-amber-400 text-base">{crops.length}</span>
                    {' '}{crops.length === 1 ? 'crop' : 'crops'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-green-900/10 bg-green-950/[0.025]">
                        <th className="px-6 py-3.5 text-[10px] font-semibold tracking-[2px] uppercase text-green-950/45 whitespace-nowrap border-r border-green-900/10">
                          Crop Name
                        </th>
                        {colMeta.map(c => (
                          <th key={c.key} className="px-5 py-3.5 text-[10px] font-semibold tracking-[2px] uppercase text-green-950/45 whitespace-nowrap text-center">
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {crops.map((crop, index) => (
                        <tr
                          key={crop.id}
                          className={`border-b border-green-900/8 hover:bg-green-950/[0.02] transition-colors ${index % 2 === 1 ? 'bg-green-950/[0.015]' : ''}`}
                        >
                          {/* Crop name */}
                          <td className="px-6 py-4 border-r border-green-900/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#2e8b57">
                                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s3 2.5 4 5c-5-2.5-8-4-8-4S8 10 8 12s2.5 5.5 5 7"/>
                                </svg>
                              </div>
                              <span className="font-semibold text-green-950">{crop.name}</span>
                            </div>
                          </td>

                          {/* Value cells */}
                          {colMeta.map(c => (
                            <td key={c.key} className="px-5 py-4 text-center">
                              {crop[c.key] != null
                                ? <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${c.badge}`}>{crop[c.key]}</span>
                                : <span className="text-slate-300">—</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {crops.map((crop) => (
                  <div key={crop.id} className="bg-white rounded-2xl border border-green-900/10 shadow-md overflow-hidden">
                    {/* Card header */}
                    <div className="bg-green-950 px-5 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#a8c5a0">
                          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s3 2.5 4 5c-5-2.5-8-4-8-4S8 10 8 12s2.5 5.5 5 7"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[1.5px] uppercase text-white/40 font-medium">Crop</p>
                        <h3 className="font-serif font-bold text-white text-base">{crop.name}</h3>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-2">
                      {colMeta.map((c, i) => (
                        <div key={c.key} className={`flex justify-between items-center py-2.5 ${i < colMeta.length - 1 ? 'border-b border-green-900/8' : ''}`}>
                          <span className="text-xs font-semibold text-green-950/50 uppercase tracking-wide">{c.label}</span>
                          {crop[c.key] != null
                            ? <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${c.badge}`}>{crop[c.key]}</span>
                            : <span className="text-slate-300 text-sm">—</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <UserSidebar />
      </div>
    </div>
  )
}

export default CropProfile
