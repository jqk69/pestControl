import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WrenchScrewdriverIcon, 
  BellIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from "axios";
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const TechnicianDashboard = () => {
  const [today, setTodayServices] = useState([]);
  const [upcoming, setUpcomingServices] = useState([]);
  const [history, setServiceHistory] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError('No authentication token found');
          return;
        }

        
        const response = await axios.get("http://127.0.0.1:5000/technician/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });


        const data = response.data;
        
        // Handle different response formats
        if (data.success !== undefined) {
          if (data.success) {
            setTodayServices(data.today_services || []);
            setUpcomingServices(data.upcoming_services || []);
            setServiceHistory(data.service_history || []);
            setAvailability(data.availability || []);
            setEarnings(data.earnings || 0);
            setNotifications(data.notifications || []);
          } else {
            setError(data.message || 'Failed to load dashboard data');
          }
        } else {
          // Direct data format
          setTodayServices(data.today_services || []);
          setUpcomingServices(data.upcoming_services || []);
          setServiceHistory(data.service_history || []);
          setAvailability(data.availability || []);
          setEarnings(data.earnings || 0);
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard", err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div
        className="relative z-10 p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            >
              <WrenchScrewdriverIcon className="w-16 h-16 mx-auto mb-4 text-orange-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              Technician Dashboard
            </h1>
            <p className="text-gray-300 text-lg">Your professional service hub</p>
          </GlassCard>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: CalendarDaysIcon, 
                label: "Today's Jobs", 
                value: `${today.length}`, 
                color: 'orange',
                description: 'Services scheduled today'
              },
              { 
                icon: ClockIcon, 
                label: 'Upcoming', 
                value: `${upcoming.length}`, 
                color: 'blue',
                description: 'Future appointments'
              },
              { 
                icon: CurrencyDollarIcon, 
                label: 'Earnings', 
                value: `₹${earnings}`, 
                color: 'emerald',
                description: 'Total earnings'
              },
              { 
                icon: BellIcon, 
                label: 'Alerts', 
                value: notifications.length, 
                color: 'purple',
                description: 'New notifications'
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <NeonCard className="p-6 text-center" color={stat.color}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.2, type: 'spring' }}
                  >
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-400`} />
                  </motion.div>
                  <h3 className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>
                    {stat.value}
                  </h3>
                  <p className="text-white font-medium">{stat.label}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.description}</p>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Services */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-orange-400" />
                Today's Services
              </h3>
              <div className="space-y-4">
                {today.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No services scheduled for today</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {today.map((item, index) => (
                      <motion.div
                        key={item.booking_id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{item.service_type || item.service_name || 'Service'}</h4>
                            <p className="text-gray-400 text-sm">
                              {item.booking_date ? new Date(item.booking_date).toLocaleTimeString() : 'Time TBD'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'confirmed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </GlassCard>

            {/* Upcoming Services */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-blue-400" />
                Upcoming Services
              </h3>
              <div className="space-y-4">
                {upcoming.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No upcoming services</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {upcoming.slice(0, 5).map((item, index) => (
                      <motion.div
                        key={item.booking_id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{item.service_type || item.service_name || 'Service'}</h4>
                            <p className="text-gray-400 text-sm">
                              {item.booking_date ? new Date(item.booking_date).toLocaleDateString() : 'Date TBD'}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            {item.status || 'scheduled'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </GlassCard>

            {/* Service History */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                Recent Completions
              </h3>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No completed services yet</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {history.slice(0, 5).map((item, index) => (
                      <motion.div
                        key={item.booking_id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{item.service_type || item.service_name || 'Service'}</h4>
                            <p className="text-gray-400 text-sm">
                              {item.booking_date ? new Date(item.booking_date).toLocaleDateString() : 'Date unknown'}
                            </p>
                          </div>
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </GlassCard>

            {/* Availability Status */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
                Availability Status
              </h3>
              <div className="space-y-4">
                {!availability?.length ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 font-medium">You're available!</p>
                    <p className="text-gray-400 text-sm">No scheduled unavailability</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availability.map((slot, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                      >
                        <p className="text-red-400 font-medium">Unavailable</p>
                        <p className="text-gray-400 text-sm">
                          {slot.start_datetime ? new Date(slot.start_datetime).toLocaleDateString() : 'Start TBD'} - {slot.end_datetime ? new Date(slot.end_datetime).toLocaleDateString() : 'End TBD'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Reason: {slot.reason || 'No reason provided'}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;