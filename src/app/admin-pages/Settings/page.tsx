"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
} from '@mui/material';
import { Save, RestoreSharp } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

const Header = dynamic(() => import('../../components/Header'), { ssr: false });

export default function SettingsPage() {
  const isDesktop = useMediaQuery('(min-width:769px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  // General Settings
  const [siteName, setSiteName] = useState('MCQ Exam Portal');
  const [siteDescription, setSiteDescription] = useState('A comprehensive platform for managing multiple choice examinations');
  const [contactEmail, setContactEmail] = useState('admin@mcqportal.com');
  const [contactPhone, setContactPhone] = useState('+1 (555) 123-4567');

  // User Management Settings
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [passwordRequireSpecial, setPasswordRequireSpecial] = useState(true);
  const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(true);
  const [autoApproveRegistrations, setAutoApproveRegistrations] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);

  // Exam Settings
  const [defaultExamDuration, setDefaultExamDuration] = useState(60);
  const [autoSubmitOnTimeout, setAutoSubmitOnTimeout] = useState(true);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [allowReviewAfterSubmit, setAllowReviewAfterSubmit] = useState(true);
  const [randomizeQuestionOrder, setRandomizeQuestionOrder] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState(15);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [logRetention, setLogRetention] = useState(90);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const handleSaveSettings = () => {
    // In a real application, this would save to backend
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    // Reset to defaults
    alert('Settings reset to defaults');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && !isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} sx={{
        ml: sidebarOpen && isDesktop ? '220px' : 0,
        transition: 'margin-left 0.3s ease',
        paddingTop: { xs: '50px', md: '80px' },
        padding: { xs: 2, md: 3 }
      }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="System Settings" sidebarOpen={sidebarOpen} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RestoreSharp />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            sx={{
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              '&:hover': { opacity: 0.9 }
            }}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {/* General Settings */}
          <Card elevation={1} sx={{ borderRadius: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                General Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Site Name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Site Description"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
                <TextField
                  label="Contact Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          {/* User Management Settings */}
          <Card elevation={1} sx={{ borderRadius: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                User Management
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Minimum Password Length"
                  type="number"
                  value={passwordMinLength}
                  onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { min: 6, max: 20 }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={passwordRequireSpecial}
                      onChange={(e) => setPasswordRequireSpecial(e.target.checked)}
                    />
                  }
                  label="Require special characters in passwords"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={passwordRequireNumbers}
                      onChange={(e) => setPasswordRequireNumbers(e.target.checked)}
                    />
                  }
                  label="Require numbers in passwords"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoApproveRegistrations}
                      onChange={(e) => setAutoApproveRegistrations(e.target.checked)}
                    />
                  }
                  label="Auto-approve user registrations"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailVerificationRequired}
                      onChange={(e) => setEmailVerificationRequired(e.target.checked)}
                    />
                  }
                  label="Require email verification"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Exam Settings */}
          <Card elevation={1} sx={{ borderRadius: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                Exam Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Default Exam Duration (minutes)"
                  type="number"
                  value={defaultExamDuration}
                  onChange={(e) => setDefaultExamDuration(Number(e.target.value))}
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { min: 5, max: 300 }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSubmitOnTimeout}
                      onChange={(e) => setAutoSubmitOnTimeout(e.target.checked)}
                    />
                  }
                  label="Auto-submit on timeout"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showResultsImmediately}
                      onChange={(e) => setShowResultsImmediately(e.target.checked)}
                    />
                  }
                  label="Show results immediately after exam"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowReviewAfterSubmit}
                      onChange={(e) => setAllowReviewAfterSubmit(e.target.checked)}
                    />
                  }
                  label="Allow review after submission"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={randomizeQuestionOrder}
                      onChange={(e) => setRandomizeQuestionOrder(e.target.checked)}
                    />
                  }
                  label="Randomize question order"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card elevation={1} sx={{ borderRadius: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                Notifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Enable email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={examReminders}
                      onChange={(e) => setExamReminders(e.target.checked)}
                    />
                  }
                  label="Send exam reminders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={resultNotifications}
                      onChange={(e) => setResultNotifications(e.target.checked)}
                    />
                  }
                  label="Send result notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemAlerts}
                      onChange={(e) => setSystemAlerts(e.target.checked)}
                    />
                  }
                  label="Send system alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={weeklyReports}
                      onChange={(e) => setWeeklyReports(e.target.checked)}
                    />
                  }
                  label="Send weekly summary reports"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card elevation={1} sx={{ borderRadius: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { min: 5, max: 480 }
                  }}
                />
                <TextField
                  label="Max Login Attempts"
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { min: 3, max: 10 }
                  }}
                />
                <TextField
                  label="Lockout Duration (minutes)"
                  type="number"
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(Number(e.target.value))}
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { min: 5, max: 1440 }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                  }
                  label="Enable two-factor authentication"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={ipWhitelist}
                      onChange={(e) => setIpWhitelist(e.target.checked)}
                    />
                  }
                  label="Enable IP whitelist"
                />
              </Box>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card elevation={1} sx={{ borderRadius: '10px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                System Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                    />
                  }
                  label="Enable maintenance mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoBackup}
                      onChange={(e) => setAutoBackup(e.target.checked)}
                    />
                  }
                  label="Enable automatic backups"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={backupFrequency}
                    label="Backup Frequency"
                    onChange={(e) => setBackupFrequency(e.target.value)}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Log Retention (days)"
                  type="number"
                  value={logRetention}
                  onChange={(e) => setLogRetention(Number(e.target.value))}
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { min: 7, max: 365 }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={debugMode}
                      onChange={(e) => setDebugMode(e.target.checked)}
                    />
                  }
                  label="Enable debug mode"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}