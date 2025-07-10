import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const statusConfig = {
  pending: { color: 'yellow', label: 'Pending' },
  confirmed: { color: 'blue', label: 'Confirmed' },
  in_progress: { color: 'orange', label: 'In Progress' },
  completed: { color: 'emerald', label: 'Completed' },
  cancelled: { color: 'red', label: 'Cancelled' },
};

export default function AdminCustomReq() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:5000/admin/bookings/history', {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.data.success) {
          setBookings(res.data.data);
          setFilteredBookings(res.data.data);
        } else {
          setError('Failed to fetch booking history');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Server error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.user_name.toLowerCase().includes(query) ||
        b.user_phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, bookings]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading booking history...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Data</h2>
          <p className="text-gray-300">{error}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div
        className="relative z-10 p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <DocumentTextIcon className="w-10 h-10 text-blue-400" />
                  Service Booking History
                </h1>
                <p className="text-gray-300 text-lg">Track and manage all service bookings</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Statuses</option>
                  <option value="pending" className="bg-gray-800">Pending</option>
                  <option value="confirmed" className="bg-gray-800">Confirmed</option>
                  <option value="in_progress" className="bg-gray-800">In Progress</option>
                  <option value="completed" className="bg-gray-800">Completed</option>
                  <option value="cancelled" className="bg-gray-800">Cancelled</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No bookings found</h2>
              <p className="text-gray-400 text-lg">
                {bookings.length === 0 
                  ? 'No service bookings have been made yet'
                  : 'No bookings match your search criteria'
                }
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => {
                const config = statusConfig[booking.status] || statusConfig.pending;
                
                return (
                  <motion.div
                    key={booking.booking_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <NeonCard className="p-6" color={config.color}>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Booking Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2">{booking.service_name}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                                  <span>ID: #{booking.booking_id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
                                  <span>{new Date(booking.booking_date).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <UserIcon className="w-4 h-4 text-blue-400" />
                                  <span>{booking.user_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <PhoneIcon className="w-4 h-4 text-blue-400" />
                                  <span>{booking.user_phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <span className="font-medium">Category:</span>
                                  <span>{booking.category}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <span className="font-medium">Price:</span>
                                  <span>₹{booking.price}</span>
                                </div>
                                {booking.technicians_assigned && (
                                  <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
                                    <span className="font-medium">Technicians:</span>
                                    <span>{booking.technicians_assigned}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center gap-2">
                            <ClockIcon className={`w-5 h-5 text-${config.color}-400`} />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30 capitalize`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}