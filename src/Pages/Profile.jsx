import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import { useStore } from "../Store/Store";
import {
  Avatar,
  Button,
  Grid,
  Typography,
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify"; // Import toast

export default function Profile() {
  const { fetchUserProfile, updateUserProfile } = useStore();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [errors, setErrors] = useState({}); // State for form validation errors

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const fetchedUser = await fetchUserProfile();
        setUser(fetchedUser?.user);
        setFormData({
          firstName: fetchedUser?.user.firstName,
          lastName: fetchedUser?.user.lastName,
          email: fetchedUser?.user.email,
          phoneNumber: fetchedUser?.user.phoneNumber,
          custommerId: fetchedUser?.user.custommerId,
          password: fetchedUser?.user.password // Mask the password
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    };

    getUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required.";
    if (!formData.lastName) errors.lastName = "Last name is required.";
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required.";
    if (newPassword && newPassword.length < 6) errors.password = "Password must be at least 6 characters.";
    
    const phonePattern = /^[0-9]{10}$/;
    if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 10 digits.";
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      errors.email = "Invalid email format.";
    }

    return errors;
  };

  const handleUpdate = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const updatedData = { ...formData };
    if (newPassword) {
      updatedData.password = newPassword;
    }

    try {
      await updateUserProfile(updatedData);
      setIsEditing(false);
      setNewPassword("");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("User with the same details may already exist");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 4, borderRadius: "12px" }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} container direction="column" alignItems="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  marginBottom: 2,
                  backgroundColor: "#00796b", // Green background
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "40px",
                }}
              >
                {formData.firstName?.charAt(0).toUpperCase()}
                {formData.lastName?.charAt(formData.lastName.length - 1).toUpperCase()}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {formData.custommerId}
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Profile Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      disabled={!isEditing}
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      disabled={!isEditing}
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      fullWidth
                      disabled={!isEditing}
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      fullWidth
                      disabled={!isEditing}
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                    />
                  </Grid>

                  {isEditing && (
                    <Grid item xs={12}>
                      <TextField
                        label="New Password"
                        variant="outlined"
                        fullWidth
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        error={!!errors.password}
                        helperText={errors.password}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Box mt={3} display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                {isEditing && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleUpdate}
                    sx={{ backgroundColor: "#00796b", '&:hover': { backgroundColor: '#004d40' } }} // Green background for save button
                  >
                    Save Changes
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Layout>
  );
}
