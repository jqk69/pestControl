import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cartItems = state?.cartItems || [];

  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Login required');
      navigate('/login');
      return;
    }

    if (!location || !address || !pincode || !phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const fullAddress = `${location}, ${address}, ${pincode}`;
    const cartIds = cartItems.map((item) => item.cart_id);

    setLoading(true);

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const options = {
        key: rpzkey,
        amount: total * 100, // in paise
        currency: 'INR',
        name: 'Pest Control Services',
        description: 'Order Payment',
        handler: async function (response) {
          try {
            await axios.post(
              'http://127.0.0.1:5000/user/cart/confirm-payment',
              {
                cart_ids: cartIds,
                delivery_address: fullAddress,
                phone: phone,
                razorpay_payment_id: response.razorpay_payment_id,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            toast.success('Payment successful & Order placed!');
            navigate('/user/orders');
          } catch (err) {
            console.error(err);
            toast.error('Payment success, but order confirmation failed.');
          }
        },
        prefill: {
          contact: phone,
        },
        theme: {
          color: '#16a34a', // Green to match theme
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-900">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-100">🧾 Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Products */}
        <div className="md:col-span-2 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-100">Products in Your Cart</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-gray-400 italic">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex justify-between items-center border-b border-gray-700 pb-3"
                >
                  <div>
                    <p className="font-medium text-gray-100">{item.name}</p>
                    <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-semibold text-green-400">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-right text-lg font-bold text-green-400">
            Total: ₹{total.toFixed(2)}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-gray-100">Delivery Details</h2>

          <label className="mb-1 font-medium text-gray-300">Location</label>
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mb-4 px-4 py-3 border border-gray-700 bg-gray-900 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <label className="mb-1 font-medium text-gray-300">Address</label>
          <textarea
            placeholder="Full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mb-4 px-4 py-3 border border-gray-700 bg-gray-900 text-gray-100 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            rows={3}
          />

          <label className="mb-1 font-medium text-gray-300">Pincode</label>
          <input
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="mb-4 px-4 py-3 border border-gray-700 bg-gray-900 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <label className="mb-1 font-medium text-gray-300">Phone Number</label>
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mb-6 px-4 py-3 border border-gray-700 bg-gray-900 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <button
            onClick={handlePayment}
            disabled={loading || cartItems.length === 0}
            className="mt-auto bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-500 disabled:opacity-50 transition duration-300"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}