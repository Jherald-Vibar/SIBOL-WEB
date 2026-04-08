import React, { useEffect, useRef, useState } from 'react'
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
import "mapbox-gl/dist/mapbox-gl.css"
import mapboxgl from "mapbox-gl"
import Footer from './Views/parts/Footer'

// ─── Crop config ───────────────────────────────────────────────────────────────
const CROPS = {
  mustasa: {
    name: 'Mustasa',
    optimalMoisture: [60, 75],
    optimalTemp: [22, 30],
    optimalHumidity: [65, 80],
    optimalPh: [6.0, 7.0],
    conditions: ['Mustasa Healthy', 'Mustasa Healthy', 'Mustasa Healthy', 'Mustasa Healthy'],
  },
  pechay: {
    name: 'Pechay',
    optimalMoisture: [55, 70],
    optimalTemp: [18, 28],
    optimalHumidity: [60, 75],
    optimalPh: [6.5, 7.5],
    conditions: ['Pechay Healthy', 'Pechay Healthy', 'Pechay Needs Water', 'Pechay Healthy'],
  },
}

function rand(min, max, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec))
}

// ─── Live Sensor Card ──────────────────────────────────────────────────────────
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
    generate()
    const id = setInterval(generate, 2000)
    return () => clearInterval(id)
  }, [currentCrop])

  if (!data) return null

  const { moisture, temp, humidity, ph, health, isCritical, isLow, isOptimal } = data
  const crop = CROPS[currentCrop]

  const barColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-green-500'
  const healthBarColor = health >= 80 ? 'bg-green-500' : health >= 60 ? 'bg-amber-400' : 'bg-red-500'
  const badge = isCritical
    ? { label: 'Needs Water', cls: 'bg-red-100 text-red-700' }
    : isLow
    ? { label: 'Low Moisture', cls: 'bg-amber-100 text-amber-700' }
    : { label: 'Profile Active', cls: 'bg-green-100 text-green-700' }

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(20px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Live Sensor Feed</span>
        <span className="flex items-center gap-1.5 text-[10px] text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Active — Field 3
        </span>
      </div>

      {/* Crop switcher */}
      <div className="flex gap-2 px-4 pb-2">
        {Object.entries(CROPS).map(([key, val]) => (
          <button key={key} onClick={() => setCurrentCrop(key)}
            className={`px-3 py-0.5 rounded-full text-[10px] font-medium transition-all border
              ${currentCrop === key
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-transparent text-white/50 border-white/20 hover:border-white/40'}`}>
            {val.name}
          </button>
        ))}
      </div>

      {/* Crop name + badge */}
      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-[12px] font-medium text-white">{crop.name} — Field 3</span>
        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        {[
          { label: 'Moisture', val: `${moisture.toFixed(1)}%` },
          { label: 'Temp', val: `${temp.toFixed(1)}°C` },
          { label: 'Humidity', val: `${humidity.toFixed(1)}%` },
          { label: 'pH Level', val: ph.toFixed(2) },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[9px] text-white/40 mb-0.5">{label}</p>
            <p className="text-[15px] font-semibold text-white leading-none">{val}</p>
          </div>
        ))}
      </div>

      {/* Moisture bar */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] text-white/40">Soil Moisture</span>
          <span className={`text-[10px] font-medium ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-green-400'}`}>
            {moisture.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.min(moisture, 100)}%` }} />
        </div>
        <p className="text-[9px] text-white/30 mt-1">
          {isCritical ? 'Critical — Needs Water · ' : ''}
          Optimal: {crop.optimalMoisture[0]}–{crop.optimalMoisture[1]}%
        </p>
      </div>

      {/* AI Leaf Condition */}
      <div className="mx-4 mb-3 rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span className="text-[9px] uppercase tracking-widest text-white/40 font-medium">Leaf Condition</span>
          <span className="bg-blue-500 text-white text-[8px] font-medium px-1.5 py-0.5 rounded">AI</span>
        </div>
        <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
          {crop.conditions.map((c, i) => (
            <span key={i} className="flex items-center gap-1 bg-green-500/20 text-green-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Health + Alerts */}
      <div className="flex gap-2 px-4 pb-4">
        {/* Alerts */}
        <div className="flex-1 rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[8px] uppercase tracking-widest text-white/35 mb-1">Alerts</p>
          {isCritical ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 20h20L12 2z" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M12 9v5M12 16.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-medium text-red-400">Critical</span>
              <span className="text-[9px] text-white/35 text-center">Irrigation needed</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(34,197,94,0.15)" />
                <path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-medium text-green-400">No alerts</span>
              <span className="text-[9px] text-white/35 text-center">Crop is optimal</span>
            </>
          )}
        </div>

        {/* Health */}
        <div className="flex-1 rounded-xl p-2.5 flex flex-col justify-between"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[8px] uppercase tracking-widest text-white/35 mb-1">Crop Health</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-semibold text-white">{health}</span>
            <span className="text-[10px] text-white/40">%</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div className={`h-full rounded-full transition-all duration-700 ${healthBarColor}`}
              style={{ width: `${health}%` }} />
          </div>
          <span className={`text-[9px] mt-1 ${health >= 80 ? 'text-green-400' : health >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {health >= 80 ? '↑ Good' : health >= 60 ? '— Fair' : '↓ Poor'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────────
const App = () => {
  const MapToken = import.meta.env.VITE_MAPS_APIKEY
  mapboxgl.accessToken = MapToken
  const mapContainer = useRef(null)
  const [isVisible, setIsVisible] = useState({})
  const [marqueeReady, setMarqueeReady] = useState(false)

  const logos = [
    { img: Logo1, text: 'We Innovate Tech-Driven Agriculture' },
    { img: Logo2, text: 'We Make Monitoring Tools Accessible' },
    { img: Logo3, text: 'We Empower Farmers With Data' },
    { img: Logo4, text: 'We Improve Resource Management' },
    { img: Logo5, text: 'We Strengthen Climate Resilience' },
  ]

  const getUs = [
    { img: Image1, title: 'About us', text: 'SIBOL is a smart farming project that uses IoT and LoRa technology to monitor crop health in real time. We aim to empower farmers with data-driven solutions for better harvests and sustainable agriculture.' },
    { img: Image2, title: 'Why this matters?', text: 'Farmers face challenges from weather and limited data. SIBOL provides real-time crop insights to reduce losses, boost yields, and promote sustainable farming for a secure food future.' },
    { img: Image3, title: 'Our vision', text: 'To revolutionize agriculture through smart, connected technologies that enable sustainable crop health monitoring, empower farmers with real-time insights, and contribute to food security and environmental resilience.' },
  ]

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

  useEffect(() => {
    if (!mapContainer.current) return
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [120.5872, 15.4881],
      zoom: 12,
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
  }, [])

  return (
    <div className="font-sans bg-[#f7f4ee] overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes livePulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.4; transform:scale(1.4); } }
        @keyframes floatY   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-10px); } }
        @keyframes marqueeAnim { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .anim-fadeDown { animation: fadeDown 0.7s ease-out both; }
        .anim-fadeUp   { animation: fadeUp 0.9s ease-out both; }
        .anim-fadeUp-d { animation: fadeUp 0.9s 0.45s ease-out both; }
        .anim-float    { animation: floatY 3s ease-in-out infinite; }
        .live-dot      { animation: livePulse 1.8s ease-in-out infinite; }
        .marquee-run   { animation: marqueeAnim 24s linear infinite; }
        .marquee-run:hover { animation-play-state: paused; }
        .reveal { opacity:0; transform:translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .hero-orb  { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle, rgba(46,139,87,0.18) 0%, transparent 70%); right:-150px; top:-100px; pointer-events:none; }
        .hero-orb2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle, rgba(212,132,10,0.12) 0%, transparent 70%); left:-80px; bottom:100px; pointer-events:none; }
        .know-card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid rgba(0,0,0,0.05); transition:transform 0.3s, box-shadow 0.3s; }
        .know-card:hover { transform:translateY(-8px); box-shadow:0 24px 48px rgba(11,61,30,0.12); }
        .know-card-img { overflow:hidden; height:200px; position:relative; }
        .know-card-img::after { content:''; position:absolute; inset:0; background:linear-gradient(to bottom, transparent 50%, rgba(11,61,30,0.4) 100%); }
        .know-card-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
        .know-card:hover .know-card-img img { transform:scale(1.06); }
        .nav-chip { width:38px; height:38px; background:#d4840a; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:transform 0.3s; }
        .nav-chip:hover { transform:rotate(8deg) scale(1.05); }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="min-h-screen bg-[#0b3d1e] relative flex flex-col overflow-hidden">
        <div className="hero-orb" />
        <div className="hero-orb2" />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-12 py-6 anim-fadeDown">
          <div className="flex items-center gap-2.5">
            <div className="nav-chip">
              <img src={LOGO} alt="SIBOL" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-playfair text-[22px] font-bold text-white tracking-[2px]">SIBOL</span>
          </div>
          <div className="flex items-center gap-2.5">
            <a href="/guest/login"
              className="px-5 py-2.5 rounded-full border border-white/20 text-white text-[13px] font-medium hover:bg-white/10 transition-colors no-underline">
              Login
            </a>
            <a href="/guest/sign_up"
              className="px-5 py-2.5 rounded-full bg-[#d4840a] text-white text-[13px] font-medium hover:bg-[#f0a830] transition-colors no-underline">
              Sign Up
            </a>
          </div>
        </nav>

        {/* Hero body */}
        <div className="flex-1 flex items-center px-12 pb-24 pt-8 relative z-10 gap-16 flex-wrap anim-fadeUp">
          {/* Left */}
          <div className="flex-1 min-w-[300px] max-w-[560px]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#d4840a]/45 rounded-full text-[#f0a830] text-[11px] font-medium uppercase tracking-[1.5px] mb-7">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#d4840a]" />
              IoT-Powered Crop Monitoring
            </div>
            <h1 className="font-playfair text-[clamp(42px,5.5vw,68px)] font-bold leading-[1.08] text-white mb-5">
              Smart farming<br />
              starts with<br />
              <em className="italic text-[#f0a830]">real data.</em>
            </h1>
            <p className="text-[15px] leading-[1.75] text-white/58 max-w-[420px] mb-9">
              SIBOL connects IoT sensors to your farm in real time — so you make
              better decisions, reduce losses, and grow more with less.
            </p>
            <div className="flex items-center gap-3.5">
              <button className="px-7 py-3 rounded-full bg-[#d4840a] text-white text-[14px] font-medium hover:bg-[#f0a830] hover:-translate-y-0.5 transition-all">
                Get started free
              </button>
              <button className="px-7 py-3 rounded-full border border-white/28 text-white/80 text-[14px] hover:bg-white/8 transition-all">
                See how it works →
              </button>
            </div>
          </div>

          {/* Live sensor card — fixed width, no stretch */}
          <div className="anim-fadeUp-d w-full max-w-[300px] shrink-0">
            <LiveSensorCard />
          </div>
        </div>

        {/* Wave */}
        <div className="relative z-10 leading-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none" className="w-full block">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 20 L1440 60 Z" fill="#d4840a" />
          </svg>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="bg-[#d4840a] py-3 overflow-hidden whitespace-nowrap">
        {marqueeReady && (
          <div className="marquee-run inline-block">
            {[...logos, ...logos].map((logo, i) => (
              <React.Fragment key={i}>
                <span className="inline-flex items-center gap-2.5 text-[11px] font-medium tracking-[2px] uppercase text-white/90 mr-10">
                  <img src={logo.img} alt="" className="w-5 h-5 object-contain brightness-0 invert" />
                  {logo.text}
                </span>
                {i % logos.length !== logos.length - 1 && (
                  <span className="text-white/40 text-sm mr-10">✦</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ─── CENTER LOGO ─── */}
      <section className="flex items-center justify-center py-20 bg-[#f7f4ee] relative">
        <div className="absolute w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(46,139,87,0.12) 0%, transparent 70%)' }} />
        <img src={LogoLeft} alt="SIBOL" className="w-28 relative z-10 anim-float"
          style={{ filter: 'drop-shadow(0 12px 32px rgba(11,61,30,0.18))' }} />
      </section>

      {/* ─── GET TO KNOW US ─── */}
      <section className="px-12 pb-24 bg-[#f7f4ee] relative">
        <div id="know-us-heading" data-animate
          className={`reveal${isVisible['know-us-heading'] ? ' visible' : ''} text-center mb-0 relative z-10`}>
          <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#2e8b57] mb-3">Get to know us</p>
          <h2 className="font-playfair text-[clamp(32px,4vw,50px)] font-bold leading-[1.1] text-[#0b3d1e]">
            Grown from the <em className="italic text-[#2e8b57]">ground up.</em>
          </h2>
          <div className="w-12 h-0.5 bg-[#d4840a] mx-auto my-5" />
        </div>

        <div id="know-us-cards" data-animate
          className={`reveal${isVisible['know-us-cards'] ? ' visible' : ''} grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mt-8`}>
          {getUs.map((item, i) => (
            <div className="know-card" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="know-card-img">
                <img src={item.img} alt={item.title} />
              </div>
              <div className="p-6">
                <p className="font-playfair text-[11px] text-[#d4840a] tracking-[1.5px] mb-2">0{i + 1}</p>
                <h3 className="font-playfair text-[20px] font-bold text-[#0b3d1e] mb-3">{item.title}</h3>
                <p className="text-[13px] leading-[1.75] text-[#5a6472]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-[#0b3d1e] rounded-t-[32px] z-0" />
      </section>

      {/* ─── BOTTOM / SIBOL SHOWCASE ─── */}
      <section id="bottom-section" data-animate
        className={`reveal${isVisible['bottom-section'] ? ' visible' : ''} bg-[#0b3d1e] py-20 px-12 flex flex-col items-center text-center relative overflow-hidden`}>
        <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(46,139,87,0.15) 0%, transparent 70%)', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
        <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#a8c5a0] mb-4 relative z-10">The full picture</p>
        <h1 className="font-playfair text-[clamp(32px,4vw,52px)] font-bold leading-[1.15] text-white mb-4 relative z-10">
          SIBOL: Smarter Monitoring,<br />
          <em className="italic text-[#f0a830]">Better Farming.</em>
        </h1>
        <p className="text-[15px] text-white/50 max-w-[400px] leading-[1.7] mb-14 relative z-10">
          See your fields the way they've never been seen before — live, connected, and beautifully clear.
        </p>
        <div className="relative z-10 w-full max-w-[900px] rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={BottomImage} alt="SIBOL dashboard preview" className="w-full block" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(11,61,30,0.5) 100%)' }} />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  )
}

export default App
