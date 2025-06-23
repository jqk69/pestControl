import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BellIcon,
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserDashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'How can I assist you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [stats, setStats] = useState({
    familiesProtected: 10000,
    satisfaction: 95,
    support: '24/7'
  });
  const username = sessionStorage.getItem('username');
  const navigate = useNavigate();

  const handleNavigate = (e, path) => {
    e.preventDefault();
    navigate(`/user/${path}`);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...chatMessages, { type: 'user', text: userInput }];
    setChatMessages(newMessages);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/user/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      const reply = data.reply || "Sorry, I didn't understand that.";
      setChatMessages((prev) => [...prev, { type: 'bot', text: reply }]);
      setUserInput('');
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Sorry, something went wrong. Please try again.' },
      ]);
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

  const testimonials = [
    { quote: 'Pestilee solved my ant problem in 24 hours!', author: 'Sarah K.', rating: 5 },
    { quote: 'The team was professional and thorough.', author: 'Michael T.', rating: 5 },
    { quote: 'Very friendly and quick service!', author: 'Anita P.', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />
      
      <motion.div
        className="relative z-10 p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            >
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Welcome back, {username}!
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Your premium pest control solution awaits
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <AnimatedButton
                variant="neon"
                size="lg"
                onClick={(e) => handleNavigate(e, 'services')}
                icon={<ArrowRightIcon className="w-5 h-5" />}
              >
                Book Your Service
              </AnimatedButton>
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Main CTA Section */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-8 relative overflow-hidden" color="emerald">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Ready for a Pest-Free Home?
                  </h2>
                  <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                    Join thousands of satisfied customers who trust us with their pest control needs. 
                    Professional, eco-friendly, and guaranteed results.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <AnimatedButton
                      variant="primary"
                      size="lg"
                      onClick={(e) => handleNavigate(e, 'services')}
                      icon={<ShieldCheckIcon className="w-5 h-5" />}
                    >
                      Book Service Now
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      size="lg"
                      onClick={(e) => handleNavigate(e, 'store')}
                      icon={<SparklesIcon className="w-5 h-5" />}
                    >
                      Browse Products
                    </AnimatedButton>
                  </div>
                </div>
                <motion.div
                  className="hidden lg:block"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </NeonCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: UserGroupIcon, 
                label: 'Families Protected', 
                value: '10,000+', 
                color: 'emerald',
                description: 'Happy customers worldwide'
              },
              { 
                icon: HeartIcon, 
                label: 'Satisfaction Rate', 
                value: '99%', 
                color: 'pink',
                description: 'Customer satisfaction guaranteed'
              },
              { 
                icon: ClockIcon, 
                label: 'Support', 
                value: '24/7', 
                color: 'blue',
                description: 'Round-the-clock assistance'
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <NeonCard className="p-6 text-center" color={stat.color}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 + index * 0.2, type: 'spring' }}
                  >
                    <stat.icon className={`w-12 h-12 mx-auto mb-4 text-${stat.color}-400`} />
                  </motion.div>
                  <h3 className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                    {stat.value}
                  </h3>
                  <p className="text-white font-semibold mb-1">{stat.label}</p>
                  <p className="text-gray-400 text-sm">{stat.description}</p>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Book Emergency Service', path: 'services', icon: ShieldCheckIcon, urgent: true },
                  { name: 'View Service History', path: 'service-history', icon: ClockIcon },
                  { name: 'Browse Products', path: 'store', icon: SparklesIcon },
                  { name: 'Track Orders', path: 'orders', icon: ChartBarIcon },
                ].map((action) => (
                  <motion.div
                    key={action.name}
                    whileHover={{ x: 5 }}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      action.urgent 
                        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={(e) => handleNavigate(e, action.path)}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className={`w-5 h-5 ${action.urgent ? 'text-red-400' : 'text-emerald-400'}`} />
                      <span className="text-white font-medium">{action.name}</span>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Testimonials */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-400" />
                Customer Love
              </h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2 + index * 0.2 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 italic mb-2">"{testimonial.quote}"</p>
                    <p className="text-emerald-400 font-medium text-sm">— {testimonial.author}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Chat Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-2xl shadow-emerald-500/25 flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: [
            '0 0 20px rgba(16, 185, 129, 0.3)',
            '0 0 40px rgba(16, 185, 129, 0.6)',
            '0 0 20px rgba(16, 185, 129, 0.3)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
      </motion.button>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] z-50"
          >
            <GlassCard className="h-full flex flex-col">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    AI Assistant
                  </h3>
                  <button
                    onClick={toggleChat}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {chatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                            : 'bg-white/10 text-gray-200 border border-white/20'
                        }`}
                      >
                        {msg.text.split('\n').map((line, i) => (
                          <p key={i} className="text-sm">{line}</p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t border-white/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    className="px-4"
                  >
                    Send
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}