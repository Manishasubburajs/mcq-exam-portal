"use client";
import React from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#673ab7",
    },
    secondary: {
      main: "#ffb300",
    },
    background: {
      default: "#f5f6fa",
      paper: "#fff",
    },
  },
  typography: {
    fontFamily: 'Inter, "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    "none",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)",
    "0px 2px 8px rgba(40, 40, 40, 0.08)"
  ] as const,
});

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>{children}</Box>
    </ThemeProvider>
  );
}
