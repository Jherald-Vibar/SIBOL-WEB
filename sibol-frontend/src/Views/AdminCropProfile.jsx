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

  const [formData, setFormData] = useState({
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
  });

  const handleInputChange = (field, type, value) => {
    if (field === 'name') {
      setFormData({ ...formData, name: value });
    } else {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          [type]: value
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  const toggleCrop = (cropId) => {
    setExpandedCrop(expandedCrop === cropId ? null : cropId);
  };

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

  const transformCropData = (crop) => {
    return {
      id: crop.id,
      name: crop.name,
      soilTemp: {
        min: crop.soil_temp_min || 0,
        max: crop.soil_temp_max || 0
      },
      soilMoisture: {
        min: crop.soil_moisture_min || 0,
        max: crop.soil_moisture_max || 0
      },
      phLevel: {
        min: crop.ph_min || 0,  // FIXED: Changed from ph_level_min
        max: crop.ph_max || 0   // FIXED: Changed from ph_level_max
      },
      electricalConductivity: {
        min: crop.electrical_conductivity_min || 0,
        max: crop.electrical_conductivity_max || 0
      },
      nitrogen: {
        min: crop.nitrogen_min || 0,
        max: crop.nitrogen_max || 0
      },
      phosphorus: {
        min: crop.phosphorus_min || 0,
        max: crop.phosphorus_max || 0
      },
      potassium: {
        min: crop.potassium_min || 0,
        max: crop.potassium_max || 0
      },
      temperature: {
        min: crop.air_temperature_min || 0,  // FIXED: Changed from temperature_min
        max: crop.air_temperature_max || 0   // FIXED: Changed from temperature_max
      },
      humidity: {
        min: crop.air_humidity_min || 0,  // FIXED: Changed from humidity_min
        max: crop.air_humidity_max || 0   // FIXED: Changed from humidity_max
      }
    };
  };

  const addCrop = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // FIXED: Updated field names to match backend
      const cropData = {
        name: formData.name,
        soil_temp_min: parseFloat(formData.soilTemp.min) || 0,
        soil_temp_max: parseFloat(formData.soilTemp.max) || 0,
        soil_moisture_min: parseFloat(formData.soilMoisture.min) || 0,
        soil_moisture_max: parseFloat(formData.soilMoisture.max) || 0,
        ph_min: parseFloat(formData.phLevel.min) || 0,  // FIXED: Changed from ph_level_min
        ph_max: parseFloat(formData.phLevel.max) || 0,  // FIXED: Changed from ph_level_max
        electrical_conductivity_min: parseFloat(formData.electricalConductivity.min) || 0,
        electrical_conductivity_max: parseFloat(formData.electricalConductivity.max) || 0,
        nitrogen_min: parseFloat(formData.nitrogen.min) || 0,
        nitrogen_max: parseFloat(formData.nitrogen.max) || 0,
        phosphorus_min: parseFloat(formData.phosphorus.min) || 0,
        phosphorus_max: parseFloat(formData.phosphorus.max) || 0,
        potassium_min: parseFloat(formData.potassium.min) || 0,
        potassium_max: parseFloat(formData.potassium.max) || 0,
        air_temperature_min: parseFloat(formData.temperature.min) || 0,  // FIXED: Changed from temperature_min
        air_temperature_max: parseFloat(formData.temperature.max) || 0,  // FIXED: Changed from temperature_max
        air_humidity_min: parseFloat(formData.humidity.min) || 0,  // FIXED: Changed from humidity_min
        air_humidity_max: parseFloat(formData.humidity.max) || 0   // FIXED: Changed from humidity_max
      };

      console.log("Sending crop data:", cropData); // For debugging

      const response = await axiosClient.post("/addAdminCrop", cropData);

      console.log("Response from API:", response.data); // For debugging

      // Transform the response data to match frontend format
      const newCrop = transformCropData(response.data.data);

      setCrops([...crops, newCrop]);
      setModalOpen(false);
      resetForm();

    } catch (error) {
      setError(error.response?.data?.message || "Something Went Wrong!");
      console.error("Error adding crop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getCrops = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get("/getCropProfile");
        const transformedCrops = response.data.data.map(crop => transformCropData(crop));
        setCrops(transformedCrops);
      } catch (error) {
        setError(error.response?.data?.message || "Something Went Wrong!");
        console.error("Error fetching crops:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getCrops();
  }, []);

  return (
    <div className='bg-[#F4F0E5] flex min-h-screen relative pb-20 md:pb-0'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <AdminSidebar/>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
        <AdminSidebar />
      </div>

      <div className='flex-1 flex flex-col'>
        <div className="shadow-md bg-white md:ml-64 sticky top-0 z-30">
          <AdminNavbar/>
        </div>

        <div className='flex-1 flex flex-col md:ml-64 px-4 sm:px-6 lg:px-10 py-4 md:py-6'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row items-start justify-between mb-6 gap-3'>
            <div className='flex flex-col items-start justify-center'>
              <h1 className='font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl font-sans text-black'>Crop Profile</h1>
            </div>
            <div className='flex flex-col items-stretch sm:items-end justify-center w-full sm:w-auto'>
              <button
                onClick={() => setModalOpen(true)}
                type='button'
                className='bg-[#114320BA] px-4 py-2.5 rounded-md text-white text-sm font-serif cursor-pointer hover:bg-[#114320] transition w-full sm:w-auto'
              >
                ADD CROP
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading crops...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-4 border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && crops.length === 0 && !error && (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-base md:text-lg">No crop profiles yet. Add your first crop!</p>
            </div>
          )}

          {/* Crops List */}
          <div className="space-y-4 mb-6">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
                {/* Crop Header - Always visible */}
                <div
                  onClick={() => toggleCrop(crop.id)}
                  className="bg-[#E8DCC4] px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-[#ddd4bd] transition flex justify-between items-center"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">{crop.name}</h2>
                  <span className="text-gray-600 font-bold text-2xl">
                    {expandedCrop === crop.id ? '−' : '+'}
                  </span>
                </div>

                {/* Crop Details Table - Only show if THIS crop is expanded */}
                {expandedCrop === crop.id && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
                            Optimal Condition
                          </th>
                          <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b-2 border-l-2 border-gray-300">
                            Minimum
                          </th>
                          <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b-2 border-l-2 border-gray-300">
                            Maximum
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameters.map((param, index) => (
                          <tr key={param.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-700 border-b border-gray-200">
                              {param.label}
                            </td>
                            <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-center text-gray-800 border-b border-l-2 border-gray-200">
                              {crop[param.key]?.min ?? 0}
                            </td>
                            <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-center text-gray-800 border-b border-l-2 border-gray-200">
                              {crop[param.key]?.max ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 border-t-2 border-gray-300">
                      <button className="bg-[#114320] text-white px-4 py-2 rounded-md hover:bg-[#1a5c2e] transition text-sm font-semibold">
                        EDIT
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-semibold">
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

      {/* Add Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#114320] px-5 md:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-white">Add New Crop Profile</h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                  setError("");
                }}
                className="text-white hover:text-gray-300 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 md:p-6">
              {/* Show error if exists */}
              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-4 text-sm border border-red-200">
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
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#114320]"
                  placeholder="Enter crop name"
                  required
                />
              </div>

              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                Optimal Conditions
              </h3>

              {/* Parameters Grid */}
              <div className="space-y-3 md:space-y-4">
                {parameters.map((param) => (
                  <div key={param.key} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-start md:items-center bg-gray-50 p-3 md:p-4 rounded-lg">
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
                        className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#114320] text-sm"
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
                        className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#114320] text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t-2 border-gray-300">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                    setError("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2.5 md:py-3 rounded-md hover:bg-gray-400 transition font-semibold"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={addCrop}
                  disabled={loading}
                  className="flex-1 bg-[#114320] text-white px-4 py-2.5 md:py-3 rounded-md hover:bg-[#1a5c2e] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "SAVING..." : "SAVE CROP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCropProfile;
