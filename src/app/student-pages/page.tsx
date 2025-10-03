"use client";

import { logout } from "@/utils/auth";
import { Box, Typography, Button, Paper, useMediaQuery } from "@mui/material";


export default function StudentDashboard() {
  const isMobile = useMediaQuery('(max-width:767px)');

  return (
    <Box sx={{ p: isMobile ? 2 : 4, minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Box sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "center" : "space-between",
        alignItems: isMobile ? "center" : "flex-start",
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ textAlign: isMobile ? "center" : "left" }}>
          Student Dashboard
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={logout}
          sx={{
            background: "linear-gradient(to right, #FF512F, #DD2476)",
            minWidth: isMobile ? '120px' : 'auto'
          }}
        >
          Logout
        </Button>
      </Box>

      <Paper sx={{
        p: isMobile ? 3 : 4,
        borderRadius: 2,
        textAlign: 'center',
        backgroundColor: 'white'
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2 }}>
          Welcome to your dashboard!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your exams and results will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
