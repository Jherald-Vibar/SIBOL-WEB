import React, { useEffect, useRef, useState } from 'react'
import BG from './assets/bg-sibol.png'
import BGHue from './assets/bg-hue.png'
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
import "mapbox-gl/dist/mapbox-gl.css"
import mapboxgl from "mapbox-gl"
import Footer from './Views/parts/Footer'

// ─── Crop config (Restored) ────────────────────────────────────────────────────
const CROPS = {
  mustasa: {
    name: 'Mustasa',
    optimalMoisture: [60, 75],
    optimalTemp: [22, 30],
    optimalHumidity: [65, 80],
    optimalPh: [6.0, 7.0],
    conditions: ['Mustasa Healthy', 'Mustasa Healthy'],
  },
  pechay: {
    name: 'Pechay',
    optimalMoisture: [55, 70],
    optimalTemp: [18, 28],
    optimalHumidity: [60, 75],
    optimalPh: [6.5, 7.5],
    conditions: ['Pechay Healthy', 'Pechay Needs Water'],
  },
}

function rand(min, max, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec))
}

// ─── Live Sensor Card (Restored Logic + New Design) ────────────────────────────
const LiveSensorCard = () => {
  const [currentCrop, setCurrentCrop] = useState('mustasa')
  const [data, setData] = useState(null)

  useEffect(() => {
    const generate = () => {
      const crop = CROPS[currentCrop]
      const moisture = rand(28, 82)
      const temp = rand(20, 34)
      const humidity = rand(55, 85)
      const ph = rand(5.5, 7.8)
      
      const isCritical = moisture < crop.optimalMoisture[0] - 10
      const isLow = !isCritical && moisture < crop.optimalMoisture[0]
      const isOptimal = moisture >= crop.optimalMoisture[0] && moisture <= crop.optimalMoisture[1]
      
      const healthBase = isOptimal ? 88 : isCritical ? 42 : 62
      const health = Math.round(rand(healthBase, Math.min(healthBase + 10, 99)))
      
      setData({ moisture, temp, humidity, ph, health, isCritical, isLow, isOptimal })
    }
    
    generate() // Initial load
    const id = setInterval(generate, 2500) // Poll every 2.5s
    return () => clearInterval(id)
  }, [currentCrop])

  if (!data) return null

  const { moisture, temp, humidity, health, isCritical, isLow } = data
  const crop = CROPS[currentCrop]

  const healthColor = health >= 80 ? 'text-green-400' : health >= 60 ? 'text-amber-400' : 'text-red-400'
  const moistureColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-[#f0a830]'

  return (
    <div className="w-full max-w-[360px] glass-panel rounded-2xl p-6 shadow-2xl anim-fadeUp-d text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Live Sensor Feed</span>
        <span className="flex items-center gap-2 text-[11px] text-green-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Active • Field 3
        </span>
      </div>

      {/* Interactive Crop Switcher */}
      <div className="flex gap-2 mb-6">
        {Object.entries(CROPS).map(([key, val]) => (
          <button 
            key={key} 
            onClick={() => setCurrentCrop(key)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border
              ${currentCrop === key 
                ? 'bg-[#f0a830] text-black border-[#f0a830]' 
                : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'}`}>
            {val.name}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-6">
        <div>
          <p className="text-[11px] text-white/60 mb-1">Soil Moisture</p>
          <p className="text-2xl font-semibold">{moisture.toFixed(0)}<span className="text-sm text-white/60">%</span></p>
          <p className={`text-[10px] mt-1 ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-green-400'}`}>
            {isCritical ? '↓ Critical' : isLow ? '↓ Low' : '↑ Optimal'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-white/60 mb-1">Temperature</p>
          <p className="text-2xl font-semibold">{temp.toFixed(1)}<span className="text-sm text-white/60">°C</span></p>
          <p className="text-[10px] text-green-400 mt-1">
             {temp > crop.optimalTemp[1] ? '↑ High' : temp < crop.optimalTemp[0] ? '↓ Low' : 'Optimal'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-white/60 mb-1">Humidity</p>
          <p className="text-2xl font-semibold">{humidity.toFixed(0)}<span className="text-sm text-white/60">%</span></p>
          <p className="text-[10px] text-white/40 mt-1">Target: {crop.optimalHumidity[0]}%</p>
        </div>
        <div>
          <p className="text-[11px] text-white/60 mb-1">Crop Health (AI)</p>
          <p className="text-2xl font-semibold">{health}<span className="text-sm text-white/60">%</span></p>
          <p className={`text-[10px] mt-1 ${healthColor}`}>
            {health >= 80 ? '↑ Good' : health >= 60 ? '— Fair' : '↓ Poor'}
          </p>
        </div>
      </div>

      {/* Dynamic Bar Chart simulating historical data ending on current reading */}
      <div className="flex items-end gap-1.5 h-12 mt-auto">
        {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-white/10 transition-all duration-500" style={{ height: `${h}%` }}></div>
        ))}
        {/* Current live reading bar */}
        <div className={`flex-1 rounded-sm transition-all duration-700 ${moistureColor}`} style={{ height: `${moisture}%` }}></div>
      </div>
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────────
const App = () => {
  const MapToken = import.meta.env.VITE_MAPS_APIKEY
  if (MapToken) mapboxgl.accessToken = MapToken

  const mapContainer = useRef(null)
  const [isVisible, setIsVisible] = useState({})
  const [marqueeReady, setMarqueeReady] = useState(false)

  const logos = [
    { img: Logo1, text: 'Tech-Driven Agriculture' },
    { img: Logo2, text: 'Accessible Monitoring Tools' },
    { img: Logo3, text: 'Empowering Farmers' },
    { img: Logo4, text: 'Resource Management' },
    { img: Logo5, text: 'Climate Resilience' },
  ]

  const getUs = [
    { img: Image1, title: 'About Us', text: 'SIBOL is a smart farming project that uses IoT and LoRa technology to monitor crop health in real time. We aim to empower farmers with data-driven solutions for better harvests and sustainable agriculture.' },
    { img: Image2, title: 'Why this matters?', text: 'Farmers face challenges from weather and limited data. SIBOL provides real-time crop insights to reduce losses, boost yields, and promote sustainable farming for a secure food future.' },
    { img: Image3, title: 'Our Vision', text: 'To revolutionize agriculture through smart, connected technologies that enable sustainable crop health monitoring, empower farmers with real-time insights, and contribute to food security and environmental resilience.' },
  ]

  // Intersection Observer
  useEffect(() => {
    setMarqueeReady(true)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setIsVisible((prev) => ({ ...prev, [e.target.id]: true }))
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Restored Mapbox Logic
  useEffect(() => {
    if (!mapContainer.current || !MapToken) return
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [120.9822, 14.6507], // Adjusted roughly to Caloocan bounds based on your profile
      zoom: 15,
      pitch: 45,
      bearing: -17.6,
    })
    
    map.on('load', () => {
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#1a6636',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.7,
        },
      })
    })
    return () => map.remove()
  }, [MapToken])

  return (
    <div className="font-sans bg-[#fbfaf6] overflow-x-hidden text-[#0b3d1e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        /* Animations */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marqueeAnim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .anim-fadeUp { animation: fadeUp 1s ease-out both; }
        .anim-fadeUp-d { animation: fadeUp 1s 0.3s ease-out both; }
        
        .marquee-run { animation: marqueeAnim 30s linear infinite; display: inline-block; white-space: nowrap; }
        .marquee-run:hover { animation-play-state: paused; }
        
        /* Glass Card */
        .glass-panel {
          background: rgba(18, 51, 30, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
      `}</style>

      {/* ─── HERO SECTION ─── */}
     <section 
        className="min-h-screen relative flex flex-col bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${BG})` }}
      >
        {/* 1. Your new bg-hue.png filter layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${BGHue})` }}
        ></div>

        {/* 2. The existing gradient (keeps the white text easy to read) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-0"></div>

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6">
          <div className="border border-green-500/50 rounded-full px-5 py-2 backdrop-blur-sm bg-white/5">
            <span className="text-[13px] font-bold text-white tracking-widest uppercase">
              IOT Crop Monitoring
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="/login" className="px-8 py-2.5 rounded-full bg-[#144528] hover:bg-[#0b3d1e] text-white text-[13px] font-bold transition-colors shadow-lg">
              LOGIN
            </a>
            <a href="/register" className="px-8 py-2.5 rounded-full bg-[#20693a] hover:bg-[#2d8f52] text-white text-[13px] font-bold transition-colors shadow-lg">
              SIGN UP
            </a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 pb-12 pt-12 gap-12">
          {/* Left Text */}
          <div className="flex-1 max-w-[500px] anim-fadeUp">
            <img src={LOGO} alt="Sibol Logo" className="w-28 mb-8 drop-shadow-2xl" />
            <h1 className="font-playfair text-[clamp(48px,5vw,64px)] font-bold leading-[1.1] text-white mb-6">
              Smart farming <br />
              starts with <br />
              <em className="italic text-[#f0a830]">real data.</em>
            </h1>
            <p className="text-[17px] leading-relaxed text-white/90 max-w-[400px]">
              Connect your fields. Monitor in real time. Make better decisions.
            </p>
          </div>

          {/* Right Live Sensor Card */}
          <LiveSensorCard />
        </div>
      </section>

      {/* ─── RESTORED MARQUEE ─── */}
      <div className="bg-[#f0a830] py-4 overflow-hidden border-b border-[#d4840a]">
        {marqueeReady && (
          <div className="marquee-run">
            {[...logos, ...logos, ...logos].map((logo, i) => (
              <span key={i} className="inline-flex items-center gap-3 text-[12px] font-bold tracking-[2px] uppercase text-[#0b3d1e] mr-12">
                <img src={logo.img} alt="" className="w-5 h-5 object-contain opacity-80 mix-blend-multiply" />
                {logo.text}
                <span className="text-[#0b3d1e]/30 ml-12">✦</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── GET TO KNOW US ─── */}
      <section className="py-24 px-8 lg:px-16 text-center">
        <div id="know-us" data-animate className={`reveal ${isVisible['know-us'] ? 'visible' : ''}`}>
          <img src={LogoLeft} alt="Logo" className="w-20 mx-auto mb-6" />
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-[#0b3d1e]/60 mb-4">Get to know us</p>
          <h2 className="font-playfair text-[clamp(36px,4vw,48px)] font-bold text-[#0b3d1e]">
            Grown from the <em className="italic text-[#2d8f52]">ground up.</em>
          </h2>
          <div className="w-12 h-[3px] bg-[#f0a830] mx-auto mt-6 mb-16" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {getUs.map((item, i) => (
            <div key={i} id={`card-${i}`} data-animate className={`reveal text-left ${isVisible[`card-${i}`] ? 'visible' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="rounded-2xl overflow-hidden mb-6 h-64 shadow-md">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="font-playfair text-[#f0a830] font-bold text-lg mb-2">0{i + 1}</p>
              <h3 className="font-playfair text-2xl font-bold text-[#0b3d1e] mb-3">{item.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#0b3d1e]/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── THE FULL PICTURE (Mapbox Restoration) ─── */}
      <section className="bg-[#0b3d1e] pt-24 pb-0 relative text-center rounded-t-[40px] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
        <div className="px-8 lg:px-16 relative z-10">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-green-400 mb-4">The full picture</p>
          <h2 className="font-playfair text-[clamp(36px,4vw,52px)] font-bold text-white leading-[1.2] mb-6">
            SIBOL: Smarter Monitoring.<br />
            <em className="italic text-[#f0a830]">Better Farming.</em>
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-12">
            See your fields the way they've never been seen before — live, connected, and beautifully clear.
          </p>

          {/* Replaced 'INSERT VIDEO' with the Mapbox Map */}
          <div className="w-full max-w-5xl mx-auto h-[400px] md:h-[600px] bg-[#1a2e20] rounded-t-3xl overflow-hidden shadow-2xl relative border-t border-l border-r border-white/10">
            {import.meta.env.VITE_MAPS_APIKEY ? (
              <div ref={mapContainer} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                <p className="font-playfair text-2xl">Mapbox Token Required</p>
                <p className="text-sm mt-2">Add VITE_MAPS_APIKEY to your .env file</p>
              </div>
            )}
            {/* Inner shadow overlay to blend map into the section */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_20px_40px_rgba(11,61,30,0.5)]"></div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  )
}

export default App