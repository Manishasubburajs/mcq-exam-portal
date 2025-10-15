'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import {
  Publish as PublishIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  FolderOpen as FolderOpenIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface CSVQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  category?: string;
  difficulty?: string;
  points?: string;
}

type UploadStatus = 'ready' | 'processing' | 'error' | 'success';

const BulkImportCSV: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('ready');
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<CSVQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !fileInputRef.current) return;

    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Please select a CSV file.']);
      setUploadStatus('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(['File size must be less than 10MB.']);
      setUploadStatus('error');
      return;
    }

    setUploadStatus('processing');
    setProgress(30);
    setErrors([]);
    setSuccessMessage('');

    try {
      const csvData = await readFileAsText(file);
      const parsedQuestions = parseCSV(csvData);

      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions found in the CSV file.');
      }

      setProgress(60);

      const validationErrors = validateQuestions(parsedQuestions);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setUploadStatus('error');
        setProgress(0);
        return;
      }

      setQuestions(parsedQuestions);
      setUploadStatus('ready');
      setProgress(100);

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error processing file']);
      setUploadStatus('error');
      setProgress(0);
    }
  }, []);

  const readFileAsText = (file: File): Promise<string> => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof FileReader === 'undefined') {
      return Promise.reject(new Error('File reading is not supported in this environment.'));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Error reading the file.'));
      reader.readAsText(file);
    });
  };

  const parseCSV = (csvData: string): CSVQuestion[] => {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const questions: CSVQuestion[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const question: any = {};
      headers.forEach((header, index) => {
        question[header] = values[index]?.trim() || '';
      });

      questions.push(question as CSVQuestion);
    }

    return questions;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const validateQuestions = (questions: CSVQuestion[]): string[] => {
    const errors: string[] = [];

    questions.forEach((q, index) => {
      const row = index + 2;

      if (!q.question || q.question.trim() === '') {
        errors.push(`Row ${row}: Missing question text`);
      }

      if (!q.option_a || q.option_a.trim() === '') {
        errors.push(`Row ${row}: Missing Option A`);
      }

      if (!q.option_b || q.option_b.trim() === '') {
        errors.push(`Row ${row}: Missing Option B`);
      }

      if (!q.correct_answer || !['a', 'b', 'c', 'd'].includes(q.correct_answer.toLowerCase())) {
        errors.push(`Row ${row}: Correct answer must be A, B, C, or D`);
      }

      if (q.difficulty && !['easy', 'medium', 'hard'].includes(q.difficulty.toLowerCase())) {
        errors.push(`Row ${row}: Difficulty must be Easy, Medium, or Hard`);
      }

      if (q.points && (isNaN(Number(q.points)) || Number(q.points) < 1)) {
        errors.push(`Row ${row}: Points must be a positive number`);
      }
    });

    return errors;
  };

  const handleImport = useCallback(() => {
    setUploadStatus('processing');
    setProgress(0);

    // Simulate import process
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setSuccessMessage(
            `Successfully imported ${questions.length} questions${selectedCategory ? ` into the ${selectedCategory} category` : ''}.`
          );
          setUploadStatus('success');
          setQuestions([]);
          if (typeof window !== 'undefined' && fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return 100;
        }
        return newProgress;
      });
    }, 100);
  }, [questions.length, selectedCategory]);

  const handleCancel = useCallback(() => {
    setQuestions([]);
    setErrors([]);
    setSuccessMessage('');
    setUploadStatus('ready');
    setProgress(0);
    if (typeof window !== 'undefined' && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const csvContent = `question,option_a,option_b,option_c,option_d,correct_answer,category,difficulty,points
"What is the derivative of x²?","2x","x","2","x²","A","Calculus","Easy","1"
"Solve for x: 2x + 5 = 15","5","10","7.5","8","A","Algebra","Easy","1"
"What is the value of π (pi) to two decimal places?","3.14","3.41","3.16","3.12","A","Geometry","Easy","1"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'ready': return '#4caf50';
      case 'processing': return '#ff9800';
      case 'error': return '#f44336';
      case 'success': return '#4caf50';
      default: return '#4caf50';
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'ready': return questions.length > 0 ? 'Ready to import' : 'Ready to upload';
      case 'processing': return questions.length > 0 ? 'Importing questions...' : 'Processing file...';
      case 'error': return 'Error in file';
      case 'success': return 'Import completed';
      default: return 'Ready to upload';
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 3 }}>
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
            <PublishIcon
              sx={{
                mr: 2,
                verticalAlign: 'middle',
                fontSize: '2rem',
                color: '#fff',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            />
            Bulk Question Import
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Upload Section */}
        <Box sx={{ flex: '1 1 600px', minWidth: 500 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Import Questions from CSV
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Upload a CSV file to add multiple questions to your question bank at once.
            </Typography>

            {/* Status Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: getStatusColor(),
                }}
              />
              <Typography variant="body2">{getStatusText()}</Typography>
            </Box>

            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 3, height: 8, borderRadius: 1 }}
            />

            {/* Upload Area */}
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragOver ? '#4a69bd' : '#6a89cc',
                bgcolor: isDragOver ? '#eef2ff' : '#f8faff',
                borderRadius: 2,
                mb: 3,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: '#eef2ff',
                },
              }}
              onClick={handleFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: '#6a89cc', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#4a69bd' }}>
                Drop your CSV file here
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                or click to browse your files
              </Typography>
              <Button
                variant="contained"
                startIcon={<FolderOpenIcon />}
                sx={{ bgcolor: '#6a89cc', '&:hover': { bgcolor: '#5a79bc' } }}
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Select CSV file for upload"
                title="Select CSV file for upload"
              />
            </Paper>

            {/* Category Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Assign Category to All Questions</InputLabel>
              <Select
                value={selectedCategory}
                label="Assign Category to All Questions"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">-- Keep original categories --</MenuItem>
                <MenuItem value="Algebra">Algebra</MenuItem>
                <MenuItem value="Geometry">Geometry</MenuItem>
                <MenuItem value="Calculus">Calculus</MenuItem>
                <MenuItem value="Statistics">Statistics</MenuItem>
                <MenuItem value="Trigonometry">Trigonometry</MenuItem>
                <MenuItem value="General Math">General Math</MenuItem>
              </Select>
            </FormControl>

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>Errors Found in Your CSV File</AlertTitle>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                ))}
              </Alert>
            )}

            {/* Success Message */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>Import Successful!</AlertTitle>
                <Typography variant="body2">{successMessage}</Typography>
              </Alert>
            )}

            {/* Preview Section */}
            {questions.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#4a69bd' }}>
                  Preview of Questions to Import
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Option A</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Option B</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Option C</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Option D</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Correct</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Difficulty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.slice(0, 5).map((question, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography variant="body2" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {question.question}
                            </Typography>
                          </TableCell>
                          <TableCell>{question.option_a}</TableCell>
                          <TableCell>{question.option_b}</TableCell>
                          <TableCell>{question.option_c || ''}</TableCell>
                          <TableCell>{question.option_d || ''}</TableCell>
                          <TableCell>
                            <Chip
                              label={question.correct_answer.toUpperCase()}
                              size="small"
                              sx={{ bgcolor: '#4caf50', color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>{question.category || 'General'}</TableCell>
                          <TableCell>
                            {question.difficulty ?
                              question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) :
                              'Medium'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Showing {Math.min(questions.length, 5)} of {questions.length} questions
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PublishIcon />}
                    onClick={handleImport}
                    sx={{ bgcolor: '#6a89cc', '&:hover': { bgcolor: '#5a79bc' } }}
                  >
                    Import Questions
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>

        {/* Instructions Section */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4a69bd', borderBottom: '1px solid #eee', pb: 1 }}>
              CSV Format Instructions
            </Typography>

            <List dense sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ color: '#6a89cc', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Your CSV should have these columns in order:" />
              </ListItem>
            </List>

            <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>question</strong> - The question text
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>option_a, option_b, option_c, option_d</strong> - The answer choices
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>correct_answer</strong> - The correct option (A, B, C, or D)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>category</strong> - Question category (optional)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>difficulty</strong> - Easy, Medium, or Hard (optional)
                </Typography>
                <Typography variant="body2">
                  <strong>points</strong> - Point value (optional, default: 1)
                </Typography>
              </CardContent>
            </Card>

            <List dense sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ color: '#6a89cc', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Include a header row with column names" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ color: '#6a89cc', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Save your file as CSV (Comma Separated Values)" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ color: '#6a89cc', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Maximum file size: 10MB" />
              </ListItem>
            </List>

            <Card sx={{ bgcolor: '#e3e9ff', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Need a template?
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Download our CSV template to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadTemplate}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#3d8b40' } }}
                >
                  Download Template
                </Button>
              </CardContent>
            </Card>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BulkImportCSV;