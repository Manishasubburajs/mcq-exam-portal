"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
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

const ScoreCircle = ({ score }: { score: number }) => {
  const percentage = score;
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  };
  const color = getScoreColor(percentage);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={150}
        thickness={8}
        sx={{
          color: color,
          backgroundColor: 'transparent',
          borderRadius: '50%',
          boxShadow: 'inset 0 0 0 8px #e9ecef',
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
};

export default function ExamResultsReview() {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const filteredQuestions = questions.filter(q => filter === 'all' || q.status === filter);

  const handlePrint = () => {
    globalThis.window.print();
  };

  const handleExport = () => {
    alert('Exporting results as PDF...');
  };

  return (
    <Box sx={{
      flex: 1,
      padding: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            paddingBottom: 1.5,
            borderBottom: '1px solid #e0e0e0',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            sx={{
              color: '#2c3e50',
              fontWeight: 600,
              textAlign: { xs: 'center', sm: 'left' },
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }
            }}
          >
            Exam Results: Mathematics Midterm
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-start' },
            mt: { xs: 0, sm: 0 }
          }}>
            <Avatar
              src="https://ui-avatars.com/api/?name=John+Doe&background=6a11cb&color=fff"
              sx={{
                width: { xs: 35, sm: 40 },
                height: { xs: 35, sm: 40 },
                mr: 1,
                border: '2px solid #6a11cb'
              }}
            />
            <Typography
              sx={{
                textAlign: { xs: 'center', sm: 'left' },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              John Doe - Student ID: S12345
            </Typography>
          </Box>
        </Box>

        {/* Results Summary */}
        <Paper sx={{ padding: 3, mb: 3, borderRadius: 2.5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <ScoreCircle score={92} />
          <Typography variant="h5" sx={{ mb: 1 }}>Mathematics Midterm Exam</Typography>
          <Typography sx={{ color: '#6c757d', mb: 3 }}>Completed on October 15, 2023 • Time Spent: 28/30 minutes</Typography>

          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 2 },
            maxWidth: { xs: '100%', sm: 600 },
            mx: 'auto',
            justifyContent: 'center',
            '& > *': {
              flex: { xs: '1 1 45%', sm: '1 1 22%' },
              minWidth: { xs: '120px', sm: '140px' }
            }
          }}>
            <Box sx={{
              textAlign: 'center',
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              minHeight: { xs: 80, sm: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                46/50
              </Typography>
              <Typography sx={{
                color: '#6c757d',
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2
              }}>
                Questions Correct
              </Typography>
            </Box>
            <Box sx={{
              textAlign: 'center',
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              minHeight: { xs: 80, sm: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                92%
              </Typography>
              <Typography sx={{
                color: '#6c757d',
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2
              }}>
                Overall Score
              </Typography>
            </Box>
            <Box sx={{
              textAlign: 'center',
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              minHeight: { xs: 80, sm: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                5th
              </Typography>
              <Typography sx={{
                color: '#6c757d',
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2
              }}>
                Class Rank
              </Typography>
            </Box>
            <Box sx={{
              textAlign: 'center',
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              minHeight: { xs: 80, sm: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                A
              </Typography>
              <Typography sx={{
                color: '#6c757d',
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2
              }}>
                Grade
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Performance Breakdown */}
        <Paper sx={{ padding: 3, mb: 3, borderRadius: 2.5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50', paddingBottom: 1, borderBottom: '2px solid #f0f0f0' }}>
            Performance by Category
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            '& > *': {
              flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' },
              minWidth: { xs: '250px', md: '200px' }
            }
          }}>
            {categories.map((category) => (
              <Box key={category.name} sx={{ padding: 1.5, borderRadius: 1, backgroundColor: '#f8f9fa' }}>
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
                      backgroundColor: (() => {
                        if (category.score >= 90) return '#28a745';
                        if (category.score >= 70) return '#20c997';
                        return '#ffc107';
                      })(),
                      borderRadius: 1,
                    },
                  }}
                />
                <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                  {category.correct}/{category.total} questions correct
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Questions Review */}
        <Paper sx={{ padding: 3, borderRadius: 2.5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography
              sx={{
                color: '#2c3e50',
                paddingBottom: 1,
                borderBottom: '2px solid #f0f0f0',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Question Review
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <ButtonGroup
                variant="outlined"
                size="small"
                sx={{
                  flex: { xs: 1, sm: 'none' },
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                <Button
                  variant={filter === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('all')}
                  sx={{
                    textTransform: 'none',
                    fontSize: { xs: 11, sm: 12 },
                    flex: 1
                  }}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'correct' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('correct')}
                  sx={{
                    textTransform: 'none',
                    fontSize: { xs: 11, sm: 12 },
                    flex: 1
                  }}
                >
                  Correct
                </Button>
                <Button
                  variant={filter === 'incorrect' ? 'contained' : 'outlined'}
                  onClick={() => setFilter('incorrect')}
                  sx={{
                    textTransform: 'none',
                    fontSize: { xs: 11, sm: 12 },
                    flex: 1
                  }}
                >
                  Incorrect
                </Button>
              </ButtonGroup>
              <Box sx={{
                display: 'flex',
                gap: 1,
                mt: { xs: 0, sm: 0 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{
                    textTransform: 'none',
                    fontSize: { xs: 11, sm: 12 },
                    minWidth: { xs: 'auto', sm: 120 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Print</Box>
                  <Box sx={{ display: { xs: 'inline', sm: 'none' } }}><PrintIcon /></Box>
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{
                    textTransform: 'none',
                    fontSize: { xs: 11, sm: 12 },
                    minWidth: { xs: 'auto', sm: 120 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Export</Box>
                  <Box sx={{ display: { xs: 'inline', sm: 'none' } }}><DownloadIcon /></Box>
                </Button>
              </Box>
            </Box>
          </Box>

          {filteredQuestions.map((question) => (
            <Card key={question.id} sx={{
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{
                padding: { xs: 1, sm: 1.5 },
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  {question.title}
                </Typography>
                <Chip
                  label={question.status === 'correct' ? 'Correct' : 'Incorrect'}
                  color={question.status === 'correct' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <CardContent sx={{ padding: { xs: 1.5, sm: 2 } }}>
                <Typography sx={{
                  mb: 2,
                  lineHeight: 1.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  {question.text}
                </Typography>
                <List>
                  {question.options.map((option, index) => (
                    <ListItem
                      key={`option-${question.id}-${index}`}
                      sx={{
                        padding: '12px 15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: (() => {
                          if (option.correct) return '#d4edda';
                          if (option.selected && !option.correct) return '#f8d7da';
                          if (option.selected) return '#fff3cd';
                          return 'transparent';
                        })(),
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, fontWeight: 600, flexShrink: 0 }}>
                        {String.fromCodePoint(65 + index)}
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
          <Box sx={{
            textAlign: 'center',
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ChevronLeftIcon />}
              sx={{
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                mb: { xs: 0.5, sm: 0 }
              }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                width: { xs: '100%', sm: 'auto' },
                mb: { xs: 0.5, sm: 0 }
              }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<ChevronRightIcon />}
              sx={{
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Next
            </Button>
          </Box>
        </Paper>
    </Box>
  );
}