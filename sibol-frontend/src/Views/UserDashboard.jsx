import React, { useEffect, useState } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import axios from "axios";
import image from "../assets/first_image.png";
import axiosClient from "./axios";
import { Card, CardContent, Typography } from "@mui/material";
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

const UserDashboard = () => {
  const name = localStorage.getItem("username");
  const apikey = import.meta.env.VITE_WEATHER_APIKEY;
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [activeCrop, setActiveCrop] = useState(null);
  const [crops, setCrops] = useState([]);

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

  // Update active crop when selection changes
  useEffect(() => {
    const crop = crops.find((c) => c.name === selectedCrop);
    setActiveCrop(crop || null);
  }, [selectedCrop, crops]);

  // Fetch location
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

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          "https://api.weatherapi.com/v1/current.json",
          {
            params: {
              key: apikey,
              q: location,
            },
          }
        );
        setWeather(response.data);
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

  // Fetch crops
  const fetchCrops = async () => {
    try {
      const response = await axiosClient.get('/getCrops');
      setCrops(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
    }
  };

  useEffect(() => {
    fetchCrops();
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
    // Add navigation or modal logic here
    console.log("View details for:", crop);
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

          <div className="flex flex-col lg:flex-row gap-5 mb-5">
            <div className="flex flex-col gap-4 w-full lg:w-80 xl:w-96">
              <div
                className="w-full bg-white rounded-md shadow-xl p-4"
                style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                  <div className="flex items-center px-3 py-2 rounded-full bg-green-800 w-full sm:w-auto justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
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
                    <span className="text-white font-semibold ml-2 text-sm sm:text-base">
                      {location || "Loading..."}
                    </span>
                  </div>

                  {/* Temperature Unit Toggle */}
                  <div
                    className="flex items-center w-20 h-10 bg-gray-200 rounded-full cursor-pointer relative"
                    onClick={() => setUnit(unit === "C" ? "F" : "C")}
                  >
                    <div
                      className={`absolute w-1/2 h-full rounded-full bg-green-900 transition-all duration-300 ${
                        unit === "C" ? "left-0" : "left-1/2"
                      }`}
                    />
                    <div className="flex w-full justify-between text-sm font-bold px-2 relative z-10 pointer-events-none">
                      <span className={unit === "C" ? "text-white" : "text-gray-600"}>C</span>
                      <span className={unit === "F" ? "text-white" : "text-gray-600"}>F</span>
                    </div>
                  </div>
                </div>

                {/* Weather Info */}
                {weather ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-2">
                    <div className="flex flex-col items-center mb-4 sm:mb-0">
                      <h2 className="text-2xl sm:text-3xl font-bold">{weekday}</h2>
                      <p className="text-sm tracking-widest text-gray-600">{formattedDate}</p>
                      <h3 className="text-4xl sm:text-5xl font-bold mt-2">
                        {unit === "C" ? weather.current.temp_c : weather.current.temp_f}°
                      </h3>
                    </div>

                    <div className="flex flex-col items-center">
                      <img
                        src={weather.current.condition.icon}
                        alt={weather.current.condition.text}
                        className="w-24 sm:w-32"
                      />
                      <h4 className="font-bold text-base sm:text-lg">
                        {weather.current.condition.text}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Feels like{" "}
                        {unit === "C"
                          ? `${weather.current.temp_c}°C`
                          : `${weather.current.temp_f}°F`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">Fetching Weather...</div>
                )}
              </div>

              {/* Crop Advisory Card */}
              <div
                className="w-full bg-white px-4 py-4 rounded-md shadow-md"
                style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
              >
                <div className="bg-green-800 rounded-full px-4 py-2 text-center w-fit mx-auto">
                  <p className="font-semibold text-white text-sm">Crop Advisory</p>
                </div>

                <div className="mt-3 text-center">
                  {alert && alert.length > 0 ? (
                    <p className="text-xs md:text-sm text-red-500 font-medium">{alert}</p>
                  ) : (
                    <p className="text-xs md:text-sm text-gray-500 italic">No alerts</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="flex-1 w-full">
              <Card sx={{ boxShadow: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Environmental Condition
                  </Typography>

                  {error && <Typography color="error">{error}</Typography>}

                  <div style={{ width: "100%", height: 300 }}>
                    {data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <CartesianGrid stroke="#ccc" />
                          <XAxis dataKey="time" />
                          <YAxis
                            yAxisId="left"
                            label={{
                              value: "Temperature (°C)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{
                              value: "Humidity (%)",
                              angle: 90,
                              position: "insideRight",
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="temp"
                            stroke="red"
                            dot={false}
                            name="Temperature"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="humidity"
                            stroke="green"
                            dot={false}
                            name="Humidity"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Typography variant="body2" color="textSecondary">
                          Loading sensors data...
                        </Typography>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section: Crops Table & Info Card */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Available Crops Table */}
            <div
              className="p-4 bg-white shadow-md rounded-lg w-full lg:w-1/2"
              style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
            >
              <h2 className="text-center font-semibold mb-4 text-lg text-gray-700">
                Available Crops
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-md text-sm">
                  <thead>
                    <tr className="bg-green-100 text-gray-700">
                      <th className="border border-gray-200 px-3 py-2 text-left">
                        Crop Name
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center">
                        Planted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.length > 0 ? (
                      crops.map((crop, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-green-50 transition`}
                        >
                          <td className="border border-gray-200 px-3 py-2 font-medium text-gray-700">
                            {crop.name}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            {crop.planted_at ? (
                              <span className="text-green-600 text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 text-lg">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-8 text-gray-500">
                          No crops available yet 🌱
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Crop Info Card */}
            <div
              className="w-full lg:w-1/2 bg-white rounded-md shadow-md"
              style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
            >
              <div className="relative">
                {/* Crop Image */}
                <img
                  src={
                    activeCrop?.image
                      ? `${import.meta.env.VITE_API_BASE_URL}/sensor_images/${activeCrop.image}`
                      : image
                  }
                  alt={activeCrop?.name || "Crop Background"}
                  className="rounded-t-md w-full h-64 sm:h-80 object-cover"
                />

                {/* Overlay Info Box */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white w-[90%] flex flex-col rounded-md shadow-lg px-3 py-3">
                  {/* Select Crop + More Details Button */}
                  <div className="flex items-center gap-2 mb-3">
                    <select
                      name="crop"
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md bg-white outline-none px-3 py-2 text-sm font-medium text-gray-700"
                    >
                      <option value="">Select Crop</option>
                      {crops.map((crop, index) => (
                        <option key={index} value={crop.name}>
                          {crop.name}
                        </option>
                      ))}
                    </select>

                    <button
                      className="px-3 py-2 border border-gray-400 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      disabled={!activeCrop}
                      onClick={() => activeCrop && handleMoreDetails(activeCrop)}
                    >
                      More Details ↗
                    </button>
                  </div>

                  {/* Info Boxes */}
                  <div className="flex justify-between gap-2">
                    <div className="flex flex-col items-center border border-gray-300 rounded-md px-2 py-2 flex-1">
                      <h3 className="text-[0.6rem] sm:text-xs text-gray-500 uppercase tracking-wide">
                        Crop Health
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {activeCrop ? "Good" : "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center border border-gray-300 rounded-md px-2 py-2 flex-1">
                      <h3 className="text-[0.6rem] sm:text-xs text-gray-500 uppercase tracking-wide">
                        Planting Date
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {activeCrop?.planted_at || "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center border border-gray-300 rounded-md px-2 py-2 flex-1">
                      <h3 className="text-[0.6rem] sm:text-xs text-gray-500 uppercase tracking-wide">
                        Growth Stage
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {activeCrop ? "Harvest Stage" : "—"}
                      </p>
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
