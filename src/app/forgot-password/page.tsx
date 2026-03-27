// "use client";

// import { useState } from "react";
// import {
//   Box,
//   Card,
//   TextField,
//   Button,
//   Typography,
//   CircularProgress,
//   Alert,
//   // Divider,
//   // useMediaQuery,
// } from "@mui/material";
// // import SchoolIcon from "@mui/icons-material/School"; // Logo icon
// import { useRouter } from "next/navigation";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   // const [success, setSuccess] = useState(false);
//   // const [error, setError] = useState(false);
//   // const isMobile = useMediaQuery("(max-width:768px)");
//   const [step, setStep] = useState(1);
//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   // const handleSubmit = (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setError(false);

//   //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   //   if (!emailRegex.test(email)) {
//   //     setError(true);
//   //     return;
//   //   }

//   //   // Simulate API call
//   //   setTimeout(() => {
//   //     setSuccess(true);
//   //   }, 1000);
//   // };

//   // SEND OTP
//   const sendOtp = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch("/api/auth/send-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error);
//         setLoading(false);
//         return;
//       }

//       setStep(2);
//     } catch (err) {
//       setError("Something went wrong");
//     }

//     setLoading(false);
//   };

//   // VERIFY OTP
//   const verifyOtp = async () => {
//     setLoading(true);
//     setError("");

//     const enteredOtp = otp.join("");

//     try {
//       const res = await fetch("/api/auth/verify-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, otp: enteredOtp }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error);
//         setLoading(false);
//         return;
//       }

//       router.push(`/reset-password?email=${email}`);
//     } catch {
//       setError("Something went wrong");
//     }

//     setLoading(false);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "linear-gradient(to right, #667eea, #764ba2)",
//       }}
//     >
//       <Card
//         sx={{
//           p: 4,
//           width: 400,
//           borderRadius: 3,
//           boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
//         }}
//       >
//         <Typography
//           variant="h5"
//           textAlign="center"
//           fontWeight="bold"
//           mb={2}
//         >
//           {step === 1 ? "Forgot Password" : "Verify OTP"}
//         </Typography>

//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {/* STEP 1 */}
//         {step === 1 && (
//           <>
//             <TextField
//               fullWidth
//               label="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               sx={{ mb: 2 }}
//             />

//             <Button
//               fullWidth
//               variant="contained"
//               onClick={sendOtp}
//               disabled={loading}
//               sx={{
//                 py: 1.5,
//                 fontWeight: "bold",
//                 background: "linear-gradient(to right, #6a11cb, #2575fc)",
//               }}
//             >
//               {loading ? <CircularProgress size={24} /> : "Send OTP"}
//             </Button>
//           </>
//         )}

//         {/* STEP 2 */}
//         {step === 2 && (
//           <>
//             <Typography textAlign="center" mb={2}>
//               Enter OTP sent to <b>{email}</b>
//             </Typography>

//             <Box display="flex" justifyContent="space-between" mb={2}>
//               {otp.map((digit, i) => (
//                 <TextField
//                   key={i}
//                   value={digit}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/[^0-9]/g, "");
//                     const newOtp = [...otp];
//                     newOtp[i] = value;
//                     setOtp(newOtp);
//                   }}
//                   inputProps={{
//                     maxLength: 1,
//                     style: { textAlign: "center", fontSize: "20px" },
//                   }}
//                   sx={{
//                     width: 60,
//                   }}
//                 />
//               ))}
//             </Box>

