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
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import Footer from './Views/parts/Footer'

const App = () => {
  const MapToken = import.meta.env.VITE_MAPS_APIKEY;
  mapboxgl.accessToken = MapToken;
  const mapContainer = useRef(null);
  const [isVisible, setIsVisible] = useState({});
  const [marqueeReady, setMarqueeReady] = useState(false);

  const logos = [
    { img: Logo1, text: "We Innovate Tech-Driven Agriculture" },
    { img: Logo2, text: "We Make Monitoring Tools Accessible" },
    { img: Logo3, text: "We Empower Farmers With Data" },
    { img: Logo4, text: "We Improve Resource Management" },
    { img: Logo5, text: "We Strengthen Climate Resilience" },
  ];

  const getUs = [
    { img: Image1, title: "About us", text: "SIBOL is a smart farming project that uses IoT and LoRa technology to monitor crop health in real time. We aim to empower farmers with data-driven solutions for better harvests and sustainable agriculture." },
    { img: Image2, title: "Why this matters?", text: "Farmers face challenges from weather and limited data. SIBOL provides real-time crop insights to reduce losses, boost yields, and promote sustainable farming for a secure food future." },
    { img: Image3, title: "Our vision", text: "To revolutionize agriculture through smart, connected technologies that enable sustainable crop health monitoring, empower farmers with real-time insights, and contribute to food security and environmental resilience." }
  ];

  useEffect(() => {
    setMarqueeReady(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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
          "fill-extrusion-color": "#1a6636",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.7,
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f7f4ee', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --forest: #0b3d1e;
          --moss: #1a6636;
          --fern: #2e8b57;
          --sage: #a8c5a0;
          --cream: #f7f4ee;
          --amber: #d4840a;
          --amber-light: #f0a830;
        }

        /* ── HERO ── */
        .hero-section {
          min-height: 100vh;
          background: var(--forest);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .hero-orb {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.18) 0%, transparent 70%);
          right: -150px; top: -100px;
          pointer-events: none;
        }
        .hero-orb2 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,132,10,0.12) 0%, transparent 70%);
          left: -80px; bottom: 100px;
          pointer-events: none;
        }

        /* ── NAV ── */
        .sibol-nav {
          position: relative; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 48px;
          animation: fadeDown 0.7s ease-out both;
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-logo-wrap {
          display: flex; align-items: center; gap: 10px;
        }
        .nav-logo-chip {
          width: 38px; height: 38px;
          background: var(--amber);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .nav-logo-chip:hover { transform: rotate(8deg) scale(1.05); }
        .nav-logo-chip img { width: 24px; height: 24px; object-fit: contain; }
        .nav-wordmark {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          color: #fff; letter-spacing: 2px;
        }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .btn-ghost-nav {
          padding: 10px 22px;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 100px;
          color: #fff; font-size: 13px; font-weight: 500;
          background: transparent; cursor: pointer;
          transition: background 0.25s;
          text-decoration: none;
        }
        .btn-ghost-nav:hover { background: rgba(255,255,255,0.1); }
        .btn-amber-nav {
          padding: 10px 22px;
          border-radius: 100px;
          background: var(--amber); border: none;
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.25s;
          text-decoration: none;
        }
        .btn-amber-nav:hover { background: var(--amber-light); }

        /* ── HERO BODY ── */
        .hero-body {
          flex: 1;
          display: flex; align-items: center;
          padding: 40px 48px 100px;
          position: relative; z-index: 5;
          gap: 64px;
        }
        .hero-left { flex: 1; max-width: 560px; animation: fadeUp 0.9s 0.2s ease-out both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border: 1px solid rgba(212,132,10,0.45);
          border-radius: 100px;
          color: var(--amber-light);
          font-size: 11px; font-weight: 500; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 28px;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--amber);
          animation: livePulse 1.8s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.4; transform:scale(1.4); }
        }
        .hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 5.5vw, 68px);
          font-weight: 700; line-height: 1.08;
          color: #fff; margin-bottom: 22px;
        }
        .hero-h1 em { font-style: italic; color: var(--amber-light); }
        .hero-sub {
          font-size: 15px; line-height: 1.75;
          color: rgba(255,255,255,0.58); max-width: 420px;
          margin-bottom: 36px;
        }
        .hero-ctas { display: flex; align-items: center; gap: 14px; }
        .btn-hero-primary {
          padding: 13px 30px; border-radius: 100px;
          background: var(--amber); border: none;
          color: #fff; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.25s;
        }
        .btn-hero-primary:hover { background: var(--amber-light); transform: translateY(-2px); }
        .btn-hero-ghost {
          padding: 13px 30px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.28);
          background: transparent; color: rgba(255,255,255,0.78);
          font-size: 14px; cursor: pointer; transition: all 0.25s;
        }
        .btn-hero-ghost:hover { background: rgba(255,255,255,0.08); }

        /* ── SENSOR CARD (replaces hero image) ── */
        .hero-right {
          flex: 0 0 300px;
          animation: fadeUp 0.9s 0.45s ease-out both;
        }
        .sensor-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 22px;
          backdrop-filter: blur(20px);
        }
        .sc-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .sc-title { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.45); }
        .sc-live { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #4ade80; }
        .sc-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: livePulse 1.5s infinite; }
        .sc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .sc-metric {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 12px;
        }
        .sc-label { font-size: 10px; color: rgba(255,255,255,0.38); margin-bottom: 4px; }
        .sc-val { font-size: 20px; font-weight: 500; color: #fff; }
        .sc-val span { font-size: 10px; color: rgba(255,255,255,0.4); }
        .sc-trend { font-size: 10px; color: #4ade80; margin-top: 2px; }
        .sc-bars { display: flex; align-items: flex-end; gap: 4px; height: 38px; }
        .sc-bar { flex: 1; border-radius: 3px 3px 0 0; background: rgba(46,139,87,0.35); }
        .sc-bar.peak { background: var(--amber); }

        /* ── WAVE ── */
        .hero-wave { line-height: 0; position: relative; z-index: 5; }

        /* ── MARQUEE / logos section ── */
        .marquee-strip {
          background: var(--amber);
          padding: 13px 0; overflow: hidden;
          white-space: nowrap;
        }
        .marquee-inner {
          display: inline-block;
          animation: marquee 24s linear infinite;
        }
        .marquee-inner:hover { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-item {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(255,255,255,0.9);
          margin-right: 40px;
        }
        .marquee-item img { width: 20px; height: 20px; object-fit: contain; filter: brightness(0) invert(1); }
        .marquee-sep { color: rgba(255,255,255,0.4); font-size: 14px; margin-right: 40px; }

        /* ── CENTER LOGO (section 3) ── */
        .center-logo-section {
          display: flex; align-items: center; justify-content: center;
          padding: 80px 48px;
          background: var(--cream);
          position: relative;
        }
        .center-logo-glow {
          position: absolute;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.12) 0%, transparent 70%);
        }
        .center-logo-img {
          width: 120px; position: relative; z-index: 2;
          animation: floatY 3s ease-in-out infinite;
          filter: drop-shadow(0 12px 32px rgba(11,61,30,0.18));
        }
        @keyframes floatY {
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-10px); }
        }

        /* ── GET TO KNOW US (section 4) ── */
        .know-us-section {
          padding: 0 48px 100px;
          background: var(--cream);
          position: relative;
        }
        .section-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: var(--fern);
          margin-bottom: 12px;
        }
        .section-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 50px);
          font-weight: 700; line-height: 1.1;
          color: var(--forest); margin-bottom: 0;
        }
        .section-h2 em { font-style: italic; color: var(--fern); }
        .section-divider {
          width: 48px; height: 2px;
          background: var(--amber); margin: 20px 0 48px;
        }

        /* Cards */
        .know-us-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .know-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .know-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(11,61,30,0.12);
        }
        .know-card-img-wrap {
          overflow: hidden; height: 200px;
          position: relative;
        }
        .know-card-img-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(11,61,30,0.4) 100%);
        }
        .know-card-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .know-card:hover .know-card-img-wrap img { transform: scale(1.06); }
        .know-card-body { padding: 24px; }
        .know-card-num {
          font-family: 'Playfair Display', serif;
          font-size: 11px; color: var(--amber);
          letter-spacing: 1.5px; margin-bottom: 8px;
        }
        .know-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: var(--forest); margin-bottom: 12px;
        }
        .know-card-text {
          font-size: 13px; line-height: 1.75;
          color: #5a6472;
        }

        /* Decorative bg stripe */
        .know-us-bg-stripe {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 35%; background: var(--forest);
          border-radius: 32px 32px 0 0; z-index: 0;
        }

        /* ── SIBOL BOTTOM (section 5) ── */
        .bottom-section {
          background: var(--forest);
          padding: 80px 48px 100px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; position: relative; overflow: hidden;
        }
        .bottom-section::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(46,139,87,0.15) 0%, transparent 70%);
          left: 50%; top: 50%; transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .bottom-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: var(--sage);
          margin-bottom: 16px; position: relative; z-index: 2;
        }
        .bottom-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700; line-height: 1.15;
          color: #fff; margin-bottom: 16px;
          position: relative; z-index: 2;
        }
        .bottom-h1 em { font-style: italic; color: var(--amber-light); }
        .bottom-sub {
          font-size: 15px; color: rgba(255,255,255,0.5);
          max-width: 400px; line-height: 1.7;
          margin-bottom: 56px; position: relative; z-index: 2;
        }
        .bottom-image-frame {
          position: relative; z-index: 2;
          width: 100%; max-width: 900px;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .bottom-image-frame img { width: 100%; display: block; }
        .bottom-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(11,61,30,0.5) 100%);
        }

        /* ── VISIBLE ANIMATION ── */
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .sibol-nav { padding: 20px 24px; }
          .hero-body { flex-direction: column; padding: 24px 24px 80px; gap: 40px; }
          .hero-right { flex: unset; width: 100%; }
          .know-us-grid { grid-template-columns: 1fr; }
          .know-us-section { padding: 0 24px 80px; }
          .center-logo-section { padding: 60px 24px; }
          .bottom-section { padding: 60px 24px 80px; }
        }
      `}</style>

      {/* ─── SECTION 1: HERO ─── */}
      <section className="hero-section">
        <div className="hero-orb" />
        <div className="hero-orb2" />

        {/* Navbar */}
        <nav className="sibol-nav">
          <div className="nav-logo-wrap">
            <div className="nav-logo-chip">
              <img src={LOGO} alt="SIBOL logo" />
            </div>
            <span className="nav-wordmark">SIBOL</span>
          </div>
          <div className="nav-actions">
            <a href="/guest/login" className="btn-ghost-nav">Login</a>
            <a href="/guest/sign_up" className="btn-amber-nav">Sign Up</a>
          </div>
        </nav>

        {/* Hero body */}
        <div className="hero-body">
          <div className="hero-left">
            <div className="hero-pill">
              <span className="live-dot" />
              IoT-Powered Crop Monitoring
            </div>
            <h1 className="hero-h1">
              Smart farming<br />
              starts with<br />
              <em>real data.</em>
            </h1>
            <p className="hero-sub">
              SIBOL connects IoT sensors to your farm in real time — so you make
              better decisions, reduce losses, and grow more with less.
            </p>
            <div className="hero-ctas">
              <button className="btn-hero-primary">Get started free</button>
              <button className="btn-hero-ghost">See how it works →</button>
            </div>
          </div>

          {/* Live sensor card */}
          <div className="hero-right">
            <div className="sensor-card">
              <div className="sc-header">
                <span className="sc-title">Live Sensor Feed</span>
                <span className="sc-live"><span className="sc-dot" />Active — Field 3</span>
              </div>
              <div className="sc-grid">
                <div className="sc-metric">
                  <div className="sc-label">Soil Moisture</div>
                  <div className="sc-val">68<span>%</span></div>
                  <div className="sc-trend">↑ +3% today</div>
                </div>
                <div className="sc-metric">
                  <div className="sc-label">Temperature</div>
                  <div className="sc-val">27<span>°C</span></div>
                  <div className="sc-trend" style={{ color: 'rgba(255,255,255,0.4)' }}>— Optimal</div>
                </div>
                <div className="sc-metric">
                  <div className="sc-label">Humidity</div>
                  <div className="sc-val">74<span>%</span></div>
                  <div className="sc-trend" style={{ color: '#f87171' }}>↓ −1% today</div>
                </div>
                <div className="sc-metric">
                  <div className="sc-label">Crop Health</div>
                  <div className="sc-val">91<span>%</span></div>
                  <div className="sc-trend">↑ Good</div>
                </div>
              </div>
              <div className="sc-bars">
                {[40, 55, 70, 60, 80, 65, 90].map((h, i) => (
                  <div key={i} className={`sc-bar${i === 6 ? ' peak' : ''}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 20 L1440 60 Z" fill="#d4840a" />
          </svg>
        </div>
      </section>

      {/* ─── SECTION 2: LOGOS / MARQUEE ─── */}
      <div className="marquee-strip">
        {marqueeReady && (
          <div className="marquee-inner">
            {[...logos, ...logos].map((logo, i) => (
              <React.Fragment key={i}>
                <span className="marquee-item">
                  <img src={logo.img} alt="" />
                  {logo.text}
                </span>
                {i % logos.length === logos.length - 1
                  ? null
                  : <span className="marquee-sep">✦</span>
                }
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ─── SECTION 3: CENTER LOGO ─── */}
      <section className="center-logo-section">
        <div className="center-logo-glow" />
        <img src={LogoLeft} alt="SIBOL" className="center-logo-img" />
      </section>

      {/* ─── SECTION 4: GET TO KNOW US ─── */}
      <section className="know-us-section">
        {/* Heading */}
        <div
          id="know-us-heading"
          data-animate
          className={`reveal${isVisible['know-us-heading'] ? ' visible' : ''}`}
          style={{ textAlign: 'center', marginBottom: 0, position: 'relative', zIndex: 1 }}
        >
          <div className="section-eyebrow">Get to know us</div>
          <h2 className="section-h2">Grown from the <em>ground up.</em></h2>
          <div className="section-divider" style={{ margin: '20px auto 48px' }} />
        </div>

        {/* Cards */}
        <div
          id="know-us-cards"
          data-animate
          className={`know-us-grid reveal${isVisible['know-us-cards'] ? ' visible' : ''}`}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {getUs.map((item, i) => (
            <div className="know-card" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="know-card-img-wrap">
                <img src={item.img} alt={item.title} />
              </div>
              <div className="know-card-body">
                <div className="know-card-num">0{i + 1}</div>
                <div className="know-card-title">{item.title}</div>
                <p className="know-card-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="know-us-bg-stripe" />
      </section>

      {/* ─── SECTION 5: SIBOL BOTTOM ─── */}
      <section
        id="bottom-section"
        data-animate
        className={`bottom-section reveal${isVisible['bottom-section'] ? ' visible' : ''}`}
      >
        <div className="bottom-eyebrow">The full picture</div>
        <h1 className="bottom-h1">
          SIBOL: Smarter Monitoring,<br />
          <em>Better Farming.</em>
        </h1>
        <p className="bottom-sub">
          See your fields the way they've never been seen before — live, connected, and beautifully clear.
        </p>
        <div className="bottom-image-frame">
          <img src={BottomImage} alt="SIBOL dashboard preview" />
          <div className="bottom-image-overlay" />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
};

export default App;
