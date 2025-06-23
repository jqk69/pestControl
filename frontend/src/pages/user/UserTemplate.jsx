import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  BellIcon, 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon,
  SparklesIcon,
  HomeIcon,
  CogIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard } from '../../components/ui/GlassCard';

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

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const menuItems = [
    { name: 'Dashboard', path: 'dashboard', icon: HomeIcon },
    { name: 'Profile', path: 'profile', icon: UserIcon },
  ];

  const serviceItems = [
    { name: 'Book New Service', path: 'services', icon: ShieldCheckIcon },
    { name: 'Service History', path: 'service-history', icon: ClockIcon },
  ];

  const storeItems = [
    { name: 'Browse Products', path: 'store', icon: BuildingStorefrontIcon },
    { name: 'My Cart', path: 'cart', icon: ShoppingCartIcon },
    { name: 'My Orders', path: 'orders', icon: ClockIcon },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              background: `linear-gradient(45deg, #10b981, #06b6d4)`,
              width: 200 + i * 100,
              height: 200 + i * 100,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-white" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* Sidebar - Fixed positioning for mobile, relative for desktop */}
      <motion.div
        variants={sidebarVariants}
        animate={mobileMenuOpen ? 'open' : 'closed'}
        className="fixed inset-y-0 left-0 w-80 lg:relative lg:translate-x-0 z-40 lg:block"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ display: 'block' }} // Force display
      >
        <GlassCard className="h-full p-6 rounded-none lg:rounded-r-3xl border-l-0">
          <div className="flex items-center justify-between mb-8 mt-5">
            <motion.h1
              className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent cursor-pointer flex items-center gap-2"
              onClick={(e) => handleRedirect(e, 'dashboard')}
              whileHover={{ scale: 1.05 }}
            >
              <SparklesIcon className="w-8 h-8 text-emerald-400" />
              Pestilee
            </motion.h1>
          </div>

          <h2 className="text-lg font-semibold mb-6 text-gray-300">Dashboard</h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <motion.a
                key={item.name}
                href="#"
                className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white group"
                onClick={(e) => handleRedirect(e, item.path)}
                whileHover={{ x: 5 }}
              >
                <item.icon className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
                <span>{item.name}</span>
              </motion.a>
            ))}

            {/* Services Dropdown */}
            <div className="relative">
              <motion.a
                href="#"
                className={`flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white ${
                  servicesOpen ? 'bg-white/10 text-white' : ''
                }`}
                onClick={toggleServices}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Services</span>
                </div>
                <motion.div
                  animate={{ rotate: servicesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.div>
              </motion.a>
              
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 mt-2 space-y-1 overflow-hidden"
                  >
                    {serviceItems.map((item) => (
                      <motion.a
                        key={item.name}
                        href="#"
                        className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-300 text-sm text-gray-400 hover:text-emerald-400"
                        onClick={(e) => handleRedirect(e, item.path)}
                        whileHover={{ x: 5 }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Store Dropdown */}
            <div className="relative">
              <motion.a
                href="#"
                className={`flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white ${
                  storeOpen ? 'bg-white/10 text-white' : ''
                }`}
                onClick={toggleStore}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3">
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  <span>Store</span>
                </div>
                <motion.div
                  animate={{ rotate: storeOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.div>
              </motion.a>
              
              <AnimatePresence>
                {storeOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 mt-2 space-y-1 overflow-hidden"
                  >
                    {storeItems.map((item) => (
                      <motion.a
                        key={item.name}
                        href="#"
                        className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-300 text-sm text-gray-400 hover:text-emerald-400"
                        onClick={(e) => handleRedirect(e, item.path)}
                        whileHover={{ x: 5 }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.a
              href="#"
              className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white group"
              onClick={(e) => handleRedirect(e, 'other')}
              whileHover={{ x: 5 }}
            >
              <CogIcon className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              <span>Other</span>
            </motion.a>

            <motion.a
              href="#"
              className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-red-400 hover:text-red-300 group mt-8"
              onClick={handleLogout}
              whileHover={{ x: 5 }}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Log Out</span>
            </motion.a>
          </nav>
        </GlassCard>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30">
          <GlassCard className="m-4 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.h2
                  className="text-xl font-semibold cursor-pointer text-white hover:text-emerald-400 transition-colors"
                  onClick={(e) => handleRedirect(e, 'dashboard')}
                  whileHover={{ scale: 1.05 }}
                >
                  Dashboard
                </motion.h2>
              </div>

              <div className="flex items-center space-x-6">
                {/* Navigation Links */}
                <div className="hidden md:flex space-x-6">
                  {[
                    { name: 'Store', path: 'store' },
                    { name: 'Services', path: 'services' },
                  ].map((item) => (
                    <motion.a
                      key={item.name}
                      href="#"
                      className="text-gray-300 hover:text-emerald-400 transition-colors font-medium"
                      onClick={(e) => handleRedirect(e, item.path)}
                      whileHover={{ scale: 1.05 }}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                  <motion.a
                    href="#"
                    className="relative text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={(e) => handleRedirect(e, 'cart')}
                    whileHover={{ scale: 1.1 }}
                  >
                    <ShoppingCartIcon className="w-6 h-6" />
                  </motion.a>
                </div>

                {/* Notification Icon */}
                <div className="relative">
                  <motion.button
                    className="relative text-gray-300 hover:text-emerald-400 focus:outline-none transition-colors"
                    onClick={toggleNotifications}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>
                  
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        className="absolute right-0 mt-2 w-80 z-20"
                      >
                        <GlassCard className="max-h-80 overflow-hidden">
                          <div className="p-4 border-b border-white/20 bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                            <h3 className="font-semibold text-white">Notifications</h3>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {loadingNotifications ? (
                              <div className="p-4 text-center text-gray-400">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-400 border-t-transparent mx-auto"></div>
                              </div>
                            ) : notifications.length > 0 ? (
                              notifications.map((notif) => (
                                <motion.div
                                  key={notif.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex justify-between items-start p-4 hover:bg-white/5 border-b border-white/10 transition-colors"
                                >
                                  <span className="flex-1 pr-2 text-gray-200 text-sm">{notif.message}</span>
                                  {!notif.is_seen && (
                                    <motion.button 
                                      className="text-red-400 hover:text-red-300 text-xs" 
                                      onClick={() => markAsSeen(notif.id)} 
                                      title="Mark as seen"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      ✕
                                    </motion.button>
                                  )}
                                </motion.div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-400">No new notifications</div>
                            )}
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative">
                  <motion.div 
                    className="flex items-center space-x-3 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-gray-200 font-medium hidden sm:block">{username}</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassCard>
        </header>

        {/* Page Content */}
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}