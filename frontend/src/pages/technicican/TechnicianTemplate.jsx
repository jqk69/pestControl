import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function TechnicianTemplate() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [servicesOpen, setServicesOpen] = useState(false);

  const toggleServices = () => setServicesOpen(!servicesOpen);

  const handleRedirect = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  

  // Optional: You can replace this with real notifications later
  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/technician/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        console.log("Fetched notifications:", data.notifications);

        
      } else {
        console.error("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  fetchNotifications();
}, []);


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white text-black p-6 font-bold">
        <h1 className="text-5xl font-bold mb-8 mt-5">Pestilee</h1>
        <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
        <nav className="space-y-3">
          <a href="#" onClick={(e) => handleRedirect(e, 'dashboard')} className="block py-2 px-3 rounded hover:bg-gray-100 transition">Home</a>
          <a href="#" onClick={(e) => handleRedirect(e, 'leave-management')} className="block py-2 px-3 rounded hover:bg-gray-100 transition">Account</a>

          {/* Services Dropdown */}
          <div className="relative">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); toggleServices(); }}
              className={`flex items-center justify-between py-2 px-3 rounded hover:bg-gray-100 transition ${servicesOpen ? 'bg-gray-100' : ''}`}
            >
              Services
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            {servicesOpen && (
              <div className="ml-4 mt-1 space-y-2">
                <a
                  href="#"
                  onClick={(e) => handleRedirect(e, 'assigned')}
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                >
                  Assigned Services
                </a>
                <a
                  href="#"
                  onClick={(e) => handleRedirect(e, 'history')}
                  className="block py-2 px-3 rounded hover:bg-gray-100 transition text-sm font-medium"
                >
                  Service History
                </a>
              </div>
            )}
          </div>

          <a href="#" onClick={handleLogout} className="block py-2 px-3 rounded hover:bg-gray-100 transition">Log Out</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto max-h-screen">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Title */}
            <div className="text-2xl font-bold">Technician Dashboard</div>

            {/* Right: Nav Items */}
            <div className="flex items-center space-x-6">
              {/* Optional top links (can link to store or other pages) */}
              <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
                <a href="#" className="hover:text-gray-900">Store</a>
                <a href="#" className="hover:text-gray-900">Services</a>
                <a href="#" className="hover:text-gray-900">Profile</a>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="text-gray-500 hover:text-gray-700 focus:outline-none" onClick={toggleNotifications}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <div className="p-4 font-semibold border-b">Notifications</div>
                    <ul className="max-h-60 overflow-y-auto">
                        {
                        notifications.length > 0 ? (
                            notifications.map((notif, idx) => (
                                
                            
                            
                            <li
                                key={idx}
                                className={`p-3 text-sm border-b ${notif.is_seen ? 'text-gray-400' : 'text-gray-700'} hover:bg-gray-100`}
                            >
                                <div className="flex justify-between items-center">
                                <span>{notif.message}</span>
                                {!notif.is_seen && (
                                    <button
                                    onClick={async () => {
                                        const token = sessionStorage.getItem("token");
                                        try {
                                        const res = await fetch(`http://localhost:5000/notifications/${notif.id}/seen`, {
                                            method: "PATCH",
                                            headers: {
                                            Authorization: `Bearer ${token}`,
                                            "Content-Type": "application/json"
                                            }
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            // Mark notification as seen in state
                                            setNotifications(prev =>
                                            prev.map(n =>
                                                n.notification_id === notif.notification_id ? { ...n, is_seen: true } : n
                                            )
                                            );
                                        }
                                        } catch (err) {
                                         console.log(err);
                                         
                                        }
                                    }}
                                    className="ml-4 text-blue-600 hover:underline text-xs"
                                    >
                                    Mark as seen
                                    </button>
                                )}
                                </div>
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
                  <img className="h-8 w-8 rounded-full object-cover" src="https://i.pravatar.cc/150?img=32" alt="User profile" />
                  <span className="ml-2 text-gray-700">{username}</span>
                  <svg className="ml-1 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
