import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axiosClient from '../axios';
import Logo from '../../assets/logo-left.png';

const LogoutModal = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState('confirm');

  useEffect(() => { if (isOpen) setPhase('confirm'); }, [isOpen]);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    setPhase('logging-out');
    const token = localStorage.getItem('authToken');
    if (token) {
      axiosClient.post('logout', {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('username');
          localStorage.removeItem('location');
          localStorage.removeItem('role');
          setPhase('done');
          setTimeout(() => { window.location.href = '/guest/login'; }, 1500);
        })
        .catch(() => setPhase('confirm'));
    }
  };

  if (!isOpen) return null;

  const modal = (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500&display=swap');
        @keyframes lm-backdropIn { from{opacity:0} to{opacity:1} }
        @keyframes lm-modalIn    { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes lm-shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes lm-spin       { to{transform:rotate(360deg)} }
        @keyframes lm-pulse-ring { 0%{transform:scale(0.85);opacity:0.55} 70%{transform:scale(1.5);opacity:0} 100%{transform:scale(1.5);opacity:0} }
        @keyframes lm-checkIn    { from{stroke-dashoffset:40;opacity:0} to{stroke-dashoffset:0;opacity:1} }
        @keyframes lm-fadeUp     { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:translateY(0)} }
        .lm-backdrop    { animation:lm-backdropIn 0.22s ease forwards; }
        .lm-card        { animation:lm-modalIn 0.36s cubic-bezier(0.34,1.28,0.64,1) forwards; font-family:'DM Sans',sans-serif; }
        .lm-fade        { animation:lm-fadeUp 0.3s ease forwards; }
        .lm-spinner     { animation:lm-spin 0.88s linear infinite; }
        .lm-pulse       { animation:lm-pulse-ring 1.5s ease-out infinite; }
        .lm-check       { stroke-dasharray:40; stroke-dashoffset:40; animation:lm-checkIn 0.45s ease 0.12s forwards; }
        .lm-shimmer-btn { background:linear-gradient(110deg,#b86d06 30%,#f5c252 50%,#b86d06 70%); background-size:300% 100%; transition:box-shadow 0.2s; }
        .lm-shimmer-btn:hover { animation:lm-shimmer 1.1s linear infinite; box-shadow:0 6px 32px rgba(212,132,10,0.55) !important; }
        .lm-ghost { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.45); transition:background 0.18s,color 0.18s,border-color 0.18s; }
        .lm-ghost:hover { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.16); color:rgba(255,255,255,0.82); }
      `}</style>

      <div className="lm-backdrop" style={{
        position:'fixed', inset:0, zIndex:99999,
        display:'flex', alignItems:'center', justifyContent:'center', padding:'16px',
        background:'rgba(3,15,7,0.78)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      }} onClick={phase === 'confirm' ? onClose : undefined}>

        <div className="lm-card" style={{
          position:'relative', width:'100%', maxWidth:'360px',
          borderRadius:'22px', overflow:'hidden',
          background:'linear-gradient(158deg,#0f4d26 0%,#0b3d1e 55%,#072a14 100%)',
          border:'1px solid rgba(255,255,255,0.07)',
          boxShadow:'0 30px 90px rgba(0,0,0,0.65),inset 0 0 0 1px rgba(46,139,87,0.10)',
        }} onClick={e => e.stopPropagation()}>

          <div style={{ height:'2.5px', background:'linear-gradient(90deg,transparent 0%,#d4840a 20%,#f0c050 58%,transparent 100%)' }} />
          <div style={{ position:'absolute', top:'-70px', right:'-70px', width:'230px', height:'230px', borderRadius:'50%', background:'radial-gradient(circle,rgba(46,139,87,0.13) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-55px', left:'-55px', width:'190px', height:'190px', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,132,10,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1, padding:'32px 28px 28px' }}>

            {phase === 'confirm' && (
              <div className="lm-fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                <div style={{ position:'relative', marginBottom:'20px' }}>
                  <div className="lm-pulse" style={{ position:'absolute', inset:'-8px', borderRadius:'50%', background:'rgba(212,132,10,0.14)' }} />
                  <div style={{ width:'84px', height:'84px', borderRadius:'50%', background:'linear-gradient(135deg,rgba(46,139,87,0.30),rgba(11,61,30,0.72))', border:'1.5px solid rgba(212,132,10,0.38)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.45),0 0 22px rgba(212,132,10,0.14)' }}>
                    <img src={Logo} alt="SIBOL" style={{ width:'56px', objectFit:'contain', filter:'drop-shadow(0 2px 8px rgba(212,132,10,0.4))' }} />
                  </div>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'22px', fontWeight:500, color:'#fff', letterSpacing:'-0.3px', margin:'0 0 8px' }}>Leaving so soon?</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', lineHeight:1.65, maxWidth:'240px', margin:'0 auto' }}>Your session will end and you'll need to sign in again to continue.</p>
                <div style={{ width:'100%', height:'1px', margin:'22px 0', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)' }} />
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%' }}>
                  <button onClick={handleLogout} className="lm-shimmer-btn" style={{ width:'100%', padding:'13px 0', borderRadius:'12px', border:'none', fontSize:'13px', fontWeight:600, color:'#fff', letterSpacing:'0.04em', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 22px rgba(212,132,10,0.34)' }}>
                    Yes, Log Me Out
                  </button>
                  <button onClick={onClose} className="lm-ghost" style={{ width:'100%', padding:'13px 0', borderRadius:'12px', fontSize:'13px', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    Stay Signed In
                  </button>
                </div>
              </div>
            )}

            {phase === 'logging-out' && (
              <div className="lm-fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'16px 0' }}>
                <div style={{ position:'relative', width:'78px', height:'78px', marginBottom:'18px' }}>
                  <svg className="lm-spinner" style={{ position:'absolute', inset:0 }} width="78" height="78" viewBox="0 0 78 78">
                    <circle cx="39" cy="39" r="35" fill="none" stroke="rgba(212,132,10,0.12)" strokeWidth="3" />
                    <circle cx="39" cy="39" r="35" fill="none" stroke="#d4840a" strokeWidth="3" strokeDasharray="68 152" strokeLinecap="round" />
                  </svg>
                  <div style={{ position:'absolute', inset:'8px', borderRadius:'50%', background:'rgba(11,61,30,0.88)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <img src={Logo} alt="SIBOL" style={{ width:'38px', objectFit:'contain' }} />
                  </div>
                </div>
                <p style={{ fontSize:'15px', fontWeight:500, color:'rgba(255,255,255,0.85)', margin:'0 0 5px' }}>Signing you out…</p>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.30)', margin:0 }}>Clearing your session</p>
              </div>
            )}

            {phase === 'done' && (
              <div className="lm-fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'16px 0' }}>
                <div style={{ width:'78px', height:'78px', borderRadius:'50%', marginBottom:'18px', background:'linear-gradient(135deg,rgba(46,139,87,0.28),rgba(20,80,45,0.22))', border:'1.5px solid rgba(46,139,87,0.48)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 32px rgba(46,139,87,0.24)' }}>
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path className="lm-check" d="M7 15l6 6L23 9" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ fontSize:'15px', fontWeight:500, color:'rgba(255,255,255,0.85)', margin:'0 0 5px' }}>Successfully logged out</p>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.30)', margin:0 }}>Redirecting you now…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default LogoutModal;
