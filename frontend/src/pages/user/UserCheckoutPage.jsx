import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  TruckIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserCheckoutPage() {
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
  const [currentStep, setCurrentStep] = useState(1);
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal 

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

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.location || !formData.address || !formData.pincode) {
        toast.error('Please fill in all address fields');
        return;
      }
    }
    if (currentStep === 2) {
        const phone = formData.phone;

        if (!phone) {
          toast.error('Please enter your phone number');
          return;
        }

        if (!/^\d{10}$/.test(phone)) {
          toast.error('Phone number must be exactly 10 digits');
          return;
        }
      }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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

  const stepVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

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
        {/* Header */}
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
              className="text-xl text-gray-300 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Complete your order with confidence
            </motion.p>

            {/* Checkout Progress */}
            <motion.div 
              className="flex justify-center items-center gap-2 md:gap-4 max-w-xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {[
                { step: 1, label: 'Address', icon: MapPinIcon },
                { step: 2, label: 'Contact', icon: PhoneIcon },
                { step: 3, label: 'Payment', icon: CreditCardIcon }
              ].map((step) => (
                <div key={step.step} className="flex-1 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep === step.step 
                      ? 'bg-emerald-500 text-white' 
                      : currentStep > step.step 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {currentStep > step.step ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs md:text-sm ${
                    currentStep >= step.step ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {step.step < 3 && (
                    <div className={`hidden md:block h-0.5 w-full mt-2 ${
                      currentStep > step.step ? 'bg-emerald-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
              
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative z-10"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <MapPinIcon className="w-6 h-6 text-emerald-400" />
                      Delivery Address
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City/Location
                        </label>
                        <div className="relative">
                          <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="location"
                            placeholder="Enter your city"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Address
                        </label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            name="address"
                            placeholder="Enter your complete address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pincode
                        </label>
                        <div className="relative">
                          <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="pincode"
                            placeholder="Enter pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <AnimatedButton
                        variant="primary"
                        size="lg"
                        onClick={nextStep}
                        icon={<ArrowRightIcon className="w-5 h-5" />}
                      >
                        Continue to Contact
                      </AnimatedButton>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative z-10"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <PhoneIcon className="w-6 h-6 text-emerald-400" />
                      Contact Information
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            inputMode="numeric"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          We'll send order updates to this number
                        </p>
                      </div>

                      {/* Delivery Instructions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Delivery Instructions (Optional)
                        </label>
                        <div className="relative">
                          <TruckIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            name="instructions"
                            placeholder="Any special instructions for delivery"
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-between">
                      <AnimatedButton
                        variant="ghost"
                        size="lg"
                        onClick={prevStep}
                      >
                        Back to Address
                      </AnimatedButton>
                      <AnimatedButton
                        variant="primary"
                        size="lg"
                        onClick={nextStep}
                        icon={<ArrowRightIcon className="w-5 h-5" />}
                      >
                        Continue to Payment
                      </AnimatedButton>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative z-10"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCardIcon className="w-6 h-6 text-emerald-400" />
                      Payment Method
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                              <LockClosedIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium">Secure Payment</h3>
                              <p className="text-gray-400 text-sm">Powered by Razorpay</p>
                            </div>
                          </div>
                          <img 
                            src="https://razorpay.com/assets/razorpay-logo-white.svg" 
                            alt="Razorpay" 
                            className="h-8 opacity-70"
                          />
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">
                          Your payment information is processed securely. We do not store credit card details nor have access to your payment information.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-white/10 rounded-lg p-2">
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-8" />
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-8" />
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="American Express" className="h-8" />
                          </div>
                          <div className="bg-white/10 rounded-lg p-2">
                            <img src="https://cdn-icons-png.flaticon.com/512/825/825464.png" alt="UPI" className="h-8" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                          Delivery Address
                        </h3>
                        <p className="text-gray-300 mb-2">
                          {formData.location}, {formData.address}, {formData.pincode}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Phone:</span> {formData.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-between">
                      <AnimatedButton
                        variant="ghost"
                        size="lg"
                        onClick={prevStep}
                      >
                        Back to Contact
                      </AnimatedButton>
                      <AnimatedButton
                        variant="neon"
                        size="lg"
                        onClick={handlePayment}
                        loading={loading}
                        disabled={loading || cartItems.length === 0}
                        icon={!loading && <CheckCircleIcon className="w-5 h-5" />}
                      >
                        {loading ? 'Processing...' : 'Complete Payment'}
                      </AnimatedButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants}>
            <NeonCard className="p-6 sticky top-6" color="blue">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
                Order Summary
              </h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 italic">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.cart_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img
                            src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {e.target.src = '/placeholder-image.jpg'}}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                            <span className="text-sm font-medium text-blue-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping</span>
                      <span className="text-emerald-400">Free</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-400">₹{total.toFixed(2)}</span>
                          <p className="text-xs text-gray-400">Incl. of all taxes</p>
                        </div>
                      </div>
                    </div>
                  </div>

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
                      <TruckIcon className="w-6 h-6 text-emerald-400 mb-1" />
                      <span className="text-xs text-gray-400">Fast Delivery</span>
                    </div>
                  </div>
                </>
              )}
            </NeonCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}