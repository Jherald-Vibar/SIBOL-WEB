import React, { useEffect, useState, useRef } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "./axios";

/* ─────────────────────────────────────────────
   SCAN DEVICE MODAL
───────────────────────────────────────────── */
const ScanDeviceModal = ({ onClose, onConnect, loading }) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [dots, setDots] = useState(0);
  const [foundDevices, setFoundDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const MOCK_DEVICES = [
    { id: 1, name: "Sibol-ESP32-A1B2", serial: "ESP-A1B2C3D4", rssi: -42, type: "ESP32" },
    { id: 2, name: "Sibol-ESP32-C3D4", serial: "ESP-C3D4E5F6", rssi: -61, type: "ESP32" },
    { id: 3, name: "Sibol-Node-7F8E", serial: "ESP-7F8E9A0B", rssi: -75, type: "ESP32-S3" },
  ];

  const timerRef = useRef(null);
  const sweepRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      sweepRef.current = setInterval(() => setSweepAngle((a) => (a + 3) % 360), 30);
      dotsRef.current = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    } else {
      clearInterval(sweepRef.current);
      clearInterval(dotsRef.current);
    }
    return () => {
      clearInterval(sweepRef.current);
      clearInterval(dotsRef.current);
    };
  }, [scanning]);

  const startScan = () => {
    setFoundDevices([]);
    setSelectedDevice(null);
    setScanning(true);
    setScanProgress(0);

    let progress = 0;
    let devIdx = 0;
    const shuffled = [...MOCK_DEVICES].sort(() => Math.random() - 0.5);

    timerRef.current = setInterval(() => {
      progress += 2;
      setScanProgress(progress);

      if (progress % 28 === 0 && devIdx < shuffled.length) {
        const angle = (devIdx / shuffled.length) * 2 * Math.PI - Math.PI / 4;
        const dist = 0.22 + ((Math.abs(shuffled[devIdx].rssi) - 38) / 50) * 0.28;
        setFoundDevices((prev) => [
          ...prev,
          { ...shuffled[devIdx], angle, dist },
        ]);
        devIdx++;
      }

      if (progress >= 100) {
        clearInterval(timerRef.current);
        setScanning(false);
      }
    }, 60);
  };

  const stopScan = () => {
    clearInterval(timerRef.current);
    setScanning(false);
  };

  const signalStrength = (rssi) =>
    rssi > -50 ? 4 : rssi > -65 ? 3 : rssi > -75 ? 2 : 1;

  const signalColor = (rssi) =>
    rssi > -50 ? "#22c55e" : rssi > -65 ? "#84cc16" : rssi > -75 ? "#eab308" : "#ef4444";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#114320] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="white" stroke="white" />
            </svg>
            <h1 className="text-xl font-bold text-white font-sans">Scan for Device</h1>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 text-2xl leading-none">✕</button>
        </div>

        <div className="p-6">

          {/* Radar */}
          <div className="flex flex-col items-center mb-5">
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {[1, 2, 3, 4].map((r) => (
                <div
                  key={r}
                  style={{
                    position: "absolute",
                    inset: `${r * 11}%`,
                    borderRadius: "50%",
                    border: "1px solid rgba(17,67,32,0.18)",
                    background: r === 4 ? "rgba(17,67,32,0.03)" : "transparent",
                  }}
                />
              ))}

              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(17,67,32,0.1)", transform: "translateY(-50%)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(17,67,32,0.1)", transform: "translateX(-50%)" }} />

              {scanning && (
                <div
                  style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: `conic-gradient(from ${sweepAngle}deg, rgba(17,67,32,0.22) 0deg, rgba(34,197,94,0.08) 55deg, transparent 70deg)`,
                  }}
                />
              )}

              {scanning && [0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute", inset: "38%", borderRadius: "50%",
                    border: "1.5px solid rgba(34,197,94,0.55)",
                    animation: `scanPulse ${1.4 + i * 0.6}s ease-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}

              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 12, height: 12, borderRadius: "50%",
                background: scanning ? "#16a34a" : "#114320",
                boxShadow: scanning ? "0 0 0 4px rgba(22,163,74,0.25)" : "none",
                transition: "box-shadow 0.3s",
                zIndex: 2,
              }} />

              {foundDevices.map((d) => {
                const cx = 50 + Math.cos(d.angle) * d.dist * 100;
                const cy = 50 + Math.sin(d.angle) * d.dist * 100;
                const isSelected = selectedDevice?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDevice(d)}
                    title={d.name}
                    style={{
                      position: "absolute",
                      left: `${cx}%`, top: `${cy}%`,
                      transform: "translate(-50%,-50%)",
                      width: isSelected ? 14 : 10,
                      height: isSelected ? 14 : 10,
                      borderRadius: "50%",
                      background: signalColor(d.rssi),
                      boxShadow: isSelected
                        ? `0 0 0 3px white, 0 0 0 5px ${signalColor(d.rssi)}`
                        : `0 0 6px ${signalColor(d.rssi)}`,
                      border: "none",
                      cursor: "pointer",
                      zIndex: 3,
                      transition: "all 0.2s",
                      animation: "blipIn 0.4s ease-out",
                    }}
                  />
                );
              })}
            </div>

            <p className="mt-2 text-sm font-semibold text-[#114320] tracking-wide" style={{ minHeight: 20 }}>
              {scanning
                ? `Scanning${".".repeat(dots)}`
                : foundDevices.length > 0
                ? `${foundDevices.length} device${foundDevices.length > 1 ? "s" : ""} found — tap a blip to select`
                : "Press Scan to discover devices"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${scanProgress}%`,
                background: "linear-gradient(90deg, #114320, #22c55e)",
              }}
            />
          </div>

          {/* Selected device info */}
          {selectedDevice && !scanning && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{selectedDevice.name}</p>
                <p className="text-xs text-gray-500 font-mono">{selectedDevice.serial}</p>
              </div>
              <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
                {[1, 2, 3, 4].map((b) => (
                  <div key={b} style={{
                    width: 3,
                    height: `${b * 4}px`,
                    borderRadius: 1,
                    background: b <= signalStrength(selectedDevice.rssi) ? signalColor(selectedDevice.rssi) : "#d1d5db",
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={scanning ? stopScan : startScan}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-[#114320] text-[#114320] hover:bg-[#114320] hover:text-white transition"
            >
              {scanning ? "⏹ Stop" : "🔍 Scan"}
            </button>

            <button
              onClick={() => selectedDevice && onConnect(selectedDevice)}
              disabled={!selectedDevice || scanning || loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#114320] text-white hover:bg-[#1a5c2e] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes blipIn {
          0% { transform: translate(-50%,-50%) scale(0); opacity: 0; }
          60% { transform: translate(-50%,-50%) scale(1.6); }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const CropCareConfig = () => {
  const { garden_id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    variety: "",
    planted_date: "",
    image: null,
  });

  const [crops, setCrop] = useState([]);
  const [esp, setEsp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Device modal states
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [deleteEspConfirm, setDeleteEspConfirm] = useState(false); // ← NEW

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const addCrop = async (e) => {
    e.preventDefault();
    if (!form.name || !form.variety || !form.planted_date) {
      setError("All fields are required!");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("variety", form.variety);
      const formattedDate = new Date(form.planted_date).toISOString().split("T")[0];
      formData.append("planted_date", formattedDate);
      if (form.image) formData.append("image", form.image);

      const response = await axiosClient.post(`/addCrop/${garden_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModalOpen(false);
      setForm({ name: "", variety: "", planted_date: "", image: null });
      setImagePreview(null);
      setCrop((prev) => [...prev, response.data.data]);
    } catch (error) {
      if (error.response?.data?.errors) {
        setError(Object.values(error.response.data.errors).flat().join(", "));
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const editCrop = (crop) => {
    setEditingCrop(crop.id);
    let formattedDate = "";
    if (crop.planted_at) {
      try {
        const date = new Date(crop.planted_at);
        if (!isNaN(date.getTime())) formattedDate = date.toISOString().split("T")[0];
      } catch {}
    }
    setForm({ name: crop.name || "", variety: crop.variety || "", planted_date: formattedDate, image: null });
    setImagePreview(crop.image);
    setModalOpen(true);
  };

  const updateCrop = async (e) => {
    e.preventDefault();
    if (!form.name || !form.variety || !form.planted_date) {
      setError("All fields are required!");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", form.name);
      formData.append("variety", form.variety);
      const formattedDate = new Date(form.planted_date).toISOString().split("T")[0];
      formData.append("planted_date", formattedDate);
      if (form.image instanceof File) formData.append("image", form.image);

      const response = await axiosClient.post(`/updateCrop/${editingCrop}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCrop((prev) => prev.map((c) => (c.id === editingCrop ? response.data.data : c)));
      closeModal();
    } catch (error) {
      if (error.response?.data?.errors) {
        setError(Object.values(error.response.data.errors).flat().join(", "));
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCrop = async (cropId) => {
    setIsLoading(true);
    setError("");
    try {
      await axiosClient.delete(`/deleteCrop/${cropId}`);
      setCrop((prev) => prev.filter((c) => c.id !== cropId));
      setDeleteConfirm(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        setError(Object.values(error.response.data.errors).flat().join(", "));
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── NEW: Delete ESP device ──
  const deleteEsp = async () => {
    setIsLoading(true);
    try {
      await axiosClient.delete(`/deleteEsp/${esp.id}`);
      setEsp(null);
      setDeleteEspConfirm(false);
    } catch (error) {
      if (error.response?.data?.errors) {
        setError(Object.values(error.response.data.errors).flat().join(", "));
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModal = () => {
    setEditingCrop(null);
    setForm({ name: "", variety: "", planted_date: "", image: null });
    setImagePreview(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCrop(null);
    setForm({ name: "", variety: "", planted_date: "", image: null });
    setImagePreview(null);
    setError("");
  };

  const handleScanConnect = async (selectedDevice) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosClient.post(`/addDevice/${garden_id}`, {
        serial_number: selectedDevice.serial,
      });
      setDeviceInfo(response.data.device);
      setShowScanModal(false);
      setShowDeviceModal(true);
      fetchEsp();
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const closeDeviceModal = () => {
    setShowDeviceModal(false);
    setDeviceInfo(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const fetchEsp = async () => {
    try {
      const response = await axiosClient.get(`/getEsp/${garden_id}`);
      setEsp(response.data.data);
    } catch {
      setEsp(null);
    }
  };

  useEffect(() => {
    const fetchCrops = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get(`getCropData/${garden_id}`);
        setCrop(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Something Went Wrong!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCrops();
    fetchEsp();
  }, [garden_id]);

  useEffect(() => {
    fetchEsp();
    const interval = setInterval(fetchEsp, 5000);
    return () => clearInterval(interval);
  }, [garden_id]);

  const handleNextPage = (crop_name) => {
    navigate(`/user/crop-care/${garden_id}/${crop_name}`);
  };

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

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-4 mb-16 md:mb-0">
          {/* Header */}
          <div className="flex flex-col justify-center w-full pb-4 border-b-2 border-gray-500 mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold font-sans">
              Which crop would you like to monitor?
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mb-4">
            {!esp && (
              <button
                onClick={() => setShowScanModal(true)}
                type="button"
                disabled={loading}
                className="bg-[#114320BA] px-4 py-3 rounded-md text-white text-sm font-semibold cursor-pointer hover:bg-[#114320] transition disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "..." : "SCAN DEVICE"}
              </button>
            )}

            <button
              onClick={handleModal}
              title={
                !esp
                  ? "Please add and connect your ESP device first!"
                  : esp?.status === "inactive"
                  ? "ESP must be active before creating crops!"
                  : "ESP is connected!"
              }
              type="button"
              className="bg-[#114320BA] px-4 py-3 rounded-md text-white text-sm font-semibold transition cursor-pointer hover:bg-[#114320] w-full sm:w-auto"
            >
              CREATE NEW
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* ESP Device Display */}
          {esp && (
            <div
              className={`mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 ${
                esp.status === "inactive" ? "border-red-600" : "border-green-500"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">{esp.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">Device ID: {esp.serial_number}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  esp.status === "active" || esp.status === "online"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {esp.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">ESP ID</p>
                  <p className="text-xs sm:text-sm font-mono text-gray-800 break-all">{esp.serial_number || "Not connected yet"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">Device Type</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{esp.device_type || "ESP32 Main"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs text-gray-500 mb-1">Last Seen</p>
                  <p className="text-xs sm:text-sm text-gray-800">{esp.last_seen_at ? new Date(esp.last_seen_at).toLocaleString() : "Never"}</p>
                </div>
              </div>

              {/* ── UPDATED: Buttons row with Remove Device ── */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setDeviceInfo({ device_id: esp.serial_number }); setShowDeviceModal(true); }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-semibold"
                >
                  📋 View Credentials
                </button>
                <button
                  onClick={() => setDeleteEspConfirm(true)}
                  className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-semibold"
                >
                  🗑 Remove Device
                </button>
              </div>
            </div>
          )}

          {/* Crop list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="w-full h-48 overflow-hidden">
                  <img src={crop.image} alt={crop.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </div>
                <div className="flex flex-col px-4 py-3 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 font-serif truncate">{crop.name}</h2>
                  <p className="text-sm text-gray-500">{crop.variety}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Planted: {new Date(crop.planted_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  <div className="flex justify-end gap-2 mt-3">
                    <button disabled={loading} onClick={() => handleNextPage(crop.name)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition" title="View Details">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512">
                        <path fill="none" stroke="#1e40af" strokeLinecap="round" strokeLinejoin="round" strokeWidth={28} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40" />
                        <path fill="none" stroke="#1e40af" strokeLinecap="round" strokeLinejoin="round" strokeWidth={28} d="m272 336l80-80l-80-80M48 256h288" />
                      </svg>
                    </button>
                    <button onClick={() => editCrop(crop)} className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition" title="Edit Crop">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="none" stroke="#166534" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1" />
                        <path fill="none" stroke="#166534" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3zM16 5l3 3" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(crop.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition" title="Delete Crop">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="none" stroke="#dc2626" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11v6m-4-6v6M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M4 7h16M7 7l2-4h6l2 4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Footer Sidebar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-200">
          <UserSidebar />
        </div>
      </div>

      {/* ── SCAN DEVICE MODAL ── */}
      {showScanModal && (
        <ScanDeviceModal
          onClose={() => setShowScanModal(false)}
          onConnect={handleScanConnect}
          loading={loading}
        />
      )}

      {/* ── ADD / EDIT CROP MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-[#114320] px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-xl">
              <h1 className="text-xl font-bold text-white">{editingCrop ? "Edit Crop" : "Add Crop"}</h1>
              <button onClick={closeModal} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">⚠️ {error}</div>
              )}
              <form onSubmit={editingCrop ? updateCrop : addCrop} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Name *</label>
                  <input type="text" name="name" placeholder="Enter crop name" value={form.name} onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Variety *</label>
                  <div className="flex gap-6 border-2 border-gray-300 rounded-lg p-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="variety" value="Vegetable" checked={form.variety === "Vegetable"} onChange={handleChange}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" required />
                      <span className="text-sm font-medium text-gray-700">🥬 Vegetable</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="variety" value="Fruit" checked={form.variety === "Fruit"} onChange={handleChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500" required />
                      <span className="text-sm font-medium text-gray-700">🍓 Fruit</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Image</label>
                  <input type="file" name="image" accept="image/*" onChange={handleFileChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]" />
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-300" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Planted Date *</label>
                  <input type="date" name="planted_date" value={form.planted_date} onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]" required />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t-2 border-gray-300">
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold">CANCEL</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#114320] text-white px-6 py-3 rounded-lg hover:bg-[#1a5c2e] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "SAVING..." : editingCrop ? "UPDATE" : "SAVE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CROP CONFIRMATION MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-red-700">Delete Crop</h2>
              <button onClick={() => setDeleteConfirm(null)} className="hover:bg-red-100 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
                  <path fill="#dc2626" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12" />
                  <path fill="#dc2626" d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="flex items-center p-4 mx-6 mt-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
                <div><span className="font-medium">Error!</span> {error}</div>
              </div>
            )}
            <div className="px-6 py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                    <path fill="#dc2626" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1m1 4h-2v-2h2z" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-gray-700 mb-2">Are you sure you want to delete</p>
              <p className="text-center font-bold text-lg text-gray-900 mb-4">"{crops.find((c) => c.id === deleteConfirm)?.name}"?</p>
              <p className="text-center text-sm text-gray-600">This action cannot be undone. All data associated with this crop will be permanently deleted.</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button type="button" onClick={() => setDeleteConfirm(null)} disabled={loading}
                className="px-4 py-2 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => deleteCrop(deleteConfirm)} disabled={loading}
                className="bg-red-600 hover:bg-red-700 transition-colors px-6 py-2 rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Deleting...
                  </>
                ) : "Delete Crop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ESP CONFIRMATION MODAL ── */}
      {deleteEspConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-red-700">Remove Device</h2>
              <button
                onClick={() => { setDeleteEspConfirm(false); setError(""); }}
                className="hover:bg-red-100 p-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
                  <path fill="#dc2626" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12" />
                  <path fill="#dc2626" d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="flex items-center p-4 mx-6 mt-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
                <div><span className="font-medium">Error!</span> {error}</div>
              </div>
            )}

            <div className="px-6 py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                    <path fill="#dc2626" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1m1 4h-2v-2h2z" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-gray-700 mb-2">Are you sure you want to remove</p>
              <p className="text-center font-bold text-lg text-gray-900 mb-4">"{esp?.serial_number}"?</p>
              <p className="text-center text-sm text-gray-600">
                This will disconnect the device from this garden. All sensor data linked to it may be affected.
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                type="button"
                onClick={() => { setDeleteEspConfirm(false); setError(""); }}
                disabled={loading}
                className="px-4 py-2 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteEsp}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 transition-colors px-6 py-2 rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Removing...
                  </>
                ) : "Remove Device"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEVICE INFO / CREDENTIALS MODAL ── */}
      {showDeviceModal && deviceInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[550px] max-h-[90vh] overflow-y-auto">
            <div className="bg-[#114320] px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-xl">
              <h1 className="text-xl sm:text-2xl font-bold text-white">🌿 Device Configuration</h1>
              <button onClick={closeDeviceModal} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm text-gray-700">📱 Use these credentials to configure your ESP32 device:</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Device ID:</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input type="text" value={deviceInfo.device_id} readOnly
                    className="flex-1 border-2 border-green-300 bg-gray-50 px-3 py-2 rounded-md font-mono text-sm" />
                  <button onClick={() => copyToClipboard(deviceInfo.device_id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition" title="Copy to clipboard">
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h3 className="font-semibold text-sm text-blue-900 mb-2">📝 Setup Instructions:</h3>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Connect to WiFi network: <strong>"Sibol-SmartGarden"</strong></li>
                  <li>Password: <strong>"sibol2025"</strong></li>
                  <li>Portal will open automatically at <strong>192.168.4.1</strong></li>
                  <li>Click "Configure WiFi"</li>
                  <li>Enter your WiFi credentials</li>
                  <li>Paste the <strong>Device ID</strong> above</li>
                  <li>Click "Save"</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <button onClick={closeDeviceModal} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md font-bold hover:bg-gray-300 transition">Close</button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">⚠️ Save these credentials! You'll need them to configure your device.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCareConfig;
