import React, { useEffect, useState, useRef } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "./axios";

/* ─────────────────────────────────────────────
   CLAIM DEVICE MODAL
───────────────────────────────────────────── */
const ClaimDeviceModal = ({ onClose, onClaim, loading }) => {
  const [espId, setEspId] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = espId.trim();
    if (!trimmed) { setError("Please enter your ESP Device ID."); return; }
    setError("");
    onClaim(trimmed);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm z-50 p-4">
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-in { animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div className="modal-in bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-green-950 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <rect x="9" y="9" width="6" height="6"/>
              <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
            </svg>
            <span className="font-['Playfair_Display',serif] text-xl font-bold text-white">Claim Device</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/25 bg-transparent text-white cursor-pointer flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* Illustration */}
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M6 12h.01M18 12h.01"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
              Enter the <strong className="text-green-950">Device ID</strong> printed on your ESP32 board or provided in your device package.
            </p>
          </div>

          {/* Input */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-gray-400 mb-1.5">
              ESP Device ID
            </label>
            <input
              ref={inputRef}
              type="text"
              value={espId}
              onChange={e => { setEspId(e.target.value); setError(""); }}
              placeholder="e.g. ESP-A1B2C3D4"
              className="w-full px-4 py-3 border-2 border-black/10 rounded-xl font-mono text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all focus:border-green-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,139,87,0.12)]"
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </p>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-blue-800 mb-1.5">📍 Where to find your Device ID?</p>
            <ul className="text-xs text-gray-600 leading-relaxed space-y-0.5 list-disc pl-4">
              <li>Printed on a sticker on your ESP32 board</li>
              <li>Inside your device packaging</li>
              <li>In the SIBOL setup sheet included in the box</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold border-2 border-green-950 bg-transparent text-green-950 cursor-pointer hover:bg-green-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !espId.trim()}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold border-none text-white transition-all bg-green-950 hover:bg-green-800 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Claiming…
                </>
              ) : 'Claim Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SPIN ICON
