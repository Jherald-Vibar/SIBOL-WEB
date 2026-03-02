import React, { useEffect, useState } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import axios from "axios";
import image from "../assets/first_image.png";
import axiosClient from "./axios";
import { Card, CardContent, Typography } from "@mui/material";
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

  // Fetch sensor data
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

  // Fetch weather and forecast
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          "https://api.weatherapi.com/v1/forecast.json",
          {
            params: {
              key: apikey,
              q: location,
              days: 3,
            },
          }
        );
        setWeather(response.data);
        setForecastData(response.data.forecast.forecastday);
      } catch (error) {
        console.error("Weather API error:", error);
      }
    };
    if (location) fetchWeather();
  }, [location, apikey]);

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await axiosClient.get('/getCrops');
      setCrops(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);


  useEffect(() => {
    const fetchCropAdvisory = async () => {
      try {
        const response = await axiosClient.get('/getCropAdvisory');
        setCropAdvisory(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Error Fetching Detection Results");
      }
    }
    fetchCropAdvisory();
  }, []);

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, " / ");

  const handleMoreDetails = (crop) => {
    const gardenName = crop.garden?.name;
    const gardenLocation = crop.garden?.location;

    console.log(gardenName, gardenLocation);
    navigate(`/user/crop-care/${crop.garden?.id}/${crop.name}`);
  };

  // Format planted date
  const formatPlantedDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getWeatherIcon = (condition, size = "default") => {
    const conditionLower = condition.toLowerCase();
    const sizeClasses = size === "large" ? "w-16 h-16" : "w-12 h-12";

    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <Sun className={`${sizeClasses} text-amber-400`} fill="currentColor" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className={`${sizeClasses} text-blue-400`} fill="currentColor" />;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return <Cloud className={`${sizeClasses} text-slate-400`} fill="currentColor" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow className={`${sizeClasses} text-blue-300`} fill="currentColor" />;
    } else if (conditionLower.includes('wind')) {
      return <Wind className={`${sizeClasses} text-slate-500`} />;
    }
    return <Cloud className={`${sizeClasses} text-slate-400`} fill="currentColor" />;
  };

  const getShortDay = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const getTemp = (tempC, tempF) => {
    return unit === "C" ? Math.round(tempC) : Math.round(tempF);
  };

  return (
    <div className="bg-[#F4F0E5] flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40">
        <UserSidebar />
      </div>

      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        {/* Navbar */}
        <div className="shadow-md bg-white md:ml-64 sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64 px-4 sm:px-6 lg:px-10 py-5">
          {/* Welcome Header */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-5">
            WELCOME, {name}
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="flex flex-col gap-5 w-full lg:w-80 xl:w-96">
              {/* Modern Weather Card - Softer Green */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl p-6"
                 style={{
                  background: 'linear-gradient(135deg, rgba(144, 174, 137, 0.7) 0%, rgba(120, 150, 113, 0.75) 30%, rgba(178, 167, 124, 0.7) 70%, rgba(196, 179, 127, 0.75) 100%)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px 0 rgba(91, 120, 95, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
                }}
              >
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 backdrop-blur-sm bg-white/20 px-4 py-2 rounded-full border border-white/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="none"
                          stroke="#fff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={4}
                          d="M24 44s14-10.435 14-24A14 14 0 1 0 10 20c0 13.565 14 24 14 24z"
                        />
                        <circle cx="24" cy="20" r="4" fill="#fff"></circle>
                      </svg>
                      <span className="text-white font-medium text-sm">
                        {location || "Loading..."}
                      </span>
                    </div>

                    {/* Modern Temperature Toggle */}
                    <div
                      className="flex items-center w-20 h-9 backdrop-blur-sm bg-white/20 rounded-full cursor-pointer relative border border-white/30"
                      onClick={() => setUnit(unit === "C" ? "F" : "C")}
                    >
                      <div
                        className={`absolute w-1/2 h-[calc(100%-4px)] rounded-full bg-white shadow-lg transition-all duration-300 top-0.5 ${
                          unit === "C" ? "left-0.5" : "left-[calc(50%-2px)]"
                        }`}
                      />
                      <div className="flex w-full justify-between text-sm font-bold px-2.5 relative z-10 pointer-events-none">
                        <span className={unit === "C" ? "text-green-600" : "text-white"}>C</span>
                        <span className={unit === "F" ? "text-green-600" : "text-white"}>F</span>
                      </div>
                    </div>
                  </div>

                  {/* Weather Info */}
                  {weather ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-white/90">{weekday}</h2>
                        <p className="text-sm text-white/70 tracking-wide">{formattedDate}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <h3 className="text-6xl font-bold text-white mb-1">
                            {unit === "C" ? weather.current.temp_c : weather.current.temp_f}°
                          </h3>
                          <p className="text-white/80 text-sm">
                            Feels like {unit === "C" ? weather.current.temp_c : weather.current.temp_f}°
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <img
                            src={weather.current.condition.icon}
                            alt={weather.current.condition.text}
                            className="w-20 h-20 drop-shadow-lg"
                          />
                          <h4 className="font-semibold text-white text-sm mt-1">
                            {weather.current.condition.text}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/70">Fetching Weather...</div>
                  )}
                </div>
              </div>

              {/* Modern Crop Advisory Card */}
              <div className="relative overflow-hidden bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-3xl opacity-40"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 className="font-bold text-gray-800 text-lg">Crop Advisory</h3>
                    {cropAdvisory && cropAdvisory.length > 0 && (
                      <span className="ml-auto text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded-full">
                        {cropAdvisory.length}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="h-20 overflow-y-auto pr-2 space-y-2">
                    {cropAdvisory && cropAdvisory.length > 0 ? (
                      cropAdvisory.map((advisory, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border-l-4 border-orange-500 hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Crop Name */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🌾</span>
                            <p className="text-sm font-bold text-gray-800">
                              {advisory.crop?.name || 'Unknown Crop'}
                            </p>
                          </div>
                          {/* Recommendation */}
                          <p className="text-xs text-gray-700 leading-relaxed pl-7">
                            {advisory.recommendations}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-600">All Systems Optimal</p>
                      </div>
                    )}
                  </div>
                </div>

                <style>{`
                  .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                  }
                  .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 10px;
                  }
                  .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #10b981;
                    border-radius: 10px;
                  }
                `}</style>
              </div>
            </div>

            {/* 3-Day Forecast Section - Better Glassmorphism */}
            <div className="flex-1 w-full">
              <div
                className="relative overflow-hidden rounded-3xl h-full p-8"
                 style={{
                  background: 'linear-gradient(135deg, rgba(144, 174, 137, 0.7) 0%, rgba(120, 150, 113, 0.75) 30%, rgba(178, 167, 124, 0.7) 70%, rgba(196, 179, 127, 0.75) 100%)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px 0 rgba(91, 120, 95, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
                }}
              >
                {/* Decorative background elements - More subtle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-sm">3-Day Forecast</h2>

                  {forecastData && forecastData.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {forecastData.map((day, index) => (
                        <div
                          key={index}
                          className="backdrop-blur-md bg-white/15 rounded-2xl p-6 border border-white/25 hover:bg-white/25 transition-all duration-300 hover:scale-105 cursor-pointer"
                          style={{
                            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
                          }}
                        >
                          <div className="text-center">
                            <p className="text-white/95 text-sm font-medium mb-4 drop-shadow-sm">
                              {index === 0 ? 'Today' : getShortDay(day.date)}
                            </p>
                            <div className="flex justify-center mb-4">
                              {getWeatherIcon(day.day.condition.text)}
                            </div>
                            <div className="space-y-2">
                              <p className="text-4xl font-bold text-white drop-shadow-sm">
                                {getTemp(day.day.maxtemp_c, day.day.maxtemp_f)}°
                              </p>
                              <p className="text-xl text-white/90 drop-shadow-sm">
                                {getTemp(day.day.mintemp_c, day.day.mintemp_f)}°
                              </p>
                              <p className="text-sm text-white/80 mt-2">
                                {day.day.condition.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-white text-lg drop-shadow-sm">Loading forecast...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Environmental Condition Chart */}
          <div className="mb-6">
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>

              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📊</span>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Environmental Condition
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-gray-600">Temperature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-600">Humidity</span>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}

                <div style={{ width: "100%", height: 320 }}>
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#ef4444"
                          label={{
                            value: "Temperature (°C)",
                            angle: -90,
                            position: "insideLeft",
                            style: { fontSize: '12px', fontWeight: '600', fill: '#ef4444' }
                          }}
                          style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#22c55e"
                          label={{
                            value: "Humidity (%)",
                            angle: 90,
                            position: "insideRight",
                            style: { fontSize: '12px', fontWeight: '600', fill: '#22c55e' }
                          }}
                          style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="temp"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', r: 5 }}
                          activeDot={{ r: 7, fill: '#dc2626' }}
                          name="Temperature"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="humidity"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ fill: '#22c55e', r: 5 }}
                          activeDot={{ r: 7, fill: '#16a34a' }}
                          name="Humidity"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading sensors data...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Crops Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Modern Available Crops Table */}
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 w-full lg:w-1/2">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-3xl opacity-40"></div>

              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🌱</span>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Available Crops
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Crop Name
                        </th>
                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {crops.length > 0 ? (
                        crops.map((crop, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                  <span className="text-white text-sm">🌿</span>
                                </div>
                                <span className="font-semibold text-gray-800">{crop.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {crop.planted_at ? (
                                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium text-sm border border-green-200">
                                  <span className="text-base">✓</span>
                                  <span>Planted</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full font-medium text-sm border border-gray-200">
                                  <span className="text-base">○</span>
                                  <span>Pending</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-4 py-12">
                            <div className="text-center">
                              <div className="text-6xl mb-4">🌾</div>
                              <p className="text-gray-500 font-medium">No crops available yet</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modern Crop Info Card */}
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 w-full lg:w-1/2">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-40"></div>

              <div className="relative">
                {/* Modern Crop Image */}
                <div className="relative h-72 overflow-hidden rounded-t-3xl">
                  <img
                    src={
                      activeCrop?.image
                        ? activeCrop.image
                        : image
                    }
                    alt={activeCrop?.name || "Crop Background"}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>

                {/* Modern Overlay Info Box */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[92%]">
                  <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/50 p-5">
                    {/* Select Crop + More Details Button */}
                    <div className="flex items-center gap-3 mb-4">
                      <select
                        name="crop"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="flex-1 border-2 border-gray-200 rounded-2xl bg-white outline-none px-4 py-3 text-sm font-semibold text-gray-700 hover:border-green-400 focus:border-green-500 transition-colors cursor-pointer"
                      >
                        <option value="">🌾 Select Crop</option>
                        {crops.map((crop, index) => (
                          <option key={index} value={crop.id}>
                            {crop.name}
                          </option>
                        ))}
                      </select>

                      <button
                        className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg whitespace-nowrap transform hover:scale-105 disabled:hover:scale-100"
                        disabled={!activeCrop}
                        onClick={() => activeCrop && handleMoreDetails(activeCrop)}
                      >
                        Details →
                      </button>
                    </div>

                    {/* Modern Info Boxes */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Health Status Box - Dynamic Colors */}
                      <div className={`bg-gradient-to-br ${
                  activeCrop?.latest_detection_result?.detected_class
                    ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                        ? "from-green-50 to-emerald-50"
                        : "from-red-50 to-orange-50")
                    : "from-gray-50 to-gray-100"
                } rounded-2xl p-4 border-2 ${
                  activeCrop?.latest_detection_result?.detected_class
                    ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                        ? "border-green-200 hover:border-green-300"
                        : "border-red-200 hover:border-red-300")
                    : "border-gray-200 hover:border-gray-300"
                } transition-colors`}>
                  <div className="text-center">
                      <span className="text-2xl mb-2 block">
                          {activeCrop?.latest_detection_result?.detected_class
                            ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                                ? "💚"
                                : "⚠️")
                            : "—"}
                      </span>
                      <h3 className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                          Health
                      </h3>
                      <p className={`text-sm font-bold ${
                          activeCrop?.latest_detection_result?.detected_class
                            ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                                ? "text-green-600"
                                : "text-red-600")
                            : "text-gray-800"
                        }`}>
                          {activeCrop?.latest_detection_result?.detected_class
                            ? (activeCrop.latest_detection_result.detected_class.toLowerCase().includes('healthy')
                                ? "Healthy"
                                : "Diseased")
                            : "No Data"}
                      </p>
                  </div>
                </div>

                      {/* Planted Date Box */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                        <div className="text-center">
                          <span className="text-2xl mb-2 block">📅</span>
                          <h3 className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                            Planted
                          </h3>
                          <p className="text-sm font-bold text-gray-800">
                            {formatPlantedDate(activeCrop?.planted_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <UserSidebar />
      </div>
    </div>
  );
};

export default UserDashboard;
