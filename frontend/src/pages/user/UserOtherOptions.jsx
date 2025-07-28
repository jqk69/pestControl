
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpTrayIcon,
  SparklesIcon,
  CameraIcon,
  BeakerIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserOtherOptions() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login to predict pest type');
      navigate('/login');
      return;
    }

    setLoadingPredict(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/user/predict-pest',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPrediction({
          pest_type: response.data.pest_type || 'Unknown',
          confidence: response.data.confidence || 0,
          recommendations: response.data.recommendations || 'No related services found'
        });
        toast.success('Pest type predicted successfully');
      } else {
        toast.error(response.data.message || 'Failed to predict pest type');
      }
    } catch (error) {
      console.error('Error calling pest prediction API:', error);
      toast.error('Error predicting pest type');
    } finally {
      setLoadingPredict(false);
    }
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
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Pest Identification
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Upload an image to identify pests and get tailored service recommendations
            </motion.p>
          </GlassCard>
        </motion.div>

        {/* Prediction Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Image Upload Card */}
          <NeonCard className="p-6 relative overflow-hidden" color="purple">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <CameraIcon className="w-6 h-6 text-purple-400" />
                Pest Identification
              </h2>
              <p className="text-gray-300 mb-6">
                Upload an image of a pest to identify its type using our advanced AI
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Pest Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-white/5 border-white/20 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-300">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG or JPEG (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <AnimatedButton
                variant="neon"
                size="lg"
                onClick={handlePredict}
                loading={loadingPredict}
                disabled={!image || loadingPredict}
                icon={!loadingPredict && <SparklesIcon className="w-5 h-5" />}
                className="w-full"
                color="purple"
              >
                {loadingPredict ? 'Analyzing Image...' : 'Identify Pest'}
              </AnimatedButton>
            </div>
          </NeonCard>

          {/* Results Card */}
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
            
            <div className="relative z-10 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BeakerIcon className="w-6 h-6 text-emerald-400" />
                Analysis Results
              </h2>
              
              {prediction ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                    <BeakerIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pest Identified!</h3>
                  <div className="text-center mb-6">
                    <p className="text-gray-300 mb-2">Our AI has identified this as:</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      {prediction.pest_type}
                    </p>
                    <p className="text-gray-300 mt-2">
                      Confidence: {(prediction.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                      <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                      Recommended Services
                    </h4>
                    {Array.isArray(prediction.recommendations) && prediction.recommendations.length > 0 ? (
                      <ul className="text-gray-300 text-sm space-y-2">
                        {prediction.recommendations.slice(0, 3).map((service) => (
                          <li key={service.service_id} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                            {service.name} - ${parseFloat(service.price).toFixed(2)} ({(service.similarity * 100).toFixed(2)}% match)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        {prediction.recommendations || 'No related services found'}
                      </p>
                    )}
                    <div className="mt-4">
                      <AnimatedButton
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/user/services')}
                      >
                        View All Services
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {image ? (
                    <div>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="mb-6"
                      >
                        <SparklesIcon className="w-16 h-16 text-emerald-400 mx-auto" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-white mb-2">Ready for Analysis</h3>
                      <p className="text-gray-400 mb-6">
                        Click the "Identify Pest" button to analyze your image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white mb-2">No Image Selected</h3>
                      <p className="text-gray-400 mb-6">
                        Please upload an image of the pest you want to identify
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Additional Information */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-emerald-400" />
              Pest Insights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-emerald-400" />
                  Seasonal Trends
                </h3>
                <p className="text-gray-300 text-sm">
                  Pest activity typically increases during warmer months. Monitor your property more frequently during spring and summer.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-400" />
                  Regional Patterns
                </h3>
                <p className="text-gray-300 text-sm">
                  Urban areas show higher rodent activity, while rural regions experience more diverse insect infestations.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-400" />
                  Prevention Tips
                </h3>
                <p className="text-gray-300 text-sm">
                  Regular cleaning, proper food storage, and sealing entry points are the most effective preventive measures.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
