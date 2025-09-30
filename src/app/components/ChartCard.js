import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ChartCard = ({ title, children, height = 300 }) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: '20px',
          marginBottom: '20px',
          color: '#2c3e50',
          paddingBottom: '10px',
          borderBottom: '2px solid #f0f0f0',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ height }}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard;