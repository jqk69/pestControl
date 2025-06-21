import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

export default function UserTemplate() {
  const username = sessionStorage.getItem('username')
  const userType = sessionStorage.getItem('user_type') || 'user' // adjust as needed
  const token = sessionStorage.getItem('token')
  const navigate = useNavigate()
  const [servicesOpen, setServicesOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [errorNotifications, setErrorNotifications] = useState(null)

  useEffect(() => {
    async function fetchNotifications() {
      setLoadingNotifications(true)
      setErrorNotifications(null)

      try {
        const res = await axios.get('http://127.0.0.1:5000/notifications/', {
          params: { user_type: userType },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        setNotifications(res.data.notifications || [])
        console.log(res.data.notifications)
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to fetch notifications'
        setErrorNotifications(errorMsg)
      } finally {
        setLoadingNotifications(false)
      }
    }

    if (token) {
      fetchNotifications()
    }
  }, [token, userType])

  const unreadCount = notifications.filter((n) => !n.is_seen).length

  // Toggle notification popup visibility
  const toggleNotifications = (e) => {
    e.preventDefault()
    setShowNotifications((prev) => !prev)
  }

  const handleLogout = (e) => {
    e.preventDefault()
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('user_type')
    navigate('/login')
  }

  const handleRedirect = (e, path) => {
    e.preventDefault()
    navigate(`/user/${path}`)
  }

  const toggleServices = (e) => {
    e.preventDefault()
    setServicesOpen((prev) => !prev)
    setStoreOpen(false) // Close other dropdown when opening this one
  }

  const toggleStore = (e) => {
    e.preventDefault()
    setStoreOpen((prev) => !prev)
    setServicesOpen(false) // Close other dropdown when opening this one
  }
const markAsSeen = async (notificationId) => {
  try {
    await axios.patch(`http://127.0.0.1:5000/notifications/${notificationId}/seen`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Remove the notification from the state immediately
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  } catch (err) {
    console.error('Failed to mark notification as seen:', err);
  }
};



  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white text-black p-6 font-bold">
        <h1 className="font-bold mb-8 mt-5 text-5xl">Pestilee</h1>

        <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
        <nav className="space-y-3">
          <a
            href="#"
            className="block py-2 px-3 rounded hover:bg-gray-100 transition"
            onClick={(e) => handleRedirect(e, 'dashboard')}
          >
            Home
          </a>
          <a
            href="#"
            className="block py-2 px-3 rounded hover:bg-gray-100 transition"
            onClick={(e) => handleRedirect(e, 'profile')}
          >
            Profile
          </a>

          {/* Services Dropdown */}
          <div className="relative">
            <a
              href="#"
              className={`flex items-center justify-between py-2 px-3 rounded hover:bg-gray-100 transition ${
                servicesOpen ? 'bg-gray-100' : ''
              }`}
              onClick={toggleServices}
            >
              Services
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  servicesOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            {servicesOpen && (
              <div className="ml-4 mt-1 space-y-2">
                <a
                  href="#"
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                  onClick={(e) => handleRedirect(e, 'services')}
                >
                  Book New Service
                </a>
                <a
                  href="#"
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                  onClick={(e) => handleRedirect(e, 'service-history')}
                >
                  Service History
                </a>
              </div>
            )}
          </div>

          {/* Store Dropdown */}
          <div className="relative">
            <a
              href="#"
              className={`flex items-center justify-between py-2 px-3 rounded hover:bg-gray-100 transition ${
                storeOpen ? 'bg-gray-100' : ''
              }`}
              onClick={toggleStore}
            >
              Store
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  storeOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            {storeOpen && (
              <div className="ml-4 mt-1 space-y-2">
                <a
                  href="#"
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                  onClick={(e) => handleRedirect(e, 'store')}
                >
                  Browse Products
                </a>
                <a
                  href="#"
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                  onClick={(e) => handleRedirect(e, 'cart')}
                >
                  My Cart
                </a>
                <a
                  href="#"
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                  onClick={(e) => handleRedirect(e, 'orders')}
                >
                  My Orders
                </a>
              </div>
            )}
          </div>

          <a
            href="#"
            className="block py-2 px-3 rounded hover:bg-gray-100 transition"
            onClick={(e) => handleRedirect(e, 'other')}
          >
            Other
          </a>

          <a
            href="#"
            className="block py-2 px-3 rounded hover:bg-gray-100 transition"
            onClick={handleLogout}
          >
            Log Out
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4 h-15">
              <button className="text-gray-500 focus:outline-none lg:hidden">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2
                className="text-xl font-semibold text-gray-800 cursor-pointer"
                onClick={(e) => handleRedirect(e, 'dashboard')}
              >
                Dashboard
              </h2>
            </div>

            <div className="flex items-center space-x-6">
              {/* New Navigation Links */}
              <div className="flex space-x-6 text-gray-700 font-medium">
                <a
                  href="#"
                  className="hover:text-gray-900"
                  onClick={(e) => handleRedirect(e, 'store')}
                >
                  Store
                </a>
                <a
                  href="#"
                  className="hover:text-gray-900"
                  onClick={(e) => handleRedirect(e, 'services')}
                >
                  Services
                </a>
                <a
                  href="#"
                  className="hover:text-gray-900"
                  onClick={(e) => handleRedirect(e, 'cart')}
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                </a>
              </div>

              {/* Notification Icon */}
              <div className="relative">
                <button
                  className="relative text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={toggleNotifications}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* Notifications Popup */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <div className="p-4 font-semibold border-b">Notifications</div>
                      <ul className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <li
                              key={notif.id}
                              className="flex justify-between items-start p-3 text-sm text-gray-700 hover:bg-gray-100 border-b"
                            >
                              <span className="flex-1 pr-2">{notif.message}</span>
                              {!notif.is_seen && (
                                <button
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  onClick={() => markAsSeen(notif.id)}
                                  title="Mark as seen"
                                >
                                  ❌
                                </button>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="p-3 text-sm text-gray-500">No new notifications</li>
                        )}
                      </ul>
                    </div>
                  )}

              </div>
              {/* Profile */}
              <div className="relative">
                <button className="flex items-center focus:outline-none">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                  />
                  <span className="ml-2 text-gray-700">{username}</span>
                  <svg
                    className="ml-1 h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
