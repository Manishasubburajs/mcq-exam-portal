'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  EmojiEvents,
  School,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2'; // cSpell:ignore chartjs

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const StudentProgressPage = () => {

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Average Score',
        data: [72, 75, 74, 78, 76, 80, 79, 81, 82, 84],
        borderColor: '#6a11cb',
        backgroundColor: 'rgba(106, 17, 203, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return 'Score: ' + context.parsed.y + '%';
          },
        },
      },
    },
  };

  const examHistoryData = [
    {
      examName: 'Algebra Midterm',
      subject: 'Mathematics',
      date: 'Oct 15, 2023',
      score: 92,
      timeSpent: '28/30 min',
      status: 'Completed',
    },
    {
      examName: 'Physics Test',
      subject: 'Science',
      date: 'Oct 10, 2023',
      score: 84,
      timeSpent: '35/40 min',
      status: 'Completed',
    },
    {
      examName: 'World History',
      subject: 'History',
      date: 'Oct 5, 2023',
      score: 76,
      timeSpent: '42/45 min',
      status: 'Completed',
    },
    {
      examName: 'Chemistry Quiz',
      subject: 'Science',
      date: 'Sep 28, 2023',
      score: 65,
      timeSpent: '25/30 min',
      status: 'Completed',
    },
    {
      examName: 'Geometry Final',
      subject: 'Mathematics',
      date: 'Sep 20, 2023',
      score: 89,
      timeSpent: '50/60 min',
      status: 'Completed',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#20c997';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return '#28a745';
    if (score >= 75) return '#20c997';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  };


  return (
    <Box
      component="main"
      sx={{
        p: {
          xs: '60px 12px 24px',
          sm: '70px 20px 32px',
          md: '24px 30px 40px',
          lg: '32px 40px 48px'
        },
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >

        {/* Profile Card */}
        <Card sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                sx={{
                  width: { xs: 100, sm: 110, md: 120 },
                  height: { xs: 100, sm: 110, md: 120 },
                  mr: { xs: 0, sm: 4 },
                  mb: { xs: 2, sm: 0 },
                  border: '5px solid #6a11cb',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#2c3e50',
                  mb: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
                }}>
                  John Doe
                </Typography>
                <Typography sx={{
                  color: '#7f8c8d',
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
                }}>
                  Student ID: S12345 • Class: 10th Grade • Section: A
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 2, sm: 3, md: 4 },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  '& > *': {
                    flex: { xs: '1 1 45%', sm: '1 1 22%' },
                    minWidth: { xs: '100px', sm: '120px', md: '140px' }
                  }
                }}>
                  {[
                    { value: '82%', label: 'Average Score' },
                    { value: '15', label: 'Exams Taken' },
                    { value: '12', label: 'Certificates' },
                    { value: '#5', label: 'Class Rank' },
                  ].map((stat) => (
                    <Box key={stat.label} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#6a11cb' }}>
                        {stat.value}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: '#7f8c8d' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 2, md: 3 },
          mb: { xs: 2, sm: 3, md: 4 },
          '& > *': {
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 18px)' },
            minWidth: { xs: '200px', sm: '220px', md: '200px' }
          }
        }}>
          {[
            { icon: <Schedule />, value: '3', label: 'Upcoming Exams', color: '#28a745' },
            { icon: <TrendingUp />, value: '+7%', label: 'Progress This Month', color: '#1a73e8' },
            { icon: <School />, value: '24h', label: 'Total Study Time', color: '#e37400' },
            { icon: <EmojiEvents />, value: 'Top 10%', label: 'School Ranking', color: '#dc3545' },
          ].map((stat) => (
            <Card key={stat.label} sx={{ borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      width: 60,
                      height: 60,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: '#7f8c8d', fontSize: '14px' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Performance Chart */}
        <Card sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              color: '#2c3e50',
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
            }}>
              Performance Trend
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 280, md: 300 } }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              color: '#2c3e50',
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
            }}>
              Subject Performance
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, sm: 2.5, md: 3 },
              '& > *': {
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)', md: '1 1 calc(33.333% - 20px)' },
                minWidth: { xs: '200px', sm: '250px', md: '200px' }
              }
            }}>
              {[
                { name: 'Mathematics', score: 88, exams: 7, certificates: 5 },
                { name: 'Science', score: 79, exams: 5, certificates: 3 },
                { name: 'History', score: 72, exams: 3, certificates: 2 },
              ].map((subject) => (
                <Box key={subject.name} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{subject.name}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{subject.score}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={subject.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: '#e9ecef',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getProgressColor(subject.score),
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {subject.exams} exams • {subject.certificates} certificates
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Exam History */}
        <Card sx={{
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: { xs: 2, sm: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                Recent Exam History
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                  padding: { xs: '6px 12px', sm: '8px 16px' }
                }}
              >
                View Full History
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Exam</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Time Spent</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examHistoryData.map((exam) => (
                    <TableRow key={`${exam.examName}-${exam.date}`} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500 }}>{exam.examName}</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#7f8c8d' }}>
                          {exam.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>{exam.subject}</TableCell>
                      <TableCell>{exam.date}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: getScoreColor(exam.score) }}>
                          {exam.score}%
                        </Typography>
                      </TableCell>
                      <TableCell>{exam.timeSpent}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            bgcolor: '#d4edda',
                            color: '#155724',
                            px: 1,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          {exam.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" color="secondary" size="small">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'linear-gradient(45deg, #6a11cb 30%, #2575fc 90%)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'linear-gradient(45deg, #5a0cb8 30%, #1f68e6 90%)',
                  },
                }}
              >
                Download Progress Report
              </Button>
            </Box>
          </CardContent>
        </Card>
    </Box>
  );
};

export default StudentProgressPage;