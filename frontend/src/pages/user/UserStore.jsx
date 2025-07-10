import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  StarIcon, 
  ChevronDownIcon,
  ShoppingCartIcon,
  BoltIcon,
  SparklesIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserStore() {
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [buyingNow, setBuyingNow] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Please login to view products');
      navigate('/login');
      return;
    }

    const response = await axios.get('http://127.0.0.1:5000/user/store', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const fetchedProducts = response.data?.items || response.data?.products || [];
    const recommended = response.data?.recommended || fetchedProducts.slice(0, 3);

    setProducts(fetchedProducts);
    setRecommendedProducts(recommended);
    setFilteredProducts(fetchedProducts); // Initialize filtered products
    
    // Initialize quantities
    const initialQuantities = {};
    fetchedProducts.forEach(product => {
      initialQuantities[product.id] = 1;
    });
    setQuantities(initialQuantities);
    
  } catch (error) {
    console.error('Error fetching products:', error);
    setError(error.response?.data?.message || error.message || 'Failed to fetch products');
  } finally {
    setLoading(false);
  }
};

  const generateMockProducts = () => {
    return [
      {
        id: '1',
        name: 'Eco-Friendly Ant Repellent',
        description: 'Natural ant repellent made from essential oils. Safe for homes with children and pets.',
        price: 299,
        inventory_amount: 25,
        image_path: 'https://images.pexels.com/photos/5503215/pexels-photo-5503215.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'sustainable',
        rating: 4
      },
      {
        id: '2',
        name: 'Ultrasonic Rodent Repeller',
        description: 'Advanced ultrasonic technology to keep rodents away without chemicals.',
        price: 799,
        inventory_amount: 15,
        image_path: 'https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'normal',
        rating: 5
      },
      {
        id: '3',
        name: 'Organic Mosquito Spray',
        description: 'DEET-free mosquito repellent made with organic ingredients.',
        price: 349,
        inventory_amount: 30,
        image_path: 'https://images.pexels.com/photos/5503256/pexels-photo-5503256.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'sustainable',
        rating: 4
      },
      {
        id: '4',
        name: 'Professional Cockroach Trap',
        description: 'Set of 10 professional-grade cockroach traps with bait included.',
        price: 499,
        inventory_amount: 20,
        image_path: 'https://images.pexels.com/photos/5503239/pexels-photo-5503239.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'normal',
        rating: 5
      },
      {
        id: '5',
        name: 'Biodegradable Fly Strips',
        description: 'Effective fly control with environmentally friendly materials.',
        price: 199,
        inventory_amount: 40,
        image_path: 'https://images.pexels.com/photos/5503227/pexels-photo-5503227.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'sustainable',
        rating: 3
      },
      {
        id: '6',
        name: 'All-Purpose Pest Spray',
        description: 'Effective against multiple common household pests.',
        price: 599,
        inventory_amount: 18,
        image_path: 'https://images.pexels.com/photos/5503219/pexels-photo-5503219.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'normal',
        rating: 4
      }
    ];
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchTerm, activeTab, sortOption, products, recommendedProducts]);

  const filterAndSortProducts = () => {
    let filtered = [];
    
    // Filter by tab/category
    if (activeTab === 'sustainable') {
      filtered = products.filter(p => p.category?.toLowerCase() === 'sustainable');
    } else if (activeTab === 'recommended') {
      filtered = recommendedProducts;
    } else {
      filtered = products;
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(lowerSearch) || 
        p.description?.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default: // featured
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
    }
    
    setFilteredProducts(filtered);
  };

  const handleQuantityChange = (productId, value) => {
    const product = products.find(p => p.id === productId);
    const maxQty = product?.inventory_amount || 1;
    const qty = Math.max(1, Math.min(maxQty, parseInt(value) || 1));
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = async (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > (product.inventory_amount || 0)) {
      toast.warning(`Only ${product.inventory_amount || 0} left in stock.`);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Please login first.');
        navigate('/login');
        return;
      }

      setAddingToCart(prev => new Set([...prev, product.id]));

      const response = await axios.post(
        'http://127.0.0.1:5000/user/cart/add',
        { product_id: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success('Added to cart successfully!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const handleBuyNow = async (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > (product.inventory_amount || 0)) {
      toast.warning(`Only ${product.inventory_amount || 0} left in stock.`);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Please login first.');
        navigate('/login');
        return;
      }

      setBuyingNow(prev => new Set([...prev, product.id]));

      // For mock products, skip the API call
      if (product.id.toString().length < 3) {
        const mockCartItem = {
          ...product,
          quantity,
          cart_id: `temp-${Date.now()}`
        };
        navigate('/user/cart/checkout', { state: { cartItems: [mockCartItem] } });
        return;
      }

      const res = await axios.post(
        `http://127.0.0.1:5000/user/buysingle/${product.id}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        const cart_id = res.data.cart_id;
        const itemWithQty = { ...product, quantity, cart_id };
        navigate('/user/cart/checkout', { state: { cartItems: [itemWithQty] } });
      }
    } catch (error) {
      console.error('Buy Now error:', error);
      toast.error('Failed to process your order. Please try again.');
      
      // If API fails, still navigate with mock data for demo purposes
      if (retryCount >= 3) {
        const mockCartItem = {
          ...product,
          quantity,
          cart_id: `temp-${Date.now()}`
        };
        navigate('/user/cart/checkout', { state: { cartItems: [mockCartItem] } });
      }
    } finally {
      setBuyingNow(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-4 h-4 ${star <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
        />
      ))}
    </div>
  );

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
          <p className="text-white text-xl">Loading amazing products...</p>
        </motion.div>
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Products</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => {
              setRetryCount(0);
              fetchProducts();
            }}
            icon={<ArrowPathIcon className="w-5 h-5" />}
          >
            Try Again
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />
      
      {/* Enhanced Hero Section */}
      <div className="relative z-10">
        <motion.div
          className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 backdrop-blur-xl border-b border-white/10 py-20 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-10"
                style={{
                  background: `linear-gradient(45deg, #10b981, #06b6d4)`,
                  width: 150 + i * 100,
                  height: 150 + i * 100,
                  left: `${20 + i * 20}%`,
                  top: `${10 + i * 20}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 15 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto px-6">
            <motion.h1 
              className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              Premium Pest Solutions
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Discover our curated collection of effective, safe, and eco-friendly pest control products
            </motion.p>

            <motion.div 
              className="max-w-2xl mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="text-gray-400 w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Search for the perfect solution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 text-lg shadow-lg"
              />
            </motion.div>
            
            {/* Product Stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { value: '100%', label: 'Satisfaction Guarantee', icon: CheckCircleIcon },
                { value: 'Eco', label: 'Friendly Options', icon: GlobeAltIcon },
                { value: '24/7', label: 'Customer Support', icon: ShieldCheckIcon },
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <div className="container mx-auto px-6 py-8">
          <motion.div
            className="flex flex-wrap justify-between items-center mb-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All Products', icon: null },
                { key: 'sustainable', label: 'Eco-Friendly', icon: GlobeAltIcon },
                { key: 'recommended', label: 'Recommended', icon: StarIcon },
              ].map((cat) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className={`px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                    activeTab === cat.key
                      ? (cat.key === 'sustainable'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                          : cat.key === 'recommended'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25')
                      : 'bg-white/10 backdrop-blur-xl text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.icon && <cat.icon className="w-4 h-4" />}
                  {cat.label}
                </motion.button>
              ))}
            </div>

            <div className="relative">
              <motion.button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 hover:bg-white/20 text-gray-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Sort: {sortOption.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 z-10"
                  >
                    <GlassCard className="py-2">
                      {['featured', 'price-low', 'price-high', 'rating', 'newest'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortOption(opt);
                            setShowSortDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                          {opt.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                      ))}
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <NeonCard className="overflow-hidden h-full flex flex-col" color="emerald">
                    {/* Product Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
                      {product.best_seller && (
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          ⭐ Best Seller
                        </span>
                      )}
                      {product.category === 'sustainable' && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                          <GlobeAltIcon className="w-3 h-3 mr-1" /> Eco
                        </span>
                      )}
                    </div>

                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                     src={
                        product.image_path && typeof product.image_path === 'string' && product.image_path.startsWith('http') 
                          ? product.image_path 
                          : product.image_path
                            ? `http://127.0.0.1:5000/static/products/${product.image_path}`
                            : 'https://via.placeholder.com/300'
                      }
                      alt={product.name || 'Product image'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                      }}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-white group-hover:text-emerald-400 transition-colors">
                        {product.name || 'Unnamed Product'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 flex-1 line-clamp-2">
                        {product.description || 'No description available'}
                      </p>
                      
                      {product.rating && (
                        <div className="mb-3">
                          {renderStars(product.rating)}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-emerald-400">
                            ₹{product.price || 0}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.original_price}
                            </span>
                          )}
                        </div>
                        {/* <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                          {product.inventory_amount || 0} in stock
                        </span> */}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center bg-white/10 rounded-xl overflow-hidden border border-white/20">
                          <button
                            onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                            className="px-3 py-2 hover:bg-white/10 text-gray-300 transition-colors"
                            disabled={quantities[product.id] <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.inventory_amount || 1}
                            value={quantities[product.id] || 1}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-16 text-center bg-transparent text-white border-x border-white/20 py-2 focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                            className="px-3 py-2 hover:bg-white/10 text-gray-300 transition-colors"
                            disabled={quantities[product.id] >= (product.inventory_amount || 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          loading={addingToCart.has(product.id)}
                          disabled={addingToCart.has(product.id)}
                          icon={!addingToCart.has(product.id) && <ShoppingCartIcon className="w-4 h-4" />}
                          className="text-sm"
                        >
                          {addingToCart.has(product.id) ? 'Adding...' : 'Cart'}
                        </AnimatedButton>
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleBuyNow(product)}
                          loading={buyingNow.has(product.id)}
                          disabled={buyingNow.has(product.id)}
                          icon={!buyingNow.has(product.id) && <BoltIcon className="w-4 h-4" />}
                          className="text-sm"
                        >
                          {buyingNow.has(product.id) ? 'Processing...' : 'Buy'}
                        </AnimatedButton>
                      </div>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GlassCard className="max-w-md mx-auto p-8">
                <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                    setSortOption('featured');
                  }}
                  icon={<SparklesIcon className="w-4 h-4" />}
                >
                  Reset Filters
                </AnimatedButton>
              </GlassCard>
            </motion.div>
          )}
          
          {/* Product Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16"
          >
            <GlassCard className="p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-8">Shop by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Insect Control",
                    description: "Solutions for ants, cockroaches, and other insects",
                    icon: BugAntIcon,
                    color: "emerald"
                  },
                  {
                    title: "Rodent Control",
                    description: "Effective products to keep rodents away",
                    icon: ShieldCheckIcon,
                    color: "blue"
                  },
                  {
                    title: "Eco-Friendly",
                    description: "Sustainable solutions for environmentally conscious homes",
                    icon: GlobeAltIcon,
                    color: "green"
                  }
                ].map((category, index) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.2 }}
                    className={`p-6 bg-${category.color}-500/10 rounded-xl border border-${category.color}-500/30 hover:bg-${category.color}-500/20 transition-colors cursor-pointer`}
                    onClick={() => {
                      if (category.title === "Eco-Friendly") {
                        setActiveTab('sustainable');
                      } else {
                        setActiveTab('all');
                        setSearchTerm(category.title.split(' ')[0]);
                      }
                    }}
                  >
                    <category.icon className={`w-12 h-12 mx-auto mb-4 text-${category.color}-400`} />
                    <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
          
          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mt-16"
          >
            <NeonCard className="p-8" color="blue">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Products</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  We're committed to providing effective, safe, and sustainable pest control solutions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                {[
                  {
                    icon: ShieldCheckIcon,
                    title: "Guaranteed Results",
                    description: "All products backed by our satisfaction guarantee"
                  },
                  {
                    icon: GlobeAltIcon,
                    title: "Eco-Friendly Options",
                    description: "Sustainable solutions for environmentally conscious homes"
                  },
                  {
                    icon: CurrencyDollarIcon,
                    title: "Competitive Pricing",
                    description: "Professional-grade products at affordable prices"
                  },
                  {
                    icon: SparklesIcon,
                    title: "Expert Support",
                    description: "24/7 customer service from pest control experts"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + index * 0.2 }}
                    className="p-4"
                  >
                    <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </NeonCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}