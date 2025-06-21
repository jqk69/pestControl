import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Icons fix for markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom routing control
function RouteControl({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#1d4ed8", weight: 5 }],
      },
    }).addTo(map);

    return () => map.removeControl(control);
  }, [from, to, map]);

  return null;
}

export default function TechnicianServiceDetail() {
  const { id } = useParams(); // booking_id from URL
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("default"); // default | otp_sent | verified
  const [error, setError] = useState("");

  const [techLocation, setTechLocation] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTechLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => setTechLocation(null)
    );

    axios
      .get(`http://127.0.0.1:5000/technician/service/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDetails(res.data.details);
      })
      .catch(() => {
        setDetails(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dt) => new Date(dt).toLocaleString();

  const handleSendOtp = () => {
    setStep("otp_sent");
    setError("");
    axios
      .post(`http://127.0.0.1:5000/technician/send_otp/${id}`, null, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .catch(() => setError("Failed to send OTP"));
  };

  const handleVerifyOtp = () => {
    axios
      .post(
        `http://127.0.0.1:5000/technician/verify_otp/${id}`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        setStep("verified");
        setDetails({ ...details, status: "completed" });
      })
      .catch(() => setError("Invalid OTP"));
  };

  if (loading)
    return <p className="p-6 text-gray-500">Loading service details...</p>;
  if (!details)
    return <p className="p-6 text-red-500">Service not found.</p>;

  const servicePos = [details.location_lat, details.location_lng];

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Details + OTP */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">Service Details</h2>
        <div className="bg-white p-6 rounded-lg shadow border space-y-3">
          <p><strong>Service:</strong> {details.service_name}</p>
          <p><strong>Status:</strong> <span className="capitalize text-blue-600">{details.status}</span></p>
          <p><strong>Date & Time:</strong> {formatDate(details.booking_date)}</p>
          <p><strong>Booking ID:</strong> {details.booking_id}</p>
          <p><strong>Location:</strong> {details.location_lat}, {details.location_lng}</p>
          <p><strong>Created At:</strong> {formatDate(details.created_at)}</p>
          <p><strong>Updated At:</strong> {formatDate(details.updated_at)}</p>

          <hr />
          <h3 className="text-lg font-semibold text-gray-700">User Info</h3>
          <p><strong>Name:</strong> {details.user_name}</p>
          <p><strong>Phone:</strong> {details.user_phone}</p>
          <p><strong>Email:</strong> {details.user_email}</p>
        </div>

        {details.status !== "completed" && (
          <div className="mt-4 space-y-3">
            {step === "default" && (
              <button
                onClick={handleSendOtp}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow"
              >
                Mark as Completed (Send OTP)
              </button>
            )}

            {step === "otp_sent" && (
              <div className="flex flex-col gap-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="border px-3 py-2 rounded w-48"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Verify OTP & Complete
                </button>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {step === "verified" && (
              <p className="text-green-600">Service marked as completed.</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Map */}
      <div className="h-[400px] lg:h-full rounded-lg overflow-hidden">
        <MapContainer
            center={servicePos}
  zoom={13}
  scrollWheelZoom={true}
  className="h-full w-full"
  attributionControl={false} // Disables default attribution
>
  <TileLayer
    attribution='' // Empty string removes attribution
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={servicePos}>
            <Popup>Service Location</Popup>
          </Marker>

          {techLocation && (
            <Marker position={techLocation}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {techLocation && (
            <RouteControl from={techLocation} to={servicePos} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
