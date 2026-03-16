import React from "react";
import {
  Paper,
  Box,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { School, Assignment, HelpOutline, Book } from "@mui/icons-material";

interface Stat {
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
}

interface Props {
  stat: Stat;
  loading?: boolean;
}

const StatsCard: React.FC<Props> = ({ stat, loading }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "School":
        return (
          <School
            sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: "white" }}
          />
        );
      case "Assignment":
        return (
          <Assignment
            sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: "white" }}
          />
        );
      case "HelpOutline":
        return (
          <HelpOutline
            sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: "white" }}
          />
        );
      case "Book":
        return (
          <Book sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: "white" }} />
        );
      default:
        return (
          <School
            sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: "white" }}
          />
        );
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 2 },
        padding: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: 2,
        flex: 1,
        backgroundColor: "background.paper",
      }}
    >
      <Avatar
        sx={{
          width: { xs: 40, sm: 50, md: 60 },
          height: { xs: 40, sm: 50, md: 60 },
          background: stat.bgColor,
          boxShadow: 3,
        }}
      >
        {getIcon(stat.icon)}
      </Avatar>

      <Box>
        <Typography
          variant="h6"
          color="text.primary"
          sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Loading...
            </Box>
          ) : (
            stat.title
          )}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: 12, sm: 13, md: 14 } }}
        >
          {stat.subtitle}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatsCard;
