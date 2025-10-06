import React from 'react';
import { Paper, Typography, Box, useMediaQuery } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
  height?: number;
}

const ChartCard: React.FC<Props> = ({ title, children, height }) => {
  const isMobile = useMediaQuery('(max-width:767px)');

  return (
    <Paper
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: 2,
        boxShadow: 3,
        width: '100%',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: isMobile ? '18px' : '20px',
          marginBottom: isMobile ? '15px' : '20px',
          color: '#2c3e50',
          paddingBottom: '10px',
          borderBottom: '2px solid #f0f0f0',
        }}
      >
        {title}
      </Typography>
      <Box
        className="chart-container"
        sx={{
          height,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard;