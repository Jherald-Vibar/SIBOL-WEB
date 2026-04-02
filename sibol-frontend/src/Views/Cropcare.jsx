import React, { useEffect, useState } from 'react';
import UserSidebar from './parts/UserSidebar';
import UserNavbar from './parts/UserNavbar';
import Pic from '../assets/first_image.png';
import axiosClient from './axios';
import { useNavigate } from 'react-router-dom';

const Cropcare = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gardenToDelete, setGardenToDelete] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [garden, setGarden] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({ garden_name: "", location: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleModal = () => setModalOpen(true);
  const closeModal = () => { setModalOpen(false); setError(""); };
  const openDeleteModal = (gardenId, gardenName) => {
    setGardenToDelete({ id: gardenId, name: gardenName });
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => { setDeleteModalOpen(false); setGardenToDelete(null); setError(""); };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError("");
    if (!navigator.geolocation) { setError("Geolocation is not supported by your browser"); setLocationLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          const street = data.localityInfo?.administrative?.[0]?.name || '';
          const barangay = data.locality || '';
          const city = data.city || data.principalSubdivision || '';
          let formattedAddress = street && city ? `${street}, ${city}` : barangay && city ? `${barangay}, ${city}` : street || barangay || city || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          setForm({ ...form, location: formattedAddress });
          setLocationLoading(false);
        } catch (err) {
          setForm({ ...form, location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}` });
          setLocationLoading(false);
        }
      },
      (error) => {
        const msgs = { [error.PERMISSION_DENIED]: "Location access denied. Please enable location permissions.", [error.POSITION_UNAVAILABLE]: "Location information unavailable.", [error.TIMEOUT]: "Location request timed out." };
        setError(msgs[error.code] || "An unknown error occurred.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchGarden = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/getGardenData");
      setGarden(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError("Failed to fetch data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarden();
    const interval = setInterval(fetchGarden, 30000);
    return () => clearInterval(interval);
  }, []);

  const addGarden = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.garden_name || !form.location) { setError("All fields are required!"); return; }
    setLoading(true);
    try {
      await axiosClient.post("/addGarden", form);
      setForm({ garden_name: "", location: "" });
      setModalOpen(false);
      fetchGarden();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to add garden";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const deleteGarden = async () => {
    if (!gardenToDelete) return;
    setDeleteLoading(true);
    setError("");
    try {
      await axiosClient.delete(`/deleteGarden/${gardenToDelete.id}`);
      closeDeleteModal();
      fetchGarden();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to delete garden";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setDeleteLoading(false);
    }
  };

  const goGarden = (gardenId) => navigate(`/user/crop-care/${encodeURIComponent(gardenId)}`);

  return (
    <div style={{ background: '#f7f4ee', minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --forest: #0b3d1e;
          --moss: #1a6636;
          --fern: #2e8b57;
          --cream: #f7f4ee;
          --amber: #d4840a;
          --amber-light: #f0a830;
          --white: #ffffff;
          --text-mid: #5a6472;
        }

        * { box-sizing: border-box; }

        .cc-body { font-family: 'DM Sans', sans-serif; }

        /* ── SIDEBAR ── */
        .cc-sidebar {
          width: 256px;
          background: var(--forest);
          position: fixed; top: 0; left: 0;
          height: 100vh; z-index: 40;
          box-shadow: 4px 0 20px rgba(11,61,30,0.15);
        }

        /* ── MAIN ── */
        .cc-main { flex: 1; display: flex; flex-direction: column; margin-left: 256px; padding-bottom: 0; }

        /* ── NAVBAR STRIP ── */
        .cc-navbar {
          background: var(--white);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          position: sticky; top: 0; z-index: 30;
        }

        /* ── PAGE BODY ── */
        .cc-content { flex: 1; padding: 32px 40px; }

        /* ── PAGE HEADER ── */
        .cc-page-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(11,61,30,0.1);
          margin-bottom: 28px;
        }
        .cc-page-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 700; color: var(--forest);
          line-height: 1.15;
        }
        .cc-page-title em { font-style: italic; color: var(--fern); }
        .cc-page-sub {
          font-size: 13px; color: var(--text-mid); margin-top: 4px;
        }

        /* ── CREATE BTN ── */
        .btn-create {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px;
          background: var(--forest); color: var(--white);
          border: none; border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.25s;
          white-space: nowrap; flex-shrink: 0;
        }
        .btn-create:hover { background: var(--moss); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(11,61,30,0.25); }
        .btn-create-plus {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--amber);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; line-height: 1; font-weight: 300;
        }

        /* ── GARDEN GRID ── */
        .garden-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        /* ── GARDEN CARD ── */
        .garden-card {
          background: var(--white);
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .garden-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(11,61,30,0.12); }

        .garden-card-img {
          width: 100%; height: 180px;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .garden-card:hover .garden-card-img { transform: scale(1.05); }
        .garden-card-img-wrap { overflow: hidden; position: relative; }
        .garden-card-img-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(11,61,30,0.35) 100%);
          pointer-events: none;
        }

        .garden-card-body {
          padding: 16px 18px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(0,0,0,0.04);
        }
        .garden-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700;
          color: var(--forest);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 180px;
        }
        .garden-card-actions { display: flex; align-items: center; gap: 4px; }
        .card-icon-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.07);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .card-icon-btn:hover { background: #f0fdf4; border-color: var(--fern); }
        .card-icon-btn.danger:hover { background: #fff1f2; border-color: #ef4444; }

        /* ── EMPTY STATE ── */
        .empty-state {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px 24px; text-align: center;
        }
        .empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(11,61,30,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin-bottom: 20px;
        }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; color: var(--forest); margin-bottom: 8px;
        }
        .empty-sub { font-size: 14px; color: var(--text-mid); max-width: 280px; line-height: 1.6; }

        /* ── MODAL BACKDROP ── */
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          z-index: 50;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: backdropIn 0.25s ease-out;
        }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── MODAL ── */
        .modal {
          background: var(--white);
          border-radius: 22px;
          width: 100%; max-width: 440px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.25);
          animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }
        @keyframes modalIn { from { opacity:0; transform:scale(0.9) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }

        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: var(--forest);
        }
        .modal-close {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .modal-close:hover { background: #f3f4f6; }

        /* ── FORM ── */
        .modal-form { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
        .form-label { font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-mid); margin-bottom: 6px; display: block; }
        .form-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: var(--forest); background: var(--cream);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus { border-color: var(--fern); box-shadow: 0 0 0 3px rgba(46,139,87,0.12); background: var(--white); }
        .form-input::placeholder { color: rgba(90,100,114,0.5); }

        .location-row { display: flex; gap: 8px; }
        .btn-locate {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--forest); border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .btn-locate:hover { background: var(--moss); }
        .btn-locate:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-hint { font-size: 11px; color: rgba(90,100,114,0.6); margin-top: 4px; }

        /* ── ERROR ALERT ── */
        .error-alert {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          font-size: 13px; color: #be123c;
          margin: 0 24px;
        }

        /* ── MODAL FOOTER ── */
        .modal-footer {
          display: flex; justify-content: flex-end; gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .btn-cancel {
          padding: 10px 20px; border-radius: 100px;
          border: 1.5px solid rgba(0,0,0,0.12);
          background: transparent; color: var(--text-mid);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-cancel:hover { background: #f3f4f6; }
        .btn-save {
          padding: 10px 24px; border-radius: 100px;
          background: var(--forest); border: none;
          color: var(--white);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 7px;
        }
        .btn-save:hover { background: var(--moss); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-delete-confirm {
          padding: 10px 24px; border-radius: 100px;
          background: #dc2626; border: none;
          color: var(--white);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 7px;
        }
        .btn-delete-confirm:hover { background: #b91c1c; }
        .btn-delete-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── DELETE MODAL ── */
        .delete-modal-body { padding: 28px 24px 8px; text-align: center; }
        .delete-icon-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: #fff1f2; border: 2px solid #fecdd3;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px; font-size: 30px;
        }
        .delete-modal-text { font-size: 14px; color: var(--text-mid); line-height: 1.6; }
        .delete-modal-name { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--forest); font-weight: 700; margin: 8px 0; }
        .delete-modal-warn { font-size: 12px; color: #9ca3af; margin-top: 8px; }

        /* ── SPINNER ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .cc-sidebar { display: none; }
          .cc-main { margin-left: 0; padding-bottom: 72px; }
          .cc-content { padding: 20px 16px; }
          .cc-page-header { flex-direction: column; align-items: flex-start; gap: 14px; }
          .cc-mobile-sidebar { display: block; position: fixed; bottom: 0; left: 0; right: 0; background: var(--white); z-index: 40; box-shadow: 0 -2px 12px rgba(0,0,0,0.08); }
        }
        @media (min-width: 769px) {
          .cc-mobile-sidebar { display: none; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="cc-sidebar">
        <UserSidebar />
      </div>

      {/* Main */}
      <div className="cc-main cc-body">
        {/* Navbar */}
        <div className="cc-navbar">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className="cc-content">

          {/* Page Header */}
          <div className="cc-page-header">
            <div>
              <h1 className="cc-page-title">
                Your <em>Gardens</em>
              </h1>
              <p className="cc-page-sub">Select a garden to begin monitoring crop health.</p>
            </div>
            <button className="btn-create" onClick={handleModal}>
              <span className="btn-create-plus">+</span>
              New Garden
            </button>
          </div>

          {/* Garden Grid */}
          <div className="garden-grid">
            {loading && garden.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <p className="empty-title">Loading gardens…</p>
              </div>
            ) : garden.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>
                <p className="empty-title">No gardens yet</p>
                <p className="empty-sub">Create your first garden to start monitoring crop health in real time.</p>
              </div>
            ) : (
              garden.map((gard) => (
                <div className="garden-card" key={gard.id}>
                  <div className="garden-card-img-wrap">
                    <img
                      src={Pic}
                      alt={gard.name || gard.garden_name || 'Garden'}
                      className="garden-card-img"
                    />
                  </div>
                  <div className="garden-card-body">
                    <span className="garden-card-name">
                      {gard.name || gard.garden_name || 'Unnamed Garden'}
                    </span>
                    <div className="garden-card-actions">
                      <button
                        className="card-icon-btn"
                        onClick={() => goGarden(gard.id)}
                        disabled={loading}
                        aria-label="Open garden"
                        title="Open garden"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 512 512" fill="none">
                          <path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40" />
                          <path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="m272 336l80-80l-80-80M48 256h288" />
                        </svg>
                      </button>
                      <button
                        className="card-icon-btn danger"
                        onClick={() => openDeleteModal(gard.id, gard.name || gard.garden_name || 'Unnamed Garden')}
                        aria-label="Delete garden"
                        title="Delete garden"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="cc-mobile-sidebar">
        <UserSidebar />
      </div>

      {/* ── ADD GARDEN MODAL ── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">New Garden</span>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {error && (
              <div className="error-alert" style={{ marginTop: 16 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={addGarden} className="modal-form">
              <div>
                <label className="form-label">Garden name</label>
                <input
                  type="text"
                  name="garden_name"
                  value={form.garden_name}
                  onChange={handleChange}
                  placeholder="e.g. North Field, Rooftop Plot…"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Location</label>
                <div className="location-row">
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter address or use GPS"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-locate"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    title="Use current location"
                  >
                    {locationLoading ? (
                      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="form-hint">Tap the pin icon to auto-fill with your current location.</p>
              </div>
            </form>

            <div className="modal-footer">
              <button className="btn-cancel" type="button" onClick={closeModal}>Cancel</button>
              <button
                className="btn-save"
                type="button"
                onClick={addGarden}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Saving…
                  </>
                ) : 'Save Garden'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeDeleteModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#dc2626' }}>Delete Garden</span>
              <button className="modal-close" onClick={closeDeleteModal} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {error && (
              <div className="error-alert" style={{ marginTop: 16 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="delete-modal-body">
              <div className="delete-icon-ring">🗑️</div>
              <p className="delete-modal-text">You are about to permanently delete</p>
              <p className="delete-modal-name">"{gardenToDelete?.name || 'this garden'}"</p>
              <p className="delete-modal-text">All sensor data and records linked to this garden will be lost.</p>
              <p className="delete-modal-warn">This action cannot be undone.</p>
            </div>

            <div className="modal-footer" style={{ marginTop: 8 }}>
              <button className="btn-cancel" type="button" onClick={closeDeleteModal} disabled={deleteLoading}>Cancel</button>
              <button
                className="btn-delete-confirm"
                type="button"
                onClick={deleteGarden}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Deleting…
                  </>
                ) : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cropcare;
