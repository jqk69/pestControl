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
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  HeartIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

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
  const [cartCount, setCartCount] = useState(0);

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

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/user/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartCount(res.data.items?.length || 0);
      } catch (err) {
        console.error('Failed to fetch cart count:', err);
      }
    };
    if (token) fetchCartCount();
  }, [token]);

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
    { name: 'Dashboard', path: 'dashboard', icon: HomeIcon, color: 'emerald' },
    { name: 'Blog', path: 'blogs', icon: DocumentTextIcon, color: 'purple' },
  ];

  const serviceItems = [
    { name: 'Book New Service', path: 'services', icon: ShieldCheckIcon, color: 'emerald' },
    { name: 'Service History', path: 'service-history', icon: ClockIcon, color: 'blue' },
  ];

  const storeItems = [
    { name: 'Browse Products', path: 'store', icon: BuildingStorefrontIcon, color: 'emerald' },
    { name: 'My Cart', path: 'cart', icon: ShoppingCartIcon, color: 'blue' },
    { name: 'My Orders', path: 'orders', icon: ClockIcon, color: 'purple' },
  ];

  const quickActions = [
    { name: 'Emergency Service', path: 'services', icon: ShieldCheckIcon, urgent: true },
    { name: 'Track Order', path: 'orders', icon: MapPinIcon },
    { name: 'Favorites', path: 'store', icon: HeartIcon },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              background: `linear-gradient(45deg, #10b981, #06b6d4, #8b5cf6)`,
              width: 150 + i * 80,
              height: 150 + i * 80,
              left: `${15 + i * 20}%`,
              top: `${5 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
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
          className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg shadow-emerald-500/10"
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={mobileMenuOpen ? 'open' : { x: 0 }}
        className="fixed inset-y-0 left-0 w-80 z-40 lg:static lg:w-80"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <GlassCard className="h-full p-6 rounded-none lg:rounded-r-3xl border-l-0">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 mt-5">
              <motion.h1
                className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent cursor-pointer flex items-center gap-2"
                onClick={(e) => handleRedirect(e, 'dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <SparklesIcon className="w-8 h-8 text-emerald-400" />
                </motion.div>
                Pestilee
              </motion.h1>
            </div>

            {/* User Welcome */}
            <motion.div 
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-white font-semibold">Welcome back!</p>
                  <p className="text-emerald-400 text-sm">{username}</p>
                </div>
              </div>
            </motion.div>

            <h2 className="text-lg font-semibold mb-6 text-gray-300">Navigation</h2>
            
            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href="#"
                  className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white group relative overflow-hidden"
                  onClick={(e) => handleRedirect(e, item.path)}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <item.icon className={`w-5 h-5 group-hover:text-${item.color}-400 transition-colors relative z-10`} />
                  <span className="relative z-10">{item.name}</span>
                  <motion.div
                    className="absolute right-4 opacity-0 group-hover:opacity-100"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <div className={`w-2 h-2 rounded-full bg-${item.color}-400`} />
                  </motion.div>
                </motion.a>
              ))}

              {/* Services Dropdown */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.a
                  href="#"
                  className={`flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white relative overflow-hidden ${
                    servicesOpen ? 'bg-white/10 text-white' : ''
                  }`}
                  onClick={toggleServices}
                  whileHover={{ x: 5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center gap-3 relative z-10">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Services</span>
                  </div>
                  <motion.div
                    animate={{ rotate: servicesOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                    className="relative z-10"
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
                      transition={{ duration: 0.3 }}
                      className="ml-4 mt-2 space-y-1 overflow-hidden"
                    >
                      {serviceItems.map((item, index) => (
                        <motion.a
                          key={item.name}
                          href="#"
                          className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-300 text-sm text-gray-400 hover:text-emerald-400 group"
                          onClick={(e) => handleRedirect(e, item.path)}
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <item.icon className={`w-4 h-4 group-hover:text-${item.color}-400 transition-colors`} />
                          <span>{item.name}</span>
                        </motion.a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Store Dropdown */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.a
                  href="#"
                  className={`flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white relative overflow-hidden ${
                    storeOpen ? 'bg-white/10 text-white' : ''
                  }`}
                  onClick={toggleStore}
                  whileHover={{ x: 5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center gap-3 relative z-10">
                    <BuildingStorefrontIcon className="w-5 h-5" />
                    <span>Store</span>
                  </div>
                  <motion.div
                    animate={{ rotate: storeOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                    className="relative z-10"
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
                      transition={{ duration: 0.3 }}
                      className="ml-4 mt-2 space-y-1 overflow-hidden"
                    >
                      {storeItems.map((item, index) => (
                        <motion.a
                          key={item.name}
                          href="#"
                          className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-300 text-sm text-gray-400 hover:text-emerald-400 group relative"
                          onClick={(e) => handleRedirect(e, item.path)}
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <item.icon className={`w-4 h-4 group-hover:text-${item.color}-400 transition-colors`} />
                          <span>{item.name}</span>
                          {item.name === 'My Cart' && cartCount > 0 && (
                            <motion.span
                              className="ml-auto bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              {cartCount}
                            </motion.span>
                          )}
                        </motion.a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.a
                href="#"
                className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white group relative overflow-hidden"
                onClick={(e) => handleRedirect(e, 'other')}
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CogIcon className="w-5 h-5 group-hover:text-orange-400 transition-colors relative z-10" />
                <span className="relative z-10">Pest Predicitons</span>
              </motion.a>

              <motion.a
                href="#"
                className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-red-400 hover:text-red-300 group mt-8 relative overflow-hidden"
                onClick={handleLogout}
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowRightOnRectangleIcon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Log Out</span>
              </motion.a>
            </nav>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-[100]" suppressHydrationWarning>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="m-4 p-4 rounded-2xl relative overflow-visible">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <motion.h2
                    className="text-xl font-semibold cursor-pointer text-white hover:text-emerald-400 transition-colors"
                    onClick={(e) => handleRedirect(e, 'dashboard')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dashboard
                  </motion.h2>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Navigation Links */}
                  <div className="hidden md:flex space-x-6">
                    {[
                      { name: 'Store', path: 'store', icon: BuildingStorefrontIcon },
                      { name: 'Services', path: 'services', icon: ShieldCheckIcon },
                      { name: 'Blog', path: 'blogs', icon: DocumentTextIcon },
                    ].map((item, index) => (
                      <motion.a
                        key={item.name}
                        href="#"
                        className="text-gray-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-2 group"
                        onClick={(e) => handleRedirect(e, item.path)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <item.icon className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                        {item.name}
                      </motion.a>
                    ))}
                  </div>

                  {/* Cart Icon with Animation */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.a
                      href="#"
                      className="relative text-gray-300 hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-white/10"
                      onClick={(e) => handleRedirect(e, 'cart')}
                    >
                      <ShoppingCartIcon className="w-6 h-6" />
                      {cartCount > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </motion.a>
                  </motion.div>

                  {/* Notification Icon */}
                  <div className="relative">
                    <motion.button
                      className="relative text-gray-300 hover:text-emerald-400 focus:outline-none transition-colors p-2 rounded-xl hover:bg-white/10"
                      onClick={toggleNotifications}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={unreadCount > 0 ? { 
                          rotate: [0, -10, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <BellIcon className="h-6 w-6" />
                      </motion.div>
                      {unreadCount > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
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
                          className="absolute right-0 mt-2 w-80 z-[9999]" // Increased z-index to 40
                        >
                          <GlassCard className="max-h-80 overflow-hidden">
                            <div className="p-4 border-b border-white/20 bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                              <h3 className="font-semibold text-white flex items-center gap-2">
                                <BellIcon className="w-5 h-5 text-emerald-400" />
                                Notifications
                                {unreadCount > 0 && (
                                  <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-1">
                                    {unreadCount}
                                  </span>
                                )}
                              </h3>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {loadingNotifications ? (
                                <div className="p-4 text-center text-gray-400">
                                  <motion.div 
                                    className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-400 border-t-transparent mx-auto"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                </div>
                              ) : notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                  <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex justify-between items-start p-4 hover:bg-white/5 border-b border-white/10 transition-colors group"
                                  >
                                    <span className="flex-1 pr-2 text-gray-200 text-sm">{notif.message}</span>
                                    {!notif.is_seen && (
                                      <motion.button 
                                        className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity" 
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
                                <div className="p-4 text-center text-gray-400">
                                  <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No new notifications</p>
                                </div>
                              )}
                            </div>
                          </GlassCard>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile */}
                  
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </header>

        {/* Page Content */}
        <main className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Outlet />
          </motion.div>
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