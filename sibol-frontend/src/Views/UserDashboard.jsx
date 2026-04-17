import React, { useEffect, useState } from 'react';
import UserNavbar from './parts/UserNavbar';
import axios from 'axios';
import image from '../assets/first_image.png';
import axiosClient from './axios';
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';
import { useSensorData } from '../hooks/useSensorData';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import CoachMark from '../components/CoachMark';

const SectionPill = ({ label }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2e8b57]/20 bg-[#2e8b57]/[0.07] text-[10px] font-semibold tracking-[1.5px] uppercase text-[#2e8b57] mb-3.5">
    <span className="w-[5px] h-[5px] rounded-full bg-[#2e8b57] animate-pulse" />
    {label}
  </div>
);

const Orb = ({ className }) => (
  <div className={`absolute rounded-full pointer-events-none ${className}`} />
);

const UserDashboard = () => {
  const name   = localStorage.getItem('username');
  // Use a stable userId key — fall back to username if no dedicated id key exists
  const userId = localStorage.getItem('userId') || localStorage.getItem('username') || 'guest';
  const apikey = import.meta.env.VITE_WEATHER_APIKEY;

  const [location,     setLocation]     = useState(null);
  const [weather,      setWeather]      = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit,         setUnit]         = useState('C');
  const [date,         setDate]         = useState(new Date());
  const [error,        setError]        = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [activeCrop,   setActiveCrop]   = useState(null);
  const [crops,        setCrops]        = useState([]);
  const [cropAdvisory, setCropAdvisory] = useState([]);
  const [gardenId,     setGardenId]     = useState(null);

  const navigate = useNavigate();

  const { airHumidityHistory, isConnected, setAirHumidityHistory } = useSensorData(selectedCrop || gardenId);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosClient.get('/getAirHumidity', {
          params: { crop_id: selectedCrop },
        });
        const formattedData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        if (typeof setAirHumidityHistory === 'function') {
          setAirHumidityHistory(formattedData);
        }
      } catch (err) {
        console.error('Fetch history error:', err);
        setError('Database connection error.');
      }
    };
    if (selectedCrop) fetchHistory();
  }, [selectedCrop, setAirHumidityHistory]);

  const chartData = airHumidityHistory;

  useEffect(() => {
    const crop = crops.find(c => c.id === parseInt(selectedCrop));
    setActiveCrop(crop || null);
    if (crop?.garden?.id) setGardenId(crop.garden.id);
  }, [selectedCrop, crops]);

  useEffect(() => {
    axiosClient.get('/getLocation').then(res => {
      const locs = res.data.locations;
      if (locs?.length) {
        setLocation(locs[0]);
        localStorage.setItem('location', locs[0]);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!location) return;
    axios.get('https://api.weatherapi.com/v1/forecast.json', {
      params: { key: apikey, q: location, days: 3 },
    }).then(res => {
      setWeather(res.data);
      setForecastData(res.data.forecast.forecastday);
    }).catch(console.error);
  }, [location, apikey]);

  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    axiosClient.get('/getCrops')
      .then(res => {
        const cropList = res.data.data;
        setCrops(cropList);
        if (cropList?.length > 0) setGardenId(cropList[0].garden?.id);
      })
      .catch(err => setError(err.response?.data?.message || 'Something Went Wrong!'));
  }, []);

  useEffect(() => {
    axiosClient.get('/getCropAdvisory')
      .then(res => setCropAdvisory(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Error Fetching Detection Results'));
  }, []);

  const weekday      = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
    .replace(/\//g, ' / ');

  const handleMoreDetails = (crop) => {
    const espId = crop.esp?.id || crop.esp_id || 'no-esp';
    navigate(`/user/crop-care/${crop.garden?.id}/${crop.id}/${espId}`);
  };

  const formatPlantedDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const getWeatherIcon = (condition, large = false) => {
    const c   = condition.toLowerCase();
    const cls = large ? 'w-14 h-14' : 'w-10 h-10';
    if (c.includes('sun') || c.includes('clear'))    return <Sun       className={`${cls} text-amber-300`} fill="currentColor" />;
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className={`${cls} text-blue-300`}  fill="currentColor" />;
    if (c.includes('snow'))                          return <CloudSnow className={`${cls} text-blue-200`}  fill="currentColor" />;
    if (c.includes('wind'))                          return <Wind      className={`${cls} text-slate-300`} />;
    return <Cloud className={`${cls} text-slate-300`} fill="currentColor" />;
  };

  const getShortDay = d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d).getDay()];
  const getTemp     = (c, f) => unit === 'C' ? Math.round(c) : Math.round(f);

  return (
    <div className="min-h-screen w-full max-w-full bg-[#f7f4ee] font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .playfair { font-family: 'Playfair Display', serif; }
        .forecast-card:hover { background: rgba(255,255,255,0.18) !important; transform: translateY(-4px); }
        .crop-row:hover td { background: rgba(46,139,87,0.04); }
        .thin-scroll::-webkit-scrollbar { width: 3px; }
        .thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .thin-scroll::-webkit-scrollbar-thumb { background: rgba(46,139,87,0.3); border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* CoachMark — per-user key via userId */}
      <CoachMark userId={userId} />

      {/* ── Page header ── */}
      <div className="w-full px-6 md:px-10 pt-9">
        <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#2e8b57] mb-1.5">
          Good to see you
        </p>
        <h1 className="playfair text-[clamp(28px,3.5vw,44px)] font-bold leading-tight text-[#0b3d1e] mb-4">
          Welcome back, <em className="text-[#f0a830]">{name}</em>
        </h1>
        <div className="w-10 h-0.5 bg-[#d4840a] mb-8" />
      </div>

      {/* ── Content ── */}
      <div className="w-full px-6 md:px-10 pb-28 md:pb-14 flex flex-col gap-6">

        {/* ── Row 1: Weather + Forecast + Advisory ── */}
        <div className="flex flex-col md:flex-row gap-5">

          {/* Weather card — id for coachmark step */}
          <div
            id="coach-weather"
            className="relative w-full md:w-[280px] md:shrink-0 rounded-[20px] overflow-hidden border border-white/14 bg-gradient-to-br from-[rgba(26,102,54,0.82)] via-[rgba(11,61,30,0.88)] to-[rgba(11,61,30,0.92)] p-6"
          >
            <Orb className="w-[200px] h-[200px] -top-[60px] -right-[60px] bg-[radial-gradient(circle,rgba(46,139,87,0.18)_0%,transparent_70%)]" />
            <Orb className="w-[120px] h-[120px] -bottom-5 -left-5 bg-[radial-gradient(circle,rgba(212,132,10,0.12)_0%,transparent_70%)]" />

            <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap mb-5">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[12px] font-medium text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48">
                  <path fill="none" stroke="rgba(255,255,255,0.8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M24 44s14-10.435 14-24A14 14 0 1 0 10 20c0 13.565 14 24 14 24z" />
                  <circle cx="24" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
                </svg>
                {location || 'Loading...'}
              </div>
              <button
                onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
                className="relative flex items-center w-[72px] h-[34px] rounded-full bg-white/10 border border-white/20 cursor-pointer shrink-0"
              >
                <div
                  className="absolute top-[3px] h-[calc(100%-6px)] w-[calc(50%-3px)] rounded-full bg-white shadow-md transition-all duration-300"
                  style={{ left: unit === 'C' ? '3px' : 'calc(50%)' }}
                />
                <div className="relative z-10 flex w-full justify-between px-2.5 text-[12px] font-bold pointer-events-none">
                  <span className={unit === 'C' ? 'text-[#0b3d1e]' : 'text-white/70'}>C</span>
                  <span className={unit === 'F' ? 'text-[#0b3d1e]' : 'text-white/70'}>F</span>
                </div>
              </button>
            </div>

            <div className="relative z-10 text-center mb-4">
              <div className="playfair text-[13px] text-white/60 tracking-wider">{weekday}</div>
              <div className="text-[11px] text-white/40 mt-0.5">{formattedDate}</div>
            </div>

            {weather ? (
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="playfair text-[56px] font-bold text-white leading-none">
                    {unit === 'C' ? weather.current.temp_c : weather.current.temp_f}°
                  </div>
                  <div className="text-[11px] text-white/45 mt-1">
                    Feels like {unit === 'C' ? weather.current.feelslike_c : weather.current.feelslike_f}°
                  </div>
                </div>
                <div className="text-center">
                  <img src={weather.current.condition.icon} alt="" className="w-16 h-16 drop-shadow-lg" />
                  <div className="text-[11px] text-white/70 mt-1 font-medium">{weather.current.condition.text}</div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-center text-[13px] text-white/50 py-5">Fetching weather...</div>
            )}
          </div>

          {/* Forecast card */}
          <div className="relative w-full md:flex-1 rounded-[20px] overflow-hidden bg-gradient-to-br from-[rgba(26,102,54,0.82)] via-[rgba(11,61,30,0.88)] to-[rgba(11,61,30,0.92)] border border-white/14 p-6">
            <Orb className="w-[300px] h-[300px] -top-[100px] -right-[80px] bg-[radial-gradient(circle,rgba(46,139,87,0.13)_0%,transparent_70%)]" />
            <div className="relative z-10 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(168,197,160,0.2)] bg-[rgba(46,139,87,0.15)] text-[10px] font-semibold tracking-[1.5px] uppercase text-[rgba(168,197,160,0.9)] mb-3">
                <span className="w-[5px] h-[5px] rounded-full bg-[#a8c5a0] animate-pulse" />
                3-Day Forecast
              </div>
              <div className="playfair text-[22px] font-bold text-white">
                Upcoming <em className="text-[#f0a830]">Weather</em>
              </div>
            </div>
            {forecastData?.length ? (
              <div className="relative z-10 grid grid-cols-3 gap-3">
                {forecastData.map((day, i) => (
                  <div
                    key={i}
                    className="forecast-card rounded-2xl p-3 sm:p-5 text-center cursor-pointer border border-white/16 transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.10)' }}
                  >
                    <div className="text-[11px] font-semibold text-white/70 tracking-wide mb-2 sm:mb-3">
                      {i === 0 ? 'Today' : getShortDay(day.date)}
                    </div>
                    <div className="flex justify-center mb-2 sm:mb-3">
                      {getWeatherIcon(day.day.condition.text)}
                    </div>
                    <div className="playfair text-[22px] sm:text-[28px] font-bold text-white">
                      {getTemp(day.day.maxtemp_c, day.day.maxtemp_f)}°
                    </div>
                    <div className="text-[13px] text-white/50 my-0.5">
                      {getTemp(day.day.mintemp_c, day.day.mintemp_f)}°
                    </div>
                    <div className="text-[10px] text-white/55 font-medium leading-tight">{day.day.condition.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative z-10 text-[13px] text-white/40 text-center py-10">Loading forecast...</div>
            )}
          </div>

          {/* Advisory card — id for coachmark step */}
          <div
            id="coach-advisory"
            className="relative w-full md:w-[240px] md:shrink-0 rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07] p-6"
          >
            <Orb className="w-[150px] h-[150px] -top-10 -right-10 bg-[radial-gradient(circle,rgba(46,139,87,0.13)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <SectionPill label="Advisory" />
              <div className="flex items-center justify-between mb-3.5">
                <div className="playfair text-[18px] font-bold text-[#0b3d1e]">
                  Crop <em className="text-[#f0a830]">Alerts</em>
                </div>
                {cropAdvisory?.length > 0 && (
                  <span className="bg-[#d4840a] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {cropAdvisory.length}
                  </span>
                )}
              </div>
              <div className="thin-scroll h-40 overflow-y-auto flex flex-col gap-2">
                {cropAdvisory?.length > 0 ? (
                  cropAdvisory.map((adv, i) => (
                    <div key={i} className="bg-[rgba(212,132,10,0.06)] border-l-[3px] border-[#d4840a] rounded-r-xl px-3 py-2.5 hover:bg-[rgba(212,132,10,0.10)] transition-colors duration-200">
                      <div className="text-[12px] font-bold text-[#0b3d1e] mb-0.5">
                        🌾 {adv.crop?.name || 'Unknown Crop'}
                      </div>
                      <div className="text-[11px] text-gray-500 leading-relaxed">{adv.recommendations}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#2e8b57]/10 flex items-center justify-center">
                      <svg width="20" height="20" fill="none" stroke="#2e8b57" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-[12px] font-semibold text-gray-400 text-center">All Systems Optimal</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Chart Section — id for coachmark step ── */}
        <div
          id="coach-sensors"
          className="relative w-full rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07] p-7"
        >
          <Orb className="w-[250px] h-[250px] -top-[80px] -right-[60px] bg-[radial-gradient(circle,rgba(212,132,10,0.12)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <SectionPill label="Live Sensors" />
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3.5 ${isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {isConnected ? '● Connected' : '○ Waiting...'}
              </span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div className="playfair text-[22px] font-bold text-[#0b3d1e]">
                Environmental <em className="text-[#f0a830]">Conditions</em>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Temperature
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2e8b57]" /> Humidity
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-[13px] mb-3">{error}</p>}
            <div className="w-full h-[300px]">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(11,61,30,0.06)" strokeDasharray="4 4" />
                    <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <YAxis yAxisId="left" stroke="#ef4444" style={{ fontSize: '11px' }}
                      label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#ef4444' } }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#2e8b57" style={{ fontSize: '11px' }}
                      label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight', style: { fontSize: '11px', fill: '#2e8b57' } }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 8px 24px rgba(11,61,30,0.12)', fontSize: '12px', padding: '10px 14px' }}
                    />
                    <Line yAxisId="left"  type="monotone" dataKey="temp"     stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} name="Temperature" />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#2e8b57" strokeWidth={2.5} dot={{ fill: '#2e8b57', r: 4 }} activeDot={{ r: 6 }} name="Humidity" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-10 h-10 rounded-full border-[3px] border-[#2e8b57]/20 border-t-[#2e8b57]" style={{ animation: 'spin 1s linear infinite' }} />
                  <div className="text-[13px] text-gray-400 font-medium">Initialising sensor trends...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Crops Section — id for coachmark step ── */}
        <div id="coach-crops" className="flex flex-col md:flex-row gap-5">

          {/* Available crops table */}
          <div className="relative w-full md:flex-1 rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07] p-7">
            <Orb className="w-40 h-40 -top-10 -left-10 bg-[radial-gradient(circle,rgba(46,139,87,0.13)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <SectionPill label="Garden" />
              <div className="playfair text-[22px] font-bold text-[#0b3d1e] mb-5">
                Available <em className="text-[#f0a830]">Crops</em>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#0b3d1e]/[0.08]">
                      <th className="px-3 py-2 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400">Crop</th>
                      <th className="px-3 py-2 text-center text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.length > 0 ? (
                      crops.map((crop, i) => (
                        <tr key={i} className="crop-row border-b border-[#0b3d1e]/[0.04]">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#2e8b57] to-[#1a6636] flex items-center justify-center text-sm shrink-0">
                                🌿
                              </div>
                              <span className="font-semibold text-[13px] text-[#0b3d1e]">{crop.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {crop.planted_at ? (
                              <span className="inline-flex items-center gap-1 bg-[#2e8b57]/10 text-[#2e8b57] border border-[#2e8b57]/20 px-3 py-1 rounded-full text-[12px] font-semibold">
                                ✓ Planted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-black/[0.04] text-gray-400 border border-black/[0.08] px-3 py-1 rounded-full text-[12px] font-semibold">
                                ○ Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-10 text-center">
                          <div className="text-4xl mb-2">🌾</div>
                          <div className="text-[13px] text-gray-400 font-medium">No crops available yet</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Crop detail card */}
          <div className="relative w-full md:flex-1 rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07]">
            <Orb className="w-40 h-40 -bottom-10 -right-10 bg-[radial-gradient(circle,rgba(212,132,10,0.12)_0%,transparent_70%)]" />
            <div className="relative h-[220px] overflow-hidden">
              <img
                src={activeCrop?.image || image}
                alt={activeCrop?.name || 'Crop'}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,61,30,0.7)] to-transparent" />
              {activeCrop && (
                <div className="absolute bottom-3.5 left-4">
                  <div className="playfair text-[20px] font-bold text-white leading-tight">{activeCrop.name}</div>
                </div>
              )}
            </div>
            <div className="relative z-10 p-5">
              <div className="flex gap-2.5 mb-4">
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="flex-1 border-[1.5px] border-[#0b3d1e]/12 rounded-full bg-white outline-none px-4 py-2.5 text-[13px] font-medium text-[#0b3d1e] cursor-pointer hover:border-[#2e8b57] focus:border-[#2e8b57] transition-colors duration-200 font-['DM_Sans',sans-serif]"
                >
                  <option value="">🌾 Select a crop</option>
                  {crops.map((c, i) => <option key={i} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  disabled={!activeCrop}
                  onClick={() => activeCrop && handleMoreDetails(activeCrop)}
                  className="px-5 py-2.5 bg-[#d4840a] hover:bg-[#f0a830] disabled:opacity-35 disabled:cursor-not-allowed rounded-full text-white text-[13px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-px font-['DM_Sans',sans-serif]"
                >
                  Details →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  className="rounded-2xl p-4 text-center border border-[#0b3d1e]/[0.06] transition-colors duration-200 hover:border-[#0b3d1e]/15"
                  style={{
                    background: activeCrop?.latest_detection_result?.detected_class
                      ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                        ? 'rgba(46,139,87,0.06)' : 'rgba(239,68,68,0.05)')
                      : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <div className="text-2xl mb-1.5">
                    {activeCrop?.latest_detection_result?.detected_class
                      ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy') ? '💚' : '⚠️')
                      : '—'}
                  </div>
                  <div className="text-[9px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-1">Health</div>
                  <div
                    className="playfair text-[14px] font-bold"
                    style={{
                      color: activeCrop?.latest_detection_result?.detected_class
                        ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy') ? '#2e8b57' : '#ef4444')
                        : '#0b3d1e',
                    }}
                  >
                    {activeCrop?.latest_detection_result?.detected_class
                      ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy') ? 'Healthy' : 'Diseased')
                      : 'No Data'}
                  </div>
                </div>
                <div className="rounded-2xl p-4 text-center border border-[#0b3d1e]/[0.06] bg-[rgba(212,132,10,0.05)] transition-colors duration-200 hover:border-[#0b3d1e]/15">
                  <div className="text-2xl mb-1.5">📅</div>
                  <div className="text-[9px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-1">Planted</div>
                  <div className="playfair text-[14px] font-bold text-[#0b3d1e]">
                    {formatPlantedDate(activeCrop?.planted_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
