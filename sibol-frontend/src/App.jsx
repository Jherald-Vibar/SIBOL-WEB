import React, { useEffect, useRef } from 'react'
import BG from './assets/bg.png'
import LOGO from './assets/logo.png'
import LogoLeft from './assets/logo-left.png'
import Logo1 from './assets/logo1.png'
import Logo2 from './assets/logo2.png'
import Logo3 from './assets/logo3.png'
import Logo4 from './assets/logo4.png'
import Logo5 from './assets/logo5.png'
import Image1 from './assets/first_image.png'
import Image2 from './assets/second_image.png'
import Image3 from './assets/third_image.png'
import BottomImage from './assets/bottom_image.png'
import AboutUs from './assets/about.jpg'
import './homepage.css'
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

const App = () => {
  const MapToken = import.meta.env.VITE_MAPS_APIKEY;
  mapboxgl.accessToken = MapToken;
  const mapContainer = useRef(null);

  const logos = [
  { img: Logo1, text: "WE INNOVATE TECH-DRIVEN AGRICULTURE" },
  { img: Logo2, text: "WE MAKE MONITORING TOOLS ACCESSIBLE" },
  { img: Logo3, text: "WE EMPOWER FARMERS WITH DATA." },
  { img: Logo4, text: "WE IMPROVE RESOURCE MANAGEMENT" },
  { img: Logo5, text: "WE STRENGTHEN CLIMATE RESILIENCE" },
    ];

   const getUs = [
   { img : Image1, title: "About us", text: "SIBOL is a smart farming project that uses IoT and LoRa technology to monitor crop health in real time. We aim to empower farmers with data-driven solutions for better harvests and sustainable agriculture."},
   {
    img: Image2, title: "Why this matters?", text: "Farmers face challenges from weather and limited data. SIBOL provides real-time crop insights to reduce losses, boost yields, and promote sustainable farming for a secure food future."
   },
   {
    img: Image3, title: "Our vision", text: "To revolutionize agriculture through smart, connected technologies that enable sustainable crop health monitoring, empower farmers with real-time insights, and contribute to food security and environmental resilience."
   }
   ];

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [120.5872, 15.4881],
      zoom: 12,
      pitch: 45,
      bearing: -17.6,
    });

    map.on("load", () => {
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.6,
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div className="bg-white px-4 md:px-12 py-8 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative w-full h-[500px] md:h-[680px] rounded-md overflow-hidden"
        style={{ clipPath: "polygon(0% 0%, 100% 0, 100% 73%, 50% 100%, 0 73%)" }}
      >
        {/* Navbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[95%] h-[10%] md:w-[90%] md:h-[9%] bg-gray-200 rounded-full px-4 py-2 flex items-center justify-between">
          <img src={LOGO} alt="logo" className="w-15 sm:w-20" />

          <div className='flex items-center justify-end gap-3'>
            <a
                href="/guest/login"
                className="rounded-md bg-green-950 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-2 text-white font-serif"
            >
                LOGIN
            </a>

            <a
                href="/guest/sign_up"
                className="rounded-md bg-green-950 px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-2 text-white font-serif"
            >
                SIGN UP
            </a>
          </div>
        </div>

        {/* Background */}
        <img src={BG} alt="" className="w-full h-full object-cover" />

        {/* Left Ribbon */}
        <div
          className="absolute top-0 left-0 h-full z-10 flex items-center justify-center text-white p-6 w-2/3 sm:w-1/3"
          style={{
            backgroundColor: "#0b542d",
            clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
          }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <img src={LogoLeft} alt="" className="w-32 sm:w-44" />
            <span className="font-serif text-lg sm:text-2xl">
              <span className="text-amber-300 text-3xl sm:text-5xl">S</span>mart Farming starts
              <br />
              with the right{" "}
              <span className="text-amber-300 text-3xl sm:text-5xl">D</span>ata
            </span>
          </div>
        </div>
        <div className="absolute top-0 left-10 h-full z-0 w-2/3 sm:w-1/3 sm:left-10"
                style={{
                    backgroundColor: "#0b542d",
                    opacity: 0.6,
                    clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
                }}
            >
        </div>
      </section>

      {/* Logos Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 py-10">
        {logos.map((logo, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-2 text-center"
          >
            <img src={logo.img} alt={`Logo${i + 1}`} className="w-15 sm:w-20" />
            <span className="font-sans text-sm sm:text-base text-green-800">
              {logo.text}
            </span>
          </div>
        ))}
      </div>

       <section className='flex items-center justify-center h-full mb-1 md:h-[150px]  md:mb-5 py-3 px-3'>
          <img src={LogoLeft} alt="LOGO" className='w-24 md:w-40' />
       </section>

       {/* GET TO KNOW US */}
        <section className='w-full px-3 py-3 relative flex flex-col items-center justify-center mb-10'>
            <div>
                <h1 className='text-3xl font-bold font-serif text-center md:text-4xl text-green-900 mb-8'>GET TO KNOW US</h1>
            </div>
            {/* CARD */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full justify-items-center'>
            {getUs.map((get, i) => (
                <div key={i} className='w-full max-w-[400px] sm:max-h-[400px] sm:max-w-[320px] z-2 bg-white flex flex-col justify-center px-5 py-5 rounded-lg' >
                    <div className='mb-3 flex items-center justify-center'>
                        <img src={get.img} alt={"image"+i} className='w-full sm:w-52 md:w-64 object-contain'/>
                    </div>

                    <div className='flex items-start justify-start'>
                        <h2 className='text-xl font-bold font-serif text-green-900 underline'>
                            {get.title}
                        </h2>
                    </div>

                    <div>
                        <p className='font-serif text-green-800 text-[0.9rem] md:text-[0.9rem]'>
                            {get.text}
                        </p>
                    </div>
                </div>
            ))}
            </div>
            {/* green background */}
            <div className='absolute bottom-0 left-0 w-full z-1 h-1/4 sm:h-1/3 bg-green-950 rounded-lg'>
            </div>
        </section>


        {/* SIBOL */}
        <section className='flex flex-col items-center justify-center w-full px-3 py-3 mb-10'>
            <div className='text-center'>
                <h1 className='text-2xl sm:text-3xl md:text-5xl font-semibold font-serif text-green-900 '>SIBOL: Smarter Monitoring, Better Farming.</h1>
            </div>

            <div className='mt-5 w-full flex justify-center'>
                <img src={BottomImage} alt="bottomImage" className='"w-3/4 sm:w-2/3 md:w-full object-contain' />
            </div>
        </section>

      {/* Map Section
      <div className="w-full h-64 md:h-[400px] px-2 py-2 bg-black rounded-lg">
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      </div>
      */}
    </div>
  )
}

export default App
