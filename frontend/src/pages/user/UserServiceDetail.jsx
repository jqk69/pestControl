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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BugAntIcon,
  BuildingOfficeIcon,
  InformationCircleIcon
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
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

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
  const [showMapTip, setShowMapTip] = useState(true);

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
          setShowMapTip(false);
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
        setShowMapTip(false);
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
      setShowMapTip(true);
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
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

  const { name, category, service_type, technicians_needed, price, description, pest_type } = service;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />
      
      <motion.div
        className="relative z-10 p-6 max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="relative z-10"
            >
              <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {name}
            </motion.h1>
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                {category}
              </span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                {service_type}
              </span>
              {pest_type && (
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/30 flex items-center gap-2">
                  <BugAntIcon className="w-4 h-4" />
                  {pest_type}
                </span>
              )}
            </motion.div>
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
                <p className="text-xs text-gray-400 mt-1">Professional experts</p>
              </NeonCard>
              
              <NeonCard className="p-6 text-center" color="blue">
                <CurrencyDollarIcon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-1">Price</h3>
                <p className="text-2xl font-bold text-blue-400">₹{price}</p>
                <p className="text-xs text-gray-400 mt-1">Fixed rate</p>
              </NeonCard>
              
              <NeonCard className="p-6 text-center" color="purple">
                <ClockIcon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-1">Duration</h3>
                <p className="text-2xl font-bold text-purple-400">{service.duration_minutes || 60} min</p>
                <p className="text-xs text-gray-400 mt-1">Estimated time</p>
              </NeonCard>
            </div>

            {/* Service Description */}
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-emerald-400" />
                Service Description
              </h2>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            </GlassCard>

            {/* Map Section */}
            <GlassCard className="p-6 relative">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-emerald-400" />
                Select Service Location
              </h2>
              
              <AnimatePresence>
                {showMapTip && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-16 right-6 z-10 max-w-xs"
                  >
                    <div className="bg-blue-500/20 text-blue-300 p-4 rounded-xl border border-blue-500/30 flex items-start gap-3">
                      <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">Click on the map or use the search box to select your service location</p>
                        <button 
                          className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                          onClick={() => setShowMapTip(false)}
                        >
                          Got it
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div
                id="map"
                className="w-full h-96 rounded-xl border border-white/20 shadow-lg"
                aria-label="Map to select service location"
              />
              
              <div className="mt-4 flex justify-end">
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
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="bookingDate"
                      type="date"
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Time
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="bookingTime"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      required
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time} className="bg-gray-800">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
                    Special Requirements
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="requirements"
                      rows={4}
                      placeholder="Any special instructions or requirements..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>

                {/* Location Confirmation */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-medium">Service Location</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {markerRef.current 
                      ? `Location selected at coordinates: ${markerRef.current.getLatLng().lat.toFixed(6)}, ${markerRef.current.getLatLng().lng.toFixed(6)}`
                      : 'Please select a location on the map above'
                    }
                  </p>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-white">Total Amount</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-400">₹{price}</span>
                      <p className="text-xs text-gray-400">Includes all taxes</p>
                    </div>
                  </div>
                  
                  <AnimatedButton
                    type="submit"
                    variant="neon"
                    size="lg"
                    loading={isBooking}
                    disabled={isBooking || !markerRef.current}
                    icon={!isBooking && <ArrowRightIcon className="w-5 h-5" />}
                    className="w-full"
                  >
                    {isBooking ? 'Processing...' : 'Proceed to Payment'}
                  </AnimatedButton>
                </div>
              </form>

              {/* Service Guarantee */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-white font-medium">Service Guarantee</h3>
                </div>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Professional, certified technicians</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>100% satisfaction guarantee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Eco-friendly solutions available</span>
                  </li>
                </ul>
              </div>
            </NeonCard>
          </motion.div>
        </div>

        {/* Service Process */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-emerald-400" />
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  step: 1, 
                  title: 'Book', 
                  description: 'Select your service and preferred time',
                  icon: CalendarDaysIcon,
                  color: 'emerald'
                },
                { 
                  step: 2, 
                  title: 'Confirm', 
                  description: 'Complete payment to confirm your booking',
                  icon: CheckCircleIcon,
                  color: 'blue'
                },
                { 
                  step: 3, 
                  title: 'Service', 
                  description: 'Our technicians arrive and perform the service',
                  icon: ShieldCheckIcon,
                  color: 'purple'
                },
                { 
                  step: 4, 
                  title: 'Follow-up', 
                  description: 'Rate our service and provide feedback',
                  icon: SparklesIcon,
                  color: 'orange'
                }
              ].map((step) => (
                <div key={step.step} className="relative">
                  {step.step < 4 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent -z-10" />
                  )}
                  <div className={`p-6 bg-${step.color}-500/10 rounded-xl border border-${step.color}-500/30 h-full`}>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                      <step.icon className={`w-6 h-6 text-${step.color}-400`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.step}. {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <InformationCircleIcon className="w-6 h-6 text-emerald-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  question: 'How long does the service take?',
                  answer: `This ${name.toLowerCase()} service typically takes ${service.duration_minutes || 60} minutes, but may vary depending on the size of the area and severity of the infestation.`
                },
                {
                  question: 'Are the products used safe for children and pets?',
                  answer: 'Yes, we use eco-friendly products that are safe for children and pets. However, we recommend keeping them away from treated areas until dry.'
                },
                {
                  question: 'Do I need to prepare my home before the service?',
                  answer: 'We recommend removing any clutter from the areas to be treated, covering food items, and ensuring easy access to all areas requiring treatment.'
                },
                {
                  question: 'What happens if it rains on the day of outdoor service?',
                  answer: 'In case of rain, we may reschedule outdoor services to ensure effectiveness. Indoor services can proceed as planned.'
                }
              ].map((faq, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-400 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA Section */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-8 text-center" color="blue">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Book Your Service?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Complete your booking now and take the first step towards a pest-free environment
            </p>
            <AnimatedButton
              variant="neon"
              size="lg"
              onClick={() => document.getElementById('bookingDate').focus()}
              icon={<ArrowRightIcon className="w-5 h-5" />}
            >
              Book Now
            </AnimatedButton>
          </NeonCard>
        </motion.div>
      </motion.div>
    </div>
  );
}