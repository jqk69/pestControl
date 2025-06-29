import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  ClockIcon,
  TagIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

export default function UserViewBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:5000/user/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // For demo purposes, create a mock blog with full content
        const mockBlog = {
          id: parseInt(id),
          title: "10 Natural Ways to Keep Ants Away from Your Home",
          excerpt: "Discover eco-friendly methods to prevent ant infestations without harmful chemicals. Learn about natural repellents and prevention strategies.",
          content: `
            <h2>Introduction to Natural Ant Control</h2>
            <p>Ants are among the most common household pests, and while they play important roles in our ecosystem, finding them marching across your kitchen counter isn't exactly welcome. Before reaching for chemical pesticides, consider these natural, eco-friendly solutions that are safer for your family, pets, and the environment.</p>
            
            <h2>Understanding Ant Behavior</h2>
            <p>Ants are social insects that live in colonies. They enter homes searching for food and water, following scent trails left by scout ants. Understanding this behavior is key to effective prevention and control.</p>
            
            <h2>10 Natural Ant Repellent Methods</h2>
            
            <h3>1. Vinegar Solution</h3>
            <p>Ants communicate through pheromones, leaving scent trails for other ants to follow. White vinegar disrupts these trails. Mix equal parts water and white vinegar in a spray bottle and apply to entry points, countertops, and anywhere you've seen ant activity.</p>
            
            <h3>2. Essential Oils</h3>
            <p>Certain essential oils repel ants naturally. Peppermint, tea tree, lemon, and eucalyptus oils are particularly effective. Add 15-20 drops to a spray bottle filled with water and spray around entry points and active areas.</p>
            
            <h3>3. Diatomaceous Earth</h3>
            <p>Food-grade diatomaceous earth is a natural powder that damages ants' exoskeletons, causing them to dehydrate. Sprinkle it around entry points, but keep it dry as it loses effectiveness when wet.</p>
            
            <h3>4. Cinnamon</h3>
            <p>Ants dislike the smell of cinnamon. Sprinkle ground cinnamon or place cinnamon sticks near entry points and ant trails to deter them naturally.</p>
            
            <h3>5. Citrus Peels and Juice</h3>
            <p>The d-limonene in citrus disrupts ants' scent trails and is toxic to them. Place citrus peels (orange, lemon, grapefruit) near entry points or make a spray with citrus juice and water.</p>
            
            <h3>6. Coffee Grounds</h3>
            <p>Used coffee grounds can be sprinkled around your home's exterior and garden to repel ants. The strong smell interferes with their scent trails.</p>
            
            <h3>7. Chalk Lines</h3>
            <p>Drawing a line of chalk creates a barrier ants won't cross. The calcium carbonate in chalk disrupts their scent trails and can be used around entry points.</p>
            
            <h3>8. Cucumber Peels</h3>
            <p>Cucumber peels contain compounds that ants find repellent. Place fresh cucumber peels in areas with ant activity to naturally deter them.</p>
            
            <h3>9. Mint Plants</h3>
            <p>Growing mint around your home's foundation or in windowsills can help keep ants away. The strong scent repels them naturally.</p>
            
            <h3>10. Proper Food Storage</h3>
            <p>Perhaps the most effective prevention method is eliminating what attracts ants in the first place. Store food in airtight containers, clean up spills immediately, and keep pet food dishes clean.</p>
            
            <h2>When to Call Professional Help</h2>
            <p>While these natural methods are effective for minor ant problems, larger infestations may require professional intervention. If you've tried multiple natural solutions without success, or if you're dealing with carpenter ants that can damage your home's structure, it's time to consult with a pest control professional.</p>
            
            <h2>Conclusion</h2>
            <p>Natural ant control methods offer effective, environmentally friendly alternatives to chemical pesticides. By combining several of these approaches and maintaining good sanitation practices, you can keep your home ant-free without compromising your family's health or the environment.</p>
          `,
          author: "Dr. Sarah Johnson",
          category: "Natural Solutions",
          date: "2024-01-15",
          readTime: "5 min read",
          likes: 124,
          views: 1256,
          featured: true,
          trending: true,
          tags: ["natural", "ants", "eco-friendly", "prevention", "home"],
          image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800"
        };
        
        // Use API response or fallback to mock data
        setBlog(response.data.blog || mockBlog);
        
        // Mock related posts
        setRelatedPosts([
          {
            id: 3,
            title: "Seasonal Pest Prevention: Year-Round Protection Tips",
            excerpt: "Prepare your home for different seasons with these comprehensive preventive measures.",
            image: "https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=800",
            date: "2024-01-10",
            author: "Lisa Rodriguez"
          },
          {
            id: 5,
            title: "DIY Pest Control: When to Call the Professionals",
            excerpt: "Learn when you can handle pest problems yourself and when it's time to call in professional help.",
            image: "https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=800",
            date: "2024-01-05",
            author: "Emma Thompson"
          }
        ]);
        
        // Mock comments
        setComments([
          {
            id: 1,
            author: "John Smith",
            date: "2024-01-20",
            text: "Great article! I tried the vinegar solution and it worked wonders for my kitchen ant problem.",
            likes: 12
          },
          {
            id: 2,
            author: "Maria Garcia",
            date: "2024-01-18",
            text: "I've been using essential oils for years. Peppermint oil is definitely the most effective in my experience.",
            likes: 8
          }
        ]);
        
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Blog not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = () => {
    setLiked(!liked);
    if (blog) {
      setBlog({
        ...blog,
        likes: blog.likes + (liked ? -1 : 1)
      });
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    
    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href
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

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      author: sessionStorage.getItem('username') || 'Anonymous User',
      date: new Date().toISOString().split('T')[0],
      text: comment,
      likes: 0
    };
    
    setComments([newComment, ...comments]);
    setComment('');
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

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
          <p className="text-gray-300 mb-6">{error || 'The requested article could not be found.'}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => navigate('/user/blog')}
            icon={<ArrowLeftIcon className="w-5 h-5" />}
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
      <ParticleField />
      
      <motion.div
        className="relative z-10 p-6 max-w-5xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => navigate('/user/blog')}
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back to Blog
          </AnimatedButton>
        </motion.div>

        {/* Article Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10" />
            
            <div className="relative z-10">
              {/* Category and Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-emerald-500/20 text-emerald-400 text-sm font-medium px-3 py-1 rounded-full">
                  {blog.category}
                </span>
                {blog.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-full flex items-center">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {blog.title}
              </h1>
              
              {/* Author and Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
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
                  <span>{blog.views.toLocaleString()} views</span>
                </div>
              </div>
              
              {/* Featured Image */}
              <div className="mb-8">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
              
              {/* Social Actions */}
              <div className="flex items-center gap-4 mb-8">
                <AnimatedButton
                  variant={liked ? "danger" : "ghost"}
                  size="sm"
                  onClick={handleLike}
                  icon={<HeartIcon className="w-4 h-4" />}
                >
                  {liked ? 'Liked' : 'Like'} ({blog.likes + (liked ? 1 : 0)})
                </AnimatedButton>
                
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  icon={<ShareIcon className="w-4 h-4" />}
                >
                  Share
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Article Content and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <GlassCard className="p-8">
              <div 
                className="prose prose-lg prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </GlassCard>
            
            {/* Comments Section */}
            <motion.div variants={itemVariants} className="mt-8">
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-emerald-400" />
                  Comments ({comments.length})
                </h2>
                
                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="mb-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <AnimatedButton
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                    >
                      Post Comment
                    </AnimatedButton>
                  </div>
                </form>
                
                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{comment.author}</h4>
                            <p className="text-xs text-gray-400">{new Date(comment.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <HeartIcon className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-400" />
                  About the Author
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                    {blog.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{blog.author}</h4>
                    <p className="text-sm text-gray-400">Pest Control Expert</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Specializing in sustainable pest management solutions with over 15 years of experience in the field.
                </p>
              </GlassCard>
            </motion.div>
            
            {/* Related Articles */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/user/blog/${post.id}`)}
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-emerald-400 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
            
            {/* Tags Cloud */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-emerald-400" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-white/10 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 text-sm px-3 py-1 rounded-full cursor-pointer transition-colors"
                      onClick={() => {
                        navigate('/user/blog');
                        // You could add logic to filter by this tag
                      }}
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
              Our expert technicians are ready to help you implement the strategies discussed in this article
            </p>
            <AnimatedButton
              variant="neon"
              size="lg"
              onClick={() => navigate('/user/services')}
              icon={<BookOpenIcon className="w-5 h-5" />}
            >
              Book a Service
            </AnimatedButton>
          </NeonCard>
        </motion.div>
      </motion.div>
    </div>
  );
}