"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Divider,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";

/* =========================
   YUP VALIDATION SCHEMA
========================= */
const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:768px)");

//   const validateField = async (
//     field: "password" | "confirmPassword",
//     value: string,
//   ) => {
//     try {
//       await resetPasswordSchema.validateAt(field, {
//         password,
//         confirmPassword,
//         [field]: value,
//       });
//       setErrors((prev) => ({ ...prev, [field]: "" }));
//     } catch (err: any) {
//       setErrors((prev) => ({ ...prev, [field]: err.message }));
//     }
//   };
  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // ✅ Validate
      await resetPasswordSchema.validate(
        { password, confirmPassword },
        { abortEarly: false }
      );

      // ✅ Get email from URL
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");

      if (!email) {
        setSnackbar({
          open: true,
          message: "Invalid request",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // ✅ API Call
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.error || "Failed to reset password",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // ✅ Success
      setSuccess(true);
      setSnackbar({
        open: true,
        message: "Password updated successfully!",
        severity: "success",
      });

      // ✅ Redirect to login
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) {
      if (err.name === "ValidationError") {
        const fieldErrors: any = {};
        err.inner.forEach((e: any) => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setSnackbar({
          open: true,
          message: "Something went wrong",
          severity: "error",
        });
      }
      setLoading(false);
    }
  };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});
//     setLoading(true);

//     try {
//       await resetPasswordSchema.validate(
//         { password, confirmPassword },
//         { abortEarly: false },
//       );

//       // Get token from URL
//       const params = new URLSearchParams(window.location.search);
//       const token = params.get("token");

//       if (!token) {
//         setSnackbar({
//           open: true,
//           message: "Invalid or missing reset token",
//           severity: "error",
//         });
//         setLoading(false);
//         return;
//       }

//       // Call reset password API
//       const res = await fetch("/api/users/reset-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ password, token }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setSnackbar({
//           open: true,
//           message: data.error || "Failed to reset password",
//           severity: "error",
//         });
//         setLoading(false);
//         return;
//       }

//       setSuccess(true);
//       setSnackbar({
//         open: true,
//         message: data.message || "Password reset successfully!",
//         severity: "success",
//       });

//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     } catch (err: any) {
//       if (err.name === "ValidationError") {
//         const fieldErrors: any = {};
//         err.inner.forEach((e: any) => {
//           fieldErrors[e.path] = e.message;
//         });
//         setErrors(fieldErrors);
//       } else {
//         console.error(err);
//         setSnackbar({
//           open: true,
//           message: "Something went wrong",
//           severity: "error",
//         });
//       }
//       setLoading(false);
//     }
//   };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: isMobile ? "100%" : 450,
          borderRadius: 3,
          p: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 50, color: "#2575fc", mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#2575fc" }}>
            MCQ Exam Portal
          </Typography>
        </Box>

        {/* Description */}
        <Typography sx={{ textAlign: "center", color: "#555", mb: 3 }}>
          Enter your new password below to reset your account password.
        </Typography>



        {/* {success ? (
          <Box
            sx={{
              p: 2,
              border: "1px solid #4caf50",
              borderRadius: 2,
              backgroundColor: "#e8f5e9",
              textAlign: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ color: "#2e7d32", fontWeight: 600, mb: 1 }}>
              Password Reset Successful!
            </Typography>
            <Typography sx={{ color: "#388e3c" }}>
              You will be redirected to login shortly.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
              }}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateField("confirmPassword", e.target.value);
              }}
              margin="normal"
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
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
              }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        )} */}
        {success ? (
          <Typography color="green" textAlign="center">
            Password updated! Redirecting...
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {/* PASSWORD */}
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
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

            {/* CONFIRM PASSWORD */}
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Back to login */}
        <Box sx={{ textAlign: "center" }}>
          <Typography>
            Remember your password?{" "}
            <Button
              href="/"
              sx={{
                color: "#2575fc",
                textTransform: "none",
                fontWeight: 600,
                padding: 0,
                minWidth: 0,
              }}
            >
              Back to Login
            </Button>
          </Typography>
        </Box>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}