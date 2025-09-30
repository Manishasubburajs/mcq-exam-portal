"use client"
import React, { useState } from 'react';
import {
  Box,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Delete,
  BarChart,
  Add,
  Search,
  FilterList,
} from '@mui/icons-material';

import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

interface Exam {
  id: number;
  name: string;
  subject: string;
  status: 'active' | 'draft' | 'completed' | 'inactive';
  questions: number;
  duration: string;
  created: string;
  participants: number | string;
  section?: string;
}

const ExamManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [exams, setExams] = useState<Exam[]>([
    {
      id: 1,
      name: 'Mathematics Midterm',
      subject: 'Mathematics',
      status: 'active',
      questions: 30,
      duration: '45 min',
      created: 'Oct 10, 2023',
      participants: 125,
      section: 'Grade 10 - Section A',
    },
    {
      id: 2,
      name: 'Science Quiz',
      subject: 'Science',
      status: 'active',
      questions: 20,
      duration: '30 min',
      created: 'Oct 15, 2023',
      participants: 89,
      section: 'Grade 9 - All Sections',
    },
    {
      id: 3,
      name: 'History Final Exam',
      subject: 'History',
      status: 'draft',
      questions: 40,
      duration: '60 min',
      created: 'Oct 18, 2023',
      participants: '-',
      section: 'Grade 11 - Section B',
    },
    {
      id: 4,
      name: 'Algebra Basics',
      subject: 'Mathematics',
      status: 'completed',
      questions: 25,
      duration: '35 min',
      created: 'Sep 28, 2023',
      participants: 142,
      section: 'Grade 8 - Section C',
    },
    {
      id: 5,
      name: 'Physics Test',
      subject: 'Science',
      status: 'inactive',
      questions: 35,
      duration: '50 min',
      created: 'Sep 15, 2023',
      participants: 78,
      section: 'Grade 12 - All Sections',
    },
  ]);

  const subjects = ['Mathematics', 'Science', 'History', 'English', 'Geography'];
  const statuses = ['active', 'draft', 'completed', 'inactive'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'completed':
        return 'info';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleEditClick = (exam: Exam) => {
    setSelectedExam(exam);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (exam: Exam) => {
    setSelectedExam(exam);
    setDeleteModalOpen(true);
  };

  const handleViewClick = (exam: Exam) => {
    alert(`Viewing exam: ${exam.name}`);
  };

  const handleResultsClick = (exam: Exam) => {
    alert(`Viewing results for: ${exam.name}`);
  };

  const handleCreateExam = () => {
    alert('Redirecting to create exam page...');
  };

  const handleApplyFilters = () => {
    alert(`Applying filters: Search="${searchTerm}", Subject="${subjectFilter}", Status="${statusFilter}"`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSubjectFilter('');
    setStatusFilter('');
  };

  const handleEditSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Exam details updated successfully');
    setEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    alert('Exam deleted successfully');
    setDeleteModalOpen(false);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === '' || exam.subject === subjectFilter;
    const matchesStatus = statusFilter === '' || exam.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Sidebar activeItem="Exam Management" />
      <Box sx={{ flex: 1, padding: '30px' }}>
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
          <Typography variant="h4" sx={{ color: 'text.primary' }}>
            Exam Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateExam}
          >
            Create New Exam
          </Button>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ padding: '20px', marginBottom: '25px', borderRadius: '10px' }}>
          <Typography variant="h6" sx={{ marginBottom: '15px', color: 'text.primary' }}>
            Filter Exams
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search exams by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subjectFilter}
                  label="Subject"
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '15px' }}>
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button variant="contained" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </Box>
        </Paper>

        {/* Exams Table */}
        <Paper elevation={1} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{ padding: '20px', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              All Exams
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Exam Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Questions</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Participants</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {exam.name}
                        </Typography>
                        {exam.section && (
                          <Typography variant="body2" color="text.secondary">
                            {exam.section}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>
                      <Chip
                        label={exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        color={getStatusColor(exam.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{exam.questions}</TableCell>
                    <TableCell>{exam.duration}</TableCell>
                    <TableCell>{exam.created}</TableCell>
                    <TableCell>{exam.participants}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(exam)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleViewClick(exam)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(exam)}
                        >
                          <Delete />
                        </IconButton>
                        {(exam.status === 'completed' || exam.status === 'inactive') && (
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleResultsClick(exam)}
                          >
                            <BarChart />
                          </IconButton>
                        )}
                      </Stack>
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

        {/* Edit Exam Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Exam Title"
                    defaultValue={selectedExam?.name}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select defaultValue={selectedExam?.subject} label="Subject" required>
                      {subjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select defaultValue={selectedExam?.status} label="Status" required>
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Time Limit (minutes)"
                    type="number"
                    defaultValue={selectedExam?.duration.replace(' min', '')}
                    inputProps={{ min: 5 }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Total Questions"
                    type="number"
                    defaultValue={selectedExam?.questions}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the exam "{selectedExam?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete Exam
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ExamManagement;