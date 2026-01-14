"use client"

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  Assignment,
  BarChart,
  History,
  Person,
} from '@mui/icons-material';
import { FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa';
import styles from '../components/Sidebar.module.css';
import { logout } from '@/utils/auth';
import NavigationWarningModal from '../components/NavigationWarningModal';

interface Props {
  isOpen?: boolean;
  onShowNavigationWarning?: (route: string) => void;
}

const Sidebar: React.FC<Props> = ({ isOpen = true, onShowNavigationWarning }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { text: 'Dashboard', icon: <FaTachometerAlt />, route: '/student-pages' },
    // { text: 'Take Exam', icon: <Assignment />, route: '/student-pages/exam_taking' },
    { text: 'My Exams', icon: <Assignment />, route: '/student-pages/my_exams' },
    { text: 'Exam History', icon: <History />, route: '/student-pages/exam_history' },
    { text: 'Progress', icon: <BarChart />, route: '/student-pages/student_progress' },
    { text: 'My Profile', icon: <Person />, route: '/student-pages/profile_settings' },
    { text: 'Logout', icon: <FaSignOutAlt /> },
  ];

  const activeItem = menuItems.find(item => item.route === pathname)?.text || 'Dashboard';

  const handleMenuClick = (item: { text: string; route?: string }) => {
    if (item.text === 'Logout') {
      logout();
    } else if (item.route) {
      if (pathname === '/student-pages/exam_taking' && onShowNavigationWarning) {
        onShowNavigationWarning(item.route);
      } else {
        router.push(item.route);
      }
    }
  };


  return (
    <Box className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <Box className={styles.logo}>
        <Typography variant="h4" component="h1" sx={{ fontSize: '24px', fontWeight: 700 }}>
          MCQ <span className={styles.highlight}>Portal</span>
        </Typography>
      </Box>
      <List className={styles.menu}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding className={styles.menuItem}>
            <ListItemButton
              className={`${styles.menuLink} ${item.text === activeItem ? styles.active : ''}`}
              onClick={() => handleMenuClick(item)}
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
