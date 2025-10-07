"use client";

import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Card,
  CardContent,
  Avatar,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Menu } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

const Header = dynamic(() => import('../../components/Header'), { ssr: false });

interface Question {
  id: number;
  text: string;
  points: number;
  subject: string;
  difficulty: string;
  type: string;
}

export default function CreateExam() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width:768px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const [examData, setExamData] = useState({
    title: '',
    subject: '',
    timeLimit: 30,
    totalMarks: 100,
    startDate: '',
    endDate: '',
    description: '',
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: 'What is the capital of France?',
      points: 5,
      subject: 'Geography',
      difficulty: 'Easy',
      type: 'Single Answer',
    },
    {
      id: 2,
      text: 'Solve for x: 2x + 5 = 15',
      points: 10,
      subject: 'Mathematics',
      difficulty: 'Medium',
      type: 'Single Answer',
    },
    {
      id: 3,
      text: 'Which of the following is a chemical element?',
      points: 8,
      subject: 'Science',
      difficulty: 'Easy',
      type: 'Single Answer',
    },
  ]);

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    setExamData(prev => ({
      ...prev,
      startDate: startDate.toISOString().slice(0, 16),
      endDate: endDate.toISOString().slice(0, 16),
    }));
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setExamData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examData.title || !examData.subject || !examData.timeLimit) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Exam created successfully!');
  };

  const handleEditQuestion = (id: number) => {
    // Implement edit functionality
    alert(`Edit question ${id}`);
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleAddQuestion = () => {
    router.push('/admin-pages/Question_Bank');
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
      <Box className="main-content" sx={{ paddingTop: { xs: '50px', md: '80px' } }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Create New Exam" sidebarOpen={sidebarOpen} />

        {/* Exam Form */}
        <Paper
          elevation={1}
          sx={{
            padding: '25px',
            borderRadius: '10px',
            marginBottom: '30px',
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
            Exam Details
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <TextField
                label="Exam Title"
                value={examData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={examData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  required
                >
                  <MenuItem value="">Select a subject</MenuItem>
                  <MenuItem value="math">Mathematics</MenuItem>
                  <MenuItem value="science">Science</MenuItem>
                  <MenuItem value="history">History</MenuItem>
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="geography">Geography</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Time Limit (minutes)"
                type="number"
                value={examData.timeLimit}
                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                required
                fullWidth
              />
              <TextField
                label="Total Marks"
                type="number"
                value={examData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value))}
                required
                fullWidth
              />
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={examData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                value={examData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                value={examData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter exam description and instructions for students"
                sx={{ gridColumn: '1 / -1' }}
                fullWidth
              />
            </Box>
          </Box>
        </Paper>

        {/* Questions Section */}
        <Paper
          elevation={1}
          sx={{
            padding: '25px',
            borderRadius: '10px',
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h6" sx={{ color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
              Exam Questions
            </Typography>
            <Button variant="outlined" startIcon={<Typography>+</Typography>} onClick={handleAddQuestion}>
              Add Question
            </Button>
          </Box>

          <Box sx={{ marginTop: '20px' }}>
            {questions.map((question) => (
              <Card key={question.id} sx={{ marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {question.id}. {question.text}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{question.points} points</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: '15px', marginBottom: '10px', color: '#7f8c8d', fontSize: '14px' }}>
                    <Typography>📚 {question.subject}</Typography>
                    <Typography>📊 {question.difficulty}</Typography>
                    <Typography>✅ {question.type}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: '10px' }}>
                    <IconButton size="small" onClick={() => handleEditQuestion(question.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleRemoveQuestion(question.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ marginTop: '30px', textAlign: 'right', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
            <Button variant="outlined" sx={{ marginRight: '10px' }}>
              Save as Draft
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Publish Exam
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}