"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  People,
  Book,
  BarChart,
  Settings,
} from '@mui/icons-material';
import { FaTachometerAlt, FaSignOutAlt, FaQuestionCircle, FaPlusCircle } from 'react-icons/fa';
import styles from './Sidebar.module.css';

interface Props {
  activeItem?: string;
  isOpen?: boolean;
}

const Sidebar: React.FC<Props> = ({ activeItem = 'Dashboard', isOpen = true }) => {
  const router = useRouter();

  const menuItems = [
    { text: 'Dashboard', icon: <FaTachometerAlt />, route: '/admin-pages' },
    { text: 'Exam Management', icon: <Book />, route: '/admin-pages/Exam_Management' },
    { text: 'Results Analytics', icon: <BarChart />, route: '/admin-pages/Results_Analytics' },
    { text: 'User Management', icon: <People />, route: '/admin-pages/User_Management' },
    { text: 'Question Bank', icon: <FaQuestionCircle />, route: '/admin-pages/Question_Bank' },
    { text: 'Settings', icon: <Settings />, route: '/admin-pages/Settings' },
    { text: 'Logout', icon: <FaSignOutAlt />, route: '/login' },
  ];

  const handleMenuClick = (route: string) => {
    router.push(route);
  };

  return (
    <Box className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <Box className={styles.logo}>
        <Typography variant="h4" component="h1" sx={{ fontSize: '24px', fontWeight: 700 }}>
          MCQ <span className={styles.highlight}>Portal</span>
        </Typography>
      </Box>
      <List className={styles.menu}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding className={styles.menuItem}>
            <ListItemButton
              className={`${styles.menuLink} ${item.text === activeItem ? styles.active : ''}`}
              onClick={() => handleMenuClick(item.route)}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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