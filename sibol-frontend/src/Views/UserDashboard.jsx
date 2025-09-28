import React, { useEffect, useState } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import axios from "axios";
import image from "../assets/first_image.png";
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
  const location = localStorage.getItem("location");
  const apikey = import.meta.env.VITE_WEATHER_APIKEY;
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");
  const [date, setDate] = useState(new Date());

  const data = [
  { name: "Mon", temp: 28, humidity: 70 },
  { name: "Tue", temp: 30, humidity: 65 },
  { name: "Wed", temp: 27, humidity: 80 },
  { name: "Thu", temp: 29, humidity: 75 },
  { name: "Fri", temp: 31, humidity: 60 },
  { name: "Sat", temp: 33, humidity: 68 },
  { name: "Sun", temp: 32, humidity: 72 },
];

  const [selectedCrop, setSelectedCrop] = useState("");

  const crops = [
    { name: "Calamansi", planted: true },
    { name: "Wild Chili", planted: false },
    { name: "Carrot", planted: true },
    { name: "Ginger", planted: false },
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          "http://api.weatherapi.com/v1/current.json",
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

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, " / ");

  return (
    <div className="bg-[#F4F0E5] flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md">
        <UserSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="shadow-md bg-white md:ml-64">
          <UserNavbar />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col md:ml-64 px-4 sm:px-6 lg:px-10 py-5 rounded-md">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-sans mb-3">
            WELCOME, {name}
          </div>
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex flex-col gap-3 w-full lg:max-w-sm">
              <div
                className="w-full flex flex-col rounded-md shadow-xl bg-white p-3"
                style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center px-3 py-1 rounded-full bg-green-800 w-full sm:w-auto justify-center">
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
                    <h1 className="text-white font-sans font-semibold ml-3 text-sm sm:text-base">
                      {location} City
                    </h1>
                  </div>

                  {/* Toggle Unit */}
                  <div
                    className="flex items-center w-20 h-10 bg-gray-200 rounded-full cursor-pointer relative"
                    onClick={() => setUnit(unit === "C" ? "F" : "C")}
                  >
                    <div
                      className={`absolute w-1/2 h-full rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        unit === "C"
                          ? "left-0 bg-green-900 text-white"
                          : "left-1/2 bg-green-900 text-white"
                      }`}
                    >
                      {unit}
                    </div>
                    <div className="flex w-full justify-between text-sm font-bold text-gray-600 px-2">
                      <span>C</span>
                      <span>F</span>
                    </div>
                  </div>
                </div>

                {/* Weather Info */}
                {weather ? (
                  <div className="flex flex-col sm:flex-row items-center justify-evenly px-3 py-3">
                    <div className="flex flex-col items-center mb-5">
                      <h1 className="text-2xl sm:text-3xl font-bold font-sans">
                        {weekday}
                      </h1>
                      <p className="text-sm sm:text-lg tracking-widest">
                        {formattedDate}
                      </p>
                      <h1 className="text-3xl sm:text-4xl font-bold font-sans mt-2">
                        {weather.current.temp_c}°
                      </h1>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={weather.current.condition.icon}
                        alt={weather.current.condition.text}
                        className="w-20 sm:w-32"
                      />
                      <h1 className="font-bold font-sans text-base sm:text-lg">
                        {weather.current.condition.text}
                      </h1>
                      <p className="font-bold text-sm sm:text-base">
                        Feels like{" "}
                        {unit === "C"
                          ? `${weather.current.temp_c} °C`
                          : `${weather.current.temp_f} °F`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Fetching Weather...</p>
                )}
              </div>

              {/* Crop Advisory */}
              <div
                className="w-full bg-white px-3 py-3 rounded-md"
                style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
              >
                <div className="px-2 py-1 bg-green-800 rounded-full text-start w-fit mx-auto">
                  <p className="font-semibold font-sans text-white text-sm">
                    Crop Advisory
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="w-full">
               <Card sx={{ maxWidth: 600, margin: "auto", boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                        Environmental Condition
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid stroke="#ccc" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" label={{ value: "Temperature (°C)", angle: 90, position: "insideLeft" }} />
                            <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: "Humidity (%)", angle: -90, position: "insideRight" }}
                            />
                            <Tooltip />
                            <Legend />
                            <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="temp"
                            stroke="red"
                            strokeWidth={2}
                            dot={false}
                            />
                            <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="humidity"
                            stroke="green"
                            strokeWidth={2}
                            dot={false}
                            />
                        </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
          </div>

          {/* Crop Section */}
          <div className="flex flex-col lg:flex-row gap-6 px-2 py-3">
            {/* Available Crops */}
            <div
              className="p-4 bg-white shadow-md rounded-lg w-full max-w-md mx-auto"
              style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
            >
              <h2 className="text-center font-semibold mb-4 text-lg text-gray-700">
                Available Crops
              </h2>
              <table className="w-full border border-gray-200 rounded-md overflow-hidden text-sm sm:text-base">
                <thead>
                  <tr className="bg-green-100 text-gray-700">
                    <th className="border border-gray-200 px-2 sm:px-4 py-2 text-left">
                      Crop Name
                    </th>
                    <th className="border border-gray-200 px-2 sm:px-4 py-2 text-center">
                      Planted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-green-50 transition`}
                    >
                      <td className="border border-gray-200 px-2 sm:px-4 py-2 font-medium text-gray-700">
                        {crop.name}
                      </td>
                      <td className="border border-gray-200 px-2 sm:px-4 py-2 text-center">
                        {crop.planted ? (
                          <span className="text-green-600 text-lg">✅</span>
                        ) : (
                          <span className="text-gray-400 text-lg">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Crop Info Card */}
            <div
              className="w-full max-w-lg bg-white rounded-md shadow-md mx-auto"
              style={{ boxShadow: "4px 4px 3px rgba(0,0,0,0.5)" }}
            >
              <div className="relative">
                <img
                  src={image}
                  alt="Crop Background"
                  className="rounded-md w-full h-[250px] sm:h-[300px] object-cover"
                />
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white w-[90%] sm:w-[360px] flex flex-col rounded-md shadow-md px-3 py-3">
                  {/* Select + Button */}
                  <div className="flex items-center justify-between gap-2">
                    <select
                      name="crop"
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md bg-white outline-none px-2 sm:px-3 py-2 text-sm font-medium text-gray-700"
                    >
                      <option value="">Select Crop</option>
                      <option value="calamansi">Calamansi</option>
                      <option value="ginger">Ginger</option>
                      <option value="carrot">Carrot</option>
                      <option value="wild-chili">Wild Chili</option>
                    </select>
                    <button className="px-3 py-2 border border-gray-400 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition flex items-center gap-1">
                      More Details <span>↗</span>
                    </button>
                  </div>

                  {/* Info Boxes */}
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <div className="flex flex-col items-center border border-gray-300 rounded-md px-2 sm:px-3 py-2 w-1/3">
                      <h1 className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 uppercase tracking-wide">
                        Crop Health
                      </h1>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        Good
                      </p>
                    </div>
                    <div className="flex flex-col items-center border border-gray-300 rounded-md px-2 sm:px-3 py-2 w-1/3">
                      <h1 className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 uppercase tracking-wide">
                        Planting Date
                      </h1>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        6 May, 2025
                      </p>
                    </div>
                    <div className="flex flex-col items-center border border-gray-300 rounded-md px-2 sm:px-3 py-2 w-1/3">
                      <h1 className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 uppercase tracking-wide">
                        Growth Stage
                      </h1>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        Harvest Stage
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
  );
};

export default UserDashboard;
