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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function UserCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      await axios.delete(`http://127.0.0.1:5000/user/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    const token = sessionStorage.getItem('token');
    try {
      await axios.post(
        'http://127.0.0.1:5000/user/cart/add',
        { product_id: item.product_id, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleBuySingle = (item) => {
    navigate('/user/checkout', { state: { cartItems: [item] } });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/user/checkout', { state: { cartItems } });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          <p className="text-white text-xl">Loading your cart...</p>
        </motion.div>
      </div>
    );
  }

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
              <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
              Your Shopping Cart
            </h1>
            <p className="text-gray-300 text-lg">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </GlassCard>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Discover our amazing pest control products and add them to your cart
              </p>
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/user/store')}
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                Start Shopping
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        ) : (
          <>
            {/* Cart Items */}
            <motion.div variants={itemVariants} className="space-y-6">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.cart_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <NeonCard className="p-6" color="emerald">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                          <img
                            src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                          <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                          <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="text-2xl font-bold text-emerald-400">₹{item.price}</span>
                            <span className="text-gray-400">each</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </motion.button>
                          <span className="text-white font-bold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                          <AnimatedButton
                            variant="danger"
                            size="sm"
                            onClick={() => removeFromCart(item.product_id)}
                            icon={<TrashIcon className="w-4 h-4" />}
                          >
                            Remove
                          </AnimatedButton>
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleBuySingle(item)}
                            icon={<ShoppingBagIcon className="w-4 h-4" />}
                          >
                            Buy Now
                          </AnimatedButton>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Cart Summary */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Order Summary</h3>
                  <div className="text-right">
                    <p className="text-gray-400">Total Amount</p>
                    <p className="text-3xl font-bold text-emerald-400">₹{total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.cart_id} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <AnimatedButton
                  variant="neon"
                  size="lg"
                  onClick={handleProceedToCheckout}
                  icon={<MapPinIcon className="w-5 h-5" />}
                  className="w-full"
                >
                  Proceed to Checkout
                </AnimatedButton>
              </GlassCard>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}