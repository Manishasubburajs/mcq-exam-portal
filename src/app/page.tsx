"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Yup from "yup";
import {
  Box,
  Card,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  useMediaQuery,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";

/* =========================
   YUP VALIDATION SCHEMA
========================= */
const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .trim()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Enter a valid email address",
    ),

  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
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

  const isMobile = useMediaQuery("(max-width:768px)");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =========================
     FIELD LEVEL VALIDATION
  ========================= */
  const validateField = async (field: "email" | "password", value: string) => {
    try {
      await loginSchema.validateAt(field, {
        email,
        password,
        [field]: value,
      });

      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  };

  /* =========================
     LOGIN HANDLER
  ========================= */
  const handleLogin = async () => {
    if (loading) return; // prevent multiple submissions

    try {
      setLoading(true);
      setErrors({});

      await loginSchema.validate({ email, password }, { abortEarly: false });

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          open: true,
          message: data.error || "Login failed",
          severity: "error",
        });
        return;
      }

      const sessionStartTime = Date.now().toString();

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("sessionStartTime", sessionStartTime);
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("sessionStartTime", sessionStartTime);
      }

      setAlert({
        open: true,
        message: data.message || "Login successful! Redirecting...",
        severity: "success",
      });

      if (data.role === "admin") {
        router.push("/admin-pages");
      } else if (data.role === "student") {
        router.push("/student-pages");
      } else {
        setAlert({
          open: true,
          message: "Invalid user role. Please contact support.",
          severity: "error",
        });
      }
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const fieldErrors: any = {};
        err.inner.forEach((e: any) => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error("Login Error:", err);
        setAlert({
          open: true,
          message: "Something went wrong. Try again.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
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
          display: "flex",
          flexDirection: mounted && isMobile ? "column" : "row",
          width: mounted && isMobile ? "100%" : 850,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Banner Section */}
        <Box
          sx={{
            flex: 1,
            background:
              "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'><rect fill='%236a11cb' width='500' height='500'/><path fill='%232575fc' d='M250,0 L500,250 L250,500 L0,250 Z'/></svg>\")",
            backgroundSize: "cover",
            color: "white",
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" gutterBottom>
            MCQ Exam Portal
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Welcome to the student assessment system designed for educational
            institutions.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Take exams, review your results, and track your progress all in one
            place.
          </Typography>
          <Typography>Secure, reliable, and easy to use.</Typography>
        </Box>

        {/* Form Section */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" sx={{ color: "#2575fc", fontWeight: 700 }}>
              MCQ{" "}
              <Box component="span" sx={{ color: "#6a11cb" }}>
                Exam Portal
              </Box>
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <TextField
              margin="normal"
              fullWidth
              label="Enter Email Id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
              }}
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                my: 1,
              }}
            >
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              /> */}
              <Link
                href="/forgot-password"
                style={{ textDecoration: "none", color: "#2575fc" }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
              }}
            >
              {loading ? (
                <span
                  style={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

            <Divider sx={{ my: 3 }}>Or login with</Divider>

            {/* ✅ SOCIAL MEDIA ICONS (RESTORED) */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                sx={{ minWidth: 0, width: 50, height: 50, borderRadius: "50%" }}
                onClick={() =>
                  (globalThis.location.href = "https://accounts.google.com")
                }
              >
                <GoogleIcon sx={{ color: "#DB4437" }} />
              </Button>

              <Button
                sx={{ minWidth: 0, width: 50, height: 50, borderRadius: "50%" }}
                onClick={() =>
                  (globalThis.location.href = "https://www.facebook.com/")
                }
              >
                <FacebookIcon sx={{ color: "#1877F2" }} />
              </Button>

              <Button
                sx={{ minWidth: 0, width: 50, height: 50, borderRadius: "50%" }}
                onClick={() =>
                  (globalThis.location.href = "https://twitter.com/")
                }
              >
                <TwitterIcon sx={{ color: "#1DA1F2" }} />
              </Button>
            </Box>

            <Typography variant="body2" align="center" sx={{ color: "#666" }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                style={{ color: "#2575fc", fontWeight: 600 }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Card>

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
