import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCustomReq() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:5000/admin/bookings/history', {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.data.success) {
          setBookings(res.data.data);
          setFilteredBookings(res.data.data);
        } else {
          setError('Failed to fetch booking history');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Server error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.user_name.toLowerCase().includes(query) ||
        b.user_phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, bookings]);

  if (loading) return <div className="p-6 text-center">Loading booking history...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Service Booking History</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          className="border rounded px-4 py-2 w-full md:w-1/2"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="border rounded px-4 py-2 w-full md:w-1/3"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-gray-500 text-center">No bookings match your criteria.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow-md text-sm">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Technicians</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.booking_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{b.booking_id}</td>
                  <td className="p-3">{new Date(b.booking_date).toLocaleString()}</td>
                  <td className="p-3 capitalize">{b.status}</td>
                  <td className="p-3">{b.user_name}</td>
                  <td className="p-3">{b.user_phone}</td>
                  <td className="p-3">{b.service_name}</td>
                  <td className="p-3">{b.category}</td>
                  <td className="p-3">₹{b.price}</td>
                  <td className="p-3">{b.technicians_assigned || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
