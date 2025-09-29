import React from 'react';
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
import { FaTachometerAlt, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <FaTachometerAlt />, active: true },
    { text: 'User Management', icon: <People /> },
    { text: 'Exams', icon: <Book /> },
    { text: 'Question Bank', icon: <FaQuestionCircle /> },
    { text: 'Analytics', icon: <BarChart /> },
    { text: 'System Settings', icon: <Settings /> },
    { text: 'Logout', icon: <FaSignOutAlt /> },
  ];

  return (
    <Box className={styles.sidebar}>
      <Box className={styles.logo}>
        <Typography variant="h4" component="h1" sx={{ fontSize: '24px', fontWeight: 700 }}>
          MCQ <span className={styles.highlight}>Portal</span>
        </Typography>
      </Box>
      <List className={styles.menu}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding className={styles.menuItem}>
            <ListItemButton className={`${styles.menuLink} ${item.active ? styles.active : ''}`}>
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
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