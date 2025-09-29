import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Avatar } from '@mui/material';
import {
  AddCircle,
  Person,
  BarChart,
  Settings,
  Download,
} from '@mui/icons-material';
import { FaQuestionCircle } from 'react-icons/fa';
import styles from './QuickActionCard.module.css';

const QuickActionCard = ({ action, onClick }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'AddCircle': return <AddCircle />;
      case 'Person': return <Person />;
      case 'HelpOutline': return <FaQuestionCircle />;
      case 'BarChart': return <BarChart />;
      case 'Settings': return <Settings />;
      case 'Download': return <Download />;
      default: return <AddCircle />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        onClick={() => onClick(action.title)}
        className={styles.actionCard}
        sx={{
          height: '100%',
          p: 2,
          '&:hover': { backgroundColor: 'transparent' } // Disable default hover
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 0 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
            {getIcon(action.icon)}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {action.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {action.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default QuickActionCard;