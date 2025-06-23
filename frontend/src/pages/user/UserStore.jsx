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
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function UserStore() {
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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

      console.log('Fetching products...');
      
      const response = await axios.get('http://127.0.0.1:5000/user/store', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Store response:', response.data);

      let fetched = [];
      let recommended = [];

      if (response.data?.items) {
        fetched = response.data.items;
        recommended = response.data.recommended || [];
      } else if (response.data?.products) {
        fetched = response.data.products;
        recommended = response.data.recommended || [];
      } else if (Array.isArray(response.data)) {
        fetched = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Invalid response format from server');
        return;
      }

      setProducts(fetched);
      setRecommendedProducts(recommended);
      filterProducts(fetched, searchTerm, activeCategory, sortOption, recommended);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (allProducts, search = '', category = 'all', sort = 'featured', recommended = recommendedProducts) => {
    let filtered = [];

    if (category === 'sustainable') {
      filtered = allProducts.filter((p) => p.category === 'sustainable');
    } else if (category === 'Recommended') {
      filtered = recommended;
    } else {
      filtered = allProducts;
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
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
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts(products, searchTerm, activeCategory, sortOption, recommendedProducts);
  }, [searchTerm, activeCategory, sortOption, products, recommendedProducts]);

  const handleQuantityChange = (productId, value) => {
    const product = products.find((p) => p.id === productId);
    const maxQty = product?.inventory_amount || 1;
    const qty = Math.max(1, Math.min(maxQty, parseInt(value) || 1));
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = async (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > (product.inventory_amount || 0)) {
      alert(`Only ${product.inventory_amount || 0} left in stock.`);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please login first.');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://127.0.0.1:5000/user/cart/add',
        { product_id: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Show success animation
        const button = document.getElementById(`add-to-cart-${product.id}`);
        if (button) {
          button.innerHTML = '✓ Added!';
          button.classList.add('bg-emerald-500');
          setTimeout(() => {
            button.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path></svg>Cart';
            button.classList.remove('bg-emerald-500');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > (product.inventory_amount || 0)) {
      alert(`Only ${product.inventory_amount || 0} left in stock.`);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please login first.');
        navigate('/login');
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
      alert('Buy Now failed');
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center justify-center">
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
          <p className="text-white text-xl">Loading amazing products...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <SparklesIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Products</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => fetchProducts()}
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
      
      {/* Hero Section */}
      <div className="relative z-10">
        <motion.div
          className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 backdrop-blur-xl border-b border-white/10 py-16 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            Premium Pest Solutions
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
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
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 text-lg"
            />
          </motion.div>
        </motion.div>

        {/* Filters and Controls */}
        <div className="container mx-auto px-6 py-8">
          <motion.div
            className="flex flex-wrap justify-between items-center mb-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All Products', icon: null },
                { key: 'sustainable', label: 'Eco-Friendly', icon: GlobeAltIcon },
                { key: 'Recommended', label: 'Recommended', icon: StarIcon },
              ].map((cat) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === cat.key
                      ? (cat.key === 'sustainable'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                          : cat.key === 'Recommended'
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
                      <motion.img
                        src={`http://127.0.0.1:5000/static/products/${product.image_path}`}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
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
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center bg-white/10 rounded-xl overflow-hidden border border-white/20">
                          <button
                            onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                            className="px-3 py-2 hover:bg-white/10 text-gray-300 transition-colors"
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
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <AnimatedButton
                          id={`add-to-cart-${product.id}`}
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          icon={<ShoppingCartIcon className="w-4 h-4" />}
                          className="text-sm"
                        >
                          Cart
                        </AnimatedButton>
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleBuyNow(product)}
                          icon={<BoltIcon className="w-4 h-4" />}
                          className="text-sm"
                        >
                          Buy
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
                <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  icon={<SparklesIcon className="w-4 h-4" />}
                >
                  Reset Filters
                </AnimatedButton>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}