import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function UserBlog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, searchTerm, categoryFilter]);

  const fetchBlogs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/user/blogs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock data for demonstration
      const mockBlogs = [
        {
          id: 1,
          title: "10 Natural Ways to Keep Ants Away",
          excerpt: "Discover eco-friendly methods to prevent ant infestations without harmful chemicals.",
          content: "Full content here...",
          author: "Dr. Sarah Johnson",
          category: "Natural Solutions",
          date: "2024-01-15",
          readTime: "5 min read",
          likes: 24,
          views: 156,
          image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 2,
          title: "Understanding Termite Behavior",
          excerpt: "Learn about termite colonies and how to identify early signs of infestation.",
          content: "Full content here...",
          author: "Mike Chen",
          category: "Education",
          date: "2024-01-12",
          readTime: "8 min read",
          likes: 18,
          views: 203,
          image: "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 3,
          title: "Seasonal Pest Prevention Tips",
          excerpt: "Prepare your home for different seasons with these preventive measures.",
          content: "Full content here...",
          author: "Lisa Rodriguez",
          category: "Prevention",
          date: "2024-01-10",
          readTime: "6 min read",
          likes: 31,
          views: 289,
          image: "https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
      ];
      
      setBlogs(response.data.blogs || mockBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Use mock data on error
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(blog => blog.category === categoryFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBlogs(filtered);
  };

  const handleLike = (blogId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(blogId)) {
      newLikedPosts.delete(blogId);
    } else {
      newLikedPosts.add(blogId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleShare = (blog) => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href + `/${blog.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/${blog.id}`);
      // Show toast notification
    }
  };

  const categories = [...new Set(blogs.map(blog => blog.category))];

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
          <p className="text-white text-xl">Loading blog posts...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        className="relative z-10 p-6 max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4">
              Pest Control Blog
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Expert insights, tips, and guides for effective pest management
            </p>
          </GlassCard>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all" className="bg-gray-800">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Blog Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No articles found</h2>
              <p className="text-gray-400 text-lg">
                {blogs.length === 0 
                  ? 'No blog posts available at the moment'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <NeonCard className="overflow-hidden h-full flex flex-col" color="emerald">
                    {/* Blog Image */}
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-emerald-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                          {blog.category}
                        </span>
                      </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      {/* Author and Date */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>{new Date(blog.date).toLocaleDateString()}</span>
                        </div>
                        <span>{blog.readTime}</span>
                      </div>

                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <EyeIcon className="w-3 h-3" />
                            <span>{blog.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HeartIcon className={`w-3 h-3 ${likedPosts.has(blog.id) ? 'text-red-400 fill-red-400' : ''}`} />
                            <span>{blog.likes + (likedPosts.has(blog.id) ? 1 : 0)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLike(blog.id)}
                            className={`p-2 rounded-full transition-colors ${
                              likedPosts.has(blog.id) 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-white/10 text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <HeartIcon className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShare(blog)}
                            className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-emerald-400 transition-colors"
                          >
                            <ShareIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <div className="mt-4">
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/user/blog/${blog.id}`)}
                          icon={<DocumentTextIcon className="w-4 h-4" />}
                          className="w-full"
                        >
                          Read More
                        </AnimatedButton>
                      </div>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}