import { useEffect, useState } from "react";
import { FaTools, FaBell, FaWallet, FaClock } from "react-icons/fa";
import axios from "axios";

const TechnicianDashboard = () => {
  const [today, setTodayServices] = useState([]);
  const [upcoming, setUpcomingServices] = useState([]);
  const [history, setServiceHistory] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    axios
      .get("http://127.0.0.1:5000/technician/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data;
        setTodayServices(data.today_services);
        setUpcomingServices(data.upcoming_services);
        setServiceHistory(data.service_history);
        setAvailability(data.availability);
        setEarnings(data.earnings || 0);
        setNotifications(data.notifications);
      })
      .catch((err) => {
        console.error("Failed to load dashboard", err);
      });
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white min-h-screen p-6 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 tracking-tight">
        Technician Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card icon={<FaTools />} label="Today" value={`${today.length} Jobs`} color="blue" />
        <Card icon={<FaClock />} label="Upcoming" value={`${upcoming.length} Jobs`} color="orange" />
        <Card icon={<FaWallet />} label="Earnings" value={`₹${earnings}`} color="green" />
        <Card icon={<FaBell />} label="Alerts" value={notifications.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Section title="Today’s Services">
          {today.length === 0 ? <EmptyState message="No services today." /> : <List items={today} />}
        </Section>

        <Section title="Upcoming Services">
          {upcoming.length === 0 ? <EmptyState message="No upcoming services." /> : <List items={upcoming} />}
        </Section>

        <Section title="Service History">
          {history.length === 0 ? <EmptyState message="No completed services yet." /> : <List items={history} />}
        </Section>

        <Section title="Availability">
          {!availability?.length ? (
            <EmptyState message="No upcoming unavailability." />
          ) : (
            <ul className="space-y-2">
              {availability.map((slot, idx) => (
                <li key={idx} className="bg-white/80 backdrop-blur-md shadow p-4 rounded border text-sm">
                  <span className="font-medium text-gray-700">Unavailable from</span>{" "}
                  {toUTC(slot.start_datetime)} to {toUTC(slot.end_datetime)}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
};

// --- Card UI ---
const Card = ({ icon, label, value, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-100",
    orange: "text-orange-600 bg-orange-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
      <div className={`p-3 rounded-full ${colors[color]} text-xl`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <p className="text-gray-500 italic text-sm">{message}</p>
);

// --- UTC Time Formatter ---
const formatDateTime = (isoString) => new Date(isoString).toLocaleString();


// --- List UI ---
const List = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item, idx) => (
      <li
        key={idx}
        className="bg-white/80 backdrop-blur-md shadow-sm p-4 rounded-lg border border-gray-200"
      >
        <span className="font-medium text-gray-800">{item.service_type}</span> on{" "}
        <span className="text-gray-600">{formatDateTime(item.booking_date)}</span> –{" "}
        <span className="capitalize text-blue-600">{item.status}</span>
      </li>
    ))}
  </ul>
);

export default TechnicianDashboard;
