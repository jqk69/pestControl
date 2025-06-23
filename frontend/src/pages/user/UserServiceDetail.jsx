import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function UserServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [requirements, setRequirements] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:5000/user/service/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setService(response.data.service);
        } else {
          setError(response.data.message || 'Service not found.');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch service details.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id, navigate]);

  useEffect(() => {
    if (!mapRef.current && !loading && !error) {
      const map = L.map('map', { scrollWheelZoom: true }).setView([20.5937, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.Control.geocoder({ defaultMarkGeocode: false })
        .on('markgeocode', (e) => {
          map.setView(e.geocode.center, 14);
          if (markerRef.current) {
            markerRef.current.setLatLng(e.geocode.center).openPopup();
          } else {
            markerRef.current = L.marker(e.geocode.center)
              .addTo(map)
              .bindPopup('Selected Location')
              .openPopup();
          }
        })
        .addTo(map);

      map.on('click', (e) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng).openPopup();
        } else {
          markerRef.current = L.marker(e.latlng)
            .addTo(map)
            .bindPopup('Selected Location')
            .openPopup();
        }
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, error]);

  const removeMarker = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!markerRef.current) {
      toast.error('Please select a location on the map');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a booking date');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a booking time');
      return;
    }

    const bookingDate = new Date(`${selectedDate}T${selectedTime}:00`);
    const pad = (num) => num.toString().padStart(2, '0');
    const bookingDateTime = `${bookingDate.getFullYear()}-${pad(
      bookingDate.getMonth() + 1
    )}-${pad(bookingDate.getDate())} ${pad(bookingDate.getHours())}:${pad(
      bookingDate.getMinutes()
    )}:${pad(bookingDate.getSeconds())}`;

    const now = new Date();
    if (bookingDate < now) {
      toast.error('Booking date and time must be in the future');
      return;
    }

    const { lat, lng } = markerRef.current.getLatLng();

    try {
      setIsBooking(true);
      const res = await axios.post(
        `http://127.0.0.1:5000/user/service/${id}/book`,
        {
          lat,
          lng,
          booking_date: bookingDateTime,
          requirements,
        },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Booking created successfully!');
        navigate(`/user/service/payment/${res.data.booking_id}`);
      } else {
        toast.error(res.data.message || 'Failed to create booking');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save booking details');
      }
    } finally {
      setIsBooking(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

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
          <p className="text-white text-xl">Loading service details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Service Not Found</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => navigate('/user/services')}
          >
            Back to Services
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  const { name, category, service_type, technicians_needed, price, description } = service;

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
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
                {name}
              </h1>
              <div className="flex items-center justify-center gap-4 text-gray-300">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                  {category}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {service_type}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Service Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NeonCard className="p-6 text-center" color="emerald">
                <UserGroupIcon className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white mb-1">Technicians</h3>
                <p className="text-2xl font-bold text-emerald-400">{technicians_needed}</p>
              </NeonCard>
              
              <NeonCard className="p-6 text-center" color="blue">
                <CurrencyDollarIcon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-1">Price</h3>
                <p className="text-2xl font-bold text-blue-400">₹{price}</p>
              </NeonCard>
              
              <NeonCard className="p-6 text-center" color="purple">
                <DocumentTextIcon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-1">Description</h3>
                <p className="text-sm text-gray-300">{description}</p>
              </NeonCard>
            </div>

            {/* Map Section */}
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-emerald-400" />
                Select Service Location
              </h2>
              <div
                id="map"
                className="w-full h-96 rounded-xl border border-white/20 shadow-lg"
                aria-label="Map to select service location"
              />
              <div className="mt-4">
                <AnimatedButton
                  variant="danger"
                  size="sm"
                  onClick={removeMarker}
                  icon={<SparklesIcon className="w-4 h-4" />}
                >
                  Clear Location
                </AnimatedButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Booking Form */}
          <motion.div variants={itemVariants}>
            <NeonCard className="p-6 sticky top-6" color="emerald">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-emerald-400" />
                Book This Service
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Date
                  </label>
                  <input
                    id="bookingDate"
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Time
                  </label>
                  <select
                    id="bookingTime"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time} className="bg-gray-800">
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    id="requirements"
                    rows={4}
                    placeholder="Any special instructions or requirements..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-emerald-400">₹{price}</span>
                  </div>
                  
                  <AnimatedButton
                    type="submit"
                    variant="neon"
                    size="lg"
                    loading={isBooking}
                    disabled={isBooking}
                    icon={!isBooking && <ShieldCheckIcon className="w-5 h-5" />}
                    className="w-full"
                  >
                    {isBooking ? 'Processing...' : 'Book This Service'}
                  </AnimatedButton>
                </div>
              </form>
            </NeonCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}