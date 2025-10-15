"use client";

import React, { useState } from "react";
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

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ open, onClose, onUserAdded }) => {
  const [newUser, setNewUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "student",
    grade: "",
    section: "",
    status: "active",
  });

  const handleSubmit = async () => {
    // Simple validation
    if (!newUser.username || !newUser.first_name || !newUser.email) {
      alert("Please fill in all required fields (Username, First Name, Email).");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();

      if (data.success) {
        onUserAdded(data.user);
        onClose();
        setNewUser({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          role: "student",
          grade: "",
          section: "",
          status: "active",
        });
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Add New User</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          fullWidth
          required
        />
        <TextField
          label="First Name"
          value={newUser.first_name}
          onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
          fullWidth
          required
        />
        <TextField
          label="Last Name"
          value={newUser.last_name}
          onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          fullWidth
          required
        />

        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={newUser.role}
            label="Role"
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        {newUser.role === "student" && (
          <>
            <TextField
              label="Class / Group"
              value={newUser.grade}
              onChange={(e) => setNewUser({ ...newUser, grade: e.target.value })}
              fullWidth
            />
            {/* <TextField
              label="Section"
              value={newUser.section}
              onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
              fullWidth
            /> */}
          </>
        )}

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={newUser.status}
            label="Status"
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
          }}
        >
          Save User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
