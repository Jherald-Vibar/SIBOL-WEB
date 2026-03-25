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
import AboutUs from './assets/about.jpg'
import './homepage.css'
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import Footer from './Views/parts/Footer'

const App = () => {
  const MapToken = import.meta.env.VITE_MAPS_APIKEY;
  mapboxgl.accessToken = MapToken;
  const mapContainer = useRef(null);
  const [isVisible, setIsVisible] = useState({});

  const logos = [
    { img: Logo1, text: "WE INNOVATE TECH-DRIVEN AGRICULTURE" },
    { img: Logo2, text: "WE MAKE MONITORING TOOLS ACCESSIBLE" },
    { img: Logo3, text: "WE EMPOWER FARMERS WITH DATA." },
    { img: Logo4, text: "WE IMPROVE RESOURCE MANAGEMENT" },
    { img: Logo5, text: "WE STRENGTHEN CLIMATE RESILIENCE" },
  ];

  const getUs = [
    { img: Image1, title: "About us", text: "SIBOL is a smart farming project that uses IoT and LoRa technology to monitor crop health in real time. We aim to empower farmers with data-driven solutions for better harvests and sustainable agriculture." },
    { img: Image2, title: "Why this matters?", text: "Farmers face challenges from weather and limited data. SIBOL provides real-time crop insights to reduce losses, boost yields, and promote sustainable farming for a secure food future." },
    { img: Image3, title: "Our vision", text: "To revolutionize agriculture through smart, connected technologies that enable sustainable crop health monitoring, empower farmers with real-time insights, and contribute to food security and environmental resilience." }
  ];

  useEffect(() => {
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
    <div className="bg-gradient-to-b from-white via-green-50 to-white min-h-screen">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.8s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .nav-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .nav-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .nav-button:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .logo-bounce {
          transition: transform 0.3s ease;
        }

        .logo-bounce:hover {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>

      {/* Hero Section */}
      <section className="px-4 md:px-12 py-8">
        <div
          className="relative w-full h-[500px] md:h-[680px] rounded-3xl overflow-hidden shadow-2xl"
          style={{ clipPath: "polygon(0% 0%, 100% 0, 100% 73%, 50% 100%, 0 73%)" }}
        >
          {/* Navbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[95%] md:w-[90%] bg-white/90 backdrop-blur-md rounded-full px-4 py-3 flex items-center justify-between shadow-lg animate-fadeInUp animate-pulse-glow">
            <img src={LOGO} alt="logo" className="w-12 sm:w-20 logo-bounce" />

            <div className='flex items-center justify-end gap-2 sm:gap-3'>
              <a
                href="/guest/login"
                className="nav-button rounded-full bg-gradient-to-r from-green-900 to-green-700 px-3 py-2 text-xs sm:text-base sm:px-6 sm:py-2 text-white font-semibold relative z-10"
              >
                LOGIN
              </a>

              <a
                href="/guest/sign_up"
                className="nav-button rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs sm:text-base sm:px-6 sm:py-2 text-white font-semibold relative z-10"
              >
                SIGN UP
              </a>
            </div>
          </div>

          {/* Background with overlay */}
          <div className="absolute inset-0">
            <img src={BG} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
          </div>

          {/* Left Ribbon */}
          <div
            className="absolute top-0 left-0 h-full z-10 flex items-center justify-center text-white p-6 w-2/3 sm:w-1/3 animate-slideInLeft"
            style={{
              background: "linear-gradient(135deg, #0b542d 0%, #166534 100%)",
              clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <img src={LogoLeft} alt="" className="w-32 sm:w-44 animate-float" />
              <span className="font-serif text-base sm:text-2xl leading-relaxed">
                <span className="text-amber-300 text-4xl sm:text-6xl font-bold">S</span>mart Farming starts
                <br />
                with the right{" "}
                <span className="text-amber-300 text-4xl sm:text-6xl font-bold">D</span>ata
              </span>
            </div>
          </div>
          <div className="absolute top-0 left-10 h-full z-0 w-2/3 sm:w-1/3 sm:left-10"
            style={{
              backgroundColor: "#0b542d",
              opacity: 0.4,
              clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
            }}
          >
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="px-4 md:px-12">
        <div
          id="logos-section"
          data-animate
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 py-16 ${isVisible['logos-section'] ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          {logos.map((logo, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-3 text-center p-4 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 card-hover"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img src={logo.img} alt={`Logo${i + 1}`} className="w-12 sm:w-16 logo-bounce" />
              <span className="font-sans text-xs sm:text-sm font-semibold text-green-800 leading-tight">
                {logo.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Logo Center */}
      <section
        id="center-logo"
        data-animate
        className={`flex items-center justify-center py-8 md:py-12 ${isVisible['center-logo'] ? 'animate-fadeInScale' : 'opacity-0'}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
          <img src={LogoLeft} alt="LOGO" className='w-28 md:w-48 relative z-10 animate-float' />
        </div>
      </section>

      {/* GET TO KNOW US */}
      <section className='w-full px-4 md:px-12 py-8 relative flex flex-col items-center justify-center mb-16'>
        <div
          id="know-us-title"
          data-animate
          className={`mb-12 ${isVisible['know-us-title'] ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <h1 className='text-3xl md:text-5xl font-bold font-serif text-center text-transparent bg-clip-text bg-gradient-to-r from-green-900 via-green-700 to-green-900'>
            GET TO KNOW US
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4"></div>
        </div>

        {/* CARDS */}
        <div
          id="cards-section"
          data-animate
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 w-full justify-items-center z-10 ${isVisible['cards-section'] ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          {getUs.map((get, i) => (
            <div
              key={i}
              className='w-full max-w-[400px] bg-white flex flex-col justify-center px-6 py-8 rounded-2xl shadow-lg card-hover border border-green-100'
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className='mb-4 flex items-center justify-center overflow-hidden rounded-xl'>
                <img src={get.img} alt={"image" + i} className='w-full sm:w-64 object-cover hover:scale-110 transition-transform duration-500' />
              </div>

              <div className='flex items-start justify-start mb-3'>
                <h2 className='text-2xl font-bold font-serif text-green-900 relative'>
                  {get.title}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-transparent"></div>
                </h2>
              </div>

              <div>
                <p className='font-sans text-green-800 text-sm md:text-base leading-relaxed'>
                  {get.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Green background with gradient */}
        <div className='absolute bottom-0 left-0 w-full z-0 h-1/4 sm:h-1/3 bg-gradient-to-t from-green-950 to-green-900 rounded-3xl opacity-90'>
        </div>
      </section>

      {/* SIBOL Bottom Section */}
      <section
        id="bottom-section"
        data-animate
        className={`flex flex-col items-center justify-center w-full px-4 md:px-12 py-12 mb-10 ${isVisible['bottom-section'] ? 'animate-fadeInUp' : 'opacity-0'}`}
      >
        <div className='text-center mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-green-900 via-green-600 to-green-900 leading-tight'>
            SIBOL: Smarter Monitoring,<br className="sm:hidden" /> Better Farming.
          </h1>
        </div>

        <div className='mt-5 w-full flex justify-center'>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-5xl">
            <img src={BottomImage} alt="bottomImage" className='w-full object-contain' />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  )
}

export default App
