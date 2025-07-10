import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
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
import L from 'leaflet';

// Import Leaflet marker images as assets
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const statusConfig = {
  pending: { color: 'yellow', label: 'Pending Payment' },
  confirmed: { color: 'blue', label: 'Confirmed' },
  completed: { color: 'emerald', label: 'Completed' },
};

export default function UserServiceCart() {
  const [status, setStatus] = useState('pending');
  const [allBookings, setAllBookings] = useState([]);
  const [mapPos, setMapPos] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    const result = Object.values(grouped).map((b) => ({
      ...b,
      technician_name: b.technicians.size ? Array.from(b.technicians).join(', ') : 'Not assigned',
    }));
    return result;
  }, [status, allBookings]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          navigate('/login');
          return;
        }
        const response = await axios.get('http://127.0.0.1:5000/user/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBookings(response.data.bookings || []);
        setError(null);
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch bookings';
        setError(errorMsg);
        console.error('Error fetching bookings:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

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
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/login');
        return;
      }
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
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit feedback';
      setError(errorMsg);
      console.error('Error submitting feedback:', errorMsg);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading service history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <div className="text-center">
          <GlassCard className="p-12 text-center opacity-100">
            <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-400 text-lg mb-8">{error}</p>
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              icon={<CheckCircleIcon className="w-5 h-5" />}
            >
              Go to Login
            </AnimatedButton>
          </GlassCard>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <GlassCard className="p-6 opacity-100">
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
        </div>

        {/* Status Filter */}
        <div>
          <GlassCard className="p-6 opacity-100">
            <div className="flex flex-wrap gap-3">
              {['pending', 'confirmed', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    status === s
                      ? `bg-${statusConfig[s].color}-500 text-white shadow-lg shadow-${statusConfig[s].color}-500/25`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Bookings List */}
        {allBookings.length === 0 ? (
          <div>
            <GlassCard className="p-12 text-center opacity-100">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No service bookings found</h2>
              <p className="text-gray-400 text-lg mb-8">
                You have no service bookings at the moment.
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
          </div>
        ) : filteredBookings.length === 0 ? (
          <div>
            <GlassCard className="p-12 text-center opacity-100">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No {statusConfig[status].label} services found</h2>
              <p className="text-gray-400 text-lg mb-8">
                {status === 'pending' 
                  ? 'You have no pending payments'
                  : `No ${statusConfig[status].label.toLowerCase()} services at the moment`
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
          </div>
        ) : (
          <div key={filteredBookings.length} className="space-y-6 opacity-100">
            {filteredBookings.map((booking, index) => {
              const config = statusConfig[booking.status] || statusConfig.pending;
              
              return (
                <div
                  key={booking.booking_id}
                  className="opacity-100"
                >
                  <NeonCard className="p-6 opacity-100" color={config.color}>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Modal */}
      {mapOpen && mapPos && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-4xl h-96 relative">
            <GlassCard className="h-full relative overflow-hidden opacity-100">
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
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackBookingId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-md">
            <GlassCard className="p-6 relative opacity-100">
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
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-md">
            <GlassCard className="p-6 relative opacity-100">
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
          </div>
        </div>
      )}
    </div>
  );
}