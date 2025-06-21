import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TechnicianLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ start_datetime: '', end_datetime: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/technician/leaves", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });

      const data = res.data;
      if (Array.isArray(data)) {
        setLeaves(data);
      } else if (Array.isArray(data.leaves)) {
        setLeaves(data.leaves);
      } else {
        console.error("Unexpected data:", data);
        setLeaves([]);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setLeaves([]);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyLeave = async () => {
    await axios.post("http://127.0.0.1:5000/technician/leaves", form, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    setForm({ start_datetime: '', end_datetime: '', reason: '' });
    fetchLeaves();
  };

  const cancelLeave = async (id) => {
    await axios.delete(`http://127.0.0.1:5000/technician/leaves/${id}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    fetchLeaves();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Apply for Leave</h2>
      <div className="flex flex-col gap-2 max-w-md">
        <input type="date" className="input" value={form.start_datetime}
          onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} />
        <input type="date" className="input" value={form.end_datetime}
          onChange={(e) => setForm({ ...form, end_datetime: e.target.value })} />
        <textarea className="input" placeholder="Reason"
          value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <button onClick={applyLeave} className="btn bg-blue-500 text-white">Submit Leave</button>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Your Leave Requests</h2>
      <ul className="space-y-3">
        {Array.isArray(leaves) && leaves.length > 0 ? (
          leaves.map((leave) => (
            <li key={leave.id} className="border p-3 rounded-md shadow-sm">
              <div><b>From:</b> {new Date(leave.start_datetime).toLocaleDateString()}</div>
              <div><b>To:</b> {new Date(leave.end_datetime).toLocaleDateString()}</div>
              <div><b>Reason:</b> {leave.reason}</div>
              <button onClick={() => cancelLeave(leave.id)} className="text-red-500 mt-2">Cancel</button>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No leave requests found.</p>
        )}
      </ul>
    </div>
  );
}