//             <Button
//               fullWidth
//               variant="contained"
//               onClick={verifyOtp}
//               disabled={loading}
//               sx={{
//                 py: 1.5,
//                 fontWeight: "bold",
//                 background: "linear-gradient(to right, #43cea2, #185a9d)",
//               }}
//             >
//               {loading ? <CircularProgress size={24} /> : "Verify OTP"}
//             </Button>
//           </>
//         )}
//       </Card>
//     </Box>
//   );
// }
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // ========================
  // AUTO FOCUS FIRST BOX
  // ========================
  useEffect(() => {
    if (step === 2) {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  // useEffect(() => {
  //   if (error) {
  //     const t = setTimeout(() => setError(""), 2000);
  //     return () => clearTimeout(t);
  //   }
  // }, [error]);

  // ========================
  // SEND OTP
  // ========================
  const sendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep(2);
      setTimer(300); // ✅ 5 minutes

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

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      setError("Enter complete OTP");
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
        setOtp(["", "", "", ""]);
        // inputsRef.current[0]?.focus();
        requestAnimationFrame(() => {
          inputsRef.current[0]?.focus();
        });
        return;
      }

      router.push(`/forgot-password/resetpassword?email=${email}`);
    } catch(err:any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Something went wrong");
      }
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #eef2ff, #f8fafc)",
      }}
    >
      <Card
        sx={{
          p: 4,
          width: 420,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h5"
          textAlign="center"
          fontWeight="bold"
          mb={2}
        >
          {step === 1 ? "Forgot Password" : "Verify OTP"}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Typography textAlign="center" mb={2}>
              Enter your registered email
            </Typography>

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
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
              color={timer === 0 ? "error.main" : "success.main"}
            >
              {timer > 0
                ? `Expires in 00:${timer.toString().padStart(2, "0")}`
                : "OTP expired"}
            </Typography>

            <Box
              display="flex"
              justifyContent="center"
              gap={2}
              mb={2}
            >
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
                  sx={{ width: 60 }}
                />
              ))}
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={verifyOtp}
              disabled={loading || otp.includes("") || timer === 0}
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
    </Box>
  );
}
//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         p: 2,
//       }}
//     >
//       <Card
//         sx={{
//           width: isMobile ? "100%" : 450,
//           borderRadius: 3,
//           p: 4,
//           boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
//         }}
//       >
//         {/* Logo */}
//         <Box sx={{ textAlign: "center", mb: 2 }}>
//           <SchoolIcon sx={{ fontSize: 50, color: "#2575fc", mb: 1 }} />
//           <Typography variant="h4" sx={{ fontWeight: 700, color: "#2575fc" }}>
//             MCQ Exam Portal
//           </Typography>
//         </Box>

//         {/* Description */}
//         <Typography sx={{ textAlign: "center", color: "#555", mb: 3 }}>
//           Enter your email to reset your password
//         </Typography>

//         {/* Form */}
//         {success ? (
//           <Box
//             sx={{
//               p: 2,
//               border: "1px solid #4caf50",
//               borderRadius: 2,
//               backgroundColor: "#e8f5e9",
//               textAlign: "center",
//               mb: 2,
//             }}
//           >
//             <Typography sx={{ color: "#2e7d32", fontWeight: 600, mb: 1 }}>
//               Reset Link Sent!
//             </Typography>
//             <Typography sx={{ color: "#388e3c" }}>
//               We sent a password reset link to <strong>{email}</strong>. Check
//               your inbox.
//             </Typography>
//           </Box>
//         ) : (
//           <Box component="form" onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               type="email"
//               label="Email Address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               margin="normal"
//               required
//               error={error}
//               helperText={error ? "Please enter a valid email address" : ""}
//               sx={{
//                 "& .MuiOutlinedInput-root": { borderRadius: 2 },
//                 "& .MuiInputLabel-root": { fontWeight: 500 },
//               }}
//             />

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{
//                 mt: 2,
//                 py: 1.5,
//                 fontWeight: 600,
//                 background: "linear-gradient(to right, #6a11cb, #2575fc)",
//                 "&:hover": {
//                   background: "linear-gradient(to right, #5a0fb5, #1d5edb)",
//                 },
//               }}
//             >
//               Send Reset Link
//             </Button>
//           </Box>
//         )}

//         {/* Security Notice */}
//         <Box
//           sx={{
//             backgroundColor: "#f8f9fa",
//             borderLeft: "4px solid #2575fc",
//             borderRadius: 2,
//             p: 2,
//             mt: 3,
//           }}
//         >
//           <Typography
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               color: "#2575fc",
//               fontWeight: 600,
//               mb: 1,
//             }}
//           >
//             <SchoolIcon /> Security Notice
//           </Typography>
//           <Typography sx={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
//             For security reasons, the password reset link will expire in 30
//             minutes. If you don't receive the email, please check your spam
//             folder or contact support.
//           </Typography>
//         </Box>

//         <Divider sx={{ my: 3 }} />

//         {/* Back to login */}
//         <Box sx={{ textAlign: "center" }}>
//           <Typography>
//             Remember your password?{" "}
//             <Button
//               href="/"
//               sx={{
//                 color: "#2575fc",
//                 textTransform: "none",
//                 fontWeight: 600,
//                 padding: 0,
//                 minWidth: 0,
//               }}
//             >
//               Back to Login
//             </Button>
//           </Typography>
//         </Box>
//       </Card>
//     </Box>
//   );
// }
