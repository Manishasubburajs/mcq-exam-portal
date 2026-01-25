"use client";
import React, { useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  Edit,
  Visibility,
  Delete,
  BarChart,
  Search,
  Add,
  Timer,
  Assignment,
  Group,
  Settings,
  CalendarToday,
  People,
  AccessTime,
  Assessment,
  PlayArrow,
  LiveTv,
} from "@mui/icons-material";

import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";
import CreateExamModal from "../../components/CreateExamModal";
import EditExamModal from "../../components/EditExamModal";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AssignExamModal from "../../components/AssignExamModal";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

interface Exam {
  id: number;
  exam_name: string;
  subject_name: string;
  topic_name: string;
  subject_id: number;
  topic_id: number;
  exam_type: "practice" | "mock" | "live";
  status: "active" | "draft" | "completed" | "inactive";
  questions_count: number;
  duration_minutes: number;
  created_at: string;
  total_participants: number;
}

const ExamManagement: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width:769px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [createExamModalOpen, setCreateExamModalOpen] = useState(false);
  const [examTypeSelection, setExamTypeSelection] = useState<
    "select" | "practice" | "mock" | "live" | ""
  >("");
  const [isEdit, setIsEdit] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignExamId, setAssignExamId] = useState<number | null>(null);

  // Question availability states
  const [questionCounts, setQuestionCounts] = useState<{
    [key: string]: number;
  }>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Form states for different exam types
  const [practiceExamForm, setPracticeExamForm] = useState({
    examName: "",
    subjects: [] as { subjectId: number; questionCount: number }[],
    totalMarks: 0,
    randomizeQuestions: true,
    showResults: true,
    allowReview: true,
  });

  const [mockExamForm, setMockExamForm] = useState({
    examName: "",
    selectedSubjectId: 0,
    topics: [] as { topicId: number; questionCount: number }[],
    totalDuration: 60,
    totalMarks: 0,
    negativeMarking: false,
    passPercentage: 50,
    startDate: "",
    endDate: "",
    proctoring: false,
    randomizeQuestions: false,
  });

  const [liveExamForm, setLiveExamForm] = useState({
    examName: "",
    selectedSubjectId: 0,
    topics: [] as { topicId: number; questionCount: number }[],
    totalDuration: 60,
    totalMarks: 0,
    startDateTime: "",
    participantCapacity: 100,
    registrationDeadline: "",
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
      const subjectsData = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];
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
      if (Array.isArray(data)) {
        setAllExams(data);
        setFilteredExams(data);
      } else {
        setAllExams([]);
        setFilteredExams([]);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      setAllExams([]);
      setFilteredExams([]);
    }
    setLoading(false);
  };

  const fetchQuestionCounts = async () => {
    setLoadingCounts(true);
    try {
      const res = await fetch("/api/questions/counts");
      const data = await res.json();
      setQuestionCounts(data);
    } catch (err) {
      console.error("Error fetching question counts:", err);
      setQuestionCounts({});
    }
    setLoadingCounts(false);
  };

  useEffect(() => {
    fetchSubjects();
    fetchExams();
    fetchQuestionCounts();
  }, []);

  // Filter exams based on subject and topic
  useEffect(() => {
    let filtered = allExams;

    // Filter by subject
    if (selectedSubjectId) {
      filtered = filtered.filter(
        (exam) => exam.subject_id === selectedSubjectId,
      );
    }

    // Filter by topic
    if (selectedTopicId) {
      filtered = filtered.filter((exam) => exam.topic_id === selectedTopicId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.topic_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredExams(filtered);
    setCurrentPage(1);
  }, [allExams, selectedSubjectId, selectedTopicId, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "completed":
        return "info";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "practice":
        return "primary";
      case "mock":
        return "secondary";
      case "live":
        return "error";
      default:
        return "default";
    }
  };

  const handleSearch = () => {
    // Search is automatically handled by useEffect
  };

  const handleReset = () => {
    setSelectedSubjectId(0);
    setSelectedTopicId(0);
    setSearchTerm("");
    setTopics([]);
  };

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(0);
    fetchTopicsForSubject(subjectId);
  };

  const handleCreateExam = () => {
    setExamTypeSelection("select");
    setCreateExamModalOpen(true);
    fetchQuestionCounts();
  };

  const handleCloseCreateModal = () => {
    setCreateExamModalOpen(false);
    setExamTypeSelection("");
    setIsEdit(false);
    setSelectedExam(null);
    // Reset all forms
    setPracticeExamForm({
      examName: "",
      subjects: [],
      totalMarks: 0,
      randomizeQuestions: true,
      showResults: true,
      allowReview: true,
    });
    setMockExamForm({
      examName: "",
      selectedSubjectId: 0,
      topics: [],
      totalDuration: 60,
      totalMarks: 0,
      negativeMarking: false,
      passPercentage: 50,
      startDate: "",
      endDate: "",
      proctoring: false,
      randomizeQuestions: false,
    });
    setLiveExamForm({
      examName: "",
      selectedSubjectId: 0,
      topics: [],
      totalDuration: 60,
      totalMarks: 0,
      startDateTime: "",
      participantCapacity: 100,
      registrationDeadline: "",
      proctoringEnabled: true,
      autoSubmit: true,
      allowCamera: true,
      requireID: true,
    });
  };

  const handleEditClick = (exam: Exam) => {
    setSelectedExam(exam);
    setIsEdit(true);
    setCreateExamModalOpen(true);
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
    alert("Exam details updated successfully");
    setEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExam) return;

    try {
      const res = await fetch("/api/exams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: selectedExam.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Exam deleted successfully");
        fetchExams(); // Refresh the list
        setDeleteModalOpen(false);
        setSelectedExam(null);
      } else {
        alert(data.message || "Error deleting exam");
      }
    } catch (err) {
      console.error("Error deleting exam:", err);
      alert("Error deleting exam");
    }
  };

  const handleSubmitPracticeExam = async () => {
    if (
      !practiceExamForm.examName ||
      practiceExamForm.subjects.length === 0 ||
      practiceExamForm.totalMarks <= 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate question counts
    for (const subj of practiceExamForm.subjects) {
      const available = questionCounts[`subject_${subj.subjectId}`] || 0;
      if (subj.questionCount > available) {
        alert(
          `Not enough questions for subject ${
            subjects.find((s) => s.subject_id === subj.subjectId)?.subject_name
          }. Available: ${available}`,
        );
        return;
      }
    }

    const payload = {
      exam_title: practiceExamForm.examName,
      exam_type: "practice",
      total_marks: practiceExamForm.totalMarks,
      subject_configs: practiceExamForm.subjects.map((s) => ({
        subject_id: s.subjectId,
        question_count: s.questionCount,
      })),
      randomize_questions: practiceExamForm.randomizeQuestions,
      show_results: practiceExamForm.showResults,
      allow_review: practiceExamForm.allowReview,
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Practice exam created successfully!");
        fetchExams();
        handleCloseCreateModal();
      } else {
        alert(data.error || "Error creating exam");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating exam");
    }
  };

  const handleSubmitMockExam = async () => {
    if (
      !mockExamForm.examName ||
      mockExamForm.topics.length === 0 ||
      !mockExamForm.startDate ||
      !mockExamForm.endDate ||
      mockExamForm.totalMarks <= 0 ||
      mockExamForm.totalDuration <= 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate question counts
    for (const topic of mockExamForm.topics) {
      const available = questionCounts[`topic_${topic.topicId}`] || 0;
      if (topic.questionCount > available) {
        alert(
          `Not enough questions for topic ${
            topics.find((t) => t.topic_id === topic.topicId)?.topic_name
          }. Available: ${available}`,
        );
        return;
      }
    }

    const payload = {
      exam_title: mockExamForm.examName,
      exam_type: "mock",
      total_marks: mockExamForm.totalMarks,
      time_limit_minutes: mockExamForm.totalDuration,
      scheduled_start: mockExamForm.startDate,
      scheduled_end: mockExamForm.endDate,
      topic_configs: mockExamForm.topics.map((t) => ({
        topic_id: t.topicId,
        question_count: t.questionCount,
      })),
      negative_marking: mockExamForm.negativeMarking,
      pass_percentage: mockExamForm.passPercentage,
      proctoring: mockExamForm.proctoring,
      randomize_questions: mockExamForm.randomizeQuestions,
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Mock exam created successfully!");
        fetchExams();
        handleCloseCreateModal();
      } else {
        alert(data.error || "Error creating exam");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating exam");
    }
  };

  const handleSubmitLiveExam = async () => {
    if (
      !liveExamForm.examName ||
      liveExamForm.topics.length === 0 ||
      !liveExamForm.startDateTime ||
      liveExamForm.totalMarks <= 0 ||
      liveExamForm.totalDuration <= 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate question counts
    for (const topic of liveExamForm.topics) {
      const available = questionCounts[`topic_${topic.topicId}`] || 0;
      if (topic.questionCount > available) {
        alert(
          `Not enough questions for topic ${
            topics.find((t) => t.topic_id === topic.topicId)?.topic_name
          }. Available: ${available}`,
        );
        return;
      }
    }

    const payload = {
      exam_title: liveExamForm.examName,
      exam_type: "live",
      total_marks: liveExamForm.totalMarks,
      time_limit_minutes: liveExamForm.totalDuration,
      scheduled_start: liveExamForm.startDateTime,
      topic_configs: liveExamForm.topics.map((t) => ({
        topic_id: t.topicId,
        question_count: t.questionCount,
      })),
      participant_capacity: liveExamForm.participantCapacity,
      registration_deadline: liveExamForm.registrationDeadline,
      proctoring_enabled: liveExamForm.proctoringEnabled,
      auto_submit: liveExamForm.autoSubmit,
      allow_camera: liveExamForm.allowCamera,
      require_id: liveExamForm.requireID,
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Live exam created successfully!");
        fetchExams();
        handleCloseCreateModal();
      } else {
        alert(data.error || "Error creating exam");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating exam");
    }
  };

  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "grey.50" }}
    >
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && !isDesktop && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        sx={{
          ml: sidebarOpen && isDesktop ? "220px" : 0,
          transition: "margin-left 0.3s ease",
          paddingTop: { xs: "50px", md: "80px" },
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Exam Management"
          sidebarOpen={sidebarOpen}
        />

        {/* Search and Filter Section */}
        <Paper
          elevation={1}
          sx={{ padding: "20px", marginBottom: "25px", borderRadius: "10px" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Search & Filter Exams
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateExam}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Create New Exam
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Search Exams"
                placeholder="Search by exam name, subject, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Select Subject</InputLabel>
                <Select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(Number(e.target.value))}
                  label="Select Subject"
                >
                  <MenuItem value={0}>All Subjects</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem
                      key={subject.subject_id}
                      value={subject.subject_id}
                    >
                      {subject.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="outlined" color="secondary" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Search
            </Button>
          </Box>
        </Paper>

        {/* Exams Table */}
        <Paper elevation={1} sx={{ borderRadius: "10px", overflow: "hidden" }}>
          <Box
            sx={{
              padding: "20px",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Exams ({filteredExams.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Exam Title
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Duration (mins)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedExams.length > 0 ? (
                      paginatedExams.map((exam) => (
                        <TableRow key={exam.id} hover>
                          <TableCell>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "medium" }}
                            >
                              {exam.exam_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                exam.exam_type.charAt(0).toUpperCase() +
                                exam.exam_type.slice(1)
                              }
                              color={getExamTypeColor(exam.exam_type)}
                              size="small"
                              icon={
                                exam.exam_type === "practice" ? (
                                  <PlayArrow />
                                ) : exam.exam_type === "mock" ? (
                                  <Assessment />
                                ) : (
                                  <LiveTv />
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                exam.status.charAt(0).toUpperCase() +
                                exam.status.slice(1)
                              }
                              color={getStatusColor(exam.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Timer sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                {exam.duration_minutes
                                  ? `${exam.duration_minutes} min`
                                  : "-No Timer-"}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => {
                                  setAssignExamId(exam.id);
                                  setAssignModalOpen(true);
                                }}
                              >
                                <PersonAddAlt1Icon />
                              </IconButton>

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
                              {(exam.status === "completed" ||
                                exam.status === "inactive") && (
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
                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "20px",
                  }}
                >
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

        <CreateExamModal
          open={createExamModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={fetchExams}
          isEdit={isEdit}
          examData={selectedExam}
        />

        {/* Edit Exam Modal */}
        <Dialog
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
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
                    <Select
                      defaultValue={selectedExam?.subject_name}
                      label="Subject"
                      required
                    >
                      {subjects.map((subject) => (
                        <MenuItem
                          key={subject.subject_id}
                          value={subject.subject_name}
                        >
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
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the exam "
              {selectedExam?.exam_name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              Delete Exam
            </Button>
          </DialogActions>
        </Dialog>
        {assignExamId && (
          <AssignExamModal
            open={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            examId={assignExamId}
          />
        )}
      </Box>
    </Box>
  );
};

export default ExamManagement;
