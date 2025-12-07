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

  const fetchNotifications = async() => {
    try {
      const response = await axiosClient.get('/notifications');
      const notificationsData = response.data.data || response.data;
      setNotifications(notificationsData);
    } catch(error) {
      console.error("Error fetching notifications:", error);
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

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

  const markAsRead = async (id) => {
    try {
      await axiosClient.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch(error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post('/notifications/mark-all-read');
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch(error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch(error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'soil_moisture':
        return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'irrigation':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'crop_alert':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'garden_alert':
        return <Info className="w-5 h-5 text-green-500" />;
      case 'disease_detection':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'nutrient_alert':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'ph_alert':
      case 'temperature':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  const openNotificationDetails = (notif) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title Section */}
            <div className="flex items-center space-x-3">
              <img src={Logo} alt="SIBOL Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-800 hidden sm:block">SIBOL</span>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown - Mobile Responsive */}
                {showNotifications && (
                  <>
                    {/* Mobile: Full Screen Overlay */}
                    <div
                      className="md:hidden fixed inset-0 bg-white/20 backdrop-blur-lg z-40"
                      onClick={() => setShowNotifications(false)}
                    />

                    {/* Notification Panel */}
                    <div className="fixed md:absolute right-0 top-0 md:top-full md:right-0 md:mt-2 w-full md:w-96 bg-white md:rounded-lg shadow-2xl z-50 max-h-screen md:max-h-[32rem] flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white md:rounded-t-lg">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="md:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No notifications</p>
                            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`group p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                                !notif.is_read ? 'bg-green-50' : ''
                              }`}
                              onClick={() => openNotificationDetails(notif)}
                            >
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notif.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800 text-sm">
                                    {notif.title}
                                  </h4>
                                  {!notif.is_read && (
                                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {notif.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">
                                    {formatTime(notif.created_at)}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(notif.priority)}`}>
                                    {notif.priority}
                                  </span>
                                </div>
                              </div>

                              {/* Delete button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 rounded-full flex-shrink-0 self-start"
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* About Us Button */}
              <button
                onClick={() => navigate('/user/about-us')}
                className="rounded-lg px-3 py-2 sm:px-6 sm:py-2.5 text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5"
              >
                <span className="hidden sm:inline">About Us</span>
                <span className="sm:hidden">About</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Details Modal with Glassy Blur Effect */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                {getNotificationIcon(selectedNotification.type)}
                <h2 className="text-xl font-bold text-gray-800">{selectedNotification.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-sm px-3 py-1 rounded-full border font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                    {selectedNotification.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedNotification.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">{selectedNotification.description}</p>
              </div>

              {/* Metadata Section */}
              {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Details</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm text-gray-800 font-semibold text-right ml-4">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 flex gap-3">
                {!selectedNotification.is_read && (
                  <button
                    onClick={() => {
                      markAsRead(selectedNotification.id);
                      setSelectedNotification({ ...selectedNotification, is_read: true });
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserNavbar
