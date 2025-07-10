import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminStore() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching products for category:', activeTab);
      
      const response = await axios.get(`http://127.0.0.1:5000/admin/store`, {
        params: { category: activeTab },
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Products response:', response.data);

      let fetchedProducts = [];
      if (response.data?.items) {
        fetchedProducts = response.data.items;
      } else if (response.data?.products) {
        fetchedProducts = response.data.products;
      } else if (Array.isArray(response.data)) {
        fetchedProducts = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Invalid response format from server');
        return;
      }

      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const handleEdit = (productId) => {
    navigate(`edit_product/${productId}`);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading store products...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ArchiveBoxIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div
        className="relative z-10 p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <BuildingStorefrontIcon className="w-10 h-10 text-blue-400" />
                  Store Management
                </h1>
                <p className="text-gray-300 text-lg">Manage your product inventory</p>
              </div>
              <AnimatedButton
                variant="blue"
                size="lg"
                onClick={() => navigate('add_product')}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add Product
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              {[
                { key: 'normal', label: 'Normal Store', icon: BuildingStorefrontIcon },
                { key: 'sustainable', label: 'Sustainable Solutions', icon: GlobeAltIcon },
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ArchiveBoxIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No products found</h2>
              <p className="text-gray-400 mb-8 text-lg">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first product'}
              </p>
              <AnimatedButton
                variant="blue"
                size="lg"
                onClick={() => navigate('add_product')}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add First Product
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <NeonCard className="overflow-hidden h-full flex flex-col" color="blue">
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
                      
                      {/* Category Badge */}
                      {product.category === 'sustainable' && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                            <GlobeAltIcon className="w-3 h-3 mr-1" /> Eco
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2 text-white group-hover:text-blue-400 transition-colors">
                        {product.name || 'Unnamed Product'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                        {product.description || 'No description available'}
                      </p>

                      {/* Price and Inventory */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-300">
                            <CurrencyDollarIcon className="w-4 h-4 text-blue-400" />
                            <span>Price</span>
                          </div>
                          <span className="text-xl font-bold text-blue-400">₹{product.price || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-300">
                            <ArchiveBoxIcon className="w-4 h-4 text-blue-400" />
                            <span>Stock</span>
                          </div>
                          <span className="text-white font-medium">{product.inventory_amount || 0}</span>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <AnimatedButton
                        variant="blue"
                        size="md"
                        onClick={() => handleEdit(product.id)}
                        icon={<PencilIcon className="w-4 h-4" />}
                        className="w-full"
                      >
                        Edit Product
                      </AnimatedButton>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}