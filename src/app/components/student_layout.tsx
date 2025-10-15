"use client";

import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import Sidebar from "../student-pages/Sidebar";
import StudentDashboardLayout from "../student-pages/StudentDashboardLayout";


export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width:900px)");
  return (
    <StudentDashboardLayout>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, md: 31.25 }, width: "100%", minHeight: "100vh" }}>
          {children}
        </Box>
      </Box>
    </StudentDashboardLayout>
  );
}



