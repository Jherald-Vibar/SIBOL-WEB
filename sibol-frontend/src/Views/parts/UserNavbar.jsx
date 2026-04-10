import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, Info, AlertCircle, Droplet, CheckCircle, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/logo-left.png'
import axiosClient from '../axios'
import echo from '../echo'

const UserNavbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const notificationRef = useRef(null);
  const channelRef = useRef(null);

  // ── Helper: prepend new notification without duplicates ──
  const addNotification = (notif) => {
    setNotifications(prev =>
      prev.some(n => n.id === notif.id) ? prev : [notif, ...prev]
    );
  };

  // ── Fetch all notifications from REST API ──
  const fetchNotifications = async () => {
    try {
      const response = await axiosClient.get('/notifications');
      setNotifications(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // ── Subscribe to Echo channel ──
  const subscribeToChannel = (userId) => {
    const channelName = `notifications.${userId}`;

    // Leave existing channel if any
    if (channelRef.current) {
      echo.leave(channelName);
      channelRef.current = null;
    }

    const channel = echo.private(channelName);
    channelRef.current = channel;

    channel
      .listen('.notification.created', (data) => {
        const notif = data.notification;
        if (notif) addNotification(notif);
      })
      .subscribed(() => {
        setWsConnected(true);
        setIsReconnecting(false);
        console.log(`[Echo] Subscribed to private channel: ${channelName}`);
      })
      .error((error) => {
        setWsConnected(false);
        setIsReconnecting(false);
        console.error('[Echo] Channel subscription error:', error);
      });

    return channelName;
  };

  // ── Reconnect handler ──
  const handleReconnect = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setIsReconnecting(true);
    setWsConnected(false);

    // Re-fetch data too
    await fetchNotifications();
    subscribeToChannel(userId);
  };

  // ── Initial fetch on mount ──
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ── WebSocket subscription via Laravel Echo ──
  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      console.warn('UserNavbar: userId not found in localStorage. WebSocket subscription skipped.');
      return;
    }

    const channelName = subscribeToChannel(userId);

    return () => {
      echo.leave(channelName);
      channelRef.current = null;
      setWsConnected(false);
      console.log(`[Echo] Left channel: ${channelName}`);
    };
  }, []);

  // ── Close panel on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Derived state ──
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── API actions ──
  const markAsRead = async (id) => {
    try {
      await axiosClient.post(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (e) {
      console.error('markAsRead error:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('markAllAsRead error:', e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) setSelectedNotification(null);
    } catch (e) {
      console.error('deleteNotification error:', e);
    }
  };

  const openNotificationDetails = (notif) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  // ── Icon helpers ──
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'soil_moisture':     return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'irrigation':        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'crop_alert':
      case 'garden_alert':      return <Info className="w-4 h-4 text-sky-400" />;
      case 'disease_detection': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'nutrient_alert':    return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'ph_alert':
      case 'temperature':       return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:                  return <Bell className="w-4 h-4 text-white/40" />;
    }
  };

  const getIconBubbleStyle = (type, isRead) => {
    if (isRead) return 'bg-white/4 border-white/6';
    switch (type) {
      case 'disease_detection': return 'bg-red-500/15 border-red-500/30';
      case 'nutrient_alert':    return 'bg-orange-500/15 border-orange-500/30';
      case 'ph_alert':
      case 'temperature':       return 'bg-yellow-500/15 border-yellow-500/30';
      case 'soil_moisture':     return 'bg-blue-500/15 border-blue-500/30';
      case 'irrigation':        return 'bg-emerald-500/15 border-emerald-500/30';
      default:                  return 'bg-white/6 border-white/8';
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
    const diff  = Date.now() - new Date(dateString);
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── NAVBAR ── */}
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
            <div className="flex items-center gap-2">

              {/* WebSocket status dot (small, subtle) */}
              <span
                title={wsConnected ? 'Live updates connected' : 'Live updates disconnected'}
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${wsConnected ? 'bg-emerald-400' : 'bg-white/20'}`}
              />

              {/* Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10 transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#d4840a] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
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
                          {/* Live indicator pill — shown when connected */}
                          {wsConnected && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[9px] text-emerald-400 font-medium">Live</span>
                            </span>
                          )}
                          {/* Disconnected + reload button — shown when not connected */}
                          {!wsConnected && (
                            <span className="flex items-center gap-1.5">
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/6 border border-white/10">
                                <span className="w-1 h-1 rounded-full bg-white/25" />
                                <span className="text-[9px] text-white/30 font-medium">Not live</span>
                              </span>
                              <button
                                onClick={handleReconnect}
                                disabled={isReconnecting}
                                title="Reconnect"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/6 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-white/35 hover:text-emerald-400 text-[9px] font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <RotateCcw className={`w-2.5 h-2.5 ${isReconnecting ? 'animate-spin' : ''}`} />
                                {isReconnecting ? 'Connecting…' : 'Reload'}
                              </button>
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

                      {/* Notification list */}
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
                              className={`group flex gap-3 py-4 border-b border-white/6 cursor-pointer transition-all duration-200
                                ${!notif.is_read
                                  ? 'pl-4 pr-5 border-l-[3px] border-l-[#d4840a] bg-[#d4840a]/10 hover:bg-[#d4840a]/15'
                                  : 'pl-5 pr-5 border-l-[3px] border-l-[#1d6035] bg-transparent hover:bg-white/4'
                                }`}
                            >
                              {/* Icon bubble */}
                              <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-lg border flex items-center justify-center ${getIconBubbleStyle(notif.type, notif.is_read)}`}>
                                {getNotificationIcon(notif.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <p className={`text-sm truncate ${!notif.is_read ? 'font-bold text-white' : 'font-normal text-white/45'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.is_read ? (
                                    <span className="text-[9px] bg-[#d4840a] text-white px-1.5 py-0.5 rounded-full font-bold shrink-0 tracking-wide">
                                      UNREAD
                                    </span>
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-white/20 shrink-0" />
                                  )}
                                </div>
                                <p className={`text-xs line-clamp-2 mb-2 ${!notif.is_read ? 'text-white/60' : 'text-white/20'}`}>
                                  {notif.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] ${!notif.is_read ? 'text-white/35' : 'text-white/18'}`}>
                                    {formatTime(notif.created_at)}
                                  </span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${getPriorityStyle(notif.priority)}`}>
                                    {notif.priority}
                                  </span>
                                </div>
                              </div>

                              {/* Delete button */}
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
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getIconBubbleStyle(selectedNotification.type, selectedNotification.is_read)}`}>
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
