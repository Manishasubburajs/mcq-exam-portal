"use client";

import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../student-pages/Sidebar";
import StudentDashboardLayout from "../student-pages/StudentDashboardLayout";
import StudentHeader from "./StudentHeader";
import NavigationWarningModal from "./NavigationWarningModal";
import LiveExamWarningModal from "./LiveExamWarningModal";

interface StudentLayoutProps {
  readonly children: React.ReactNode;
}
type DeviceType = 'mobile' | 'desktop';
type FoldType = 'galaxyFold' | 'nonGalaxyFold';
type PageType = 'exam' | 'nonExam';

const SidebarContext = createContext<{ sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void } | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within StudentLayout');
  }
  return context;
};

function getMobileGalaxyFoldExamPagePaddingTop() {
  return '100px';
}

function getMobileNonGalaxyFoldExamPagePaddingTop() {
  return '0px';
}

function getDesktopGalaxyFoldExamPagePaddingTop() {
  return '72px';
}

function getDesktopNonGalaxyFoldExamPagePaddingTop() {
  return '72px';
}

function getGalaxyFoldNonExamPagePaddingTop() {
  return '100px';
}

function getNonGalaxyFoldNonExamPagePaddingTop() {
  return { xs: '50px', md: '80px' };
}

const examPagePaddingTopMap = {
  mobile: {
    galaxyFold: getMobileGalaxyFoldExamPagePaddingTop,
    nonGalaxyFold: getMobileNonGalaxyFoldExamPagePaddingTop,
  },
  desktop: {
    galaxyFold: getDesktopGalaxyFoldExamPagePaddingTop,
    nonGalaxyFold: getDesktopNonGalaxyFoldExamPagePaddingTop,
  },
};

const nonExamPagePaddingTopMap = {
  mobile: {
    galaxyFold: getGalaxyFoldNonExamPagePaddingTop,
    nonGalaxyFold: getNonGalaxyFoldNonExamPagePaddingTop,
  },
  desktop: {
    galaxyFold: getGalaxyFoldNonExamPagePaddingTop,
    nonGalaxyFold: getNonGalaxyFoldNonExamPagePaddingTop,
  },
};

const paddingTopMap = {
  exam: examPagePaddingTopMap,
  nonExam: nonExamPagePaddingTopMap,
};

function getExamPagePaddingTop(deviceType: DeviceType, foldType: FoldType) {
  return examPagePaddingTopMap[deviceType][foldType]();
}

function getNonExamPagePaddingTop(deviceType: DeviceType, foldType: FoldType) {
  return nonExamPagePaddingTopMap[deviceType][foldType]();
}

function calculatePaddingTop(pageType: PageType, deviceType: DeviceType, foldType: FoldType) {
  return paddingTopMap[pageType][deviceType][foldType]();
}

function getBoxStyles(paddingTop: string | object, isExamPage: boolean, sidebarOpen: boolean, isMobile: boolean, isTablet: boolean) {
  return {
    flex: 1,
    ml: sidebarOpen && !isMobile && !isTablet ? '220px' : 0,
    transition: 'all 0.3s ease',
    width: '100%',
    minHeight: '100vh',
    paddingTop,
    paddingRight: isExamPage ? 0 : '20px',
    overflowX: isExamPage ? 'hidden' : 'auto'
  };
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const isMobile = useMediaQuery('(max-width:767px)');
  const isTablet = useMediaQuery('(min-width:768px) and (max-width:1023px)');
  const isGalaxyFold = useMediaQuery('(min-width:900px) and (max-width:910px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [showLiveWarning, setShowLiveWarning] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const pathname = usePathname();
  const isExamPage = pathname === '/student-pages/exam_taking';
  const deviceType: DeviceType = isMobile ? 'mobile' : 'desktop';
  const foldType: FoldType = isGalaxyFold ? 'galaxyFold' : 'nonGalaxyFold';
  const pageType: PageType = isExamPage ? 'exam' : 'nonExam';
  const paddingTop = calculatePaddingTop(pageType, deviceType, foldType);

  const handleShowNavigationWarning = (route: string) => {
    setPendingRoute(route);
    // Get attemptId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const attemptId = urlParams.get('attemptId');
    const violationKey = attemptId ? `violation_${attemptId}` : null;
    const currentViolations = violationKey ? parseInt(sessionStorage.getItem(violationKey) || '0', 10) : 0;

    if (currentViolations > 0) {
      // Second violation: auto-submit
      sessionStorage.setItem('autoSubmit', 'true');
    } else {
      setShowNavigationWarning(true);
    }
  };

  const handleConfirmNavigation = () => {
    // Increment violation count
    const urlParams = new URLSearchParams(window.location.search);
    const attemptId = urlParams.get('attemptId');
    const violationKey = attemptId ? `violation_${attemptId}` : null;
    if (violationKey) {
      const current = parseInt(sessionStorage.getItem(violationKey) || '0', 10);
      sessionStorage.setItem(violationKey, (current + 1).toString());
    }

    if (pendingRoute) {
      router.push(pendingRoute);
      setPendingRoute(null);
    }
    setShowNavigationWarning(false);
  };

  const handleCancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingRoute(null);
  };

  const contextValue = useMemo(() => ({ sidebarOpen, setSidebarOpen }), [sidebarOpen]);

  return (
    <SidebarContext.Provider value={contextValue}>
      <StudentDashboardLayout>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
          <Sidebar isOpen={sidebarOpen} onShowNavigationWarning={handleShowNavigationWarning} />
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
            sx={getBoxStyles(paddingTop, isExamPage, sidebarOpen, isMobile, isTablet)}
          >
            <StudentHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
            {children}
          </Box>
        </Box>
      </StudentDashboardLayout>
      <NavigationWarningModal
        open={showNavigationWarning}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
      <LiveExamWarningModal open={showLiveWarning} />
    </SidebarContext.Provider>
  );
}



