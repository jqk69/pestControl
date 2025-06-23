import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cartItems = state?.cartItems || [];

  const [formData, setFormData] = useState({
    location: '',
    address: '',
    pincode: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Login required');
      navigate('/login');
      return;
    }

    if (!formData.location || !formData.address || !formData.pincode || !formData.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const fullAddress = `${formData.location}, ${formData.address}, ${formData.pincode}`;
    const cartIds = cartItems.map((item) => item.cart_id);

    setLoading(true);

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const options = {
        key: rpzkey,
        amount: total * 100,
        currency: 'INR',
        name: 'Pestilee Store',
        description: 'Order Payment',
        handler: async function (response) {
          try {
            await axios.post(
              'http://127.0.0.1:5000/user/cart/confirm-payment',
              {
                cart_ids: cartIds,
                delivery_address: fullAddress,
                phone: formData.phone,
                razorpay_payment_id: response.razorpay_payment_id,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            toast.success('Payment successful & Order placed!');
            navigate('/user/orders');
          } catch (err) {
            console.error(err);
            toast.error('Payment success, but order confirmation failed.');
          }
        },
        prefill: {
          contact: formData.phone,
        },
        theme: {
          color: '#10b981',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Checkout failed');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        className="relative z-10 p-6 max-w-6xl mx-auto space-y-8"
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
              Secure Checkout
            </h1>
            <p className="text-gray-300 text-lg">Complete your order with confidence</p>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6 text-emerald-400" />
                Order Summary
              </h2>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 italic">Your cart is empty.</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.cart_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">₹{item.price} each</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Delivery Details */}
          <motion.div variants={itemVariants}>
            <NeonCard className="p-6" color="emerald">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-emerald-400" />
                Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location/City
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter your city"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <AnimatedButton
                    variant="neon"
                    size="lg"
                    onClick={handlePayment}
                    loading={loading}
                    disabled={loading || cartItems.length === 0}
                    icon={!loading && <CheckCircleIcon className="w-5 h-5" />}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </AnimatedButton>
                </div>

                <div className="text-center text-xs text-gray-400 mt-4">
                  <p>🔒 Your payment information is secure and encrypted</p>
                </div>
              </div>
            </NeonCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}