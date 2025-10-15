"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon />, active: false },
  { label: 'Take Exam', icon: <AssignmentIcon />, active: false },
  { label: 'Results', icon: <BarChartIcon />, active: true },
  { label: 'Exam History', icon: <HistoryIcon />, active: false },
  { label: 'Profile', icon: <PersonIcon />, active: false },
  { label: 'Settings', icon: <SettingsIcon />, active: false },
  { label: 'Logout', icon: <LogoutIcon />, active: false },
];

const categories = [
  { name: 'Algebra', score: 95, correct: 19, total: 20 },
  { name: 'Geometry', score: 88, correct: 14, total: 16 },
  { name: 'Calculus', score: 86, correct: 12, total: 14 },
];

const questions = [
  {
    id: 1,
    title: 'Question 1',
    text: 'What is the value of π (pi) to two decimal places?',
    status: 'correct',
    options: [
      { text: '3.14', correct: true, selected: false },
      { text: '3.15', correct: false, selected: false },
      { text: '3.16', correct: false, selected: true },
      { text: '3.18', correct: false, selected: false },
    ],
    explanation: 'The value of π is approximately 3.14159. When rounded to two decimal places, it becomes 3.14.',
  },
  {
    id: 2,
    title: 'Question 2',
    text: 'Solve for x: 2x + 5 = 15',
    status: 'incorrect',
    options: [
      { text: '5', correct: true, selected: false },
      { text: '10', correct: false, selected: false },
      { text: '7.5', correct: false, selected: false },
      { text: '5.5', correct: false, selected: true },
    ],
    explanation: 'To solve for x, first subtract 5 from both sides: 2x = 10. Then divide both sides by 2: x = 5.',
  },
  {
    id: 3,
    title: 'Question 3',
    text: 'What is the derivative of x²?',
    status: 'correct',
    options: [
      { text: 'x', correct: false, selected: false },
      { text: '2x', correct: true, selected: true },
      { text: '2', correct: false, selected: false },
      { text: 'x²', correct: false, selected: false },
    ],
    explanation: 'The power rule states that the derivative of xⁿ is n*xⁿ⁻¹. So for x², the derivative is 2*x¹ = 2x.',
  },
];

