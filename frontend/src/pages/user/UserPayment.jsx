import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';

export default function UserPayment() {
  const { id: bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const navigate = useNavigate();
  const rpzkey = import.meta.env.VITE_RAZORPAY_KEY;

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadScript = async () => {
      try {
        // Check if script is already loaded
        if (window.Razorpay) {
          setScriptLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          setScriptLoaded(true);
        };
        script.onerror = () => {
          console.error("Razorpay script failed to load");
          setScriptLoaded(false);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error("Error loading Razorpay script:", err);
        setScriptLoaded(false);
      }
    };

    loadScript();

    // Cleanup
    return () => {
      const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (razorpayScript) {
        document.body.removeChild(razorpayScript);
      }
    };
  }, []);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`http://127.0.0.1:5000/user/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookingDetails(res.data);
        console.log(res.data.bookingDetails);
        
        if (res.data.bookingDetails.status !== 'pending') {
            navigate('user/service-history');
          }
      } catch (err) {
        console.error("Failed to fetch booking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert("Razorpay is still loading. Please wait a moment and try again.");
      return;
    }

    if (!bookingDetails) {
      alert("Booking details not loaded yet.");
      return;
    }

    if (!rpzkey) {
      alert("Razorpay key is missing. Please contact support.");
      return;
    }

    try {
      const { amount, user_email, user_contact } = bookingDetails;

      const options = {
        key: rpzkey,
        amount: Math.round(amount * 100), // Ensure amount is in paise and integer
        currency: "INR",
        name: "Your Company",
        description: `Payment for Booking #${bookingId}`,
        image: "https://yourdomain.com/logo.png",
        handler: async function (response) {
  console.log("Razorpay payment response:", response);
  // Then send response as is:
  const token = sessionStorage.getItem("token");
  await axios.post("http://127.0.0.1:5000/payment/verify", {
    booking_id: bookingId,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
    amount: bookingDetails.amount
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  alert("Payment successful!");
  navigate("/user/service-history");
}
,
        prefill: {
          email: user_email || "",
          contact: user_contact || ""
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            console.log("Payment window closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error creating Razorpay instance:", err);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  if (loading) return <div className="text-center p-8">Loading booking details...</div>;
  if (!bookingDetails) return <div className="text-center p-8">Booking not found</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
      <div className="mb-6">
        <p className="text-gray-700 mb-2"><span className="font-semibold">Booking ID:</span> {bookingId}</p>
        <p className="text-gray-700 mb-2"><span className="font-semibold">Amount:</span> ₹{bookingDetails.amount}</p>
      </div>
      <button
        onClick={handlePayment}
        disabled={!scriptLoaded || !bookingDetails}
        className={`w-full py-3 px-4 rounded-md font-medium text-white ${(!scriptLoaded || !bookingDetails) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {!scriptLoaded ? "Loading Payment..." : "Pay Now"}
      </button>
      
      {!scriptLoaded && (
        <p className="mt-2 text-sm text-yellow-600">Please wait while we load the payment gateway...</p>
      )}
    </div>
  );
}