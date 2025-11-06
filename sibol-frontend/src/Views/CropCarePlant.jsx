import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import axiosClient from './axios'
import Image from '../assets/plants.png'
import Leaf from '../assets/leaf.png'

const CropCarePlant = () => {
  const { garden_id, crop_name } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sensorData, setSensorData] = useState(null)
  const [cropInfo, setCropInfo] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [historyData, setHistoryData] = useState([])

  useEffect(() => {
    const fetchSensorData = async () => {
      setLoading(true)
      try {
        const response = await axiosClient.get(`/getSensorDataCrop/${garden_id}/${crop_name}`)

        if (response.data.success) {
          setCropInfo(response.data.data.crop)
          setSensorData(response.data.data.latest)
          setAlerts(response.data.data.alerts || [])
          setHistoryData(response.data.data.history || [])
        }
      } catch (error) {
        console.error(error)
        setError(error.response?.data?.message || "Failed to fetch sensor data!")
      } finally {
        setLoading(false)
      }
    }

    if (garden_id && crop_name) {
      fetchSensorData()
    }
  }, [garden_id, crop_name])

  const getNPKStatus = (n, p, k) => {
    if (!n || !p || !k) return { text: '—', color: 'text-gray-500' }

    const avg = (parseFloat(n) + parseFloat(p) + parseFloat(k)) / 3
    if (avg > 70) return { text: 'High', color: 'text-green-600' }
    if (avg > 40) return { text: 'Medium', color: 'text-yellow-600' }
    return { text: 'Low', color: 'text-red-600' }
  }

  const getLCIInterpretation = (lci) => {
    if (!lci) return null

    const value = parseFloat(lci)
    if (value >= 7) return {
      status: 'Optimal nitrogen level',
      color: 'text-green-700',
      range: '7–8',
      description: 'Dark Green'
    }
    if (value >= 5) return {
      status: 'Moderate nitrogen',
      color: 'text-yellow-700',
      range: '5–6',
      description: 'Light Green'
    }
    return {
      status: 'Low nitrogen - fertilizer needed',
      color: 'text-red-700',
      range: '< 5',
      description: 'Pale Green'
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatChartDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!historyData || historyData.length === 0) return []

    return historyData.slice().reverse().map(item => ({
      timestamp: formatChartDate(item.created_at),
      soilTemp: parseFloat(item.soil_temperature) || 0,
      airTemp: parseFloat(item.air_temperature) || 0,
      soilMoisture: parseFloat(item.soil_moisture) || 0,
      humidity: parseFloat(item.humidity) || 0
    }))
  }

  const chartData = prepareChartData()

  // Custom tooltip for charts
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#F4F0E5]">
      <div role="status" className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-12 w-12 text-green-700" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span className="text-gray-600 font-medium">Loading sensor data...</span>
      </div>
    </div>
  )

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

  const npkStatus = sensorData ? getNPKStatus(sensorData.nitrogen, sensorData.phosphorus, sensorData.potassium) : null
  const lciInfo = sensorData?.leaf_color_index ? getLCIInterpretation(sensorData.leaf_color_index) : null

  return (
    <div className='bg-[#F4F0E5] min-h-screen flex flex-col'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <UserSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 pb-20 md:pb-0">
        {/* Navbar */}
        <div className="shadow-md bg-white sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-gray-800">
              {crop_name || 'Crop Details'}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
              <span>Garden ID: {garden_id}</span>
              {sensorData?.created_at && (
                <>
                  <span>•</span>
                  <span>Last updated: {formatDate(sensorData.created_at)}</span>
                </>
              )}
            </div>
          </div>

          {/* Top Section - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Crop Image Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
              <img
                src={
                     cropInfo.type === "crop"
                    ? `${import.meta.env.VITE_API_BASE_URL}/crops_image/${cropInfo.image}`
                    : `${import.meta.env.VITE_API_BASE_URL}/sensor_images/${cropInfo.image}`
                }
                alt={crop_name}
                className="w-full max-w-[200px] h-auto object-contain rounded-lg"
              />
              {cropInfo && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Crop Type</p>
                  <p className="font-semibold text-gray-800">{cropInfo.variety || 'N/A'}</p>
                </div>
              )}
            </div>

            {/* Soil & Environmental Conditions */}
            <div className="flex flex-col gap-4">
              {/* Soil and Root Condition */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  Soil and Root Condition
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Soil Moisture</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.soil_moisture ? `${sensorData.soil_moisture}%` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Soil pH</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.ph ?? '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Soil Temp</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.soil_temperature ? `${sensorData.soil_temperature}°C` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">NPK Status</span>
                    <span className={`font-semibold ${npkStatus?.color || 'text-gray-800'}`}>
                      {npkStatus?.text || '—'}
                    </span>
                  </div>
                </div>
                {sensorData && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">NPK Values</p>
                    <div className="flex gap-3 text-xs">
                      <span>N: <span className="font-medium">{sensorData.nitrogen ?? '—'}</span></span>
                      <span>P: <span className="font-medium">{sensorData.phosphorus ?? '—'}</span></span>
                      <span>K: <span className="font-medium">{sensorData.potassium ?? '—'}</span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Environmental Condition */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-xl">🌤</span>
                  Environmental Condition
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Air Temperature</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.air_temperature ? `${sensorData.air_temperature}°C` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Humidity</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.humidity ? `${sensorData.humidity}%` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Rainfall</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.rainfall ? `${sensorData.rainfall} mm` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">EC</span>
                    <span className="font-semibold text-gray-800">
                      {sensorData?.electrical_conductivity ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - LCI & Alerts */}
            <div className="flex flex-col gap-4">
              {/* Leaf Color Index */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-xl">🍃</span>
                  Leaf Color Index
                </h2>
                <div className="flex items-start gap-4">
                  <img
                    src={sensorData?.leaf_image || Leaf}
                    alt="Leaf sample"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">LCI Value:</span>
                        <span className="font-semibold text-gray-800">
                          {sensorData?.leaf_color_index ? lciInfo?.range : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Leaf Color:</span>
                        <span className="font-semibold text-gray-800">
                          {sensorData?.leaf_color_index ? lciInfo?.description : '—'}
                        </span>
                      </div>
                    </div>
                    {lciInfo && (
                      <p className={`mt-3 text-xs font-semibold ${lciInfo.color}`}>
                        {lciInfo.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alerts and Notifications */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-5 flex flex-col h-full">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2 flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                  Alerts & Notifications
                </h2>
                <div className="space-y-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '160px' }}>
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

          {/* Trend and Analytics Section */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-xl">📈</span>
              Trend and Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature Trend Chart */}
              <div>
                <h3 className="text-gray-700 font-medium mb-3 text-sm sm:text-base">Temperature Trend</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="soilTemp"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Soil Temp"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="airTemp"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Air Temp"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
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

              {/* Soil Moisture Trend Chart */}
              <div>
                <h3 className="text-gray-700 font-medium mb-3 text-sm sm:text-base">Soil Moisture Trend</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="soilMoisture"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Soil Moisture"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Air Humidity"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
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

      {/* Mobile Footer Navigation */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40'>
        <UserSidebar />
      </div>
    </div>
  )
}

export default CropCarePlant
