"use client";

import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import Sidebar from "../student-pages/Sidebar";
import StudentDashboardLayout from "../student-pages/StudentDashboardLayout";
import StudentHeader from "./StudentHeader";

interface StudentLayoutProps {
  readonly children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const isMobile = useMediaQuery('(max-width:767px)');
  const isTablet = useMediaQuery('(min-width:768px) and (max-width:1023px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop, isTablet]);

  return (
    <StudentDashboardLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <Sidebar isOpen={sidebarOpen} />
        {sidebarOpen && (isMobile || isTablet) && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Box
          sx={{
            flex: 1,
            ml: sidebarOpen && !isMobile && !isTablet ? '220px' : 0,
            transition: 'margin-left 0.3s ease',
            width: '100%',
            minHeight: '100vh',
            paddingTop: { xs: '50px', md: '80px' }
          }}
        >
          <StudentHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          {children}
        </Box>
      </Box>
    </StudentDashboardLayout>
  );
}



