"use client"
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Pagination,
  Stack,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Visibility,
  FilterList,
  Menu,
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import Sidebar from '../../components/Sidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StudentResult {
  rank: number;
  name: string;
  studentId: string;
  score: number;
  timeSpent: string;
  correctAnswers: string;
  subjectBreakdown: string;
}

interface PerformanceData {
  subject: string;
  score: number;
  correct: string;
  color: 'success' | 'info' | 'warning' | 'error';
}

const ResultsAnalytics: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width:769px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [examFilter, setExamFilter] = useState('math-midterm');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('month');
  const [classFilter, setClassFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const summaryStats = [
    {
      value: '78.5%',
      label: 'Average Score',
      trend: '+2.3%',
      trendUp: true,
      description: 'from last exam',
    },
    {
      value: '124',
      label: 'Students Attempted',
      trend: '+15',
      trendUp: true,
      description: 'more than last exam',
    },
    {
      value: '42.3 min',
      label: 'Average Time Spent',
      trend: '-1.2 min',
      trendUp: false,
      description: 'less than last exam',
    },
    {
      value: '92%',
      label: 'Completion Rate',
      trend: '+5%',
      trendUp: true,
      description: 'improvement',
    },
  ];

  const scoreDistributionData = {
    labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [
      {
        label: 'Number of Students',
        data: [2, 8, 15, 42, 57],
        backgroundColor: [
          'rgba(220, 53, 69, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(40, 167, 69, 0.7)',
          'rgba(32, 201, 151, 0.7)',
          'rgba(106, 17, 203, 0.7)',
        ],
        borderColor: [
          'rgba(220, 53, 69, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(32, 201, 151, 1)',
          'rgba(106, 17, 203, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const scoreDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Score Range',
        },
      },
    },
  };

  const subjectPerformanceData = {
    labels: ['Mathematics', 'Algebra', 'Geometry'],
    datasets: [
      {
        data: [82, 76, 68],
        backgroundColor: [
          'rgba(106, 17, 203, 0.7)',
          'rgba(37, 117, 252, 0.7)',
          'rgba(32, 201, 151, 0.7)',
        ],
        borderColor: [
          'rgba(106, 17, 203, 1)',
          'rgba(37, 117, 252, 1)',
          'rgba(32, 201, 151, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const subjectPerformanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const performanceData: PerformanceData[] = [
    {
      subject: 'Mathematics',
      score: 82,
      correct: '25/30 questions correct on average',
      color: 'success',
    },
    {
      subject: 'Algebra',
      score: 76,
      correct: '15/20 questions correct on average',
      color: 'info',
    },
    {
      subject: 'Geometry',
      score: 68,
      correct: '7/10 questions correct on average',
      color: 'warning',
    },
  ];

  const studentResults: StudentResult[] = [
    {
      rank: 1,
      name: 'John Doe',
      studentId: 'S1001',
      score: 96,
      timeSpent: '38/45 min',
      correctAnswers: '48/50',
      subjectBreakdown: 'Math: 98% | Algebra: 95% | Geometry: 100%',
    },
    {
      rank: 2,
      name: 'Jane Smith',
      studentId: 'S1002',
      score: 92,
      timeSpent: '42/45 min',
      correctAnswers: '46/50',
      subjectBreakdown: 'Math: 94% | Algebra: 90% | Geometry: 90%',
    },
    {
      rank: 3,
      name: 'Michael Johnson',
      studentId: 'S1003',
      score: 88,
      timeSpent: '40/45 min',
      correctAnswers: '44/50',
      subjectBreakdown: 'Math: 90% | Algebra: 85% | Geometry: 90%',
    },
    {
      rank: 4,
      name: 'Emily Davis',
      studentId: 'S1004',
      score: 84,
      timeSpent: '35/45 min',
      correctAnswers: '42/50',
      subjectBreakdown: 'Math: 86% | Algebra: 80% | Geometry: 90%',
    },
    {
      rank: 5,
      name: 'Robert Wilson',
      studentId: 'S1005',
      score: 78,
      timeSpent: '44/45 min',
      correctAnswers: '39/50',
      subjectBreakdown: 'Math: 80% | Algebra: 75% | Geometry: 80%',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const handleApplyFilters = () => {
    alert(`Applying filters: Exam=${examFilter}, Subject=${subjectFilter}, Date=${dateFilter}, Class=${classFilter}`);
  };

  const handleResetFilters = () => {
    setExamFilter('');
    setSubjectFilter('');
    setDateFilter('month');
    setClassFilter('');
  };

  const handleExportReport = () => {
    alert('Exporting analytics report as PDF...');
  };

  const handleViewDetails = (studentName: string) => {
    alert(`Viewing detailed results for: ${studentName}`);
  };

  const handleViewAllResults = () => {
    alert('Redirecting to full results page...');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Sidebar activeItem="Results Analytics" isOpen={sidebarOpen} />
      <Box className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            paddingBottom: '15px',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 1 }}>
              <Menu />
            </IconButton>
            <Typography variant="h4" sx={{ color: 'text.primary' }}>
              Results Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src="https://ui-avatars.com/api/?name=Admin+User&background=6a11cb&color=fff"
              alt="Admin User"
              sx={{ width: 40, height: 40, border: '2px solid #6a11cb', mr: 1 }}
            />
            <Typography variant="body1">Administrator</Typography>
          </Box>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ padding: '20px', marginBottom: '25px', borderRadius: '10px' }}>
          <Typography variant="h6" sx={{ marginBottom: '15px', color: 'text.primary' }}>
            Filter Results
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Exam</InputLabel>
              <Select
                value={examFilter}
                label="Exam"
                onChange={(e) => setExamFilter(e.target.value)}
              >
                <MenuItem value="">All Exams</MenuItem>
                <MenuItem value="math-midterm">Mathematics Midterm</MenuItem>
                <MenuItem value="science-quiz">Science Quiz</MenuItem>
                <MenuItem value="history-final">History Final</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectFilter}
                label="Subject"
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                <MenuItem value="math">Mathematics</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="history">History</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                label="Date Range"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={classFilter}
                label="Class"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="">All Classes</MenuItem>
                <MenuItem value="10a">10th Grade - Section A</MenuItem>
                <MenuItem value="10b">10th Grade - Section B</MenuItem>
                <MenuItem value="10c">10th Grade - Section C</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '15px' }}>
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button variant="contained" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Download />}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
          </Box>
        </Paper>

        {/* Summary Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, marginBottom: '30px' }}>
          {summaryStats.map((stat, index) => (
            <Card elevation={1} sx={{ borderRadius: '10px' }} key={index}>
              <CardContent sx={{ textAlign: 'center', padding: '20px' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '10px' }}>
                  {stat.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {stat.trendUp ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={stat.trendUp ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'medium' }}
                  >
                    {stat.trend} {stat.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, marginBottom: '30px' }}>
          <Paper elevation={1} sx={{ padding: '25px', borderRadius: '10px' }}>
            <Typography variant="h6" sx={{ marginBottom: '20px', color: 'text.primary' }}>
              Score Distribution
            </Typography>
            <Box className="chart-container" sx={{ height: '300px' }}>
              <Bar data={scoreDistributionData} options={scoreDistributionOptions} />
            </Box>
          </Paper>
          <Paper elevation={1} sx={{ padding: '25px', borderRadius: '10px' }}>
            <Typography variant="h6" sx={{ marginBottom: '20px', color: 'text.primary' }}>
              Subject Performance
            </Typography>
            <Box className="chart-container" sx={{ height: '300px' }}>
              <Doughnut data={subjectPerformanceData} options={subjectPerformanceOptions} />
            </Box>
          </Paper>
        </Box>

        {/* Performance Breakdown */}
        <Paper elevation={1} sx={{ padding: '25px', marginBottom: '30px', borderRadius: '10px' }}>
          <Typography variant="h6" sx={{ marginBottom: '20px', color: 'text.primary' }}>
            Performance Breakdown
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            {performanceData.map((item, index) => (
              <Box sx={{ padding: '15px', backgroundColor: 'grey.50', borderRadius: '8px' }} key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {item.subject}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.score}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.score}
                  color={item.color}
                  sx={{ height: '8px', borderRadius: '4px', marginBottom: '5px' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.correct}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Results Table */}
        <Paper elevation={1} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{ padding: '20px', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Detailed Results
              </Typography>
              <Button variant="outlined" onClick={handleViewAllResults}>
                View All Results
              </Button>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time Spent</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Correct Answers</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject Breakdown</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentResults.map((student) => (
                  <TableRow key={student.studentId} hover>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {student.rank}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.studentId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${student.score}%`}
                        color={getScoreColor(student.score)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{student.timeSpent}</TableCell>
                    <TableCell>{student.correctAnswers}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {student.subjectBreakdown}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(student.name)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Pagination
              count={5}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ResultsAnalytics;