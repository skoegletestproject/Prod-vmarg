import { useState, useEffect } from "react";
import { 
  Container, TextField, Button, Typography, Box, CircularProgress 
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../Store/Store";
import Layout from "../Layout/Layout";
import { toast } from "react-toastify";
import { sendOtp, verifyOtp } from "smtp-package";

const bypassOtpEmails = {
  "manojgowdabr89@gmail.com": true,
  "jithin@skoegle.com": true,
  // Add more emails as needed
};

export default function Login() {
  const { login, setisAdmin, setisLogin, skipotp } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    devicedetails: 'Not Available',
    loginTime: '',
    clientInfo: {}
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(cooldown - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
        const devicedetails = `Login Time (UTC): ${clientInfo.loginDateTime}
          Location: ${clientInfo.location.city}, ${clientInfo.location.country} (${clientInfo.location.latitude}, ${clientInfo.location.longitude})
          IP: ${clientInfo.location.ip}
          ISP: ${clientInfo.location.org}
          TimeZone: ${clientInfo.timeZone}
          Device: ${clientInfo.platform.os}
          Browser: ${clientInfo.browser.vendor}
          Screen: ${clientInfo.screen.screenWidth}x${clientInfo.screen.screenHeight}
          Battery: ${clientInfo.battery.level}% (${clientInfo.battery.charging ? 'Charging' : 'Not Charging'})
          Network: ${typeof clientInfo.network === 'object' ? clientInfo.network.effectiveType : 'N/A'}
          Language: ${clientInfo.browser.language}`.trim();

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
    if (step === 'login' && !formData.password) tempErrors.password = 'Password is required';
    if (step === 'otp' && !formData.otp) tempErrors.otp = 'OTP is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        if (skipotp || bypassOtpEmails[formData.email]) {
          // Directly login without OTP
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
            toast.error('User may not exist or the password is incorrect. Please check your credentials or create an account.');
          }
        } else {
          if (step === 'login') {
            // Send OTP
            await sendOtp(formData.email, 'sf8s48fsf4s4f8s4d8f48sf');
            toast.success('OTP sent to your email.');
            setStep('otp');
          } else if (step === 'otp') {
            // Verify OTP
            const isValidOtp = await verifyOtp(formData.email, formData.otp, 'sf8s48fsf4s4f8s4d8f48sf');
            console.log(isValidOtp)
            if (isValidOtp?.valid) {
              // Proceed with login
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
                toast.error('User may not exist or the password is incorrect. Please check your credentials or create an account.');
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              }
            } else {
              toast.error(isValidOtp.message || 'Invalid OTP. Please try again.');  
            }
          }
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendCount < 5) {
      try {
        setResendLoading(true);
        await sendOtp(formData.email, 'sf8s48fsf4s4f8s4d8f48sf');
        toast.success('OTP resent to your email.');
        setResendCount(resendCount + 1);
        setIsResendDisabled(true);
        setCooldown(60);
      } catch (error) {
        toast.error('Failed to resend OTP. Please try again.');
      } finally {
        setResendLoading(false);
      }
    } else {
      toast.error('You have reached the maximum resend attempts. Please try again later.');
    }
  };

  return (
    <Layout title="Vmarg - Login">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
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

            {step === 'login' ? (
              <>
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
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="OTP"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  error={!!errors.otp}
                  helperText={errors.otp}
                  required
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={handleResendOtp}
                  disabled={isResendDisabled || resendLoading}
                  sx={{
                    padding: 1.5,
                    fontSize: '1rem',
                    '&:hover': { backgroundColor: 'rgb(4,4,38)' },
                  }}
                  startIcon={resendLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {resendLoading ? "Resending..." : isResendDisabled ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
                </Button>
              </>
            )}

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
              {loading ? "Processing..." : step === 'login' ? "Send OTP" : "Verify OTP"}
            </Button>

            {step === 'login' && (
              <Typography variant="body2" textAlign="center" mt={1}>
                Don't have an account? <Link to="/Signup" style={{ color: "blue", textDecoration: "none" }}>Sign Up</Link>
              </Typography>
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}