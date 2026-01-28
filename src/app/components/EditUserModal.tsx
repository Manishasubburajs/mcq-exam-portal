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
  Snackbar,
  Alert,
  Typography,
  FormHelperText,
} from "@mui/material";
import * as yup from "yup";

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
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const studentSchema = yup.object().shape({
    first_name: yup.string().required("First Name is required"),
    last_name: yup.string().required("Last Name is required"),
    email: yup
      .string()
      .trim()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Enter a valid email address",
      )
      .required("Email is required"),
    grade: yup.string().required("Grade / Department is required"),
    school: yup.string().required("School / College is required"),
    dob: yup.string().required("Date of Birth is required"),
    gender: yup.string().required("Gender is required"),
  });

  const teacherAdminSchema = yup.object().shape({
    first_name: yup.string().required("First Name is required"),
    last_name: yup.string().required("Last Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
  });

  const handleChange = async (field: string, value: string) => {
    if (!editUser) return;
    setEditUser({ ...editUser, [field]: value });

    const schema =
      editUser.role === "student" ? studentSchema : teacherAdminSchema;

    try {
      await schema.validateAt(field, { ...editUser, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  };

  // --------------------------------------------
  // LOAD USER DETAILS INTO MODAL (FORMAT DOB)
  // --------------------------------------------
  useEffect(() => {
    if (user && open) {
      // Handle both nested and flattened data structure
      const userData = {
        ...user,
        // Handle flattened data (from UserManagement page)
        dob: user.dob || user.student_details?.dob || "",
        grade: user.grade || user.student_details?.grade || "",
        section: user.section || user.student_details?.section || "",
        school: user.school || user.student_details?.school || "",
        gender: user.gender || user.student_details?.gender || "",
      };

      // Fix DOB formatting for HTML date input (YYYY-MM-DD)
      if (
        userData.dob &&
        typeof userData.dob === "string" &&
        userData.dob.includes("T")
      ) {
        userData.dob = userData.dob.split("T")[0];
      }

      setEditUser(userData);
      setErrors({});
    }
  }, [user, open]);

  if (!editUser) return null;

  // --------------------------------------------
  // SAVE CHANGES
  // --------------------------------------------
  const handleSave = async () => {
    if (!editUser) return;

    const schema =
      editUser.role === "student" ? studentSchema : teacherAdminSchema;

    try {
      // Validate
      await schema.validate(editUser, { abortEarly: false });
      setErrors({});

      // Prepare data for API
      const updateData: any = {
        user_id: editUser.user_id,
        username: editUser.username,
        first_name: editUser.first_name,
        last_name: editUser.last_name,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status,
      };

      if (editUser.role === "student") {
        updateData.grade = editUser.grade || null;
        updateData.section = editUser.section || null;
        updateData.school = editUser.school || null;
        updateData.gender = editUser.gender || null;
        updateData.dob = editUser.dob
          ? new Date(editUser.dob + "T00:00:00").toISOString()
          : null;
      }

      // Call API
      const res = await fetch("/api/users?id=" + editUser.user_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setSuccessOpen(true);
        onUserUpdated(data.data);

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMessage(data.error || "Failed to update user");
        setErrorOpen(true);
      }
    } catch (err: any) {
      if (err.inner) {
        const formErrors: any = {};
        err.inner.forEach((e: any) => {
          formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        console.error(err);
        setErrorMessage("Something went wrong while updating the user!");
        setErrorOpen(true);
      }
    }
  };

  const handleCancel = () => {
    setEditUser(user);
    setErrors({});
    onClose();
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
          onChange={(e) => handleChange("first_name", e.target.value)}
          error={!!errors.first_name}
          helperText={errors.first_name}
          fullWidth
        />

        <TextField
          label="Last Name"
          value={editUser.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
          error={!!errors.last_name}
          helperText={errors.last_name}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={editUser.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
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
              label="Date of Birth"
              type="date"
              value={editUser.dob || ""}
              onChange={(e) => handleChange("dob", e.target.value)}
              error={!!errors.dob}
              helperText={errors.dob}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={editUser.gender || ""}
                label="Gender"
                onChange={(e) => handleChange("gender", e.target.value)}
                error={!!errors.gender}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {errors.gender && (
                <Typography variant="caption" color="error">
                  {errors.gender}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="School / College Name"
              value={editUser.school || ""}
              onChange={(e) => handleChange("school", e.target.value)}
              error={!!errors.school}
              helperText={errors.school}
              fullWidth
            />

            <TextField
              label="Grade / Department"
              value={editUser.grade || ""}
              onChange={(e) => handleChange("grade", e.target.value)}
              error={!!errors.grade}
              helperText={errors.grade}
              fullWidth
            />

            <TextField
              label="Section (Optional)"
              value={editUser.section || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, section: e.target.value })
              }
              fullWidth
            />
          </>
        )}

        {/* STATUS */}
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={editUser.status}
            label="Status"
            onChange={(e) =>
              setEditUser({ ...editUser, status: e.target.value })
            }
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ pb: 2, pr: 2 }}>
        <Button onClick={handleCancel}>Cancel</Button>
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

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          User updated successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditUserModal;
