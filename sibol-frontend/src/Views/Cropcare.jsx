import React, { useEffect, useState } from 'react';
import UserSidebar from './parts/UserSidebar';
import UserNavbar from './parts/UserNavbar';
import Pic from '../assets/first_image.png';
import axiosClient from './axios';
import { useNavigate } from 'react-router-dom';

const Cropcare = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gardenToDelete, setGardenToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [garden, setGarden] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    garden_name: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setError(null);
  };

  const openDeleteModal = (gardenId, gardenName) => {
    setGardenToDelete({ id: gardenId, name: gardenName });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setGardenToDelete(null);
    setError(null);
  };

  const fetchGarden = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/getGardenData");
      setGarden(response.data);
    } catch (error) {
      setError("Failed to fetch data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarden();
    const interval = setInterval(fetchGarden, 30000);
    return () => clearInterval(interval);
  }, []);

  const addGarden = async (e) => {
    e.preventDefault();

    if (!form.garden_name || !form.location) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/addGarden", form);
      setForm({ garden_name: "", location: "" });
      setModalOpen(false);
      fetchGarden();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add garden");
    } finally {
      setLoading(false);
    }
  };

  const deleteGarden = async () => {
    if (!gardenToDelete) return;

    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/deleteGarden/${gardenToDelete.id}`);
      closeDeleteModal();
      fetchGarden();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete garden");
    } finally {
      setDeleteLoading(false);
    }
  };

  const goGarden = (gardenId) => {
    navigate(`/user/crop-care/${encodeURIComponent(gardenId)}`);
  };

  return (
    <div className='bg-[#F4F0E5] min-h-screen flex flex-col md:flex-row'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-64 bg-white fixed top-0 left-0 h-screen shadow-md z-40'>
        <UserSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 pb-20 md:pb-0">
        {/* Navbar */}
        <div className="shadow-md bg-white sticky top-0 z-30">
          <UserNavbar />
        </div>

        {/* Content */}
        <div className='flex-1 flex flex-col px-4 sm:px-6 lg:px-10 py-4'>
          {/* Header */}
          <div className='flex flex-col justify-center w-full py-6 border-b-2 border-gray-500'>
            <h1 className='text-xl sm:text-2xl md:text-4xl font-semibold'>
              Which garden would you like to monitor?
            </h1>
          </div>

          {/* Create Button */}
          <div className='flex justify-end w-full py-4'>
            <button
              onClick={handleModal}
              type='button'
              className='bg-[#114320BA] hover:bg-[#114320] transition-colors px-4 py-2 rounded-md text-white font-serif text-sm md:text-base'
            >
              CREATE NEW
            </button>
          </div>

          {/* Garden Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
            {garden.map((gard) => (
              <div key={gard.id} className='flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
                <div className='w-full h-48 overflow-hidden'>
                  <img src={Pic} alt={gard.name} className='w-full h-full object-cover' />
                </div>
                <div className='flex flex-row'>
                  <div className='flex-1 px-4 py-3 border-r-2 border-gray-200'>
                    <h2 className='font-serif text-lg md:text-xl font-semibold truncate'>
                      {gard.name}
                    </h2>
                  </div>
                  <div className='flex items-center justify-evenly px-3 py-3 gap-2'>
                    <button
                      onClick={() => goGarden(gard.id)}
                      disabled={loading}
                      className='hover:bg-gray-100 p-2 rounded transition-colors disabled:opacity-50'
                      aria-label="View garden"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                        <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={32} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40" />
                        <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={32} d="m272 336l80-80l-80-80M48 256h288" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(gard.id, gard.name)}
                      className='hover:bg-red-50 p-2 rounded transition-colors'
                      aria-label="Delete garden"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="#e61010" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11v6m-4-6v6M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M4 7h16M7 7l2-4h6l2 4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Footer Sidebar */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40'>
        <UserSidebar />
      </div>

      {/* Add Garden Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-fadeIn'>
          <div className='flex flex-col bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all'>
            {/* Modal Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b'>
              <h2 className='text-xl md:text-2xl font-bold'>Add Garden</h2>
              <button
                onClick={closeModal}
                className='hover:bg-gray-100 p-2 rounded-full transition-colors'
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
                  <path fill="#151212" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12" />
                  <path fill="#151212" d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
                </svg>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center p-4 mx-6 mt-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div>
                  <span className="font-medium">Error!</span> {error}
                </div>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={addGarden} className='flex flex-col gap-4 px-6 py-6'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm md:text-base font-semibold'>Garden Name</label>
                <input
                  type="text"
                  name='garden_name'
                  value={form.garden_name}
                  onChange={handleChange}
                  placeholder='Enter garden name'
                  className='px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-[#114320BA] transition-colors'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm md:text-base font-semibold'>Location</label>
                <input
                  type="text"
                  name='location'
                  value={form.location}
                  onChange={handleChange}
                  placeholder='Enter location'
                  className='px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-[#114320BA] transition-colors'
                />
              </div>

              <div className='flex justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='px-4 py-2 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='bg-[#114320BA] hover:bg-[#114320] transition-colors px-6 py-2 rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
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
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-fadeIn'>
          <div className='flex flex-col bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all'>
            {/* Modal Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50'>
              <h2 className='text-xl md:text-2xl font-bold text-red-700'>Delete Garden</h2>
              <button
                onClick={closeDeleteModal}
                className='hover:bg-red-100 p-2 rounded-full transition-colors'
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
                  <path fill="#dc2626" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2m0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12" />
                  <path fill="#dc2626" d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
                </svg>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center p-4 mx-6 mt-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div>
                  <span className="font-medium">Error!</span> {error}
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className='px-6 py-6'>
              <div className='flex items-center justify-center mb-4'>
                <div className='bg-red-100 rounded-full p-3'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                    <path fill="#dc2626" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1m1 4h-2v-2h2z" />
                  </svg>
                </div>
              </div>

              <p className='text-center text-gray-700 mb-2'>
                Are you sure you want to delete
              </p>
              <p className='text-center font-bold text-lg text-gray-900 mb-4'>
                "{gardenToDelete?.name}"?
              </p>
              <p className='text-center text-sm text-gray-600'>
                This action cannot be undone. All data associated with this garden will be permanently deleted.
              </p>
            </div>

            {/* Modal Actions */}
            <div className='flex justify-end gap-3 px-6 py-4 border-t'>
              <button
                type='button'
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className='px-4 py-2 border-2 border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={deleteGarden}
                disabled={deleteLoading}
                className='bg-red-600 hover:bg-red-700 transition-colors px-6 py-2 rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {deleteLoading ? (
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
                  "Delete Garden"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Cropcare;
