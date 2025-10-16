import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
  minHeight?: { xs: number; sm: number; md: number };
  maxHeight?: { xs: number; sm: number; md: number };
}

const ChartContainer: React.FC<Props> = ({ title, children, minHeight, maxHeight }) => {
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "background.paper",
        minHeight: minHeight || { xs: 220, sm: 220, md: 280 },
        maxHeight: maxHeight || { xs: 260, sm: 260, md: 320 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: '18px', sm: '20px' },
          marginBottom: '20px',
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
          height: '100%',
          minHeight: { xs: 180, sm: 180, md: 240 },
          maxHeight: { xs: 220, sm: 220, md: 280 },
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

export default ChartContainer;