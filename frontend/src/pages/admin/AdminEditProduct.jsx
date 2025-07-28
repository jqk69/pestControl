import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminEditProduct() {
  const { productId } = useParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    inventory_amount: '',
    image_path: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:5000/admin/store/edit_product/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data?.product) {
          setProduct(response.data.product);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

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

      await axios.patch(`http://127.0.0.1:5000/admin/store/edit_product/${productId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Product updated successfully!');
      navigate('/admin/store');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.delete(`http://127.0.0.1:5000/admin/store/delete_product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        toast.success("Product deleted successfully!");
        navigate('/admin/store');
      } else {
        toast.error("Failed to delete product. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product.");
      setError("Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

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
                  Edit Product
                </h1>
                <p className="text-gray-300 text-lg">Update product information</p>
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

        {/* Loading State */}
        {loading && !error && (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 text-center">
              <motion.div
                className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white text-xl">Loading product data...</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Product Form */}
        {!loading && (
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
                        value={product.name || ''}
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

                        value={product.price || ''}
                        min="100"
                        max="10000"
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
                        value={product.inventory_amount || ''}
                        min="10"
                        max="1000"
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
                        value={product.category || 'normal'}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        required
                      >
                        <option value="normal" className="bg-gray-800">Normal</option>
                        <option value="sustainable" className="bg-gray-800">Sustainable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={product.description || ''}
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
                        {product.image_path && (
                          <div className="relative">
                            <img
                              src={product.image_path.startsWith('blob:')
                                ? product.image_path
                                : `http://127.0.0.1:5000/static/products/${product.image_path}`}
                              alt="Product"
                              className="w-full h-64 object-contain rounded-lg mb-4 mx-auto"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                              }}
                            />
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
                        Product Information
                      </h3>
                      <ul className="space-y-3 text-gray-300 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>Product ID: {product.id}</span>
                        </li>
                        {product.created_at && (
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                          </li>
                        )}
                        {product.updated_at && (
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>Last Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>Category: {product.category === 'sustainable' ? 'Eco-Friendly' : 'Standard'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/20 flex flex-col md:flex-row gap-4">
                  <AnimatedButton
                    type="submit"
                    variant="neon"
                    size="lg"
                    loading={loading}
                    disabled={loading || deleting}
                    icon={!loading && <CheckIcon className="w-5 h-5" />}
                    className="flex-1"
                    color="blue"
                  >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </AnimatedButton>
                  
                  <AnimatedButton
                    type="button"
                    variant="danger"
                    size="lg"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading || deleting}
                    icon={<TrashIcon className="w-5 h-5" />}
                    className="flex-1"
                  >
                    Delete Product
                  </AnimatedButton>
                </div>
              </form>
            </NeonCard>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6">
                <div className="text-center mb-6">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Confirm Deletion</h3>
                  <p className="text-gray-300">
                    Are you sure you want to delete <span className="font-semibold text-white">{product.name}</span>? This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <AnimatedButton
                    variant="ghost"
                    size="lg"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    icon={<XMarkIcon className="w-5 h-5" />}
                    className="flex-1"
                  >
                    Cancel
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="danger"
                    size="lg"
                    onClick={handleDelete}
                    loading={deleting}
                    disabled={deleting}
                    icon={!deleting && <TrashIcon className="w-5 h-5" />}
                    className="flex-1"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}