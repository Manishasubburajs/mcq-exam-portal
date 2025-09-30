import React from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

const Header = () => {
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
      <Typography variant="h4" sx={{ color: 'text.primary' }}>
        Admin Dashboard
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" color="primary">
          New Exam
        </Button>
        <Button variant="outlined" color="secondary">
          Export Data
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 40, height: 40, marginRight: '10px' }}>
            <AdminPanelSettings />
          </Avatar>
          <Typography variant="body1">Administrator</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;