import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, BellIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function UserTemplate() {
  const username = sessionStorage.getItem('username');
  const userType = sessionStorage.getItem('user_type') || 'user';
  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      setLoadingNotifications(true);
      setErrorNotifications(null);
      try {
        const res = await axios.get('http://127.0.0.1:5000/notifications/', {
          params: { user_type: userType },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch notifications';
        setErrorNotifications(errorMsg);
      } finally {
        setLoadingNotifications(false);
      }
    }
    if (token) fetchNotifications();
  }, [token, userType]);

  const unreadCount = notifications.filter((n) => !n.is_seen).length;

  const toggleNotifications = (e) => {
    e.preventDefault();
    setShowNotifications((prev) => !prev);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user_type');
    navigate('/login');
  };

  const handleRedirect = (e, path) => {
    e.preventDefault();
    navigate(`/user/${path}`);
    setMobileMenuOpen(false);
  };

  const toggleServices = (e) => {
    e.preventDefault();
    setServicesOpen((prev) => !prev);
    setStoreOpen(false);
  };

  const toggleStore = (e) => {
    e.preventDefault();
    setStoreOpen((prev) => !prev);
    setServicesOpen(false);
  };

  const markAsSeen = async (notificationId) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/notifications/${notificationId}/seen`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (err) {
      console.error('Failed to mark notification as seen:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-100" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-100" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-6 shadow-xl transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex items-center justify-between mb-8 mt-5">
          <h1
            className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 cursor-pointer"
            onClick={(e) => handleRedirect(e, 'dashboard')}
          >
            Pestilee
          </h1>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-gray-300">Dashboard</h2>
        <nav className="space-y-1">
          {[
            { name: 'Home', path: 'dashboard' },
            { name: 'Profile', path: 'profile' },
          ].map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={(e) => handleRedirect(e, item.path)}
            >
              <span>{item.name}</span>
            </a>
          ))}

          {/* Services Dropdown */}
          <div className="relative">
            <a
              href="#"
              className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors ${
                servicesOpen ? 'bg-gray-700' : ''
              }`}
              onClick={toggleServices}
            >
              <span>Services</span>
              <ChevronDownIcon
                className={`w-4 h-4 ml-2 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
              />
            </a>
            {servicesOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {[
                  { name: 'Book New Service', path: 'services' },
                  { name: 'Service History', path: 'service-history' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    onClick={(e) => handleRedirect(e, item.path)}
                  >
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Store Dropdown */}
          <div className="relative">
            <a
              href="#"
              className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors ${
                storeOpen ? 'bg-gray-700' : ''
              }`}
              onClick={toggleStore}
            >
              <span>Store</span>
              <ChevronDownIcon
                className={`w-4 h-4 ml-2 transition-transform ${storeOpen ? 'rotate-180' : ''}`}
              />
            </a>
            {storeOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {[
                  { name: 'Browse Products', path: 'store' },
                  { name: 'My Cart', path: 'cart' },
                  { name: 'My Orders', path: 'orders' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    onClick={(e) => handleRedirect(e, item.path)}
                  >
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="#"
            className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={(e) => handleRedirect(e, 'other')}
          >
            <span>Other</span>
          </a>

          <a
            href="#"
            className="flex items-center py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-red-400"
            onClick={handleLogout}
          >
            <span>Log Out</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto lg:ml-64">
        {/* Top Navbar */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h2
                className="text-xl font-semibold cursor-pointer text-gray-100 hover:text-green-400 transition-colors"
                onClick={(e) => handleRedirect(e, 'dashboard')}
              >
                Dashboard
              </h2>
            </div>

            <div className="flex items-center space-x-6">
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-6">
                {[
                  { name: 'Store', path: 'store' },
                  { name: 'Services', path: 'services' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="text-gray-300 hover:text-green-400 transition-colors"
                    onClick={(e) => handleRedirect(e, item.path)}
                  >
                    {item.name}
                  </a>
                ))}
                <a
                  href="#"
                  className="relative text-gray-300 hover:text-green-400 transition-colors"
                  onClick={(e) => handleRedirect(e, 'cart')}
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                </a>
              </div>

              {/* Notification Icon */}
              <div className="relative">
                <button
                  className="relative text-gray-300 hover:text-green-400 focus:outline-none transition-colors"
                  onClick={toggleNotifications}
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20">
                    <div
                      className="p-3 font-semibold border-b border-gray-700 bg-gradient-to-r from-green-600 to-teal-600 text-white"
                    >
                      Notifications
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      {loadingNotifications ? (
                        <li className="p-4 text-center text-gray-400">Loading...</li>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <li
                            key={notif.id}
                            className="flex justify-between items-start p-3 text-sm hover:bg-gray-700 border-b border-gray-700"
                          >
                            <span className="flex-1 pr-2 text-gray-200">{notif.message}</span>
                            {!notif.is_seen && (
                              <button className="text-red-400 hover:text-red-300 text-xs" onClick={() => markAsSeen(notif.id)} title="Mark as seen">
                                ❌
                              </button>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="p-3 text-sm text-center text-gray-400">No new notifications</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-green-500 to-teal-500">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-gray-200">{username}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}