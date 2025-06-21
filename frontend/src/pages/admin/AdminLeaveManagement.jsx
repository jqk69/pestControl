import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/admin/technician-leaves", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/admin/technician-leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      fetchLeaves();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Technician Leave Requests</h2>
      {leaves.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <ul className="space-y-4">
          {leaves.map((leave) => (
            <li key={leave.id} className="border rounded-lg p-4 shadow-sm">
              <p><b>Technician ID:</b> {leave.technician_id}</p>
              <p><b>From:</b> {new Date(leave.start_datetime).toLocaleDateString()}</p>
              <p><b>To:</b> {new Date(leave.end_datetime).toLocaleDateString()}</p>
              <p><b>Reason:</b> {leave.reason}</p>
              <p><b>Status:</b> {leave.status}</p>
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => updateStatus(leave.id, "approved")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(leave.id, "rejected")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
