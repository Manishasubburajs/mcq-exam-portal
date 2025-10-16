"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Sidebar from "../student-pages/Sidebar";
import StudentDashboardLayout from "../student-pages/StudentDashboardLayout";


export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width:900px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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



