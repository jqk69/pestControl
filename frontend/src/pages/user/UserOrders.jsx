import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const STATUSES = ['all', 'ordered', 'shipped', 'delivered', 'cancelled'];

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your orders');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:5000/user/cart/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on filterStatus
  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status?.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center bg-gray-900">
        <div className="animate-spin h-12 w-12 border-t-4 border-green-500 rounded-full"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center bg-gray-900">
        <p className="text-lg text-gray-400">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-extrabold text-gray-100">📦 Your Orders</h1>

        {/* Status Filter */}
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 font-medium text-gray-300">
            Filter by status:
          </label>
          <select
            id="statusFilter"
            className="border border-gray-700 bg-gray-800 text-gray-100 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'All'
                  : status
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-400">No orders found for selected status.</p>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((item) => (
            <div
              key={item.cart_id}
              className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-xl border border-gray-700 transition-shadow duration-300"
            >
              <div className="flex-1 w-full md:pr-8">
                <h2 className="text-2xl font-semibold text-gray-100">{item.name}</h2>
                <div className="mt-2 space-y-1 text-gray-400">
                  <p>
                    <span className="font-medium text-gray-300">Quantity:</span> {item.quantity}
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">Status:</span>{' '}
                    <span
                      className={`capitalize font-semibold ${
                        item.status === 'delivered'
                          ? 'text-green-400'
                          : item.status === 'cancelled'
                          ? 'text-red-400'
                          : item.status === 'in_cart'
                          ? 'text-blue-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </p>
                  {item.delivery_address && (
                    <p>
                      <span className="font-medium text-gray-300">Delivery Address:</span>{' '}
                      <span className="text-gray-400">{item.delivery_address}</span>
                    </p>
                  )}
                  {item.phone && (
                    <p>
                      <span className="font-medium text-gray-300">Phone:</span>{' '}
                      <span className="text-gray-400">{item.phone}</span>
                    </p>
                  )}
                  {item.order_date && (
                    <p>
                      <span className="font-medium text-gray-300">Order Date:</span>{' '}
                      <span className="text-gray-400">
                        {new Date(item.order_date).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-end">
                <div className="text-3xl font-bold text-green-400">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}