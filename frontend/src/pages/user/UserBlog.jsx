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
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
  BookOpenIcon,
  TrendingUpIcon,
  FireIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserBlog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [featuredPost, setFeaturedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, searchTerm, categoryFilter, sortBy]);

  const fetchBlogs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/user/blogs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Enhanced mock data for demonstration
      const mockBlogs = [
        {
          id: 1,
          title: "10 Natural Ways to Keep Ants Away from Your Home",
          excerpt: "Discover eco-friendly methods to prevent ant infestations without harmful chemicals. Learn about natural repellents and prevention strategies.",
          content: "Full content here...",
          author: "Dr. Sarah Johnson",
          category: "Natural Solutions",
          date: "2024-01-15",
          readTime: "5 min read",
          likes: 124,
          views: 1256,
          featured: true,
          trending: true,
          tags: ["natural", "ants", "eco-friendly"],
          image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
          id: 2,
          title: "Understanding Termite Behavior and Colony Structure",
          excerpt: "Learn about termite colonies and how to identify early signs of infestation before they cause serious damage to your property.",
          content: "Full content here...",
          author: "Mike Chen",
          category: "Education",
          date: "2024-01-12",
          readTime: "8 min read",
          likes: 89,
          views: 2103,
          featured: false,
          trending: false,
          tags: ["termites", "education", "prevention"],
          image: "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
          id: 3,
          title: "Seasonal Pest Prevention: Year-Round Protection Tips",
          excerpt: "Prepare your home for different seasons with these comprehensive preventive measures and seasonal pest control strategies.",
          content: "Full content here...",
          author: "Lisa Rodriguez",
          category: "Prevention",
          date: "2024-01-10",
          readTime: "6 min read",
          likes: 156,
          views: 1789,
          featured: false,
          trending: true,
          tags: ["seasonal", "prevention", "tips"],
          image: "https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
          id: 4,
          title: "The Science Behind Modern Pest Control Methods",
          excerpt: "Explore the latest innovations in pest control technology and how modern methods are safer and more effective than ever.",
          content: "Full content here...",
          author: "Dr. James Wilson",
          category: "Technology",
          date: "2024-01-08",
          readTime: "10 min read",
          likes: 203,
          views: 3421,
          featured: false,
          trending: false,
          tags: ["technology", "science", "innovation"],
          image: "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
          id: 5,
          title: "DIY Pest Control: When to Call the Professionals",
          excerpt: "Learn when you can handle pest problems yourself and when it's time to call in professional pest control services.",
          content: "Full content here...",
          author: "Emma Thompson",
          category: "DIY",
          date: "2024-01-05",
          readTime: "7 min read",
          likes: 78,
          views: 1432,
          featured: false,
          trending: false,
          tags: ["diy", "professional", "advice"],
          image: "https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=800"
        },
        {
          id: 6,
          title: "Common Household Pests and How to Identify Them",
          excerpt: "A comprehensive guide to identifying the most common household pests and understanding their behavior patterns.",
          content: "Full content here...",
          author: "Robert Kim",
          category: "Identification",
          date: "2024-01-03",
          readTime: "12 min read",
          likes: 267,
          views: 4156,
          featured: false,
          trending: true,
          tags: ["identification", "household", "guide"],
          image: "https://images.pexels.com/photos/5418320/pexels-photo-5418320.jpeg?auto=compress&cs=tinysrgb&w=800"
        }
      ];
      
      setBlogs(response.data.blogs || mockBlogs);
      setFeaturedPost(mockBlogs.find(blog => blog.featured) || mockBlogs[0]);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs.filter(blog => !blog.featured); // Exclude featured post from main grid
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(blog => blog.category === categoryFilter);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower) ||
        blog.author.toLowerCase().includes(searchLower) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Sort blogs
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      default: // latest
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    setFilteredBlogs(filtered);
  };

  const handleLike = async (blogId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(blogId)) {
      newLikedPosts.delete(blogId);
    } else {
      newLikedPosts.add(blogId);
    }
    setLikedPosts(newLikedPosts);

    // Update blog likes count
    setBlogs(prev => prev.map(blog => 
      blog.id === blogId 
        ? { ...blog, likes: blog.likes + (newLikedPosts.has(blogId) ? 1 : -1) }
        : blog
    ));
  };

  const handleShare = async (blog) => {
    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: `${window.location.origin}/user/blog/${blog.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy link');
      }
    }
  };

  const categories = [...new Set(blogs.map(blog => blog.category))];
  const trendingBlogs = blogs.filter(blog => blog.trending).slice(0, 3);

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
          <p className="text-white text-xl">Loading amazing content...</p>
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
        {/* Hero Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
              className="relative z-10"
            >
              <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Pest Control Insights
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Expert insights, proven strategies, and the latest innovations in pest management
            </motion.p>
          </GlassCard>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
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

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="latest" className="bg-gray-800">Latest</option>
                  <option value="popular" className="bg-gray-800">Most Popular</option>
                  <option value="liked" className="bg-gray-800">Most Liked</option>
                  <option value="trending" className="bg-gray-800">Trending</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Featured Article */}
        {featuredPost && (
          <motion.div variants={itemVariants}>
            <NeonCard className="overflow-hidden" color="emerald">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="relative">
                  <motion.img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 lg:h-full object-cover rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-lg">
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-500/20 text-emerald-400 text-sm font-medium px-3 py-1 rounded-full">
                      {featuredPost.category}
                    </span>
                    {featuredPost.trending && (
                      <span className="bg-red-500/20 text-red-400 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                        <TrendingUpIcon className="w-3 h-3 mr-1" />
                        Trending
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4 hover:text-emerald-400 transition-colors cursor-pointer">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <EyeIcon className="w-4 h-4" />
                        <span>{featuredPost.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <HeartIcon className="w-4 h-4" />
                        <span>{featuredPost.likes}</span>
                      </div>
                    </div>

                    <AnimatedButton
                      variant="neon"
                      size="lg"
                      onClick={() => navigate(`/user/blog/${featuredPost.id}`)}
                      icon={<BookOpenIcon className="w-5 h-5" />}
                    >
                      Read Article
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </NeonCard>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blog Posts */}
          <div className="lg:col-span-3">
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
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                      <NeonCard className="overflow-hidden h-full flex flex-col" color="blue">
                        {/* Blog Image */}
                        <div className="relative h-48 overflow-hidden">
                          <motion.img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-blue-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                              {blog.category}
                            </span>
                            {blog.trending && (
                              <span className="bg-red-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                <FireIcon className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(blog.id);
                              }}
                              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                                likedPosts.has(blog.id) 
                                  ? 'bg-red-500/80 text-white' 
                                  : 'bg-white/20 text-white hover:bg-red-500/80'
                              }`}
                            >
                              <HeartIcon className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(blog);
                              }}
                              className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-emerald-500/80 transition-colors"
                            >
                              <ShareIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Blog Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer">
                            {blog.title}
                          </h3>
                          
                          <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                            {blog.excerpt}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags && blog.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-full flex items-center">
                                <TagIcon className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Author and Date */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                <span>{blog.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3 h-3" />
                                <span>{new Date(blog.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className="text-blue-400">{blog.readTime}</span>
                          </div>

                          {/* Stats and Read Button */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <EyeIcon className="w-3 h-3" />
                                <span>{blog.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HeartIcon className={`w-3 h-3 ${likedPosts.has(blog.id) ? 'text-red-400 fill-red-400' : ''}`} />
                                <span>{blog.likes + (likedPosts.has(blog.id) ? 1 : 0)}</span>
                              </div>
                            </div>

                            <AnimatedButton
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/user/blog/${blog.id}`)}
                              icon={<BookOpenIcon className="w-4 h-4" />}
                            >
                              Read
                            </AnimatedButton>
                          </div>
                        </div>
                      </NeonCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Posts */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-red-400" />
                  Trending Now
                </h3>
                <div className="space-y-4">
                  {trendingBlogs.map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/user/blog/${blog.id}`)}
                    >
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-emerald-400 transition-colors">
                          {blog.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <EyeIcon className="w-3 h-3" />
                          <span>{blog.views.toLocaleString()}</span>
                          <HeartIcon className="w-3 h-3" />
                          <span>{blog.likes}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Categories */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-emerald-400" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <motion.button
                    onClick={() => setCategoryFilter('all')}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      categoryFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'hover:bg-white/5 text-gray-300 hover:text-white'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Categories</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                        {blogs.length}
                      </span>
                    </div>
                  </motion.button>
                  
                  {categories.map(category => {
                    const count = blogs.filter(blog => blog.category === category).length;
                    return (
                      <motion.button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          categoryFilter === category
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'hover:bg-white/5 text-gray-300 hover:text-white'
                        }`}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category}</span>
                          <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                            {count}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div variants={itemVariants}>
              <NeonCard className="p-6 text-center" color="purple">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get the latest pest control tips and insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <AnimatedButton
                    variant="purple"
                    size="sm"
                    className="w-full"
                    icon={<DocumentTextIcon className="w-4 h-4" />}
                  >
                    Subscribe
                  </AnimatedButton>
                </div>
              </NeonCard>
            </motion.div>

            {/* Popular Tags */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-emerald-400" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['prevention', 'natural', 'eco-friendly', 'ants', 'termites', 'rodents', 'diy', 'professional', 'seasonal'].map(tag => (
                    <span 
                      key={tag} 
                      className="bg-white/10 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 text-sm px-3 py-1 rounded-full cursor-pointer transition-colors"
                      onClick={() => setSearchTerm(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
        
        {/* Call to Action */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-8 text-center" color="blue">
            <h2 className="text-3xl font-bold text-white mb-4">Need Professional Pest Control?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our expert technicians are ready to help you implement the strategies discussed in our articles
            </p>
            <AnimatedButton
              variant="neon"
              size="lg"
              onClick={() => navigate('/user/services')}
              icon={<BugAntIcon className="w-5 h-5" />}
            >
              Book a Service
            </AnimatedButton>
          </NeonCard>
        </motion.div>
      </motion.div>
    </div>
  );
}