export default function ExamResultsReview() {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredQuestions = questions.filter(q => filter === 'all' || q.status === filter);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('Exporting results as PDF...');
  };

  const ScoreCircle = ({ score }: { score: number }) => {
    const percentage = score;
    const color = percentage >= 90 ? '#28a745' : percentage >= 70 ? '#ffc107' : '#dc3545';
    const radius = 75;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Box sx={{ position: 'relative', width: 150, height: 150, mx: 'auto', mb: 2 }}>
        <svg width="150" height="150">
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="#e9ecef"
            strokeWidth="15"
            fill="none"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke={color}
            strokeWidth="15"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 75 75)"
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            width: 130,
            height: 130,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>
            {percentage}%
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa', color: '#333' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          padding: '20px 0',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ textAlign: 'center', padding: '20px 0', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            MCQ <Box component="span" sx={{ color: '#ffcc00' }}>Portal</Box>
          </Typography>
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} sx={{ padding: 0 }}>
              <Button
                sx={{
                  width: '100%',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 15px',
                  borderRadius: 0,
                  justifyContent: 'flex-start',
                  backgroundColor: item.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: 500 }}>{item.label}</Typography>
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, padding: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            paddingBottom: 1.5,
            borderBottom: '1px solid #e0e0e0',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Exam Results: Mathematics Midterm
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1.5, md: 0 } }}>
            <Avatar
              src="https://ui-avatars.com/api/?name=John+Doe&background=6a11cb&color=fff"
              sx={{ width: 40, height: 40, mr: 1, border: '2px solid #6a11cb' }}
            />
            <Typography>John Doe - Student ID: S12345</Typography>
          </Box>
        </Box>

        {/* Results Summary */}
        <Paper sx={{ padding: 3, mb: 3, borderRadius: 2.5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <ScoreCircle score={92} />
          <Typography variant="h5" sx={{ mb: 1 }}>Mathematics Midterm Exam</Typography>
          <Typography sx={{ color: '#6c757d', mb: 3 }}>Completed on October 15, 2023 • Time Spent: 28/30 minutes</Typography>

          <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', padding: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>46/50</Typography>
                <Typography sx={{ color: '#6c757d', fontSize: 14 }}>Questions Correct</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', padding: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>92%</Typography>
                <Typography sx={{ color: '#6c757d', fontSize: 14 }}>Overall Score</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', padding: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>5th</Typography>
                <Typography sx={{ color: '#6c757d', fontSize: 14 }}>Class Rank</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', padding: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>A</Typography>
                <Typography sx={{ color: '#6c757d', fontSize: 14 }}>Grade</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Performance Breakdown */}
        <Paper sx={{ padding: 3, mb: 3, borderRadius: 2.5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50', paddingBottom: 1, borderBottom: '2px solid #f0f0f0' }}>
            Performance by Category
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} md={4} key={category.name}>
                <Box sx={{ padding: 1.5, borderRadius: 1, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{category.name}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{category.score}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.score}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: '#e9ecef',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: category.score >= 90 ? '#28a745' : category.score >= 70 ? '#20c997' : '#ffc107',
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                    {category.correct}/{category.total} questions correct
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Questions Review */}
        <Paper sx={{ padding: 3, borderRadius: 2.5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Typography variant="h5" sx={{ color: '#2c3e50', paddingBottom: 1, borderBottom: '2px solid #f0f0f0' }}>
              Question Review
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, md: 0 } }}>
              <ButtonGroup variant="outlined" size="small">
                <Button
                  variant={filter === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('all')}
                  sx={{ textTransform: 'none' }}
                >
                  All Questions
                </Button>
                <Button
                  variant={filter === 'correct' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('correct')}
                  sx={{ textTransform: 'none' }}
                >
                  Correct Answers
                </Button>
                <Button
                  variant={filter === 'incorrect' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('incorrect')}
                  sx={{ textTransform: 'none' }}
                >
                  Incorrect Answers
                </Button>
              </ButtonGroup>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ textTransform: 'none', ml: 1 }}
              >
                Print Results
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{ textTransform: 'none' }}
              >
                Export PDF
              </Button>
            </Box>
          </Box>

          {filteredQuestions.map((question) => (
            <Card key={question.id} sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ padding: 1.5, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{question.title}</Typography>
                <Chip
                  label={question.status === 'correct' ? 'Correct' : 'Incorrect'}
                  color={question.status === 'correct' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <CardContent>
                <Typography sx={{ mb: 2, lineHeight: 1.5 }}>{question.text}</Typography>
                <List>
                  {question.options.map((option, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        padding: '12px 15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: option.correct ? '#d4edda' : option.selected && !option.correct ? '#f8d7da' : option.selected ? '#fff3cd' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, fontWeight: 600, flexShrink: 0 }}>
                        {String.fromCharCode(65 + index)}
                      </Box>
                      <ListItemText primary={option.text} />
                      {option.correct && <CheckCircleIcon sx={{ color: '#28a745', ml: 1 }} />}
                      {option.selected && !option.correct && <CancelIcon sx={{ color: '#dc3545', ml: 1 }} />}
                      {option.selected && option.correct && <CheckCircleIcon sx={{ color: '#28a745', ml: 1 }} />}
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ backgroundColor: '#e7f3ff', padding: 1.5, borderRadius: 1, mt: 1.5, borderLeft: '4px solid #2575fc' }}>
                  <Typography sx={{ fontWeight: 600, mb: 0.5, color: '#2575fc' }}>Explanation:</Typography>
                  <Typography>{question.explanation}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Navigation */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined" startIcon={<ChevronLeftIcon />} sx={{ mr: 1, textTransform: 'none' }}>
              Previous
            </Button>
            <Button variant="contained" sx={{ mr: 1, textTransform: 'none', background: 'linear-gradient(to right, #6a11cb, #2575fc)' }}>
              Back to Dashboard
            </Button>
            <Button variant="outlined" endIcon={<ChevronRightIcon />} sx={{ textTransform: 'none' }}>
              Next
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}