import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Avatar, Button, IconButton } from '@mui/material';
import { Person, Menu } from '@mui/icons-material';

interface Props {
  onMenuClick?: () => void;
  title?: string;
  sidebarOpen?: boolean;
}

const StudentHeader: React.FC<Props> = ({ onMenuClick, title, sidebarOpen = true }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [username, setUsername] = useState<string>("Student");

  useEffect(() => {
    const mobileQuery = globalThis.matchMedia('(max-width:767px)');
    const desktopQuery = globalThis.matchMedia('(min-width:1024px)');

    setIsMobile(mobileQuery.matches);
    setIsDesktop(desktopQuery.matches);

    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleDesktopChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    mobileQuery.addEventListener('change', handleMobileChange);
    desktopQuery.addEventListener('change', handleDesktopChange);

    // Get username from localStorage or sessionStorage
    const storedUsername = localStorage.getItem("username") || sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    return () => {
      mobileQuery.removeEventListener('change', handleMobileChange);
      desktopQuery.removeEventListener('change', handleDesktopChange);
    };
  }, []);

  const getTitle = () => {
    if (title) return title;
    switch (pathname) {
      case '/student-pages':
        return 'Student Dashboard';
      case '/student-pages/exam_taking':
        return 'Take Exam';
      case '/student-pages/my_exams':
        return 'My Exams';
      case '/student-pages/exam_res_rev':
        return 'Exam Results Review';
      case '/student-pages/student_progress':
        return 'Student Progress';
      case '/student-pages/profile_settings':
        return 'Profile Settings';
      default:
        return 'Student Dashboard';
    }
  };

  const handleTakeExam = () => {
    router.push('/student-pages/exam_taking');
  };

  const sidebarOffset = sidebarOpen ? '220px' : '0px';
  const leftPosition = isDesktop ? sidebarOffset : '0px';
  const padding = isMobile ? '4px 8px' : '15px 20px';
  const zIndex = isMobile ? 900 : 1000;
  const gap = isMobile ? 0.5 : 2;
  const size = isMobile ? 'small' : 'medium';
  const fontSize = isMobile ? 16 : 24;
  const avatarSize = isMobile ? 20 : 40;
  const marginRight = isMobile ? '2px' : '10px';
  const personFontSize = isMobile ? 12 : 20;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'fixed',
        top: 0,
        left: leftPosition,
        right: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        zIndex,
        boxShadow: (theme) => `0 2px 4px ${theme.palette.action.disabled}`,
        transition: 'left 0.3s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {onMenuClick && (
          <IconButton onClick={onMenuClick} sx={{ mr: isMobile ? 0.5 : 1, p: isMobile ? 0.5 : 1 }}>
            <Menu sx={{ fontSize }} />
          </IconButton>
        )}
        <Typography variant={isMobile ? 'h6' : 'h4'} sx={{ color: 'text.primary', fontSize: isMobile ? '1rem' : undefined }}>
          {getTitle()}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleTakeExam}
          size={size}
          sx={{
            background: 'linear-gradient(to right, #6a11cb, #2575fc)',
            '&:hover': { opacity: 0.9 }
          }}
        >
          Take Exam
        </Button>
        <Button variant="outlined" color="secondary" size={size}>
          My Progress
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: avatarSize, height: avatarSize, marginRight }}>
            <Person sx={{ fontSize: personFontSize }} />
          </Avatar>
          {!isMobile && <Typography variant="body1">{username}</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentHeader;