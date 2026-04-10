import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios'
import Leaf from '../assets/leaf.png'

const CropCarePlant = () => {
  const { garden_id, crop_name } = useParams()
  const navigate = useNavigate()
  const gardenEchoRef = useRef(null)

  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [sensorData,   setSensorData]   = useState(null)
  const [cropInfo,     setCropInfo]     = useState(null)
  const [cropProfile,  setCropProfile]  = useState(null)
  const [alerts,       setAlerts]       = useState([])
  const [historyData,  setHistoryData]  = useState([])
  const [isIrrigating, setIsIrrigating] = useState(false)
  const [imageError,   setImageError]   = useState(false)
  const [isModalOpen,  setIsModalOpen]  = useState(false)
  const [modalImage,   setModalImage]   = useState(null)
  const [wsConnected,  setWsConnected]  = useState(false)
  const [lastUpdated,  setLastUpdated]  = useState(null)

  // ── Initial fetch ─────────────────────────────────────────────────────────
  const fetchSensorData = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/getSensorDataCrop/${garden_id}/${crop_name}`)
      if (res.data.success) {
        setCropInfo(res.data.data.crop)
        setCropProfile(res.data.data.crop_profile)
        setSensorData(res.data.data.latest)
        setAlerts(res.data.data.alerts || [])
        setHistoryData(res.data.data.history || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sensor data!')
    } finally {
      setLoading(false)
    }
  }

  // ── Connect / reconnect WebSocket ────────────────────────────────────────
  const connectEcho = () => {
    if (!garden_id || !crop_name) return

    // Tear down any existing connection first
    if (gardenEchoRef.current) {
      gardenEchoRef.current.leaveChannel(`garden.${garden_id}`)
      gardenEchoRef.current.disconnect()
      gardenEchoRef.current = null
    }

    window.Pusher = Pusher

        gardenEchoRef.current = new Echo({
        broadcaster: 'pusher',
        key: '329d2861d0c6f9e42c30',
        cluster: 'ap1',
        forceTLS: true,
        authEndpoint: 'https://sibol-web.onrender.com/api/broadcasting/auth',
        auth: {
            headers: {
                get Authorization() {
                    return `Bearer ${localStorage.getItem('authToken')}`;
                },
                Accept: 'application/json',
            },
        },
    })

    const channel = gardenEchoRef.current.channel(`garden.${garden_id}`)

    channel
      .listen('.sensor.updated', (e) => {
        const d = e.sensor_data

        setSensorData(prev => ({
          ...prev,
          soil_temperature:        d.soil_temperature,
          air_temperature:         d.air_temperature,
          air_humidity:            d.air_humidity,
          soil_moisture:           d.soil_moisture,
          ph:                      d.ph,
          electrical_conductivity: d.electrical_conductivity,
          nitrogen:                d.nitrogen,
          phosphorus:              d.phosphorus,
          potassium:               d.potassium,
          created_at:              d.recorded_at,
        }))

        setHistoryData(prev => [{
          soil_temperature: d.soil_temperature,
          air_temperature:  d.air_temperature,
          air_humidity:     d.air_humidity,
          soil_moisture:    d.soil_moisture,
          created_at:       d.recorded_at,
        }, ...prev].slice(0, 50))

        setLastUpdated(new Date())
        setWsConnected(true)
      })
      .subscribed(() => {
        setWsConnected(true)
      })
      .error(() => {
        setWsConnected(false)
      })
  }

  const handleReconnect = () => {
    setWsConnected(false)
    fetchSensorData()
    connectEcho()
  }

  // ── WebSocket + initial fetch ─────────────────────────────────────────────
  useEffect(() => {
    if (!garden_id || !crop_name) return

    fetchSensorData()
    connectEcho()

    return () => {
      gardenEchoRef.current?.leaveChannel(`garden.${garden_id}`)
      gardenEchoRef.current?.disconnect()
      gardenEchoRef.current = null
    }
  }, [garden_id, crop_name])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isModalOpen) closeImageModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isModalOpen])

  const openImageModal  = (url) => { setModalImage(url); setIsModalOpen(true); document.body.style.overflow = 'hidden' }
  const closeImageModal = ()    => { setIsModalOpen(false); setModalImage(null); document.body.style.overflow = 'unset' }

  // ── Status helpers ────────────────────────────────────────────────────────
  const rangeStatus = (value, min, max, lowLabel = 'Low', highLabel = 'High') => {
    if (!value) return { label: '—', tier: 'unknown' }
    const v = parseFloat(value), mn = parseFloat(min), mx = parseFloat(max)
    if (isNaN(v) || isNaN(mn) || isNaN(mx)) return { label: `${value}`, tier: 'neutral' }
    const tol = (mx - mn) * 0.1
    if (v < mn - tol)       return { label: `Critical – ${lowLabel}`, tier: 'critical' }
    if (v < mn)             return { label: `${lowLabel} – Water Soon`, tier: 'warn' }
    if (v >= mn && v <= mx) return { label: 'Optimal', tier: 'good' }
    if (v <= mx + tol)      return { label: 'Slightly High', tier: 'warn' }
    return { label: `Too High – ${highLabel}`, tier: 'info' }
  }

  const tierStyle = (tier) => ({
    good:    'bg-green-100 text-green-800 border border-green-300',
    warn:    'bg-amber-100 text-amber-800 border border-amber-300',
    critical:'bg-red-100 text-red-800 border border-red-300',
    info:    'bg-blue-100 text-blue-800 border border-blue-300',
    unknown: 'bg-gray-100 text-gray-500 border border-gray-200',
    neutral: 'bg-gray-50 text-gray-700 border border-gray-200',
  }[tier] || 'bg-gray-50 text-gray-700 border border-gray-200')

  const tierBorderClass = (tier) => ({
    good:    'border-green-400',
    warn:    'border-amber-400',
    critical:'border-red-400',
    info:    'border-blue-400',
    unknown: 'border-gray-300',
    neutral: 'border-gray-200',
  }[tier] || 'border-gray-200')

  const tierTextClass = (tier) => ({
    good:    'text-green-800',
    warn:    'text-amber-800',
    critical:'text-red-800',
    info:    'text-blue-800',
    unknown: 'text-gray-500',
    neutral: 'text-gray-700',
  }[tier] || 'text-gray-700')

  const tierBgClass = (tier) => ({
    good:    'bg-green-100',
    warn:    'bg-amber-100',
    critical:'bg-red-100',
    info:    'bg-blue-100',
    unknown: 'bg-gray-100',
    neutral: 'bg-gray-50',
  }[tier] || 'bg-gray-50')

  const tierBarClass = (tier) => ({
    good:    'bg-green-400',
    warn:    'bg-amber-400',
    critical:'bg-red-400',
    info:    'bg-blue-400',
    unknown: 'bg-gray-300',
    neutral: 'bg-gray-200',
  }[tier] || 'bg-gray-200')

  const getSoilMoistureStatus = (moisture) => {
    if (!moisture) return { label: 'Unknown', tier: 'unknown' }
    if (cropProfile?.soil_moisture_min && cropProfile?.soil_moisture_max)
      return rangeStatus(moisture, cropProfile.soil_moisture_min, cropProfile.soil_moisture_max, 'Needs Water', 'Overwatered')
    const v = parseFloat(moisture)
    if (v < 40) return { label: 'Low – Needs Water', tier: 'critical' }
    if (v < 60) return { label: 'Moderate', tier: 'warn' }
    return { label: 'Good', tier: 'good' }
  }

  const getIndividualNutrientStatus = (value, min, max) => {
    if (!min || !max || !value) return 'unknown'
    const v = parseFloat(value), mn = parseFloat(min), mx = parseFloat(max)
    if (v >= mn && v <= mx) return 'good'
    if (v < mn) return 'critical'
    return 'info'
  }

  const getNPKStatus = (n, p, k) => {
    if (!n || !p || !k) return { label: '—', tier: 'unknown' }
    if (cropProfile) {
      const stats = [
        getIndividualNutrientStatus(n, cropProfile.nitrogen_min,   cropProfile.nitrogen_max),
        getIndividualNutrientStatus(p, cropProfile.phosphorus_min, cropProfile.phosphorus_max),
        getIndividualNutrientStatus(k, cropProfile.potassium_min,  cropProfile.potassium_max),
      ]
      const good = stats.filter(s => s === 'good').length
      if (good === 3) return { label: 'Optimal', tier: 'good' }
      if (good >= 2)  return { label: 'Good', tier: 'good' }
      if (good === 1) return { label: 'Needs Attention', tier: 'warn' }
      return { label: 'Critical', tier: 'critical' }
    }
    const avg = (parseFloat(n) + parseFloat(p) + parseFloat(k)) / 3
    if (avg > 70) return { label: 'High', tier: 'good' }
    if (avg > 40) return { label: 'Medium', tier: 'warn' }
    return { label: 'Low', tier: 'critical' }
  }

  const getSimpleStatus = (value, min, max) => {
    if (!value) return { label: '—', tier: 'unknown' }
    if (min && max) return rangeStatus(value, min, max)
    return { label: `${parseFloat(value).toFixed(1)}`, tier: 'neutral' }
  }

  const fmtDate      = (ts) => ts ? new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
  const fmtChartDate = (ts) => ts ? new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  const chartData = historyData?.length
    ? historyData.slice().reverse().map(item => ({
        timestamp:    fmtChartDate(item.created_at),
        soilTemp:     parseFloat(item.soil_temperature) || 0,
        airTemp:      parseFloat(item.air_temperature)  || 0,
        soilMoisture: parseFloat(item.soil_moisture)    || 0,
        humidity:     parseFloat(item.air_humidity)     || 0,
      }))
    : []

  const moistureStatus = getSoilMoistureStatus(sensorData?.soil_moisture)
  const npkStatus      = sensorData ? getNPKStatus(sensorData.nitrogen, sensorData.phosphorus, sensorData.potassium) : { label: '—', tier: 'unknown' }
  const phStatus       = getSimpleStatus(sensorData?.ph,                      cropProfile?.ph_min,                      cropProfile?.ph_max)
  const soilTempStatus = getSimpleStatus(sensorData?.soil_temperature,        cropProfile?.soil_temp_min,                cropProfile?.soil_temp_max)
  const airTempStatus  = getSimpleStatus(sensorData?.air_temperature,         cropProfile?.air_temperature_min,          cropProfile?.air_temperature_max)
  const humidityStatus = getSimpleStatus(sensorData?.air_humidity,            cropProfile?.air_humidity_min,             cropProfile?.air_humidity_max)
  const ecStatus       = getSimpleStatus(sensorData?.electrical_conductivity, cropProfile?.electrical_conductivity_min,  cropProfile?.electrical_conductivity_max)

  const npkDetails = sensorData && cropProfile ? {
    N: { value: parseFloat(sensorData.nitrogen),   status: getIndividualNutrientStatus(sensorData.nitrogen,   cropProfile.nitrogen_min,   cropProfile.nitrogen_max),   range: `${cropProfile.nitrogen_min}-${cropProfile.nitrogen_max}` },
    P: { value: parseFloat(sensorData.phosphorus), status: getIndividualNutrientStatus(sensorData.phosphorus, cropProfile.phosphorus_min, cropProfile.phosphorus_max), range: `${cropProfile.phosphorus_min}-${cropProfile.phosphorus_max}` },
    K: { value: parseFloat(sensorData.potassium),  status: getIndividualNutrientStatus(sensorData.potassium,  cropProfile.potassium_min,  cropProfile.potassium_max),  range: `${cropProfile.potassium_min}-${cropProfile.potassium_max}` },
  } : null

  // ── Sub-components ────────────────────────────────────────────────────────
  const StatusPill = ({ status }) => (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${tierStyle(status.tier)}`}>
      {status.label}
    </span>
  )

  const MetricRow = ({ label, value, unit = '', status }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-black/[0.04]">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm font-semibold text-green-950">{value}{unit}</span>}
        {status && <StatusPill status={status} />}
      </div>
    </div>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-black/[0.08] rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
        <p className="text-gray-400 mb-1.5">{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.color }} className="font-medium">{e.name}: {e.value.toFixed(1)}</p>)}
      </div>
    )
  }

  const ChartEmpty = () => (
    <div className="h-40 bg-[#f7f4ee] rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
      <p className="text-sm text-gray-400">No data yet</p>
    </div>
  )

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7f4ee]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading crop data…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7f4ee]">
      <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="font-semibold text-green-950 mb-1">Error</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate(`/user/crop-care/${garden_id}`)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-950 transition-colors"
        >
          ← Back to Crops
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-[#f7f4ee] min-h-screen font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse-dot { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      <div className="px-5 md:px-9 py-7 pb-24 md:pb-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <button
              onClick={() => navigate(`/user/crop-care/${garden_id}`)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-950 transition-colors mb-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to Crops
            </button>
            <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,40px)] font-bold text-green-950 leading-tight">
              {crop_name || 'Crop Details'}
            </h1>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400 items-center">
              <span>Garden {garden_id}</span>

              {/* WebSocket live indicator */}
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse-dot' : 'bg-gray-300'}`} />
                <span className={wsConnected ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {wsConnected ? 'Live' : 'Not live'}
                </span>
                {!wsConnected && (
                  <button
                    onClick={handleReconnect}
                    title="Reconnect"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-500 text-[11px] font-medium border border-gray-200 hover:border-green-300 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                    Reload
                  </button>
                )}
              </span>

              {lastUpdated && <><span>·</span><span>Updated {fmtDate(lastUpdated)}</span></>}
              {cropProfile && <><span>·</span><span className="text-green-600 font-semibold">✓ Profile Active</span></>}
            </div>
          </div>

          <button
            onClick={() => setIsIrrigating(v => !v)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 shrink-0 ${
              isIrrigating ? 'bg-green-600 ring-4 ring-green-300/50' : 'bg-green-950 hover:bg-green-800'
            }`}
          >
            <svg className={`w-4 h-4 ${isIrrigating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            {isIrrigating ? 'Irrigating…' : 'Start Irrigation'}
          </button>
        </div>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mb-5">

          {/* COL 1: Crop image + moisture */}
          <div className="bg-white rounded-2xl p-[22px] border border-black/[0.05] flex flex-col items-center">
            <div className="relative w-full max-w-[200px]">
              {cropInfo?.image && !imageError ? (
                <>
                  <img
                    src={cropInfo.image}
                    alt={crop_name}
                    onError={() => setImageError(true)}
                    className={`w-full rounded-[14px] object-cover transition-all duration-500 border-[3px] ${tierBorderClass(moistureStatus.tier)}`}
                  />
                  <div className="mt-2"><StatusPill status={moistureStatus} /></div>
                </>
              ) : (
                <div className="w-full h-44 bg-[#f7f4ee] rounded-[14px] flex items-center justify-center border-2 border-dashed border-gray-200">
                  <span className="text-4xl">🌿</span>
                </div>
              )}
            </div>

            {cropInfo && (
              <div className="w-full mt-3.5 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Crop Type</p>
                <p className="text-[15px] font-semibold text-green-950 mb-3">{cropInfo.variety || 'N/A'}</p>

                {sensorData?.soil_moisture && (
                  <div className={`rounded-xl p-3 text-left border-2 ${tierBorderClass(moistureStatus.tier)} ${tierBgClass(moistureStatus.tier)}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-gray-500">Soil Moisture</span>
                      <span className={`text-sm font-bold ${tierTextClass(moistureStatus.tier)}`}>
                        {sensorData.soil_moisture}%
                      </span>
                    </div>
                    <div className="w-full bg-black/[0.08] rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${tierBarClass(moistureStatus.tier)}`}
                        style={{ width: `${Math.min(parseFloat(sensorData.soil_moisture), 100)}%` }}
                      />
                    </div>
                    <p className={`text-[11px] mt-1 font-medium ${tierTextClass(moistureStatus.tier)}`}>
                      {moistureStatus.label}
                    </p>
                    {cropProfile?.soil_moisture_min && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Range: {cropProfile.soil_moisture_min}–{cropProfile.soil_moisture_max}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COL 2: Soil & Environment */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-black/[0.05] flex-1">
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-green-950 mb-3.5 flex items-center gap-1.5">
                🌱 Soil & Root
              </h3>
              <MetricRow label="Soil Moisture" value={sensorData?.soil_moisture}                                                                     unit="%" status={moistureStatus} />
              <MetricRow label="Soil pH"        value={sensorData?.ph ? parseFloat(sensorData.ph).toFixed(1) : null}                                            status={phStatus} />
              <MetricRow label="Soil Temp"      value={sensorData?.soil_temperature}                                                                 unit="°C" status={soilTempStatus} />
              <MetricRow label="NPK Status"     status={npkStatus} />
              {npkDetails && (
                <div className="mt-3 pt-3 border-t border-black/[0.06]">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">NPK Breakdown</p>
                  {Object.entries(npkDetails).map(([key, d]) => (
                    <div key={key} className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-500">
                        {key}: <strong className="text-green-950">{isNaN(d.value) ? '—' : d.value.toFixed(0)}</strong>
                      </span>
                      <StatusPill status={{ label: d.status, tier: d.status }} />
                    </div>
                  ))}
                  {cropProfile && (
                    <p className="text-[10px] text-gray-300 mt-1.5">
                      N({npkDetails.N.range}) P({npkDetails.P.range}) K({npkDetails.K.range})
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-black/[0.05]">
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-green-950 mb-3.5 flex items-center gap-1.5">
                🌤 Environment
              </h3>
              <MetricRow label="Air Temp" value={sensorData?.air_temperature}                                                                                     unit="°C" status={airTempStatus} />
              <MetricRow label="Humidity" value={sensorData?.air_humidity}                                                                                        unit="%"  status={humidityStatus} />
              <MetricRow label="Lux"      value={sensorData?.rainfall ? `${sensorData.rainfall} mm` : null} />
              <MetricRow label="EC"       value={sensorData?.electrical_conductivity ? parseFloat(sensorData.electrical_conductivity).toFixed(2) : null}                    status={ecStatus} />
              {cropProfile?.air_temperature_min && (
                <p className="text-[10px] text-gray-300 mt-2.5">
                  Temp {cropProfile.air_temperature_min}–{cropProfile.air_temperature_max}°C · Humidity {cropProfile.air_humidity_min}–{cropProfile.air_humidity_max}%
                </p>
              )}
            </div>
          </div>

          {/* COL 3: Leaf + Alerts */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-black/[0.05]">
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-green-950 mb-3.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">🍃 Leaf Condition</span>
                {cropInfo?.detection_results?.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                    {cropInfo.detection_results.length}
                  </span>
                )}
              </h3>
              {cropInfo?.detection_results?.length > 0 ? (
                <div>
                  {cropInfo.detection_results[0]?.image_url && (
                    <div className="relative flex justify-center mb-3">
                      <img
                        src={cropInfo.detection_results[0].image_url}
                        alt="Leaf"
                        onClick={() => openImageModal(cropInfo.detection_results[0].image_url)}
                        className="w-[110px] h-[110px] object-cover rounded-xl border-2 border-green-200 cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      <span className="absolute -top-1 right-[calc(50%-59px)] bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cropInfo.detection_results.map((r, i) => {
                      const healthy = r.detected_class.toLowerCase().includes('healthy')
                      const name    = r.detected_class.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                      return (
                        <span key={i} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${healthy ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                          {healthy ? '✓' : '⚠'} {name}
                        </span>
                      )
                    })}
                  </div>
                  <div className="flex gap-2.5">
                    <div className="flex-1 bg-[#f7f4ee] rounded-[10px] p-2.5 text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">Avg Confidence</p>
                      <p className="text-base font-bold text-green-950">
                        {(cropInfo.detection_results.reduce((s, r) => s + parseFloat(r.confidence), 0) / cropInfo.detection_results.length * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex-1 bg-[#f7f4ee] rounded-[10px] p-2.5 text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">Last Scan</p>
                      <p className="text-[11px] font-medium text-green-950">
                        {cropInfo.detection_results[0]?.created_at
                          ? new Date(cropInfo.detection_results[0].created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <img src={Leaf} alt="" className="w-12 opacity-20 mx-auto mb-2" />
                  <p className="text-xs font-medium">No analysis yet</p>
                  <p className="text-[11px]">Waiting for scan…</p>
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-2xl p-5 border border-black/[0.05] flex-1 flex flex-col">
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-green-950 mb-3.5 flex items-center gap-1.5">
                ⚠️ Alerts
              </h3>
              <div className="overflow-y-auto flex-1 max-h-[200px] flex flex-col gap-2">
                {alerts?.length > 0 ? alerts.map((alert, i) => {
                  const tier = alert.severity === 'high' ? 'critical' : alert.severity === 'medium' ? 'warn' : 'info'
                  return (
                    <div key={i} className={`px-3 py-2.5 rounded-[10px] text-xs ${tierStyle(tier)}`}>
                      <p className="font-medium">{alert.message}</p>
                      {alert.timestamp && <p className="opacity-70 mt-0.5 text-[10px]">{fmtDate(alert.timestamp)}</p>}
                    </div>
                  )
                }) : (
                  <div className="text-center py-7 text-gray-400">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm font-medium">No alerts</p>
                    <p className="text-[11px]">All systems normal</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.05]">
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-green-950 mb-5 flex items-center gap-2">
            📈 Trend & Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Temperature Trend</p>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-35} textAnchor="end" height={54} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="soilTemp" stroke="#8b5cf6" strokeWidth={2} name="Soil Temp" dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="airTemp"  stroke="#f59e0b" strokeWidth={2} name="Air Temp"  dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <ChartEmpty />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Moisture & Humidity Trend</p>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-35} textAnchor="end" height={54} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2} name="Soil Moisture" dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="humidity"     stroke="#3b82f6" strokeWidth={2} name="Air Humidity"  dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <ChartEmpty />}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isModalOpen && modalImage && (
        <div onClick={closeImageModal} className="animate-fade-in fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-[800px] w-full">
            <button onClick={closeImageModal} className="absolute -top-10 right-0 bg-transparent border-none text-white cursor-pointer text-xl hover:opacity-70 transition-opacity">
              ✕ Close
            </button>
            <img src={modalImage} alt="Leaf detection" onClick={e => e.stopPropagation()} className="w-full rounded-2xl object-contain" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3.5 pt-6 rounded-b-2xl">
              <p className="text-white text-sm font-medium">Leaf Detection Analysis — AI Processed</p>
              <p className="text-white/60 text-[11px] mt-0.5">Press ESC or click outside to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CropCarePlant
