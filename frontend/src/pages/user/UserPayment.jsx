import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function UserPayment() {
  const { id: bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
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
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`http://127.0.0.1:5000/user/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookingDetails(res.data);
        
        if (res.data.bookingDetails?.status !== 'pending') {
          navigate('/user/service-history');
        }
      } catch (err) {
        console.error("Failed to fetch booking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert("Razorpay is still loading. Please wait a moment and try again.");
      return;
    }

    if (!bookingDetails) {
      alert("Booking details not loaded yet.");
      return;
    }

    if (!rpzkey) {
      alert("Razorpay key is missing. Please contact support.");
      return;
    }

    try {
      const { amount, user_email, user_contact } = bookingDetails;

      const options = {
        key: rpzkey,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Pestilee Services",
        description: `Payment for Booking #${bookingId}`,
        image: "https://yourdomain.com/logo.png",
        handler: async function (response) {
          console.log("Razorpay payment response:", response);
          const token = sessionStorage.getItem("token");
          await axios.post("http://127.0.0.1:5000/payment/verify", {
            booking_id: bookingId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            amount: bookingDetails.amount
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert("Payment successful!");
          navigate("/user/service-history");
        },
        prefill: {
          email: user_email || "",
          contact: user_contact || ""
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: () => {
            console.log("Payment window closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error creating Razorpay instance:", err);
      alert("Failed to initialize payment. Please try again.");
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
          <p className="text-white text-xl">Loading booking details...</p>
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
      
      <motion.div
        className="relative z-10 p-6 max-w-2xl mx-auto space-y-8"
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
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
              Complete Payment
            </h1>
            <p className="text-gray-300 text-lg">Secure payment for your pest control service</p>
          </GlassCard>
        </motion.div>

        {/* Payment Details */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-8" color="emerald">
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="text-center pb-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">Booking Summary</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="text-gray-400">Booking ID</p>
                    <p className="text-white font-medium">#{bookingId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Service Amount</p>
                    <p className="text-2xl font-bold text-emerald-400">₹{bookingDetails.amount}</p>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-medium">Secure Payment</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Your payment is protected by industry-standard encryption and security measures.
                </p>
              </div>

              {/* Payment Button */}
              <div className="pt-4">
                <AnimatedButton
                  variant="neon"
                  size="lg"
                  onClick={handlePayment}
                  disabled={!scriptLoaded || !bookingDetails}
                  loading={!scriptLoaded}
                  icon={scriptLoaded ? <CheckCircleIcon className="w-5 h-5" /> : undefined}
                  className="w-full"
                >
                  {!scriptLoaded ? "Loading Payment Gateway..." : "Pay Now"}
                </AnimatedButton>
              </div>

              {!scriptLoaded && (
                <div className="text-center">
                  <p className="text-yellow-400 text-sm">
                    Please wait while we load the secure payment gateway...
                  </p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="text-center pt-4 border-t border-white/20">
                <p className="text-gray-400 text-sm mb-2">Accepted Payment Methods</p>
                <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                  <span>💳 Credit Cards</span>
                  <span>🏦 Net Banking</span>
                  <span>📱 UPI</span>
                  <span>💰 Wallets</span>
                </div>
              </div>
            </div>
          </NeonCard>
        </motion.div>
      </motion.div>
    </div>
  );
}