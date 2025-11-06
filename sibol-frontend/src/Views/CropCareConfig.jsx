import React, { useEffect, useState } from "react";
import UserSidebar from "./parts/UserSidebar";
import UserNavbar from "./parts/UserNavbar";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "./axios";

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

  // Device modal states
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
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
      formData.append("planted_date", form.planted_date);
      if (form.image) formData.append("image", form.image);

      const response = await axiosClient.post(`/addCrop/${garden_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setModalOpen(false);
      setForm({ name: "", variety: "", planted_date: "", image: null });
      setImagePreview(null);
      setCrop((prev) => [...prev, response.data.data]);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
    setForm({ name: "", variety: "", planted_date: "", image: null });
    setImagePreview(null);
    setError("");
  };

  const addDevice = async (gardenId) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosClient.post(`/addDevice/${gardenId}`);

      setDeviceInfo(response.data.device);
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
    } catch (error) {
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

    const interval = setInterval(() => {
      fetchEsp();
    }, 5000);

    return () => clearInterval(interval);
  }, [garden_id]);

  const handleNextPage = (crop_name) => {
    navigate(`/user/crop-care/${garden_id}/${crop_name}`);
  };

  return (
    <div className="bg-[#F4F0E5] flex min-h-screen relative pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40">
        <UserSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
        <UserSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="shadow-md bg-white md:ml-64 sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64 px-4 sm:px-6 lg:px-10 py-4 md:py-6">
          {/* Header Section */}
          <div className="flex flex-col justify-center w-full py-4 md:py-6 border-b-2 border-gray-300">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold font-sans text-gray-800">
              Which crop would you like to monitor?
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4">
            {!esp && (
              <button
                onClick={() => addDevice(garden_id)}
                type="button"
                disabled={loading}
                className="bg-[#114320BA] px-4 py-2.5 rounded-md text-white text-sm font-serif cursor-pointer w-full sm:w-auto hover:bg-[#114320] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "ADD DEVICE"}
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
              className="bg-[#114320BA] px-4 py-2.5 rounded-md text-white text-sm font-serif w-full sm:w-auto transition cursor-pointer hover:bg-[#114320]"
            >
              CREATE NEW
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-3 text-sm mt-4 border border-red-200">
              ⚠ {error}
            </div>
          )}

          {/* ESP Device Display */}
          {esp && (
            <div
              className={`mt-6 bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 ${
                esp.status === "inactive" ? "border-red-600" : "border-green-500"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#166534"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="md:w-6 md:h-6"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">{esp.name}</h2>
                    <p className="text-xs md:text-sm text-gray-500 break-all">
                      Device ID: {esp.serial_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      esp.status === "active" || esp.status === "online"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {esp.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">ESP ID</p>
                  <p className="text-xs md:text-sm font-mono text-gray-800 break-all">
                    {esp.serial_number || "Not connected yet"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Device Type</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">
                    {esp.device_type || "ESP32 Main"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <p className="text-xs text-gray-500 mb-1">Last Seen</p>
                  <p className="text-xs md:text-sm text-gray-800">
                    {esp.last_seen_at ? new Date(esp.last_seen_at).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setDeviceInfo({
                      device_id: esp.serial_number,
                    });
                    setShowDeviceModal(true);
                  }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-semibold"
                >
                  📋 View Credentials
                </button>
              </div>
            </div>
          )}

          {/* Crop Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-6 mb-6">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="w-full h-40 sm:h-48 overflow-hidden">
                  <img
                    src={
                     crop.type === "crop"
                    ? `${import.meta.env.VITE_API_BASE_URL}/crops_image/${crop.image}`
                    : `${import.meta.env.VITE_API_BASE_URL}/sensor_images/${crop.image}`
                    }
                    alt={crop.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-between px-4 py-3 border-t border-gray-200">
                  <h2 className="text-base md:text-lg font-semibold text-gray-800 font-serif truncate">
                    {crop.name}
                  </h2>
                  <p className="text-sm text-gray-500">{crop.variety}</p>
                  <p className="text-xs text-gray-400 mt-1">Planted: {crop.planted_at}</p>

                  <div className="flex justify-end gap-2 md:gap-3 mt-3">
                    <button
                      disabled={loading}
                      onClick={() => handleNextPage(crop.name)}
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition"
                      title="View Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        height="20px"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="none"
                          stroke="#166534"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={28}
                          d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"
                        />
                        <path
                          fill="none"
                          stroke="#166534"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={28}
                          d="m272 336l80-80l-80-80M48 256h288"
                        />
                      </svg>
                    </button>

                    <button
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition"
                      title="Delete Crop"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        height="20px"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="#dc2626"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 11v6m-4-6v6M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M4 7h16M7 7l2-4h6l2 4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Crop Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
              <div className="bg-white px-4 py-5 w-full max-w-md rounded-lg shadow-xl border border-gray-300">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold font-sans">Add Crop</h1>
                  <button onClick={closeModal} className="text-gray-600 hover:text-black text-2xl">
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded mb-3 text-sm border border-red-200">
                    ⚠ {error}
                  </div>
                )}

                <form onSubmit={addCrop} className="flex flex-col gap-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Crop Name"
                    value={form.name}
                    onChange={handleChange}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <input
                    type="text"
                    name="variety"
                    placeholder="Variety"
                    value={form.variety}
                    onChange={handleChange}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  )}

                  <input
                    type="date"
                    name="planted_date"
                    value={form.planted_date}
                    onChange={handleChange}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#114320BA] text-white py-2.5 rounded-md font-bold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Device Info Modal */}
          {showDeviceModal && deviceInfo && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
              <div className="bg-white px-5 py-6 w-full max-w-lg rounded-lg shadow-xl border border-gray-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl md:text-2xl font-bold font-sans text-green-800">
                    🌿 Device Configuration
                  </h1>
                  <button
                    onClick={closeDeviceModal}
                    className="text-gray-600 hover:text-black text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    📱 Use these credentials to configure your ESP32 device:
                  </p>
                </div>

                {/* Device ID */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device ID:
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      value={deviceInfo.device_id}
                      readOnly
                      className="flex-1 border-2 border-green-300 bg-gray-50 px-3 py-2 rounded-md font-mono text-sm break-all"
                    />
                    <button
                      onClick={() => copyToClipboard(deviceInfo.device_id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition whitespace-nowrap"
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="font-semibold text-sm text-blue-900 mb-2">
                    📝 Setup Instructions:
                  </h3>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>
                      Connect to WiFi network: <strong>"Sibol-SmartGarden"</strong>
                    </li>
                    <li>
                      Password: <strong>"sibol2025"</strong>
                    </li>
                    <li>
                      Portal will open automatically at <strong>192.168.4.1</strong>
                    </li>
                    <li>Click "Configure WiFi"</li>
                    <li>Enter your WiFi credentials</li>
                    <li>
                      Paste the <strong>Device ID</strong> above
                    </li>
                    <li>Click "Save"</li>
                  </ol>
                </div>

                <button
                  onClick={closeDeviceModal}
                  className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-md font-bold hover:bg-gray-300 transition"
                >
                  Close
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  ⚠️ Save these credentials! You'll need them to configure your device.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropCareConfig;
