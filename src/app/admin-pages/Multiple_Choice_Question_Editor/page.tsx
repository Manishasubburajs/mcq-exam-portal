'use client';

import React, { useState } from 'react';
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
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  FormatListNumbered as FormatListNumberedIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  Functions as FunctionsIcon,
  Image as ImageIcon,
  TableChart as TableChartIcon,
  Remove as RemoveIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  title: string;
  text: string;
  options: QuestionOption[];
  explanation: string;
  category: string;
  difficulty: string;
  points: number;
  tags: string[];
}

const MultipleChoiceQuestionEditor: React.FC = () => {
  const [question, setQuestion] = useState<Question>({
    title: 'Quadratic Equations: Solving by Factoring',
    text: 'Solve the following quadratic equation by factoring:\n\n**2x² - 5x - 3 = 0**\n\nSelect the correct solution set from the options below.',
    options: [
      { id: 'a', text: 'x = 3, x = -0.5', isCorrect: true },
      { id: 'b', text: 'x = -3, x = 0.5', isCorrect: false },
      { id: 'c', text: 'x = 1.5, x = -1', isCorrect: false },
      { id: 'd', text: 'No real solutions', isCorrect: false },
    ],
    explanation: 'To solve 2x² - 5x - 3 = 0 by factoring, we look for two numbers that multiply to (2)(-3) = -6 and add to -5. These numbers are -6 and 1. We rewrite the equation as 2x² - 6x + x - 3 = 0, then factor by grouping: 2x(x - 3) + 1(x - 3) = 0, which gives (2x + 1)(x - 3) = 0. Thus, the solutions are x = -1/2 and x = 3.',
    category: 'Algebra',
    difficulty: 'Medium',
    points: 5,
    tags: ['quadratic', 'factoring', 'algebra', 'equation'],
  });

  const [selectedQuestionBank, setSelectedQuestionBank] = useState(0);

  const questionBank = [
    {
      title: 'Quadratic Equations: Solving by Factoring',
      preview: 'Solve for x: 2x² - 5x + 3 = 0',
      subject: 'Algebra',
      points: 5,
      difficulty: 'Medium',
    },
    {
      title: 'Geometry: Pythagorean Theorem',
      preview: 'Calculate the hypotenuse of a right triangle...',
      subject: 'Geometry',
      points: 3,
      difficulty: 'Easy',
    },
    {
      title: 'Calculus: Derivatives',
      preview: 'Find the derivative of f(x) = 3x³ - 2x² + 5x - 7',
      subject: 'Calculus',
      points: 7,
      difficulty: 'Hard',
    },
    {
      title: 'Algebra: Linear Equations',
      preview: 'Solve the system of equations: 2x + 3y = 12, x - y = 1',
      subject: 'Algebra',
      points: 4,
      difficulty: 'Medium',
    },
    {
      title: 'Statistics: Probability',
      preview: 'What is the probability of drawing a red card from a standard deck?',
      subject: 'Statistics',
      points: 2,
      difficulty: 'Easy',
    },
  ];

  const handleOptionChange = (id: string, text: string) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === id ? { ...opt, text } : opt
      ),
    }));
  };

  const handleCorrectOptionChange = (id: string) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.map(opt => ({
        ...opt,
        isCorrect: opt.id === id,
      })),
    }));
  };

  const addOption = () => {
    const newId = String.fromCodePoint(97 + question.options.length);
    setQuestion(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: '', isCorrect: false }],
    }));
  };

  const removeOption = (id: string) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== id),
    }));
  };

  const handlePointsChange = (delta: number) => {
    setQuestion(prev => ({
      ...prev,
      points: Math.max(1, prev.points + delta),
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#e8f5e9';
      case 'medium': return '#fff3e0';
      case 'hard': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#2e7d32';
      case 'medium': return '#ef6c00';
      case 'hard': return '#c62828';
      default: return '#333';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 3 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #6a89cc, #4a69bd)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" fontWeight={600}>
            <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Multiple Choice Question Editor
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card elevation={1} sx={{ flex: '1 1 300px' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#e3e9ff', color: '#4a69bd' }}>
              <FormatListNumberedIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                24 Questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In your question bank
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card elevation={1} sx={{ flex: '1 1 300px' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#e3e9ff', color: '#4a69bd' }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                18 Published
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active in assessments
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card elevation={1} sx={{ flex: '1 1 300px' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#e3e9ff', color: '#4a69bd' }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                6 Drafts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Waiting to be finalized
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Sidebar */}
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <Paper elevation={1} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4a69bd', borderBottom: '1px solid #eee', pb: 1 }}>
              Question Bank
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {questionBank.map((item) => {
                const itemIndex = questionBank.findIndex(q => q.title === item.title);
                return (
                  <Paper
                    key={`question-bank-${item.title.replaceAll(/\s+/g, '-').toLowerCase()}`}
                    elevation={selectedQuestionBank === itemIndex ? 2 : 0}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedQuestionBank === itemIndex ? '1px solid #6a89cc' : '1px solid #eee',
                      bgcolor: selectedQuestionBank === itemIndex ? '#e3e9ff' : 'white',
                      '&:hover': { bgcolor: '#f8faff', borderColor: '#6a89cc' },
                    }}
                    onClick={() => setSelectedQuestionBank(itemIndex)}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.preview}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.subject} • {item.points} points • {item.difficulty}
                  </Typography>
                </Paper>
                );
              })}
            </Stack>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#6a89cc', '&:hover': { bgcolor: '#5a79bc' } }}
            >
              New Question
            </Button>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: '1 1 600px', minWidth: 500 }}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Edit Multiple Choice Question
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Customize your question and options below
            </Typography>

            {/* Question Title */}
            <TextField
              fullWidth
              label="Question Title"
              value={question.title}
              onChange={(e) => setQuestion(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 3 }}
            />

            {/* Question Text with Rich Text Toolbar */}
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Question Text
            </Typography>
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <Box sx={{ p: 1, borderBottom: '1px solid #ddd', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <IconButton size="small" title="Bold">
                  <FormatBoldIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Italic">
                  <FormatItalicIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Underline">
                  <FormatUnderlinedIcon fontSize="small" />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton size="small" title="Insert Math Equation">
                  <FunctionsIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Insert Image">
                  <ImageIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Insert Table">
                  <TableChartIcon fontSize="small" />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={6}
                value={question.text}
                onChange={(e) => setQuestion(prev => ({ ...prev, text: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { border: 'none' } }}
              />
            </Paper>

            {/* Answer Options */}
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Answer Options
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {question.options.map((option, index) => (
                <Paper key={option.id} variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6" sx={{ color: '#4a69bd', minWidth: 30 }}>
                      {String.fromCodePoint(65 + index)}
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={`Option ${String.fromCodePoint(65 + index)}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    />
                    <IconButton
                      onClick={() => handleCorrectOptionChange(option.id)}
                      sx={{ color: option.isCorrect ? '#4CAF50' : '#999' }}
                    >
                      {option.isCorrect ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      {option.isCorrect ? 'Correct' : 'Mark Correct'}
                    </Typography>
                    <IconButton onClick={() => removeOption(option.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addOption}
                sx={{
                  border: '1px dashed #6a89cc',
                  color: '#4a69bd',
                  '&:hover': { bgcolor: '#d5deff' },
                }}
              >
                Add Another Option
              </Button>
            </Stack>

            {/* Explanation */}
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Explanation (Optional)"
              value={question.explanation}
              onChange={(e) => setQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              sx={{ mb: 3 }}
            />

            {/* Category, Difficulty, Points */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={question.category}
                    label="Category"
                    onChange={(e) => setQuestion(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="Algebra">Algebra</MenuItem>
                    <MenuItem value="Geometry">Geometry</MenuItem>
                    <MenuItem value="Calculus">Calculus</MenuItem>
                    <MenuItem value="Statistics">Statistics</MenuItem>
                    <MenuItem value="Trigonometry">Trigonometry</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    value={question.difficulty}
                    label="Difficulty Level"
                    onChange={(e) => setQuestion(prev => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2">Points:</Typography>
                  <IconButton size="small" onClick={() => handlePointsChange(-1)}>
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    type="number"
                    value={question.points}
                    onChange={(e) => setQuestion(prev => ({ ...prev, points: Number.parseInt(e.target.value) || 1 }))}
                    slotProps={{
                      htmlInput: { min: 1, style: { textAlign: 'center' } }
                    }}
                    sx={{ width: 60 }}
                  />
                  <IconButton size="small" onClick={() => handlePointsChange(1)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Tags */}
            <TextField
              fullWidth
              label="Tags"
              placeholder="Add tags separated by commas"
              value={question.tags.join(', ')}
              onChange={(e) => setQuestion(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              sx={{ mb: 3 }}
            />

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="flex-end" sx={{ pt: 2, borderTop: '1px solid #eee' }}>
              <Button variant="outlined" color="secondary" startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<SaveIcon />}>
                Save Draft
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                sx={{
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Save Question
              </Button>
            </Box>

            {/* Preview Section */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#4a69bd' }}>
              Question Preview
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderLeft: '4px solid #6a89cc' }}>
              <Typography variant="h6" gutterBottom>
                {question.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {question.text}
              </Typography>

              <RadioGroup sx={{ mb: 2 }}>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={`${String.fromCodePoint(65 + index)}. ${option.text}`}
                  />
                ))}
              </RadioGroup>

              <Box display="flex" gap={1}>
                <Chip
                  label={`${question.difficulty} Difficulty`}
                  sx={{
                    bgcolor: getDifficultyColor(question.difficulty),
                    color: getDifficultyTextColor(question.difficulty),
                  }}
                />
                <Chip label={`${question.points} points`} variant="outlined" />
              </Box>
            </Paper>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MultipleChoiceQuestionEditor;