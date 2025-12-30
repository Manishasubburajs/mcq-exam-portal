"use client"
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
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Pagination,
   Stack,
   useMediaQuery,
   Radio,
   RadioGroup,
   FormControlLabel,
   FormLabel,
   FormGroup,
   Checkbox,
   Slider,
   Alert,
   CircularProgress,
   Card,
   CardContent,
   Divider,
   Switch,
   InputAdornment,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Edit,
  Visibility,
  Delete,
  BarChart,
  Search,
  Add,
  PlayArrow,
  Assessment,
  LiveTv,
  Timer,
  Assignment,
  Group,
  Settings,
  CalendarToday,
  People,
  AccessTime,
} from '@mui/icons-material';

import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

const Header = dynamic(() => import('../../components/Header'), { ssr: false });

interface Exam {
  id: number;
  exam_name: string;
  subject_name: string;
  topic_name: string;
  subject_id: number;
  topic_id: number;
  exam_type: 'practice' | 'mock' | 'live';
  status: 'active' | 'draft' | 'completed' | 'inactive';
  questions_count: number;
  duration_minutes: number;
  created_at: string;
  total_participants: number;
}

const ExamManagement: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width:769px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
   
  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
   
  // Modal states
  const [createExamModalOpen, setCreateExamModalOpen] = useState(false);
  const [examTypeSelection, setExamTypeSelection] = useState<'select' | 'practice' | 'mock' | 'live' | ''>('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states for different exam types
  const [practiceExamForm, setPracticeExamForm] = useState({
    examName: '',
    subjectId: 0,
    topicId: 0,
    timePerQuestion: 2,
    randomizeQuestions: true,
    showResults: true,
    allowReview: true,
  });

  const [mockExamForm, setMockExamForm] = useState({
    examName: '',
    subjectId: 0,
    topicId: 0,
    totalDuration: 60,
    questionCount: 20,
    negativeMarking: false,
    passPercentage: 50,
    startDate: '',
    endDate: '',
    proctoring: false,
    randomizeQuestions: false,
  });

  const [liveExamForm, setLiveExamForm] = useState({
    examName: '',
    subjectId: 0,
    topicId: 0,
    startDateTime: '',
    duration: 90,
    participantCapacity: 100,
    registrationDeadline: '',
    proctoringEnabled: true,
    autoSubmit: true,
    allowCamera: true,
    requireID: true,
  });

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Fetch subjects and topics
  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (Array.isArray(data)) setSubjects(data);
      else if (Array.isArray(data.data)) setSubjects(data.data);
      else setSubjects([]);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const fetchTopicsForSubject = async (subjectId: number) => {
    if (!subjectId) {
      setTopics([]);
      return;
    }

    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      const subjectsData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      const subject = subjectsData.find((s: any) => s.subject_id === subjectId);
      
      if (subject && subject.topics) {
        setTopics(subject.topics);
      } else {
        setTopics([]);
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
      setTopics([]);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setAllExams(data);
      setFilteredExams(data);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setAllExams([]);
      setFilteredExams([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
    fetchExams();
  }, []);

  // Filter exams based on subject and topic
  useEffect(() => {
    let filtered = allExams;

    // Filter by subject
    if (selectedSubjectId) {
      filtered = filtered.filter(exam => exam.subject_id === selectedSubjectId);
    }

    // Filter by topic
    if (selectedTopicId) {
      filtered = filtered.filter(exam => exam.topic_id === selectedTopicId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExams(filtered);
    setCurrentPage(1);
  }, [allExams, selectedSubjectId, selectedTopicId, searchTerm]);

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

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'practice':
        return 'primary';
      case 'mock':
        return 'secondary';
      case 'live':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSearch = () => {
    // Search is automatically handled by useEffect
  };

  const handleReset = () => {
    setSelectedSubjectId(0);
    setSelectedTopicId(0);
    setSearchTerm('');
    setTopics([]);
  };

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(0);
    fetchTopicsForSubject(subjectId);
  };

  const handleCreateExam = () => {
    setExamTypeSelection('select');
    setCreateExamModalOpen(true);
  };

  const handleExamTypeSelect = (type: 'practice' | 'mock' | 'live') => {
    setExamTypeSelection(type);
  };

  const handleCloseCreateModal = () => {
    setCreateExamModalOpen(false);
    setExamTypeSelection('');
    // Reset all forms
    setPracticeExamForm({
      examName: '',
      subjectId: 0,
      topicId: 0,
      timePerQuestion: 2,
      randomizeQuestions: true,
      showResults: true,
      allowReview: true,
    });
    setMockExamForm({
      examName: '',
      subjectId: 0,
      topicId: 0,
      totalDuration: 60,
      questionCount: 20,
      negativeMarking: false,
      passPercentage: 50,
      startDate: '',
      endDate: '',
      proctoring: false,
      randomizeQuestions: false,
    });
    setLiveExamForm({
      examName: '',
      subjectId: 0,
      topicId: 0,
      startDateTime: '',
      duration: 90,
      participantCapacity: 100,
      registrationDeadline: '',
      proctoringEnabled: true,
      autoSubmit: true,
      allowCamera: true,
      requireID: true,
    });
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
    alert(`Viewing exam: ${exam.exam_name}`);
  };

  const handleResultsClick = (exam: Exam) => {
    alert(`Viewing results for: ${exam.exam_name}`);
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

  const handleSubmitPracticeExam = () => {
    if (!practiceExamForm.examName || !practiceExamForm.subjectId) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Practice exam created successfully!');
    handleCloseCreateModal();
  };

  const handleSubmitMockExam = () => {
    if (!mockExamForm.examName || !mockExamForm.subjectId || !mockExamForm.startDate) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Mock exam created successfully!');
    handleCloseCreateModal();
  };

  const handleSubmitLiveExam = () => {
    if (!liveExamForm.examName || !liveExamForm.subjectId || !liveExamForm.startDateTime) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Live exam created successfully!');
    handleCloseCreateModal();
  };

  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <Box className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} sx={{
        ml: sidebarOpen && isDesktop ? '220px' : 0,
        transition: 'margin-left 0.3s ease',
        paddingTop: { xs: '50px', md: '80px' }
      }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Exam Management" sidebarOpen={sidebarOpen} />

        {/* Search and Filter Section */}
        <Paper elevation={1} sx={{ padding: '20px', marginBottom: '25px', borderRadius: '10px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Search & Filter Exams
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateExam}
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              Create New Exam
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            <Grid  size={{ xs:12, md:4}}>
              <TextField
                fullWidth
                label="Search Exams"
                placeholder="Search by exam name, subject, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid  size={{xs:12 , md:4 }} >
              <FormControl fullWidth>
                <InputLabel>Select Subject</InputLabel>
                <Select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(Number(e.target.value))}
                  label="Select Subject"
                >
                  <MenuItem value={0}>All Subjects</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs:12, md:4 }}>
              <FormControl fullWidth>
                <InputLabel>Select Topic</InputLabel>
                <Select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                  label="Select Topic"
                  disabled={!selectedSubjectId}
                >
                  <MenuItem value={0}>All Topics</MenuItem>
                  {topics.map((topic) => (
                    <MenuItem key={topic.topic_id} value={topic.topic_id}>
                      {topic.topic_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              Search
            </Button>
          </Box>
        </Paper>

        {/* Exams Table */}
        <Paper elevation={1} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{ padding: '20px', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Exams ({filteredExams.length})
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Exam Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subject/Topic</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Questions</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Participants</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedExams.length > 0 ? (
                      paginatedExams.map((exam) => (
                        <TableRow key={exam.id} hover>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {exam.exam_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{exam.subject_name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {exam.topic_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={exam.exam_type.charAt(0).toUpperCase() + exam.exam_type.slice(1)}
                              color={getExamTypeColor(exam.exam_type)}
                              size="small"
                              icon={
                                exam.exam_type === 'practice' ? <PlayArrow /> :
                                exam.exam_type === 'mock' ? <Assessment /> : <LiveTv />
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                              color={getStatusColor(exam.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{exam.questions_count}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Timer sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{exam.duration_minutes} min</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <People sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{exam.total_participants || 0}</Typography>
                            </Box>
                          </TableCell>
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                          <Typography variant="body1" color="text.secondary">
                            No exams found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredExams.length > itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Pagination
                    count={Math.ceil(filteredExams.length / itemsPerPage)}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* Create Exam Modal */}
        <Dialog open={createExamModalOpen} onClose={handleCloseCreateModal} maxWidth="lg" fullWidth>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogContent dividers sx={{ minHeight: '500px' }}>
            {examTypeSelection === 'select' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  What kind of exam do you want to create?
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={examTypeSelection || ''}
                    onChange={(e) => handleExamTypeSelect(e.target.value as 'practice' | 'mock' | 'live')}
                  >
                    <FormControlLabel 
                      value="practice" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <PlayArrow color="primary" />
                          <Box>
                            <Typography variant="subtitle1">Practice Exam</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Self-paced learning with instant feedback and explanations
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="mock" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Assessment color="secondary" />
                          <Box>
                            <Typography variant="subtitle1">Mock Exam</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Simulated exam environment with time limits and scoring
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="live" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LiveTv color="error" />
                          <Box>
                            <Typography variant="subtitle1">Live Exam</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Real-time proctored examination with scheduled sessions
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {/* Practice Exam Form */}
            {examTypeSelection === 'practice' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Practice Exam Setup</Typography>
                
                <Grid container spacing={2}>
                  <Grid size = {{xs:12}} >
                    <TextField
                      fullWidth
                      label="Exam Name *"
                      value={practiceExamForm.examName}
                      onChange={(e) => setPracticeExamForm({...practiceExamForm, examName: e.target.value})}
                      required
                    />
                  </Grid>
                  
                  <Grid size= {{xs:12 ,md:6}} >
                    <FormControl fullWidth>
                      <InputLabel>Subject *</InputLabel>
                      <Select
                        value={practiceExamForm.subjectId}
                        onChange={(e) => setPracticeExamForm({...practiceExamForm, subjectId: Number(e.target.value)})}
                        label="Subject *"
                        required
                      >
                        <MenuItem value={0}>Select Subject</MenuItem>
                        {subjects.map((subject) => (
                          <MenuItem key={subject.subject_id} value={subject.subject_id}>
                            {subject.subject_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}} >
                    <FormControl fullWidth disabled={!practiceExamForm.subjectId}>
                      <InputLabel>Topic</InputLabel>
                      <Select
                        value={practiceExamForm.topicId}
                        onChange={(e) => setPracticeExamForm({...practiceExamForm, topicId: Number(e.target.value)})}
                        label="Topic"
                      >
                        <MenuItem value={0}>All Topics</MenuItem>
                        {topics.map((topic) => (
                          <MenuItem key={topic.topic_id} value={topic.topic_id}>
                            {topic.topic_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <Typography gutterBottom>Time per Question (minutes)</Typography>
                    <Slider
                      value={practiceExamForm.timePerQuestion}
                      onChange={(e, value) => setPracticeExamForm({...practiceExamForm, timePerQuestion: value as number})}
                      min={0.5}
                      max={10}
                      step={0.5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  
                  <Grid size={{xs:12}}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={practiceExamForm.randomizeQuestions}
                            onChange={(e) => setPracticeExamForm({...practiceExamForm, randomizeQuestions: e.target.checked})}
                          />
                        }
                        label="Randomize Question Order"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={practiceExamForm.showResults}
                            onChange={(e) => setPracticeExamForm({...practiceExamForm, showResults: e.target.checked})}
                          />
                        }
                        label="Show Results Immediately"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={practiceExamForm.allowReview}
                            onChange={(e) => setPracticeExamForm({...practiceExamForm, allowReview: e.target.checked})}
                          />
                        }
                        label="Allow Answer Review"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Mock Exam Form */}
            {examTypeSelection === 'mock' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Mock Exam Setup</Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth
                      label="Exam Name *"
                      value={mockExamForm.examName}
                      onChange={(e) => setMockExamForm({...mockExamForm, examName: e.target.value})}
                      required
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Subject *</InputLabel>
                      <Select
                        value={mockExamForm.subjectId}
                        onChange={(e) => setMockExamForm({...mockExamForm, subjectId: Number(e.target.value)})}
                        label="Subject *"
                        required
                      >
                        <MenuItem value={0}>Select Subject</MenuItem>
                        {subjects.map((subject) => (
                          <MenuItem key={subject.subject_id} value={subject.subject_id}>
                            {subject.subject_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <FormControl fullWidth disabled={!mockExamForm.subjectId}>
                      <InputLabel>Topic</InputLabel>
                      <Select
                        value={mockExamForm.topicId}
                        onChange={(e) => setMockExamForm({...mockExamForm, topicId: Number(e.target.value)})}
                        label="Topic"
                      >
                        <MenuItem value={0}>All Topics</MenuItem>
                        {topics.map((topic) => (
                          <MenuItem key={topic.topic_id} value={topic.topic_id}>
                            {topic.topic_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Total Duration (minutes) *"
                      type="number"
                      value={mockExamForm.totalDuration}
                      onChange={(e) => setMockExamForm({...mockExamForm, totalDuration: Number(e.target.value)})}
                      inputProps={{ min: 1 }}
                      required
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Number of Questions"
                      type="number"
                      value={mockExamForm.questionCount}
                      onChange={(e) => setMockExamForm({...mockExamForm, questionCount: Number(e.target.value)})}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Start Date & Time *"
                      type="datetime-local"
                      value={mockExamForm.startDate}
                      onChange={(e) => setMockExamForm({...mockExamForm, startDate: e.target.value})}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="End Date & Time *"
                      type="datetime-local"
                      value={mockExamForm.endDate}
                      onChange={(e) => setMockExamForm({...mockExamForm, endDate: e.target.value})}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Pass Percentage"
                      type="number"
                      value={mockExamForm.passPercentage}
                      onChange={(e) => setMockExamForm({...mockExamForm, passPercentage: Number(e.target.value)})}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  
                  <Grid size={{xs:12}}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={mockExamForm.negativeMarking}
                            onChange={(e) => setMockExamForm({...mockExamForm, negativeMarking: e.target.checked})}
                          />
                        }
                        label="Enable Negative Marking"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={mockExamForm.proctoring}
                            onChange={(e) => setMockExamForm({...mockExamForm, proctoring: e.target.checked})}
                          />
                        }
                        label="Enable Proctoring"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={mockExamForm.randomizeQuestions}
                            onChange={(e) => setMockExamForm({...mockExamForm, randomizeQuestions: e.target.checked})}
                          />
                        }
                        label="Randomize Questions"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Live Exam Form */}
            {examTypeSelection === 'live' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Live Exam Setup</Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth
                      label="Exam Name *"
                      value={liveExamForm.examName}
                      onChange={(e) => setLiveExamForm({...liveExamForm, examName: e.target.value})}
                      required
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Subject *</InputLabel>
                      <Select
                        value={liveExamForm.subjectId}
                        onChange={(e) => setLiveExamForm({...liveExamForm, subjectId: Number(e.target.value)})}
                        label="Subject *"
                        required
                      >
                        <MenuItem value={0}>Select Subject</MenuItem>
                        {subjects.map((subject) => (
                          <MenuItem key={subject.subject_id} value={subject.subject_id}>
                            {subject.subject_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <FormControl fullWidth disabled={!liveExamForm.subjectId}>
                      <InputLabel>Topic</InputLabel>
                      <Select
                        value={liveExamForm.topicId}
                        onChange={(e) => setLiveExamForm({...liveExamForm, topicId: Number(e.target.value)})}
                        label="Topic"
                      >
                        <MenuItem value={0}>All Topics</MenuItem>
                        {topics.map((topic) => (
                          <MenuItem key={topic.topic_id} value={topic.topic_id}>
                            {topic.topic_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Start Date & Time *"
                      type="datetime-local"
                      value={liveExamForm.startDateTime}
                      onChange={(e) => setLiveExamForm({...liveExamForm, startDateTime: e.target.value})}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Registration Deadline"
                      type="datetime-local"
                      value={liveExamForm.registrationDeadline}
                      onChange={(e) => setLiveExamForm({...liveExamForm, registrationDeadline: e.target.value})}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Duration (minutes)"
                      type="number"
                      value={liveExamForm.duration}
                      onChange={(e) => setLiveExamForm({...liveExamForm, duration: Number(e.target.value)})}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid size={{xs:12 , md:6}}>
                    <TextField
                      fullWidth
                      label="Participant Capacity"
                      type="number"
                      value={liveExamForm.participantCapacity}
                      onChange={(e) => setLiveExamForm({...liveExamForm, participantCapacity: Number(e.target.value)})}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid size={{xs:12}}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={liveExamForm.proctoringEnabled}
                            onChange={(e) => setLiveExamForm({...liveExamForm, proctoringEnabled: e.target.checked})}
                          />
                        }
                        label="Enable Proctoring"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={liveExamForm.autoSubmit}
                            onChange={(e) => setLiveExamForm({...liveExamForm, autoSubmit: e.target.checked})}
                          />
                        }
                        label="Auto-submit on Time End"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={liveExamForm.allowCamera}
                            onChange={(e) => setLiveExamForm({...liveExamForm, allowCamera: e.target.checked})}
                          />
                        }
                        label="Require Camera Access"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={liveExamForm.requireID}
                            onChange={(e) => setLiveExamForm({...liveExamForm, requireID: e.target.checked})}
                          />
                        }
                        label="Require ID Verification"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseCreateModal}>Cancel</Button>
            
            {examTypeSelection === 'select' && (
              <Button 
                variant="contained" 
                disabled={!examTypeSelection || examTypeSelection === 'select'}
              >
                Continue
              </Button>
            )}
            
            {examTypeSelection === 'practice' && (
              <Button 
                variant="contained" 
                onClick={handleSubmitPracticeExam}
                sx={{
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Create Practice Exam
              </Button>
            )}
            
            {examTypeSelection === 'mock' && (
              <Button 
                variant="contained" 
                onClick={handleSubmitMockExam}
                sx={{
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Create Mock Exam
              </Button>
            )}
            
            {examTypeSelection === 'live' && (
              <Button 
                variant="contained" 
                onClick={handleSubmitLiveExam}
                sx={{
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Create Live Exam
              </Button>
            )}
            
            {examTypeSelection !== 'select' && examTypeSelection !== '' && (
              <Button 
                variant="outlined" 
                onClick={() => setExamTypeSelection('select')}
              >
                Back
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Edit Exam Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Exam Name"
                    defaultValue={selectedExam?.exam_name}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select defaultValue={selectedExam?.subject_name} label="Subject" required>
                      {subjects.map((subject) => (
                        <MenuItem key={subject.subject_id} value={subject.subject_name}>
                          {subject.subject_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    defaultValue={selectedExam?.duration_minutes}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the exam "{selectedExam?.exam_name}"? This action cannot be undone.
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