import { useState } from "react";
import { 
  Container, TextField, Button, Typography, Box, CircularProgress 
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../Store/Store"; // Assuming your store is correctly set up
import Layout from "../Layout/Layout";
import { toast } from "react-toastify";

export default function SignUp() {
  const { signup } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = 'First name is required';
    if (!formData.lastName) tempErrors.lastName = 'Last name is required';
    if (!formData.email) tempErrors.email = 'Email is required';
    if (!formData.phoneNumber) tempErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) tempErrors.password = 'Password is required';
    if (!formData.confirmPassword) tempErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = 'Passwords do not match';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await signup(formData);

        if (response?.valid) {
          toast.success(`User registered successfully with Email: ${response.message}`);
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        toast.error('Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout title={"Vmarg - Sign Up"}>
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
              p: 4, 
              boxShadow: 3, 
              borderRadius: 2, 
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              '@media (max-width: 600px)': {
                p: 2,
                gap: 1.0,
                marginLeft: -2,
              },
            }}
          >
            <Typography variant="h5" mb={1} textAlign="center">Sign Up</Typography>

            <TextField
              fullWidth
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
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
              label="Phone Number"
              type="number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#00796b',
                '&:hover': { backgroundColor: 'rgb(4,4,38)' },
                marginTop: 1,
              }}
            >
              {loading ? 'Submitting...' : 'Sign Up'}
            </Button>
            <Typography variant="body2" textAlign="center" mt={1}>
              Do you have an account? <Link to="/login" style={{ color: "blue", textDecoration: "none" }}>Login</Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}