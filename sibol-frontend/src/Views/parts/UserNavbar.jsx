import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, Info, AlertCircle, Droplet, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/logo-left.png'
import axiosClient from '../axios'

const UserNavbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await axiosClient.get('/notifications');
      setNotifications(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await axiosClient.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const openNotificationDetails = (notif) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'soil_moisture':   return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'irrigation':      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'crop_alert':
      case 'garden_alert':    return <Info className="w-4 h-4 text-sky-400" />;
      case 'disease_detection': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'nutrient_alert':  return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'ph_alert':
      case 'temperature':     return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:                return <Bell className="w-4 h-4 text-white/40" />;
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':     return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'normal':   return 'bg-[#2e8b57]/15 text-emerald-400 border-[#2e8b57]/30';
      default:         return 'bg-white/10 text-white/50 border-white/15';
    }
  };

  const formatTime = (dateString) => {
    const diff = Date.now() - new Date(dateString);
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="bg-[#0b3d1e] border-b border-white/8 sticky top-0 z-50 font-['DM_Sans',sans-serif]">
        <div className="px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Amber chip */}
              <div className="w-9 h-9 rounded-xl bg-[#d4840a] flex items-center justify-center shrink-0">
                <img src={Logo} alt="SIBOL" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="hidden sm:block font-['Playfair_Display',serif] text-xl font-bold text-white tracking-widest">
                SIBOL
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">

              {/* Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10 transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#d4840a] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* ── NOTIFICATION PANEL ── */}
                {showNotifications && (
                  <>
                    {/* Mobile backdrop */}
                    <div
                      className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                      onClick={() => setShowNotifications(false)}
                    />

                    <div className="fixed md:absolute right-0 top-0 md:top-full md:mt-2 w-full md:w-96 bg-[#0b3d1e] border border-white/10 md:rounded-2xl shadow-2xl z-50 max-h-screen md:max-h-[32rem] flex flex-col overflow-hidden">

                      {/* Panel header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium tracking-[2px] uppercase text-white/30">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#d4840a]/20 border border-[#d4840a]/30 text-[#f0a830] text-[9px] font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-[11px] text-[#f0a830] hover:text-[#d4840a] font-medium transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="md:hidden p-1.5 rounded-full hover:bg-white/8 text-white/40 hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* List */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/8 flex items-center justify-center mb-3">
                              <Bell className="w-6 h-6 text-white/20" />
                            </div>
                            <p className="text-white/50 text-sm font-medium">No notifications</p>
                            <p className="text-white/25 text-xs mt-1">You're all caught up!</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => openNotificationDetails(notif)}
                              className={`group flex gap-3 px-5 py-4 border-b border-white/6 cursor-pointer transition-all duration-200
                                ${!notif.is_read
                                  ? 'bg-[#2e8b57]/10 hover:bg-[#2e8b57]/15'
                                  : 'hover:bg-white/4'
                                }`}
                            >
                              {/* Icon bubble */}
                              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                                {getNotificationIcon(notif.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                  <p className="text-sm font-semibold text-white/85 truncate">{notif.title}</p>
                                  {!notif.is_read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4840a] shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <p className="text-xs text-white/40 line-clamp-2 mb-2">{notif.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-white/25">{formatTime(notif.created_at)}</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${getPriorityStyle(notif.priority)}`}>
                                    {notif.priority}
                                  </span>
                                </div>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/70 shrink-0 self-start"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* About Us */}
              <button
                onClick={() => navigate('/user/about-us')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d4840a] hover:bg-[#f0a830] text-white text-xs font-semibold tracking-wide transition-all duration-200 border border-[#d4840a]/50 shadow-lg shadow-[#d4840a]/20"
              >
                <span className="hidden sm:inline">About Us</span>
                <span className="sm:hidden">About</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── NOTIFICATION DETAIL MODAL ── */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
          <div className="bg-[#0b3d1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="sticky top-0 bg-[#0b3d1e] border-b border-white/8 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <h2 className="text-base font-semibold text-white/90">{selectedNotification.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/70 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {/* Priority + time */}
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-[10px] px-3 py-1 rounded-full border font-semibold uppercase tracking-widest ${getPriorityStyle(selectedNotification.priority)}`}>
                  {selectedNotification.priority}
                </span>
                <span className="text-xs text-white/30">
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                {selectedNotification.description}
              </p>

              {/* Metadata */}
              {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                <div className="bg-white/4 border border-white/8 rounded-xl p-4 mb-6">
                  <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/30 mb-3">
                    Additional Details
                  </p>
                  <div className="flex flex-col gap-1">
                    {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start py-2 border-b border-white/6 last:border-0">
                        <span className="text-xs text-white/40 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-white/80 font-medium text-right ml-4">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!selectedNotification.is_read && (
                  <button
                    onClick={() => {
                      markAsRead(selectedNotification.id);
                      setSelectedNotification({ ...selectedNotification, is_read: true });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e8b57]/20 hover:bg-[#2e8b57]/30 border border-[#2e8b57]/30 text-emerald-400 text-sm font-medium transition-all duration-200"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => { deleteNotification(selectedNotification.id); setSelectedNotification(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-sm font-medium transition-all duration-200"
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

export default UserNavbar;
