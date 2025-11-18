import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'

const UserNavbar = () => {
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
    <div className="max-w-screen px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex flex-row items-center justify-between">

        {/* Logo/Title Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">🌱</span>
          </div>
          <span className="text-gray-900 font-bold text-xl hidden sm:block">SIBOL</span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown - Facebook Style */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group relative ${
                          !notif.read ? 'bg-green-50/30' : ''
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-xl">
                              {getNotificationIcon(notif.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className={`font-semibold text-sm leading-tight ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notif.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-green-600 font-medium">{notif.time}</span>
                                  {!notif.read && (
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
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
                                <X className="w-4 h-4 text-gray-500" />
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
                  <div className="px-4 py-3 border-t border-gray-200 text-center bg-gray-50">
                    <button className="text-sm text-green-600 hover:text-green-700 font-semibold hover:underline">
                      See all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* About Us Button */}
          <button
            className="rounded-lg px-6 py-2.5 text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            About Us
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserNavbar
