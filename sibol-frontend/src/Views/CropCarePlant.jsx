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
        console.log(response.data.data);
      } catch (error) {
        console.error(error)
        setError(error.response?.data?.message || "Failed to fetch sensor data!")
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

  const handleImageError = () => { setImageError(true) }
  const handleIrrigateToggle = () => { setIsIrrigating(!isIrrigating) }

  // Profile-based soil moisture status
  const getSoilMoistureStatus = (moisture) => {
    if (!moisture) return {
      status: 'Unknown',
      color: 'border-gray-300',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderWidth: 'border-4'
    }

    const value = parseFloat(moisture)

    // Use crop profile if available
    if (cropProfile?.soil_moisture_min && cropProfile?.soil_moisture_max) {
      const min = parseFloat(cropProfile.soil_moisture_min)
      const max = parseFloat(cropProfile.soil_moisture_max)
      const range = max - min
      const tolerance = range * 0.1 // 10% tolerance

      if (value < min - tolerance) {
        return {
          status: 'Critical - Needs Water',
          color: 'border-red-600',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderWidth: 'border-4'
        }
      } else if (value < min) {
        return {
          status: 'Low - Water Soon',
          color: 'border-orange-500',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderWidth: 'border-4'
        }
      } else if (value >= min && value <= max) {
        return {
          status: 'Optimal',
          color: 'border-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderWidth: 'border-4'
        }
      } else if (value <= max + tolerance) {
        return {
          status: 'Slightly High',
          color: 'border-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderWidth: 'border-4'
        }
      } else {
        return {
          status: 'Too High - Overwatered',
          color: 'border-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderWidth: 'border-4'
        }
      }
    }

    // Fallback to generic thresholds
    if (value < 40) return {
      status: 'Low - Needs Water',
      color: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderWidth: 'border-4'
    }
    else if (value >= 40 && value < 60) return {
      status: 'Moderate',
      color: 'border-orange-400',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderWidth: 'border-4'
    }
    else return {
      status: 'Good',
      color: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderWidth: 'border-4'
    }
  }

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setModalImage(null)
    document.body.style.overflow = 'unset'
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeImageModal()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  // Helper function to check individual nutrient status
  const getIndividualNutrientStatus = (value, min, max) => {
    if (!min || !max || !value) return 'unknown'
    const numValue = parseFloat(value)
    const numMin = parseFloat(min)
    const numMax = parseFloat(max)

    if (numValue >= numMin && numValue <= numMax) return 'optimal'
    if (numValue < numMin) return 'low'
    return 'high'
  }

  // Profile-based NPK status
  const getNPKStatus = (n, p, k) => {
    if (!n || !p || !k) return { text: '—', color: 'text-gray-500', detail: '' }

    const nitrogen = parseFloat(n)
    const phosphorus = parseFloat(p)
    const potassium = parseFloat(k)

    // Use crop profile if available
    if (cropProfile) {
      const nStatus = getIndividualNutrientStatus(
        nitrogen,
        cropProfile.nitrogen_min,
        cropProfile.nitrogen_max
      )
      const pStatus = getIndividualNutrientStatus(
        phosphorus,
        cropProfile.phosphorus_min,
        cropProfile.phosphorus_max
      )
      const kStatus = getIndividualNutrientStatus(
        potassium,
        cropProfile.potassium_min,
        cropProfile.potassium_max
      )

      // Count how many are in optimal range
      const optimalCount = [nStatus, pStatus, kStatus].filter(s => s === 'optimal').length

      if (optimalCount === 3) {
        return {
          text: 'Optimal',
          color: 'text-green-600',
          detail: 'All nutrients in range'
        }
      } else if (optimalCount >= 2) {
        return {
          text: 'Good',
          color: 'text-green-500',
          detail: 'Most nutrients balanced'
        }
      } else if (optimalCount === 1) {
        return {
          text: 'Needs Attention',
          color: 'text-yellow-600',
          detail: 'Some nutrients off'
        }
      } else {
        return {
          text: 'Critical',
          color: 'text-red-600',
          detail: 'Multiple deficiencies'
        }
      }
    }

    // Fallback to average-based calculation
    const avg = (nitrogen + phosphorus + potassium) / 3
    if (avg > 70) return { text: 'High', color: 'text-green-600', detail: '' }
    if (avg > 40) return { text: 'Medium', color: 'text-yellow-600', detail: '' }
    return { text: 'Low', color: 'text-red-600', detail: '' }
  }

  // Profile-based pH status
  const getPhStatus = (ph) => {
    if (!ph) return { text: '—', color: 'text-gray-500', status: 'Unknown' }

    const value = parseFloat(ph)

    if (cropProfile?.ph_min && cropProfile?.ph_max) {
      const min = parseFloat(cropProfile.ph_min)
      const max = parseFloat(cropProfile.ph_max)

      if (value >= min && value <= max) {
        return { text: value.toFixed(1), color: 'text-green-600', status: 'Optimal' }
      } else if (value < min - 0.5 || value > max + 0.5) {
        return { text: value.toFixed(1), color: 'text-red-600', status: 'Critical' }
      } else {
        return { text: value.toFixed(1), color: 'text-yellow-600', status: 'Suboptimal' }
      }
    }

    // Generic pH ranges (most crops prefer 6.0-7.0)
    if (value >= 6.0 && value <= 7.0) {
      return { text: value.toFixed(1), color: 'text-green-600', status: 'Good' }
    } else if (value < 5.5 || value > 7.5) {
      return { text: value.toFixed(1), color: 'text-red-600', status: 'Poor' }
    } else {
      return { text: value.toFixed(1), color: 'text-yellow-600', status: 'Fair' }
    }
  }

  // Profile-based soil temperature status
  const getSoilTempStatus = (temp) => {
    if (!temp) return { text: '—', color: 'text-gray-500' }

    const value = parseFloat(temp)

    if (cropProfile?.soil_temp_min && cropProfile?.soil_temp_max) {
      const min = parseFloat(cropProfile.soil_temp_min)
      const max = parseFloat(cropProfile.soil_temp_max)

      if (value >= min && value <= max) {
        return { text: `${value}°C`, color: 'text-green-600' }
      } else if (value < min - 3 || value > max + 3) {
        return { text: `${value}°C`, color: 'text-red-600' }
      } else {
        return { text: `${value}°C`, color: 'text-yellow-600' }
      }
    }

    return { text: `${value}°C`, color: 'text-gray-800' }
  }

  // Profile-based air temperature status
  const getAirTempStatus = (temp) => {
    if (!temp) return { text: '—', color: 'text-gray-500' }

    const value = parseFloat(temp)

    if (cropProfile?.air_temperature_min && cropProfile?.air_temperature_max) {
      const min = parseFloat(cropProfile.air_temperature_min)
      const max = parseFloat(cropProfile.air_temperature_max)

      if (value >= min && value <= max) {
        return { text: `${value}°C`, color: 'text-green-600' }
      } else if (value < min - 3 || value > max + 3) {
        return { text: `${value}°C`, color: 'text-red-600' }
      } else {
        return { text: `${value}°C`, color: 'text-yellow-600' }
      }
    }

    return { text: `${value}°C`, color: 'text-gray-800' }
  }

  // Profile-based humidity status
  const getHumidityStatus = (humidity) => {
    if (!humidity) return { text: '—', color: 'text-gray-500' }

    const value = parseFloat(humidity)

    if (cropProfile?.air_humidity_min && cropProfile?.air_humidity_max) {
      const min = parseFloat(cropProfile.air_humidity_min)
      const max = parseFloat(cropProfile.air_humidity_max)

      if (value >= min && value <= max) {
        return { text: `${value}%`, color: 'text-green-600' }
      } else if (value < min - 10 || value > max + 10) {
        return { text: `${value}%`, color: 'text-red-600' }
      } else {
        return { text: `${value}%`, color: 'text-yellow-600' }
      }
    }

    return { text: `${value}%`, color: 'text-gray-800' }
  }

  // Profile-based EC status
  const getECStatus = (ec) => {
    if (!ec) return { text: '—', color: 'text-gray-500' }

    const value = parseFloat(ec)

    if (cropProfile?.electrical_conductivity_min && cropProfile?.electrical_conductivity_max) {
      const min = parseFloat(cropProfile.electrical_conductivity_min)
      const max = parseFloat(cropProfile.electrical_conductivity_max)

      if (value >= min && value <= max) {
        return { text: value.toFixed(2), color: 'text-green-600' }
      } else if (value < min * 0.7 || value > max * 1.3) {
        return { text: value.toFixed(2), color: 'text-red-600' }
      } else {
        return { text: value.toFixed(2), color: 'text-yellow-600' }
      }
    }

    return { text: value.toFixed(2), color: 'text-gray-800' }
  }

  // Get detailed NPK individual statuses for display
  const getDetailedNPKStatus = () => {
    if (!sensorData || !cropProfile) return null

    const n = parseFloat(sensorData.nitrogen)
    const p = parseFloat(sensorData.phosphorus)
    const k = parseFloat(sensorData.potassium)

    return {
      nitrogen: {
        value: n,
        status: getIndividualNutrientStatus(n, cropProfile.nitrogen_min, cropProfile.nitrogen_max),
        range: `${cropProfile.nitrogen_min}-${cropProfile.nitrogen_max}`
      },
      phosphorus: {
        value: p,
        status: getIndividualNutrientStatus(p, cropProfile.phosphorus_min, cropProfile.phosphorus_max),
        range: `${cropProfile.phosphorus_min}-${cropProfile.phosphorus_max}`
      },
      potassium: {
        value: k,
        status: getIndividualNutrientStatus(k, cropProfile.potassium_min, cropProfile.potassium_max),
        range: `${cropProfile.potassium_min}-${cropProfile.potassium_max}`
      }
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatChartDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const prepareChartData = () => {
    if (!historyData || historyData.length === 0) return []
    return historyData.slice().reverse().map(item => ({
      timestamp: formatChartDate(item.created_at),
      soilTemp: parseFloat(item.soil_temperature) || 0,
      airTemp: parseFloat(item.air_temperature) || 0,
      soilMoisture: parseFloat(item.soil_moisture) || 0,
      humidity: parseFloat(item.air_humidity) || 0
    }))
  }

  const chartData = prepareChartData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}{entry.unit || ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4F0E5]">
      <div className="p-6 text-red-500 text-center bg-white rounded-lg shadow-md max-w-md mx-4">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-semibold text-lg mb-2">Error</p>
        <p>{error}</p>
      </div>
    </div>
  )

  const moistureStatus = getSoilMoistureStatus(sensorData?.soil_moisture)
  const npkStatus = sensorData ? getNPKStatus(sensorData.nitrogen, sensorData.phosphorus, sensorData.potassium) : null
  const phStatus = getPhStatus(sensorData?.ph)
  const soilTempStatus = getSoilTempStatus(sensorData?.soil_temperature)
  const airTempStatus = getAirTempStatus(sensorData?.air_temperature)
  const humidityStatus = getHumidityStatus(sensorData?.air_humidity)
  const ecStatus = getECStatus(sensorData?.electrical_conductivity)
  const detailedNPK = getDetailedNPKStatus()

  return (
    <div className='bg-[#F4F0E5] min-h-screen flex flex-col'>
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <UserSidebar />
      </div>
      <div className="flex-1 flex flex-col md:ml-64 pb-20 md:pb-0">
        <div className="shadow-md bg-white sticky top-0 z-30">
          <UserNavbar />
        </div>
        <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gray-800">{crop_name || 'Crop Details'}</h1>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                  <span>Garden ID: {garden_id}</span>
                  {sensorData?.created_at && (<><span>•</span><span>Last updated: {formatDate(sensorData.created_at)}</span></>)}
                  {cropProfile && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">✓ Using Crop Profile</span>
                    </>
                  )}
                </div>
              </div>
              <button onClick={handleIrrigateToggle} className={`group relative inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${isIrrigating ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white'}`}>
                <svg className={`w-5 h-5 transition-all duration-300 ${isIrrigating ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-sm sm:text-base">{isIrrigating ? 'Irrigating...' : 'Start Irrigation'}</span>
                {isIrrigating && (<span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>)}
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Crop Image Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
              <div className="relative">
                {cropInfo?.image && !imageError ? (
                  <>
                    <img src={cropInfo.image} alt={crop_name || 'Crop image'} className={`w-full max-w-[200px] h-auto object-contain rounded-lg ${moistureStatus.borderWidth} ${moistureStatus.color} transition-all duration-500 ${moistureStatus.status.includes('Critical') || moistureStatus.status.includes('Low') ? 'animate-pulse' : ''}`} onError={handleImageError} />
                    <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold ${moistureStatus.bgColor} ${moistureStatus.textColor} shadow-lg border-2 ${moistureStatus.color}`}>{moistureStatus.status}</div>
                  </>
                ) : (
                  <div className="w-full max-w-[200px] h-48 bg-gray-100 rounded-lg flex items-center justify-center border-4 border-gray-300">
                    <div className="text-center text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-sm">No image available</p>
                    </div>
                  </div>
                )}
              </div>
              {cropInfo && (
                <div className="mt-4 text-center w-full">
                  <p className="text-sm text-gray-500">Crop Type</p>
                  <p className="font-semibold text-gray-800">{cropInfo.variety || 'N/A'}</p>
                  {sensorData?.soil_moisture && (
                    <div className={`mt-3 p-3 rounded-lg ${moistureStatus.bgColor} border-2 ${moistureStatus.color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">Soil Moisture</span>
                        <span className={`text-sm font-bold ${moistureStatus.textColor}`}>{sensorData.soil_moisture}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${parseFloat(sensorData.soil_moisture) < 40 ? 'bg-red-500' : parseFloat(sensorData.soil_moisture) < 60 ? 'bg-orange-400' : 'bg-green-500'}`} style={{ width: `${Math.min(parseFloat(sensorData.soil_moisture), 100)}%` }}></div>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${moistureStatus.textColor}`}>{moistureStatus.status}</p>
                      {cropProfile?.soil_moisture_min && cropProfile?.soil_moisture_max && (
                        <p className="text-xs mt-1 text-gray-500">
                          Optimal: {cropProfile.soil_moisture_min}-{cropProfile.soil_moisture_max}%
                        </p>
                      )}
                    </div>
                  )}
                  {cropInfo.image && !imageError && (<p className="text-xs text-gray-400 mt-2">📷 From ESP32-CAM</p>)}
                </div>
              )}
            </div>

            {/* Soil and Environmental Conditions */}
            <div className="flex flex-col gap-4">
              {/* Soil Condition Card */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="text-xl">🌱</span>Soil and Root Condition</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Soil Moisture</span>
                    <span className={`font-semibold ${moistureStatus.textColor}`}>
                      {sensorData?.soil_moisture ? `${sensorData.soil_moisture}%` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Soil pH</span>
                    <span className={`font-semibold ${phStatus.color}`}>
                      {phStatus.text}
                    </span>
                    {phStatus.status !== 'Unknown' && (
                      <span className={`text-xs ${phStatus.color}`}>{phStatus.status}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Soil Temp</span>
                    <span className={`font-semibold ${soilTempStatus.color}`}>
                      {soilTempStatus.text}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">NPK Status</span>
                    <span className={`font-semibold ${npkStatus?.color || 'text-gray-800'}`}>
                      {npkStatus?.text || '—'}
                    </span>
                    {npkStatus?.detail && (
                      <span className={`text-xs ${npkStatus.color}`}>{npkStatus.detail}</span>
                    )}
                  </div>
                </div>
                {sensorData && detailedNPK && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">NPK Details</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span>N: <span className="font-medium">{detailedNPK.nitrogen.value ?? '—'}</span></span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          detailedNPK.nitrogen.status === 'optimal' ? 'bg-green-100 text-green-700' :
                          detailedNPK.nitrogen.status === 'low' ? 'bg-red-100 text-red-700' :
                          detailedNPK.nitrogen.status === 'high' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {detailedNPK.nitrogen.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>P: <span className="font-medium">{detailedNPK.phosphorus.value ?? '—'}</span></span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                      detailedNPK.phosphorus.status === 'optimal' ? 'bg-green-100 text-green-700' :
                      detailedNPK.phosphorus.status === 'low' ? 'bg-red-100 text-red-700' :
                      detailedNPK.phosphorus.status === 'high' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {detailedNPK.phosphorus.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>K: <span className="font-medium">{detailedNPK.potassium.value ?? '—'}</span></span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      detailedNPK.potassium.status === 'optimal' ? 'bg-green-100 text-green-700' :
                      detailedNPK.potassium.status === 'low' ? 'bg-red-100 text-red-700' :
                      detailedNPK.potassium.status === 'high' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {detailedNPK.potassium.status}
                    </span>
                  </div>
                </div>
                {cropProfile && (
                  <p className="text-xs text-gray-400 mt-2">
                    Target ranges: N({detailedNPK.nitrogen.range}), P({detailedNPK.phosphorus.range}), K({detailedNPK.potassium.range})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Environmental Condition Card */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="text-xl">🌤</span>Environmental Condition</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Air Temperature</span>
                <span className={`font-semibold ${airTempStatus.color}`}>
                  {airTempStatus.text}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Humidity</span>
                <span className={`font-semibold ${humidityStatus.color}`}>
                  {humidityStatus.text}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Lux</span>
                <span className="font-semibold text-gray-800">
                  {sensorData?.rainfall ? `${sensorData.rainfall} mm` : '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">EC</span>
                <span className={`font-semibold ${ecStatus.color}`}>
                  {ecStatus.text}
                </span>
              </div>
            </div>
            {cropProfile && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Optimal Ranges:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-500">
                  {cropProfile.air_temperature_min && cropProfile.air_temperature_max && (
                    <span>Temp: {cropProfile.air_temperature_min}-{cropProfile.air_temperature_max}°C</span>
                  )}
                  {cropProfile.air_humidity_min && cropProfile.air_humidity_max && (
                    <span>Humidity: {cropProfile.air_humidity_min}-{cropProfile.air_humidity_max}%</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaf Condition and Alerts */}
        <div className="flex flex-col gap-4">
          {/* Leaf Condition Card */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-5 h-[200px] flex flex-col">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center justify-between flex-shrink-0">
              <span className="flex items-center gap-2">
                <span className="text-xl">🍃</span>Leaf Condition
              </span>
              {cropInfo?.detection_results && cropInfo.detection_results.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                  {cropInfo.detection_results.length}
                </span>
              )}
            </h2>

            {cropInfo?.detection_results && cropInfo.detection_results.length > 0 ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Image Preview - Compact & Clickable */}
                {cropInfo.detection_results[0]?.image_url && (
                  <div className="relative flex justify-center mb-2 flex-shrink-0">
                    <img
                      src={cropInfo.detection_results[0].image_url}
                      alt="Detected leaf"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-green-200 shadow-sm cursor-pointer hover:border-green-400 transition-all duration-200 hover:shadow-md"
                      onClick={() => openImageModal(cropInfo.detection_results[0].image_url)}
                    />
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      AI
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 rounded-lg pointer-events-none">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {/* Detected Conditions - Compact Pills */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-gray-600 font-semibold uppercase">Conditions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cropInfo.detection_results.map((result, index) => {
                        const className = result.detected_class.toLowerCase();
                        const isHealthy = className.includes('healthy');
                        const displayName = result.detected_class
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ');

                        return (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${
                              isHealthy
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            }`}
                          >
                            <span className="mr-1 text-[10px]">
                              {isHealthy ? '✓' : '⚠'}
                            </span>
                            {displayName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confidence Scores - Compact Bars */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-[10px] text-gray-600 font-semibold uppercase">Confidence</span>
                    </div>
                    <div className="space-y-1.5">
                      {cropInfo.detection_results.map((result, index) => {
                        const confidence = parseFloat(result.confidence) * 100;
                        const shortName = result.detected_class.split('_')[0].charAt(0).toUpperCase() +
                                        result.detected_class.split('_')[0].slice(1);
                        return (
                          <div key={index} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-gray-600 min-w-[45px]">{shortName}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  confidence >= 80 ? 'bg-green-500' :
                                  confidence >= 60 ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${confidence}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold min-w-[35px] text-right ${
                              confidence >= 80 ? 'text-green-600' :
                              confidence >= 60 ? 'text-yellow-600' :
                              'text-orange-600'
                            }`}>
                              {confidence.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Stats - Compact */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-100">
                    <div className="bg-green-50 rounded-md p-1.5">
                      <p className="text-[9px] text-gray-500">Avg Confidence</p>
                      <p className="text-xs font-bold text-green-700">
                        {(cropInfo.detection_results.reduce((sum, r) => sum + parseFloat(r.confidence), 0) / cropInfo.detection_results.length * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-md p-1.5">
                      <p className="text-[9px] text-gray-500">Last Scan</p>
                      <p className="text-[10px] font-semibold text-gray-700 truncate">
                        {cropInfo.detection_results[0]?.created_at
                          ? new Date(cropInfo.detection_results[0].created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // No detection data available
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="relative mb-2">
                  <img src={Leaf} alt="Leaf placeholder" className="w-16 h-16 rounded-lg object-cover opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs font-medium">No Analysis</p>
                <p className="text-[10px] mt-0.5">Waiting for scan...</p>
              </div>
            )}
          </div>

          {/* Alerts Card */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-5 flex flex-col h-full">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">⚠️</span>Alerts & Notifications
            </h2>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '300px' }}>
              {alerts && alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg text-xs ${
                    alert.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    <p className="font-medium">{alert.message}</p>
                    {alert.timestamp && (
                      <p className="text-xs opacity-75 mt-1">{formatDate(alert.timestamp)}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No alerts at this time</p>
                  <p className="text-xs mt-1">All systems normal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>Trend and Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <div>
            <h3 className="text-gray-700 font-medium mb-3 text-sm sm:text-base">Temperature Trend</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="soilTemp" stroke="#8b5cf6" strokeWidth={2} name="Soil Temp" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="airTemp" stroke="#f59e0b" strokeWidth={2} name="Air Temp" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <p className="text-sm font-medium">No data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Moisture Chart */}
          <div>
            <h3 className="text-gray-700 font-medium mb-3 text-sm sm:text-base">Soil Moisture Trend</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2} name="Soil Moisture" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Air Humidity" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <p className="text-sm font-medium">No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Mobile Sidebar */}
  <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40'>
    <UserSidebar />
  </div>

  {/* Image Modal */}
  {isModalOpen && modalImage && (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={closeImageModal}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Close Button */}
        <button
          onClick={closeImageModal}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <img
          src={modalImage}
          alt="Leaf detection full view"
          className="w-full h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
          <p className="text-white text-sm">Leaf Detection Analysis - AI Processed</p>
          <p className="text-gray-300 text-xs mt-1">Click outside to close or press ESC</p>
        </div>
      </div>
    </div>
  )}
</div>

)}
export default CropCarePlant
