"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as yup from "yup";
import { Snackbar, Alert } from "@mui/material";

/* ---- Validation for Personal Information -- */
const personalInformationSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .required("Email is required")
    .trim("Email should not contain spaces")
    .email("Enter a valid email address")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Enter a valid email with proper domain",
    ),
  birthDate: yup.string().required("Date of birth is required"),
  gender: yup.string().required("Gender is required"),
  school: yup.string().required("School / College name is required"),
  grade: yup.string().required("Grade / Department is required"),
});

/* ---- Validation Schema for Account Settings ---- */
const accountSettingsSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters"),

  currentPassword: yup.string().when("newPassword", {
    is: (val: string) => !!val,
    then: (schema) => schema.required("Current password is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  newPassword: yup
    .string()
    .nullable()
    .test(
      "password-rules",
      "Password must be at least 8 characters, include uppercase, lowercase, number and special character",
      (value) => {
        if (!value) return true; // no password change
        return (
          value.length >= 8 &&
          /[A-Z]/.test(value) &&
          /[a-z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(value)
        );
      },
    ),

  confirmPassword: yup.string().when("newPassword", {
    is: (val: string) => !!val,
    then: (schema) =>
      schema
        .required("Confirm password is required")
        .oneOf([yup.ref("newPassword")], "Passwords must match"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

/* ---- Tab Panel Component ---- */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

/* ----- Personal Information Tab Component ---- */
const PersonalInformationTab = ({
  personalInfo,
  setPersonalInfo,
  isMobile,
  fetchUserData,
  loading,
}: any) => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const validatePersonalField = async (
    field: string,
    value: any,
    updatedInfo: any,
  ) => {
    try {
      await personalInformationSchema.validateAt(field, updatedInfo);
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    } catch (err: any) {
      setErrors((prev: any) => ({ ...prev, [field]: err.message }));
    }
  };

  const handlePersonalInfoChange =
    async (field: string, value: string) =>
    {
      const updatedInfo = {
        ...personalInfo,
        [field]: value,
      };

      setPersonalInfo(updatedInfo);

      await validatePersonalField(field, value, updatedInfo);
    };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true); // ✅ disable button
    try {
      await personalInformationSchema.validate(personalInfo, {
        abortEarly: false,
      });
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(personalInfo),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Update failed");
      }

      await fetchUserData();

      setSnackbar({
        open: true,
        message: "Personal information updated successfully!",
        severity: "success",
      });
      setErrors({});
    } catch (err: any) {
      if (err.inner) {
        const formErrors: any = {};
        err.inner?.forEach((e: any) => (formErrors[e.path] = e.message));
        setErrors(formErrors);
      } else {
        setSnackbar({
          open: true,
          message: err.message || "Update failed",
          severity: "error",
        });
      }
    } finally {
      setLoadingSubmit(false); // ✅ re-enable button
    }
  };

  return (
    <>
      <Card
        sx={{
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          position: "relative",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              borderRadius: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              pb: 1,
              borderBottom: "2px solid #f0f0f0",
              color: "#2c3e50",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Personal Information
          </Typography>
          <Box component="form" onSubmit={handlePersonalInfoSubmit}>
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
                  value={personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={personalInfo.email}
              disabled
              onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              error={!!errors.email}
              helperText={errors.email}
            />

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
                  label="Date of Birth"
                  type="date"
                  value={personalInfo.birthDate}
                  onChange={(e) => handlePersonalInfoChange("birthDate", e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={personalInfo.gender}
                    onChange={(e) => handlePersonalInfoChange("gender", e.target.value)}
                    error={!!errors.gender}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {errors.gender && (
                    <Typography variant="caption" color="error">
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="School / College Name"
              value={personalInfo.school}
              onChange={(e) => handlePersonalInfoChange("school", e.target.value)}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              error={!!errors.school}
              helperText={errors.school}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                label="Grade / Department"
                value={personalInfo.grade}
                onChange={(e) => handlePersonalInfoChange("grade", e.target.value)}
                size={isMobile ? "small" : "medium"}
                error={!!errors.grade}
                helperText={errors.grade}
              />
              <TextField
                fullWidth
                label="Section (Optional)"
                value={personalInfo.section}
                onChange={(e) => handlePersonalInfoChange("section", e.target.value)}
                size={isMobile ? "small" : "medium"}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "linear-gradient(to right, #6a11cb, #2575fc)",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  px: { xs: 2, sm: 3 },
                }}
              >
                {loadingSubmit ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

/* ----- Account Settings Tab Component ---- */
const AccountSettingsTab = ({
  accountSettings,
  setAccountSettings,
  handleChange,
  isMobile,
  userData,
  fetchUserData,
  loading,
}: any) => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

    const validateAccountField = async (
    field: string,
    value: any,
    updatedSettings: any,
  ) => {
    try {
      await accountSettingsSchema.validateAt(field, updatedSettings);
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    } catch (err: any) {
      setErrors((prev: any) => ({ ...prev, [field]: err.message }));
    }
  };

  const handleAccountChange =
  (field: string) =>
  async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    const updatedSettings = {
      ...accountSettings,
      [field]: value,
    };

    setAccountSettings(updatedSettings);

    await validateAccountField(field, value, updatedSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true); // ✅ disable button

    try {
      await accountSettingsSchema.validate(accountSettings, {
        abortEarly: false,
      });
      setErrors({});

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      // Determine what to update
      const updateUsername = accountSettings.username !== userData.username;
      const updatePassword = !!accountSettings.newPassword;

      if (!updateUsername && !updatePassword) {
        setSnackbar({
          open: true,
          message: "No changes to update",
          severity: "info",
        });
        return;
      }

      let successMessages: string[] = [];
      let errorMessages: string[] = [];
      let usernameUpdated = false;
      let passwordUpdated = false;

      // 1️⃣ Try updating username independently
      if (accountSettings.username !== userData?.username) {
        try {
          const res = await fetch("/api/users/update-username", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: accountSettings.username }),
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Username update failed");
          usernameUpdated = true;
          successMessages.push("Username updated successfully!");
        } catch (err: any) {
          errorMessages.push(err.message);
        }
      }

      // 2️⃣ Try updating password independently
      if (accountSettings.newPassword) {
        try {
          const res = await fetch("/api/users/update-password", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword: accountSettings.currentPassword,
              newPassword: accountSettings.newPassword,
            }),
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Password update failed");
          passwordUpdated = true;
          successMessages.push("Password updated successfully!");
        } catch (err: any) {
          errorMessages.push(err.message);
        }
      }

      // 3️⃣ Show SUCCESS snackbar (even if errors exist)
      if (successMessages.length > 0) {
        setSnackbar({
          open: true,
          severity: "success",
          message: successMessages.join(" "),
        });
      }

      // Show ERROR snackbar (even if success exists)
      if (errorMessages.length > 0) {
        setTimeout(
          () => {
            setSnackbar({
              open: true,
              severity: "error",
              message: errorMessages.join(" "),
            });
          },
          successMessages.length > 0 ? 1200 : 0,
        );
      }

      // 4️⃣ Clear password fields if updated successfully
      if (passwordUpdated) {
        setAccountSettings((prev: any) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      // 5️⃣ Refresh user data
      await fetchUserData();
    } catch (err: any) {
      if (err.inner) {
        const formErrors: any = {};
        err.inner.forEach((e: any) => (formErrors[e.path] = e.message));
        setErrors(formErrors);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: err.message || "Update failed",
        });
      }
    } finally {
      setLoadingSubmit(false); // ✅ re-enable button
    }
  };

  return (
    <>
      <Card
        sx={{
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              borderRadius: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              pb: 1,
              borderBottom: "2px solid #f0f0f0",
              color: "#2c3e50",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Account Settings
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={accountSettings.username}
              onChange={handleChange("username")}
              disabled
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              error={!!errors.username}
              helperText={
                errors.username ||
                "This is how you'll appear to others on the platform"
              }
            />
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              value={accountSettings.currentPassword}
              onChange={handleAccountChange("currentPassword")}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showNew ? "text" : "password"}
              value={accountSettings.newPassword}
              onChange={handleAccountChange("newPassword")}
              sx={{ mb: 1 }}
              size={isMobile ? "small" : "medium"}
              error={!!errors.newPassword}
              helperText={
                errors.newPassword ||
                "Password must be at least 8 characters with letters and numbers"
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton onClick={() => setShowNew(!showNew)}>
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={accountSettings.confirmPassword}
              onChange={handleAccountChange("confirmPassword")}
              sx={{ mb: 3 }}
              size={isMobile ? "small" : "medium"}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "linear-gradient(to right, #6a11cb, #2575fc)",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  px: { xs: 2, sm: 3 },
                }}
              >
                {loadingSubmit ? "Updating..." : "Update Account"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

/* ----- Main Profile Page Component ---- */
const ProfilePage = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: "",
    school: "",
    grade: "",
    section: "",
  });

  const [accountSettings, setAccountSettings] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) return;

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Failed to fetch user data");
      const user = json.data;

      setUserData(user);

      setPersonalInfo({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        birthDate: user.student_details?.dob
          ? user.student_details.dob.split("T")[0]
          : "",
        gender: user.student_details?.gender || "",
        school: user.student_details?.school || "",
        grade: user.student_details?.grade || "",
        section: user.student_details?.section || "",
      });

      setAccountSettings((prev) => ({
        ...prev,
        username: user.username,
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePersonalInfoChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPersonalInfo({ ...personalInfo, [field]: event.target.value });
    };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setAccountSettings({ ...accountSettings, [field]: event.target.value });
    };

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(theme.breakpoints.down("md"));
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme.breakpoints]);

  if (!mounted) {
    return null; // Prevent hydration mismatch by not rendering until mounted
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        p: {
          xs: "60px 8px 16px",
          sm: "70px 16px 24px",
          md: "16px 24px 32px",
          lg: "24px 32px 40px",
        },
      }}
    >
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {["Personal Information", "Account Settings"].map((label, index) => (
            <Button
              key={label}
              variant={activeTab === index ? "contained" : "text"}
              onClick={() => setActiveTab(index)}
              sx={{
                bgcolor: activeTab === index ? "primary.main" : "transparent",
                color: activeTab === index ? "white" : "text.primary",
                borderRadius: "8px 8px 0 0",
                px: { xs: 2, sm: 3 },
                py: 1.5,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": {
                  bgcolor:
                    activeTab === index ? "primary.dark" : "action.hover",
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Personal Information */}
      <TabPanel value={activeTab} index={0}>
        <PersonalInformationTab
          personalInfo={personalInfo}
          handlePersonalInfoChange={handlePersonalInfoChange}
          isMobile={isMobile}
          setPersonalInfo={setPersonalInfo}
          fetchUserData={fetchUserData}
          loading={loading}
        />
      </TabPanel>

      {/* Account Settings */}
      <TabPanel value={activeTab} index={1}>
        <AccountSettingsTab
          accountSettings={accountSettings}
          setAccountSettings={setAccountSettings}
          userData={userData}
          fetchUserData={fetchUserData}
          handleChange={handleChange}
          isMobile={isMobile}
          loading={loading}
        />
      </TabPanel>
    </Box>
  );
};

export default ProfilePage;
