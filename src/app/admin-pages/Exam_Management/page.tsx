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
  Tooltip,
  Snackbar,
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
import ExamDetailsModal from "../../components/ExamDetailsModal";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AssignExamModal from "../../components/AssignExamModal";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

interface ExamSubject {
  subject_id: number;
  subject_name: string;
  topic_id: number;
  topic_name: string | null;
  question_count: number;
}

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
  // 🔒 permission flags
  canEdit?: boolean;
  canDelete?: boolean;
  subjects: ExamSubject[];
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedExamForView, setSelectedExamForView] = useState<any>(null);
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
    if (selectedSubjectId && selectedSubjectId !== 0) {
      filtered = filtered.filter((exam) =>
        exam.subjects.some((sub) => sub.subject_id === selectedSubjectId),
      );
    }

    // Filter by topic
    if (selectedTopicId && selectedTopicId !== 0) {
      filtered = filtered.filter((exam) =>
        exam.subjects.some((sub) => sub.topic_id === selectedTopicId),
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.subjects.some((sub) =>
            sub.subject_name.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          exam.subjects.some((sub) =>
            sub.topic_name?.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    setFilteredExams(filtered);
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

  const handleReset = () => {
    setSelectedSubjectId(0);
    setSelectedTopicId(0);
    setSearchTerm("");
    setTopics([]);
    setCurrentPage(1);
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
    setEditModalOpen(true);
  };

  const handleDeleteClick = (exam: Exam) => {
    setSelectedExam(exam);
    setDeleteModalOpen(true);
  };

  const handleViewClick = async (exam: Exam) => {
    try {
      const res = await fetch(`/api/exams/${exam.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedExamForView(data);
        setViewModalOpen(true);
      } else {
        alert(data.message || "Failed to fetch exam details");
      }
    } catch (err) {
      console.error("Error fetching exam details:", err);
      alert("Error fetching exam details");
    }
  };

  const handleResultsClick = (exam: Exam) => {
    alert(`Viewing results for: ${exam.exam_name}`);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExam) return;

    try {
      const res = await fetch(`/api/exams/${selectedExam.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSnackbar({
          open: true,
          message: "Exam deleted successfully",
          severity: "success",
        });
        fetchExams(); // refresh list
        setDeleteModalOpen(false);
        setSelectedExam(null);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error deleting exam",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error deleting exam:", err);
      setSnackbar({
        open: true,
        message: "Error deleting exam",
        severity: "error",
      });
    }
  };

  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleAssignmentUpdate = (examId: number, assignedCount: number) => {
    setAllExams((prev) =>
      prev.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              canEdit: assignedCount === 0,
              canDelete: assignedCount === 0,
            }
          : exam,
      ),
    );
  };

  // ✅ Reset to page 1 only when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubjectId, selectedTopicId, searchTerm]);

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
              disabled={loading}
            >
              Create New Exam
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Search Exams"
                placeholder="Search by exam title..."
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
            {/* <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Search
            </Button> */}
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
                              {/* Assign */}
                              <Tooltip title="Assign Exam" arrow>
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
                              </Tooltip>

                              {/* Edit */}
                              <Tooltip
                                title={
                                  exam.canEdit
                                    ? "Edit Exam"
                                    : "Cannot edit: exam already assigned to students"
                                }
                                arrow
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    disabled={exam.canEdit === false}
                                    onClick={() => handleEditClick(exam)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              {/* View */}
                              <Tooltip title="View Exam" arrow>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleViewClick(exam)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>

                              {/* Delete */}
                              <Tooltip
                                title={
                                  exam.canDelete
                                    ? "Delete Exam"
                                    : "Cannot delete: exam already assigned to students"
                                }
                                arrow
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={exam.canDelete === false}
                                    onClick={() => handleDeleteClick(exam)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              {/* Results */}
                              {(exam.status === "completed" ||
                                exam.status === "inactive") && (
                                <Tooltip title="View Results" arrow>
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleResultsClick(exam)}
                                  >
                                    <BarChart />
                                  </IconButton>
                                </Tooltip>
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
        />

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModalOpen}
          onClose={(event, reason) => {
            // Prevent closing when clicking outside or pressing Escape
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            setDeleteModalOpen(false);
          }}
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
            onSuccess={handleAssignmentUpdate}
          />
        )}

        {/* {selectedExam && ( */}
          <EditExamModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedExam(null);
            }}
            examData={selectedExam}
            onSuccess={() => {
              fetchExams();
              setEditModalOpen(false);
              setSelectedExam(null);
            }}
          />
        {/* )} */}

        <ExamDetailsModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          exam={selectedExamForView}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ExamManagement;
