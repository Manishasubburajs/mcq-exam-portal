import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Avatar, Button, IconButton } from '@mui/material';
import { AdminPanelSettings, Menu } from '@mui/icons-material';

interface Props {
  onMenuClick?: () => void;
  title?: string;
  sidebarOpen?: boolean;
}

const Header: React.FC<Props> = ({ onMenuClick, title = "Admin Dashboard", sidebarOpen = true }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [username, setUsername] = useState<string>("Administrator");

  useEffect(() => {
    const mobileQuery = globalThis.matchMedia('(max-width:768px)');
    const desktopQuery = globalThis.matchMedia('(min-width:769px)');

    setIsMobile(mobileQuery.matches);
    setIsDesktop(desktopQuery.matches);

    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleDesktopChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    mobileQuery.addEventListener('change', handleMobileChange);
    desktopQuery.addEventListener('change', handleDesktopChange);

    // Always show "Administrator" for admin pages
    setUsername("Administrator");

    return () => {
      mobileQuery.removeEventListener('change', handleMobileChange);
      desktopQuery.removeEventListener('change', handleDesktopChange);
    };
  }, []);

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
        left: (() => {
          if (isDesktop) {
            return sidebarOpen ? '220px' : '0px';
          }
          return '0px';
        })(), // Desktop adjusts with sidebar, mobile stays at 0px
        right: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        zIndex: isDesktop ? 1000 : 900, // Lower z-index on mobile and tablet so sidebar appears above header
        boxShadow: (theme) => `0 2px 4px ${theme.palette.action.disabled}`,
        transition: 'left 0.3s ease', // Smooth transition when sidebar opens/closes
        height: isMobile ? '50px' : '80px',
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
        <Button
          variant="contained"
          onClick={handleNewExam}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            background: 'linear-gradient(to right, #6a11cb, #2575fc)',
            '&:hover': { opacity: 0.9 }
          }}
        >
          New Exam
        </Button>
        <Button variant="outlined" color="secondary" size={isMobile ? 'small' : 'medium'}>
          Export Data
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: isMobile ? 20 : 40, height: isMobile ? 20 : 40, marginRight: isMobile ? '2px' : '10px' }}>
            <AdminPanelSettings sx={{ fontSize: isMobile ? 12 : 20 }} />
          </Avatar>
          {!isMobile && <Typography variant="body1">{username}</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default Header;