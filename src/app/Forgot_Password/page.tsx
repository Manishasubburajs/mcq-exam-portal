'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  School,
  Email,
  ArrowBack,
  CheckCircle,
  Security,
} from '@mui/icons-material';

const validateEmail = (email: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail('');
    }, 2000);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a89cc, #4a69bd)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <School sx={{ fontSize: 48, color: 'white', mb: 1 }} />
          <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 600 }}>
            EduGrade Teacher Portal
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                Reset Your Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                error={!!error}
                helperText={error}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  backgroundColor: '#6a89cc',
                  '&:hover': {
                    backgroundColor: '#5a79bc',
                  },
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Box>

            {success && (
              <Alert
                severity="success"
                sx={{ mt: 2 }}
                icon={<CheckCircle />}
              >
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Reset Link Sent!
                </Typography>
                <Typography variant="body2">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your email inbox.
                </Typography>
              </Alert>
            )}

            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                borderLeft: 4,
                borderColor: '#6a89cc',
              }}
            >
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Security />
                Security Notice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For security reasons, the password reset link will expire in 30 minutes. If you don't receive the email, please check your spam folder or contact support.
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                component="a"
                href="/"
                startIcon={<ArrowBack />}
                sx={{
                  color: '#6a89cc',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#4a69bd',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}