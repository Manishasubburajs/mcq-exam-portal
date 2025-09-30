"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Grid,
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
} from "@mui/material";
import * as yup from "yup";

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
    .matches(/[0-9]/, "Password must contain numbers")
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
  studentId: yup.string().required("Student ID is required"),
  school: yup.string().required("School is required"),
  grade: yup.string().required("Grade is required"),
  agree: yup.bool().oneOf([true], "You must agree to terms"),
});

const stepSchemas = [accountSchema, personalSchema, academicSchema];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    studentId: "",
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
        window.location.href = "/";
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
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
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
            minHeight: 600,
          }}
        >
          {/* Left Banner with Gradient */}
          <Box
            sx={{
              flex: 1,
              background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'><rect fill='%236a11cb' width='500' height='500'/><path fill='%232575fc' d='M250,0 L500,250 L250,500 L0,250 Z'/></svg>")`,
              backgroundSize: "cover",
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
            <ol
              style={{
                marginLeft: "1rem",
                listStyle: "none", // remove numbers
                padding: 0,
              }}
            >
              {[
                "Access to hundreds of practice exams",
                "Detailed performance analytics",
                "Progress tracking and certificates",
                "24/7 availability from any device",
                "Expert-curated question bank",
              ].map((item, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#FFEB3B", // yellow background
                      color: "green",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "1.2rem",
                      height: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    ✔
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </Box>

          {/* Form Side */}
          <Box sx={{ flex: 1, p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" color="primary">
                MCQ <span style={{ color: "#6a11cb" }}>Exam Portal</span>
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
                {["email", "username", "password", "confirmPassword"].map(
                  (field) => (
                    <TextField
                      key={field}
                      fullWidth
                      margin="normal"
                      label={
                        field === "confirmPassword"
                          ? "Confirm Password"
                          : field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      type={field.includes("password") ? "password" : "text"}
                      value={formData[field as keyof typeof formData]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      error={!!errors[field]}
                      helperText={errors[field]}
                    />
                  )
                )}
              </Box>
            )}

            {/* Step 2: Personal */}
            {activeStep === 1 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid size={6}>
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
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  error={!!errors.dob}
                  helperText={errors.dob}
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
                <TextField
                  fullWidth
                  margin="normal"
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                  error={!!errors.studentId}
                  helperText={errors.studentId}
                />
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
              >
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                {activeStep === steps.length - 1
                  ? "Complete Registration"
                  : "Next"}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link href="/" style={{ color: "#2575fc" }}>
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
