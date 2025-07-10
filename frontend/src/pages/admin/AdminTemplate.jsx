import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon,
  SparklesIcon,
  HomeIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard } from '../../components/ui/GlassCard';

export default function AdminTemplate() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [storeOpen, setStoreOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRedirect = (e, path) => {
    e.preventDefault();
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      return !prev;
    });
  };

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get('http://127.0.0.1:5000/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          user_type: 'admin',
        }
      });

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
    { name: 'Reports', path: '/admin/reports', icon: ChartBarIcon },
    { name: 'Leave Management', path: '/admin/leave-management', icon: DocumentTextIcon },
  ];

  const serviceItems = [
    { name: 'Manage Services', path: '/admin/services', icon: ShieldCheckIcon },
    { name: 'Service History', path: '/admin/services/requests-history', icon: ClockIcon },
  ];

  const storeItems = [
    { name: 'Manage Store', path: '/admin/store', icon: BuildingStorefrontIcon },
    { name: 'Orders', path: '/admin/store/orders', icon: ClockIcon },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              background: `linear-gradient(45deg, #3b82f6, #8b5cf6)`,
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
          onClick={toggleMobileMenu}
          className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-white" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* Sidebar */}
      <motion.div
        variants={window.innerWidth < 1024 ? sidebarVariants : { open: { x: 0 } }}
        animate={window.innerWidth < 1024 ? (mobileMenuOpen ? 'open' : 'closed') : 'open'}
        className="fixed inset-y-0 left-0 w-80 lg:static lg:w-80 lg:block z-40"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <GlassCard className="h-full p-6 rounded-none lg:rounded-r-3xl border-l-0">
          <div className="flex items-center justify-between mb-8 mt-5">
            <motion.h1
              className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer flex items-center gap-2"
              onClick={(e) => handleRedirect(e, '/admin/dashboard')}
              whileHover={{ scale: 1.05 }}
            >
              <SparklesIcon className="w-8 h-8 text-blue-400" />
              Pestilee Admin
            </motion.h1>
          </div>

          <h2 className="text-lg font-semibold mb-6 text-gray-300">Admin Panel</h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <motion.a
                key={item.name}
                href="#"
                className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white group"
                onClick={(e) => handleRedirect(e, item.path)}
                whileHover={{ x: 5 }}
              >
                <item.icon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
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
                onClick={(e) => {
                  e.preventDefault();
                  setServicesOpen(!servicesOpen);
                  setStoreOpen(false);
                }}
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
                        className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-300 text-sm text-gray-400 hover:text-blue-400"
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
                onClick={(e) => {
                  e.preventDefault();
                  setStoreOpen(!storeOpen);
                  setServicesOpen(false);
                }}
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
                        className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-300 text-sm text-gray-400 hover:text-blue-400"
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
                  className="text-xl font-semibold cursor-pointer text-white hover:text-blue-400 transition-colors"
                  onClick={(e) => handleRedirect(e, '/admin/dashboard')}
                  whileHover={{ scale: 1.05 }}
                >
                  Admin Dashboard
                </motion.h2>
              </div>

              <div className="flex items-center space-x-6">
                {/* Navigation Links */}
                <div className="hidden md:flex space-x-6">
                  {[
                    { name: 'Store', path: '/admin/store' },
                    { name: 'Services', path: '/admin/services' },
                    { name: 'Users', path: '/admin/dashboard' },
                  ].map((item) => (
                    <motion.a
                      key={item.name}
                      href="#"
                      className="text-gray-300 hover:text-blue-400 transition-colors font-medium"
                      onClick={(e) => handleRedirect(e, item.path)}
                      whileHover={{ scale: 1.05 }}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                </div>

                {/* Notification Icon */}
                <div className="relative">
                  <motion.button
                    className="relative text-gray-300 hover:text-blue-400 focus:outline-none transition-colors"
                    onClick={toggleNotifications}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BellIcon className="h-6 w-6" />
                    {notifications.length > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {notifications.length}
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
                          <div className="p-4 border-b border-white/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                            <h3 className="font-semibold text-white">Admin Notifications</h3>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((notif, index) => (
                                <motion.div
                                  key={notif.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="p-4 hover:bg-white/5 border-b border-white/10 transition-colors"
                                >
                                  <span className="text-gray-200 text-sm">{notif.message}</span>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Date unavailable'}
                                  </p>
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
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                      {username ? username.charAt(0).toUpperCase() : 'A'}
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