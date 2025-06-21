import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

export default function UserServiceCart() {
  const [status, setStatus] = useState('pending');
  const [allBookings, setAllBookings] = useState([]);
  const [mapPos, setMapPos] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackBookingId, setFeedbackBookingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const navigate = useNavigate();

  const filteredBookings = useMemo(() => {
    const grouped = {};
    allBookings.forEach(b => {
      if (b.status !== status) return;
      if (!grouped[b.booking_id]) {
        grouped[b.booking_id] = { ...b, technicians: new Set() };
      }
      if (b.technician_name) {
        grouped[b.booking_id].technicians.add(b.technician_name);
      }
    });

    return Object.values(grouped).map(b => ({
      ...b,
      technician_name: b.technicians.size
        ? Array.from(b.technicians).join(', ')
        : 'Not assigned'
    }));
  }, [status, allBookings]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/user/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllBookings(response.data.bookings || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  function openMap(lat, lng) {
    setMapPos({ lat, lng });
    setMapOpen(true);
  }

  function closeMap() {
    setMapOpen(false);
    setMapPos(null);
  }

  function handlePayBill(bookingId) {
    navigate(`/user/service/payment/${bookingId}`);
  }

  function handleFeedbackAction(booking) {
    if (booking.feedback) {
      setViewingFeedback(booking.feedback);
    } else {
      setFeedbackBookingId(booking.booking_id);
      setFeedbackText('');
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  const statusButtonColors = {
    pending: 'bg-yellow-500 hover:bg-yellow-600',
    confirmed: 'bg-blue-600 hover:bg-blue-700',
    completed: 'bg-green-600 hover:bg-green-700'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-8xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Service History</h2>
          <div className="flex space-x-2">
            {['pending', 'confirmed', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  status === s ? statusButtonColors[s] + ' text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No {status} services found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                      <div className="text-sm text-gray-500">ID: {booking.booking_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 mb-1">
                        Date: {new Date(booking.booking_date).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-900 mb-1">
                        Technician: {booking.technician_name}
                      </div>
                      <div className="text-sm text-gray-900">
                        Amount: {booking.bill_amount ? `₹${booking.bill_amount}` : 'Not billed yet'}
                      </div>
                      {booking.status === 'completed' && booking.feedback && (
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Feedback:</span> {booking.feedback.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      {booking.location_lat && booking.location_lng && (
                        <button onClick={() => openMap(booking.location_lat, booking.location_lng)} className="text-blue-600 hover:text-blue-800">
                          View Location
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button onClick={() => handlePayBill(booking.booking_id)} className="text-yellow-600 hover:text-yellow-800">
                          Pay Bill
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button 
                          onClick={() => handleFeedbackAction(booking)}
                          className={`${booking.feedback ? 'text-purple-600 hover:text-purple-800' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {booking.feedback ? 'View Feedback' : 'Add Feedback'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {mapOpen && mapPos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-96 relative">
            <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100" onClick={closeMap}>
              ×
            </button>
            <MapContainer center={[mapPos.lat, mapPos.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[mapPos.lat, mapPos.lng]}>
                <Popup>Service Location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setFeedbackBookingId(null)} className="absolute top-2 right-3 text-gray-600 hover:text-black text-2xl">
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmittingFeedback(true);
                try {
                  const token = sessionStorage.getItem('token');
                  await axios.patch(
                    'http://127.0.0.1:5000/user/feedback',
                    {
                      booking_id: feedbackBookingId,
                      feedback: feedbackText
                    },
                    {
                      headers: { Authorization: `Bearer ${token}` }
                    }
                  );
                  // Refresh bookings to show the new feedback
                  const response = await axios.get('http://127.0.0.1:5000/user/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setAllBookings(response.data.bookings || []);
                  alert('Feedback submitted successfully!');
                  setFeedbackBookingId(null);
                } catch (err) {
                  console.error(err);
                  alert('Failed to submit feedback');
                } finally {
                  setSubmittingFeedback(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Write your feedback..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setViewingFeedback(null)} className="absolute top-2 right-3 text-gray-600 hover:text-black text-2xl">
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Your Feedback</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-800">{viewingFeedback}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setViewingFeedback(null)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}