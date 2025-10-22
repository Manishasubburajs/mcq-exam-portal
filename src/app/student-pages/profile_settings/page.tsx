'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Camera,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

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

// Profile Header Component
const ProfileHeader: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
    <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '20px', sm: '24px' }, color: '#2c3e50', fontWeight: 600, textAlign: { xs: 'center', sm: 'left' } }}>
      My Profile & Settings
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar
        src="https://ui-avatars.com/api/?name=John+Doe&background=6a11cb&color=fff"
        alt="John Doe"
        sx={{ width: 40, height: 40, mr: 1, border: '2px solid #6a11cb' }}
      />
      <Typography sx={{ color: '#2c3e50', fontWeight: 500 }}>John Doe</Typography>
    </Box>
  </Box>
);

// Profile Stats Card Component
const ProfileStatsCard: React.FC = () => (
  <Card sx={{ mb: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
      <Box sx={{ position: 'relative', mr: { xs: 0, sm: 3 }, mb: { xs: 2, sm: 0 } }}>
        <Avatar
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
          sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, border: '5px solid #6a11cb' }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 5,
            right: 5,
            bgcolor: '#2575fc',
            color: 'white',
            width: 30,
            height: 30,
            '&:hover': { bgcolor: '#1a5fc8' },
          }}
          onClick={() => alert('Avatar edit functionality would open a file picker in a real application')}
        >
          <Camera sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
          John Doe
        </Typography>
        <Typography sx={{ color: '#7f8c8d', mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Student ID: S12345 • Class: 10th Grade • Section: A
        </Typography>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: { xs: 'center', sm: 'flex-start' },
          '& > *': {
            flex: { xs: '1 1 120px', sm: '1 1 150px' },
            minWidth: { xs: '100px', sm: '120px' }
          }
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a11cb', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              82%
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Average Score
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a11cb', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              15
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Exams Taken
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a11cb', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              #5
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Class Rank
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Personal Information Tab Component
const PersonalInformationTab: React.FC<{
  personalInfo: any;
  handlePersonalInfoChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isMobile: boolean;
}> = ({ personalInfo, handlePersonalInfoChange, isMobile }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Personal information updated successfully!');
  };

  return (
    <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Personal Information
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
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
                value={personalInfo.firstName}
                onChange={handlePersonalInfoChange('firstName')}
                required
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={personalInfo.lastName}
                onChange={handlePersonalInfoChange('lastName')}
                required
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          </Box>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={personalInfo.email}
            onChange={handlePersonalInfoChange('email')}
            sx={{ mb: 2 }}
            required
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={personalInfo.phone}
            onChange={handlePersonalInfoChange('phone')}
            sx={{ mb: 2 }}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={personalInfo.birthDate}
                onChange={handlePersonalInfoChange('birthDate')}
                required
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={personalInfo.gender}
                  onChange={(e) => handlePersonalInfoChange('gender')({ target: { value: e.target.value } } as any)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <TextField
            fullWidth
            label="Bio (Optional)"
            multiline
            rows={3}
            value={personalInfo.bio}
            onChange={handlePersonalInfoChange('bio')}
            placeholder="Tell us a bit about yourself..."
            sx={{ mb: 3 }}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)', fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 2, sm: 3 } }}>
              Save Changes
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Account Settings Tab Component
const AccountSettingsTab: React.FC<{
  accountSettings: any;
  handleAccountSettingsChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (show: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  isMobile: boolean;
}> = ({
  accountSettings,
  handleAccountSettingsChange,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isMobile
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (accountSettings.newPassword && accountSettings.newPassword !== accountSettings.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (accountSettings.newPassword && accountSettings.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    alert('Account settings updated successfully!');
  };

  return (
    <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Account Settings
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={accountSettings.username}
            onChange={handleAccountSettingsChange('username')}
            sx={{ mb: 2 }}
            helperText="This is how you'll appear to others on the platform"
            required
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            fullWidth
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            value={accountSettings.currentPassword}
            onChange={handleAccountSettingsChange('currentPassword')}
            sx={{ mb: 2 }}
            size={isMobile ? 'small' : 'medium'}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={accountSettings.newPassword}
            onChange={handleAccountSettingsChange('newPassword')}
            sx={{ mb: 1 }}
            size={isMobile ? 'small' : 'medium'}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }
            }}
          />
          <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Password must be at least 8 characters with letters and numbers
          </Typography>
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={accountSettings.confirmPassword}
            onChange={handleAccountSettingsChange('confirmPassword')}
            sx={{ mb: 3 }}
            size={isMobile ? 'small' : 'medium'}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)', fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 2, sm: 3 } }}>
              Update Account
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Privacy & Security Tab Component
const PrivacySecurityTab: React.FC<{
  privacySettings: any;
  handlePrivacyChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  setDeleteModalOpen: (open: boolean) => void;
  isMobile: boolean;
}> = ({ privacySettings, handlePrivacyChange, setDeleteModalOpen, isMobile }) => (
  <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        Privacy & Security
      </Typography>
      <Typography variant="h6" sx={{ mb: 1, color: '#34495e', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Profile Visibility
      </Typography>
      <RadioGroup
        value={privacySettings.visibility}
        onChange={(e) => handlePrivacyChange('visibility')({ target: { value: e.target.value } } as any)}
        sx={{ mb: 3 }}
      >
        <FormControlLabel value="public" control={<Radio size={isMobile ? 'small' : 'medium'} />} label="Public - Anyone can see my profile" />
        <FormControlLabel value="classmates" control={<Radio size={isMobile ? 'small' : 'medium'} />} label="Classmates Only - Only students in my classes can see my profile" />
        <FormControlLabel value="private" control={<Radio size={isMobile ? 'small' : 'medium'} />} label="Private - Only I can see my profile" />
      </RadioGroup>
      <Typography variant="h6" sx={{ mb: 1, color: '#34495e', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Data Sharing
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={privacySettings.sharePerformance} onChange={handlePrivacyChange('sharePerformance')} size={isMobile ? 'small' : 'medium'} />}
        label="Allow my performance data to be used for class statistics (anonymously)"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={privacySettings.shareResearch} onChange={handlePrivacyChange('shareResearch')} size={isMobile ? 'small' : 'medium'} />}
        label="Participate in educational research studies (anonymously)"
        sx={{ mb: 3, display: 'block' }}
      />
      <Typography variant="h6" sx={{ mb: 1, color: '#34495e', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Security
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={privacySettings.twoFactor} onChange={handlePrivacyChange('twoFactor')} size={isMobile ? 'small' : 'medium'} />}
        label="Enable two-factor authentication for added security"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={privacySettings.loginAlerts} onChange={handlePrivacyChange('loginAlerts')} size={isMobile ? 'small' : 'medium'} />}
        label="Send email alerts for new logins from unrecognized devices"
        sx={{ mb: 3, display: 'block' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)', fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 2, sm: 3 } }}>
          Save Privacy Settings
        </Button>
      </Box>
      <Box sx={{ border: '2px solid #f8d7da', bgcolor: '#f8d7da', borderRadius: 2, p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="h6" sx={{ color: '#721c24', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Danger Zone
        </Typography>
        <Typography sx={{ color: '#721c24', mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Deleting your account is permanent and cannot be undone. All your data will be erased.
        </Typography>
        <Button variant="contained" color="error" onClick={() => setDeleteModalOpen(true)} size={isMobile ? 'small' : 'medium'}>
          Delete My Account
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// Notifications Tab Component
const NotificationsTab: React.FC<{
  notificationSettings: any;
  handleNotificationChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile: boolean;
}> = ({ notificationSettings, handleNotificationChange, isMobile }) => (
  <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        Notification Preferences
      </Typography>
      <Typography variant="h6" sx={{ mb: 1, color: '#34495e', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Email Notifications
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.emailExam} onChange={handleNotificationChange('emailExam')} size={isMobile ? 'small' : 'medium'} />}
        label="New exam announcements"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.emailResults} onChange={handleNotificationChange('emailResults')} size={isMobile ? 'small' : 'medium'} />}
        label="Exam results available"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.emailReminders} onChange={handleNotificationChange('emailReminders')} size={isMobile ? 'small' : 'medium'} />}
        label="Exam deadline reminders"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.emailNewsletter} onChange={handleNotificationChange('emailNewsletter')} size={isMobile ? 'small' : 'medium'} />}
        label="Monthly learning tips newsletter"
        sx={{ mb: 3, display: 'block' }}
      />
      <Typography variant="h6" sx={{ mb: 1, color: '#34495e', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        In-App Notifications
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.appExam} onChange={handleNotificationChange('appExam')} size={isMobile ? 'small' : 'medium'} />}
        label="New exam announcements"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.appResults} onChange={handleNotificationChange('appResults')} size={isMobile ? 'small' : 'medium'} />}
        label="Exam results available"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.appAchievements} onChange={handleNotificationChange('appAchievements')} size={isMobile ? 'small' : 'medium'} />}
        label="Achievements and badges"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.appUpdates} onChange={handleNotificationChange('appUpdates')} size={isMobile ? 'small' : 'medium'} />}
        label="System updates and maintenance"
        sx={{ mb: 3, display: 'block' }}
      />
      <Typography variant="h6" sx={{ mb: 1, color: '#34495e', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Push Notifications
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.pushExam} onChange={handleNotificationChange('pushExam')} size={isMobile ? 'small' : 'medium'} />}
        label="Exam reminders (1 hour before)"
        sx={{ mb: 1, display: 'block' }}
      />
      <FormControlLabel
        control={<Checkbox checked={notificationSettings.pushResults} onChange={handleNotificationChange('pushResults')} size={isMobile ? 'small' : 'medium'} />}
        label="Immediate results notification"
        sx={{ mb: 3, display: 'block' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)', fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 2, sm: 3 } }}>
          Save Notification Settings
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// Delete Account Modal Component
const DeleteAccountModal: React.FC<{
  open: boolean;
  onClose: () => void;
  confirmText: string;
  setConfirmText: (text: string) => void;
  onConfirm: () => void;
  isMobile: boolean;
}> = ({ open, onClose, confirmText, setConfirmText, onConfirm, isMobile }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: '#2c3e50', fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Delete Account</DialogTitle>
    <DialogContent>
      <Typography sx={{ mb: 2, color: '#7f8c8d', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including exam results and progress, will be permanently erased.
      </Typography>
      <TextField
        fullWidth
        label='Type "DELETE" to confirm'
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE"
        variant="outlined"
        size={isMobile ? 'small' : 'medium'}
      />
    </DialogContent>
    <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
      <Button
        onClick={onClose}
        variant="outlined"
        sx={{ mr: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}
        size={isMobile ? 'small' : 'medium'}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={confirmText !== 'DELETE'}
        size={isMobile ? 'small' : 'medium'}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        Delete My Account
      </Button>
    </DialogActions>
  </Dialog>
);

const ProfilePage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@school.edu',
    phone: '+1 (555) 123-4567',
    birthDate: '2006-05-15',
    gender: 'male',
    bio: "I'm a 10th grade student passionate about mathematics and science. I enjoy solving complex problems and participating in science fairs.",
  });

  const [accountSettings, setAccountSettings] = useState({
    username: 'student2023', // Sample username for demo purposes
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    visibility: 'public',
    sharePerformance: true,
    shareResearch: true,
    twoFactor: true,
    loginAlerts: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailExam: true,
    emailResults: true,
    emailReminders: false,
    emailNewsletter: true,
    appExam: true,
    appResults: true,
    appAchievements: true,
    appUpdates: false,
    pushExam: true,
    pushResults: false,
  });


  const handlePersonalInfoChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [field]: event.target.value });
  };

  const handleAccountSettingsChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountSettings({ ...accountSettings, [field]: event.target.value });
  };

  const handlePrivacyChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setPrivacySettings({ ...privacySettings, [field]: value });
  };

  const handleNotificationChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({ ...notificationSettings, [field]: event.target.checked });
  };


  const handleDeleteAccount = () => {
    if (confirmDeleteText === 'DELETE') {
      alert('Account deletion requested. A confirmation email has been sent to your email address.');
      setDeleteModalOpen(false);
      setConfirmDeleteText('');
    }
  };


  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = globalThis.matchMedia(theme.breakpoints.down('md'));
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.breakpoints]);

  if (!mounted) {
    return null; // Prevent hydration mismatch by not rendering until mounted
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa', p: { xs: 1, sm: 2, md: 3 } }}>
      <ProfileHeader isMobile={isMobile} />
      <ProfileStatsCard />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            {[
              'Personal Information',
              'Account Settings',
              'Privacy & Security',
              'Notifications'
            ].map((label, index) => (
              <Button
                key={label}
                variant={activeTab === index ? 'contained' : 'text'}
                onClick={() => setActiveTab(index)}
                sx={{
                  bgcolor: activeTab === index ? 'primary.main' : 'transparent',
                  color: activeTab === index ? 'white' : 'text.primary',
                  borderRadius: '8px 8px 0 0',
                  px: { xs: 2, sm: 3 },
                  py: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': {
                    bgcolor: activeTab === index ? 'primary.dark' : 'action.hover',
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
          />
        </TabPanel>

        {/* Account Settings */}
        <TabPanel value={activeTab} index={1}>
          <AccountSettingsTab
            accountSettings={accountSettings}
            handleAccountSettingsChange={handleAccountSettingsChange}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isMobile={isMobile}
          />
        </TabPanel>

        {/* Privacy & Security */}
        <TabPanel value={activeTab} index={2}>
          <PrivacySecurityTab
            privacySettings={privacySettings}
            handlePrivacyChange={handlePrivacyChange}
            setDeleteModalOpen={setDeleteModalOpen}
            isMobile={isMobile}
          />
        </TabPanel>

        {/* Notifications */}
        <TabPanel value={activeTab} index={3}>
          <NotificationsTab
            notificationSettings={notificationSettings}
            handleNotificationChange={handleNotificationChange}
            isMobile={isMobile}
          />
        </TabPanel>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        confirmText={confirmDeleteText}
        setConfirmText={setConfirmDeleteText}
        onConfirm={handleDeleteAccount}
        isMobile={isMobile}
      />
    </Box>
  );
};

export default ProfilePage;