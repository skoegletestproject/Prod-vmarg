import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, TextField, MenuItem, Typography, Box, Snackbar } from "@mui/material";
import axios from "axios";
import Layout from "../Layout/Layout";

const deviceOptions = [
  { value: "Tracker-001", label: "Tracker 001" },
  { value: "Tracker-002", label: "Tracker 002" },
  { value: "Tracker-003", label: "Tracker 003" }
];

function getDefaultDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function ZoomToBounds({ pathPoints }) {
  const map = useMap();

  useEffect(() => {
    if (pathPoints.length > 0) {
      const bounds = pathPoints.map(point => [point[0], point[1]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pathPoints, map]);

  return null;
}

export default function Track() {
  const [selectedDevice, setSelectedDevice] = useState("Tracker-001");
  const [fromDate, setFromDate] = useState(getDefaultDate());
  const [toDate, setToDate] = useState(getDefaultDate());
  const [fromTime, setFromTime] = useState("01:00:00");
  const [toTime, setToTime] = useState("23:00:00");
  const [pathPoints, setPathPoints] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const fetchLogs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/find/logs", {
        params: {
          deviceName: selectedDevice,
          fromDate,
          toDate,
          fromTime,
          toTime
        }
      });

      if (response.data.length > 0) {
        const points = response.data.map(log => [log.latitude, log.longitude]);
        setPathPoints(points);
        setSnackbarMessage(`Found ${response.data.length} points for the selected range.`);
      } else {
        setPathPoints([]);
        window.alert("No points to plot for today.");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setSnackbarMessage("Failed to fetch logs. Please try again.");
    }
  };

  const generateShareUrl = () => {
    if (pathPoints.length > 1) {
      const urlBase = "https://www.google.com/maps/dir/";
      const coords = pathPoints.map(point => `${point[0]},${point[1]}`).join("/");
      const url = `${urlBase}${coords}?entry=ttu`;
      window.open(url, "_blank");
    } else {
      setSnackbarMessage("Not enough points to generate a shareable link.");
    }
  };

  useEffect(() => {
    fetchLogs(); // Fetch logs on page load
  }, [selectedDevice]);

  return (
    <Layout>
      <div>
        <Box sx={{ display: "flex", p: 2 }}>
          <Box sx={{ width: "300px", mr: 2 }}>
            <TextField
              select
              label="Select Device"
              fullWidth
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              sx={{ mb: 2 }}
            >
              {deviceOptions.map((device) => (
                <MenuItem key={device.value} value={device.value}>
                  {device.label}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="body1" sx={{ mb: 1 }}>From Date:</Typography>
            <input
              type="date"
              value={fromDate.split("-").reverse().join("-")}
              onChange={(e) => setFromDate(e.target.value.split("-").reverse().join("-"))}
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>To Date:</Typography>
            <input
              type="date"
              value={toDate.split("-").reverse().join("-")}
              onChange={(e) => setToDate(e.target.value.split("-").reverse().join("-"))}
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>From Time:</Typography>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>To Time:</Typography>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />

            <Button variant="contained" onClick={fetchLogs} sx={{ mb: 2 }}>
              Filter
            </Button>
            <br />
            <Button variant="contained" color="secondary" onClick={generateShareUrl} sx={{ mb: 2 }}>
              Share
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1, height: "500px" }}>
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ width: "100%", height: "100%" }}>
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
