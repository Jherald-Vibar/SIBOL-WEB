import React, { useState, useEffect } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import { Leaf, Target, Eye, Users, CheckCircle2, Droplets, Sprout, Sun } from 'lucide-react'
import Logo from '../assets/logo-left.png'
import Us from '../assets/group-pic.png'
import Mission from '../assets/mission.png'
import Vision from '../assets/vision.png'

/* ── Shared design atoms ─────────────────────────────────────────────────── */
const SectionPill = ({ label }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2e8b57]/20 bg-[#2e8b57]/[0.07] text-[10px] font-semibold tracking-[1.5px] uppercase text-[#2e8b57] mb-3.5">
    <span className="w-[5px] h-[5px] rounded-full bg-[#2e8b57] animate-pulse" />
    {label}
  </div>
)

const Orb = ({ className }) => (
  <div className={`absolute rounded-full pointer-events-none ${className}`} />
)

const AboutUs = () => {
  const goals = [
    "Minimize soil and environmental impact through real-time monitoring and smart waste management",
    "Provide farmers with data-driven insights through a digital platform",
    "Detect and diagnose crop stress through image analysis",
    "Promote sustainable and educate smart agricultural practices",
  ]

  return (
    <div className="min-h-screen w-full max-w-full bg-[#f7f4ee] font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .playfair { font-family: 'Playfair Display', serif; }
        .thin-scroll::-webkit-scrollbar { width: 3px; }
        .thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .thin-scroll::-webkit-scrollbar-thumb { background: rgba(46,139,87,0.3); border-radius: 10px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Page header ── */}
      <div className="w-full px-6 md:px-10 pt-9">
        <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#2e8b57] mb-1.5">
          Our Story
        </p>
        <h1 className="playfair text-[clamp(28px,3.5vw,44px)] font-bold leading-tight text-[#0b3d1e] mb-4">
          About <em className="text-[#f0a830]">SIBOL</em>
        </h1>
        <div className="w-10 h-0.5 bg-[#d4840a] mb-8" />
      </div>

      {/* ── Content ── */}
      <div className="w-full px-6 md:px-10 pb-28 md:pb-14 flex flex-col gap-6">

        {/* ── Hero card ── */}
        <div className="relative w-full rounded-[20px] overflow-hidden border border-white/14 bg-gradient-to-br from-[rgba(26,102,54,0.82)] via-[rgba(11,61,30,0.88)] to-[rgba(11,61,30,0.92)] p-6 md:p-10">
          <Orb className="w-[300px] h-[300px] -top-[80px] -right-[60px] bg-[radial-gradient(circle,rgba(46,139,87,0.18)_0%,transparent_70%)]" />
          <Orb className="w-[200px] h-[200px] -bottom-10 -left-10 bg-[radial-gradient(circle,rgba(212,132,10,0.12)_0%,transparent_70%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
            {/* Text side */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(168,197,160,0.2)] bg-[rgba(46,139,87,0.15)] text-[10px] font-semibold tracking-[1.5px] uppercase text-[rgba(168,197,160,0.9)] mb-4">
                <span className="w-[5px] h-[5px] rounded-full bg-[#a8c5a0] animate-pulse" />
                Smart Garden System
              </div>
              <div className="playfair text-[clamp(28px,3vw,40px)] font-bold text-white mb-4 leading-tight">
                Revolutionizing <em className="text-[#f0a830]">Agriculture</em>
              </div>
              <p className="text-[14px] text-white/70 leading-relaxed mb-3">
                A cutting-edge smart garden monitoring system revolutionizing agriculture with
                advanced technology, intuitive design, and dependable real-time data management.
              </p>
              <p className="text-[14px] text-white/70 leading-relaxed mb-6">
                Our system leverages IoT sensors, automated actuators, and AI-powered analytics
                to monitor soil moisture, temperature, and humidity while detecting diseases,
                pests, and nutrient deficiencies—empowering sustainable farming across the Philippines.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: <Droplets className="w-4 h-4" />, label: 'Smart Irrigation' },
                  { icon: <Sprout className="w-4 h-4" />,   label: 'AI Detection' },
                  { icon: <Sun className="w-4 h-4" />,      label: 'Real-time Monitoring' },
                ].map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[12px] font-medium text-white/90">
                    {tag.icon}
                    {tag.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Logo side */}
            <div className="w-full lg:w-auto lg:shrink-0 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2e8b57] to-[#f0a830] rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-700" />
                <img
                  src={Logo}
                  alt="SIBOL Logo"
                  className="relative rounded-2xl shadow-2xl w-full max-w-[280px] md:max-w-xs transform group-hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Mission & Vision ── */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Mission */}
          <div className="relative w-full md:flex-1 rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07] p-7">
            <Orb className="w-[200px] h-[200px] -top-10 -right-10 bg-[radial-gradient(circle,rgba(46,139,87,0.10)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <SectionPill label="Mission" />
              <div className="playfair text-[22px] font-bold text-[#0b3d1e] mb-5">
                Our <em className="text-[#f0a830]">Mission</em>
              </div>
              <div className="overflow-hidden rounded-2xl mb-5 border border-[#0b3d1e]/[0.06]">
                <img
                  src={Mission}
                  alt="Mission"
                  className="w-full object-cover hover:scale-105 transition duration-700"
                />
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                To develop an objective, data-driven monitoring system that advances precision agriculture
                through innovative technologies, enabling farmers to optimize crop management, improve yields,
                and foster sustainable farming practices.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="relative w-full md:flex-1 rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07] p-7">
            <Orb className="w-[200px] h-[200px] -bottom-10 -left-10 bg-[radial-gradient(circle,rgba(212,132,10,0.10)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <SectionPill label="Vision" />
              <div className="playfair text-[22px] font-bold text-[#0b3d1e] mb-5">
                Our <em className="text-[#f0a830]">Vision</em>
              </div>
              <div className="overflow-hidden rounded-2xl mb-5 border border-[#0b3d1e]/[0.06]">
                <img
                  src={Vision}
                  alt="Vision"
                  className="w-full object-cover hover:scale-105 transition duration-700"
                />
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                We aim to be recognized technology shaping agriculture's future. We envision a world where
                every farmer, regardless of scale or resources, has access to cutting-edge technologies
                that empower data-driven decisions, creating a sustainable and resource-efficient future
                for the Philippines.
              </p>
            </div>
          </div>
        </div>

        {/* ── Goals ── */}
        <div className="relative w-full rounded-[20px] overflow-hidden bg-white border border-[#0b3d1e]/[0.07] p-7">
          <Orb className="w-[250px] h-[250px] -top-[80px] -right-[60px] bg-[radial-gradient(circle,rgba(212,132,10,0.10)_0%,transparent_70%)]" />
          <Orb className="w-[200px] h-[200px] -bottom-10 -left-10 bg-[radial-gradient(circle,rgba(46,139,87,0.08)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <SectionPill label="Goals" />
            <div className="playfair text-[22px] font-bold text-[#0b3d1e] mb-6">
              Our <em className="text-[#f0a830]">Goals</em>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-5 rounded-2xl border border-[#0b3d1e]/[0.06] bg-[rgba(46,139,87,0.03)] hover:bg-[rgba(46,139,87,0.06)] hover:border-[#2e8b57]/20 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#2e8b57] to-[#1a6636] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{goal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Our Team ── */}
        <div className="relative w-full rounded-[20px] overflow-hidden border border-white/14 bg-gradient-to-br from-[rgba(26,102,54,0.82)] via-[rgba(11,61,30,0.88)] to-[rgba(11,61,30,0.92)] p-6 md:p-10">
          <Orb className="w-[300px] h-[300px] -top-[80px] -right-[60px] bg-[radial-gradient(circle,rgba(46,139,87,0.13)_0%,transparent_70%)]" />
          <Orb className="w-[200px] h-[200px] -bottom-10 -left-10 bg-[radial-gradient(circle,rgba(212,132,10,0.10)_0%,transparent_70%)]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(168,197,160,0.2)] bg-[rgba(46,139,87,0.15)] text-[10px] font-semibold tracking-[1.5px] uppercase text-[rgba(168,197,160,0.9)] mb-4">
              <span className="w-[5px] h-[5px] rounded-full bg-[#a8c5a0] animate-pulse" />
              The People Behind SIBOL
            </div>
            <div className="playfair text-[clamp(24px,2.5vw,36px)] font-bold text-white mb-8 leading-tight">
              Our <em className="text-[#f0a830]">Team</em>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Text */}
              <div className="flex-1 space-y-4">
                <p className="text-[14px] text-white/70 leading-relaxed">
                  We are innovative students from{' '}
                  <span className="text-[#f0a830] font-semibold">System Plus Computer College-Caloocan</span>,
                  devoted to transforming agriculture through cutting-edge technology.
                  Our team specializes in system design, programming, and AI-powered solutions, committed to
                  helping farmers practice sustainable farming through real-time monitoring and intelligent automation.
                </p>
                <p className="text-[14px] text-white/70 leading-relaxed">
                  Combining expertise in computer science, engineering, data analysis, and agricultural technology,
                  we're inspired by the need for smarter farming solutions in the Philippines. SIBOL represents
                  a leap forward in promoting plant health, maximizing resources, and enhancing harvests—making
                  sophisticated technologies accessible to all farmers for a more sustainable and fruitful future.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {['Computer Science', 'Engineering', 'Data Analysis', 'AgriTech'].map((tag, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[12px] font-medium text-white/90">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Team photo */}
              <div className="w-full lg:w-auto lg:shrink-0 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#2e8b57] to-[#f0a830] rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-700" />
                  <img
                    src={Us}
                    alt="Our Team"
                    className="relative rounded-2xl shadow-2xl w-full max-w-[320px] md:max-w-sm transform group-hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AboutUs
