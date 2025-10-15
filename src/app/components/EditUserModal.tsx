"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: any | null;
  onUserUpdated: (updatedUser: any) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [editUser, setEditUser] = useState<any>(user);

  useEffect(() => {
    setEditUser(user);
  }, [user]);

  if (!editUser) return null;

  const handleSave = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editUser.user_id,
          username: editUser.username,
          first_name: editUser.first_name,
          last_name: editUser.last_name,
          email: editUser.email,
          role: editUser.role,
          status: editUser.status,
          grade: editUser.grade || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onUserUpdated(data.user);
        onClose();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Edit User</DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          
          pt: 1.5, // adds internal top padding
        }}
      >
        {/* Username - visible but disabled */}
        <TextField
          label="Username"
          value={editUser.username}
          disabled
          fullWidth
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: 1,
            mt:2
          }}
        />

        <TextField
          label="First Name"
          value={editUser.first_name}
          onChange={(e) =>
            setEditUser({ ...editUser, first_name: e.target.value })
          }
          fullWidth
        />

        <TextField
          label="Last Name"
          value={editUser.last_name}
          onChange={(e) =>
            setEditUser({ ...editUser, last_name: e.target.value })
          }
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={editUser.email}
          onChange={(e) =>
            setEditUser({ ...editUser, email: e.target.value })
          }
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select value={editUser.role} label="Role" disabled>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        {editUser.role === "student" && (
          <TextField
            label="Class / Grade"
            value={editUser.grade || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, grade: e.target.value })
            }
            fullWidth
          />
        )}

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={editUser.status} label="Status" disabled>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ pb: 2, pr: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
