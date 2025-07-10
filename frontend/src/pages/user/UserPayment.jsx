import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserPayment() {
  const { id: bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const navigate = useNavigate();
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

  useEffect(() => {
    const loadScript = async () => {
      try {
        if (window.Razorpay) {
          setScriptLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          setScriptLoaded(true);
        };
        script.onerror = () => {
          console.error("Razorpay script failed to load");
          setScriptLoaded(false);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error("Error loading Razorpay script:", err);
        setScriptLoaded(false);
      }
    };

    loadScript();

    return () => {
      const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (razorpayScript) {
        document.body.removeChild(razorpayScript);
      }
    };
  }, []);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          toast.error('Please login to continue');
          navigate('/login');
          return;
        }

        const res = await axios.get(`http://127.0.0.1:5000/user/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookingDetails(res.data);
        
        if (res.data.status !== 'pending') {
        }
      } catch (err) {
        console.error("Failed to fetch booking", err);
        toast.error(err.response?.data?.message || 'Failed to load booking details');
        setTimeout(() => navigate('/user/service-history'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.warning('Payment gateway is still loading. Please wait a moment.');
      return;
    }

    if (!bookingDetails) {
      toast.error('Booking details not available');
      return;
    }

    if (!rpzkey) {
      toast.error('Payment configuration error. Please contact support.');
      return;
    }

    try {
      setProcessingPayment(true);
      const token = sessionStorage.getItem('token');
      const { amount } = bookingDetails;

      // Calculate the total amount with tax
      const taxAmount = amount * 0.18;
      const totalAmount = amount + taxAmount;

      const options = {
        key: rpzkey,
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: "INR",
        name: "Pestilee Services",
        description: `Payment for Service Booking #${bookingId}`,
        image: "https://via.placeholder.com/150x150?text=Pestilee",
        handler: async function (response) {
          try {
            await axios.post(
              "http://127.0.0.1:5000/payment/verify",
              {
                booking_id: bookingId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalAmount
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success('Payment successful!');
            navigate("/user/service-history");
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: sessionStorage.getItem('username') || '',
          email: bookingDetails.user_email || '',
          contact: bookingDetails.user_phone || ''
        },
        notes: {
          booking_id: bookingId,
          service_name: bookingDetails.service_name
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Error initiating payment:", err);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

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

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCardIcon },
    { id: 'upi', name: 'UPI', icon: QrCodeIcon },
    { id: 'netbanking', name: 'Net Banking', icon: GlobeAltIcon },
    { id: 'wallet', name: 'Wallet', icon: BanknotesIcon },
  ];

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
          <p className="text-white text-xl">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Booking Not Found</h2>
          <p className="text-gray-300 mb-6">The booking you're looking for doesn't exist or has been processed.</p>
          <AnimatedButton
            variant="primary"
            onClick={() => navigate('/user/service-history')}
            icon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            View Service History
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  // Calculate amounts
  const baseAmount = parseFloat(bookingDetails.amount || 0);
  const taxAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + taxAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />
      
      <div
        className="relative z-10 p-6 max-w-6xl mx-auto space-y-8"
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
              <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Secure Checkout
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Complete your payment for premium pest control service
            </motion.p>
            
            {/* Payment Progress */}
            <motion.div 
              className="flex justify-center items-center gap-4 max-w-md mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex-1 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center mb-2">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <span className="text-sm text-emerald-400">Service Booked</span>
              </div>
              <div className="w-16 h-0.5 bg-emerald-700"></div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2">
                  <CreditCardIcon className="w-6 h-6" />
                </div>
                <span className="text-sm text-emerald-400">Payment</span>
              </div>
              <div className="w-16 h-0.5 bg-white/20"></div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 text-gray-400 flex items-center justify-center mb-2">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <span className="text-sm text-gray-400">Confirmation</span>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Service Details - 3 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <NeonCard className="p-6" color="emerald">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                Service Details
              </h2>
              
              <div className="space-y-6">
                {/* Service Info */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                      <ShieldCheckIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-xl">{bookingDetails.service_name || 'Pest Control Service'}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Booking #{bookingId}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <CalendarDaysIcon className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Date & Time</p>
                        <p className="text-white">
                          {bookingDetails.booking_date ? new Date(bookingDetails.booking_date).toLocaleString() : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Customer</p>
                        <p className="text-white">
                          {sessionStorage.getItem('username') || 'Customer'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Duration</p>
                        <p className="text-white">
                          {bookingDetails.duration_minutes || 60} minutes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white">
                          {bookingDetails.location_lat && bookingDetails.location_lng 
                            ? 'Selected on map' 
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Service Description */}
                {bookingDetails.description && (
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                      Service Description
                    </h3>
                    <p className="text-gray-300 text-sm">{bookingDetails.description}</p>
                  </div>
                )}
                
                {/* Special Requirements */}
                {bookingDetails.requirements && (
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                      Special Requirements
                    </h3>
                    <p className="text-gray-300 text-sm">{bookingDetails.requirements}</p>
                  </div>
                )}
                
                {/* Cancellation Policy */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                    Cancellation Policy
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Free cancellation up to 24 hours before the scheduled service. 
                    Cancellations within 24 hours may incur a 50% charge.
                  </p>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          {/* Payment Summary - 2 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <NeonCard className="p-6 sticky top-6" color="blue">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
                Payment Summary
              </h2>
              
              <div className="space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3 p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Service Fee</span>
                    <span className="text-white">₹{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tax (18% GST)</span>
                    <span className="text-white">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-400">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">
                      Inclusive of all taxes
                    </p>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {paymentMethods.map((method) => (
                      <motion.div
                        key={method.id}
                        className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'bg-blue-500/20 border-blue-500/40'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <method.icon className={`w-8 h-8 mb-2 ${
                          selectedPaymentMethod === method.id ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm ${
                          selectedPaymentMethod === method.id ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                          {method.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    All payment methods are processed securely through Razorpay
                  </p>
                </div>
                
                {/* Payment Button */}
                <AnimatedButton
                  variant="neon"
                  size="lg"
                  onClick={handlePayment}
                  loading={processingPayment || !scriptLoaded}
                  disabled={processingPayment || !scriptLoaded}
                  icon={!processingPayment && scriptLoaded && <ArrowRightIcon className="w-5 h-5" />}
                  className="w-full"
                  color="blue"
                >
                  {processingPayment ? 'Processing...' : !scriptLoaded ? 'Loading Payment...' : 'Pay Now'}
                </AnimatedButton>
                
                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-col items-center text-center">
                    <LockClosedIcon className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs text-gray-400">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <ShieldCheckIcon className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs text-gray-400">Data Protection</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs text-gray-400">Money-Back Guarantee</span>
                  </div>
                </div>
                
                {/* Back Button */}
                <div className="text-center">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/user/service-history')}
                    icon={<ArrowLeftIcon className="w-4 h-4" />}
                  >
                    Back to Service History
                  </AnimatedButton>
                </div>
              </div>
            </NeonCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}