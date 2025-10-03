"use client";

import { useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Divider,
  useMediaQuery,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School"; // Logo icon

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(true);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
    }, 1000);
  };

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
          Enter your email to reset your password
        </Typography>

        {/* Form */}
        {success ? (
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
              Reset Link Sent!
            </Typography>
            <Typography sx={{ color: "#388e3c" }}>
              We sent a password reset link to <strong>{email}</strong>. Check
              your inbox.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              error={error}
              helperText={error ? "Please enter a valid email address" : ""}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { fontWeight: 500 },
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
                "&:hover": {
                  background: "linear-gradient(to right, #5a0fb5, #1d5edb)",
                },
              }}
            >
              Send Reset Link
            </Button>
          </Box>
        )}

        {/* Security Notice */}
        <Box
          sx={{
            backgroundColor: "#f8f9fa",
            borderLeft: "4px solid #2575fc",
            borderRadius: 2,
            p: 2,
            mt: 3,
          }}
        >
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#2575fc",
              fontWeight: 600,
              mb: 1,
            }}
          >
            <SchoolIcon /> Security Notice
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
            For security reasons, the password reset link will expire in 30
            minutes. If you don't receive the email, please check your spam
            folder or contact support.
          </Typography>
        </Box>

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
    </Box>
  );
}
