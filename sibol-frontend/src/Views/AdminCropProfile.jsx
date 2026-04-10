import React, { useEffect, useState } from 'react';
import axiosClient from './axios';

const AdminCropProfile = () => {
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const initialFormData = {
    name: "",
    soilTemp: { min: "", max: "" },
    soilMoisture: { min: "", max: "" },
    phLevel: { min: "", max: "" },
    electricalConductivity: { min: "", max: "" },
    nitrogen: { min: "", max: "" },
    phosphorus: { min: "", max: "" },
    potassium: { min: "", max: "" },
    temperature: { min: "", max: "" },
    humidity: { min: "", max: "" }
  };

  const [formData, setFormData] = useState(initialFormData);

  const parameters = [
    { key: 'soilTemp',               label: 'Soil Temperature',       unit: '°C',   icon: '🌡' },
    { key: 'soilMoisture',           label: 'Soil Moisture',           unit: '%',    icon: '💧' },
    { key: 'phLevel',                label: 'pH Level',                unit: 'pH',   icon: '⚗' },
    { key: 'electricalConductivity', label: 'Electrical Conductivity', unit: 'dS/m', icon: '⚡' },
    { key: 'nitrogen',               label: 'Nitrogen (N)',            unit: 'mg/L', icon: '🟢' },
    { key: 'phosphorus',             label: 'Phosphorus (P)',          unit: 'mg/L', icon: '🟡' },
    { key: 'potassium',              label: 'Potassium (K)',           unit: 'mg/L', icon: '🟠' },
    { key: 'temperature',            label: 'Air Temperature',         unit: '°C',   icon: '🌤' },
    { key: 'humidity',               label: 'Air Humidity',            unit: '%',    icon: '🌫' },
  ];

  const handleInputChange = (field, type, value) => {
    if (field === 'name') {
      setFormData(prev => ({ ...prev, name: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: { ...prev[field], [type]: value } }));
    }
  };

  const resetForm = () => { setFormData(initialFormData); setEditingCrop(null); setError(""); };
  const closeModal = () => { setModalOpen(false); resetForm(); };
  const toggleCrop = (id) => setExpandedCrop(prev => prev === id ? null : id);

  const transformCropData = (crop) => ({
    id: crop.id,
    name: crop.name,
    soilTemp: { min: crop.soil_temp_min || 0, max: crop.soil_temp_max || 0 },
    soilMoisture: { min: crop.soil_moisture_min || 0, max: crop.soil_moisture_max || 0 },
    phLevel: { min: crop.ph_min || 0, max: crop.ph_max || 0 },
    electricalConductivity: { min: crop.electrical_conductivity_min || 0, max: crop.electrical_conductivity_max || 0 },
    nitrogen: { min: crop.nitrogen_min || 0, max: crop.nitrogen_max || 0 },
    phosphorus: { min: crop.phosphorus_min || 0, max: crop.phosphorus_max || 0 },
    potassium: { min: crop.potassium_min || 0, max: crop.potassium_max || 0 },
    temperature: { min: crop.air_temperature_min || 0, max: crop.air_temperature_max || 0 },
    humidity: { min: crop.air_humidity_min || 0, max: crop.air_humidity_max || 0 }
  });

  const transformToApiFormat = (data) => ({
    name: data.name,
    soil_temp_min: parseFloat(data.soilTemp.min) || 0,
    soil_temp_max: parseFloat(data.soilTemp.max) || 0,
    soil_moisture_min: parseFloat(data.soilMoisture.min) || 0,
    soil_moisture_max: parseFloat(data.soilMoisture.max) || 0,
    ph_min: parseFloat(data.phLevel.min) || 0,
    ph_max: parseFloat(data.phLevel.max) || 0,
    electrical_conductivity_min: parseFloat(data.electricalConductivity.min) || 0,
    electrical_conductivity_max: parseFloat(data.electricalConductivity.max) || 0,
    nitrogen_min: parseFloat(data.nitrogen.min) || 0,
    nitrogen_max: parseFloat(data.nitrogen.max) || 0,
    phosphorus_min: parseFloat(data.phosphorus.min) || 0,
    phosphorus_max: parseFloat(data.phosphorus.max) || 0,
    potassium_min: parseFloat(data.potassium.min) || 0,
    potassium_max: parseFloat(data.potassium.max) || 0,
    air_temperature_min: parseFloat(data.temperature.min) || 0,
    air_temperature_max: parseFloat(data.temperature.max) || 0,
    air_humidity_min: parseFloat(data.humidity.min) || 0,
    air_humidity_max: parseFloat(data.humidity.max) || 0,
  });

  const addCrop = async (e) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      const res = await axiosClient.post("/addAdminCrop", transformToApiFormat(formData));
      setCrops(prev => [...prev, transformCropData(res.data.data)]);
      closeModal();
    } catch (err) { setError(err.response?.data?.message || "Something Went Wrong!"); }
    finally { setIsLoading(false); }
  };

  const editCrop = (crop) => {
    setEditingCrop(crop.id);
    setFormData({ name: crop.name, soilTemp: crop.soilTemp, soilMoisture: crop.soilMoisture, phLevel: crop.phLevel, electricalConductivity: crop.electricalConductivity, nitrogen: crop.nitrogen, phosphorus: crop.phosphorus, potassium: crop.potassium, temperature: crop.temperature, humidity: crop.humidity });
    setModalOpen(true);
  };

  const updateCrop = async (e) => {
    e.preventDefault(); setIsLoading(true); setError("");
    try {
      const res = await axiosClient.put(`/updateAdminCrop/${editingCrop}`, transformToApiFormat(formData));
      setCrops(prev => prev.map(c => c.id === editingCrop ? transformCropData(res.data.data) : c));
      closeModal();
    } catch (err) { setError(err.response?.data?.message || "Something Went Wrong!"); }
    finally { setIsLoading(false); }
  };

  const deleteCrop = async (cropId) => {
    setIsLoading(true);
    try {
      await axiosClient.delete(`/deleteAdminCrop/${cropId}`);
      setCrops(prev => prev.filter(c => c.id !== cropId));
      setDeleteConfirm(null);
    } catch (err) { setError(err.response?.data?.message || "Something Went Wrong!"); }
    finally { setIsLoading(false); }
  };

  const fetchCrops = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/getCropProfile");
      setCrops(res.data.data.map(transformCropData));
    } catch (err) { setError(err.response?.data?.message || "Something Went Wrong!"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCrops(); }, []);

  const SpinIcon = () => (
    <svg style={{ animation: 'spin 0.8s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );

  return (
    // ── No sidebar/navbar here — AdminLayout provides them ──
    <div style={{ background: '#f7f4ee', minHeight: '100%', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.9) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        .crop-row:hover { background: #f0fdf4 !important; }
        .btn-edit:hover { background: #1a6636 !important; transform: translateY(-1px); }
        .btn-del:hover { background: #b91c1c !important; transform: translateY(-1px); }
        .form-input:focus { border-color: #2e8b57 !important; box-shadow: 0 0 0 3px rgba(46,139,87,0.1) !important; background: #fff !important; }
        .card-hover:hover { box-shadow: 0 16px 40px rgba(11,61,30,0.1) !important; transform: translateY(-2px); }
        .accordion-header:hover { background: rgba(11,61,30,0.04) !important; }

        @media (max-width: 768px) {
          .acp-content { padding: 16px !important; }
          .param-grid { grid-template-columns: 1fr !important; }
          .param-row { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
        }
      `}</style>

      <div className="acp-content" style={{ padding: '32px 40px' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(11,61,30,0.1)', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#2e8b57', marginBottom: 6 }}>Admin Panel</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: '#0b3d1e', lineHeight: 1.1 }}>
              Crop <em style={{ fontStyle: 'italic', color: '#2e8b57' }}>Profiles</em>
            </h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Define optimal growing conditions for each crop type.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#0b3d1e', color: '#fff', border: 'none', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
            className="btn-edit"
          >
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#d4840a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, lineHeight: 1, fontWeight: 300 }}>+</span>
            New Profile
          </button>
        </div>

        {/* Loading */}
        {loading && crops.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <svg style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading profiles…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, fontSize: 13, color: '#be123c', marginBottom: 20 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && crops.length === 0 && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(11,61,30,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 16 }}>🌾</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#0b3d1e', marginBottom: 6 }}>No profiles yet</p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Create your first crop profile to start monitoring.</p>
          </div>
        )}

        {/* Crop Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {crops.map((crop) => {
            const isOpen = expandedCrop === crop.id;
            return (
              <div key={crop.id} className="card-hover" style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'all 0.3s' }}>

                {/* Accordion Header */}
                <div
                  className="accordion-header"
                  onClick={() => toggleCrop(crop.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(11,61,30,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🌿</div>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#0b3d1e' }}>{crop.name}</h2>
                      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{parameters.length} parameters configured</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(11,61,30,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#0b3d1e', fontSize: 11 }}>▼</div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div style={{ animation: 'slideDown 0.25s ease-out', borderTop: '1px solid rgba(0,0,0,0.05)' }}>

                    {/* Parameters Grid */}
                    <div style={{ padding: '20px 24px' }}>
                      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 14 }}>Optimal Ranges</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                        {parameters.map((param) => (
                          <div key={param.key} style={{ background: '#f7f4ee', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>{param.icon}</span>
                              <div>
                                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 1 }}>{param.label}</p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#0b3d1e' }}>
                                  {crop[param.key]?.min ?? 0} – {crop[param.key]?.max ?? 0}
                                  <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af', marginLeft: 3 }}>{param.unit}</span>
                                </p>
                              </div>
                            </div>
                            {/* Range bar */}
                            <div style={{ width: 48, height: 4, background: '#e5e7eb', borderRadius: 100, overflow: 'hidden', flexShrink: 0 }}>
                              <div style={{ height: '100%', background: '#2e8b57', borderRadius: 100, width: `${Math.min(((crop[param.key]?.max ?? 0) / 100) * 100, 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div style={{ padding: '14px 24px', background: 'rgba(11,61,30,0.02)', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button className="btn-edit" onClick={() => editCrop(crop)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#0b3d1e', color: '#fff', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Profile
                      </button>
                      <button className="btn-del" onClick={() => setDeleteConfirm(crop.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* Modal Header */}
            <div style={{ background: '#0b3d1e', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1, borderRadius: '22px 22px 0 0' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {editingCrop ? 'Edit Profile' : 'New Crop Profile'}
              </span>
              <button onClick={closeModal} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, fontSize: 13, color: '#be123c', marginBottom: 20 }}>
                  <span>{error}</span>
                </div>
              )}

              {/* Crop Name */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6, display: 'block' }}>Crop Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', null, e.target.value)}
                  placeholder="e.g. Tomato, Pechay, Kamote…"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#0b3d1e', background: '#f7f4ee', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Section Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', whiteSpace: 'nowrap' }}>Optimal Conditions</p>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
              </div>

              {/* Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="param-grid">
                {parameters.map((param) => (
                  <div key={param.key} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12, alignItems: 'center', background: '#f7f4ee', borderRadius: 12, padding: '12px 16px' }} className="param-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{param.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#0b3d1e' }}>{param.label}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af' }}>{param.unit}</p>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Min</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={formData[param.key].min}
                        onChange={e => handleInputChange(param.key, 'min', e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '8px 10px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0b3d1e', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Max</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={formData[param.key].max}
                        onChange={e => handleInputChange(param.key, 'max', e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '8px 10px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0b3d1e', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, marginTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button onClick={closeModal} style={{ padding: '10px 20px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={editingCrop ? updateCrop : addCrop}
                  disabled={loading}
                  style={{ padding: '10px 24px', borderRadius: 100, background: '#0b3d1e', border: 'none', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? <><SpinIcon /> Saving…</> : editingCrop ? 'Update Profile' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#dc2626' }}>Delete Profile</span>
              <button onClick={() => setDeleteConfirm(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '28px 24px 8px', textAlign: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff1f2', border: '2px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🗑️</div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>You're about to permanently delete</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#0b3d1e', fontWeight: 700, margin: '8px 0' }}>"{crops.find(c => c.id === deleteConfirm)?.name}"</p>
              <p style={{ fontSize: 12, color: '#9ca3af', maxWidth: 300, margin: '0 auto 8px' }}>All data associated with this crop profile will be permanently deleted. This cannot be undone.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button onClick={() => setDeleteConfirm(null)} disabled={loading} style={{ padding: '10px 20px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                Cancel
              </button>
              <button onClick={() => deleteCrop(deleteConfirm)} disabled={loading} style={{ padding: '10px 24px', borderRadius: 100, background: '#dc2626', border: 'none', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, opacity: loading ? 0.6 : 1 }} className="btn-del">
                {loading ? <><SpinIcon /> Deleting…</> : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCropProfile;
