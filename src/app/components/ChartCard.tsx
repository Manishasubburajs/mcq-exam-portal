import React from 'react';
import { Paper, Typography, Box, useMediaQuery } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<Props> = ({ title, children }) => {
  const isMobile = useMediaQuery('(max-width:767px)');

  return (
    <Paper
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 2,
        boxShadow: 3,
        width: '100%',
        minHeight: { xs: 220, sm: 220, md: 280 },
        maxHeight: { xs: 260, sm: 260, md: 320 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
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
          minHeight: { xs: 180, sm: 180, md: 240 },
          maxHeight: { xs: 220, sm: 220, md: 280 },
          height: '100%',
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          '& > *': {
            maxHeight: '100% !important',
            maxWidth: '100% !important',
            height: '100% !important',
            width: '100% !important',
            boxSizing: 'border-box !important',
          },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard;