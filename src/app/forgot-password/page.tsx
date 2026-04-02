"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  useMediaQuery,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

// Yup Validation Schema
const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .trim()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Enter a valid email address",
    ),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [emailError, setEmailError] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:768px)");

  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ========================
  // AUTO FOCUS FIRST BOX
  // ========================
  useEffect(() => {
    if (step === 2) {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  // ========================
  // SEND OTP
  // ========================
  const sendOtp = async () => {
    setError("");
    setOpenSnackbar(false);

    try {
      await forgotPasswordSchema.validate({ email });
      setEmailError("");
    } catch (validationError: any) {
      setEmailError(validationError.message);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setOpenSnackbar(true);
        return;
      }

      setStep(2);
      setTimer(120); // ✅ 5 minutes

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Something went wrong");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // VERIFY OTP
  // ========================
  const verifyOtp = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    setOpenSnackbar(false);

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      setError("Enter complete OTP");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
        signal: controller.signal,
      });

      let data: any = {};
      try {
        data = await res.json(); // ✅ safe parse
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        setOpenSnackbar(true);
        setOtp(["", "", "", ""]);
        // inputsRef.current[0]?.focus();
        requestAnimationFrame(() => {
          inputsRef.current[0]?.focus();
        });
        return;
      }

      router.push(`/forgot-password/resetpassword?email=${email}`);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Something went wrong");
      }
      setOpenSnackbar(true);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  // ========================
  // OTP CHANGE
  // ========================
  const handleOtpChange = (value: string, index: number) => {
    if (error) setError("");
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ========================
  // BACKSPACE SUPPORT
  // ========================
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ========================
  // PASTE SUPPORT
  // ========================
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pasted.length === 4) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      inputsRef.current[3]?.focus();
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          background: "linear-gradient(to right, #eef2ff, #f8fafc)",
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
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#2575fc" }}>
              {step === 1 ? "Forgot Password" : "Verify OTP"}
            </Typography>
          </Box>
          {/* {error && <Alert severity="error">{error}</Alert>} */}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <>
                <Typography sx={{ textAlign: "center", color: "#555", mb: 3 }}>
                  Enter your registered email
                </Typography>

                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setEmail(value);
                    try {
                      await forgotPasswordSchema.validate({ email: value });
                      setEmailError("");
                    } catch (err: any) {
                      setEmailError(err.message);
                    }
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={sendOtp}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Send OTP"}
                </Button>
              </>

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
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Typography textAlign="center" mb={1}>
                OTP sent to <b>{email}</b>
              </Typography>

              <Typography
                textAlign="center"
                mb={2}
                color={
                  timer === 0
                    ? "error.main"
                    : timer < 30
                      ? "warning.main"
                      : "success.main"
                }
              >
                {timer > 0 ? `Expires in ${formatTime(timer)}` : "OTP expired"}
              </Typography>

              <Box display="flex" justifyContent="center" gap={2} mb={2}>
                {otp.map((digit, i) => (
                  <TextField
                    key={i}
                    value={digit}
                    inputRef={(el) => (inputsRef.current[i] = el)}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    error={!!error}
                    helperText=""
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: "center",
                        fontSize: "22px",
                        fontWeight: "bold",
                      },
                    }}
                    sx={{ width: 60, mb: 2 }}
                  />
                ))}
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={verifyOtp}
                disabled={loading || otp.includes("") || timer === 0}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Verify OTP"}
              </Button>

              {timer === 0 && (
                <Button fullWidth onClick={sendOtp} sx={{ mt: 1 }}>
                  Resend OTP
                </Button>
              )}
            </>
          )}
        </Card>

        <Snackbar
          open={openSnackbar && !!error}
          autoHideDuration={3000}
          onClose={() => {
            setOpenSnackbar(false);
            setError("");
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            variant="filled"
            severity="error"
            onClose={() => {
              setOpenSnackbar(false);
              setError("");
            }}
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
