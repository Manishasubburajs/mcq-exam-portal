"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import MUI components to avoid SSR issues
const Dialog = dynamic(() => import("@mui/material/Dialog"), { ssr: false });
const DialogTitle = dynamic(() => import("@mui/material/DialogTitle"), { ssr: false });
const DialogContent = dynamic(() => import("@mui/material/DialogContent"), { ssr: false });
const DialogActions = dynamic(() => import("@mui/material/DialogActions"), { ssr: false });
const Button = dynamic(() => import("@mui/material/Button"), { ssr: false });
const Typography = dynamic(() => import("@mui/material/Typography"), { ssr: false });
const Box = dynamic(() => import("@mui/material/Box"), { ssr: false });
const AccessTimeIcon = dynamic(() => import("@mui/icons-material/AccessTime"), { ssr: false });

interface SessionTimeoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const router = useRouter();

  // Don't render on server side
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: "#f44336",
          }}
        >
          <AccessTimeIcon fontSize="large" />
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Session Expired
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>
          Your session has expired due to inactivity. Please log in again to continue.
        </Typography>
        <Typography variant="body2" sx={{ color: "#999" }}>
          For security reasons, you have been automatically logged out.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          onClick={() => {
            onConfirm();
            router.push("/");
          }}
          variant="contained"
          sx={{
            minWidth: 120,
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Log In Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;