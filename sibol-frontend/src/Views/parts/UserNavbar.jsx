import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/logo-left.png'

const UserNavbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Soil Moisture Alert",
      message: "Your garden's soil moisture is below optimal level",
      time: "5 minutes ago",
      read: false,
      type: "alert"
    },
    {
      id: 2,
      title: "Irrigation Complete",
      message: "Automated irrigation cycle completed successfully",
      time: "1 hour ago",
      read: false,
      type: "success"
    },
    {
      id: 3,
      title: "Disease Detection",
      message: "Potential leaf blight detected in tomato plants",
      time: "3 hours ago",
      read: true,
      type: "warning"
    },
    {
      id: 4,
      title: "System Update",
      message: "New AI model for pest detection is now available",
      time: "1 day ago",
      read: true,
      type: "info"
    },
    {
      id: 5,
      title: "Temperature Warning",
      message: "Temperature exceeds optimal range for your crops",
      time: "2 days ago",
      read: true,
      type: "alert"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'alert':
        return '🚨';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="max-w-screen px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100">
      <div className="flex flex-row items-center justify-between">

        {/* Logo/Title Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <img src={Logo} alt="SIBOL Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-gray-900 font-bold text-lg sm:text-xl">SIBOL</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown - Mobile Responsive */}
            {showNotifications && (
              <>
                {/* Mobile: Full Screen Overlay */}
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowNotifications(false)} />

                {/* Notification Panel */}
                <div className="fixed md:absolute left-0 right-0 md:left-auto md:right-0 bottom-0 md:bottom-auto md:top-full md:mt-2 w-full md:w-96 bg-white md:rounded-xl rounded-t-3xl md:rounded-b-xl shadow-2xl border-t md:border border-gray-200 z-50 max-h-[85vh] md:max-h-[500px] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-top-2 duration-300">
                  {/* Header */}
                  <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                          >
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Mark all read</span>
                            <span className="sm:hidden">Read all</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="md:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-12 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium text-base">No notifications</p>
                        <p className="text-sm mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group relative ${
                            !notif.read ? 'bg-green-50/30' : ''
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-lg sm:text-xl">
                                {getNotificationIcon(notif.type)}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className={`font-semibold text-sm leading-tight ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notif.title}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] sm:text-xs text-green-600 font-medium">{notif.time}</span>
                                    {!notif.read && (
                                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></span>
                                    )}
                                  </div>
                                </div>

                                {/* Delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 rounded-full flex-shrink-0"
                                >
                                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 text-center bg-gray-50 flex-shrink-0">
                      <button className="text-sm text-green-600 hover:text-green-700 font-semibold hover:underline">
                        See all notifications
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* About Us Button */}
          <button
            onClick={() => navigate('/user/about-us')}
            className="rounded-lg px-3 py-2 sm:px-6 sm:py-2.5 text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">About Us</span>
            <span className="sm:hidden">About</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserNavbar
