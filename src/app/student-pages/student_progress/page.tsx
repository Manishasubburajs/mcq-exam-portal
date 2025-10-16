'use client';

import React from 'react';
import {
  Box,
  Grid,
  Paper,
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
  Stack,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  MenuBook,
  Assessment,
  Person,
  History,
  Settings,
  Logout,
  Home,
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
import { Line } from 'react-chartjs-2';

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
  const theme = useTheme();

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

  const Sidebar = () => (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 280 },
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        position: { xs: 'static', md: 'fixed' },
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          MCQ <Box component="span" sx={{ color: '#ffcc00' }}>Portal</Box>
        </Typography>
      </Box>

      <Stack spacing={1} sx={{ px: 2 }}>
        {[
          { icon: <Dashboard />, text: 'Dashboard', active: false },
          { icon: <MenuBook />, text: 'Take Exam', active: false },
          { icon: <Assessment />, text: 'Results', active: false },
          { icon: <Person />, text: 'Profile', active: true },
          { icon: <History />, text: 'Exam History', active: false },
          { icon: <Settings />, text: 'Settings', active: false },
          { icon: <Logout />, text: 'Logout', active: false },
        ].map((item) => (
          <Button
            key={item.text}
            startIcon={item.icon}
            sx={{
              justifyContent: 'flex-start',
              color: 'white',
              backgroundColor: item.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              py: 1.5,
              px: 2,
              borderRadius: 1,
            }}
          >
            {item.text}
          </Button>
        ))}
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: '280px' },
          p: 4,
          backgroundColor: '#f5f7fa',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            pb: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            Student Profile & Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
              sx={{ width: 40, height: 40, mr: 2, border: '2px solid #6a11cb' }}
            />
            <Typography>John Doe</Typography>
          </Box>
        </Box>

        {/* Profile Card */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                sx={{
                  width: 120,
                  height: 120,
                  mr: 4,
                  border: '5px solid #6a11cb',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                  John Doe
                </Typography>
                <Typography sx={{ color: '#7f8c8d', mb: 2 }}>
                  Student ID: S12345 • Class: 10th Grade • Section: A
                </Typography>
                <Grid container spacing={4}>
                  {[
                    { value: '82%', label: 'Average Score' },
                    { value: '15', label: 'Exams Taken' },
                    { value: '12', label: 'Certificates' },
                    { value: '#5', label: 'Class Rank' },
                  ].map((stat) => (
                    <Grid item xs={6} sm={3} key={stat.label}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#6a11cb' }}>
                          {stat.value}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: '#7f8c8d' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <Schedule />, value: '3', label: 'Upcoming Exams', color: '#28a745' },
            { icon: <TrendingUp />, value: '+7%', label: 'Progress This Month', color: '#1a73e8' },
            { icon: <School />, value: '24h', label: 'Total Study Time', color: '#e37400' },
            { icon: <EmojiEvents />, value: 'Top 10%', label: 'School Ranking', color: '#dc3545' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
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
            </Grid>
          ))}
        </Grid>

        {/* Performance Chart */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
              Performance Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
              Subject Performance
            </Typography>
            <Grid container spacing={3}>
              {[
                { name: 'Mathematics', score: 88, exams: 7, certificates: 5 },
                { name: 'Science', score: 79, exams: 5, certificates: 3 },
                { name: 'History', score: 72, exams: 3, certificates: 2 },
              ].map((subject) => (
                <Grid item xs={12} md={4} key={subject.name}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
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
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Exam History */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                Recent Exam History
              </Typography>
              <Button variant="outlined">View Full History</Button>
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
                  {examHistoryData.map((exam, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
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
                        <Button variant="outlined" size="small">
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
    </Box>
  );
};

export default StudentProgressPage;