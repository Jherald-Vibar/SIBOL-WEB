import React from 'react'
import BG from './assets/bg.png'
import LOGO from './assets/logo.png'
import LogoLeft from './assets/logo-left.png'
import Logo1 from './assets/logo1.png'
import Logo2 from './assets/logo2.png'
import Logo3 from './assets/logo3.png'
import Logo4 from './assets/logo4.png'
import Logo5 from './assets/logo5.png'
import AboutUs from './assets/about.jpg'
import './homepage.css'
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from 'react'


const App = () => {

  const MapToken = import.meta.env.VITE_MAPS_APIKEY;
  mapboxgl.accessToken = MapToken;

  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
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
    <div className='bg-gray-300 px-12 py-12 min-h-screen'>
        <section className='relative w-full h-[680px] rounded-md rounded-t-4xl overflow-hidden' style={{
            clipPath: "polygon(0% 0%, 100% 0, 100% 73%, 50% 100%, 0 73%)",
        }}>
            <div className='relative top-8 left-1/2 -translate-x-1/2 z-2 w-[90%] sm:w-[90%] bg-gray-200 rounded-full px-4 py-1 flex items-center justify-between'>
                <div className='flex items-center justify-start'>
                    <img src={LOGO} alt="" />
                </div>
                <div className='flex items-center justify-end'>
                    <button className='rounded-md bg-green-950 px-3 py-1 mr-4 text-white font-serif'>LOGIN</button>
                </div>
            </div>
            <img src={BG} alt="" />
            <div className='absolute top-17 left-0 h-full flex  z-1 item-start justify-center text-white p-6'
                style={{ width: "30%",
                backgroundColor: "#0b542d",
                clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",}}>
                <div className='flex flex-col px-3 py-3 items-center mb-20 justify-center'>
                    <img src={LogoLeft} alt="" className='w-[180px] ' />
                    <div className='text-center'>
                        <span className='font-serif text-2xl'><span className='text-amber-300 text-5xl'>S</span>mart Farming starts </span>
                        <span className='font-serif text-2xl'>with the right <span className='text-amber-300 text-5xl'>D</span>ata</span>
                    </div>
                </div>
            </div>
            <div className="absolute top-17 left-8 h-full z-0"
                style={{
                    width: "30%",
                    backgroundColor: "#0b542d",
                    opacity: 0.6,
                    clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
                }}
            >
            </div>
        </section>

        <div className='h-[150px] px-3 py-3 relative bg-gray-300'>
            <div className='absolute left-10 top-[-140px]'>
                <div className='flex flex-col justify-center items-center px-3 py-3 font-serif'>
                    <img src={Logo1} alt="Logo1" />
                    <span className='font-sans w-50 text-center text-green-800'>WE MONITOR FARM CONDITION</span>
                </div>
            </div>
            <div className='absolute left-60 top-[-30px]'>
                <div className='flex flex-col justify-center items-center px-3 py-3 font-serif'>
                    <img src={Logo2} alt="Logo2" />
                    <span className='font-sans w-50 text-center text-green-800'>WE MONITOR FARM CONDITION</span>
                </div>
            </div>
            <div className='absolute left-130 top-1'>
                <div className='flex flex-col justify-center items-center px-3 py-3 font-serif'>
                    <img src={Logo3} alt="Logo3" />
                    <span className='font-sans w-50 text-center text-green-800'>WE MONITOR FARM CONDITION</span>
                </div>
            </div>
             <div className='absolute right-60 top-[-30px]'>
                <div className='flex flex-col items-center justify-center px-3 py-3 font-serif'>
                    <img src={Logo4} alt="Logo4" />
                    <span className='font-sans w-50 text-center text-green-800'>WE MONITOR FARM CONDITION</span>
                </div>
            </div>
             <div className='absolute right-10 top-[-140px]'>
                <div className='flex flex-col justify-center items-center px-3 py-3 font-serif'>
                    <img src={Logo5} alt="Logo5" />
                    <span className='font-sans w-50 text-center text-green-800'>WE MONITOR FARM CONDITION</span>
                </div>
            </div>
        </div>
        <section className='grid grid-cols-2 h-[300px] bg-amber-950 mb-10'>
            <div className='image'>
               <img src={AboutUs} alt="" className='h-[300px] w-full' />
            </div>
            <div className='flex flex-col items-center justify-center px-3 py-3 gap-3 text-white bg-green-950'>
                <h1 className='font-serif font-bold text-3xl'>ABOUT US</h1>
                <p className='font-serif text-2xl text-center'>SIBOL is a shared IoT-based system that delivers real-time data on soil, water, and weather.  It connects farmers, barangays, and the city to improve farm management, reduce risks, and support sustainable farming.</p>
            </div>
        </section>
        <div className='flex flex-row justify-between px-20 mb-10'>
            <div className='h-[400px] w-[450px] px-1 bg-green-950 flex justify-center items-center rounded-lg'>
                <div className='h-[390px] w-[440px] bg-green-950 rounded-lg flex flex-col items-center justify-center px-10 py-3 text-center text-white font-serif border-2 border-white gap-3'>
                    <h2 className='text-2xl font-semibold'>WHY THIS MATTERS?</h2>
                    <p className='text-xl'>Farming is vital to our communities but faces challenges like weather changes, floods, and limited resources. SIBOL provides real-time data to help farmers decide better, barangays respond faster, and the city support agriculture — strengthening food security and livelihoods.</p>
                    <img src={LOGO} alt="" />
                </div>
            </div>

            <div className='h-[400px] w-[450px] px-1 bg-green-950 flex justify-center items-center rounded-lg'>
                <div className='h-[390px] w-[440px] bg-green-950 rounded-lg flex flex-col items-center justify-center px-10 py-3 text-center text-white font-serif border-2 border-white gap-4'>
                    <h2 className='text-2xl font-semibold'>VISION FOR COMMUNITY</h2>
                    <p className='text-xl'>To build a connected farming community where technology and collaboration empower every farmer, every barangay, and the whole city — creating a resilient, sustainable, and food-secure future for all.</p>
                    <img src={LOGO} alt="" className='mt-10' />
                </div>
            </div>
        </div>

        <div className="w-full h-[400px] px-3 py-3 bg-black" ref={mapContainer}></div>
    </div>
  )
}

export default App
