import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Info, AlertCircle, Droplet, CheckCircle, RotateCcw } from 'lucide-react';
import Logo from '../../assets/logo-left.png';

const AdminNavbar = () => {
  const navigate = useNavigate();

  // State
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Dummy functions (replace with your real logic)
  const markAsRead = (id) => console.log("Mark as read:", id);
  const deleteNotification = (id) => console.log("Delete:", id);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'water': return <Droplet className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getIconBubbleStyle = () => "bg-white/10 text-white";

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400/30';
      case 'medium': return 'text-yellow-400 border-yellow-400/30';
      case 'low': return 'text-green-400 border-green-400/30';
      default: return 'text-white/40 border-white/20';
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-[#0b3d1e] border-b border-white/8 sticky top-0 z-50 font-['DM_Sans',sans-serif]">
        <div className="px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d4840a] flex items-center justify-center shrink-0">
                <img src={Logo} alt="SIBOL" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="hidden sm:block font-['Playfair_Display',serif] text-xl font-bold text-white tracking-widest">
                SIBOL
              </span>
            </div>

            {/* Right actions */}
            <button
              onClick={() => navigate('/user/about-us')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d4840a] hover:bg-[#f0a830] text-white text-xs font-semibold tracking-wide transition-all duration-200 border border-[#d4840a]/50 shadow-lg shadow-[#d4840a]/20"
            >
              <span className="hidden sm:inline">About Us</span>
              <span className="sm:hidden">About</span>
            </button>

          </div>
        </div>
      </nav>

      {/* MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b3d1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Header */}
            <div className="px-6 py-4 flex justify-between">
              <h2 className="text-white">{selectedNotification.title}</h2>
              <button onClick={() => setSelectedNotification(null)}>
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-white">
              <p>{selectedNotification.description}</p>

              <div className="mt-4 flex gap-2">
                {!selectedNotification.is_read && (
                  <button
                    onClick={() => markAsRead(selectedNotification.id)}
                    className="bg-green-500 px-3 py-2 rounded"
                  >
                    Mark as Read
                  </button>
                )}

                <button
                  onClick={() => deleteNotification(selectedNotification.id)}
                  className="bg-red-500 px-3 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div> 
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
