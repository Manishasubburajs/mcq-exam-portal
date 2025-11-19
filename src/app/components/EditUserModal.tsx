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

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;

  // Student details (optional)
  grade?: string;
  section?: string;
  school?: string;
  dob?: string;
  gender?: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [editUser, setEditUser] = useState<User | null>(null);

  // --------------------------------------------
  // LOAD USER DETAILS INTO MODAL (FORMAT DOB)
  // --------------------------------------------
  useEffect(() => {
    if (user) {
      setEditUser({
        ...user,

        // Fix DOB formatting for HTML date input (YYYY-MM-DD)
        dob: user.student_details?.dob
          ? user.student_details.dob.split("T")[0]
          : "",

        grade: user.student_details?.grade || "",
        section: user.student_details?.section || "",
        school: user.student_details?.school || "",
        gender: user.student_details?.gender || "",
      });
    }
  }, [user]);

  if (!editUser) return null;

  // --------------------------------------------
  // SAVE CHANGES
  // --------------------------------------------
  const handleSave = async () => {
    try {
      const updateData: any = {
        user_id: editUser.user_id,
        username: editUser.username,
        first_name: editUser.first_name,
        last_name: editUser.last_name,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status,
      };

      // If role = student → send student detail fields
      if (editUser.role === "student") {
        updateData.grade = editUser.grade || null;
        updateData.section = editUser.section || null;
        updateData.school = editUser.school || null;

        // FIX: Convert date to ISO to avoid Prisma crash
        updateData.dob = editUser.dob
          ? new Date(editUser.dob + "T00:00:00").toISOString()
          : null;

        updateData.gender = editUser.gender || null;
      }

      console.log("Sending update data:", updateData);

      const res = await fetch("/api/users?id=" + editUser.user_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      console.log("Response data:", data);

      if (data.user) {
        onUserUpdated(data.user);
        onClose();
      } else {
        alert("Error: " + data.message);
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
          pt: 1.5,
        }}
      >
        {/* Username - disabled */}
        <TextField
          label="Username"
          value={editUser.username}
          disabled
          fullWidth
          sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, mt: 2 }}
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

        {/* STUDENT FIELDS */}
        {editUser.role === "student" && (
          <>
            <TextField
              label="Grade"
              value={editUser.grade || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, grade: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Section"
              value={editUser.section || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, section: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="School"
              value={editUser.school || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, school: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Date of Birth"
              type="date"
              value={editUser.dob || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, dob: e.target.value })
              }
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={editUser.gender || ""}
                label="Gender"
                onChange={(e) =>
                  setEditUser({ ...editUser, gender: e.target.value })
                }
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {/* STATUS */}
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
