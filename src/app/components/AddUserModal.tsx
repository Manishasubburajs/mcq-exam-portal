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
  Divider,
  Box,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

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
    school: "",
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
        school: "",
        status: "active",
      });
      setErrors({});
    }
  }, [open, defaultRole]);

  // ----------------- VALIDATION SCHEMAS -----------------
  const studentSchema = yup.object().shape({
    username: yup
      .string()
      .min(4, "Username must be at least 4 characters")
      .required("Username is required"),
    email: yup
      .string()
      .trim()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Enter a valid email address",
      )
      .required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-zA-Z]/, "Password must contain letters")
      .matches(/\d/, "Password must contain numbers")
      .required("Password is required"),
    first_name: yup.string().required("First name is required"),
    last_name: yup.string().required("Last name is required"),
    dob: yup.string().required("Date of Birth is required"),
    gender: yup.string().required("Gender is required"),
    grade: yup.string().required("Grade / Department is required"),
    // section: yup.string().required("Section is required"),
    school: yup.string().required("School / College is required"),
  });

  const teacherAdminSchema = yup.object().shape({
    username: yup
      .string()
      .min(4, "Username must be at least 4 characters")
      .required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-zA-Z]/, "Password must contain letters")
      .matches(/\d/, "Password must contain numbers")
      .required("Password is required"),
    first_name: yup.string().required("First Name is required"),
    last_name: yup.string().required("Last Name is required"),
  });

  // ----------------- HANDLE CHANGE WITH REAL-TIME VALIDATION -----------------
  const handleChange = async (field: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));

    // Determine schema
    const schema =
      newUser.role === "student" ? studentSchema : teacherAdminSchema;

    try {
      // Validate only this field
      await schema.validateAt(field, { ...newUser, [field]: value });
      setErrors((prev: any) => ({ ...prev, [field]: "" })); // clear error if valid
    } catch (err: any) {
      setErrors((prev: any) => ({ ...prev, [field]: err.message }));
    }
  };

  // ----------------- SUBMIT -----------------
  const handleSubmit = async () => {
    const schema =
      newUser.role === "student" ? studentSchema : teacherAdminSchema;
    try {
      await schema.validate(newUser, { abortEarly: false });
      setErrors({});

      const { password, ...rest } = newUser;
      const payload = { ...rest, password_hash: password };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        const backendErrors = data.validationErrors
          ? Object.values(data.validationErrors).join(", ")
          : data.error || "Unknown error";
        setSnackbarSeverity("error");
        setSnackbarMessage(`❌ ${backendErrors}`);
        setSnackbarOpen(true);
        return;
      }

      const normalizedUser = {
        ...data.data,
        grade: data.data.student_details?.grade || "",
        section: data.data.student_details?.section || "",
      };

      setSnackbarSeverity("success");
      setSnackbarMessage(
        `✅ ${newUser.first_name} ${newUser.last_name} created successfully!`,
      );
      setSnackbarOpen(true);
      onUserAdded(normalizedUser);
      onClose();
    } catch (err: any) {
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        alert("❌ Network or server error. Try again.");
      }
    }
  };

  // ----------------- FORM RENDER -----------------
  const renderStudentForm = () => (
    <Box>
      <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
        Account Details
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField
        label="Username"
        fullWidth
        value={newUser.username}
        onChange={(e) => handleChange("username", e.target.value)}
        error={!!errors.username}
        helperText={errors.username}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        fullWidth
        value={newUser.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        value={newUser.password}
        onChange={(e) => handleChange("password", e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="First Name"
        fullWidth
        value={newUser.first_name}
        onChange={(e) => handleChange("first_name", e.target.value)}
        error={!!errors.first_name}
        helperText={errors.first_name}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Last Name"
        fullWidth
        value={newUser.last_name}
        onChange={(e) => handleChange("last_name", e.target.value)}
        error={!!errors.last_name}
        helperText={errors.last_name}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Date of Birth"
        type="date"
        InputLabelProps={{ shrink: true }}
        fullWidth
        value={newUser.dob}
        onChange={(e) => handleChange("dob", e.target.value)}
        error={!!errors.dob}
        helperText={errors.dob}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      <TextField
        label="School / College Name"
        fullWidth
        value={newUser.school}
        onChange={(e) => handleChange("school", e.target.value)}
        error={!!errors.school}
        helperText={errors.school}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Grade / Department"
        fullWidth
        value={newUser.grade}
        onChange={(e) => handleChange("grade", e.target.value)}
        error={!!errors.grade}
        helperText={errors.grade}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Section (Optional)"
        fullWidth
        value={newUser.section}
        onChange={(e) => handleChange("section", e.target.value)}
        sx={{ mb: 2 }}
      />

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save Student
        </Button>
      </DialogActions>
    </Box>
  );

  const renderOtherForm = () => (
    <Box>
      <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
        Account Details
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField
        label="Username"
        fullWidth
        value={newUser.username}
        onChange={(e) => handleChange("username", e.target.value)}
        error={!!errors.username}
        helperText={errors.username}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        fullWidth
        value={newUser.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        value={newUser.password}
        onChange={(e) => handleChange("password", e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="First Name"
        fullWidth
        value={newUser.first_name}
        onChange={(e) => handleChange("first_name", e.target.value)}
        error={!!errors.first_name}
        helperText={errors.first_name}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Last Name"
        fullWidth
        value={newUser.last_name}
        onChange={(e) => handleChange("last_name", e.target.value)}
        error={!!errors.last_name}
        helperText={errors.last_name}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Role"
        fullWidth
        value={newUser.role}
        disabled
        sx={{ mb: 2 }}
      />

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
        </Button>
      </DialogActions>
    </Box>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {newUser.role === "student" ? renderStudentForm() : renderOtherForm()}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddUserModal;
