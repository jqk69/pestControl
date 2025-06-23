import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ShoppingBag, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your cart');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://127.0.0.1:5000/user/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      toast.error('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:5000/user/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  // Buy single product from cart
  const handleBuySingle = (item) => {
    navigate('/user/checkout', { state: { cartItems: [item] } });
  };

  // Buy all items in cart
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/user/checkout', { state: { cartItems } });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex justify-center items-center bg-gray-900">
        <div className="animate-spin h-12 w-12 border-t-4 border-green-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-900">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-100">🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-400">Cart is empty.</div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.cart_id}
              className="bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-700 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => (e.target.src = '/placeholder-image.jpg')} // Fallback image
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-100">{item.name}</h2>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  <p className="text-sm text-green-400 font-medium">₹{item.price} each</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-500 flex items-center gap-1 transition duration-300"
                >
                  <Trash2 size={16} /> Remove
                </button>
                <button
                  onClick={() => handleBuySingle(item)}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-500 flex items-center gap-1 transition duration-300"
                >
                  <ShoppingBag size={16} /> Buy
                </button>
              </div>
            </div>
          ))}

          <div className="text-right text-xl font-bold text-green-400">
            Total: ₹{total.toFixed(2)}
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-500 font-semibold flex items-center justify-center gap-2 transition duration-300"
          >
            <MapPin size={18} /> Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}