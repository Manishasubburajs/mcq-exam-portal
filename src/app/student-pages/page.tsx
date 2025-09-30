"use client";

import { logout } from "@/utils/auth";
import { Box, Typography, Button } from "@mui/material";


export default function StudentDashboard() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Student Dashboard</Typography>
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
