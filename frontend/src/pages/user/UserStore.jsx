import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Leaf, ShoppingCart, Zap, Search, Filter, Star, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserStore() {
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/user/store', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetched = response.data?.items || [];
      const recommended = response.data?.recommended || [];

      setProducts(fetched);
      setRecommendedProducts(recommended);
      filterProducts(fetched, searchTerm, activeCategory, sortOption, recommended);
    } catch (error) {
      console.error('Error fetching products:', error);
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
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
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
    if (quantity > product.inventory_amount) {
      alert(`Only ${product.inventory_amount} left in stock.`);
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
        const addButton = document.getElementById(`add-to-cart-${product.id}`);
        if (addButton) {
          addButton.textContent = '✓ Added!';
          addButton.classList.add('bg-green-500', 'text-white');
          setTimeout(() => {
            addButton.textContent = 'Add to Cart';
            addButton.classList.remove('bg-green-500', 'text-white');
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
    if (quantity > product.inventory_amount) {
      alert(`Only ${product.inventory_amount} left in stock.`);
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
        <Star
          key={star}
          size={16}
          className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="bg-gradient-to-r from-green-600 to-teal-500 py-16 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Pest Control Solutions</h1>
        <p className="text-xl mb-8">Effective, safe, and eco-friendly products for your home</p>
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-300" />
          </div>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['all', 'sustainable', 'Recommended'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === cat
                    ? (cat === 'sustainable'
                        ? 'bg-green-600'
                        : cat === 'Recommended'
                        ? 'bg-amber-500'
                        : 'bg-teal-500') + ' text-white shadow-md'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  {cat === 'sustainable' && <Leaf size={16} />}
                  {cat === 'Recommended' && <Star size={16} />}
                  {cat === 'all' ? 'All Products' : cat === 'sustainable' ? 'Eco-Friendly' : 'Recommended'}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-1 bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-700 text-gray-300"
            >
              <Filter size={16} />
              <span>Sort: {sortOption.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              <ChevronDown size={16} className={`transition ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                <div className="py-1">
                  {['featured', 'price-low', 'price-high', 'rating', 'newest'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortOption(opt);
                        setShowSortDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-gray-300"
                    >
                      {opt.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative"
              >
                <div className="absolute top-2 left-2 z-10 flex space-x-2">
                  {product.best_seller && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Best Seller
                    </span>
                  )}
                  {product.category === 'sustainable' && (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                      <Leaf size={12} className="mr-1" /> Eco
                    </span>
                  )}
                </div>

                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={`http://127.0.0.1:5000/static/products/${product.image_path}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 truncate text-gray-100">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                  {product.rating && renderStars(product.rating)}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-green-400">₹{product.price}</span>
                    {product.original_price && (
                      <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border rounded-lg overflow-hidden border-gray-700">
                      <button
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.inventory_amount}
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="w-12 text-center bg-gray-800 text-gray-100 border-x border-gray-700"
                      />
                      <button
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      id={`add-to-cart-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center justify-center gap-1 bg-gray-700 text-gray-100 hover:bg-green-600 px-3 py-2 rounded-lg font-medium transition duration-300"
                    >
                      <ShoppingCart size={16} /> Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="flex items-center justify-center gap-1 bg-green-600 text-white hover:bg-green-500 px-3 py-2 rounded-lg font-medium transition duration-300"
                    >
                      <Zap size={16} /> Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300">No products found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition duration-300"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}