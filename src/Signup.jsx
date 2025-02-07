import { useState } from "react";
import { Container, TextField, Button, Typography, Box, AppBar, Toolbar } from "@mui/material";

export default function SignUp() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Username:", formData.username);
    console.log("Email:", formData.email);
    console.log("Password:", formData.password);
  };

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "rgb(4,4,38)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Skoegle</Typography>
          <Box>
            <Button variant="outlined" sx={{ color: "white", borderColor: "white", mr: 2 }}>Login</Button>
            <Button variant="contained" sx={{ backgroundColor: "white", color: "rgb(4,4,38)" }}>Sign Up</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SignUp Form */}
      <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
          <Typography variant="h5" mb={2} textAlign="center">Sign Up</Typography>
          <TextField
            fullWidth
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
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
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, backgroundColor: "rgb(4,4,38)", color: "white" }}>
            Sign Up
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: "center", p: 2, backgroundColor: "rgb(4,4,38)", color: "white", position: "fixed", width: "100%", bottom: 0 }}>
        © Skoegle Trademark
      </Box>
    </Box>
  );
}
