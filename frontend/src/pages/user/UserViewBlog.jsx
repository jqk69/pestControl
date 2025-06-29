import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function UserViewBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    fetchBlog();
    fetchRelatedBlogs();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:5000/user/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock data for demonstration
      const mockBlog = {
        id: parseInt(id),
        title: "10 Natural Ways to Keep Ants Away",
        content: `
          <h2>Introduction</h2>
          <p>Ants are among the most common household pests, and while they play important roles in ecosystems, they can become problematic when they invade our homes. Rather than reaching for harsh chemicals, there are many natural, eco-friendly methods to keep ants at bay.</p>
          
          <h2>1. Coffee Grounds</h2>
          <p>Used coffee grounds are an excellent natural ant deterrent. Sprinkle them around entry points, ant trails, and areas where you've seen ant activity. The strong scent disrupts their pheromone trails.</p>
          
          <h2>2. Cinnamon</h2>
          <p>Cinnamon, whether in powder form or as essential oil, is highly effective against ants. They dislike the strong scent and will avoid areas where cinnamon is present.</p>
          
          <h2>3. White Vinegar</h2>
          <p>Create a solution of equal parts water and white vinegar. Spray this mixture along ant trails and entry points. The acidic nature of vinegar disrupts their scent trails.</p>
          
          <h2>4. Lemon Juice</h2>
          <p>The citric acid in lemon juice is a natural ant repellent. Squeeze fresh lemon juice around windowsills, door frames, and other potential entry points.</p>
          
          <h2>5. Diatomaceous Earth</h2>
          <p>Food-grade diatomaceous earth is safe for humans and pets but deadly to ants. Sprinkle a thin line around areas where ants are active.</p>
          
          <h2>Conclusion</h2>
          <p>These natural methods are not only effective but also safe for your family and the environment. Remember that consistency is key – reapply these natural deterrents regularly for best results.</p>
        `,
        author: "Dr. Sarah Johnson",
        category: "Natural Solutions",
        date: "2024-01-15",
        readTime: "5 min read",
        likes: 24,
        views: 156,
        image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["Natural", "Eco-friendly", "DIY", "Prevention"]
      };
      
      setBlog(response.data.blog || mockBlog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:5000/user/blogs/related/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock related blogs
      const mockRelated = [
        {
          id: 2,
          title: "Understanding Termite Behavior",
          excerpt: "Learn about termite colonies and how to identify early signs of infestation.",
          image: "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=300"
        },
        {
          id: 3,
          title: "Seasonal Pest Prevention Tips",
          excerpt: "Prepare your home for different seasons with these preventive measures.",
          image: "https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=300"
        }
      ];
      
      setRelatedBlogs(response.data.blogs || mockRelated);
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      setRelatedBlogs([]);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Here you would typically make an API call to update the like status
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
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
          <p className="text-white text-xl">Loading article...</p>
        </motion.div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
          <p className="text-gray-300 mb-6">The article you're looking for doesn't exist.</p>
          <AnimatedButton
            variant="primary"
            onClick={() => navigate('/user/blog')}
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back to Blog
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        className="relative z-10 p-6 max-w-4xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <AnimatedButton
            variant="ghost"
            onClick={() => navigate('/user/blog')}
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back to Blog
          </AnimatedButton>
        </motion.div>

        {/* Article Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-emerald-500/80 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full">
                  {blog.category}
                </span>
              </div>
            </div>

            {/* Article Info */}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{blog.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>{blog.views} views</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 text-emerald-400 rounded-full text-sm"
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    liked 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-white/10 text-gray-400 hover:text-red-400 border border-white/20'
                  }`}
                >
                  <HeartIcon className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{blog.likes + (liked ? 1 : 0)}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-400 hover:text-emerald-400 transition-colors border border-white/20"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Article Content */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8">
            <div 
              className="prose prose-invert prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{
                color: '#e5e7eb',
                lineHeight: '1.8'
              }}
            />
          </GlassCard>
        </motion.div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <motion.div
                    key={relatedBlog.id}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => navigate(`/user/blog/${relatedBlog.id}`)}
                  >
                    <NeonCard className="p-4 h-full" color="blue">
                      <div className="flex gap-4">
                        <img
                          src={relatedBlog.image}
                          alt={relatedBlog.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2 line-clamp-2">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {relatedBlog.excerpt}
                          </p>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}