import React, { useState, useEffect } from 'react'
import UserSidebar from './parts/UserSidebar'
import UserNavbar from './parts/UserNavbar'
import { Leaf, Target, Eye, Users, CheckCircle2, Droplets, Sprout, Sun } from 'lucide-react'
import Logo from '../assets/logo-left.png'
import Us from '../assets/group-pic.png'
import Mission from '../assets/mission.png'
import Vision from '../assets/vision.png'
const AboutUs = () => {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const goals = [
    "Minimize soil and environmental impact through real-time monitoring and smart waste management",
    "Provide farmers with data-driven insights through a digital platform",
    "Detect and diagnose crop stress through image analysis",
    "Promote sustainable and educate smart agricultural practices"
  ]

  return (
    <div className="bg-[#F4F0E5] min-h-screen flex flex-col">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40">
        <UserSidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Navbar */}
        <div className="shadow-md bg-white sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 max-w-7xl mx-auto w-full">

          {/* Hero Section */}
          <div className="mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8 sm:p-12 lg:p-16 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                    About SIBOL
                  </h1>
                </div>
                <div className="space-y-4 text-base sm:text-lg text-green-50 leading-relaxed">
                  <p className="font-medium text-xl text-white">
                  </p>
                  <p>
                    A cutting-edge smart garden monitoring system revolutionizing agriculture with
                    advanced technology, intuitive design, and dependable real-time data management.
                  </p>
                  <p>
                    Our system leverages IoT sensors, automated actuators, and AI-powered analytics
                    to monitor soil moisture, temperature, and humidity while detecting diseases,
                    pests, and nutrient deficiencies—empowering sustainable farming across the Philippines.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm font-medium">Smart Irrigation</span>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                    <Sprout className="w-5 h-5" />
                    <span className="text-sm font-medium">AI Detection</span>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-medium">Real-time Monitoring</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-300 to-emerald-300 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <img
                    src={Logo}
                    alt="Smart Garden System"
                    className="relative rounded-2xl shadow-2xl w-full max-w-lg transform group-hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mission and Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Mission */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  Mission
                </h2>
              </div>
              <div className="mb-6 overflow-hidden rounded-2xl">
                <img
                  src={Mission}
                  alt="Mission"
                  className="w-full transform group-hover:scale-110 transition duration-700"
                />
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                To develop an objective, data-driven monitoring system that advances precision agriculture
                through innovative technologies, enabling farmers to optimize crop management, improve yields,
                and foster sustainable farming practices.
              </p>
            </div>

            {/* Vision */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Vision
                </h2>
              </div>
              <div className="mb-6 overflow-hidden rounded-2xl">
                <img
                  src={Vision}
                  alt="Vision"
                  className="w-full transform group-hover:scale-110 transition duration-700"
                />
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                We aim to be recognized technology shaping agriculture's future. We envision a world where
                every farmer, regardless of scale or resources, has access to cutting-edge technologies
                that empower data-driven decisions, creating a sustainable and resource-efficient future
                for the Philippines.
              </p>
            </div>
          </div>

          {/* Our Goals */}
          <div className="mb-16 bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-gray-100">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-4">
                Our Goals
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-100 hover:border-green-300 hover:shadow-lg"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base pt-1.5">
                    {goal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Team */}
          <div className="bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl text-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <Users className="w-8 h-8" />
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold">
                  Our Team
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed text-base">
                    We are innovative students from <span className="text-green-400 font-semibold">System Plus Computer College-Caloocan</span>, devoted to transforming agriculture through cutting-edge technology.
                    Our team specializes in system design, programming, and AI-powered solutions, committed to
                    helping farmers practice sustainable farming through real-time monitoring and intelligent automation.
                  </p>
                  <p className="text-gray-300 leading-relaxed text-base">
                    Combining expertise in computer science, engineering, data analysis, and agricultural technology,
                    we're inspired by the need for smarter farming solutions in the Philippines. WAIS represents
                    a leap forward in promoting plant health, maximizing resources, and enhancing harvests—making
                    sophisticated technologies accessible to all farmers for a more sustainable and fruitful future.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">Computer Science</span>
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">Engineering</span>
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">Data Analysis</span>
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">AgriTech</span>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                    <img
                      src={Us}
                      alt="Our Team"
                      className="relative rounded-2xl shadow-2xl w-full max-w-lg transform group-hover:scale-105 transition duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Navigation */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40'>
        <UserSidebar />
      </div>
    </div>
  )
}

export default AboutUs
