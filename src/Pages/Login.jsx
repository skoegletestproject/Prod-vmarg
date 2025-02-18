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
    loginTime: '',
    clientInfo: {}
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getFormattedDateTime = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substr(0, 19);
  };

  const getClientTimeZone = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const offsetSign = offset > 0 ? '-' : '+';
    return `${timeZone} (UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')})`;
  };

  const getScreenInfo = () => {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      screenOrientation: screen.orientation?.type || 'N/A'
    };
  };

  const getNetworkInfo = async () => {
    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : 'Network info not available';
  };

  const getBrowserInfo = () => {
    const browserData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      vendor: navigator.vendor,
      maxTouchPoints: navigator.maxTouchPoints,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || 'N/A',
    };
    return browserData;
  };

  useEffect(() => {
    const getDeviceDetails = async () => {
      try {
        // Get IP and location data
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        const useripResponce = await fetch("https://api.ipify.org/?format=json")
        const userip = await useripResponce.json();
        // Get battery information
        const battery = await navigator.getBattery();
        const batteryInfo = {
          level: (battery.level * 100).toFixed(0),
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };

        // Get network information
        const networkInfo = await getNetworkInfo();

        // Get screen information
        const screenInfo = getScreenInfo();

        // Get browser information
        const browserInfo = getBrowserInfo();

        // Compile client information
        const clientInfo = {
          loginDateTime: getFormattedDateTime(),
          timeZone: getClientTimeZone(),
          location: {
            ip: userip.ip,
            city: ipData.city,
            region: ipData.region,
            country: ipData.country_name,
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            postal: ipData.postal,
            timezone: ipData.timezone,
            org: ipData.org
          },
          battery: batteryInfo,
          network: networkInfo,
          screen: screenInfo,
          browser: browserInfo,
          platform: {
            os: navigator.platform,
            vendor: navigator.vendor,
            userAgent: navigator.userAgent
          }
        };

        // Create a detailed device information string
        const devicedetails = `
          Login Time (UTC): ${clientInfo.loginDateTime}
          Location: ${clientInfo.location.city}, ${clientInfo.location.country} (${clientInfo.location.latitude}, ${clientInfo.location.longitude})
          IP: ${clientInfo.location.ip}
          ISP: ${clientInfo.location.org}
          TimeZone: ${clientInfo.timeZone}
          Device: ${clientInfo.platform.os}
          Browser: ${clientInfo.browser.vendor}
          Screen: ${clientInfo.screen.screenWidth}x${clientInfo.screen.screenHeight}
          Battery: ${clientInfo.battery.level}% (${clientInfo.battery.charging ? 'Charging' : 'Not Charging'})
          Network: ${typeof clientInfo.network === 'object' ? clientInfo.network.effectiveType : 'N/A'}
          Language: ${clientInfo.browser.language}
        `.trim();

        setFormData(prevState => ({
          ...prevState,
          devicedetails,
          loginTime: clientInfo.loginDateTime,
          clientInfo
        }));

      } catch (error) {
        console.error("Error fetching device details: ", error);
        const basicInfo = {
          loginDateTime: getFormattedDateTime(),
          timeZone: getClientTimeZone(),
          platform: navigator.platform,
          userAgent: navigator.userAgent
        };
        
        setFormData(prevState => ({
          ...prevState,
          devicedetails: `Login Time: ${basicInfo.loginDateTime}, Device: ${basicInfo.platform}`,
          loginTime: basicInfo.loginDateTime,
          clientInfo: basicInfo
        }));
        
        toast.error("Error fetching complete device details");
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
        // Add login timestamp to the request
        const loginData = {
          ...formData,
          loginTimestamp: getFormattedDateTime(),
        };

        const response = await login(loginData);

        if (response?.valid) {
          setisLogin(response.valid);
          setisAdmin(response.isAdmin);
          localStorage.setItem("isAdmin", response.isAdmin);
          localStorage.setItem("isLogin", response.valid);
          localStorage.setItem("token", response.token);
          localStorage.setItem("custommerid", response.custommerId);
          localStorage.setItem("lastLoginTime", loginData.loginTimestamp);
          localStorage.setItem("clientInfo", JSON.stringify(formData.clientInfo));

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

  // Rest of the component remains the same...
  return (
    <Layout title="Vmarg - Login">
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
              Don't have an account? <a href="/Signup" style={{ color: "blue", textDecoration: "none" }}>Sign Up</a>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}