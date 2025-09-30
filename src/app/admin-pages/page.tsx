"use client";

import { Box, Typography, Button } from "@mui/material";
import { logout } from "@/utils/auth";

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={logout}
          sx={{ background: "linear-gradient(to right, #FF512F, #DD2476)" }}
        >
          Logout
        </Button>
      </Box>

      <Typography>Welcome to your dashboard!</Typography>
    </Box>
  );
}
