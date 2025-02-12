import { useState, useEffect } from "react";
import { 
  Container, TextField, Button, Typography, Box, CircularProgress 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStore } from "../Store/Store";
import Layout from "../Layout/Layout";
import { toast } from "react-toastify";

export default function Login() {
  const { login, setisAdmin, setisLogin } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    devicedetails: 'Not Available',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const getDeviceDetails = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const battery = await navigator.getBattery();
            const batteryLevel = (battery.level * 100).toFixed(0);
            const browserInfo = navigator.userAgent;
            const deviceInfo = `${navigator.platform} - ${browserInfo}`;
            const ipResponse = await fetch('https://api.ipify.org/?format=json');
            const ipData = await ipResponse.json();
            const ipAddress = ipData.ip;

            const devicedetails = `Latitude: ${latitude}, Longitude: ${longitude}, Battery: ${batteryLevel}%, IP: ${ipAddress}, Device: ${deviceInfo}`;
            setFormData((prevState) => ({ ...prevState, devicedetails }));
          },
          (error) => {
            console.error("Error getting geolocation: ", error);
            toast.error("Unable to fetch location");
          }
        );
      } catch (error) {
        console.error("Error fetching device details: ", error);
        toast.error("Error fetching device details");
      }
    };

    getDeviceDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email) tempErrors.email = 'Email is required';
    if (!formData.password) tempErrors.password = 'Password is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await login(formData);

        if (response?.valid) {
          setisLogin(response.valid);
          setisAdmin(response.isAdmin);
          localStorage.setItem("isAdmin", response.isAdmin);
          localStorage.setItem("isLogin", response.valid);
          localStorage.setItem("token", response.token);
          localStorage.setItem("custommerid", response.custommerId);

          toast.success('Welcome back!');
          setTimeout(() => {
            window.location.reload();
            navigate('/');
          }, 2000);
        } else {
          toast.error('Invalid email or password.');
        }
      } catch (error) {
        toast.error('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              p: 3,
              boxShadow: 3,
              borderRadius: 2,
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              '@media (max-width: 600px)': {
                p: 1,
                gap: 1.5,
                marginLeft: -2,
              },
            }}
          >
            <Typography variant="h5" textAlign="center">Login</Typography>

            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              required
            />

            {/* Button with loader */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loading}
              sx={{
                padding: 1.5,
                fontSize: '1rem',
                backgroundColor: '#00796b',
                '&:hover': { backgroundColor: 'rgb(4,4,38)' },
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Typography variant="body2" textAlign="center" mt={1}>
              Don’t have an account? <a href="/Signup" style={{ color: "blue", textDecoration: "none" }}>Sign Up</a>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}