import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ShoppingBag, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.get("http://127.0.0.1:5000/user/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const removeFromCart = async (productId) => {
    const token = sessionStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:5000/user/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Failed to remove item from cart.");
    }
  };

  // Buy single product from cart
  const handleBuySingle = (item) => {
    // Navigate to checkout page with just this single item
    navigate("checkout", { state: { cartItems: [item] } });
  };

  // Buy all items in cart
  const handleProceedToCheckout = () => {
    navigate("checkout", { state: { cartItems } });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 to-white">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-600">Cart is empty.</div>
      ) : (
        <div className="space-y-6">
          {cartItems.map(item => (
            <div key={item.cart_id} className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-600 font-medium">₹ {item.price} each</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center gap-1"
                >
                  <Trash2 size={16} /> Remove
                </button>
                <button
                  onClick={() => handleBuySingle(item)}
                  className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 flex items-center gap-1"
                >
                  <ShoppingBag size={16} /> Buy
                </button>
              </div>
            </div>
          ))}

          <div className="text-right text-xl font-bold text-gray-800">
            Total: ₹ {total}
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
          >
            <MapPin size={18} /> Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
