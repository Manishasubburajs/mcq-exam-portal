'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Button,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  Home,
  MenuBook as BookOpen,
  TrendingUp as ChartLine,
  History,
  Person as User,
  Settings,
  Logout,
  Camera,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const ProfilePage: React.FC = () => {
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
    username: 'johndoe2023',
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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

  const handlePersonalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Personal information updated successfully!');
  };

  const handleAccountSubmit = (event: React.FormEvent) => {
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

  const handleAvatarEdit = () => {
    alert('Avatar edit functionality would open a file picker in a real application');
  };

  const handleDeleteAccount = () => {
    if (confirmDeleteText === 'DELETE') {
      alert('Account deletion requested. A confirmation email has been sent to your email address.');
      setDeleteModalOpen(false);
      setConfirmDeleteText('');
    }
  };

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <div className={styles.container} style={{ backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>MCQ <span>Portal</span></h1>
        </div>
        <ul className={styles.menu}>
          {[
            { icon: 'home', text: 'Dashboard' },
            { icon: 'book-open', text: 'Take Exam' },
            { icon: 'chart-line', text: 'Results' },
            { icon: 'history', text: 'Exam History' },
            { icon: 'user', text: 'My Profile', active: true },
            { icon: 'cog', text: 'Settings' },
            { icon: 'sign-out-alt', text: 'Logout' },
          ].map((item, index) => (
            <li key={index} className={item.active ? styles.active : ''}>
              <a href="#" className={`${styles['menu-link']} ${item.active ? styles.active : ''}`}>
                <i className={`fas fa-${item.icon}`}></i> {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className={styles['main-content']}>
        <div className={styles.header}>
          <h2>My Profile & Settings</h2>
          <div className={styles['user-info']}>
            <img src="https://ui-avatars.com/api/?name=John+Doe&background=6a11cb&color=fff" alt="John Doe" />
            <span>John Doe</span>
          </div>
        </div>

        {/* Profile Header */}
        <Card sx={{ mb: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
            <Box sx={{ position: 'relative', mr: 3 }}>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                sx={{ width: 120, height: 120, border: '5px solid #6a11cb' }}
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
                onClick={handleAvatarEdit}
              >
                <Camera sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}>
                John Doe
              </Typography>
              <Typography sx={{ color: '#7f8c8d', mb: 2 }}>
                Student ID: S12345 • Class: 10th Grade • Section: A
              </Typography>
              <Grid container spacing={3}>
                <Grid item>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a11cb' }}>
                      82%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Average Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a11cb' }}>
                      15
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Exams Taken
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6a11cb' }}>
                      #5
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Class Rank
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${activeTab === 0 ? styles.active : ''}`} onClick={() => setActiveTab(0)}>Personal Information</div>
          <div className={`${styles.tab} ${activeTab === 1 ? styles.active : ''}`} onClick={() => setActiveTab(1)}>Account Settings</div>
          <div className={`${styles.tab} ${activeTab === 2 ? styles.active : ''}`} onClick={() => setActiveTab(2)}>Privacy & Security</div>
          <div className={`${styles.tab} ${activeTab === 3 ? styles.active : ''}`} onClick={() => setActiveTab(3)}>Notifications</div>
        </div>

        {/* Personal Information */}
        <TabPanel value={activeTab} index={0}>
          <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50' }}>
                Personal Information
              </Typography>
              <Box component="form" onSubmit={handlePersonalSubmit}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={personalInfo.firstName}
                      onChange={handlePersonalInfoChange('firstName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={personalInfo.lastName}
                      onChange={handlePersonalInfoChange('lastName')}
                      required
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange('email')}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange('phone')}
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={personalInfo.birthDate}
                      onChange={handlePersonalInfoChange('birthDate')}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={personalInfo.gender}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                        <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Bio (Optional)"
                  multiline
                  rows={3}
                  value={personalInfo.bio}
                  onChange={handlePersonalInfoChange('bio')}
                  placeholder="Tell us a bit about yourself..."
                  sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)' }}>
                    Save Changes
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Account Settings */}
        <TabPanel value={activeTab} index={1}>
          <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50' }}>
                Account Settings
              </Typography>
              <Box component="form" onSubmit={handleAccountSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  value={accountSettings.username}
                  onChange={handleAccountSettingsChange('username')}
                  sx={{ mb: 2 }}
                  helperText="This is how you'll appear to others on the platform"
                  required
                />
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={accountSettings.currentPassword}
                  onChange={handleAccountSettingsChange('currentPassword')}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={accountSettings.newPassword}
                  onChange={handleAccountSettingsChange('newPassword')}
                  sx={{ mb: 1 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 2 }}>
                  Password must be at least 8 characters with letters and numbers
                </Typography>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={accountSettings.confirmPassword}
                  onChange={handleAccountSettingsChange('confirmPassword')}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)' }}>
                    Update Account
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Privacy & Security */}
        <TabPanel value={activeTab} index={2}>
          <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50' }}>
                Privacy & Security
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: '#34495e' }}>
                Profile Visibility
              </Typography>
              <RadioGroup
                value={privacySettings.visibility}
                onChange={(e) => setPrivacySettings({ ...privacySettings, visibility: e.target.value })}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="public" control={<Radio />} label="Public - Anyone can see my profile" />
                <FormControlLabel value="classmates" control={<Radio />} label="Classmates Only - Only students in my classes can see my profile" />
                <FormControlLabel value="private" control={<Radio />} label="Private - Only I can see my profile" />
              </RadioGroup>
              <Typography variant="h6" sx={{ mb: 1, color: '#34495e' }}>
                Data Sharing
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={privacySettings.sharePerformance} onChange={handlePrivacyChange('sharePerformance')} />}
                label="Allow my performance data to be used for class statistics (anonymously)"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={privacySettings.shareResearch} onChange={handlePrivacyChange('shareResearch')} />}
                label="Participate in educational research studies (anonymously)"
                sx={{ mb: 3, display: 'block' }}
              />
              <Typography variant="h6" sx={{ mb: 1, color: '#34495e' }}>
                Security
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={privacySettings.twoFactor} onChange={handlePrivacyChange('twoFactor')} />}
                label="Enable two-factor authentication for added security"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={privacySettings.loginAlerts} onChange={handlePrivacyChange('loginAlerts')} />}
                label="Send email alerts for new logins from unrecognized devices"
                sx={{ mb: 3, display: 'block' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)' }}>
                  Save Privacy Settings
                </Button>
              </Box>
              <Box sx={{ border: '2px solid #f8d7da', bgcolor: '#f8d7da', borderRadius: 2, p: 2 }}>
                <Typography variant="h6" sx={{ color: '#721c24', mb: 1 }}>
                  Danger Zone
                </Typography>
                <Typography sx={{ color: '#721c24', mb: 2 }}>
                  Deleting your account is permanent and cannot be undone. All your data will be erased.
                </Typography>
                <Button variant="contained" color="error" onClick={() => setDeleteModalOpen(true)}>
                  Delete My Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Notifications */}
        <TabPanel value={activeTab} index={3}>
          <Card sx={{ boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: '2px solid #f0f0f0', color: '#2c3e50' }}>
                Notification Preferences
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: '#34495e' }}>
                Email Notifications
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.emailExam} onChange={handleNotificationChange('emailExam')} />}
                label="New exam announcements"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.emailResults} onChange={handleNotificationChange('emailResults')} />}
                label="Exam results available"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.emailReminders} onChange={handleNotificationChange('emailReminders')} />}
                label="Exam deadline reminders"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.emailNewsletter} onChange={handleNotificationChange('emailNewsletter')} />}
                label="Monthly learning tips newsletter"
                sx={{ mb: 3, display: 'block' }}
              />
              <Typography variant="h6" sx={{ mb: 1, color: '#34495e' }}>
                In-App Notifications
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.appExam} onChange={handleNotificationChange('appExam')} />}
                label="New exam announcements"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.appResults} onChange={handleNotificationChange('appResults')} />}
                label="Exam results available"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.appAchievements} onChange={handleNotificationChange('appAchievements')} />}
                label="Achievements and badges"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.appUpdates} onChange={handleNotificationChange('appUpdates')} />}
                label="System updates and maintenance"
                sx={{ mb: 3, display: 'block' }}
              />
              <Typography variant="h6" sx={{ mb: 1, color: '#34495e' }}>
                Push Notifications
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.pushExam} onChange={handleNotificationChange('pushExam')} />}
                label="Exam reminders (1 hour before)"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={notificationSettings.pushResults} onChange={handleNotificationChange('pushResults')} />}
                label="Immediate results notification"
                sx={{ mb: 3, display: 'block' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" sx={{ bgcolor: 'linear-gradient(to right, #6a11cb, #2575fc)' }}>
                  Save Notification Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </div>

      {/* Delete Account Modal */}
      <div className={`${styles.modal} ${deleteModalOpen ? styles.active : ''}`} id="deleteAccountModal">
        <div className={styles['modal-content']}>
          <h3 className={styles['modal-title']}>Delete Account</h3>
          <p className={styles['modal-text']}>Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including exam results and progress, will be permanently erased.</p>
          <div className={styles['form-group']}>
            <label htmlFor="confirmDelete" className={styles['form-label']}>Type "DELETE" to confirm</label>
            <input type="text" id="confirmDelete" className={styles['form-control']} placeholder="DELETE" />
          </div>
          <div className={styles['modal-actions']}>
            <button type="button" className={`${styles.btn} ${styles['btn-outline']}`} id="cancelDelete">Cancel</button>
            <button type="button" className={`${styles.btn} ${styles['btn-danger']}`} id="confirmDeleteBtn" disabled>Delete My Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;