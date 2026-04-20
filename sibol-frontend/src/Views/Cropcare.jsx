import React, { useEffect, useState } from 'react';
import UserNavbar from './parts/UserNavbar';
import Pic from '../assets/first_image.png';
import axiosClient from './axios';
import { useNavigate } from 'react-router-dom';

const Cropcare = () => {
  const [isModalOpen,       setModalOpen]       = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gardenToDelete,    setGardenToDelete]  = useState(null);
  const [error,             setError]           = useState('');
  const [loading,           setLoading]         = useState(false);
  const [deleteLoading,     setDeleteLoading]   = useState(false);
  const [locationLoading,   setLocationLoading] = useState(false);
  const [garden,            setGarden]          = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({ garden_name: '', location: '' });

  const handleChange      = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleModal       = () => setModalOpen(true);
  const closeModal        = () => { setModalOpen(false); setError(''); };
  const openDeleteModal   = (id, name) => { setGardenToDelete({ id, name }); setDeleteModalOpen(true); };
  const closeDeleteModal  = () => { setDeleteModalOpen(false); setGardenToDelete(null); setError(''); };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');
    if (!navigator.geolocation) { setError('Geolocation is not supported by your browser'); setLocationLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const street    = data.localityInfo?.administrative?.[0]?.name || '';
          const barangay  = data.locality || '';
          const city      = data.city || data.principalSubdivision || '';
          const addr = street && city ? `${street}, ${city}`
            : barangay && city ? `${barangay}, ${city}`
            : street || barangay || city || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          setForm(f => ({ ...f, location: addr }));
        } catch {
          setForm(f => ({ ...f, location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}` }));
        } finally { setLocationLoading(false); }
      },
      (err) => {
        const msgs = {
          [err.PERMISSION_DENIED]:   'Location access denied.',
          [err.POSITION_UNAVAILABLE]: 'Location information unavailable.',
          [err.TIMEOUT]:             'Location request timed out.',
        };
        setError(msgs[err.code] || 'An unknown error occurred.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchGarden = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/getGardenData');
      setGarden(Array.isArray(res.data) ? res.data : []);
    } catch { setError('Failed to fetch data!'); }
    finally  { setLoading(false); }
  };

  useEffect(() => {
    fetchGarden();
    const id = setInterval(fetchGarden, 30000);
    return () => clearInterval(id);
  }, []);

  const addGarden = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.garden_name || !form.location) { setError('All fields are required!'); return; }
    setLoading(true);
    try {
      await axiosClient.post('/addGarden', form);
      setForm({ garden_name: '', location: '' });
      setModalOpen(false);
      fetchGarden();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add garden';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  const deleteGarden = async () => {
    if (!gardenToDelete) return;
    setDeleteLoading(true);
    setError('');
    try {
      await axiosClient.delete(`/deleteGarden/${gardenToDelete.id}`);
      closeDeleteModal();
      fetchGarden();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete garden';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setDeleteLoading(false); }
  };

  const goGarden = (id) => navigate(`/user/crop-care/${encodeURIComponent(id)}`);

  /* ── Spinner SVG ── */
  const Spinner = ({ color = 'white', size = 15 }) => (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );

  /* ── Error alert ── */
  const ErrorAlert = ({ msg }) => (
    <div className="flex items-start gap-2.5 px-4 py-3 mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px]">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{msg}</span>
    </div>
  );

  /* ── Close X ── */
  const CloseX = ({ onClick }) => (
    <button onClick={onClick} className="w-[34px] h-[34px] rounded-full border border-black/10 bg-transparent flex items-center justify-center hover:bg-gray-100 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );

  return (
    <div className="bg-[#f7f4ee] min-h-screen font-['DM_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* Content */}
      <div className="px-6 md:px-10 py-8 pb-24 md:pb-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-7 border-b border-[#0b3d1e]/10 mb-7">
          <div>
            <h1 className="font-['Playfair_Display',serif] text-[clamp(22px,3vw,34px)] font-bold text-[#0b3d1e] leading-tight">
              Your <em className="italic text-[#2e8b57]">Gardens</em>
            </h1>
            <p className="text-[13px] text-[#5a6472] mt-1">Select a garden to begin monitoring crop health.</p>
          </div>
          <button
            id="coach-add-garden-btn"
            onClick={handleModal}
            className="inline-flex items-center gap-2 px-5 py-[11px] rounded-full bg-[#0b3d1e] text-white text-[13px] font-medium whitespace-nowrap shrink-0 hover:bg-[#1a6636] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0b3d1e]/25 transition-all duration-200"
          >
            <span className="w-[18px] h-[18px] rounded-full bg-[#d4840a] flex items-center justify-center text-sm font-light leading-none">+</span>
            New Garden
          </button>
        </div>

        {/* Garden Grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))' }}>
          {loading && garden.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#0b3d1e]/[0.06] flex items-center justify-center mb-5">
                <Spinner color="#2e8b57" size={36} />
              </div>
              <p className="font-['Playfair_Display',serif] text-[22px] text-[#0b3d1e]">Loading gardens…</p>
            </div>
          ) : garden.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-[#0b3d1e]/[0.06] flex items-center justify-center text-4xl mb-5">🌱</div>
              <p className="font-['Playfair_Display',serif] text-[22px] text-[#0b3d1e] mb-2">No gardens yet</p>
              <p className="text-[14px] text-[#5a6472] max-w-[280px] leading-relaxed">Create your first garden to start monitoring crop health in real time.</p>
            </div>
          ) : (
            garden.map((gard) => (
              <div
                key={gard.id}
                className="group bg-white rounded-[18px] overflow-hidden border border-black/[0.05] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#0b3d1e]/12 cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-[180px]">
                  <img
                    src={Pic}
                    alt={gard.name || gard.garden_name || 'Garden'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(11,61,30,0.35)] pointer-events-none" />
                </div>

                {/* Card body */}
                <div className="flex items-center justify-between px-[18px] py-4 border-t border-black/[0.04]">
                  <span className="font-['Playfair_Display',serif] text-[17px] font-bold text-[#0b3d1e] truncate max-w-[180px]">
                    {gard.name || gard.garden_name || 'Unnamed Garden'}
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Open */}
                    <button
                      onClick={() => goGarden(gard.id)}
                      disabled={loading}
                      title="Open garden"
                      className="w-9 h-9 rounded-[10px] border border-black/[0.07] flex items-center justify-center transition-all hover:bg-[#f0fdf4] hover:border-[#2e8b57]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 512 512" fill="none">
                        <path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"/>
                        <path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="m272 336l80-80l-80-80M48 256h288"/>
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => openDeleteModal(gard.id, gard.name || gard.garden_name || 'Unnamed Garden')}
                      title="Delete garden"
                      className="w-9 h-9 rounded-[10px] border border-black/[0.07] flex items-center justify-center transition-all hover:bg-red-50 hover:border-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ADD GARDEN MODAL ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-[fadeIn_0.25s_ease-out]"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-[22px] w-full max-w-[440px] shadow-2xl overflow-hidden animate-[modalIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            <style>{`
              @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
              @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-[22px] border-b border-black/[0.06]">
              <span className="font-['Playfair_Display',serif] text-[22px] font-bold text-[#0b3d1e]">New Garden</span>
              <CloseX onClick={closeModal} />
            </div>

            {error && <ErrorAlert msg={error} />}

            {/* Form */}
            <div className="px-6 py-6 flex flex-col gap-[18px]">
              <div>
                <label className="block text-[12px] font-medium tracking-wide uppercase text-[#5a6472] mb-1.5">Garden name</label>
                <input
                  type="text" name="garden_name" value={form.garden_name} onChange={handleChange}
                  placeholder="e.g. North Field, Rooftop Plot…"
                  className="w-full px-3.5 py-[11px] border-[1.5px] border-black/10 rounded-xl bg-[#f7f4ee] text-[14px] text-[#0b3d1e] outline-none placeholder:text-[#5a6472]/50 focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/12 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium tracking-wide uppercase text-[#5a6472] mb-1.5">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text" name="location" value={form.location} onChange={handleChange}
                    placeholder="Enter address or use GPS"
                    className="flex-1 px-3.5 py-[11px] border-[1.5px] border-black/10 rounded-xl bg-[#f7f4ee] text-[14px] text-[#0b3d1e] outline-none placeholder:text-[#5a6472]/50 focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/12 focus:bg-white transition-all"
                  />
                  <button
                    type="button" onClick={getCurrentLocation} disabled={locationLoading}
                    title="Use current location"
                    className="w-11 h-11 rounded-xl bg-[#0b3d1e] flex items-center justify-center shrink-0 hover:bg-[#1a6636] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {locationLoading ? <Spinner /> : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#5a6472]/60 mt-1">Tap the pin icon to auto-fill with your current location.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-black/[0.05]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-full border-[1.5px] border-black/12 text-[#5a6472] text-[13px] font-medium hover:bg-gray-100 transition-colors">Cancel</button>
              <button
                onClick={addGarden} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0b3d1e] text-white text-[13px] font-medium hover:bg-[#1a6636] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <><Spinner /> Saving…</> : 'Save Garden'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && closeDeleteModal()}
        >
          <div className="bg-white rounded-[22px] w-full max-w-[440px] shadow-2xl overflow-hidden animate-[modalIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-[22px] border-b border-black/[0.06]">
              <span className="font-['Playfair_Display',serif] text-[22px] font-bold text-red-600">Delete Garden</span>
              <CloseX onClick={closeDeleteModal} />
            </div>

            {error && <ErrorAlert msg={error} />}

            {/* Body */}
            <div className="px-6 py-7 text-center">
              <div className="w-[72px] h-[72px] rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-[30px] mx-auto mb-[18px]">🗑️</div>
              <p className="text-[14px] text-[#5a6472] leading-relaxed">You are about to permanently delete</p>
              <p className="font-['Playfair_Display',serif] text-[18px] font-bold text-[#0b3d1e] my-2">"{gardenToDelete?.name || 'this garden'}"</p>
              <p className="text-[14px] text-[#5a6472] leading-relaxed">All sensor data and records linked to this garden will be lost.</p>
              <p className="text-[12px] text-gray-400 mt-2">This action cannot be undone.</p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-black/[0.05]">
              <button onClick={closeDeleteModal} disabled={deleteLoading} className="px-5 py-2.5 rounded-full border-[1.5px] border-black/12 text-[#5a6472] text-[13px] font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors">Cancel</button>
              <button
                onClick={deleteGarden} disabled={deleteLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? <><Spinner /> Deleting…</> : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cropcare;
