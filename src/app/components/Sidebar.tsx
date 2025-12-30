"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { People, Book, BarChart, Settings, School } from "@mui/icons-material";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaQuestionCircle,
  FaPlusCircle,
} from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { logout } from "@/utils/auth";

interface Props {
  isOpen?: boolean;
}

const Sidebar: React.FC<Props> = ({ isOpen = true }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { text: "Dashboard", icon: <FaTachometerAlt />, route: "/admin-pages" },
    // { text: 'Create Exam', icon: <FaPlusCircle />, route: '/admin-pages/Create_Exam' },
    {
      text: "Subjects & Topics",
      icon: <School />,
      route: "/admin-pages/subject_details",
    },
    {
      text: "Question Bank",
      icon: <FaQuestionCircle />,
      route: "/admin-pages/Question_Bank",
    },
    {
      text: "Exam Management",
      icon: <Book />,
      route: "/admin-pages/Exam_Management",
    },
    {
      text: "User Management",
      icon: <People />,
      route: "/admin-pages/User_Management",
    },
    {
      text: "Results Analytics",
      icon: <BarChart />,
      route: "/admin-pages/Results_Analytics",
    },
    // { text: 'Settings', icon: <Settings />, route: '/admin-pages/Settings' },
    { text: "Logout", icon: <FaSignOutAlt /> },
  ];

  const activeItem =
    menuItems.find((item) => item.route === pathname)?.text || "Dashboard";

  const handleMenuClick = (item: { text: string; route?: string }) => {
    if (item.text === "Logout") {
      logout(); // ✅ Direct call
    } else if (item.route) {
      router.push(item.route);
    }
  };

  return (
    <Box className={`${styles.sidebar} ${isOpen ? "" : styles.closed}`}>
      <Box className={styles.logo}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: "24px", fontWeight: 700 }}
        >
          MCQ <span className={styles.highlight}>Portal</span>
        </Typography>
      </Box>
      <List className={styles.menu}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding className={styles.menuItem}>
            <ListItemButton
              className={`${styles.menuLink} ${
                item.text === activeItem ? styles.active : ""
              }`}
              onClick={() => handleMenuClick(item)}
            >
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