───────────────────────────────────────────── */
const SpinIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const CropCareConfig = () => {
  const { garden_id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name:"", variety:"", planted_date:"", image:null });
  const [crops, setCrop] = useState([]);
  const [esp, setEsp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [deleteEspConfirm, setDeleteEspConfirm] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const addCrop = async (e) => {
    e.preventDefault();
    if (!form.name||!form.variety||!form.planted_date) { setError("All fields are required!"); return; }
    setIsLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name); fd.append("variety", form.variety);
      fd.append("planted_date", new Date(form.planted_date).toISOString().split("T")[0]);
      if (form.image) fd.append("image", form.image);
      const res = await axiosClient.post(`/addCrop/${garden_id}`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      setModalOpen(false); setForm({name:"",variety:"",planted_date:"",image:null}); setImagePreview(null);
      setCrop(prev => [...prev, res.data.data]);
    } catch(err) {
      setError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : err.response?.data?.message||"Something went wrong!");
    } finally { setIsLoading(false); }
  };

  const editCrop = (crop) => {
    setEditingCrop(crop.id);
    let d = ""; try{ d = new Date(crop.planted_at).toISOString().split("T")[0]; }catch{}
    setForm({name:crop.name||"", variety:crop.variety||"", planted_date:d, image:null});
    setImagePreview(crop.image); setModalOpen(true);
  };

  const updateCrop = async (e) => {
    e.preventDefault();
    if (!form.name||!form.variety||!form.planted_date) { setError("All fields are required!"); return; }
    setIsLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("_method","PUT"); fd.append("name",form.name); fd.append("variety",form.variety);
      fd.append("planted_date", new Date(form.planted_date).toISOString().split("T")[0]);
      if (form.image instanceof File) fd.append("image", form.image);
      const res = await axiosClient.post(`/updateCrop/${editingCrop}`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      setCrop(prev => prev.map(c => c.id===editingCrop ? res.data.data : c)); closeModal();
    } catch(err) {
      setError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : err.response?.data?.message||"Something went wrong!");
    } finally { setIsLoading(false); }
  };

  const deleteCrop = async (cropId) => {
    setIsLoading(true); setError("");
    try {
      await axiosClient.delete(`/deleteCrop/${cropId}`);
      setCrop(prev => prev.filter(c => c.id !== cropId)); setDeleteConfirm(null);
    } catch(err) {
      setError(err.response?.data?.message||"Something went wrong!");
    } finally { setIsLoading(false); }
  };

  const deleteEsp = async () => {
    setIsLoading(true);
    try { await axiosClient.delete(`/deleteEsp/${esp.id}`); setEsp(null); setDeleteEspConfirm(false); }
    catch(err) { setError(err.response?.data?.message||"Something went wrong!"); }
    finally { setIsLoading(false); }
  };

  const handleModal = () => { setEditingCrop(null); setForm({name:"",variety:"",planted_date:"",image:null}); setImagePreview(null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingCrop(null); setForm({name:"",variety:"",planted_date:"",image:null}); setImagePreview(null); setError(""); };

  // ── Claim device by ESP ID ──
  const handleClaim = async (espId) => {
    setIsLoading(true); setError("");
    try {
      const res = await axiosClient.post(`/claimDevice/${garden_id}`, { "esp-number": espId });
      setDeviceInfo(res.data.device);
      setShowClaimModal(false);
      setShowDeviceModal(true);
      fetchEsp();
    } catch(err) {
      setError(err.response?.data?.message || "Device not found or already claimed. Check your Device ID and try again.");
    } finally { setIsLoading(false); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };
  const fetchEsp = async () => { try{ const r = await axiosClient.get(`/getEsp/${garden_id}`); setEsp(r.data.data); }catch{ setEsp(null); } };

  useEffect(() => {
    const fetchCrops = async () => {
      setIsLoading(true);
      try{ const r = await axiosClient.get(`getCropData/${garden_id}`); setCrop(r.data.data); }
      catch(err){ setError(err.response?.data?.message||"Something Went Wrong!"); }
      finally{ setIsLoading(false); }
    };
    fetchCrops(); fetchEsp();
  }, [garden_id]);

  useEffect(() => {
    fetchEsp();
    const interval = setInterval(fetchEsp, 5000);
    return () => clearInterval(interval);
  }, [garden_id]);

  const handleNextPage = (crop_name) => navigate(`/user/crop-care/${garden_id}/${crop_name}`);
  const isEspOnline = esp?.status === 'active' || esp?.status === 'online';

  return (
    <div className="bg-[#f7f4ee] min-h-screen flex font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-in { animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .crop-card:hover { transform: translateY(-5px); box-shadow: 0 18px 38px rgba(11,61,30,0.11); }
        .crop-card:hover .crop-img { transform: scale(1.05); }
        .form-input:focus { border-color: #2e8b57; box-shadow: 0 0 0 3px rgba(46,139,87,0.12); background: #fff; }
      `}</style>

      {/* Main */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <div className="px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-12">

          {/* Page Header */}
          <div className="flex items-end justify-between pb-6 border-b border-green-950/10 mb-7 flex-wrap gap-4">
            <div>
              <button
                onClick={() => navigate('/user/crop-care')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-950 transition-colors mb-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Crop Care
              </button>
              <h1 className="font-['Playfair_Display',serif] text-3xl md:text-4xl font-bold text-green-950 leading-tight">
                Your <em className="italic text-green-700">Crops</em>
              </h1>
              <p className="text-sm text-[#5a6472] mt-1">Manage the crops you're monitoring in this garden.</p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {!esp && (
                <button
                  onClick={() => setShowClaimModal(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent text-green-950 border-2 border-green-950 rounded-full text-sm font-medium cursor-pointer hover:bg-green-50 transition-all whitespace-nowrap disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <rect x="9" y="9" width="6" height="6"/>
                    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
                  </svg>
                  Claim Device
                </button>
              )}
              <button onClick={handleModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-950 text-white border-none rounded-full text-sm font-medium cursor-pointer hover:bg-green-800 transition-all whitespace-nowrap">
                <span className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-sm leading-none">+</span>
                New Crop
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          {/* ESP Card */}
          {esp && (
            <div className={`mb-6 bg-white rounded-2xl p-5 border-2 transition-colors ${isEspOnline ? 'border-green-400' : 'border-red-300'}`}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                  </div>
                  <div>
                    <div className="font-['Playfair_Display',serif] text-lg font-bold text-green-950">{esp.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{esp.serial_number}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isEspOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {esp.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { label:'ESP ID', val: esp.serial_number||'—', mono: true },
                  { label:'Device Type', val: esp.device_type||'ESP32 Main', mono: false },
                  { label:'Last Seen', val: esp.last_seen_at ? new Date(esp.last_seen_at).toLocaleString() : 'Never', mono: false, small: true },
                ].map(({ label, val, mono, small }) => (
                  <div key={label} className="bg-[#f7f4ee] rounded-xl px-3.5 py-3">
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">{label}</div>
                    <div className={`font-medium text-green-950 break-all ${mono ? 'font-mono text-sm' : small ? 'text-xs' : 'text-sm'}`}>{val}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2.5 mt-4 flex-wrap">
                <button onClick={() => { setDeviceInfo({device_id:esp.serial_number}); setShowDeviceModal(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-transparent text-green-950 border-2 border-green-950 rounded-full font-medium cursor-pointer hover:bg-green-50 transition-all">
                  📋 View Credentials
                </button>
                <button onClick={() => setDeleteEspConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-red-600 text-white border-none rounded-full font-medium cursor-pointer hover:bg-red-700 transition-all">
                  Remove Device
                </button>
              </div>
            </div>
          )}

          {/* Crops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {crops.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-18 h-18 rounded-full bg-green-950/5 flex items-center justify-center text-4xl mb-4">🌿</div>
                <p className="font-['Playfair_Display',serif] text-xl text-green-950 mb-1.5">No crops yet</p>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">Add your first crop to start monitoring its health in real time.</p>
              </div>
            ) : crops.map(crop => (
              <div key={crop.id} className="crop-card bg-white rounded-2xl overflow-hidden border border-black/5 transition-all duration-300 cursor-pointer">
                <div className="overflow-hidden">
                  <img src={crop.image} alt={crop.name} className="crop-img w-full h-44 object-cover block transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <div className="font-['Playfair_Display',serif] text-base font-bold text-green-950 mb-0.5">{crop.name}</div>
                  <div className="text-xs text-gray-400 mb-1">{crop.variety}</div>
                  <div className="text-xs text-[#b0b7c3]">Planted {new Date(crop.planted_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>
                  <div className="flex justify-end gap-1.5 mt-3">
                    <button title="View" onClick={() => handleNextPage(crop.name)}
                      className="w-9 h-9 rounded-xl border border-black/8 bg-transparent flex items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-600 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" fill="none"><path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"/><path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="m272 336l80-80l-80-80M48 256h288"/></svg>
                    </button>
                    <button title="Edit" onClick={() => editCrop(crop)}
                      className="w-9 h-9 rounded-xl border border-black/8 bg-transparent flex items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-600 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3zM16 5l3 3"/></svg>
                    </button>
                    <button title="Delete" onClick={() => setDeleteConfirm(crop.id)}
                      className="w-9 h-9 rounded-xl border border-black/8 bg-transparent flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile bottom sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <UserSidebar />
      </div>

      {/* ── CLAIM DEVICE MODAL ── */}
      {showClaimModal && (
        <ClaimDeviceModal
          onClose={() => { setShowClaimModal(false); setError(""); }}
          onClaim={handleClaim}
          loading={loading}
        />
      )}

      {/* ── SHARED MODAL BACKDROP ── */}
      {(isModalOpen || deleteConfirm || deleteEspConfirm || showDeviceModal) && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) { closeModal(); setDeleteConfirm(null); setDeleteEspConfirm(false); setShowDeviceModal(false); } }}>

          {/* ── ADD / EDIT CROP ── */}
          {isModalOpen && (
            <div className="modal-in bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/6 sticky top-0 bg-white z-10">
                <span className="font-['Playfair_Display',serif] text-xl font-bold text-green-950">{editingCrop ? 'Edit Crop' : 'New Crop'}</span>
                <button onClick={closeModal} className="w-8 h-8 rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {error && <div className="flex items-start gap-2.5 mx-6 mt-4 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><span>{error}</span></div>}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-medium tracking-wide uppercase text-gray-400 mb-1.5">Crop Name</label>
                  <input className="form-input w-full px-3.5 py-2.5 border-2 border-black/10 rounded-xl font-['DM_Sans',sans-serif] text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all" type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Kamote, Pechay…" required />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wide uppercase text-gray-400 mb-1.5">Variety</label>
                  <div className="flex gap-4 border-2 border-black/10 rounded-xl px-4 py-3 bg-[#f7f4ee]">
                    {['Vegetable','Fruit'].map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-green-950" style={{ fontWeight: form.variety===v?600:400 }}>
                        <input type="radio" name="variety" value={v} checked={form.variety===v} onChange={handleChange} className="accent-green-700" />
                        {v === 'Vegetable' ? '🥬' : '🍓'} {v}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wide uppercase text-gray-400 mb-1.5">Crop Image</label>
                  <input className="form-input w-full px-3.5 py-2.5 border-2 border-black/10 rounded-xl text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all" type="file" name="image" accept="image/*" onChange={handleFileChange} />
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-black/6" />}
                <div>
                  <label className="block text-[11px] font-medium tracking-wide uppercase text-gray-400 mb-1.5">Planted Date</label>
                  <input className="form-input w-full px-3.5 py-2.5 border-2 border-black/10 rounded-xl font-['DM_Sans',sans-serif] text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all" type="date" name="planted_date" value={form.planted_date} onChange={handleChange} required />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-black/5">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-full border-2 border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={editingCrop ? updateCrop : addCrop} disabled={loading} className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-green-950 border-none text-white text-sm font-medium cursor-pointer hover:bg-green-800 transition-colors disabled:opacity-50">
                  {loading ? <><SpinIcon /> Saving…</> : editingCrop ? 'Update' : 'Save Crop'}
                </button>
              </div>
            </div>
          )}

          {/* ── DELETE CROP ── */}
          {deleteConfirm && (
            <div className="modal-in bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/6">
                <span className="font-['Playfair_Display',serif] text-xl font-bold text-red-600">Delete Crop</span>
                <button onClick={() => setDeleteConfirm(null)} className="w-8 h-8 rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-6 pt-7 pb-2 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4 text-3xl">🗑️</div>
                <p className="text-sm text-gray-500 leading-relaxed">You're about to permanently delete</p>
                <p className="font-['Playfair_Display',serif] text-lg text-green-950 font-bold my-2">"{crops.find(c=>c.id===deleteConfirm)?.name}"</p>
                <p className="text-xs text-gray-400">This action cannot be undone.</p>
              </div>
              <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-black/5">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-full border-2 border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50">Cancel</button>
                <button onClick={() => deleteCrop(deleteConfirm)} disabled={loading} className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-red-600 border-none text-white text-sm font-medium cursor-pointer hover:bg-red-700 disabled:opacity-50">
                  {loading ? <><SpinIcon/>Deleting…</> : 'Yes, delete'}
                </button>
              </div>
            </div>
          )}

          {/* ── DELETE ESP ── */}
          {deleteEspConfirm && (
            <div className="modal-in bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/6">
                <span className="font-['Playfair_Display',serif] text-xl font-bold text-red-600">Remove Device</span>
                <button onClick={() => setDeleteEspConfirm(false)} className="w-8 h-8 rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-6 pt-7 pb-2 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4 text-3xl">📡</div>
                <p className="text-sm text-gray-500">Remove device</p>
                <p className="font-['Playfair_Display',serif] text-lg text-green-950 font-bold my-2">"{esp?.serial_number}"</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">This will disconnect the device. Sensor data linked to it may be affected.</p>
              </div>
              <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-black/5">
                <button onClick={() => setDeleteEspConfirm(false)} className="px-5 py-2.5 rounded-full border-2 border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50">Cancel</button>
                <button onClick={deleteEsp} disabled={loading} className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-red-600 border-none text-white text-sm font-medium cursor-pointer hover:bg-red-700 disabled:opacity-50">
                  {loading ? <><SpinIcon/>Removing…</> : 'Remove'}
                </button>
              </div>
            </div>
          )}

          {/* ── DEVICE CREDENTIALS ── */}
          {showDeviceModal && deviceInfo && (
            <div className="modal-in bg-white rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 bg-green-950 rounded-t-2xl">
                <span className="font-['Playfair_Display',serif] text-xl font-bold text-white">🌿 Device Configuration</span>
                <button onClick={() => setShowDeviceModal(false)} className="w-8 h-8 rounded-full border border-white/25 bg-transparent text-white flex items-center justify-center cursor-pointer hover:bg-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="p-6">
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg px-3.5 py-3 mb-4 text-sm text-green-800">
                  Device claimed successfully! Use these credentials to configure your ESP32.
                </div>
                <label className="block text-[11px] font-medium tracking-wide uppercase text-gray-400 mb-1.5">Device ID</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={deviceInfo.device_id} readOnly className="flex-1 px-3.5 py-2.5 border-2 border-black/10 rounded-xl font-mono text-sm text-green-950 bg-[#f7f4ee] outline-none" />
                  <button onClick={() => copyToClipboard(deviceInfo.device_id)} className="px-4 py-2.5 bg-green-950 text-white border-none rounded-xl text-sm cursor-pointer hover:bg-green-800">📋</button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-blue-800 mb-2">📝 Setup Instructions</p>
                  <ol className="text-xs text-gray-700 leading-relaxed pl-4 space-y-0.5 list-decimal">
                    <li>Connect to WiFi: <strong>"Sibol-SmartGarden"</strong>, password: <strong>"sibol2025"</strong></li>
                    <li>Portal opens at <strong>192.168.4.1</strong> — click "Configure WiFi"</li>
                    <li>Enter your WiFi credentials and paste the Device ID above</li>
                    <li>Click "Save"</li>
                  </ol>
                </div>
                <button onClick={() => setShowDeviceModal(false)} className="w-full py-2.5 bg-green-950 text-white border-none rounded-full text-sm font-medium cursor-pointer hover:bg-green-800 transition-colors">
                  Done
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">⚠️ Save these credentials — you'll need them to configure your device.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropCareConfig;



