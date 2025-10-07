import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Avatar, Button, IconButton, useMediaQuery } from '@mui/material';
import { AdminPanelSettings, Menu } from '@mui/icons-material';

interface Props {
  onMenuClick?: () => void;
  title?: string;
  sidebarOpen?: boolean;
}

const Header: React.FC<Props> = ({ onMenuClick, title = "Admin Dashboard", sidebarOpen = true }) => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isDesktop = useMediaQuery('(min-width:769px)');

  const handleNewExam = () => {
    router.push('/admin-pages/Create_Exam');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '4px 8px' : '15px 20px',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'fixed',
        top: 0,
        left: isDesktop ? (sidebarOpen ? '220px' : '0px') : '0px', // Desktop adjusts with sidebar, mobile stays at 0px
        right: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        zIndex: isMobile ? 900 : 1000, // Lower z-index on mobile so sidebar appears above header
        boxShadow: (theme) => `0 2px 4px ${theme.palette.action.disabled}`,
        transition: 'left 0.3s ease', // Smooth transition when sidebar opens/closes
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {onMenuClick && (
          <IconButton onClick={onMenuClick} sx={{ mr: isMobile ? 0.5 : 1, p: isMobile ? 0.5 : 1 }}>
            <Menu sx={{ fontSize: isMobile ? 16 : 24 }} />
          </IconButton>
        )}
        <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ color: 'text.primary', fontSize: isMobile ? '1rem' : undefined }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" onClick={handleNewExam} size={isMobile ? 'small' : 'medium'}>
          New Exam
        </Button>
        <Button variant="outlined" color="secondary" size={isMobile ? 'small' : 'medium'}>
          Export Data
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: isMobile ? 20 : 40, height: isMobile ? 20 : 40, marginRight: isMobile ? '2px' : '10px' }}>
            <AdminPanelSettings sx={{ fontSize: isMobile ? 12 : 20 }} />
          </Avatar>
          {!isMobile && <Typography variant="body1">Administrator</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default Header;