"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: "error.main" }}>
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete{" "}
          <strong>{userName || "this user"}</strong>? <br />
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
