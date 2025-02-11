import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useRef, useEffect } from "react";
import Layout from "../Layout/Layout";
import axios from "axios";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { motion } from "framer-motion";

export default function RegisterDevice() {
  const [deviceName, setDeviceName] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [custommerId] = useState(localStorage.getItem("custommerid"));
  const [success, setSuccess] = useState(false);
  const [openNicknameDialog, setOpenNicknameDialog] = useState(false);
  const [openCamera, setOpenCamera] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const webcamRef = useRef(null);

  useEffect(() => {
    handleOpenCamera();
  }, []);

  const handleOpenCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    if (videoDevices.length > 0) {
      setOpenCamera(true);
    }
  };

  const handleScanBarcode = async () => {
    setScanning(true);
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const image = await fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => createImageBitmap(blob));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, image.width, image.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      setScanning(false);

      if (code) {
        try {
          const [scannedDeviceName, scannedDeviceCode] = code.data.split(",");
          setDeviceName(scannedDeviceName);
          setDeviceCode(scannedDeviceCode.trim());
          setOpenCamera(false);
          setOpenNicknameDialog(true);
          setSnackbarMessage("Barcode scanned successfully!");
          setSnackbarSeverity("success");
          setShowSnackbar(true);
        } catch {
          setSnackbarMessage("Failed to parse the barcode.");
          setSnackbarSeverity("error");
          setShowSnackbar(true);
        }
      } else {
        setSnackbarMessage("No barcode detected. Please try again.");
        setSnackbarSeverity("warning");
        setShowSnackbar(true);
      }
    } else {
      setSnackbarMessage("Failed to capture an image. Please try again.");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
    setScanning(false);
  };

  const handleNicknameSubmit = async () => {
    if (!nickname) {
      setSnackbarMessage("Nickname is required.");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
      return;
    }

    try {
      const cleanedDeviceCode = deviceCode.replace(/\n/g, "");
      await axios.post("https://production-server-tygz.onrender.com/api/verify/adddevice", {
        deviceName,
        deviceCode: cleanedDeviceCode,
        custommerId,
        nickname,
      });

      await axios.post("https://production-server-tygz.onrender.com/api/realtime/logs", {
        deviceName: deviceName,
        latitude: 37.7749,
        longitude: -122.4194,
        date: "06-02-2025",
        time: "14:30:00",
      });

      setSuccess(true);
      setSnackbarMessage("Device registered successfully!");
      setSnackbarSeverity("success");
      setShowSnackbar(true);
      setDeviceName("");
      setDeviceCode("");
      setNickname("");
      setOpenNicknameDialog(false);
    } catch (error) {
      setSnackbarMessage("Failed to register the device. Please try again.");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    } finally {
      setOpenCamera(true);
    }
  };

  const handleDialogClose = () => {
    setOpenNicknameDialog(false);
    setOpenCamera(true);
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              Register Device
            </Typography>
            {openCamera && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Please scan the device barcode
                </Typography>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleScanBarcode}
                  sx={{ mt: 2 }}
                  disabled={scanning}
                >
                  {scanning ? <CircularProgress size={24} /> : "Scan Barcode"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Dialog open={openNicknameDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Device Details
            <IconButton onClick={handleDialogClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Device Name" value={deviceName} margin="normal" disabled />
            <TextField fullWidth label="Device Code" value={deviceCode} margin="normal" disabled />
            <TextField
              fullWidth
              label="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNicknameSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}
