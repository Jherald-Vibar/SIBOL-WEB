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
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

      // Ensure date is in YYYY-MM-DD format
      const formattedDate = new Date(form.planted_date).toISOString().split('T')[0];
      formData.append("planted_date", formattedDate);

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
      // Better error handling to show specific validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
      console.error("Add crop error:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const editCrop = (crop) => {
    setEditingCrop(crop.id);

    // ✅ Ensure date is in correct format
    let formattedDate = "";
    if (crop.planted_at) {
      try {
        const date = new Date(crop.planted_at);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        }
      } catch (error) {
        console.error("Date formatting error:", error);
      }
    }

    setForm({
      name: crop.name || "",
      variety: crop.variety || "",
      planted_date: formattedDate,
      image: null,
    });

    setImagePreview(`${import.meta.env.VITE_API_BASE_URL}/crops_image/${crop.image}`);
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
      formData.append("_method", "PUT"); // ✅ Laravel method spoofing
      formData.append("name", form.name);
      formData.append("variety", form.variety);

      // Ensure date is in YYYY-MM-DD format
      const formattedDate = new Date(form.planted_date).toISOString().split('T')[0];
      formData.append("planted_date", formattedDate);

      // Only append image if a new one was selected
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      // Debug: Log what you're sending
      console.log("Sending data:", {
        name: formData.get('name'),
        variety: formData.get('variety'),
        planted_date: formData.get('planted_date'),
        image: formData.get('image')
      });

      // ✅ Use POST instead of PUT for multipart/form-data
      const response = await axiosClient.post(`/updateCrop/${editingCrop}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCrop((prev) =>
        prev.map((crop) => (crop.id === editingCrop ? response.data.data : crop))
      );
      closeModal();
    } catch (error) {
      // Better error handling to show specific validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
      console.error("Update error:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCrop = async (cropId) => {
    setIsLoading(true);
    setError("");

    try {
      await axiosClient.delete(`/deleteCrop/${cropId}`);
      setCrop((prev) => prev.filter((crop) => crop.id !== cropId));
      setDeleteConfirm(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        setError(errorMessages);
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
                onClick={() => addDevice(garden_id)}
                type="button"
                disabled={loading}
                className="bg-[#114320BA] px-4 py-3 rounded-md text-white text-sm font-semibold cursor-pointer hover:bg-[#114320] transition disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "..." : "ADD DEVICE"}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#166534"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">{esp.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">
                      Device ID: {esp.serial_number}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    esp.status === "active" || esp.status === "online"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {esp.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">ESP ID</p>
                  <p className="text-xs sm:text-sm font-mono text-gray-800 break-all">
                    {esp.serial_number || "Not connected yet"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">Device Type</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {esp.device_type || "ESP32 Main"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs text-gray-500 mb-1">Last Seen</p>
                  <p className="text-xs sm:text-sm text-gray-800">
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

          {/* Crop list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/crops_image/${crop.image}`}
                    alt={crop.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex flex-col px-4 py-3 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 font-serif truncate">
                    {crop.name}
                  </h2>
                  <p className="text-sm text-gray-500">{crop.variety}</p>
                  <p className="text-xs text-gray-400 mt-1">Planted: {crop.planted_at}</p>

                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      disabled={loading}
                      onClick={() => handleNextPage(crop.name)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition"
                      title="View Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="none"
                          stroke="#1e40af"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={28}
                          d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"
                        />
                        <path
                          fill="none"
                          stroke="#1e40af"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={28}
                          d="m272 336l80-80l-80-80M48 256h288"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => editCrop(crop)}
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition"
                      title="Edit Crop"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="#166534"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"
                        />
                        <path
                          fill="none"
                          stroke="#166534"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3zM16 5l3 3"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(crop.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition"
                      title="Delete Crop"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
        </div>

        {/* Mobile Footer Sidebar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-200">
          <UserSidebar />
        </div>
      </div>

      {/* Add/Edit Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-[#114320] px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-xl">
              <h1 className="text-xl font-bold text-white">
                {editingCrop ? "Edit Crop" : "Add Crop"}
              </h1>
              <button onClick={closeModal} className="text-white hover:text-gray-200 text-2xl">
                ✕
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              <form
                onSubmit={editingCrop ? updateCrop : addCrop}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter crop name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Variety *
                  </label>
                  <input
                    type="text"
                    name="variety"
                    placeholder="Enter variety"
                    value={form.variety}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Crop Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]"
                  />
                </div>

                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Planted Date *
                  </label>
                  <input
                    type="date"
                    name="planted_date"
                    value={form.planted_date}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#114320]"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t-2 border-gray-300">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#114320] text-white px-6 py-3 rounded-lg hover:bg-[#1a5c2e] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "SAVING..." : editingCrop ? "UPDATE" : "SAVE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-red-700">Delete Crop</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="hover:bg-red-100 p-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
                  <path
                    fill="#dc2626"
                    d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12"
                  />
                  <path
                    fill="#dc2626"
                    d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="flex items-center p-4 mx-6 mt-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
                <div>
                  <span className="font-medium">Error!</span> {error}
                </div>
              </div>
            )}

            <div className="px-6 py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                    <path
                      fill="#dc2626"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1m1 4h-2v-2h2z"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-center text-gray-700 mb-2">Are you sure you want to delete</p>
              <p className="text-center font-bold text-lg text-gray-900 mb-4">
                "{crops.find((c) => c.id === deleteConfirm)?.name}"?
              </p>
              <p className="text-center text-sm text-gray-600">
                This action cannot be undone. All data associated with this crop will be permanently
                deleted.
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={loading}
                className="px-4 py-2 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteCrop(deleteConfirm)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 transition-colors px-6 py-2 rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Crop"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Info Modal */}
      {showDeviceModal && deviceInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[550px] max-h-[90vh] overflow-y-auto">
            <div className="bg-[#114320] px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-xl">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                🌿 Device Configuration
              </h1>
              <button
                onClick={closeDeviceModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={deviceInfo.device_id}
                    readOnly
                    className="flex-1 border-2 border-green-300 bg-gray-50 px-3 py-2 rounded-md font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(deviceInfo.device_id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
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

              <div className="flex gap-3">
                <button
                  onClick={closeDeviceModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md font-bold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                ⚠️ Save these credentials! You'll need them to configure your device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCareConfig;
