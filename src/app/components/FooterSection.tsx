import { Box, Typography, useTheme } from "@mui/material";
import { useState, useEffect } from "react";

const FooterSection = () => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(theme.breakpoints.down('md'));
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.breakpoints]);

  return (
    <Box
      sx={{
        width: '100%',
        background: "#7B68EE",
        color: 'white',
        p: isMobile ? 2 : 3,
        mt: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          letterSpacing: 0.2,
          mb: 1,
          textAlign: 'center',
          color: "#FFFFFF",
        }}
      >
        MCQ Portal
      </Typography>
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          opacity: 0.9,
          maxWidth: 600,
        }}
      >
        Empowering students with seamless exam experiences. © 2023 MCQ Portal. All rights reserved.
      </Typography>
    </Box>
  );
};

export default FooterSection;