import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  ShoppingBagIcon, 
  MapPinIcon,
  PlusIcon,
  MinusIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your cart');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://127.0.0.1:5000/user/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      toast.error('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const token = sessionStorage.getItem('token');
    setRemovingItems(prev => new Set([...prev, productId]));
    
    try {
      await axios.delete(`http://127.0.0.1:5000/user/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    const token = sessionStorage.getItem('token');
    setUpdatingItems(prev => new Set([...prev, item.product_id]));
    
    try {
      await axios.post(
        'http://127.0.0.1:5000/user/cart/add',
        { product_id: item.product_id, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.product_id);
        return newSet;
      });
    }
  };

  const handleBuySingle = (item) => {
    navigate('/user/cart/checkout', { state: { cartItems: [item] } });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/user/cart/checkout', { state: { cartItems } });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
          <p className="text-white text-xl">Loading your cart...</p>
        </motion.div>
      </div>
    );
  }

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
              <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your Shopping Cart
            </motion.h1>
            <motion.div 
              className="flex items-center justify-center gap-6 text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 text-gray-300">
                <ShoppingCartIcon className="w-5 h-5 text-emerald-400" />
                <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-400" />
                <span>₹{total.toFixed(2)} total</span>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-emerald-500/5" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="relative z-10"
              >
                <ExclamationTriangleIcon className="w-24 h-24 text-gray-500 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                Discover our amazing pest control products and add them to your cart for a pest-free home
              </p>
              <AnimatedButton
                variant="neon"
                size="lg"
                onClick={() => navigate('/user/store')}
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                Start Shopping
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-6">
              <motion.div variants={itemVariants}>
                <GlassCard className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShoppingCartIcon className="w-6 h-6 text-emerald-400" />
                    Cart Items ({cartItems.length})
                  </h2>
                </GlassCard>
              </motion.div>

              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.cart_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <NeonCard className="p-6 relative overflow-hidden" color="emerald">
                      {/* Loading Overlay */}
                      {(updatingItems.has(item.product_id) || removingItems.has(item.product_id)) && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                          <motion.div
                            className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      )}

                      <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* Product Image */}
                        <div className="relative">
                          <motion.div 
                            className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 shadow-lg"
                            whileHover={{ scale: 1.1 }}
                          >
                            <img
                              src={`http://127.0.0.1:5000/static/products/${item.image_path}`} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                            />
                          </motion.div>
                          {/* Favorite Button */}
                          <motion.button
                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-red-500/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <HeartIcon className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" />
                          </motion.button>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 text-center lg:text-left">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                          
                          {/* Price and Rating */}
                          <div className="flex items-center justify-center lg:justify-start gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" />
                              <span className="text-2xl font-bold text-emerald-400">₹{item.price}</span>
                              <span className="text-gray-400 text-sm">each</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                />
                              ))}
                              <span className="text-gray-400 text-sm ml-1">(4.0)</span>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="text-center lg:text-left">
                            <span className="text-gray-400 text-sm">Subtotal: </span>
                            <span className="text-xl font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center bg-white/10 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item.product_id)}
                              className="w-10 h-10 flex items-center justify-center text-white hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </motion.button>
                            
                            <div className="w-16 h-10 flex items-center justify-center bg-white/5 border-x border-white/20">
                              <span className="text-white font-bold text-lg">{item.quantity}</span>
                            </div>
                            
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              disabled={updatingItems.has(item.product_id)}
                              className="w-10 h-10 flex items-center justify-center text-white hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 w-full">
                            <AnimatedButton
                              variant="danger"
                              size="sm"
                              onClick={() => removeFromCart(item.product_id)}
                              loading={removingItems.has(item.product_id)}
                              disabled={removingItems.has(item.product_id)}
                              icon={!removingItems.has(item.product_id) && <TrashIcon className="w-4 h-4" />}
                              className="w-full"
                            >
                              {removingItems.has(item.product_id) ? 'Removing...' : 'Remove'}
                            </AnimatedButton>
                            
                            <AnimatedButton
                              variant="blue"
                              size="sm"
                              onClick={() => handleBuySingle(item)}
                              icon={<ShoppingBagIcon className="w-4 h-4" />}
                              className="w-full"
                            >
                              Buy Now
                            </AnimatedButton>
                          </div>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Enhanced Cart Summary */}
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <NeonCard className="p-6 sticky top-6" color="blue">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircleIcon className="w-6 h-6 text-blue-400" />
                    Order Summary
                  </h3>
                  
                  {/* Items Breakdown */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.cart_id} className="flex justify-between items-center text-sm py-2 border-b border-white/10">
                        <div className="flex-1">
                          <span className="text-gray-300 line-clamp-1">{item.name}</span>
                          <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Calculations */}
                  <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping</span>
                      <span className="text-emerald-400">Free</span>
                    </div>
                    
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-white">Total</span>
                        <span className="text-2xl font-bold text-blue-400">₹{(total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <AnimatedButton
                    variant="neon"
                    size="lg"
                    onClick={handleProceedToCheckout}
                    icon={<ArrowRightIcon className="w-5 h-5" />}
                    className="w-full"
                  >
                    Proceed to Checkout
                  </AnimatedButton>

                  {/* Security Badge */}
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                      <span>Secure checkout guaranteed</span>
                    </div>
                  </div>
                </NeonCard>
              </motion.div>

              {/* Recommendations */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    You might also like
                  </h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                        whileHover={{ x: 5 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">
                            Recommended Product {i}
                          </h4>
                          <p className="text-gray-400 text-xs">₹{(299 + i * 100).toFixed(2)}</p>
                        </div>
                        <PlusIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}