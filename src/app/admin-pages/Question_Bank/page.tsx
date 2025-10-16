"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu,
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

const Header = dynamic(() => import('../../components/Header'), { ssr: false });

interface Question {
  id: number;
  question: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created: string;
  usedIn: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1001,
    question: "What is the capital of France?",
    subject: "Geography",
    difficulty: "easy",
    created: "2023-10-15",
    usedIn: "3 exams"
  },
  {
    id: 1002,
    question: "Solve for x: 2x + 5 = 15",
    subject: "Mathematics",
    difficulty: "medium",
    created: "2023-09-22",
    usedIn: "5 exams"
  },
  {
    id: 1003,
    question: "Which of the following is a chemical element?",
    subject: "Science",
    difficulty: "easy",
    created: "2023-11-05",
    usedIn: "2 exams"
  },
  {
    id: 1004,
    question: "Who wrote the Declaration of Independence?",
    subject: "History",
    difficulty: "medium",
    created: "2023-08-17",
    usedIn: "4 exams"
  },
  {
    id: 1005,
    question: "What is the derivative of x²?",
    subject: "Mathematics",
    difficulty: "hard",
    created: "2023-10-28",
    usedIn: "1 exam"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'success';
    case 'medium': return 'warning';
    case 'hard': return 'error';
    default: return 'default';
  }
};

const getSubjectColor = (subject: string) => {
  switch (subject.toLowerCase()) {
    case 'mathematics': return '#e6f4ea';
    case 'science': return '#e8f0fe';
    case 'history': return '#fef7e0';
    case 'geography': return '#f3e5f5';
    case 'english': return '#fce4ec';
    default: return '#f5f5f5';
  }
};

const getSubjectTextColor = (subject: string) => {
  switch (subject.toLowerCase()) {
    case 'mathematics': return '#137333';
    case 'science': return '#1a73e8';
    case 'history': return '#e37400';
    case 'geography': return '#7b1fa2';
    case 'english': return '#c2185b';
    default: return '#333';
  }
};

export default function QuestionBankPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width:769px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const [subjectFilter, setSubjectFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const handleApplyFilters = () => {
    // In a real application, this would filter the questions
    console.log('Applying filters:', { subjectFilter, difficultyFilter, searchFilter });
  };

  const handleResetFilters = () => {
    setSubjectFilter('');
    setDifficultyFilter('');
    setSearchFilter('');
  };

  const handleAddQuestion = () => {
    // Navigate back to Create Exam page
    router.push('/admin-pages/Create_Exam');
  };

  const handleEditQuestion = (id: number) => {
    console.log('Edit question:', id);
  };

  const handleDeleteQuestion = (id: number) => {
    console.log('Delete question:', id);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
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
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Question Bank" sidebarOpen={sidebarOpen} />

        {/* Filters Section */}
        <Paper
          elevation={1}
          sx={{
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '25px',
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '15px', color: '#2c3e50' }}>
            Filter Questions
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              margin: '0 -10px',
            }}
          >
            <Box sx={{ flex: '1', minWidth: '200px', margin: '0 10px 15px' }}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subjectFilter}
                  label="Subject"
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  <MenuItem value="mathematics">Mathematics</MenuItem>
                  <MenuItem value="science">Science</MenuItem>
                  <MenuItem value="history">History</MenuItem>
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="geography">Geography</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1', minWidth: '200px', margin: '0 10px 15px' }}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficultyFilter}
                  label="Difficulty"
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1', minWidth: '200px', margin: '0 10px 15px' }}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search questions..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
          </Box>
        </Paper>

        {/* Questions Table */}
        <Paper
          elevation={1}
          sx={{
            padding: '25px',
            borderRadius: '10px',
            backgroundColor: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Typography variant="h6" sx={{ color: '#2c3e50' }}>
              All Questions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                '&:hover': { opacity: 0.9 }
              }}
              onClick={handleAddQuestion}
            >
              Add Question
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>Question</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>Difficulty</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>Used In</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleQuestions.map((question) => (
                  <TableRow key={question.id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                    <TableCell>{question.id}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {question.question}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={question.subject}
                        sx={{
                          backgroundColor: getSubjectColor(question.subject),
                          color: getSubjectTextColor(question.subject),
                          fontWeight: '600',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        color={getDifficultyColor(question.difficulty) as 'success' | 'warning' | 'error' | 'default'}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{question.created}</TableCell>
                    <TableCell>{question.usedIn}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: '10px' }}>
                        <IconButton
                          size="small"
                          sx={{ color: '#2575fc' }}
                          onClick={() => handleEditQuestion(question.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: '#f44336' }}
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
            <Pagination
              count={5}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              sx={{
                '& .MuiPaginationItem-root': {
                  '&:hover': {
                    backgroundColor: '#f0f5ff',
                    borderColor: '#2575fc',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#2575fc',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#2575fc',
                    },
                  },
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}