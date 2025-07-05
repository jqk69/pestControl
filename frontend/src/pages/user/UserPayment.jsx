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
  ArrowRightIcon
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
  const navigate = useNavigate();
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

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
        
        if (res.data && res.data.bookingDetails) {
          setBookingDetails(res.data.bookingDetails);
          
          if (res.data.bookingDetails.status !== 'pending') {
            toast.info('This booking has already been processed');
            setTimeout(() => navigate('/user/service-history'), 2000);
          }
        } else {
          toast.error('Booking not found');
          setTimeout(() => navigate('/user/service-history'), 2000);
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
    loadRazorpayScript();
  }, [bookingId, navigate]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Razorpay SDK failed to load');
      toast.error('Payment gateway failed to load. Please try again later.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  };

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
      const { amount, user_email, user_phone } = bookingDetails;

      // Create order on server (optional step - depends on your backend)
      // const orderResponse = await axios.post(
      //   `http://127.0.0.1:5000/payment/create-order/${bookingId}`,
      //   { amount },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // const orderId = orderResponse.data.order_id;

      const options = {
        key: rpzkey,
        amount: Math.round(amount * 100), // Amount in paise
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
                amount: bookingDetails.amount
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
          email: user_email || '',
          contact: user_phone || ''
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />
      
      <motion.div
        className="relative z-10 p-6 max-w-4xl mx-auto space-y-8"
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
              Complete Your Payment
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Secure payment for your pest control service
            </motion.p>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <motion.div variants={itemVariants}>
            <NeonCard className="p-6" color="emerald">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                Service Details
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                      <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">{bookingDetails.service_name}</h3>
                      <p className="text-gray-400 text-sm">Booking #{bookingId}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Date & Time</span>
                      <span className="text-white">
                        {new Date(bookingDetails.booking_date).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className="text-yellow-400 capitalize">
                        {bookingDetails.status}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Technicians</span>
                      <span className="text-white">
                        {bookingDetails.technicians_needed || 1}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Duration</span>
                      <span className="text-white">
                        {bookingDetails.duration_minutes || 60} minutes
                      </span>
                    </div>
                  </div>
                </div>
                
                {bookingDetails.requirements && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-white font-medium mb-2">Special Requirements</h3>
                    <p className="text-gray-300 text-sm">{bookingDetails.requirements}</p>
                  </div>
                )}
              </div>
            </NeonCard>
          </motion.div>

          {/* Payment Summary */}
          <motion.div variants={itemVariants}>
            <NeonCard className="p-6" color="blue">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
                Payment Summary
              </h2>
              
              <div className="space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Service Fee</span>
                    <span className="text-white">₹{bookingDetails.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tax (18% GST)</span>
                    <span className="text-white">₹{(bookingDetails.amount * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Discount</span>
                    <span className="text-emerald-400">-₹{(bookingDetails.amount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-400">
                        ₹{(bookingDetails.amount * 1.13).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-4">Payment Methods</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { name: 'Credit Card', icon: CreditCardIcon },
                      { name: 'UPI', icon: DevicePhoneMobileIcon },
                      { name: 'Net Banking', icon: GlobeAltIcon },
                      { name: 'Wallet', icon: BanknotesIcon },
                    ].map((method, index) => (
                      <motion.div
                        key={method.name}
                        className="flex flex-col items-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <method.icon className="w-6 h-6 text-blue-400 mb-2" />
                        <span className="text-xs text-gray-300 text-center">{method.name}</span>
                      </motion.div>
                    ))}
                  </div>
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
                    <span className="text-xs text-gray-400">Satisfaction Guarantee</span>
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
      </motion.div>
    </div>
  );
}