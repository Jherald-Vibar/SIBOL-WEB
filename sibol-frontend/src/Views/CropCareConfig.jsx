import React, { useEffect, useState, useRef } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "./axios";

/* ─────────────────────────────────────────────
   SCAN DEVICE MODAL
───────────────────────────────────────────── */
const ScanDeviceModal = ({ onClose, onConnect, loading }) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [dots, setDots] = useState(0);
  const [foundDevices, setFoundDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const MOCK_DEVICES = [
    { id: 1, name: "Sibol-ESP32-A1B2", serial: "ESP-A1B2C3D4", rssi: -42, type: "ESP32" },
    { id: 2, name: "Sibol-ESP32-C3D4", serial: "ESP-C3D4E5F6", rssi: -61, type: "ESP32" },
    { id: 3, name: "Sibol-Node-7F8E", serial: "ESP-7F8E9A0B", rssi: -75, type: "ESP32-S3" },
  ];

  const timerRef = useRef(null);
  const sweepRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      sweepRef.current = setInterval(() => setSweepAngle((a) => (a + 3) % 360), 30);
      dotsRef.current = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    } else {
      clearInterval(sweepRef.current);
      clearInterval(dotsRef.current);
    }
    return () => { clearInterval(sweepRef.current); clearInterval(dotsRef.current); };
  }, [scanning]);

  const startScan = () => {
    setFoundDevices([]); setSelectedDevice(null); setScanning(true); setScanProgress(0);
    let progress = 0; let devIdx = 0;
    const shuffled = [...MOCK_DEVICES].sort(() => Math.random() - 0.5);
    timerRef.current = setInterval(() => {
      progress += 2; setScanProgress(progress);
      if (progress % 28 === 0 && devIdx < shuffled.length) {
        const angle = (devIdx / shuffled.length) * 2 * Math.PI - Math.PI / 4;
        const dist = 0.22 + ((Math.abs(shuffled[devIdx].rssi) - 38) / 50) * 0.28;
        setFoundDevices((prev) => [...prev, { ...shuffled[devIdx], angle, dist }]);
        devIdx++;
      }
      if (progress >= 100) { clearInterval(timerRef.current); setScanning(false); }
    }, 60);
  };

  const stopScan = () => { clearInterval(timerRef.current); setScanning(false); };
  const signalStrength = (rssi) => rssi > -50 ? 4 : rssi > -65 ? 3 : rssi > -75 ? 2 : 1;
  const signalColor = (rssi) => rssi > -50 ? "#4ade80" : rssi > -65 ? "#a3e635" : rssi > -75 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',zIndex:50,padding:16 }}>
      <div style={{ background:'#fff',borderRadius:22,width:'100%',maxWidth:420,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.25)',animation:'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ background:'var(--forest,#0b3d1e)',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white" stroke="white"/>
            </svg>
            <span style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#fff' }}>Scan for Device</span>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.25)',background:'transparent',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding:24 }}>
          {/* Radar */}
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:20 }}>
            <div style={{ position:'relative',width:200,height:200 }}>
              {[1,2,3,4].map(r => (
                <div key={r} style={{ position:'absolute',inset:`${r*11}%`,borderRadius:'50%',border:`1px solid rgba(11,61,30,${0.08+r*0.04})`,background:r===4?'rgba(11,61,30,0.02)':'transparent' }} />
              ))}
              <div style={{ position:'absolute',top:'50%',left:0,right:0,height:1,background:'rgba(11,61,30,0.08)',transform:'translateY(-50%)' }} />
              <div style={{ position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'rgba(11,61,30,0.08)',transform:'translateX(-50%)' }} />
              {scanning && (
                <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:`conic-gradient(from ${sweepAngle}deg, rgba(11,61,30,0.2) 0deg, rgba(74,222,128,0.06) 55deg, transparent 70deg)` }} />
              )}
              {scanning && [0,1].map(i => (
                <div key={i} style={{ position:'absolute',inset:'38%',borderRadius:'50%',border:'1.5px solid rgba(74,222,128,0.5)',animation:`scanPulse ${1.4+i*0.6}s ease-out infinite`,animationDelay:`${i*0.5}s` }} />
              ))}
              <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:10,height:10,borderRadius:'50%',background:scanning?'#16a34a':'#0b3d1e',boxShadow:scanning?'0 0 0 4px rgba(22,163,74,0.2)':'none',zIndex:2 }} />
              {foundDevices.map(d => {
                const cx = 50 + Math.cos(d.angle)*d.dist*100;
                const cy = 50 + Math.sin(d.angle)*d.dist*100;
                const isSel = selectedDevice?.id === d.id;
                return (
                  <button key={d.id} onClick={() => setSelectedDevice(d)} title={d.name} style={{ position:'absolute',left:`${cx}%`,top:`${cy}%`,transform:'translate(-50%,-50%)',width:isSel?14:9,height:isSel?14:9,borderRadius:'50%',background:signalColor(d.rssi),boxShadow:isSel?`0 0 0 3px white,0 0 0 5px ${signalColor(d.rssi)}`:`0 0 8px ${signalColor(d.rssi)}`,border:'none',cursor:'pointer',zIndex:3,animation:'blipIn 0.4s ease-out' }} />
                );
              })}
            </div>
            <p style={{ marginTop:8,fontSize:13,fontWeight:500,color:'#0b3d1e',minHeight:20 }}>
              {scanning ? `Scanning${'.'.repeat(dots)}` : foundDevices.length > 0 ? `${foundDevices.length} device${foundDevices.length>1?'s':''} found — tap a blip to select` : 'Press Scan to discover devices'}
            </p>
          </div>

          {/* Progress */}
          <div style={{ width:'100%',background:'#f3f4f6',borderRadius:100,height:3,marginBottom:16,overflow:'hidden' }}>
            <div style={{ height:'100%',borderRadius:100,background:'linear-gradient(90deg,#0b3d1e,#4ade80)',width:`${scanProgress}%`,transition:'width 0.1s' }} />
          </div>

          {/* Selected device */}
          {selectedDevice && !scanning && (
            <div style={{ background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
                </svg>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:13,fontWeight:700,color:'#14532d',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{selectedDevice.name}</p>
                <p style={{ fontSize:11,color:'#6b7280',fontFamily:'monospace' }}>{selectedDevice.serial}</p>
              </div>
              <div style={{ display:'flex',alignItems:'flex-end',gap:2,height:16,flexShrink:0 }}>
                {[1,2,3,4].map(b => (
                  <div key={b} style={{ width:3,height:`${b*4}px`,borderRadius:1,background:b<=signalStrength(selectedDevice.rssi)?signalColor(selectedDevice.rssi):'#e5e7eb' }} />
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={scanning ? stopScan : startScan} disabled={loading} style={{ flex:1,padding:'11px 0',borderRadius:100,fontSize:13,fontWeight:600,border:'1.5px solid #0b3d1e',background:'transparent',color:'#0b3d1e',cursor:'pointer',transition:'all 0.2s' }}>
              {scanning ? '⏹ Stop' : '🔍 Scan'}
            </button>
            <button onClick={() => selectedDevice && onConnect(selectedDevice)} disabled={!selectedDevice||scanning||loading} style={{ flex:1,padding:'11px 0',borderRadius:100,fontSize:13,fontWeight:600,border:'none',background:!selectedDevice||scanning?'#d1d5db':'#0b3d1e',color:'#fff',cursor:!selectedDevice||scanning?'not-allowed':'pointer',transition:'all 0.2s' }}>
              {loading ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scanPulse { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(3.5);opacity:0} }
        @keyframes blipIn { 0%{transform:translate(-50%,-50%) scale(0);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.6)} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const CropCareConfig = () => {
  const { garden_id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name:"",variety:"",planted_date:"",image:null });
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
  const [showScanModal, setShowScanModal] = useState(false);
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
      fd.append("name",form.name); fd.append("variety",form.variety);
      fd.append("planted_date",new Date(form.planted_date).toISOString().split("T")[0]);
      if (form.image) fd.append("image",form.image);
      const res = await axiosClient.post(`/addCrop/${garden_id}`,fd,{headers:{"Content-Type":"multipart/form-data"}});
      setModalOpen(false); setForm({name:"",variety:"",planted_date:"",image:null}); setImagePreview(null);
      setCrop(prev=>[...prev,res.data.data]);
    } catch(err) {
      setError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : err.response?.data?.message||"Something went wrong!");
    } finally { setIsLoading(false); }
  };

  const editCrop = (crop) => {
    setEditingCrop(crop.id);
    let d=""; try{ d=new Date(crop.planted_at).toISOString().split("T")[0]; }catch{}
    setForm({name:crop.name||"",variety:crop.variety||"",planted_date:d,image:null});
    setImagePreview(crop.image); setModalOpen(true);
  };

  const updateCrop = async (e) => {
    e.preventDefault();
    if (!form.name||!form.variety||!form.planted_date) { setError("All fields are required!"); return; }
    setIsLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("_method","PUT"); fd.append("name",form.name); fd.append("variety",form.variety);
      fd.append("planted_date",new Date(form.planted_date).toISOString().split("T")[0]);
      if (form.image instanceof File) fd.append("image",form.image);
      const res = await axiosClient.post(`/updateCrop/${editingCrop}`,fd,{headers:{"Content-Type":"multipart/form-data"}});
      setCrop(prev=>prev.map(c=>c.id===editingCrop?res.data.data:c)); closeModal();
    } catch(err) {
      setError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : err.response?.data?.message||"Something went wrong!");
    } finally { setIsLoading(false); }
  };

  const deleteCrop = async (cropId) => {
    setIsLoading(true); setError("");
    try {
      await axiosClient.delete(`/deleteCrop/${cropId}`);
      setCrop(prev=>prev.filter(c=>c.id!==cropId)); setDeleteConfirm(null);
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

  const handleScanConnect = async (device) => {
    setIsLoading(true); setError("");
    try {
      const res = await axiosClient.post(`/addDevice/${garden_id}`,{serial_number:device.serial});
      setDeviceInfo(res.data.device); setShowScanModal(false); setShowDeviceModal(true); fetchEsp();
    } catch(err) { setError(err.response?.data?.message||"Something went wrong"); }
    finally { setIsLoading(false); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };
  const fetchEsp = async () => { try{ const r=await axiosClient.get(`/getEsp/${garden_id}`); setEsp(r.data.data); }catch{ setEsp(null); } };

  useEffect(() => {
    const fetchCrops = async () => {
      setIsLoading(true);
      try{ const r=await axiosClient.get(`getCropData/${garden_id}`); setCrop(r.data.data); }
      catch(err){ setError(err.response?.data?.message||"Something Went Wrong!"); }
      finally{ setIsLoading(false); }
    };
    fetchCrops(); fetchEsp();
  },[garden_id]);

  useEffect(() => {
    fetchEsp();
    const interval=setInterval(fetchEsp,5000);
    return()=>clearInterval(interval);
  },[garden_id]);

  const handleNextPage = (crop_name) => navigate(`/user/crop-care/${garden_id}/${crop_name}`);

  const S = {
    page:{ background:'#f7f4ee',minHeight:'100vh',display:'flex',flexDirection:'row',fontFamily:"'DM Sans',sans-serif" },
    sidebar:{ width:256,background:'#0b3d1e',position:'fixed',top:0,left:0,height:'100vh',zIndex:40,boxShadow:'4px 0 20px rgba(11,61,30,0.15)' },
    main:{ flex:1,display:'flex',flexDirection:'column',marginLeft:256,paddingBottom:0 },
    navbar:{ background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.06)',position:'sticky',top:0,zIndex:30 },
    content:{ flex:1,padding:'32px 40px' },
    pageHeader:{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',paddingBottom:24,borderBottom:'1px solid rgba(11,61,30,0.1)',marginBottom:28 },
    pageTitle:{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,32px)',fontWeight:700,color:'#0b3d1e',lineHeight:1.15 },
    pageSub:{ fontSize:13,color:'#5a6472',marginTop:4 },
    btnRow:{ display:'flex',gap:10,flexWrap:'wrap' },
    btnPrimary:{ display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',background:'#0b3d1e',color:'#fff',border:'none',borderRadius:100,fontSize:13,fontWeight:500,cursor:'pointer',transition:'all 0.25s',whiteSpace:'nowrap' },
    btnOutline:{ display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',background:'transparent',color:'#0b3d1e',border:'1.5px solid #0b3d1e',borderRadius:100,fontSize:13,fontWeight:500,cursor:'pointer',transition:'all 0.25s',whiteSpace:'nowrap' },
    espCard:{ marginBottom:24,background:'#fff',borderRadius:18,padding:'22px 24px',border:'1.5px solid',transition:'border-color 0.3s' },
    espHeader:{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:12 },
    espMeta:{ display:'flex',alignItems:'center',gap:14 },
    espIcon:{ width:46,height:46,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 },
    espName:{ fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'#0b3d1e' },
    espSub:{ fontSize:12,color:'#9ca3af',fontFamily:'monospace',marginTop:2 },
    statusPill:{ padding:'5px 12px',borderRadius:100,fontSize:11,fontWeight:600 },
    espGrid:{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10 },
    espCell:{ background:'#f7f4ee',borderRadius:12,padding:'12px 14px' },
    espCellLabel:{ fontSize:10,color:'#9ca3af',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px' },
    espCellVal:{ fontSize:13,fontWeight:500,color:'#0b3d1e',wordBreak:'break-all',fontFamily:'monospace' },
    espActions:{ display:'flex',gap:10,marginTop:16,flexWrap:'wrap' },
    cropGrid:{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:18 },
    cropCard:{ background:'#fff',borderRadius:18,overflow:'hidden',border:'1px solid rgba(0,0,0,0.05)',transition:'transform 0.3s,box-shadow 0.3s' },
    cropImg:{ width:'100%',height:170,objectFit:'cover',display:'block',transition:'transform 0.5s' },
    cropBody:{ padding:'16px 18px' },
    cropName:{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:'#0b3d1e',marginBottom:2 },
    cropVariety:{ fontSize:12,color:'#9ca3af',marginBottom:4 },
    cropDate:{ fontSize:11,color:'#b0b7c3' },
    cropActions:{ display:'flex',justifyContent:'flex-end',gap:6,marginTop:12 },
    iconBtn:{ width:34,height:34,borderRadius:10,border:'1px solid rgba(0,0,0,0.08)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s' },
    emptyState:{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 24px',textAlign:'center',gridColumn:'1/-1' },
    errorAlert:{ display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',background:'#fff1f2',border:'1px solid #fecdd3',borderRadius:12,fontSize:13,color:'#be123c',marginBottom:16 },
    // Modal shared
    backdrop:{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(6px)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 },
    modal:{ background:'#fff',borderRadius:22,width:'100%',maxWidth:440,boxShadow:'0 32px 80px rgba(0,0,0,0.25)',animation:'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',maxHeight:'90vh',overflowY:'auto' },
    modalHeader:{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid rgba(0,0,0,0.06)',position:'sticky',top:0,background:'#fff',zIndex:1 },
    modalTitle:{ fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:'#0b3d1e' },
    modalClose:{ width:32,height:32,borderRadius:'50%',border:'1px solid rgba(0,0,0,0.1)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' },
    modalForm:{ padding:24,display:'flex',flexDirection:'column',gap:16 },
    formLabel:{ fontSize:11,fontWeight:500,letterSpacing:'0.5px',textTransform:'uppercase',color:'#9ca3af',marginBottom:6,display:'block' },
    formInput:{ width:'100%',padding:'11px 14px',border:'1.5px solid rgba(0,0,0,0.1)',borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'#0b3d1e',background:'#f7f4ee',outline:'none' },
    modalFooter:{ display:'flex',justifyContent:'flex-end',gap:10,padding:'14px 24px',borderTop:'1px solid rgba(0,0,0,0.05)' },
    btnCancel:{ padding:'10px 20px',borderRadius:100,border:'1.5px solid rgba(0,0,0,0.1)',background:'transparent',color:'#9ca3af',fontSize:13,fontWeight:500,cursor:'pointer' },
    btnSave:{ padding:'10px 24px',borderRadius:100,background:'#0b3d1e',border:'none',color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:7 },
    btnDanger:{ padding:'10px 24px',borderRadius:100,background:'#dc2626',border:'none',color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:7 },
  };

  const SpinIcon = () => (
    <svg style={{ animation:'spin 0.8s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes modalIn { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .crop-card:hover { transform:translateY(-5px)!important; box-shadow:0 18px 38px rgba(11,61,30,0.11)!important; }
        .crop-card:hover img { transform:scale(1.05)!important; }
        .icon-btn:hover { background:#f0fdf4!important; border-color:#2e8b57!important; }
        .icon-btn-danger:hover { background:#fff1f2!important; border-color:#ef4444!important; }
        .btn-primary-h:hover { background:#1a6636!important; transform:translateY(-1px)!important; }
        .btn-outline-h:hover { background:#f0fdf4!important; }
        .form-input-f:focus { border-color:#2e8b57!important; box-shadow:0 0 0 3px rgba(46,139,87,0.12)!important; background:#fff!important; }
        @media(max-width:768px){
          .cc-sidebar-d{display:none!important;}
          .cc-main-d{margin-left:0!important;padding-bottom:72px!important;}
          .cc-content-d{padding:20px 16px!important;}
        }
      `}</style>

      {/* Sidebar */}
      <div className="cc-sidebar-d" style={S.sidebar}><UserSidebar /></div>

      {/* Main */}
      <div className="cc-main-d" style={S.main}>
        <div style={S.navbar}><UserNavbar /></div>
        <div className="cc-content-d" style={S.content}>

          {/* Header */}
          <div style={S.pageHeader}>
            <div>
              <h1 style={S.pageTitle}>Your <em style={{ fontStyle:'italic',color:'#2e8b57' }}>Crops</em></h1>
              <p style={S.pageSub}>Manage the crops you're monitoring in this garden.</p>
            </div>
            <div style={S.btnRow}>
              {!esp && (
                <button className="btn-outline-h" style={S.btnOutline} onClick={() => setShowScanModal(true)} disabled={loading}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><circle cx="12" cy="20" r="1"/></svg>
                  Scan Device
                </button>
              )}
              <button className="btn-primary-h" style={S.btnPrimary} onClick={handleModal}>
                <span style={{ width:18,height:18,borderRadius:'50%',background:'#d4840a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,lineHeight:1 }}>+</span>
                New Crop
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorAlert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0,marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          {/* ESP Card */}
          {esp && (
            <div style={{ ...S.espCard, borderColor: esp.status==='active'||esp.status==='online'?'#4ade80':'#fca5a5' }}>
              <div style={S.espHeader}>
                <div style={S.espMeta}>
                  <div style={S.espIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                  </div>
                  <div>
                    <div style={S.espName}>{esp.name}</div>
                    <div style={S.espSub}>{esp.serial_number}</div>
                  </div>
                </div>
                <span style={{ ...S.statusPill, background: esp.status==='active'||esp.status==='online'?'#dcfce7':'#f3f4f6', color: esp.status==='active'||esp.status==='online'?'#166534':'#6b7280' }}>
                  {esp.status}
                </span>
              </div>
              <div style={S.espGrid}>
                <div style={S.espCell}><div style={S.espCellLabel}>ESP ID</div><div style={S.espCellVal}>{esp.serial_number||'—'}</div></div>
                <div style={S.espCell}><div style={S.espCellLabel}>Device Type</div><div style={{ ...S.espCellVal, fontFamily:'inherit' }}>{esp.device_type||'ESP32 Main'}</div></div>
                <div style={S.espCell}><div style={S.espCellLabel}>Last Seen</div><div style={{ ...S.espCellVal, fontFamily:'inherit', fontSize:12 }}>{esp.last_seen_at ? new Date(esp.last_seen_at).toLocaleString() : 'Never'}</div></div>
              </div>
              <div style={S.espActions}>
                <button className="btn-outline-h" style={{ ...S.btnOutline, fontSize:12, padding:'8px 16px' }} onClick={() => { setDeviceInfo({device_id:esp.serial_number}); setShowDeviceModal(true); }}>
                  📋 View Credentials
                </button>
                <button style={{ ...S.btnDanger, fontSize:12, padding:'8px 16px' }} onClick={() => setDeleteEspConfirm(true)}>
                  Remove Device
                </button>
              </div>
            </div>
          )}

          {/* Crops Grid */}
          <div style={S.cropGrid}>
            {crops.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(11,61,30,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,marginBottom:16 }}>🌿</div>
                <p style={{ fontFamily:"'Playfair Display',serif",fontSize:20,color:'#0b3d1e',marginBottom:6 }}>No crops yet</p>
                <p style={{ fontSize:13,color:'#9ca3af',maxWidth:260,lineHeight:1.6 }}>Add your first crop to start monitoring its health in real time.</p>
              </div>
            ) : crops.map(crop => (
              <div key={crop.id} className="crop-card" style={S.cropCard}>
                <div style={{ overflow:'hidden' }}>
                  <img src={crop.image} alt={crop.name} style={S.cropImg} />
                </div>
                <div style={S.cropBody}>
                  <div style={S.cropName}>{crop.name}</div>
                  <div style={S.cropVariety}>{crop.variety}</div>
                  <div style={S.cropDate}>Planted {new Date(crop.planted_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>
                  <div style={S.cropActions}>
                    <button className="icon-btn" style={S.iconBtn} title="View" onClick={() => handleNextPage(crop.name)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" fill="none"><path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"/><path stroke="#1a6636" strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="m272 336l80-80l-80-80M48 256h288"/></svg>
                    </button>
                    <button className="icon-btn" style={S.iconBtn} title="Edit" onClick={() => editCrop(crop)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3zM16 5l3 3"/></svg>
                    </button>
                    <button className="icon-btn icon-btn-danger" style={S.iconBtn} title="Delete" onClick={() => setDeleteConfirm(crop.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div style={{ display:'none' }} className="cc-mobile-sidebar">
        <UserSidebar />
      </div>

      {/* ── SCAN MODAL ── */}
      {showScanModal && <ScanDeviceModal onClose={() => setShowScanModal(false)} onConnect={handleScanConnect} loading={loading} />}

      {/* ── ADD / EDIT CROP MODAL ── */}
      {isModalOpen && (
        <div style={S.backdrop} onClick={e => e.target===e.currentTarget && closeModal()}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>{editingCrop ? 'Edit Crop' : 'New Crop'}</span>
              <button style={S.modalClose} onClick={closeModal}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            {error && <div style={{ ...S.errorAlert,margin:'0 24px',marginTop:16 }}><span>{error}</span></div>}
            <form onSubmit={editingCrop ? updateCrop : addCrop} style={S.modalForm}>
              <div>
                <label style={S.formLabel}>Crop Name</label>
                <input className="form-input-f" type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Kamote, Pechay…" style={S.formInput} required />
              </div>
              <div>
                <label style={S.formLabel}>Variety</label>
                <div style={{ display:'flex',gap:16,border:'1.5px solid rgba(0,0,0,0.1)',borderRadius:12,padding:'12px 16px',background:'#f7f4ee' }}>
                  {['Vegetable','Fruit'].map(v => (
                    <label key={v} style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14,color:'#0b3d1e',fontWeight:form.variety===v?600:400 }}>
                      <input type="radio" name="variety" value={v} checked={form.variety===v} onChange={handleChange} style={{ accentColor:'#2e8b57' }} />
                      {v === 'Vegetable' ? '🥬' : '🍓'} {v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={S.formLabel}>Crop Image</label>
                <input className="form-input-f" type="file" name="image" accept="image/*" onChange={handleFileChange} style={S.formInput} />
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" style={{ width:'100%',height:160,objectFit:'cover',borderRadius:12,border:'1px solid rgba(0,0,0,0.06)' }} />}
              <div>
                <label style={S.formLabel}>Planted Date</label>
                <input className="form-input-f" type="date" name="planted_date" value={form.planted_date} onChange={handleChange} style={S.formInput} required />
              </div>
            </form>
            <div style={S.modalFooter}>
              <button style={S.btnCancel} type="button" onClick={closeModal}>Cancel</button>
              <button style={S.btnSave} type="button" onClick={editingCrop ? updateCrop : addCrop} disabled={loading}>
                {loading ? <><SpinIcon /> Saving…</> : editingCrop ? 'Update' : 'Save Crop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CROP MODAL ── */}
      {deleteConfirm && (
        <div style={S.backdrop} onClick={e => e.target===e.currentTarget && setDeleteConfirm(null)}>
          <div style={S.modal}>
            <div style={{ ...S.modalHeader }}><span style={{ ...S.modalTitle,color:'#dc2626' }}>Delete Crop</span><button style={S.modalClose} onClick={() => setDeleteConfirm(null)}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <div style={{ padding:'28px 24px 8px',textAlign:'center' }}>
              <div style={{ width:68,height:68,borderRadius:'50%',background:'#fff1f2',border:'2px solid #fecdd3',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:28 }}>🗑️</div>
              <p style={{ fontSize:14,color:'#6b7280',lineHeight:1.6 }}>You're about to permanently delete</p>
              <p style={{ fontFamily:"'Playfair Display',serif",fontSize:18,color:'#0b3d1e',fontWeight:700,margin:'8px 0' }}>"{crops.find(c=>c.id===deleteConfirm)?.name}"</p>
              <p style={{ fontSize:12,color:'#9ca3af' }}>This action cannot be undone.</p>
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={S.btnDanger} onClick={() => deleteCrop(deleteConfirm)} disabled={loading}>{loading ? <><SpinIcon/>Deleting…</> : 'Yes, delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ESP MODAL ── */}
      {deleteEspConfirm && (
        <div style={S.backdrop} onClick={e => e.target===e.currentTarget && setDeleteEspConfirm(false)}>
          <div style={S.modal}>
            <div style={S.modalHeader}><span style={{ ...S.modalTitle,color:'#dc2626' }}>Remove Device</span><button style={S.modalClose} onClick={() => setDeleteEspConfirm(false)}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <div style={{ padding:'28px 24px 8px',textAlign:'center' }}>
              <div style={{ width:68,height:68,borderRadius:'50%',background:'#fff1f2',border:'2px solid #fecdd3',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:28 }}>📡</div>
              <p style={{ fontSize:14,color:'#6b7280' }}>Remove device</p>
              <p style={{ fontFamily:"'Playfair Display',serif",fontSize:18,color:'#0b3d1e',fontWeight:700,margin:'8px 0' }}>"{esp?.serial_number}"</p>
              <p style={{ fontSize:12,color:'#9ca3af',maxWidth:300,margin:'0 auto' }}>This will disconnect the device. Sensor data linked to it may be affected.</p>
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnCancel} onClick={() => setDeleteEspConfirm(false)}>Cancel</button>
              <button style={S.btnDanger} onClick={deleteEsp} disabled={loading}>{loading ? <><SpinIcon/>Removing…</> : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEVICE CREDENTIALS MODAL ── */}
      {showDeviceModal && deviceInfo && (
        <div style={S.backdrop} onClick={e => e.target===e.currentTarget && setShowDeviceModal(false)}>
          <div style={{ ...S.modal,maxWidth:500 }}>
            <div style={{ ...S.modalHeader,background:'#0b3d1e' }}>
              <span style={{ ...S.modalTitle,color:'#fff' }}>🌿 Device Configuration</span>
              <button style={{ ...S.modalClose,borderColor:'rgba(255,255,255,0.25)',color:'#fff' }} onClick={() => setShowDeviceModal(false)}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ background:'#f0fdf4',borderLeft:'3px solid #22c55e',borderRadius:8,padding:'12px 14px',marginBottom:18,fontSize:13,color:'#166534' }}>
                Use these credentials to configure your ESP32 device.
              </div>
              <label style={S.formLabel}>Device ID</label>
              <div style={{ display:'flex',gap:8,marginBottom:18 }}>
                <input type="text" value={deviceInfo.device_id} readOnly style={{ ...S.formInput,flex:1,fontFamily:'monospace',fontSize:13 }} />
                <button style={{ ...S.btnPrimary,padding:'11px 16px',flexShrink:0,borderRadius:12 }} onClick={() => copyToClipboard(deviceInfo.device_id)}>📋</button>
              </div>
              <div style={{ background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,padding:'14px 16px',marginBottom:18 }}>
                <p style={{ fontSize:12,fontWeight:600,color:'#1e40af',marginBottom:10 }}>📝 Setup Instructions</p>
                <ol style={{ fontSize:12,color:'#374151',lineHeight:1.7,paddingLeft:18 }}>
                  <li>Connect to WiFi: <strong>"Sibol-SmartGarden"</strong>, password: <strong>"sibol2025"</strong></li>
                  <li>Portal opens at <strong>192.168.4.1</strong> — click "Configure WiFi"</li>
                  <li>Enter your WiFi credentials and paste the Device ID above</li>
                  <li>Click "Save"</li>
                </ol>
              </div>
              <div style={S.modalFooter}>
                <button style={{ ...S.btnSave,width:'100%',justifyContent:'center' }} onClick={() => setShowDeviceModal(false)}>Done</button>
              </div>
              <p style={{ fontSize:11,color:'#9ca3af',textAlign:'center',marginTop:10 }}>⚠️ Save these credentials — you'll need them to configure your device.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCareConfig;
