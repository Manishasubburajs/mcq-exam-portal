"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Paper,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as yup from "yup";
import styles from "./page.module.css";
import { CircularProgress } from "@mui/material";

const steps = ["Account", "Personal"];

// Step-wise validation schemas
const accountSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .trim("Email should not contain spaces")
    .email("Enter a valid email address")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Enter a valid email with proper domain",
    ),

  username: yup
    .string()
    .min(4, "Username must be at least 4 characters")
    .required("Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character",
    ),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

const personalSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[6-9]\d{9}$/, {
      message: "Enter a valid 10-digit mobile number",
      excludeEmptyString: true,
    }),
  dob: yup.string().required("Date of Birth is required"),
  gender: yup.string().required("Gender is required"),
  agree: yup.bool().oneOf([true], "You must agree to terms"),
});

const stepSchemas = [accountSchema, personalSchema];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    mobile: "",
    dob: "",
    gender: "",
    agree: false,
  });

  const [errors, setErrors] = useState<any>({});

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = async (field: string, value: any) => {
    // Update form data
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate current step field
    try {
      await stepSchemas[activeStep].validateAt(field, {
        ...formData,
        [field]: value,
      });
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    } catch (err: any) {
      setErrors((prev: any) => ({ ...prev, [field]: err.message }));
    }
  };

  // Inside Register.tsx

  // Submit handler
  const handleSubmit = async () => {
    if (loading) return; // prevent multiple submissions

    try {
      setLoading(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 201) {
        setAlert({
          open: true,
          message: data.message || "Registration successful! Redirecting...",
          severity: "success",
        });
        console.log("Saved user:", data);
        globalThis.location.href = "/"; // redirect to login/dashboard
      } else if (res.status === 409) {
        setAlert({
          open: true,
          message: data.error || "User already exists.",
          severity: "error",
        });
        console.log(data.error);
      } else {
        console.log(data.error);
        setAlert({
          open: true,
          message: data.error || "Something went wrong.",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Submit failed:", error);
      setAlert({
        open: true,
        message: "Something went wrong: " + error.message,
        severity: "error",
      });
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Modify handleNext
  const handleNext = async () => {
    try {
      await stepSchemas[activeStep].validate(formData, { abortEarly: false });

      if (activeStep === steps.length - 1) {
        // Last step → call backend API
        await handleSubmit();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } catch (err: any) {
      const newErrors: any = {};
      if (err.inner) {
        for (const e of err.inner) {
          if (e.path) newErrors[e.path] = e.message;
        }
      }
      setErrors(newErrors);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: { xs: "auto", md: 600 },
          }}
        >
          {/* Left Banner with Gradient */}
          <Box
            className={styles.bannerGradient}
            sx={{
              flex: "none",
              width: { xs: "100%", md: "50%" },
              // height: { xs: 500, md: 600 },
              color: "white",
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              Join Our Learning Community
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Register now to access our comprehensive MCQ exam portal designed
              to enhance your learning experience.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Take exams, track your progress, and improve your knowledge with
              our interactive platform.
            </Typography>
            <ol className={styles.featureList}>
              {[
                "Access to hundreds of practice exams",
                "Detailed performance analytics",
                "Progress tracking and certificates",
                "24/7 availability from any device",
                "Expert-curated question bank",
              ].map((item) => (
                <li key={item} className={styles.featureListItem}>
                  <span className={styles.featureIcon}>✔</span>
                  {item}
                </li>
              ))}
            </ol>
          </Box>

          {/* Form Side */}
          <Box sx={{ flex: 1, p: 4, width: { xs: "100%", md: "50%" } }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" color="primary">
                MCQ <span className={styles.portalTitle}>Exam Portal</span>
              </Typography>
              <Typography variant="subtitle1">Student Registration</Typography>
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Account */}
            {activeStep === 0 && (
              <Box>
                {/* Email */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />

                {/* Username */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  error={!!errors.username}
                  helperText={errors.username}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Confirm Password */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          aria-label="toggle confirm password visibility"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {/* Step 2: Personal */}
            {activeStep === 1 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  type="text"
                  margin="normal"
                  label="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) =>
                    handleChange("mobile", e.target.value.replace(/\D/g, ""))
                  }
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  inputProps={{
                    inputMode: "numeric",
                    maxLength: 10,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  error={!!errors.dob}
                  helperText={errors.dob}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  inputProps={{ max: "9999-12-31" }}
                />
                <FormControl fullWidth error={!!errors.gender} margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    error={!!errors.gender}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
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

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agree}
                      onChange={(e) => handleChange("agree", e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the <Link href="#">Terms of Service</Link> and{" "}
                      <Link href="#">Privacy Policy</Link>
                    </Typography>
                  }
                />
                {errors.agree && (
                  <Typography color="error" variant="caption">
                    {errors.agree}
                  </Typography>
                )}
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                color="secondary"
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                className={styles.gradientButton}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={18}
                      sx={{ mr: 1, color: "white" }}
                    />
                    Submitting...
                  </>
                ) : activeStep === steps.length - 1 ? (
                  "Complete Registration"
                ) : (
                  "Next"
                )}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link href="/" className={styles.loginLink}>
                  Log in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          variant="filled"
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
