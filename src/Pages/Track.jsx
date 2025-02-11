import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, TextField, MenuItem, Typography, Box, Snackbar } from "@mui/material";
import Layout from "../Layout/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import { useStore } from "../Store/Store";
import "./Track.css"; // Import the CSS file

function getDefaultDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function ZoomToBounds({ pathPoints }) {
  const map = useMap();
  useEffect(() => {
    if (pathPoints.length > 0) {
      const bounds = pathPoints.map((point) => [point[0], point[1]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pathPoints, map]);
  return null;
}

export default function Track() {
  const { GetRegisterdDevices } = useStore();
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [fromDate, setFromDate] = useState(getDefaultDate());
  const [toDate, setToDate] = useState(getDefaultDate());
  const [fromTime, setFromTime] = useState("01:00:00");
  const [toTime, setToTime] = useState("23:00:00");
  const [pathPoints, setPathPoints] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await GetRegisterdDevices();
        if (response?.devices && response.devices.length > 0) {
          const options = response.devices.map((device) => ({
            value: device.deviceName,
            label: device.nickname || device.deviceName,
          }));
          setDeviceOptions(options);
          setSelectedDevice(options[0].value);
        } else {
          toast.error("No registered devices found.");
        }
      } catch (error) {
        console.error("Error fetching registered devices:", error);
        toast.error("Failed to fetch devices.");
      }
    };
    fetchDevices();
  }, [GetRegisterdDevices]);

  const fetchLogs = async () => {
    if (!selectedDevice) {
      toast.error("Please select a device.");
      return;
    }
    try {
      const response = await axios.get("https://production-server-tygz.onrender.com/api/find/logs", {
        params: { deviceName: selectedDevice, fromDate, toDate, fromTime, toTime },
      });

      if (response.data.length > 0) {
        const points = response.data.map((log) => [log.latitude, log.longitude]);
        setPathPoints(points);
        setSnackbarMessage(`Found ${response.data.length} points for the selected range.`);
      } else {
        setPathPoints([]);
        toast.error("No points to plot for the selected range.");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setSnackbarMessage("Failed to fetch logs. Please try again.");
    }
  };

  const generateShareUrl = () => {
    if (pathPoints.length > 1) {
      const urlBase = "https://www.google.com/maps/dir/";
      const coords = pathPoints.map((point) => `${point[0]},${point[1]}`).join("/");
      const url = `${urlBase}${coords}?entry=ttu`;
      window.open(url, "_blank");
    } else {
      setSnackbarMessage("Not enough points to generate a shareable link.");
    }
  };

  useEffect(() => {
    if (selectedDevice) fetchLogs();
  }, [selectedDevice]);

  return (
    <Layout>
      <div className="track-container">
        <Box className="track-box">
          {/* Map Section */}
          <Box className="map-section">
            <Typography variant="h6" className="section-title">
              Device Location Map
            </Typography>
            <Box className="map-container">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {pathPoints.length > 0 && (
                  <>
                    <Polyline positions={pathPoints} color="blue" weight={6} />
                    <Marker position={pathPoints[0]}>
                      <Popup>Start Point</Popup>
                    </Marker>
                    <Marker position={pathPoints[pathPoints.length - 1]}>
                      <Popup>Last Available Point</Popup>
                    </Marker>
                    <ZoomToBounds pathPoints={pathPoints} />
                  </>
                )}
              </MapContainer>
            </Box>
          </Box>

          {/* Filter Section */}
          <Box className="filter-section">
            <Typography variant="h6" className="section-title">
              Filter Options
            </Typography>
            <TextField
              select
              label="Select Device"
              fullWidth
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="input-field"
            >
              {deviceOptions.map((device) => (
                <MenuItem key={device.value} value={device.value}>
                  {device.label}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="body1" className="input-label">
              From Date:
            </Typography>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
            <Typography variant="body1" className="input-label">
              To Date:
            </Typography>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
            <Typography variant="body1" className="input-label">
              From Time:
            </Typography>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="time-input"
            />
            <Typography variant="body1" className="input-label">
              To Time:
            </Typography>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="time-input"
            />

            <Button variant="contained" onClick={fetchLogs} className="filter-button">
              Filter
            </Button>
            <Button variant="contained" color="secondary" onClick={generateShareUrl} className="share-button">
              Share
            </Button>
          </Box>
        </Box>

        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage("")}
          message={snackbarMessage}
        />
      </div>
    </Layout>
  );
}