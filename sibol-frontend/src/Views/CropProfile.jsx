import React, { useState, useEffect } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios'

const CropProfile = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState('');

  useEffect(() => {
    const fetchUserCrops = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get('/user/crop-profile');
        setCrops(response.data);
        console.log(response.data);
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

  // Updated columns: merged temperature+humidity into air/humidity, added soil temperature & soil moisture
  const colMeta = [
    { label: 'Soil Temperature', key: 'soil_temp', badge: 'bg-amber-50 text-amber-800 border border-amber-100' },
    { label: 'Soil Moisture',    key: 'moisture',    badge: 'bg-sky-50 text-sky-800 border border-sky-100' },
    { label: 'PH',               key: 'soilPH',          badge: 'bg-emerald-50 text-emerald-800 border border-emerald-100' },
    { label: 'NPK',              key: 'npk',             badge: 'bg-green-50 text-green-800 border border-green-100' },
    { label: 'EC',               key: 'ec',              badge: 'bg-indigo-50 text-indigo-800 border border-indigo-100' },
    { label: 'Air/Humidity',     key: 'humidity',        badge: 'bg-teal-50 text-teal-800 border border-teal-100' },
  ];

  const filteredCrops = crops.filter(crop =>
    crop.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f7f4ee] min-h-screen flex">

      <div className="flex-1 flex flex-col">

        {/* Content */}
        <div className="px-4 sm:px-8 lg:px-16 py-10 pb-24 md:pb-12 flex flex-col">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-950">
              Crop <span className="italic text-amber-500">Profile</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">List of all available crops.</p>
            <div className="mt-4 border-b border-gray-200" />
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 rounded-full border-[3px] border-green-900/10 border-t-green-950 animate-spin" />
              <p className="font-serif text-green-950 text-base">Loading crop profiles…</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-red-100 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-serif text-lg font-bold text-red-800 mb-1">Error loading crops</p>
              <p className="text-sm text-red-400 mb-5">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-green-950 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-all"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Main Table Area (show even if empty, to display the table shell) ── */}
          {!loading && !error && (
            <>
              {/* Search + Filter row */}
              <div className="flex items-center justify-end gap-2 mb-4">
                {/* Search */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400 w-32"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                  <select
                    value={filterBy}
                    onChange={e => setFilterBy(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-500 cursor-pointer"
                  >
                    <option value="">Filter by</option>
                    {colMeta.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-green-900/10 shadow-sm overflow-hidden">

                {/* Table dark header */}
                <div className="bg-green-950 px-6 py-4 flex items-center justify-between">
                  <span className="text-[20px] font-semibold tracking-[2.5px] uppercase text-white/50">Optimal Conditions</span>
                  <span className="text-[20px] text-white/50 font-serif">
                    <span className="italic text-white/70">{filteredCrops.length}</span>
                    {' '}{filteredCrops.length === 1 ? 'crop' : 'crops'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-green-900/10 bg-green-950/[0.02]">
                        <th className="px-6 py-3.5 text-[14px] font-semibold tracking-[2px] uppercase text-green-950/45 whitespace-nowrap">
                          Crop
                        </th>
                        {colMeta.map(c => (
                          <th key={c.key} className="px-5 py-3.5 text-[12px] font-semibold tracking-[2px] uppercase text-green-950/45 whitespace-nowrap text-center">
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCrops.length === 0 ? (
                        <tr>
                          <td colSpan={colMeta.length + 1} className="py-24 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                                </svg>
                              </div>
                              <p className="text-sm font-semibold text-gray-500">No crop available</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCrops.map((crop, index) => (
                          <tr
                            key={crop.id}
                            className={`border-b border-green-900/8 hover:bg-green-950/[0.02] transition-colors ${index % 2 === 1 ? 'bg-green-950/[0.012]' : ''}`}
                          >
                            {/* Crop name */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#2e8b57">
                                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s3 2.5 4 5c-5-2.5-8-4-8-4S8 10 8 12s2.5 5.5 5 7"/>
                                  </svg>
                                </div>
                                <span className="font-semibold text-green-950 text-sm">{crop.name}</span>
                              </div>
                            </td>

                            {/* Value cells */}
                            {colMeta.map(c => (
                              <td key={c.key} className="px-5 py-4 text-center">
                                {crop[c.key] != null
                                  ? <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${c.badge}`}>{crop[c.key]}</span>
                                  : <span className="text-slate-300 text-xs">—</span>
                                }
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredCrops.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-green-900/10 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No crop available</p>
                  </div>
                ) : (
                  filteredCrops.map((crop) => (
                    <div key={crop.id} className="bg-white rounded-2xl border border-green-900/10 shadow-sm overflow-hidden">
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
                      <div className="p-4 space-y-0">
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
                  ))
                )}
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
