import { AppBar, Toolbar, Typography, Box, Container, Button, Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import Layout from "./Layout/Layout";

export default function Welcome() {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Layout>    <Box>
      {/* Navbar */}
   
      {/* Welcome Content */}
      <Container maxWidth="md" sx={{ textAlign: "center", height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>Welcome to Skoegle</Typography>
        
        {/* Buttons */}
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary">Add Device</Button>
            <Button variant="contained" color="secondary">Delete</Button>
          </Box>
          <Button variant="contained" color="success">Live/Preview</Button>
        </Box>
      </Container>

    </Box>
    </Layout>

  );
}
