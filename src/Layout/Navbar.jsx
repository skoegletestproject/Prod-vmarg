
import { useState } from "react";
import { Container, TextField, Button, Typography, Box, AppBar, Toolbar } from "@mui/material";

export default function Navbar(){
    return(
        <>
           <AppBar position="static" sx={{ backgroundColor: "rgb(4,4,38)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Skoegle</Typography>
          <Box>
            <Button variant="outlined" sx={{ color: "white", borderColor: "white", mr: 2 }}>Login</Button>
            <Button variant="contained" sx={{ backgroundColor: "white", color: "rgb(4,4,38)" }}>Sign Up</Button>
            
          </Box>
        </Toolbar>
      </AppBar>
        
        </>
    )
}