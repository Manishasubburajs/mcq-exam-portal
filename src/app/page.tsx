"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ for redirect
import Link from "next/link";
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // ✅ Remember Me implementation
      const sessionStartTime = Date.now().toString();
      if (rememberMe) {
        localStorage.setItem("token", data.token); // persist
        localStorage.setItem("username", data.username); // persist username
        localStorage.setItem("role", data.role); // persist role
        localStorage.setItem("sessionStartTime", sessionStartTime); // persist session start time
      } else {
        sessionStorage.setItem("token", data.token); // session-only
        sessionStorage.setItem("username", data.username); // session-only username
        sessionStorage.setItem("role", data.role); // session-only role
        sessionStorage.setItem("sessionStartTime", sessionStartTime); // session-only session start time
      }

      // Redirect based on role
      if (data.role === "admin") {
        router.push("/admin-pages");
      } else if (data.role === "student") {
        router.push("/student-pages");
      } else {
        alert("Invalid user role. Please contact support.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Something went wrong. Try again.");
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
              required
              fullWidth
              id="email"
              label="Enter Email Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { fontWeight: 500 },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { fontWeight: 500 },
              }}
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                my: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              />
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
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
              }}
            >
              Login
            </Button>

            <Divider sx={{ my: 3 }}>Or login with</Divider>

            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}
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
    </Box>
  );
}
