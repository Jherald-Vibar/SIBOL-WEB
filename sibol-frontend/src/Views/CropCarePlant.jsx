import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios'
import Leaf from '../assets/leaf.png'

const CropCarePlant = () => {
  const { garden_id, crop_name } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sensorData, setSensorData] = useState(null)
  const [cropInfo, setCropInfo] = useState(null)
  const [cropProfile, setCropProfile] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [historyData, setHistoryData] = useState([])
  const [isIrrigating, setIsIrrigating] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState(null)

  useEffect(() => {
    const fetchSensorData = async () => {
      setLoading(true)
      try {
        const response = await axiosClient.get(`/getSensorDataCrop/${garden_id}/${crop_name}`)
        if (response.data.success) {
          setCropInfo(response.data.data.crop)
          setCropProfile(response.data.data.crop_profile)
          setSensorData(response.data.data.latest)
          setAlerts(response.data.data.alerts || [])
          setHistoryData(response.data.data.history || [])
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch sensor data!")
      } finally {
        setLoading(false)
      }
    }
    if (garden_id && crop_name) {
      fetchSensorData()
      const interval = setInterval(fetchSensorData, 10000)
      return () => clearInterval(interval)
    }
  }, [garden_id, crop_name])

  useEffect(() => {
    const handleEscape = (e) => { if (e.key==='Escape'&&isModalOpen) closeImageModal() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  const openImageModal = (url) => { setModalImage(url); setIsModalOpen(true); document.body.style.overflow='hidden' }
  const closeImageModal = () => { setIsModalOpen(false); setModalImage(null); document.body.style.overflow='unset' }

  // ── Status helpers ──
  const rangeStatus = (value, min, max, lowLabel='Low', highLabel='High') => {
    if (!value) return { label:'—', tier:'unknown' }
    const v=parseFloat(value), mn=parseFloat(min), mx=parseFloat(max)
    if (isNaN(v)||isNaN(mn)||isNaN(mx)) return { label:`${value}`, tier:'neutral' }
    const range=mx-mn, tol=range*0.1
    if (v < mn-tol) return { label:`Critical – ${lowLabel}`, tier:'critical' }
    if (v < mn) return { label:`${lowLabel} – Water Soon`, tier:'warn' }
    if (v >= mn && v <= mx) return { label:'Optimal', tier:'good' }
    if (v <= mx+tol) return { label:'Slightly High', tier:'warn' }
    return { label:`Too High – ${highLabel}`, tier:'info' }
  }

  const tierColor = (tier) => ({
    good:    { text:'#166534', bg:'#dcfce7', border:'#4ade80' },
    warn:    { text:'#92400e', bg:'#fef3c7', border:'#fbbf24' },
    critical:{ text:'#991b1b', bg:'#fee2e2', border:'#f87171' },
    info:    { text:'#1e40af', bg:'#dbeafe', border:'#60a5fa' },
    unknown: { text:'#6b7280', bg:'#f3f4f6', border:'#d1d5db' },
    neutral: { text:'#374151', bg:'#f9fafb', border:'#e5e7eb' },
  }[tier] || { text:'#374151', bg:'#f9fafb', border:'#e5e7eb' })

  const getSoilMoistureStatus = (moisture) => {
    if (!moisture) return { label:'Unknown', tier:'unknown' }
    if (cropProfile?.soil_moisture_min && cropProfile?.soil_moisture_max)
      return rangeStatus(moisture, cropProfile.soil_moisture_min, cropProfile.soil_moisture_max, 'Needs Water', 'Overwatered')
    const v=parseFloat(moisture)
    if (v<40) return { label:'Low – Needs Water', tier:'critical' }
    if (v<60) return { label:'Moderate', tier:'warn' }
    return { label:'Good', tier:'good' }
  }

  const getIndividualNutrientStatus = (value, min, max) => {
    if (!min||!max||!value) return 'unknown'
    const v=parseFloat(value),mn=parseFloat(min),mx=parseFloat(max)
    if (v>=mn&&v<=mx) return 'good'
    if (v<mn) return 'critical'
    return 'info'
  }

  const getNPKStatus = (n,p,k) => {
    if (!n||!p||!k) return { label:'—', tier:'unknown' }
    if (cropProfile) {
      const stats=[
        getIndividualNutrientStatus(n,cropProfile.nitrogen_min,cropProfile.nitrogen_max),
        getIndividualNutrientStatus(p,cropProfile.phosphorus_min,cropProfile.phosphorus_max),
        getIndividualNutrientStatus(k,cropProfile.potassium_min,cropProfile.potassium_max),
      ]
      const good=stats.filter(s=>s==='good').length
      if (good===3) return { label:'Optimal', tier:'good' }
      if (good>=2) return { label:'Good', tier:'good' }
      if (good===1) return { label:'Needs Attention', tier:'warn' }
      return { label:'Critical', tier:'critical' }
    }
    const avg=(parseFloat(n)+parseFloat(p)+parseFloat(k))/3
    if (avg>70) return { label:'High', tier:'good' }
    if (avg>40) return { label:'Medium', tier:'warn' }
    return { label:'Low', tier:'critical' }
  }

  const getSimpleStatus = (value, min, max) => {
    if (!value) return { label:'—', tier:'unknown' }
    if (min&&max) return rangeStatus(value,min,max)
    return { label:`${parseFloat(value).toFixed(1)}`, tier:'neutral' }
  }

  const formatDate = (ts) => ts ? new Date(ts).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : ''
  const formatChartDate = (ts) => ts ? new Date(ts).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : ''

  const prepareChartData = () => {
    if (!historyData?.length) return []
    return historyData.slice().reverse().map(item => ({
      timestamp: formatChartDate(item.created_at),
      soilTemp: parseFloat(item.soil_temperature)||0,
      airTemp: parseFloat(item.air_temperature)||0,
      soilMoisture: parseFloat(item.soil_moisture)||0,
      humidity: parseFloat(item.air_humidity)||0,
    }))
  }
  const chartData = prepareChartData()

  const moistureStatus = getSoilMoistureStatus(sensorData?.soil_moisture)
  const npkStatus = sensorData ? getNPKStatus(sensorData.nitrogen,sensorData.phosphorus,sensorData.potassium) : { label:'—',tier:'unknown' }
  const phStatus = getSimpleStatus(sensorData?.ph, cropProfile?.ph_min, cropProfile?.ph_max)
  const soilTempStatus = getSimpleStatus(sensorData?.soil_temperature, cropProfile?.soil_temp_min, cropProfile?.soil_temp_max)
  const airTempStatus = getSimpleStatus(sensorData?.air_temperature, cropProfile?.air_temperature_min, cropProfile?.air_temperature_max)
  const humidityStatus = getSimpleStatus(sensorData?.air_humidity, cropProfile?.air_humidity_min, cropProfile?.air_humidity_max)
  const ecStatus = getSimpleStatus(sensorData?.electrical_conductivity, cropProfile?.electrical_conductivity_min, cropProfile?.electrical_conductivity_max)

  const npkDetails = sensorData && cropProfile ? {
    N: { value: parseFloat(sensorData.nitrogen), status: getIndividualNutrientStatus(sensorData.nitrogen,cropProfile.nitrogen_min,cropProfile.nitrogen_max), range:`${cropProfile.nitrogen_min}-${cropProfile.nitrogen_max}` },
    P: { value: parseFloat(sensorData.phosphorus), status: getIndividualNutrientStatus(sensorData.phosphorus,cropProfile.phosphorus_min,cropProfile.phosphorus_max), range:`${cropProfile.phosphorus_min}-${cropProfile.phosphorus_max}` },
    K: { value: parseFloat(sensorData.potassium), status: getIndividualNutrientStatus(sensorData.potassium,cropProfile.potassium_min,cropProfile.potassium_max), range:`${cropProfile.potassium_min}-${cropProfile.potassium_max}` },
  } : null

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null
    return (
      <div style={{ background:'#fff',padding:'10px 14px',border:'1px solid rgba(0,0,0,0.08)',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.08)',fontSize:12 }}>
        <p style={{ color:'#9ca3af',marginBottom:6 }}>{label}</p>
        {payload.map((e,i) => <p key={i} style={{ color:e.color,fontWeight:500 }}>{e.name}: {e.value.toFixed(1)}</p>)}
      </div>
    )
  }

  const StatusPill = ({ status }) => {
    const c = tierColor(status.tier)
    return (
      <span style={{ display:'inline-block',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:600,background:c.bg,color:c.text,border:`1px solid ${c.border}` }}>
        {status.label}
      </span>
    )
  }

  const MetricRow = ({ label, value, unit='', status }) => (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
      <span style={{ fontSize:12,color:'#9ca3af' }}>{label}</span>
      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
        {value && <span style={{ fontSize:14,fontWeight:600,color:'#0b3d1e' }}>{value}{unit}</span>}
        {status && <StatusPill status={status} />}
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#f7f4ee' }}>
      <div style={{ padding:32,textAlign:'center',background:'#fff',borderRadius:18,boxShadow:'0 8px 32px rgba(0,0,0,0.08)',maxWidth:360 }}>
        <div style={{ fontSize:40,marginBottom:12 }}>⚠️</div>
        <p style={{ fontWeight:600,color:'#0b3d1e',marginBottom:4 }}>Error</p>
        <p style={{ fontSize:14,color:'#6b7280' }}>{error}</p>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#f7f4ee',minHeight:'100vh',display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @media(max-width:768px){
          .ccp-sidebar{display:none!important}
          .ccp-main{margin-left:0!important;padding-bottom:72px!important}
          .ccp-content{padding:16px!important}
          .ccp-grid3{grid-template-columns:1fr!important}
          .ccp-charts{grid-template-columns:1fr!important}
          .ccp-top{flex-direction:column!important;align-items:flex-start!important}
        }
      `}</style>

      {/* Sidebar */}
      <div className="ccp-sidebar" style={{ width:256,background:'#0b3d1e',position:'fixed',top:0,left:0,height:'100vh',zIndex:40,boxShadow:'4px 0 20px rgba(11,61,30,0.15)' }}>
        <UserSidebar />
      </div>

      {/* Main */}
      <div className="ccp-main" style={{ flex:1,display:'flex',flexDirection:'column',marginLeft:256 }}>
        <div style={{ background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.06)',position:'sticky',top:0,zIndex:30 }}>
          <UserNavbar />
        </div>

        <div className="ccp-content" style={{ padding:'28px 36px' }}>

          {/* Page Header */}
          <div className="ccp-top" style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,gap:16 }}>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,3.5vw,40px)',fontWeight:700,color:'#0b3d1e',lineHeight:1.1 }}>
                {crop_name || 'Crop Details'}
              </h1>
              <div style={{ display:'flex',flexWrap:'wrap',gap:12,marginTop:6,fontSize:12,color:'#9ca3af' }}>
                <span>Garden {garden_id}</span>
                {sensorData?.created_at && <><span>·</span><span>Updated {formatDate(sensorData.created_at)}</span></>}
                {cropProfile && <><span>·</span><span style={{ color:'#2e8b57',fontWeight:600 }}>✓ Profile Active</span></>}
              </div>
            </div>
            <button
              onClick={() => setIsIrrigating(!isIrrigating)}
              style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:100,border:'none',background:isIrrigating?'#16a34a':'#0b3d1e',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:'pointer',transition:'all 0.3s',boxShadow:isIrrigating?'0 0 0 4px rgba(22,163,74,0.2)':'none',flexShrink:0 }}
            >
              <svg style={{ width:16,height:16,animation:isIrrigating?'spin 2s linear infinite':undefined }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {isIrrigating ? 'Irrigating…' : 'Start Irrigation'}
            </button>
          </div>

          {/* Three column grid */}
          <div className="ccp-grid3" style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18,marginBottom:20 }}>

            {/* ── COL 1: Crop Image Card ── */}
            <div style={{ background:'#fff',borderRadius:18,padding:22,border:'1px solid rgba(0,0,0,0.05)',display:'flex',flexDirection:'column',alignItems:'center' }}>
              <div style={{ position:'relative',width:'100%',maxWidth:200 }}>
                {cropInfo?.image && !imageError ? (
                  <>
                    <img
                      src={cropInfo.image}
                      alt={crop_name}
                      onError={() => setImageError(true)}
                      style={{ width:'100%',borderRadius:14,objectFit:'cover',border:`3px solid ${tierColor(moistureStatus.tier).border}`,transition:'border-color 0.5s' }}
                    />
                    <StatusPill status={moistureStatus} />
                  </>
                ) : (
                  <div style={{ width:'100%',height:180,background:'#f7f4ee',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',border:'2px dashed #e5e7eb' }}>
                    <span style={{ fontSize:40 }}>🌿</span>
                  </div>
                )}
              </div>
              {cropInfo && (
                <div style={{ width:'100%',marginTop:14,textAlign:'center' }}>
                  <p style={{ fontSize:12,color:'#9ca3af',marginBottom:2 }}>Crop Type</p>
                  <p style={{ fontSize:15,fontWeight:600,color:'#0b3d1e',marginBottom:12 }}>{cropInfo.variety||'N/A'}</p>
                  {sensorData?.soil_moisture && (
                    <div style={{ background:tierColor(moistureStatus.tier).bg,border:`1.5px solid ${tierColor(moistureStatus.tier).border}`,borderRadius:12,padding:'12px 14px',textAlign:'left' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                        <span style={{ fontSize:11,color:'#6b7280' }}>Soil Moisture</span>
                        <span style={{ fontSize:14,fontWeight:700,color:tierColor(moistureStatus.tier).text }}>{sensorData.soil_moisture}%</span>
                      </div>
                      <div style={{ width:'100%',background:'rgba(0,0,0,0.08)',borderRadius:100,height:4,overflow:'hidden' }}>
                        <div style={{ height:'100%',borderRadius:100,background:tierColor(moistureStatus.tier).border,width:`${Math.min(parseFloat(sensorData.soil_moisture),100)}%`,transition:'width 0.5s' }} />
                      </div>
                      <p style={{ fontSize:11,marginTop:5,fontWeight:500,color:tierColor(moistureStatus.tier).text }}>{moistureStatus.label}</p>
                      {cropProfile?.soil_moisture_min && <p style={{ fontSize:10,color:'#9ca3af',marginTop:2 }}>Range: {cropProfile.soil_moisture_min}–{cropProfile.soil_moisture_max}%</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── COL 2: Soil Condition ── */}
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ background:'#fff',borderRadius:18,padding:20,border:'1px solid rgba(0,0,0,0.05)',flex:1 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#0b3d1e',marginBottom:14,display:'flex',alignItems:'center',gap:6 }}>🌱 Soil & Root</h3>
                <MetricRow label="Soil Moisture" value={sensorData?.soil_moisture} unit="%" status={moistureStatus} />
                <MetricRow label="Soil pH" value={sensorData?.ph ? parseFloat(sensorData.ph).toFixed(1) : null} status={phStatus} />
                <MetricRow label="Soil Temp" value={sensorData?.soil_temperature} unit="°C" status={soilTempStatus} />
                <MetricRow label="NPK Status" status={npkStatus} />
                {npkDetails && (
                  <div style={{ marginTop:12,paddingTop:12,borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8 }}>NPK Breakdown</p>
                    {Object.entries(npkDetails).map(([key,d]) => (
                      <div key={key} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                        <span style={{ fontSize:12,color:'#6b7280' }}>{key}: <strong style={{ color:'#0b3d1e' }}>{isNaN(d.value)?'—':d.value.toFixed(0)}</strong></span>
                        <StatusPill status={{ label:d.status, tier:d.status }} />
                      </div>
                    ))}
                    {cropProfile && <p style={{ fontSize:10,color:'#b0b7c3',marginTop:6 }}>N({npkDetails.N.range}) P({npkDetails.P.range}) K({npkDetails.K.range})</p>}
                  </div>
                )}
              </div>

              {/* Environmental */}
              <div style={{ background:'#fff',borderRadius:18,padding:20,border:'1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#0b3d1e',marginBottom:14,display:'flex',alignItems:'center',gap:6 }}>🌤 Environment</h3>
                <MetricRow label="Air Temp" value={sensorData?.air_temperature} unit="°C" status={airTempStatus} />
                <MetricRow label="Humidity" value={sensorData?.air_humidity} unit="%" status={humidityStatus} />
                <MetricRow label="Lux" value={sensorData?.rainfall ? `${sensorData.rainfall} mm` : null} />
                <MetricRow label="EC" value={sensorData?.electrical_conductivity ? parseFloat(sensorData.electrical_conductivity).toFixed(2) : null} status={ecStatus} />
                {cropProfile?.air_temperature_min && (
                  <p style={{ fontSize:10,color:'#b0b7c3',marginTop:10 }}>
                    Temp {cropProfile.air_temperature_min}–{cropProfile.air_temperature_max}°C · Humidity {cropProfile.air_humidity_min}–{cropProfile.air_humidity_max}%
                  </p>
                )}
              </div>
            </div>

            {/* ── COL 3: Leaf + Alerts ── */}
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              {/* Leaf Card */}
              <div style={{ background:'#fff',borderRadius:18,padding:20,border:'1px solid rgba(0,0,0,0.05)',flex:'0 0 auto' }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#0b3d1e',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <span style={{ display:'flex',alignItems:'center',gap:6 }}>🍃 Leaf Condition</span>
                  {cropInfo?.detection_results?.length > 0 && (
                    <span style={{ padding:'2px 8px',borderRadius:100,background:'#dcfce7',color:'#166534',fontSize:11,fontWeight:700 }}>{cropInfo.detection_results.length}</span>
                  )}
                </h3>
                {cropInfo?.detection_results?.length > 0 ? (
                  <div>
                    {cropInfo.detection_results[0]?.image_url && (
                      <div style={{ position:'relative',display:'flex',justifyContent:'center',marginBottom:12 }}>
                        <img
                          src={cropInfo.detection_results[0].image_url}
                          alt="Leaf"
                          onClick={() => openImageModal(cropInfo.detection_results[0].image_url)}
                          style={{ width:110,height:110,objectFit:'cover',borderRadius:12,border:'2px solid #bbf7d0',cursor:'pointer' }}
                        />
                        <span style={{ position:'absolute',top:-4,right:'calc(50% - 59px)',background:'#16a34a',color:'#fff',fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:100 }}>AI</span>
                      </div>
                    )}
                    <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:12 }}>
                      {cropInfo.detection_results.map((r,i) => {
                        const isHealthy = r.detected_class.toLowerCase().includes('healthy')
                        const name = r.detected_class.split('_').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ')
                        return (
                          <span key={i} style={{ padding:'4px 10px',borderRadius:100,fontSize:11,fontWeight:600,background:isHealthy?'#dcfce7':'#fef3c7',color:isHealthy?'#166534':'#92400e',border:`1px solid ${isHealthy?'#86efac':'#fcd34d'}` }}>
                            {isHealthy?'✓':'⚠'} {name}
                          </span>
                        )
                      })}
                    </div>
                    <div style={{ display:'flex',gap:10 }}>
                      <div style={{ flex:1,background:'#f7f4ee',borderRadius:10,padding:'10px 12px',textAlign:'center' }}>
                        <p style={{ fontSize:10,color:'#9ca3af',marginBottom:2 }}>Avg Confidence</p>
                        <p style={{ fontSize:16,fontWeight:700,color:'#0b3d1e' }}>
                          {(cropInfo.detection_results.reduce((s,r)=>s+parseFloat(r.confidence),0)/cropInfo.detection_results.length*100).toFixed(0)}%
                        </p>
                      </div>
                      <div style={{ flex:1,background:'#f7f4ee',borderRadius:10,padding:'10px 12px',textAlign:'center' }}>
                        <p style={{ fontSize:10,color:'#9ca3af',marginBottom:2 }}>Last Scan</p>
                        <p style={{ fontSize:11,fontWeight:500,color:'#0b3d1e' }}>
                          {cropInfo.detection_results[0]?.created_at ? new Date(cropInfo.detection_results[0].created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign:'center',padding:'24px 0',color:'#9ca3af' }}>
                    <img src={Leaf} alt="" style={{ width:48,opacity:0.2,margin:'0 auto 8px' }} />
                    <p style={{ fontSize:12,fontWeight:500 }}>No analysis yet</p>
                    <p style={{ fontSize:11 }}>Waiting for scan…</p>
                  </div>
                )}
              </div>

              {/* Alerts Card */}
              <div style={{ background:'#fff',borderRadius:18,padding:20,border:'1px solid rgba(0,0,0,0.05)',flex:1,display:'flex',flexDirection:'column' }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#0b3d1e',marginBottom:14,display:'flex',alignItems:'center',gap:6 }}>⚠️ Alerts</h3>
                <div style={{ overflowY:'auto',flex:1,maxHeight:200 }}>
                  {alerts?.length > 0 ? alerts.map((alert,i) => {
                    const tier = alert.severity==='high'?'critical':alert.severity==='medium'?'warn':'info'
                    const c = tierColor(tier)
                    return (
                      <div key={i} style={{ padding:'10px 12px',borderRadius:10,background:c.bg,border:`1px solid ${c.border}`,marginBottom:8,fontSize:12,color:c.text }}>
                        <p style={{ fontWeight:500 }}>{alert.message}</p>
                        {alert.timestamp && <p style={{ opacity:0.7,marginTop:3,fontSize:10 }}>{formatDate(alert.timestamp)}</p>}
                      </div>
                    )
                  }) : (
                    <div style={{ textAlign:'center',padding:'28px 0',color:'#9ca3af' }}>
                      <div style={{ fontSize:32,marginBottom:8 }}>✅</div>
                      <p style={{ fontSize:13,fontWeight:500 }}>No alerts</p>
                      <p style={{ fontSize:11 }}>All systems normal</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── CHARTS ── */}
          <div style={{ background:'#fff',borderRadius:18,padding:24,border:'1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#0b3d1e',marginBottom:20,display:'flex',alignItems:'center',gap:8 }}>
              📈 Trend & Analytics
            </h3>
            <div className="ccp-charts" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24 }}>
              {/* Temperature */}
              <div>
                <p style={{ fontSize:12,fontWeight:500,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:12 }}>Temperature Trend</p>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="timestamp" tick={{ fontSize:10,fill:'#9ca3af' }} angle={-35} textAnchor="end" height={54} />
                      <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} label={{ value:'°C',angle:-90,position:'insideLeft',fill:'#9ca3af',fontSize:11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize:11 }} />
                      <Line type="monotone" dataKey="soilTemp" stroke="#8b5cf6" strokeWidth={2} name="Soil Temp" dot={{ r:2 }} activeDot={{ r:5 }} />
                      <Line type="monotone" dataKey="airTemp" stroke="#f59e0b" strokeWidth={2} name="Air Temp" dot={{ r:2 }} activeDot={{ r:5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:160,background:'#f7f4ee',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',border:'2px dashed #e5e7eb' }}>
                    <p style={{ fontSize:13,color:'#9ca3af' }}>No data yet</p>
                  </div>
                )}
              </div>
              {/* Moisture */}
              <div>
                <p style={{ fontSize:12,fontWeight:500,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:12 }}>Moisture Trend</p>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="timestamp" tick={{ fontSize:10,fill:'#9ca3af' }} angle={-35} textAnchor="end" height={54} />
                      <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} label={{ value:'%',angle:-90,position:'insideLeft',fill:'#9ca3af',fontSize:11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize:11 }} />
                      <Line type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2} name="Soil Moisture" dot={{ r:2 }} activeDot={{ r:5 }} />
                      <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Air Humidity" dot={{ r:2 }} activeDot={{ r:5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:160,background:'#f7f4ee',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',border:'2px dashed #e5e7eb' }}>
                    <p style={{ fontSize:13,color:'#9ca3af' }}>No data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div style={{ display:'none' }} className="ccp-mobile">
        <UserSidebar />
      </div>

      {/* Image Lightbox */}
      {isModalOpen && modalImage && (
        <div onClick={closeImageModal} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16,animation:'fadeIn 0.2s ease-out' }}>
          <div style={{ position:'relative',maxWidth:800,width:'100%' }}>
            <button onClick={closeImageModal} style={{ position:'absolute',top:-40,right:0,background:'transparent',border:'none',color:'#fff',cursor:'pointer',fontSize:20 }}>✕ Close</button>
            <img src={modalImage} alt="Leaf detection" onClick={e => e.stopPropagation()} style={{ width:'100%',borderRadius:16,objectFit:'contain' }} />
            <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top,rgba(0,0,0,0.6),transparent)',padding:'24px 16px 14px',borderRadius:'0 0 16px 16px' }}>
              <p style={{ color:'#fff',fontSize:13,fontWeight:500 }}>Leaf Detection Analysis — AI Processed</p>
              <p style={{ color:'rgba(255,255,255,0.6)',fontSize:11,marginTop:2 }}>Press ESC or click outside to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CropCarePlant
