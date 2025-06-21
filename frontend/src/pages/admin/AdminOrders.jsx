import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast} from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ordered');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    }
  };

  const updateOrderStatus = async (cartId, newStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:5000/admin/orders/${cartId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev =>
        prev.map(order =>
          order.cart_id === cartId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order ${newStatus === 'shipped' ? 'shipped' : 'cancelled'} successfully`);
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.status === statusFilter &&
      (order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Orders Panel</h2>

      <div className="flex mb-4 gap-4">
        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ordered">Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Search by product or user"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.cart_id}
              className="flex justify-between items-center bg-white shadow p-4 rounded"
            >
              <div>
                <p><strong>Order ID:</strong> {order.cart_id}</p>
                <p><strong>Product:</strong> {order.product_name}</p>
                <p><strong>Customer:</strong> {order.user_name}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Address:</strong> {order.delivery_address}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
              </div>
              {order.status === 'ordered' && (
                <div className="space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.cart_id, 'shipped')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.cart_id, 'cancelled')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
