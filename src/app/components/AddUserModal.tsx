"use client";

import React, { useEffect, useState } from "react";
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
  Typography,
  Grid,
  Divider,
  Box,
} from "@mui/material";
import * as yup from "yup";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
  defaultRole: "student" | "teacher" | "admin";
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onUserAdded,
  defaultRole,
}) => {
  const [errors, setErrors] = useState<any>({});

  const [newUser, setNewUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    role: defaultRole,
    grade: "",
    section: "",
    department: "",
    status: "active",
  });

  useEffect(() => {
    if (open) {
      setNewUser({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        dob: "",
        gender: "",
        role: defaultRole,
        grade: "",
        section: "",
        department: "",
        status: "active",
      });
      setErrors({});
    }
  }, [open, defaultRole]);

  // ✅ Validation Schema
  const studentSchema = yup.object({
    username: yup.string().required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required(),
    first_name: yup.string().required("First Name is required"),
    last_name: yup.string().required("Last Name is required"),
    dob: yup.string().required("Date of Birth is required"),
    gender: yup.string().required("Gender is required"),
    grade: yup.string().required("Grade is required"),
    section: yup.string().required("Section is required"),
  });

  const handleChange = (field: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (newUser.role === "student") {
        await studentSchema.validate(newUser, { abortEarly: false });
      }
      setErrors({});

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (data.success) {
        onUserAdded(data.user);
        onClose();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      const newErrs: any = {};
      if (err.inner) {
        err.inner.forEach((e: any) => {
          newErrs[e.path] = e.message;
        });
      }
      setErrors(newErrs);
    }
  };

  // 🎓 Student Form (single page with sections)
  const renderStudentForm = () => (
    <Box>
      {/* Account Details */}
      <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
        Account Details
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            label="Username"
            fullWidth
            value={newUser.username}
            onChange={(e) => handleChange("username", e.target.value)}
            error={!!errors.username}
            helperText={errors.username}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Email"
            fullWidth
            value={newUser.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />
        </Grid>
      </Grid>

      {/* Personal Details */}
      <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
        Personal Details
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            label="First Name"
            fullWidth
            value={newUser.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            error={!!errors.first_name}
            helperText={errors.first_name}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Last Name"
            fullWidth
            value={newUser.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            error={!!errors.last_name}
            helperText={errors.last_name}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Date of Birth"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={newUser.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
            error={!!errors.dob}
            helperText={errors.dob}
          />
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={newUser.gender}
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
              <Typography color="error" variant="caption">
                {errors.gender}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/* Academic Details */}
      <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
        Academic Details
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            label="Grade"
            fullWidth
            value={newUser.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            error={!!errors.grade}
            helperText={errors.grade}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Section"
            fullWidth
            value={newUser.section}
            onChange={(e) => handleChange("section", e.target.value)}
            error={!!errors.section}
            helperText={errors.section}
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ mt: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save Student
        </Button>
      </DialogActions>
    </Box>
  );

  // 👩‍🏫 Simple form for Teacher/Admin
  const renderOtherForm = () => (
    <>
      <TextField
        label="Username"
        fullWidth
        value={newUser.username}
        onChange={(e) => handleChange("username", e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="First Name"
        fullWidth
        value={newUser.first_name}
        onChange={(e) => handleChange("first_name", e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Last Name"
        fullWidth
        value={newUser.last_name}
        onChange={(e) => handleChange("last_name", e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        fullWidth
        value={newUser.email}
        onChange={(e) => handleChange("email", e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Department / Group"
        fullWidth
        value={newUser.department}
        onChange={(e) => handleChange("department", e.target.value)}
        sx={{ mb: 2 }}
      />
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save {newUser.role === "teacher" ? "Teacher" : "Admin"}
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Add New {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        {newUser.role === "student" ? renderStudentForm() : renderOtherForm()}
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
