import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingStorefrontIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminAddProduct() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    inventory_amount: '',
    image_path: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Temporary URL for preview
      const newImageURL = URL.createObjectURL(file);
      setProduct((prev) => ({ ...prev, image_path: newImageURL }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('inventory_amount', product.inventory_amount);
      formData.append('category', product.category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post(`http://127.0.0.1:5000/admin/store/add_product`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/admin/store');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
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
                  Add New Product
                </h1>
                <p className="text-gray-300 text-lg">Create a new product for your store</p>
              </div>
              <AnimatedButton
                variant="ghost"
                size="lg"
                onClick={() => navigate('/admin/store')}
                icon={<ArrowLeftIcon className="w-5 h-5" />}
              >
                Back to Store
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-4 border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Form */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-6" color="blue">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Product Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-blue-400" />
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-blue-400" />
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter price"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <ArchiveBoxIcon className="w-4 h-4 text-blue-400" />
                      Inventory Amount
                    </label>
                    <input
                      type="number"
                      name="inventory_amount"
                      value={product.inventory_amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter inventory amount"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-blue-400" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-gray-800">Select category</option>
                      <option value="Normal" className="bg-gray-800">Normal</option>
                      <option value="Sustainable" className="bg-gray-800">Sustainable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      rows="6"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Enter product description"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <PhotoIcon className="w-4 h-4 text-blue-400" />
                      Product Image
                    </label>
                    
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
                      {product.image_path ? (
                        <div className="relative">
                          <img
                            src={product.image_path}
                            alt="Product Preview"
                            className="w-full h-64 object-contain rounded-lg mb-4 mx-auto"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setProduct(prev => ({ ...prev, image_path: '' }));
                            }}
                            className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                          <PhotoIcon className="w-16 h-16 mb-4 text-gray-500/50" />
                          <p className="text-lg mb-2">Drag and drop an image here</p>
                          <p className="text-sm mb-4">or click to browse</p>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        name="image"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="px-4 py-2 bg-white/10 text-white rounded-lg cursor-pointer hover:bg-white/20 transition-colors inline-block"
                      >
                        {product.image_path ? 'Change Image' : 'Select Image'}
                      </label>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-400">
                      Recommended: 800x800px or larger, JPG, PNG or GIF format, max 5MB
                    </p>
                  </div>

                  <div className="bg-white/5 p-6 rounded-xl border border-white/10 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BuildingStorefrontIcon className="w-5 h-5 text-blue-400" />
                      Product Guidelines
                    </h3>
                    <ul className="space-y-3 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>Use clear, high-quality images</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>Write detailed, accurate descriptions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>Set competitive pricing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>Keep inventory counts accurate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>Mark sustainable products appropriately</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/20">
                <AnimatedButton
                  type="submit"
                  variant="neon"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  icon={!loading && <PlusIcon className="w-5 h-5" />}
                  className="w-full"
                  color="blue"
                >
                  {loading ? 'Adding Product...' : 'Add Product'}
                </AnimatedButton>
              </div>
            </form>
          </NeonCard>
        </motion.div>
      </motion.div>
    </div>
  );
}