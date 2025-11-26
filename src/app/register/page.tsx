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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as yup from "yup";
import styles from "./page.module.css";

const steps = ["Account", "Personal", "Academic"];

// Step-wise validation schemas
const accountSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  username: yup
    .string()
    .min(4, "Username must be at least 4 characters")
    .required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain letters")
    .matches(/\d/, "Password must contain numbers")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

const personalSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  dob: yup.string().required("Date of Birth is required"),
  gender: yup.string().required("Gender is required"),
});

const academicSchema = yup.object({
  // studentId: yup.string().required("Student ID is required"),
  school: yup.string().required("School is required"),
  grade: yup.string().required("Grade is required"),
  agree: yup.bool().oneOf([true], "You must agree to terms"),
});

const stepSchemas = [accountSchema, personalSchema, academicSchema];

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
    dob: "",
    gender: "",
    // studentId: "",
    school: "",
    grade: "",
    section: "",
    agree: false,
  });

  const [errors, setErrors] = useState<any>({});

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
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        alert("✅ Registration successful!");
        console.log("Saved user:", data);

        // Redirect to login page or student dashboard
        globalThis.location.href = "/";
      } else {
        const err = await res.json();
        alert("❌ Error: " + err.error);
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("❌ Something went wrong.");
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
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: { xs: 'auto', md: 600 },
          }}
        >
          {/* Left Banner with Gradient */}
          <Box
            className={styles.bannerGradient}
            sx={{
              flex: 'none',
              width: { xs: '100%', md: '50%' },
              height: { xs: 500, md: 600 },
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
                <li
                  key={item}
                  className={styles.featureListItem}
                >
                  <span className={styles.featureIcon}>
                    ✔
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </Box>

          {/* Form Side */}
          <Box sx={{ flex: 1, p: 4, width: { xs: '100%', md: '50%' } }}>
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
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          aria-label="toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mb: 2
                }}>
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
                />
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  sx={{ mt: 2 }}
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
              </Box>
            )}

            {/* Step 3: Academic */}
            {activeStep === 2 && (
              <Box>
                {/* <TextField
                  fullWidth
                  margin="normal"
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                  error={!!errors.studentId}
                  helperText={errors.studentId}
                /> */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="School / Institution"
                  value={formData.school}
                  onChange={(e) => handleChange("school", e.target.value)}
                  error={!!errors.school}
                  helperText={errors.school}
                />
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.grade}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  sx={{ mt: 2 }}
                  error={!!errors.grade}
                >
                  <MenuItem value="">Select Grade</MenuItem>
                  <MenuItem value="9">9th Grade</MenuItem>
                  <MenuItem value="10">10th Grade</MenuItem>
                  <MenuItem value="11">11th Grade</MenuItem>
                  <MenuItem value="12">12th Grade</MenuItem>
                  <MenuItem value="college">College</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.grade && (
                  <Typography color="error" variant="caption">
                    {errors.grade}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Section (Optional)"
                  value={formData.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                />
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
                {activeStep === steps.length - 1
                  ? "Complete Registration"
                  : "Next"}
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
    </Box>
  );
}
