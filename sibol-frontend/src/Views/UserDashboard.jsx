import React, { useEffect, useState } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import axios from "axios";

const UserDashboard = () => {
  const name = localStorage.getItem("username");
  const location = localStorage.getItem("location");
  const apikey = import.meta.env.VITE_WEATHER_APIKEY;

  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");

  const [date, setDate] = useState(new Date());

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
    const timer = setInterval(()=> setDate(new Date()), 60000);
    return ()=> clearInterval(timer);
  },[])

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    }).replace(/\//g, " / ");

    console.log(formattedDate);

  return (
    <div className="bg-[#F4F0E5] flex h-screen">
      <div className="w-64 bg-white">
        <UserSidebar />
      </div>
      <div className="flex-1 flex flex-col rounded-md">
        <div className="shadow-md bg-white">
          <UserNavbar />
        </div>

        <div className="flex-1 flex flex-col px-3 py-3 rounded-md">
          <div className="text-4xl font-bold font-sans mb-3">
            WELCOME, [{name}]
          </div>

          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="w-[350px] flex flex-col rounded-md shadow-xl gap-3  bg-white px-3 py-3">
                <div className="flex flex-row items-center justify-center rounded-md px-3 py-3 gap-3">
                    <div className="flex flex-row items-center justify-start px-3 py-3 rounded-full w-48 bg-green-800">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        viewBox="0 0 48 48"
                    >
                        <path
                        fill="none"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="M24 44s14-10.435 14-24A14 14 0 1 0 10 20c0 13.565 14 24 14 24z"
                        />
                        <circle cx="24" cy="20" r="4" fill="#000"></circle>
                    </svg>
                    <h1 className=" text-white max-w-md font-sans font-semibold ml-3 text-xl">
                        {location} City
                    </h1>
                    </div>

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


                {weather ? (
                  <div className="flex flex-row items-end justify-between px-3 py-3">
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-bold font-sans">{weekday}</h1>
                        <p className="text-lg tracking-widest">{formattedDate}</p>

                        <div className="flex flex-col items-center justify-center px-3 py-3 gap-3 ">
                            <h1 className="text-5xl font-bold font-sans">{weather.current.temp_c}°</h1>

                            <div className="flex flex-row items-center justify-center px-3 py-3 gap-3 ">
                                <p className="text-xl font-bold font-sans">H: {weather.current.humidity}</p>
                                <p className="text-xl font-bold font-sans">L: {weather.current.humidity}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <img
                        src={weather.current.condition.icon}
                        alt={weather.current.condition.text}
                        className="w-32"/>

                        <h1 className="font-bold font-sans text-[1.3rem]">{weather.current.condition.text}</h1>
                        <p className="font-bold">
                            Feels like
                        {unit === "C"
                            ? ` ${weather.current.temp_c} °C`
                            : ` ${weather.current.temp_f} °F`}
                        </p>
                    </div>
                  </div>
                ) : (
                  <p>Fetching Weather...</p>
                )}
              </div>
            </div>

            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
