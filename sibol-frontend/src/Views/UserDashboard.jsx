import React, { useEffect, useState } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import axios from "axios";
import image from "../assets/first_image.png";
import axiosClient from "./axios";
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const name = localStorage.getItem("username");
  const apikey = import.meta.env.VITE_WEATHER_APIKEY;
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState("C");
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [activeCrop, setActiveCrop] = useState(null);
  const [crops, setCrops] = useState([]);
  const [cropAdvisory, setCropAdvisory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("/getAirHumidity");
        setData(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch Data!");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const selectedId = parseInt(selectedCrop);
    const crop = crops.find((c) => c.id === selectedId);
    setActiveCrop(crop || null);
  }, [selectedCrop, crops]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axiosClient.get("/getLocation");
        const locations = response.data.locations;
        if (locations && locations.length > 0) {
          const firstLocation = locations[0];
          setLocation(firstLocation);
          localStorage.setItem("location", firstLocation);
        }
      } catch (error) {
        console.error("Error fetching garden locations:", error);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          "https://api.weatherapi.com/v1/forecast.json",
          { params: { key: apikey, q: location, days: 3 } }
        );
        setWeather(response.data);
        setForecastData(response.data.forecast.forecastday);
      } catch (error) {
        console.error("Weather API error:", error);
      }
    };
    if (location) fetchWeather();
  }, [location, apikey]);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axiosClient.get('/getCrops');
        setCrops(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Something Went Wrong!");
      }
    };
    fetchCrops();
  }, []);

  useEffect(() => {
    const fetchCropAdvisory = async () => {
      try {
        const response = await axiosClient.get('/getCropAdvisory');
        setCropAdvisory(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Error Fetching Detection Results");
      }
    };
    fetchCropAdvisory();
  }, []);

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = date
    .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
    .replace(/\//g, " / ");

  const handleMoreDetails = (crop) => {
    navigate(`/user/crop-care/${crop.garden?.id}/${crop.name}`);
  };

  const formatPlantedDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getWeatherIcon = (condition, size = "default") => {
    const conditionLower = condition.toLowerCase();
    const sizeClasses = size === "large" ? "w-14 h-14" : "w-10 h-10";
    if (conditionLower.includes('sun') || conditionLower.includes('clear'))
      return <Sun className={`${sizeClasses} text-amber-300`} fill="currentColor" />;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle'))
      return <CloudRain className={`${sizeClasses} text-blue-300`} fill="currentColor" />;
    if (conditionLower.includes('snow'))
      return <CloudSnow className={`${sizeClasses} text-blue-200`} fill="currentColor" />;
    if (conditionLower.includes('wind'))
      return <Wind className={`${sizeClasses} text-slate-300`} />;
    return <Cloud className={`${sizeClasses} text-slate-300`} fill="currentColor" />;
  };

  const getShortDay = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
  };

  const getTemp = (tempC, tempF) => unit === "C" ? Math.round(tempC) : Math.round(tempF);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f7f4ee', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --forest: #0b3d1e;
          --moss: #1a6636;
          --fern: #2e8b57;
          --sage: #a8c5a0;
          --cream: #f7f4ee;
          --amber: #d4840a;
          --amber-light: #f0a830;
        }

        .dash-wrapper {
          display: flex;
          min-height: 100vh;
          background: var(--cream);
        }

        /* ── SIDEBAR SLOT ── */
        .sidebar-fixed {
          position: fixed;
          top: 0; left: 0;
          width: 240px;
          height: 100vh;
          z-index: 40;
        }

        /* ── MAIN AREA ── */
        .dash-main {
          margin-left: 240px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ── NAVBAR ── */
        .dash-navbar {
          position: sticky;
          top: 0; z-index: 30;
          background: rgba(247,244,238,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(11,61,30,0.08);
        }

        /* ── CONTENT ── */
        .dash-content {
          flex: 1;
          padding: 36px 40px 60px;
        }

        /* ── WELCOME HEADER ── */
        .welcome-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--fern);
          margin-bottom: 6px;
        }
        .welcome-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 700;
          line-height: 1.1;
          color: var(--forest);
          margin-bottom: 32px;
        }
        .welcome-h1 em {
          font-style: italic;
          color: var(--fern);
        }
        .welcome-divider {
          width: 40px; height: 2px;
          background: var(--amber);
          margin-bottom: 32px;
        }

        /* ── GLASS CARD (dark forest) ── */
        .glass-dark {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .glass-dark-gradient {
          background: linear-gradient(135deg,
            rgba(26,102,54,0.82) 0%,
            rgba(11,61,30,0.88) 40%,
            rgba(11,61,30,0.92) 100%
          );
        }

        /* ── LIGHT CARD ── */
        .card-light {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(11,61,30,0.07);
          overflow: hidden;
          position: relative;
        }

        /* ── ORB DECORATIONS ── */
        .orb-green {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .orb-amber {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,132,10,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── SECTION LABEL ── */
        .section-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border: 1px solid rgba(11,61,30,0.12);
          border-radius: 100px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--fern);
          background: rgba(46,139,87,0.07);
          margin-bottom: 14px;
        }
        .section-pill-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--fern);
          animation: livePulse 1.8s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.4; transform:scale(1.4); }
        }

        /* ── WEATHER CARD INTERNALS ── */
        .weather-location-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
        }
        .temp-toggle {
          display: flex;
          align-items: center;
          width: 72px; height: 34px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }
        .temp-toggle-thumb {
          position: absolute;
          width: calc(50% - 3px);
          height: calc(100% - 6px);
          border-radius: 100px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: left 0.3s ease;
          top: 3px;
        }
        .temp-toggle-labels {
          display: flex;
          width: 100%;
          justify-content: space-between;
          padding: 0 10px;
          position: relative;
          z-index: 2;
          pointer-events: none;
          font-size: 12px;
          font-weight: 700;
        }

        /* ── FORECAST CARD ── */
        .forecast-day-card {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 16px;
          padding: 20px 12px;
          text-align: center;
          transition: background 0.25s, transform 0.25s;
          cursor: pointer;
        }
        .forecast-day-card:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-4px);
        }

        /* ── CHART TOOLTIP ── */
        .custom-tooltip {
          background: rgba(255,255,255,0.97);
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 8px 24px rgba(11,61,30,0.12);
          font-size: 13px;
        }

        /* ── TABLE ── */
        .crop-table tr:hover td { background: rgba(46,139,87,0.04); }

        /* ── STATUS BADGE ── */
        .badge-planted {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(46,139,87,0.1);
          color: var(--fern);
          border: 1px solid rgba(46,139,87,0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-pending {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.04);
          color: #9ca3af;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }

        /* ── CROP INFO BOXES ── */
        .info-box {
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          border: 1px solid rgba(11,61,30,0.06);
          transition: border-color 0.2s;
        }
        .info-box:hover { border-color: rgba(11,61,30,0.15); }
        .info-box-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 5px;
        }
        .info-box-value {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--forest);
        }

        /* ── ADVISORY ── */
        .advisory-item {
          background: rgba(212,132,10,0.06);
          border-left: 3px solid var(--amber);
          border-radius: 0 10px 10px 0;
          padding: 10px 12px;
          transition: background 0.2s;
        }
        .advisory-item:hover { background: rgba(212,132,10,0.1); }

        /* ── SCROLLBAR ── */
        .thin-scroll::-webkit-scrollbar { width: 3px; }
        .thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .thin-scroll::-webkit-scrollbar-thumb { background: rgba(46,139,87,0.3); border-radius: 10px; }

        /* ── DETAILS BTN ── */
        .btn-amber {
          padding: 10px 20px;
          background: var(--amber);
          border: none;
          border-radius: 100px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-amber:hover { background: var(--amber-light); transform: translateY(-1px); }
        .btn-amber:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        /* ── CROP SELECT ── */
        .crop-select {
          flex: 1;
          border: 1.5px solid rgba(11,61,30,0.12);
          border-radius: 100px;
          background: #fff;
          outline: none;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--forest);
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        .crop-select:hover, .crop-select:focus { border-color: var(--fern); }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .sidebar-fixed { display: none; }
          .dash-main { margin-left: 0; padding-bottom: 80px; }
          .dash-content { padding: 20px 16px 40px; }
        }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sidebar-fixed hidden md:block">
        <UserSidebar />
      </div>

      {/* ── MAIN ── */}
      <div className="dash-main">

        {/* Navbar */}
        <div className="dash-navbar">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className="dash-content">

          {/* ── WELCOME HEADER ── */}
          <div className="welcome-eyebrow">Good to see you</div>
          <h1 className="welcome-h1">
            Welcome back, <em>{name}</em>
          </h1>
          <div className="welcome-divider" />

          {/* ── ROW 1: Weather + Forecast ── */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>

            {/* Weather Card */}
            <div className="glass-dark glass-dark-gradient" style={{ width: '280px', flexShrink: 0, padding: '24px' }}>
              <div className="orb-green" style={{ width: '200px', height: '200px', top: '-60px', right: '-60px' }} />
              <div className="orb-amber" style={{ width: '120px', height: '120px', bottom: '-20px', left: '-20px' }} />

              {/* Location + Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <div className="weather-location-chip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48">
                    <path fill="none" stroke="rgba(255,255,255,0.8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4}
                      d="M24 44s14-10.435 14-24A14 14 0 1 0 10 20c0 13.565 14 24 14 24z" />
                    <circle cx="24" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
                  </svg>
                  {location || "Loading..."}
                </div>
                <div className="temp-toggle" onClick={() => setUnit(unit === "C" ? "F" : "C")}>
                  <div className="temp-toggle-thumb" style={{ left: unit === "C" ? '3px' : 'calc(50%)' }} />
                  <div className="temp-toggle-labels">
                    <span style={{ color: unit === "C" ? 'var(--forest)' : 'rgba(255,255,255,0.7)' }}>C</span>
                    <span style={{ color: unit === "F" ? 'var(--forest)' : 'rgba(255,255,255,0.7)' }}>F</span>
                  </div>
                </div>
              </div>

              {/* Day */}
              <div style={{ textAlign: 'center', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                  {weekday}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{formattedDate}</div>
              </div>

              {weather ? (
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '56px', fontWeight: '700', color: '#fff', lineHeight: 1 }}>
                        {unit === "C" ? weather.current.temp_c : weather.current.temp_f}°
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                        Feels like {unit === "C" ? weather.current.feelslike_c : weather.current.feelslike_f}°
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <img src={weather.current.condition.icon} alt="" style={{ width: '64px', height: '64px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontWeight: '500' }}>
                        {weather.current.condition.text}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', padding: '20px 0' }}>
                  Fetching weather...
                </div>
              )}
            </div>

            {/* Forecast Card */}
            <div className="glass-dark glass-dark-gradient" style={{ flex: 1, minWidth: '300px', padding: '24px' }}>
              <div className="orb-green" style={{ width: '300px', height: '300px', top: '-100px', right: '-80px' }} />

              <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <div className="section-pill" style={{ color: 'rgba(168,197,160,0.9)', background: 'rgba(46,139,87,0.15)', borderColor: 'rgba(168,197,160,0.2)' }}>
                  <span className="section-pill-dot" style={{ background: 'var(--sage)' }} />
                  3-Day Forecast
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: '#fff' }}>
                  Upcoming <em style={{ fontStyle: 'italic', color: 'var(--amber-light)' }}>Weather</em>
                </div>
              </div>

              {forecastData && forecastData.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', position: 'relative', zIndex: 2 }}>
                  {forecastData.map((day, index) => (
                    <div key={index} className="forecast-day-card">
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px', marginBottom: '12px' }}>
                        {index === 0 ? 'Today' : getShortDay(day.date)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                        {getWeatherIcon(day.day.condition.text)}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: '#fff' }}>
                        {getTemp(day.day.maxtemp_c, day.day.maxtemp_f)}°
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 6px' }}>
                        {getTemp(day.day.mintemp_c, day.day.mintemp_f)}°
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>
                        {day.day.condition.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '40px 0', position: 'relative', zIndex: 2 }}>
                  Loading forecast...
                </div>
              )}
            </div>

            {/* Crop Advisory */}
            <div className="card-light" style={{ width: '240px', flexShrink: 0, padding: '24px' }}>
              <div className="orb-green" style={{ width: '150px', height: '150px', top: '-40px', right: '-40px' }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="section-pill">
                  <span className="section-pill-dot" />
                  Advisory
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: 'var(--forest)' }}>
                    Crop <em style={{ fontStyle: 'italic' }}>Alerts</em>
                  </div>
                  {cropAdvisory && cropAdvisory.length > 0 && (
                    <span style={{ background: 'var(--amber)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>
                      {cropAdvisory.length}
                    </span>
                  )}
                </div>

                <div className="thin-scroll" style={{ height: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cropAdvisory && cropAdvisory.length > 0 ? (
                    cropAdvisory.map((advisory, index) => (
                      <div key={index} className="advisory-item">
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--forest)', marginBottom: '3px' }}>
                          🌾 {advisory.crop?.name || 'Unknown Crop'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
                          {advisory.recommendations}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(46,139,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" fill="none" stroke="var(--fern)" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textAlign: 'center' }}>All Systems Optimal</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Chart ── */}
          <div className="card-light" style={{ marginBottom: '24px', padding: '28px 28px 20px' }}>
            <div className="orb-amber" style={{ width: '250px', height: '250px', top: '-80px', right: '-60px' }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="section-pill">
                <span className="section-pill-dot" />
                Live Sensors
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: 'var(--forest)' }}>
                    Environmental <em style={{ fontStyle: 'italic', color: 'var(--fern)' }}>Conditions</em>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    Temperature
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--fern)' }} />
                    Humidity
                  </div>
                </div>
              </div>

              {error && <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '13px' }}>{error}</p>}

              <div style={{ width: '100%', height: 300 }}>
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid stroke="rgba(11,61,30,0.06)" strokeDasharray="4 4" />
                      <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis yAxisId="left" stroke="#ef4444"
                        label={{ value: "Temp (°C)", angle: -90, position: "insideLeft", style: { fontSize: '11px', fill: '#ef4444' } }}
                        style={{ fontSize: '11px' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--fern)"
                        label={{ value: "Humidity (%)", angle: 90, position: "insideRight", style: { fontSize: '11px', fill: 'var(--fern)' } }}
                        style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 8px 24px rgba(11,61,30,0.12)', fontSize: '12px', padding: '10px 14px' }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2.5}
                        dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} name="Temperature" />
                      <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="var(--fern)" strokeWidth={2.5}
                        dot={{ fill: 'var(--fern)', r: 4 }} activeDot={{ r: 6 }} name="Humidity" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(46,139,87,0.2)', borderTopColor: 'var(--fern)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Loading sensor data...</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 3: Crops ── */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

            {/* Available Crops Table */}
            <div className="card-light" style={{ flex: 1, minWidth: '300px', padding: '28px' }}>
              <div className="orb-green" style={{ width: '160px', height: '160px', top: '-40px', left: '-40px' }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="section-pill">
                  <span className="section-pill-dot" />
                  Garden
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: 'var(--forest)', marginBottom: '20px' }}>
                  Available <em style={{ fontStyle: 'italic', color: 'var(--fern)' }}>Crops</em>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="crop-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(11,61,30,0.08)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af' }}>Crop</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crops.length > 0 ? (
                        crops.map((crop, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid rgba(11,61,30,0.04)' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--fern), var(--moss))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                                  🌿
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--forest)' }}>{crop.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {crop.planted_at ? (
                                <span className="badge-planted">✓ Planted</span>
                              ) : (
                                <span className="badge-pending">○ Pending</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌾</div>
                            <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>No crops available yet</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Crop Detail Card */}
            <div className="card-light" style={{ flex: 1, minWidth: '300px', overflow: 'hidden' }}>
              <div className="orb-amber" style={{ width: '160px', height: '160px', bottom: '-40px', right: '-40px' }} />

              {/* Crop Image */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={activeCrop?.image || image}
                  alt={activeCrop?.name || "Crop"}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,61,30,0.7) 0%, transparent 60%)' }} />

                {activeCrop && (
                  <div style={{ position: 'absolute', bottom: '14px', left: '16px' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>
                      {activeCrop.name}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div style={{ padding: '20px', position: 'relative', zIndex: 2 }}>
                {/* Select + Button */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <select
                    className="crop-select"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                  >
                    <option value="">🌾 Select a crop</option>
                    {crops.map((crop, index) => (
                      <option key={index} value={crop.id}>{crop.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn-amber"
                    disabled={!activeCrop}
                    onClick={() => activeCrop && handleMoreDetails(activeCrop)}
                  >
                    Details →
                  </button>
                </div>

                {/* Info Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Health */}
                  <div className="info-box" style={{
                    background: activeCrop?.latest_detection_result?.detected_class
                      ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                        ? 'rgba(46,139,87,0.06)' : 'rgba(239,68,68,0.05)')
                      : 'rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                      {activeCrop?.latest_detection_result?.detected_class
                        ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy') ? '💚' : '⚠️')
                        : '—'}
                    </div>
                    <div className="info-box-label">Health</div>
                    <div className="info-box-value" style={{
                      color: activeCrop?.latest_detection_result?.detected_class
                        ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy') ? 'var(--fern)' : '#ef4444')
                        : 'var(--forest)'
                    }}>
                      {activeCrop?.latest_detection_result?.detected_class
                        ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy') ? 'Healthy' : 'Diseased')
                        : 'No Data'}
                    </div>
                  </div>

                  {/* Planted Date */}
                  <div className="info-box" style={{ background: 'rgba(212,132,10,0.05)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📅</div>
                    <div className="info-box-label">Planted</div>
                    <div className="info-box-value">{formatPlantedDate(activeCrop?.planted_at)}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40 }}>
        <UserSidebar />
      </div>
    </div>
  );
};

export default UserDashboard;
