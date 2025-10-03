import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';
import {
  School,
  Assignment,
  HelpOutline,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import styles from './StatsCard.module.css';

interface Stat {
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  trendUp: boolean;
  trend: string;
}

interface Props {
  stat: Stat;
}

const StatsCard: React.FC<Props> = ({ stat }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'School': return <School sx={{ fontSize: 28, color: 'white' }} />;
      case 'Assignment': return <Assignment sx={{ fontSize: 28, color: 'white' }} />;
      case 'HelpOutline': return <HelpOutline sx={{ fontSize: 28, color: 'white' }} />;
      case 'TrendingUp': return <TrendingUp sx={{ fontSize: 28, color: 'white' }} />;
      default: return <School sx={{ fontSize: 28, color: 'white' }} />;
    }
  };

  return (
    <Paper elevation={1} className={styles.statCard}>
      <Avatar
        sx={{
          width: 60,
          height: 60,
          background: stat.bgColor,
          boxShadow: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: 5,
          },
        }}
      >
        {getIcon(stat.icon)}
      </Avatar>
      <Box>
        <Typography variant="h6" color="text.primary">
          {stat.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stat.subtitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '5px',
              bgcolor: stat.trendUp ? 'success.light' : 'error.light',
              color: stat.trendUp ? 'success.main' : 'error.main',
            }}
          >
            {stat.trendUp ? (
              <ArrowUpward sx={{ fontSize: '10px' }} />
            ) : (
              <ArrowDownward sx={{ fontSize: '10px' }} />
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: stat.trendUp ? 'success.main' : 'error.main' }}
          >
            {stat.trend}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default StatsCard;