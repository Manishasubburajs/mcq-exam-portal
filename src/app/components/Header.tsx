import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Avatar, Button, IconButton, useMediaQuery } from '@mui/material';
import { AdminPanelSettings, Menu } from '@mui/icons-material';

interface Props {
  onMenuClick?: () => void;
}

const Header: React.FC<Props> = ({ onMenuClick }) => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleNewExam = () => {
    router.push('/admin-pages/Create_Exam');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {onMenuClick && (
          <IconButton onClick={onMenuClick} sx={{ mr: 1 }}>
            <Menu />
          </IconButton>
        )}
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'text.primary' }}>
          Admin Dashboard
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" onClick={handleNewExam} size={isMobile ? 'small' : 'medium'}>
          New Exam
        </Button>
        <Button variant="outlined" color="secondary" size={isMobile ? 'small' : 'medium'}>
          Export Data
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, marginRight: isMobile ? '5px' : '10px' }}>
            <AdminPanelSettings />
          </Avatar>
          {!isMobile && <Typography variant="body1">Administrator</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default Header;