import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TechnicianServiceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    axios
      .get("http://127.0.0.1:5000/technician/service-history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHistory(res.data.history || []))
      .catch((err) => console.error("Failed to fetch service history", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(); // Only date, no time
  };

  return (
    <div className="p-6 min-h-screen bg-white font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Service History</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-500 italic">No completed services yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li
              key={item.booking_id}
              className="p-4 rounded-md bg-gray-100 border shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {item.service_name}
              </h3>

              <p className="text-gray-600">
                Completed on:{" "}
                <span className="font-medium">{formatDate(item.booking_date)}</span>
              </p>

              <p className="text-gray-600">
                Duration: {item.duration_minutes} minutes
              </p>

              <p className="text-gray-600">
                Customer: <span className="font-medium">{item.user_name}</span>
              </p>

              <p className="text-gray-600">
                Amount: ₹{item.amount || "0.00"}{" "}
                <span className="text-sm text-gray-500">
                  ({item.payment_status || "unpaid"})
                </span>
              </p>

              {item.location_lat && item.location_lng && (
                <p className="text-gray-500 text-sm">
                  Location: {item.location_lat}, {item.location_lng}
                </p>
              )}

              {item.feedback && (
                <p className="text-gray-600 mt-2 italic">
                  “{item.feedback}”
                  <span className="ml-2 text-sm text-blue-500">
                    ({item.sentiment})
                  </span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
