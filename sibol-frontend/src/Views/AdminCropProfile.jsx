import React, { useEffect, useState } from 'react';
import AdminSidebar from './parts/AdminSidebar';
import AdminNavbar from './parts/AdminNavbar';
import axiosClient from './axios';

const AdminCropProfile = () => {
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const initialFormData = {
    name: "",
    soilTemp: { min: "", max: "" },
    soilMoisture: { min: "", max: "" },
    phLevel: { min: "", max: "" },
    electricalConductivity: { min: "", max: "" },
    nitrogen: { min: "", max: "" },
    phosphorus: { min: "", max: "" },
    potassium: { min: "", max: "" },
    temperature: { min: "", max: "" },
    humidity: { min: "", max: "" }
  };

  const [formData, setFormData] = useState(initialFormData);

  const parameters = [
    { key: 'soilTemp', label: 'Soil Temperature' },
    { key: 'soilMoisture', label: 'Soil Moisture' },
    { key: 'phLevel', label: 'pH Level' },
    { key: 'electricalConductivity', label: 'Electrical Conductivity' },
    { key: 'nitrogen', label: 'Nitrogen' },
    { key: 'phosphorus', label: 'Phosphorus' },
    { key: 'potassium', label: 'Potassium' },
    { key: 'temperature', label: 'Air Temperature' },
    { key: 'humidity', label: 'Air Humidity' }
  ];

  // Form handlers
  const handleInputChange = (field, type, value) => {
    if (field === 'name') {
      setFormData(prev => ({ ...prev, name: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: { ...prev[field], [type]: value }
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCrop(null);
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Crop handlers
  const toggleCrop = (cropId) => {
    setExpandedCrop(prev => prev === cropId ? null : cropId);
  };

  // Data transformation
  const transformCropData = (crop) => ({
    id: crop.id,
    name: crop.name,
    soilTemp: { min: crop.soil_temp_min || 0, max: crop.soil_temp_max || 0 },
    soilMoisture: { min: crop.soil_moisture_min || 0, max: crop.soil_moisture_max || 0 },
    phLevel: { min: crop.ph_min || 0, max: crop.ph_max || 0 },
    electricalConductivity: { min: crop.electrical_conductivity_min || 0, max: crop.electrical_conductivity_max || 0 },
    nitrogen: { min: crop.nitrogen_min || 0, max: crop.nitrogen_max || 0 },
    phosphorus: { min: crop.phosphorus_min || 0, max: crop.phosphorus_max || 0 },
    potassium: { min: crop.potassium_min || 0, max: crop.potassium_max || 0 },
    temperature: { min: crop.air_temperature_min || 0, max: crop.air_temperature_max || 0 },
    humidity: { min: crop.air_humidity_min || 0, max: crop.air_humidity_max || 0 }
  });

  const transformToApiFormat = (data) => ({
    name: data.name,
    soil_temp_min: parseFloat(data.soilTemp.min) || 0,
    soil_temp_max: parseFloat(data.soilTemp.max) || 0,
    soil_moisture_min: parseFloat(data.soilMoisture.min) || 0,
    soil_moisture_max: parseFloat(data.soilMoisture.max) || 0,
    ph_min: parseFloat(data.phLevel.min) || 0,
    ph_max: parseFloat(data.phLevel.max) || 0,
    electrical_conductivity_min: parseFloat(data.electricalConductivity.min) || 0,
    electrical_conductivity_max: parseFloat(data.electricalConductivity.max) || 0,
    nitrogen_min: parseFloat(data.nitrogen.min) || 0,
    nitrogen_max: parseFloat(data.nitrogen.max) || 0,
    phosphorus_min: parseFloat(data.phosphorus.min) || 0,
    phosphorus_max: parseFloat(data.phosphorus.max) || 0,
    potassium_min: parseFloat(data.potassium.min) || 0,
    potassium_max: parseFloat(data.potassium.max) || 0,
    air_temperature_min: parseFloat(data.temperature.min) || 0,
    air_temperature_max: parseFloat(data.temperature.max) || 0,
    air_humidity_min: parseFloat(data.humidity.min) || 0,
    air_humidity_max: parseFloat(data.humidity.max) || 0
  });

  // API calls
  const addCrop = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const cropData = transformToApiFormat(formData);
      const response = await axiosClient.post("/addAdminCrop", cropData);
      const newCrop = transformCropData(response.data.data);

      setCrops(prev => [...prev, newCrop]);
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
      console.error("Error adding crop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const editCrop = (crop) => {
    setEditingCrop(crop.id);
    setFormData({
      name: crop.name,
      soilTemp: crop.soilTemp,
      soilMoisture: crop.soilMoisture,
      phLevel: crop.phLevel,
      electricalConductivity: crop.electricalConductivity,
      nitrogen: crop.nitrogen,
      phosphorus: crop.phosphorus,
      potassium: crop.potassium,
      temperature: crop.temperature,
      humidity: crop.humidity
    });
    setModalOpen(true);
  };

  const updateCrop = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const cropData = transformToApiFormat(formData);
      const response = await axiosClient.put(`/updateAdminCrop/${editingCrop}`, cropData);
      const updatedCrop = transformCropData(response.data.data);

      setCrops(prev => prev.map(crop =>
        crop.id === editingCrop ? updatedCrop : crop
      ));
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
      console.error("Error updating crop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCrop = async (cropId) => {
    setIsLoading(true);
    try {
      await axiosClient.delete(`/deleteAdminCrop/${cropId}`);
      setCrops(prev => prev.filter(crop => crop.id !== cropId));
      setDeleteConfirm(null);
    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
      console.error("Error deleting crop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCrops = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/getCropProfile");
      const transformedCrops = response.data.data.map(transformCropData);
      setCrops(transformedCrops);
    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
      console.error("Error fetching crops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  return (
    <div className='bg-[#F4F0E5] flex min-h-screen'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <AdminSidebar/>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col md:ml-64'>
        {/* Navbar */}
        <div className="shadow-md bg-white sticky top-0 z-30">
          <AdminNavbar/>
        </div>

        {/* Content */}
        <div className='flex-1 px-4 sm:px-6 lg:px-8 py-4 md:py-6'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Crop Profile</h1>
            <button
              onClick={() => setModalOpen(true)}
              className='bg-[#114320] text-white px-6 py-3 rounded-lg hover:bg-[#0f3a1d] transition w-full sm:w-auto font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            >
              ADD CROP
            </button>
          </div>

          {/* Status Messages */}
          {loading && crops.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#114320] border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading crops...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {!loading && crops.length === 0 && !error && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg">No crop profiles found</p>
            </div>
          )}

          {/* Crops List */}
          <div className="space-y-4">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                {/* Crop Header */}
                <div className="bg-gradient-to-r from-[#E8DCC4] to-[#d4c9ad]">
                  <div
                    onClick={() => toggleCrop(crop.id)}
                    className="px-6 py-4 cursor-pointer hover:from-[#ddd4bd] hover:to-[#cac0a4] transition-all flex justify-between items-center"
                  >
                    <h2 className="text-xl font-bold text-gray-800">{crop.name}</h2>
                    <span className="text-gray-700 font-bold text-2xl transform transition-transform duration-200" style={{ transform: expandedCrop === crop.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </span>
                  </div>

                  {/* Mobile Action Buttons - Always Visible */}
                  <div className="md:hidden px-6 pb-4 flex gap-3">
                    <button
                      onClick={() => editCrop(crop)}
                      className="flex-1 bg-[#114320] text-white px-4 py-2.5 rounded-lg hover:bg-[#1a5c2e] transition-all transform hover:-translate-y-0.5 hover:shadow-lg text-sm font-semibold"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(crop.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg text-sm font-semibold"
                    >
                      DELETE
                    </button>
                  </div>
                </div>

                {/* Crop Details */}
                {expandedCrop === crop.id && (
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
                            Parameter
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2 border-l-2 border-gray-300">
                            Min
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2 border-l-2 border-gray-300">
                            Max
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameters.map((param, index) => (
                          <tr key={param.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                              {param.label}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-800 border-b border-l-2 border-gray-200 font-medium">
                              {crop[param.key]?.min ?? 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-800 border-b border-l-2 border-gray-200 font-medium">
                              {crop[param.key]?.max ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Action Buttons - Desktop Only */}
                    <div className="hidden md:flex bg-gray-50 px-6 py-4 gap-3 justify-end border-t-2 border-gray-300">
                      <button
                        onClick={() => editCrop(crop)}
                        className="bg-[#114320] text-white px-6 py-2.5 rounded-lg hover:bg-[#1a5c2e] transition-all transform hover:-translate-y-0.5 hover:shadow-lg text-sm font-semibold"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(crop.id)}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg text-sm font-semibold"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
        <AdminSidebar />
      </div>

      {/* Add/Edit Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#114320] px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {editingCrop ? 'Edit Crop' : 'Add New Crop'}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6">
              {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              {/* Crop Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', null, e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#114320]"
                  placeholder="Enter crop name"
                  required
                />
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                Optimal Conditions
              </h3>

              {/* Parameters Grid */}
              <div className="space-y-4">
                {parameters.map((param) => (
                  <div key={param.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-700">
                      {param.label}
                    </label>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData[param.key].min}
                        onChange={(e) => handleInputChange(param.key, 'min', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#114320] text-sm"
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData[param.key].max}
                        onChange={(e) => handleInputChange(param.key, 'max', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#114320] text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t-2 border-gray-300">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  CANCEL
                </button>
                <button
                  onClick={editingCrop ? updateCrop : addCrop}
                  disabled={loading}
                  className="flex-1 bg-[#114320] text-white px-6 py-3 rounded-lg hover:bg-[#1a5c2e] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "SAVING..." : editingCrop ? "UPDATE CROP" : "SAVE CROP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50">
              <h2 className="text-xl font-bold text-red-700">Delete Crop Profile</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
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

              <p className="text-center text-gray-700 mb-2">Are you sure you want to delete</p>
              <p className="text-center font-bold text-lg text-gray-900 mb-4">
                "{crops.find(c => c.id === deleteConfirm)?.name}"?
              </p>
              <p className="text-center text-sm text-gray-600">
                This action cannot be undone. All data associated with this crop profile will be permanently deleted.
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
    </div>
  );
};

export default AdminCropProfile;
