import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "../Layout/Layout";
import { useStore } from "../Store/Store";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import "./Live.css"; // Add custom styles for better responsiveness

const firebaseConfig = {
  apiKey: "AIzaSyB3vFmUkVuYXeb5CgHKQVtPNq1CLu_fC1I",
  authDomain: "skoegle.firebaseapp.com",
  databaseURL: "https://skoegle-default-rtdb.firebaseio.com",
  projectId: "skoegle",
  storageBucket: "skoegle.appspot.com",
  messagingSenderId: "850483861138",
  appId: "1:850483861138:web:7db6db38eb81eb3dde384b",
  measurementId: "G-9SB0PX663B",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Live() {
  const mapRef = useRef(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [error, setError] = useState(null);
  const { GetRegisterdDevices } = useStore();
  const defaultLatLng = { lat: 20.5937, lng: 78.9629 };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await GetRegisterdDevices();
        if (response?.devices?.length > 0) {
          const options = response.devices.map((device) => ({
            value: device.deviceName,
            label: device.nickname || device.deviceName,
          }));
          setDeviceOptions(options);
          setSelectedDevices([options[0].value]);
        } else {
          setError("You don't have any registered devices. Please register a device.");
        }
      } catch (error) {
        console.error("Error fetching registered devices:", error);
        setError("Failed to fetch registered devices.");
      }
    };
    fetchDevices();
  }, [GetRegisterdDevices]);

  useEffect(() => {
    const listeners = [];
    const subscribeToDevice = (device) => {
      const gpsRef = ref(database, `${device}/Realtime`);
      const unsubscribe = onValue(gpsRef, (snapshot) => {
        const data = snapshot.val();
        if (data?.timestamp) {
          const [date, time, lat, lng] = data.timestamp.split(",");
          setDeviceData((prev) => ({
            ...prev,
            [device]: {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              lastUpdated: `${date} ${time}`,
              found: true,
            },
          }));
          setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
        } else {
          setDeviceData((prev) => ({ ...prev, [device]: { found: false } }));
        }
      });
      listeners.push(unsubscribe);
    };

    selectedDevices.forEach(subscribeToDevice);

    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [selectedDevices]);

  useEffect(() => {
    if (mapRef.current) {
      const { lat, lng } = mapCenter;
      mapRef.current.setView([lat || defaultLatLng.lat, lng || defaultLatLng.lng], lat && lng ? 15 : 5);
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
      window.open(googleMapsLink, "_blank");
    }
  };

  return (
    <Layout>
      <div className="live-container">
        <div className="map-container">
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
                    <button className="share-button" onClick={() => handleShare(device)}>
                      Share Location
                    </button>
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>
          <div className="device-selector">
            <select id="devices" multiple onChange={handleDeviceChange} value={selectedDevices}>
              {deviceOptions.map((device) => (
                <option key={device.value} value={device.value}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="device-info">
          {error ? (
            <p className="error-text">{error}</p>
          ) : (
            selectedDevices.map((device) => (
              <div key={device} className="device-card">
                <h3>{device}</h3>
                {deviceData[device]?.found === false ? (
                  <p className="not-found-text">Device not found. Latitude and Longitude not available.</p>
                ) : (
                  <>
                    <p>Latitude: {deviceData[device]?.lat ?? "Loading..."}</p>
                    <p>Longitude: {deviceData[device]?.lng ?? "Loading..."}</p>
                    <p>Last Updated: {deviceData[device]?.lastUpdated ?? "Waiting for update..."}</p>
                    <button className="share-button" onClick={() => handleShare(device)}>
                      Share Location
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
