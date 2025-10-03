'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Visibility,
  VisibilityOff,
  Email,
  Person,
  Lock,
  School,
  CalendarToday,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

// Combined validation schema
const validationSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  username: yup.string().min(4, 'Username must be at least 4 characters').required('Username is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').matches(/[a-zA-Z]/, 'Password must contain letters').matches(/[0-9]/, 'Password must contain numbers').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string(),
  birthDate: yup.date().required('Date of birth is required').max(new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000), 'Must be at least 13 years old'),
  gender: yup.string(),
  studentId: yup.string().required('Student ID is required'),
  school: yup.string().required('School is required'),
  grade: yup.string().required('Grade is required'),
  section: yup.string(),
  subjects: yup.array(),
  terms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const steps = ['Account', 'Personal', 'Academic'];

const RegistrationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, formState: { errors }, trigger, getValues } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.birthDate,
          gender: data.gender,
          school: data.school,
          grade: data.grade,
          section: data.section,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom color="primary">
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message as string}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Username"
                      error={!!errors.username}
                      helperText={errors.username?.message as string}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message as string}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
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
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message as string}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom color="primary">
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      type="tel"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birthDate}
                      helperText={errors.birthDate?.message as string}
                      inputProps={{
                        max: new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        <MenuItem value="">
                          <em>Select Gender</em>
                        </MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                        <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom color="primary">
              Academic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Student ID"
                      error={!!errors.studentId}
                      helperText={errors.studentId?.message as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="school"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="School/Institution"
                      error={!!errors.school}
                      helperText={errors.school?.message as string}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <School />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.grade}>
                      <InputLabel>Grade/Year</InputLabel>
                      <Select {...field} label="Grade/Year">
                        <MenuItem value="">
                          <em>Select Grade/Year</em>
                        </MenuItem>
                        <MenuItem value="9">9th Grade</MenuItem>
                        <MenuItem value="10">10th Grade</MenuItem>
                        <MenuItem value="11">11th Grade</MenuItem>
                        <MenuItem value="12">12th Grade</MenuItem>
                        <MenuItem value="college">College</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {errors.grade && <Typography variant="caption" color="error">{errors.grade.message as string}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="section"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Section (Optional)"
                      placeholder="e.g., A, B, C"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="subjects"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Subjects of Interest</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Subjects of Interest"
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        <MenuItem value="math">Mathematics</MenuItem>
                        <MenuItem value="science">Science</MenuItem>
                        <MenuItem value="history">History</MenuItem>
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="geography">Geography</MenuItem>
                        <MenuItem value="computer">Computer Science</MenuItem>
                      </Select>
                      <Typography variant="caption" color="textSecondary">
                        Hold Ctrl/Cmd to select multiple subjects
                      </Typography>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} />}
                      label={
                        <Typography variant="body2">
                          I agree to the <a href="#" style={{ color: 'primary.main' }}>Terms of Service</a> and{' '}
                          <a href="#" style={{ color: 'primary.main' }}>Privacy Policy</a>
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.terms && <Typography variant="caption" color="error">{errors.terms.message as string}</Typography>}
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            minHeight: 600,
          }}
        >
          {/* Banner Section */}
          <Box
            sx={{
              flex: 1,
              background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'500\' height=\'500\' viewBox=\'0 0 500 500\'><rect fill=\'%236a11cb\' width=\'500\' height=\'500\'/><path fill=\'%232575fc\' d=\'M250,0 L500,250 L250,500 L0,250 Z\'/></svg>")',
              backgroundSize: 'cover',
              color: 'white',
              p: 4,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Join Our Learning Community
            </Typography>
            <Typography variant="body1" paragraph>
              Register now to access our comprehensive MCQ exam portal designed to enhance your learning experience.
            </Typography>
            <Typography variant="body1" paragraph>
              Take exams, track your progress, and improve your knowledge with our interactive platform.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon sx={{ color: '#ffcc00' }}>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText primary="Access to hundreds of practice exams" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ color: '#ffcc00' }}>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText primary="Detailed performance analytics" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ color: '#ffcc00' }}>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText primary="Progress tracking and certificates" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ color: '#ffcc00' }}>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText primary="24/7 availability from any device" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ color: '#ffcc00' }}>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText primary="Expert-curated question bank" />
              </ListItem>
            </List>
          </Box>

          {/* Form Section */}
          <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                MCQ <span style={{ color: '#6a11cb' }}>Exam Portal</span>
              </Typography>
              <Typography variant="h6">Student Registration</Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration successful! Redirecting to login...
              </Alert>
            )}

            <Box sx={{ flexGrow: 1 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit(onSubmit)}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  Complete Registration
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account? <a href="/" style={{ color: '#2575fc', textDecoration: 'none' }}>Log in here</a>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegistrationPage;