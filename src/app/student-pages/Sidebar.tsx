"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/student-pages" },
  { label: "Take Exam", icon: <AssignmentIcon />, path: "/student-pages/exam_taking" },
  { label: "Exam History", icon: <HistoryIcon />, path: "/student-pages/exam_res_rev" },
  { label: "Progress", icon: <BarChartIcon />, path: "/student-pages/progress" },
  { label: "My Profile", icon: <PersonIcon />, path: "/student-pages/profile_settings" },
  { label: "Settings", icon: <SettingsIcon />, path: "/student-pages/settings" },
  { label: "Logout", icon: <LogoutIcon />, path: "/logout" },
];

const gradientBg = "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)";

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width:900px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: 1, textAlign: "center" }}>
          MCQ <Box component="span" sx={{ color: "#ffb300" }}>Portal</Box>
        </Typography>
      </Box>
      <List sx={{ flex: 1, mt: 2 }}>
        {navItems.map((item, idx) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              selected={pathname === item.path || (item.label === "My Profile" && pathname?.includes("profile_settings"))}
              onClick={() => router.push(item.path)}
              sx={{
                color: "#fff",
                borderRadius: 2,
                mx: 2,
                my: 0.5,
                background: pathname === item.path || (item.label === "My Profile" && pathname?.includes("profile_settings")) ? "rgba(255,255,255,0.2)" : "none",
                '&:hover': { background: "rgba(255,255,255,0.08)" },
                minHeight: 48,
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600, fontSize: 16 }}>{item.label}</Typography>}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 0, p: 3, pt: 0 }} />
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ position: "fixed", top: 18, left: 18, zIndex: 1301, color: "#fff", bgcolor: "#673ab7", '&:hover': { bgcolor: "#5e35b1" } }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{ sx: { width: 250, background: gradientBg, border: "none" } }}
            ModalProps={{ keepMounted: true }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            width: 250,
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            bgcolor: "transparent",
            background: gradientBg,
            boxShadow: "2px 0 16px 0 rgba(103,58,183,0.10)",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
}
