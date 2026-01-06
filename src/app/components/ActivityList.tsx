import React from 'react';
import { List, ListItem, Avatar, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assignment,
  PersonAdd,
  Backup,
  Publish,
  ReportProblem,
} from '@mui/icons-material';

interface Activity {
  title: string;
  time: string;
  icon: string;
  bgColor: string;
  color: string;
}

interface Props {
  activities: Activity[];
}

const ActivityItem = styled(ListItem)(({ theme }) => ({
  padding: '15px 0',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  alignItems: 'flex-start',
}));

const ActivityList: React.FC<Props> = ({ activities }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Assignment': return <Assignment />;
      case 'PersonAdd': return <PersonAdd />;
      case 'Backup': return <Backup />;
      case 'Publish': return <Publish />;
      case 'ReportProblem': return <ReportProblem />;
      default: return <Assignment />;
    }
  };

  return (
    <List sx={{ padding: 0 }}>
      {activities.map((activity, index) => (
        <ActivityItem key={index}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              fontSize: '24px',
              backgroundColor: activity.bgColor,
              color: activity.color,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {getIcon(activity.icon)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, marginBottom: '5px' }}>
              {activity.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {activity.time}
            </Typography>
          </Box>
        </ActivityItem>
      ))}
    </List>
  );
};

export default ActivityList;