import { useState } from "react";
import { Container, TextField, Button, Typography, Box, AppBar, Toolbar } from "@mui/material";
import Layout from "./Layout/Layout";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", formData.email);
    console.log("Password:", formData.password);
  };

  return (

    <Layout>    <Box>
    

      {/* Login Form */}
      <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
          <Typography variant="h5" mb={2} textAlign="center">Login</Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, backgroundColor: "rgb(4,4,38)", color: "white" }}>
            Login
          </Button>
          <Typography variant="body2" textAlign="center" mt={2}>
            Don’t have an account? <a href="/Signup" style={{ color: "blue", textDecoration: "none" }}>Sign Up</a>
          </Typography>
        </Box>
      </Container>

   
    </Box></Layout>

  );
}
