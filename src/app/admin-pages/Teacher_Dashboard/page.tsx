'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  ShowChart as ShowChartIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Book as BookIcon,
  School as SchoolIcon,
  PieChart as PieChartIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

interface StudentGrade {
  id: string;
  name: string;
  course: string;
  assignment1: number;
  assignment2: number;
  midterm: number;
  finalExam: number;
  overallGrade: string;
}

const TeacherGradebookDashboard: React.FC = () => {
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const students: StudentGrade[] = [
    {
      id: 'STU-1001',
      name: 'Emily Johnson',
      course: 'Algebra I',
      assignment1: 92,
      assignment2: 88,
      midterm: 95,
      finalExam: 91,
      overallGrade: 'A',
    },
    {
      id: 'STU-1002',
      name: 'Michael Chen',
      course: 'Geometry',
      assignment1: 85,
      assignment2: 82,
      midterm: 88,
      finalExam: 84,
      overallGrade: 'B',
    },
    {
      id: 'STU-1003',
      name: 'Sophia Rodriguez',
      course: 'Algebra II',
      assignment1: 78,
      assignment2: 75,
      midterm: 80,
      finalExam: 77,
      overallGrade: 'C+',
    },
    {
      id: 'STU-1004',
      name: 'Daniel Williams',
      course: 'Calculus',
      assignment1: 95,
      assignment2: 98,
      midterm: 96,
      finalExam: 97,
      overallGrade: 'A+',
    },
    {
      id: 'STU-1005',
      name: 'Olivia Martinez',
      course: 'Statistics',
      assignment1: 65,
      assignment2: 70,
      midterm: 68,
      finalExam: 67,
      overallGrade: 'D+',
    },
    {
      id: 'STU-1006',
      name: 'James Thompson',
      course: 'Algebra I',
      assignment1: 88,
      assignment2: 90,
      midterm: 85,
      finalExam: 87,
      overallGrade: 'B+',
    },
  ];

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesCourse = courseFilter === 'All Courses' || student.course.toLowerCase().includes(courseFilter.toLowerCase());
      const matchesGrade = gradeFilter === 'All Grades' || student.overallGrade.includes(gradeFilter);
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCourse && matchesGrade && matchesSearch;
    });
  }, [courseFilter, gradeFilter, searchQuery]);

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return '#e8f5e9';
    if (grade.includes('B')) return '#f0f4c3';
    if (grade.includes('C')) return '#ffe0b2';
    if (grade.includes('D')) return '#ffcdd2';
    return '#f5f5f5';
  };

  const getGradeTextColor = (grade: string) => {
    if (grade.includes('A')) return '#2e7d32';
    if (grade.includes('B')) return '#827717';
    if (grade.includes('C')) return '#ef6c00';
    if (grade.includes('D')) return '#c62828';
    return '#424242';
  };

  const stats = [
    {
      title: 'Total Students',
      value: '142',
      icon: <PeopleIcon />,
      color: '#e3f2fd',
      iconColor: '#1976d2',
    },
    {
      title: 'Courses',
      value: '6',
      icon: <BookIcon />,
      color: '#f3e5f5',
      iconColor: '#7b1fa2',
    },
    {
      title: 'Average Grade',
      value: 'B+',
      icon: <SchoolIcon />,
      color: '#e8f5e9',
      iconColor: '#388e3c',
    },
    {
      title: 'Completion Rate',
      value: '94%',
      icon: <PieChartIcon />,
      color: '#fff3e0',
      iconColor: '#f57c00',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 3 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #4a6fa5, #2c3e50)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" fontWeight={600}>
            <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Gradebook Dashboard
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Dr. Sarah Johnson
              </Typography>
              <Typography variant="body2">
                Mathematics Department
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 3 }}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            elevation={1}
            sx={{
              borderRadius: 2,
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: stat.color, color: stat.iconColor, width: 56, height: 56 }}>
                {React.cloneElement(stat.icon, { fontSize: 'large' })}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {stat.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Controls */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={courseFilter}
              label="Course"
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <MenuItem value="All Courses">All Courses</MenuItem>
              <MenuItem value="Algebra I">Algebra I</MenuItem>
              <MenuItem value="Geometry">Geometry</MenuItem>
              <MenuItem value="Algebra II">Algebra II</MenuItem>
              <MenuItem value="Calculus">Calculus</MenuItem>
              <MenuItem value="Statistics">Statistics</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={gradeFilter}
              label="Grade"
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <MenuItem value="All Grades">All Grades</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
              <MenuItem value="F">F</MenuItem>
            </Select>
          </FormControl>

          <TextField
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Export
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ borderColor: '#e9ecef', color: '#495057', '&:hover': { bgcolor: '#dde1e6' } }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Gradebook Table */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Course</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Assignment 1</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Assignment 2</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Midterm</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Final Exam</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Overall Grade</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>{student.assignment1}%</TableCell>
                <TableCell>{student.assignment2}%</TableCell>
                <TableCell>{student.midterm}%</TableCell>
                <TableCell>{student.finalExam}%</TableCell>
                <TableCell>
                  <Chip
                    label={student.overallGrade}
                    sx={{
                      bgcolor: getGradeColor(student.overallGrade),
                      color: getGradeTextColor(student.overallGrade),
                      fontWeight: 600,
                      minWidth: 50,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" title="View Details" sx={{ color: '#4a6fa5', mr: 1 }}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" title="Edit Grade" sx={{ color: '#4a6fa5' }}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Pagination
          count={4}
          page={currentPage}
          onChange={(event, page) => setCurrentPage(page)}
          sx={{
            '& .MuiPaginationItem-root': {
              '&.Mui-selected': {
                bgcolor: '#4a6fa5',
                color: 'white',
                '&:hover': {
                  bgcolor: '#3a5a80',
                },
              },
            },
          }}
        />
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
        <Typography variant="body2">
          Gradebook Dashboard &copy; 2023 | Last updated: Today at 10:45 AM
        </Typography>
      </Box>
    </Box>
  );
};

export default TeacherGradebookDashboard;