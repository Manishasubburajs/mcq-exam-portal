"use client";
import React, { useState } from "react";
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
  useMediaQuery,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/student-pages" },
  { label: "Take Exam", icon: <AssignmentIcon />, path: "/student-pages/take-exam" },
  { label: "Results", icon: <EmojiEventsIcon />, path: "/student-pages/results" },
  { label: "Profile", icon: <PersonIcon />, path: "/student-pages/profile" },
  { label: "Exam History", icon: <HistoryIcon />, path: "/student-pages/exam-history" },
  { label: "Settings", icon: <SettingsIcon />, path: "/student-pages/settings" },
  { label: "Logout", icon: <LogoutIcon />, path: "/logout" },
];

const gradientBg = "linear-gradient(180deg, #673ab7 0%, #5e35b1 100%)";

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const pathname = usePathname();
  const router = useRouter();

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 3, pb: 2 }}>
        <Avatar sx={{ bgcolor: "#fff", width: 40, height: 40, fontWeight: 900, color: "#673ab7" }}>MCQ</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 900, color: "#fff", letterSpacing: 1 }}>
          MCQ <Box component="span" sx={{ color: "#ffb300" }}>Portal</Box>
        </Typography>
      </Box>
      <List sx={{ flex: 1, mt: 2 }}>
        {navItems.map((item, idx) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              selected={pathname === item.path || (item.label === "Profile" && pathname?.includes("profile"))}
              onClick={() => router.push(item.path)}
              sx={{
                color: "#fff",
                borderRadius: 2,
                mx: 2,
                my: 0.5,
                background: pathname === item.path || (item.label === "Profile" && pathname?.includes("profile")) ? "rgba(255,255,255,0.12)" : "none",
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
            PaperProps={{ sx: { width: 260, background: gradientBg, border: "none" } }}
            ModalProps={{ keepMounted: true }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            width: 260,
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
