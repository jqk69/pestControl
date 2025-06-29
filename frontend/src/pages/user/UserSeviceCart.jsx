import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const statusConfig = {
  pending: { color: 'yellow', label: 'Pending Payment' },
  confirmed: { color: 'blue', label: 'Confirmed' },
  completed: { color: 'emerald', label: 'Completed' },
  cancelled: { color: 'red', label: 'Cancelled' },
};

export default function UserServiceCart() {
  const [status, setStatus] = useState('pending');
  const [allBookings, setAllBookings] = useState([]);
  const [mapPos, setMapPos] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackBookingId, setFeedbackBookingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const navigate = useNavigate();

  const filteredBookings = useMemo(() => {
    const grouped = {};
    allBookings.forEach((b) => {
      if (b.status !== status) return;
      if (!grouped[b.booking_id]) {
        grouped[b.booking_id] = { ...b, technicians: new Set() };
      }
      if (b.technician_name) {
        grouped[b.booking_id].technicians.add(b.technician_name);
      }
    });

    return Object.values(grouped).map((b) => ({
      ...b,
      technician_name: b.technicians.size ? Array.from(b.technicians).join(', ') : 'Not assigned',
    }));
  }, [status, allBookings]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/user/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBookings(response.data.bookings || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  function openMap(lat, lng) {
    setMapPos({ lat, lng });
    setMapOpen(true);
  }

  function closeMap() {
    setMapOpen(false);
    setMapPos(null);
  }

  function handlePayBill(bookingId) {
    navigate(`/user/service/payment/${bookingId}`);
  }

  function handleFeedbackAction(booking) {
    if (booking.feedback) {
      setViewingFeedback(booking.feedback);
    } else {
      setFeedbackBookingId(booking.booking_id);
      setFeedbackText('');
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(
        'http://127.0.0.1:5000/user/feedback',
        {
          booking_id: feedbackBookingId,
          feedback: feedbackText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const response = await axios.get('http://127.0.0.1:5000/user/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBookings(response.data.bookings || []);
      setFeedbackBookingId(null);
      setFeedbackText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading service history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        className="relative z-10 p-6 max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <ClockIcon className="w-10 h-10 text-emerald-400" />
                  Service History
                </h1>
                <p className="text-gray-300 text-lg">Track and manage your service bookings</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Status Filter */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-wrap gap-3">
              {['pending', 'confirmed', 'completed'].map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    status === s
                      ? `bg-${statusConfig[s].color}-500 text-white shadow-lg shadow-${statusConfig[s].color}-500/25`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {statusConfig[s].label}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No {status} services found</h2>
              <p className="text-gray-400 text-lg mb-8">
                {status === 'pending' 
                  ? 'You have no pending payments'
                  : `No ${status} services at the moment`
                }
              </p>
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/user/services')}
                icon={<CheckCircleIcon className="w-5 h-5" />}
              >
                Book New Service
              </AnimatedButton>
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
                        {/* Service Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-4">{booking.service_name}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <CalendarDaysIcon className="w-4 h-4 text-emerald-400" />
                                  <span><strong>Date:</strong> {new Date(booking.booking_date).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <UserIcon className="w-4 h-4 text-emerald-400" />
                                  <span><strong>Technician:</strong> {booking.technician_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" />
                                  <span><strong>Amount:</strong> {booking.bill_amount ? `₹${booking.bill_amount}` : 'Not billed yet'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <span className="font-medium">ID:</span>
                                  <span>#{booking.booking_id}</span>
                                </div>
                                {booking.status === 'completed' && booking.feedback && (
                                  <div className="flex items-start gap-2 text-gray-300 md:col-span-2">
                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                                    <span><strong>Feedback:</strong> {booking.feedback.substring(0, 50)}...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30 capitalize`}>
                              {config.label}
                            </span>
                          </div>

                          <div className="flex flex-col gap-3">
                            {booking.location_lat && booking.location_lng && (
                              <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => openMap(booking.location_lat, booking.location_lng)}
                                icon={<MapPinIcon className="w-4 h-4" />}
                              >
                                View Location
                              </AnimatedButton>
                            )}
                            
                            {booking.status === 'pending' && (
                              <AnimatedButton
                                variant="warning"
                                size="sm"
                                onClick={() => handlePayBill(booking.booking_id)}
                                icon={<CurrencyDollarIcon className="w-4 h-4" />}
                              >
                                Pay Bill
                              </AnimatedButton>
                            )}
                            
                            {booking.status === 'completed' && (
                              <AnimatedButton
                                variant={booking.feedback ? "purple" : "blue"}
                                size="sm"
                                onClick={() => handleFeedbackAction(booking)}
                                icon={booking.feedback ? <EyeIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                              >
                                {booking.feedback ? 'View Feedback' : 'Add Feedback'}
                              </AnimatedButton>
                            )}
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
      </motion.div>

      {/* Map Modal */}
      <AnimatePresence>
        {mapOpen && mapPos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-4xl h-96 relative"
            >
              <GlassCard className="h-full relative overflow-hidden">
                <button
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white transition-colors"
                  onClick={closeMap}
                >
                  ✕
                </button>
                <MapContainer
                  center={[mapPos.lat, mapPos.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[mapPos.lat, mapPos.lng]}>
                    <Popup>Service Location</Popup>
                  </Marker>
                </MapContainer>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackBookingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 relative">
                <button
                  onClick={() => setFeedbackBookingId(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  Submit Feedback
                </h2>
                <form onSubmit={handleSubmitFeedback}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Experience</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="Share your experience with our service..."
                    />
                  </div>
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submittingFeedback}
                    disabled={submittingFeedback}
                    icon={!submittingFeedback && <CheckCircleIcon className="w-5 h-5" />}
                    className="w-full"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </AnimatedButton>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Feedback Modal */}
      <AnimatePresence>
        {viewingFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 relative">
                <button
                  onClick={() => setViewingFeedback(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-emerald-400" />
                  Your Feedback
                </h2>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                  <p className="text-gray-200 leading-relaxed">{viewingFeedback}</p>
                </div>
                <AnimatedButton
                  variant="ghost"
                  size="lg"
                  onClick={() => setViewingFeedback(null)}
                  className="w-full"
                >
                  Close
                </AnimatedButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}