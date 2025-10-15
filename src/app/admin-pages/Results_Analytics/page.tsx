"use client"

// Responsive variable for chart legend
import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Download, Visibility, TrendingUp, TrendingDown } from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ChartContainer from '../../components/ChartContainer';
import styles from './ChartLayout.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PerformanceData {
  subject: string;
  score: number;
  correct: string;
  color: 'success' | 'info' | 'warning' | 'error';
}

interface StudentResult {
  rank: number;
  name: string;
  studentId: string;
  score: number;
  timeSpent: string;
  correctAnswers: string;
  subjectBreakdown: string;
}

const ResultsAnalytics = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const isDesktop = useMediaQuery('(min-width:900px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);
  const [examFilter, setExamFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('month');
  const [classFilter, setClassFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const summaryStats = [
    {
      value: '1,245',
      label: 'Total Exams Taken',
      trend: '+12%',
      trendUp: true,
      description: 'from last month',
    },
    {
      value: '87%',
      label: 'Average Score',
      trend: '+5%',
      trendUp: true,
      description: 'from last month',
    },
    {
      value: '42 min',
      label: 'Average Time Spent',
      trend: '-3%',
      trendUp: false,
      description: 'from last month',
    },
    {
      value: '95%',
      label: 'Completion Rate',
      trend: '+2%',
      trendUp: true,
      description: 'from last month',
    },
  ];

  const examActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Exams',
        data: [45, 52, 48, 61, 55, 67],
        backgroundColor: 'rgba(106, 17, 203, 0.7)',
        borderColor: 'rgba(106, 17, 203, 1)',
        borderWidth: 1,
      },
    ],
  };

  const subjectPerformanceData = {
    labels: ['Mathematics', 'Algebra', 'Geometry'],
    datasets: [
      {
        data: [82, 76, 68],
        backgroundColor: [
          'rgba(106, 17, 203, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(76, 175, 80, 0.8)',
        ],
        borderColor: [
          'rgba(106, 17, 203, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const performanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Score',
        data: [75, 78, 80, 82, 79, 85],
        borderColor: 'rgba(106, 17, 203, 1)',
        backgroundColor: 'rgba(106, 17, 203, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
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
      <Box className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} sx={{ paddingTop: { xs: '50px', md: '80px' } }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Results Analytics" sidebarOpen={sidebarOpen} />

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
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                '&:hover': { opacity: 0.9 }
              }}
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                '&:hover': { opacity: 0.9 }
              }}
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

        {/* Charts */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            marginBottom: '30px',
          }}
        >
          <ChartContainer title="Exam Activity Overview" minHeight={{ xs: 240, sm: 220, md: 280 }}>
             <Bar data={examActivityData} options={{
               responsive: true,
               maintainAspectRatio: false,
               scales: {
                 y: {
                   beginAtZero: true,
                   ticks: { font: { size: 9 } }
                 },
                 x: { ticks: { font: { size: 9 } } }
               },
               plugins: { legend: { display: false } },
               layout: { padding: { top: 10, right: 10, bottom: 10, left: 10 } }
             }} />
           </ChartContainer>
           <ChartContainer title="Subject Performance" minHeight={{ xs: 240, sm: 220, md: 280 }}>
             <Doughnut data={subjectPerformanceData} options={{
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                 legend: {
                   position: "bottom" as const,
                   labels: { font: { size: 9 }, padding: 8 }
                 }
               },
               layout: { padding: { top: 10, right: 10, bottom: 10, left: 10 } }
             }} />
           </ChartContainer>
           <ChartContainer title="Performance Trend" minHeight={{ xs: 240, sm: 220, md: 280 }}>
             <Line data={performanceTrendData} options={{
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                 legend: {
                   position: "bottom" as const,
                   labels: { font: { size: 9 }, padding: 8 }
                 }
               },
               scales: {
                 y: {
                   beginAtZero: true,
                   max: 100,
                   ticks: { font: { size: 9 } }
                 },
                 x: { ticks: { font: { size: 9 } } }
               },
               layout: { padding: { top: 10, right: 10, bottom: 10, left: 10 } }
             }} />
           </ChartContainer>
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