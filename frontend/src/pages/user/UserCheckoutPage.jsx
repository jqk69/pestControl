import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cartItems = state?.cartItems || [];

  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

 const handlePayment = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return alert("Login required");

  if (!location || !address || !pincode || !phone) {
    return alert("Please fill in all fields");
  }

  const fullAddress = `${location}, ${address}, ${pincode}`;
  const cartIds = cartItems.map((item) => item.cart_id);

  setLoading(true);

  const res = await loadRazorpayScript();
  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    setLoading(false);
    return;
  }

  try {
    const options = {
      key: rpzkey, // your Razorpay Key (test mode key)
      amount: total * 100, // in paise
      currency: "INR",
      name: "Pest Control Services",
      description: "Order Payment",
      handler: async function (response) {
        try {
          // Call backend to confirm order after payment success
          await axios.post(
            "http://127.0.0.1:5000/user/cart/confirm-payment",
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

          alert("Payment successful & Order placed!");
          navigate("/user/cart");
        } catch (err) {
          console.error(err);
          alert("Payment success, but order confirmation failed.");
        }
      },
      prefill: {
        contact: phone,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert("Checkout failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">🧾 Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Products */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Products in Your Cart
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-gray-500 italic">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex justify-between items-center border-b border-gray-200 pb-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="font-semibold text-gray-800">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-right text-lg font-bold text-indigo-700">
            Total: ₹{total}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Delivery Details
          </h2>

          <label className="mb-1 font-medium text-gray-700">Location</label>
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mb-4 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <label className="mb-1 font-medium text-gray-700">Address</label>
          <textarea
            placeholder="Full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mb-4 px-4 py-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            rows={3}
          />

          <label className="mb-1 font-medium text-gray-700">Pincode</label>
          <input
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="mb-4 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <label className="mb-1 font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mb-6 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <button
            onClick={handlePayment}
            disabled={loading || cartItems.length === 0}
            className="mt-auto bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
