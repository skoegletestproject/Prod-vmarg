import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "../Layout/Layout";

export default function Live() {
  const mapRef = useRef(null);
  const [selectedDevices, setSelectedDevices] = useState(["Tracker-001"]);
  const [deviceData, setDeviceData] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  const deviceOptions = [
    { value: "Tracker-001", label: "Tracker 001" },
    { value: "Tracker-002", label: "Tracker 002" },
    { value: "Tracker-003", label: "Tracker 003" },
  ];

  const defaultLatLng = { lat: 20.5937, lng: 78.9629 };

  useEffect(() => {
    const fetchDeviceData = async () => {
      selectedDevices.forEach(async (device) => {
        try {
          const response = await fetch(`http://localhost:5000/realtime/${device}`);
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setDeviceData((prev) => ({
            ...prev,
            [device]: {
              lat: data.latitude,
              lng: data.longitude,
              lastUpdated: `${data.date} ${data.time}`,
              found: true,
            },
          }));
          setMapCenter({ lat: data.latitude, lng: data.longitude });
        } catch (error) {
          console.error("Error fetching device data:", error);
          setDeviceData((prev) => ({
            ...prev,
            [device]: { found: false },
          }));
        }
      });
    };

    fetchDeviceData();
    const interval = setInterval(fetchDeviceData, 5000);
    return () => clearInterval(interval);
  }, [selectedDevices]);

  useEffect(() => {
    if (mapRef.current) {
      const { lat, lng } = mapCenter;
      const zoomLevel = lat && lng ? 15 : 5;
      mapRef.current.setView([lat || defaultLatLng.lat, lng || defaultLatLng.lng], zoomLevel);
    }
  }, [mapCenter]);

  const handleDeviceChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedDevices(selected);
  };

  const handleShare = (device) => {
    const data = deviceData[device];
    if (data?.found) {
      const googleMapsLink = `https://www.google.com/maps/place/${data.lat},${data.lng}`;
      window.open(googleMapsLink, "_blank");  // Open the Google Maps link in a new tab
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex" }}>
        <div style={{ position: "relative", width: "100%", height: "500px" }}>
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ width: "100%", height: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedDevices.map((device) => {
              const data = deviceData[device];
              return data?.found ? (
                <Marker key={device} position={[data.lat, data.lng]}>
                  <Popup>
                    <strong>{device}</strong> <br />
                    Latitude: {data.lat} <br />
                    Longitude: {data.lng} <br />
                    Last Updated: {data.lastUpdated} <br />
                    <button onClick={() => handleShare(device)} style={{ marginTop: "10px", cursor: "pointer" }}>
                      Share Location
                    </button>
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>

          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
            }}
          >
            <select id="devices" multiple onChange={handleDeviceChange}>
              {deviceOptions.map((device) => (
                <option key={device.value} value={device.value}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginLeft: "20px", width: "300px" }}>
          {selectedDevices.map((device) => (
            <div key={device}>
              <h3>{device}</h3>
              {deviceData[device]?.found === false ? (
                <p style={{ color: "red" }}>Device not found. Latitude and Longitude not available.</p>
              ) : (
                <>
                  <p>Latitude: {deviceData[device]?.lat ?? "Loading..."}</p>
                  <p>Longitude: {deviceData[device]?.lng ?? "Loading..."}</p>
                  <p>Last Updated: {deviceData[device]?.lastUpdated ?? "Waiting for update..."}</p>
                  <button onClick={() => handleShare(device)}>Share Location</button>
                </>
              )}
              <hr />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
