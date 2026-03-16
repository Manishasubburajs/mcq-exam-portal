import React from "react";
import {
  Paper,
  Box,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  School,
  Assignment,
  HelpOutline,
  TrendingUp,
} from "@mui/icons-material";
import styles from "./StatsCard.module.css";

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
        return <School sx={{ fontSize: 28, color: "white" }} />;
      case "Assignment":
        return <Assignment sx={{ fontSize: 28, color: "white" }} />;
      case "HelpOutline":
        return <HelpOutline sx={{ fontSize: 28, color: "white" }} />;
      case "TrendingUp":
        return <TrendingUp sx={{ fontSize: 28, color: "white" }} />;
      default:
        return <School sx={{ fontSize: 28, color: "white" }} />;
    }
  };

  return (
    <Paper
      elevation={1}
      className={styles.statCard}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar
        sx={{
          width: 50,
          height: 50,
          background: stat.bgColor,
          boxShadow: 3,
          color: "#fff",
        }}
      >
        {getIcon(stat.icon)}
      </Avatar>

      <Box>
        <Typography variant="h6" color="text.primary">
          {loading ? (
            <>
              <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
              Loading...
            </>
          ) : (
            stat.title
          )}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {stat.subtitle}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatsCard;
